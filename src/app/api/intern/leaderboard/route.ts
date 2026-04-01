import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { graphqlService } from "@/lib/services/graphql-service";

/**
 * API for fetching ranked users (Leaderboard)
 * Supports: Global and Department filtering
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    // Optional filter by department
    const departmentId = searchParams.get("department") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let currentUserInternId = "";
    if (session.user.role === "INTERN") {
      const intern = await graphqlService.getInternByUserId(session.user.id);
      currentUserInternId = intern?.id || "";
    }

    const leaderboard = await graphqlService.getLeaderboard(departmentId, limit);

    // Formatter: Transform for Frontend with extreme safety
    const rankedData = (leaderboard || []).map((intern: any, index: number) => ({
      rank: index + 1,
      id: intern?.id || `temp-${index}`,
      name: `${intern?.user?.first_name || "Unknown"} ${intern?.user?.last_name || ""}`.trim(),
      department: intern?.user?.department?.name || "Global",
      points: Number(intern?.total_points) || 0,
      streak: Number(intern?.task_streak) || 0,
      badges: (intern?.intern_badges || [])
        .filter((ib: any) => ib?.badge)
        .slice(0, 3)
        .map((ib: any) => ({
          icon: ib.badge.icon || "award",
          name: ib.badge.name || "Badge"
        })),
      isCurrentUser: intern?.id === currentUserInternId
    }));

    return NextResponse.json({
      success: true,
      data: rankedData
    });

  } catch (error: any) {
    console.error("[!!!] Leaderboard API Crash:", error);
    if (error.graphQLErrors) {
      console.error("GraphQL Errors:", JSON.stringify(error.graphQLErrors, null, 2));
    }
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error.message || "Unknown error"
    }, { status: 500 });
  }
}
