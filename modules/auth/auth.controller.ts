import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema, VerifyOTPSchema, ResendOTPSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export async function registerController(req: NextRequest) {
  try {
    const parsed = RegisterSchema.parse(await req.json());
    await AuthService.register(parsed);
    return NextResponse.json({ message: "Registration successful. Verify your email." }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    if (err.message === "PASSWORD_MISMATCH") return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (err.message === "USER_ALREADY_EXISTS") return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    if (err.message === "USER_PENDING_VERIFICATION") return NextResponse.json({ error: "Email pending verification. Please try again later." }, { status: 409 });
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function loginController(req: NextRequest) {
  try {
    const parsed = LoginSchema.parse(await req.json());
    const result = await AuthService.login(parsed);
    return NextResponse.json({ success: true, user: result.user }, { status: 200 });
  } catch (err: any) {
    if (err.message === "USER_NOT_FOUND") return NextResponse.json({ error: "No account found with this email" }, { status: 401 });
    if (err.message === "EMAIL_NOT_VERIFIED") return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 });
    if (err.message === "NO_PASSWORD_SET") return NextResponse.json({ error: "Please sign in with your social account" }, { status: 401 });
    if (err.message === "INVALID_PASSWORD") return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function forgotPasswordController(req: NextRequest) {
  try {
    const parsed = ForgotPasswordSchema.parse(await req.json());
    await AuthService.forgotPassword(parsed);
    return NextResponse.json({ success: true, message: "Reset code sent to your email" }, { status: 200 });
  } catch (err: any) {
    if (err.message === "USER_NOT_FOUND") return NextResponse.json({ success: true, message: "If this email exists, a reset code has been sent" }, { status: 200 });
    if (err.message === "EMAIL_NOT_VERIFIED") return NextResponse.json({ error: "Please verify your email first" }, { status: 400 });
    console.error("[forgotPassword]", err);
    return NextResponse.json({ error: "Failed to send reset code" }, { status: 500 });
  }
}

export async function resetPasswordController(req: NextRequest) {
  try {
    const parsed = ResetPasswordSchema.parse(await req.json());
    await AuthService.resetPassword(parsed);
    return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
  } catch (err: any) {
    if (err.message === "PASSWORD_MISMATCH") return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    if (err.message === "USER_NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (err.message === "INVALID_OR_EXPIRED_OTP") return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
    console.error("[resetPassword]", err);
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}

export async function verifyOTPController(req: NextRequest) {
  try {
    const parsed = VerifyOTPSchema.parse(await req.json());
    await AuthService.verifyOTP(parsed);
    return NextResponse.json({ success: true, message: "Email verified successfully" }, { status: 200 });
  } catch (err: any) {
    if (err.message === "USER_NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (err.message === "USER_ALREADY_VERIFIED") return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    if (err.message === "INVALID_OR_EXPIRED_OTP") return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    console.error("[verifyOTP]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function resendOTPController(req: NextRequest) {
  try {
    const parsed = ResendOTPSchema.parse(await req.json());
    await AuthService.resendOTP(parsed);
    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
  } catch (err: any) {
    if (err.message === "USER_NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (err.message === "USER_ALREADY_VERIFIED") return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    console.error("[resendOTP]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
