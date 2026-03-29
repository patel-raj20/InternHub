import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, firstName, token } = await req.json();

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;

    await transporter.sendMail({
      from: '"InternHub" <no-reply@internhub.com>',
      to: email,
      subject: "You're invited to InternHub 🎉",
      html: `
        <h2>Welcome ${firstName}</h2>
        <p>Click below to set your password:</p>
        <a href="${inviteLink}">Set Password</a>
        <p>This link expires in 12 hours</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
