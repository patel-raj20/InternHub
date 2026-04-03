import { NextResponse } from "next/server";
import { client } from "@/lib/apollo-client";
import { GET_USER_FOR_RESET } from "@/graphql/queries";
import { RESET_PASSWORD, CLEAR_RESET_OTP } from "@/graphql/mutations";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Fetch user to validate OTP
    const { data } = (await client.query<any>({
      query: GET_USER_FOR_RESET,
      variables: { email },
      fetchPolicy: "network-only",
    })) as any;

    const user = data?.users?.[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid OTP or Email" }, { status: 401 });
    }

    if (!user.reset_otp || !user.reset_otp_expires_at) {
      return NextResponse.json({ error: "No active verification OTP found. Please request a new one." }, { status: 401 });
    }

    if (user.reset_otp !== otp) {
      // Security protocol: Invalidate OTP on wrong attempt
      await client.mutate({
        mutation: CLEAR_RESET_OTP,
        variables: { email }
      });
      return NextResponse.json({ error: "Incorrect verification code. For security, your current OTP has been expired. Request a new one." }, { status: 401 });
    }

    // Expiry check — the DB column is TIMESTAMP (no timezone).
    // Hasura returns it as a bare string like "2026-04-02T06:30:00".
    // We must treat it as UTC since we stored it as UTC ISO string.
    const rawExpiry = user.reset_otp_expires_at;
    // Append "Z" if missing so JS Date parses it as UTC, not local time
    const expiryStr = rawExpiry.endsWith("Z") ? rawExpiry : rawExpiry + "Z";
    const expiryTime = new Date(expiryStr).getTime();
    const currentTime = Date.now();

    console.log(`[Security Check] OTP Validation for ${email}:`);
    console.log(`- Raw DB Value:  "${rawExpiry}"`);
    console.log(`- Parsed Expiry: ${new Date(expiryTime).toISOString()}`);
    console.log(`- Current Time:  ${new Date(currentTime).toISOString()}`);
    console.log(`- Diff (sec):    ${((expiryTime - currentTime) / 1000).toFixed(0)}s remaining`);

    if (currentTime > expiryTime) {
      return NextResponse.json({ error: "Your verification OTP has expired. Please request a new one." }, { status: 401 });
    }

    // 2. Hash New Password
    const password_hash = bcrypt.hashSync(newPassword, 10);

    // 3. Save new password and clear OTP
    await client.mutate({
      mutation: RESET_PASSWORD,
      variables: { email, password_hash }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
