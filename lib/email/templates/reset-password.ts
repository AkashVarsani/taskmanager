import { baseTemplate } from "./base";

export function resetPasswordTemplate(otp: string, name?: string) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#111827;">
        Reset Your Password
      </h2>
      <p style="margin:0;font-size:16px;color:#6b7280;">
        Secure your account with a new password.
      </p>
    </div>

    <p style="margin:0 0 24px 0;font-size:16px;color:#111827;line-height:1.6;">
      Hi <strong>${name || "there"}</strong>,
    </p>

    <p style="margin:0 0 32px 0;font-size:16px;color:#6b7280;line-height:1.6;">
      We received a request to reset your TaskFlow password. Use the code below:
    </p>

    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 40px;border-radius:12px;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
        <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#ffffff;font-family:monospace;">
          ${otp}
        </div>
      </div>
    </div>

    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#991b1b;font-weight:500;">
        ⚠️ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
    </div>

    <p style="margin:24px 0 0 0;font-size:14px;color:#9ca3af;line-height:1.5;">
      If you didn't request a password reset, your account is safe — just ignore this email.
    </p>
  `);
}
