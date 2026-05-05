import { generateOTP } from "./utils";
import { storeOTP } from "./repository";
import { sendEmail } from "@/lib/email/send";
import { verifyEmailTemplate } from "@/lib/email/templates/verify-email";
import { resetPasswordTemplate } from "@/lib/email/templates/reset-password";
import db from "@/lib/db";

type CreateOTPParams = {
  userId: string;
  purpose: "verify_email" | "reset_password";
  channel: "email";
};

export async function createOTP({ userId, purpose, channel }: CreateOTPParams) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.email) throw new Error("USER_EMAIL_NOT_FOUND");

  const otp = generateOTP();
  await storeOTP({ userId, otp, purpose, channel });

  let subject = "";
  let html = "";

  if (purpose === "verify_email") {
    subject = "Verify your TaskFlow account";
    html = verifyEmailTemplate(otp, user.name || undefined);
  } else if (purpose === "reset_password") {
    subject = "Reset your TaskFlow password";
    html = resetPasswordTemplate(otp, user.name || undefined);
  } else {
    throw new Error("UNSUPPORTED_OTP_PURPOSE");
  }

  // In development, log the OTP to console for easy testing
  if (process.env.NODE_ENV === "development") {
    console.log("\n🔐 [OTP GENERATED]");
    console.log("User:", user.email);
    console.log("Purpose:", purpose);
    console.log("OTP Code:", otp);
    console.log("(Valid for 10 minutes)\n");
  }

  await sendEmail({ to: user.email, subject, html });
  return { success: true };
}
