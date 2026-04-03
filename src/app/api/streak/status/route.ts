import { NextResponse } from "next/server";
import { graphqlService } from "@/lib/services/graphql-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getKolkataDate, STREAK_MILESTONES, isWeekend } from "@/lib/utils/streak-utils";

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
    const hasMarkedToday = intern.last_attendance === today;
    
    // Find next milestone
    const currentStreak = intern.streak || 0;
    const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak) || null;
    const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

    // Streak at risk: Not marked today and it's a working day
    const streakAtRisk = !hasMarkedToday && !isWeekend(today);

    return NextResponse.json({
      success: true,
      currentStreak,
      longestStreak: intern.longest_streak || 0,
      totalPoints: intern.total_points || 0,
      hasMarkedToday,
      streakAtRisk,
      nextMilestone: nextMilestone ? {
        days: nextMilestone.days,
        reward: nextMilestone.points,
        badge: nextMilestone.badge_name
      } : null,
      daysToNext,
      longestStreakRange: {
        start: intern.longest_streak_start,
        end: intern.longest_streak_end
      }
    });

  } catch (error: any) {
    console.error("[!!!] Streak Status API Crash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
