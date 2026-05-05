import db from "@/lib/db";
import { hashOTP } from "./utils";

const OTP_EXPIRY_MINUTES = 10;

export async function storeOTP({
  userId,
  otp,
  purpose,
  channel,
}: {
  userId: string;
  otp: string;
  purpose: string;
  channel: string;
}) {
  // Invalidate old OTPs for same user + purpose
  await db.oTP.updateMany({
    where: { userId, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const hashedCode = hashOTP(otp);

  return db.oTP.create({
    data: { userId, code: hashedCode, purpose, channel, expiresAt },
  });
}
