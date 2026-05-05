import crypto from "crypto";

export function generateOTP(length = 6) {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

export function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
