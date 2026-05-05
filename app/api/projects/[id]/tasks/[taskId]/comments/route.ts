import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function POST(
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
    const { content } = CommentSchema.parse(await req.json());

    const comment = await db.comment.create({
      data: { content, taskId, authorId: session.user.id },
      include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    // Notify task creator and assignee
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { title: true, creatorId: true, assigneeId: true },
    });

    if (task) {
      const notifyIds = new Set([task.creatorId, task.assigneeId].filter(Boolean) as string[]);
      notifyIds.delete(session.user.id);

      const commenter = await db.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      for (const userId of notifyIds) {
        await db.notification.create({
          data: {
            userId,
            type: "TASK_COMMENTED",
            title: "New Comment",
            message: `${commenter?.name || "Someone"} commented on "${task.title}"`,
            link: `${appUrl}/projects/${id}/tasks/${taskId}`,
          },
        });
      }
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        projectId: id,
        taskId,
        action: "TASK_COMMENTED",
        details: { commentId: comment.id },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;
  const { searchParams } = req.nextUrl;
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  if (comment.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
