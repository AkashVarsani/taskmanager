import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { taskAssignedTemplate } from "@/lib/email/templates/task-assigned";

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
  position: z.number().int().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const task = await db.task.findFirst({
    where: { id: taskId, projectId: id },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      comments: {
        include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      project: { select: { id: true, name: true, color: true } },
    },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = UpdateTaskSchema.parse(await req.json());
    const oldTask = await db.task.findFirst({ where: { id: taskId, projectId: id } });
    if (!oldTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...body,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    // Log activity
    const changes: Record<string, any> = {};
    if (body.status && body.status !== oldTask.status) changes.status = { from: oldTask.status, to: body.status };
    if (body.priority && body.priority !== oldTask.priority) changes.priority = { from: oldTask.priority, to: body.priority };
    if (body.assigneeId !== undefined && body.assigneeId !== oldTask.assigneeId) changes.assignee = { from: oldTask.assigneeId, to: body.assigneeId };

    if (Object.keys(changes).length > 0) {
      await db.activityLog.create({
        data: {
          userId: session.user.id,
          projectId: id,
          taskId,
          action: "TASK_UPDATED",
          details: { taskTitle: task.title, changes },
        },
      });
    }

    // Notify new assignee
    if (body.assigneeId && body.assigneeId !== oldTask.assigneeId && body.assigneeId !== session.user.id) {
      const [assignee, updater, project] = await Promise.all([
        db.user.findUnique({ where: { id: body.assigneeId } }),
        db.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
        db.project.findUnique({ where: { id }, select: { name: true } }),
      ]);

      if (assignee?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await Promise.all([
          db.notification.create({
            data: {
              userId: body.assigneeId,
              type: "TASK_ASSIGNED",
              title: "Task Assigned",
              message: `${updater?.name || "Someone"} assigned you "${task.title}"`,
              link: `${appUrl}/projects/${id}/tasks/${task.id}`,
            },
          }),
          sendEmail({
            to: assignee.email,
            subject: `Task assigned: ${task.title}`,
            html: taskAssignedTemplate({
              assigneeName: assignee.name || assignee.email,
              assignerName: updater?.name || "Someone",
              taskTitle: task.title,
              projectName: project?.name || "Unknown Project",
              taskUrl: `${appUrl}/projects/${id}/tasks/${task.id}`,
              dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
            }),
          }).catch(console.error),
        ]);
      }
    }

    return NextResponse.json(task);
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    console.error("[PATCH /api/projects/[id]/tasks/[taskId]]", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const task = await db.task.findFirst({ where: { id: taskId, projectId: id } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Only creator, admin, or owner can delete
  if (task.creatorId !== session.user.id && member.role !== "OWNER" && member.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
