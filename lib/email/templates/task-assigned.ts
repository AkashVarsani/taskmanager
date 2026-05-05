import { baseTemplate } from "./base";

export function taskAssignedTemplate({
  assigneeName,
  assignerName,
  taskTitle,
  projectName,
  taskUrl,
  dueDate,
}: {
  assigneeName: string;
  assignerName: string;
  taskTitle: string;
  projectName: string;
  taskUrl: string;
  dueDate?: string;
}) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#111827;">
        New Task Assigned
      </h2>
      <p style="margin:0;font-size:16px;color:#6b7280;">
        You have a new task waiting for you.
      </p>
    </div>

    <p style="margin:0 0 24px 0;font-size:16px;color:#111827;line-height:1.6;">
      Hi <strong>${assigneeName}</strong>,
    </p>

    <p style="margin:0 0 24px 0;font-size:16px;color:#6b7280;line-height:1.6;">
      <strong>${assignerName}</strong> has assigned you a task in the <strong>${projectName}</strong> project.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0 0 8px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Task</p>
      <p style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#111827;">${taskTitle}</p>
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Project</p>
      <p style="margin:0 0 16px 0;font-size:14px;color:#374151;">${projectName}</p>
      ${dueDate ? `
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Due Date</p>
      <p style="margin:0;font-size:14px;color:#374151;">${dueDate}</p>
      ` : ""}
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${taskUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View Task →
      </a>
    </div>
  `);
}
