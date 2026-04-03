import { NextResponse } from "next/server";
import { graphqlService } from "@/lib/services/graphql-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
    getKolkataDate, 
    TASK_MILESTONES, 
    isWeekend 
} from "@/lib/utils/streak-utils";

/**
 * API for fetching current task streak status for an intern
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intern = await graphqlService.getInternByUserId(session.user.id);
    if (!intern) {
      return NextResponse.json({ error: "Intern profile not found" }, { status: 404 });
    }

    const today = getKolkataDate();
    const hasCompletedToday = intern.last_task_date === today;
    
    // Find next milestone
    const currentStreak = intern.task_streak || 0;
    const nextMilestone = TASK_MILESTONES.find(m => m.days > currentStreak) || null;
    const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

    // Streak at risk: Not completed today and it's a working day
    const streakAtRisk = !hasCompletedToday && !isWeekend(today);

    return NextResponse.json({
      success: true,
      currentStreak,
      longestStreak: intern.longest_task_streak || 0,
      totalPoints: intern.total_points || 0, // Using same total points for both system
      hasCompletedToday,
      streakAtRisk,
      nextMilestone: nextMilestone ? {
        days: nextMilestone.days,
        reward: nextMilestone.points,
        badge: nextMilestone.badge_name
      } : null,
      daysToNext
    });

  } catch (error: any) {
    console.error("[!!!] Task Streak Status API Crash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
