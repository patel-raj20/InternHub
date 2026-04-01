import { NextResponse } from "next/server";
import { graphqlService } from "@/lib/services/graphql-service";
import { calculateDistance } from "@/lib/utils/geo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getKolkataDate, calculateStreakUpdate, evaluateRewards } from "@/lib/utils/streak-utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "INTERN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { qr_token, lat, lng } = body;
    const today = getKolkataDate();

    // 1. Validate QR Token
    if (!qr_token || (!qr_token.startsWith("ATT|") && !qr_token.startsWith("ATT:"))) {
      return NextResponse.json({ error: "Invalid QR Code" }, { status: 400 });
    }

    const parts = qr_token.includes("|") ? qr_token.split("|") : qr_token.split(":");
    const deptId = parts[1];
    const qrDate = parts[2];

    if (qrDate !== today) {
      return NextResponse.json({ error: "QR Code has expired" }, { status: 400 });
    }

    // 2. Fetch Intern Data (with streak info)
    const intern = await graphqlService.getInternByUserId(session.user.id);
    if (!intern || intern.user?.department_id !== deptId) {
      return NextResponse.json({ error: "Invalid intern or department" }, { status: 404 });
    }

    const settings = await graphqlService.getAttendanceSettings(deptId);
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 400 });
    }

    // 3. Distance Check
    const distance = calculateDistance(lat, lng, settings.office_lat, settings.office_lng);
    if (distance > settings.allowed_radius_meters) {
      return NextResponse.json({ error: "Too far from office" }, { status: 400 });
    }

    // 4. Status Check
    const now = new Date();
    const [startH, startM] = settings.work_start_time.split(":").map(Number);
    const workStartTime = new Date();
    workStartTime.setHours(startH, startM, 0, 0);
    const lateLimit = new Date(workStartTime.getTime() + settings.late_threshold_minutes * 60000);
    const status = now > lateLimit ? 'LATE' : 'PRESENT';

    // 5. Streak & Rewards Logic
    const { newStreak, alreadyMarked } = calculateStreakUpdate(
      intern.streak || 0,
      intern.last_attendance || null,
      today
    );

    if (alreadyMarked) {
      return NextResponse.json({ 
        success: true, 
        alreadyMarked: true, 
        message: "Attendance already marked for today" 
      });
    }

    const { totalPoints, pointsEarned, awardedBadge } = evaluateRewards(
      newStreak,
      intern.total_points || 0
    );

    // 6. Badge Handling
    let badgeObjectId = null;
    if (awardedBadge) {
      const allBadges = await graphqlService.getBadges();
      const badge = allBadges.find((b: any) => b.name === awardedBadge);
      if (badge) {
        badgeObjectId = badge.id;
      }
    }

    // 7. Transactional Update
    const internSet: any = {
      streak: newStreak,
      total_points: totalPoints,
      last_attendance: today
    };

    // Tracking current streak start
    const streakStart = newStreak === 1 ? today : (intern.current_streak_start || today);
    internSet.current_streak_start = streakStart;

    // Tracking longest streak range
    if (newStreak > (intern.longest_streak || 0)) {
       internSet.longest_streak = newStreak;
       internSet.longest_streak_start = streakStart;
       internSet.longest_streak_end = today;
    } else if (newStreak === (intern.longest_streak || 0)) {
       // Optional: Update end if it matches current longest (to reflect current ongoing best)
       internSet.longest_streak_end = today;
    }

    await graphqlService.batchAttendanceUpdate({
      internId: intern.id,
      internSet,
      attendanceObject: {
        intern_id: intern.id,
        date: today,
        check_in_time: now.toISOString(),
        status,
        location_lat: lat,
        location_lng: lng,
        distance_meters: Math.round(distance)
      },
      badgeObject: badgeObjectId ? {
        intern_id: intern.id,
        badge_id: badgeObjectId
      } : null
    });

    return NextResponse.json({
      success: true,
      status,
      newStreak,
      pointsEarned,
      awardedBadge: awardedBadge || null,
      alreadyMarked: false
    });

  } catch (error: any) {
    console.error("[!!!] Attendance API Crash:", error);
    if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return NextResponse.json({ success: true, alreadyMarked: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
