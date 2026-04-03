import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";
import { getWelcomeEmailTemplate } from "@/lib/emails/templates";

export async function POST(req: Request) {
  try {
    const { email, firstName, token, rawPassword } = await req.json();

    const loginLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    await transporter.sendMail({
      from: '"InternHub Security" <no-reply@internhub.com>',
      to: email,
      subject: "Welcome to InternHub! Your Credentials Inside",
      html: getWelcomeEmailTemplate(firstName, email, rawPassword || "Provided separately", loginLink),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
