import { randomBytes, randomInt, createHash } from "crypto";
import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(key);
};

/** 6-digit OTP for check-email screen (hash stored on user). */
export const createEmailVerificationOtp = () => {
  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = createHash("sha256").update(otp).digest("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return { otp, hash, expires };
};

/** Long link token (optional / legacy). */
export const createEmailVerificationToken = () => {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, hash, expires };
};

export const hashEmailToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const sendVerificationEmail = async ({
  to,
  name,
  otp,
}: {
  to: string;
  name: string;
  otp: string;
}) => {
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:3001"
  ).replace(/\/$/, "");
  const checkUrl = `${frontendUrl}/check-email?email=${encodeURIComponent(to)}`;
  const from =
    process.env.RESEND_FROM_EMAIL || "Notes-Era <onboarding@resend.dev>";

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: `${otp} is your Notes-Era verification code`,
    text: `Hi ${name || "there"},\n\nYour Notes-Era verification code is: ${otp}\n\nThis code expires in 30 minutes.\nEnter it here: ${checkUrl}\n`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2 style="margin: 0 0 12px;">Hi ${name || "there"},</h2>
        <p>Use this code to verify your Notes-Era email:</p>
        <p style="margin: 28px 0; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #7c3aed;">
          ${otp}
        </p>
        <p style="color:#555;font-size:13px;">This code expires in 30 minutes.</p>
        <p style="color:#555;font-size:13px;">
          Enter it here: <a href="${checkUrl}">${checkUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(error.message || "Failed to send verification email.");
  }

  console.log(`[email] Verification OTP sent to=${to} id=${data?.id || "n/a"}`);
  return data;
};
