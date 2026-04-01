import nodemailer from "nodemailer";

/**
 * Configure the global mail transporter for InternHub notifications.
 */
export const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.MAILTRAP_PORT || "2525"),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
  secure: false, // TLS
});

/**
 * Sends a system email using the configured transporter.
 */
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: '"InternHub" <noreply@internhub.com>',
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("❌ Email transmission failed:", error);
    throw new Error("Failed to send email notification");
  }
}
