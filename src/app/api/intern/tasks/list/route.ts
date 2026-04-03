import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { graphqlService } from "@/lib/services/graphql-service";

/**
 * API for listing tasks for a specific intern
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const internId = searchParams.get("internId");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!internId) {
      return NextResponse.json({ error: "Intern ID is required" }, { status: 400 });
    }

    // Security: Interns can only see their own tasks. Admins can see any.
    if (session.user.role === "INTERN") {
      const intern = await graphqlService.getInternByUserId(session.user.id);
      if (!intern || intern.id !== internId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const tasks = await graphqlService.getInternTasks(internId);

    return NextResponse.json({
      success: true,
      tasks
    });

  } catch (error: any) {
    console.error("[!!!] Task List API Crash:", error);
    if (error.graphQLErrors) {
      console.error("GraphQL Errors:", JSON.stringify(error.graphQLErrors, null, 2));
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
