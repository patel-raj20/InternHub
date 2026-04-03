import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { graphqlService } from "@/lib/services/graphql-service";
import { 
  getKolkataDate, 
  calculateTaskStreakUpdate, 
  evaluateTaskRewards 
} from "@/lib/utils/streak-utils";

/**
 * API for marking a task as completed with Gamification logic
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: taskId } = await params;

    if (!session || session.user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = getKolkataDate();
    const now = new Date();

    // 1. Fetch Task (Verification)
    const task = await graphqlService.getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Guard: Prevent duplicate completion
    if (task.status === 'completed') {
      return NextResponse.json({ 
        success: true, 
        alreadyCompleted: true, 
        message: "Task already completed" 
      });
    }

    // 2. Fetch Intern Data
    const intern = await graphqlService.getInternByUserId(session.user.id);
    if (!intern) {
      return NextResponse.json({ error: "Intern profile not found" }, { status: 404 });
    }

    // 3. Logic: Streak Update
    const { newStreak, alreadyCountedToday } = calculateTaskStreakUpdate(
      intern.task_streak || 0,
      intern.last_task_date || null,
      today
    );

    // 4. Logic: Rewards (Points, Badges)
    const { 
      totalPoints, 
      pointsEarned, 
      awardedBadge, 
      isEarly, 
      reasons 
    } = evaluateTaskRewards(
      newStreak,
      intern.total_points || 0,
      now.toISOString(),
      task.deadline,
      alreadyCountedToday,
      task.points_reward || 20
    );

    // 5. Badge Identification
    let badgeObjectId = null;
    if (awardedBadge) {
      const allBadges = await graphqlService.getBadges();
      const badge = allBadges.find((b: any) => b.name === awardedBadge);
      if (badge) {
        badgeObjectId = badge.id;
      }
    }

    // 6. Transactional Batch Update via GraphQL
    // Note: Hasura executes multiple mutations in a single request atomically.
    const internSet: any = {
      task_streak: newStreak,
      total_points: totalPoints,
      last_task_date: today
    };

    // Update longest streak logic
    if (newStreak > (intern.longest_task_streak || 0)) {
      internSet.longest_task_streak = newStreak;
    }

    const variables = {
      taskId,
      taskSet: {
        status: 'completed',
        completed_at: now.toISOString()
      },
      internId: intern.id,
      internSet,
      pointsObject: {
        intern_id: intern.id,
        points: pointsEarned,
        reason: reasons.join(", "),
        reference_id: taskId
      },
      badgeObject: badgeObjectId ? {
        intern_id: intern.id,
        badge_id: badgeObjectId
      } : null
    };

    await graphqlService.batchTaskCompletion(variables);

    return NextResponse.json({
      success: true,
      newStreak,
      pointsEarned,
      isEarly,
      awardedBadge,
      alreadyCountedToday,
      reasons
    });

  } catch (error: any) {
    console.error("[!!!] Task Completion API Crash:", error);
    
    // Handle uniqueness constraint (Retry/Idempotency)
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
       return NextResponse.json({ 
         success: true, 
         alreadyCompleted: true,
         message: "Point or Badge already awarded for this task"
       }, { status: 200 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
