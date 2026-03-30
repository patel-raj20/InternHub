import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { client } from "@/lib/apollo-client";
import * as Queries from "@/graphql/queries";
import * as Mutations from "@/graphql/mutations";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const { data } = await client.query({
      query: Queries.GET_USER_BY_TOKEN,
      variables: { token },
    });

    const user = data?.users?.[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    await client.mutate({
      mutation: Mutations.ACCEPT_INVITE,
      variables: {
        id: user.id,
        password: hashed,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
