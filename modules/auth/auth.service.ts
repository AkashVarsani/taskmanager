import { RegisterInput, VerifyOTPInput, ResendOTPInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.schema";
import { AuthRepository } from "./auth.repository";
import { hashPassword } from "@/lib/hash";
import { createOTP } from "@/lib/otp";
import { hashOTP } from "@/lib/otp/utils";
import bcrypt from "bcryptjs";

export class AuthService {
  static async register(input: RegisterInput) {
    if (input.password !== input.confirm) throw new Error("PASSWORD_MISMATCH");

    const email = input.email.toLowerCase();
    const existing = await AuthRepository.findUserByEmail(email);

    if (existing) {
      if (existing.isVerified) throw new Error("USER_ALREADY_EXISTS");
      await AuthRepository.deleteUnverifiedUser(email);
      const stillExists = await AuthRepository.findUserByEmail(email);
      if (stillExists) throw new Error("USER_PENDING_VERIFICATION");
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await AuthRepository.createUser({
      email,
      name: input.name,
      password: hashedPassword,
    });
    await createOTP({ userId: user.id, purpose: "verify_email", channel: "email" });
    return { success: true };
  }

  static async login(input: LoginInput) {
    const email = input.email.toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (!user.isVerified) throw new Error("EMAIL_NOT_VERIFIED");
    if (!user.password) throw new Error("NO_PASSWORD_SET");
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new Error("INVALID_PASSWORD");
    return { success: true, user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified } };
  }

  static async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (!user.isVerified) throw new Error("EMAIL_NOT_VERIFIED");
    await createOTP({ userId: user.id, purpose: "reset_password", channel: "email" });
    return { success: true };
  }

  static async resetPassword(input: ResetPasswordInput) {
    if (input.password !== input.confirm) throw new Error("PASSWORD_MISMATCH");
    const email = input.email.toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");
    const hashedOTP = hashOTP(input.otp);
    const validOTP = await AuthRepository.findValidOTP(user.id, hashedOTP, "reset_password");
    if (!validOTP) throw new Error("INVALID_OR_EXPIRED_OTP");
    const hashedPassword = await hashPassword(input.password);
    await AuthRepository.updateUserPassword(user.id, hashedPassword);
    await AuthRepository.markOTPAsUsed(validOTP.id);
    return { success: true };
  }

  static async verifyOTP(input: VerifyOTPInput) {
    const email = input.email.toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isVerified) throw new Error("USER_ALREADY_VERIFIED");
    const hashedOTP = hashOTP(input.otp);
    const validOTP = await AuthRepository.findValidOTP(user.id, hashedOTP, "verify_email");
    if (!validOTP) throw new Error("INVALID_OR_EXPIRED_OTP");
    await AuthRepository.verifyUser(user.id);
    await AuthRepository.markOTPAsUsed(validOTP.id);
    return { success: true };
  }

  static async resendOTP(input: ResendOTPInput) {
    const email = input.email.toLowerCase();
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.isVerified) throw new Error("USER_ALREADY_VERIFIED");
    await createOTP({ userId: user.id, purpose: "verify_email", channel: "email" });
    return { success: true };
  }
}
