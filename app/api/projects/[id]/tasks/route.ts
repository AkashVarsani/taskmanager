import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { taskAssignedTemplate } from "@/lib/email/templates/task-assigned";

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");
  const priority = searchParams.get("priority");

  const tasks = await db.task.findMany({
    where: {
      projectId: id,
      ...(status ? { status: status as any } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      ...(priority ? { priority: priority as any } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = CreateTaskSchema.parse(await req.json());

    // Validate that assignee is a project member
    if (body.assigneeId) {
      const assigneeMember = await db.projectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId: body.assigneeId } },
      });
      if (!assigneeMember) {
        return NextResponse.json({ error: "Assignee must be a project member" }, { status: 400 });
      }
    }

    // Get max position for ordering
    const maxPos = await db.task.aggregate({
      where: { projectId: id, status: body.status ?? "TODO" },
      _max: { position: true },
    });

    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status ?? "TODO",
        priority: body.priority ?? "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assigneeId: body.assigneeId ?? null,
        labels: body.labels ?? [],
        projectId: id,
        creatorId: session.user.id,
        position: (maxPos._max.position ?? 0) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        projectId: id,
        taskId: task.id,
        action: "TASK_CREATED",
        details: { taskTitle: task.title },
      },
    });

    // Notify assignee
    if (body.assigneeId && body.assigneeId !== session.user.id) {
      const [assignee, creator, project] = await Promise.all([
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
              message: `${creator?.name || "Someone"} assigned you "${task.title}"`,
              link: `${appUrl}/projects/${id}/tasks/${task.id}`,
            },
          }),
          sendEmail({
            to: assignee.email,
            subject: `New task assigned: ${task.title}`,
            html: taskAssignedTemplate({
              assigneeName: assignee.name || assignee.email,
              assignerName: creator?.name || "Someone",
              taskTitle: task.title,
              projectName: project?.name || "Unknown Project",
              taskUrl: `${appUrl}/projects/${id}/tasks/${task.id}`,
              dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
            }),
          }).catch(console.error),
        ]);
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    console.error("[POST /api/projects/[id]/tasks]", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
