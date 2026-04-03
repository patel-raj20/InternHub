import { NextResponse } from "next/server";
import { client } from "@/lib/apollo-client";
import { SET_RESET_OTP } from "@/graphql/mutations";
import { transporter } from "@/lib/mailer";
import { getOTPResetEmailTemplate } from "@/lib/emails/templates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expires in 5 minutes (reduced from 15 as requested)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data } = (await client.mutate<any>({
      mutation: SET_RESET_OTP,
      variables: { email, otp, expires_at: expiresAt },
    })) as any;

    if (!data.update_users.affected_rows || data.update_users.affected_rows === 0) {
      // For security, don't reveal if email exists, just return success
      return NextResponse.json({ success: true, message: "If your email is registered, you will receive an OTP shortly." });
    }

    const user = data.update_users.returning[0];

    // Send the OTP via Email
    await transporter.sendMail({
      from: '"InternHub Security" <no-reply@internhub.com>',
      to: email,
      subject: "Your Password Reset Code",
      html: getOTPResetEmailTemplate(user.first_name, otp),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
