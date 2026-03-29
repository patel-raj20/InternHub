import { NextResponse } from "next/server";
import { client } from "@/lib/apollo-client";
import * as Queries from "@/graphql/queries";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const { data } = await client.query({
      query: Queries.GET_USER_BY_TOKEN,
      variables: { token },
    });

    const user = data?.users?.[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (user.invite_status !== "PENDING") {
      return NextResponse.json({ error: "Already used" }, { status: 400 });
    }

    if (new Date(user.invite_expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
