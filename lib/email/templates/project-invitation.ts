import { baseTemplate } from "./base";

export function projectInvitationTemplate({
  inviteeName,
  inviterName,
  projectName,
  role,
  acceptUrl,
}: {
  inviteeName: string;
  inviterName: string;
  projectName: string;
  role: string;
  acceptUrl: string;
}) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#111827;">
        Project Invitation
      </h2>
      <p style="margin:0;font-size:16px;color:#6b7280;">
        You've been invited to collaborate.
      </p>
    </div>

    <p style="margin:0 0 24px 0;font-size:16px;color:#111827;line-height:1.6;">
      Hi <strong>${inviteeName || "there"}</strong>,
    </p>

    <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.6;">
      <strong>${inviterName}</strong> has invited you to join the <strong>${projectName}</strong> project as a <strong>${role.toLowerCase()}</strong>.
    </p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;">Project</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#4c1d95;">${projectName}</p>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${acceptUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Accept Invitation →
      </a>
    </div>

    <p style="margin:24px 0 0 0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
      This invitation expires in 7 days. If you don't have a TaskFlow account, you'll be prompted to create one.
    </p>
  `);
}
