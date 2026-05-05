import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();

  const [
    totalProjects,
    myTasks,
    overdueTasks,
    completedThisWeek,
    recentActivity,
    tasksByStatus,
    upcomingTasks,
  ] = await Promise.all([
    // Total projects user is part of
    db.projectMember.count({ where: { userId } }),

    // All tasks assigned to user
    db.task.count({ where: { assigneeId: userId, status: { not: "DONE" } } }),

    // Overdue tasks
    db.task.count({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
    }),

    // Completed this week
    db.task.count({
      where: {
        assigneeId: userId,
        status: "DONE",
        updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Recent activity
    db.activityLog.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, name: true, color: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Tasks by status
    db.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: { status: true },
    }),

    // Upcoming tasks (due in next 7 days)
    db.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const statusMap = tasksByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    stats: {
      totalProjects,
      myTasks,
      overdueTasks,
      completedThisWeek,
    },
    tasksByStatus: {
      TODO: statusMap["TODO"] ?? 0,
      IN_PROGRESS: statusMap["IN_PROGRESS"] ?? 0,
      IN_REVIEW: statusMap["IN_REVIEW"] ?? 0,
      DONE: statusMap["DONE"] ?? 0,
    },
    recentActivity,
    upcomingTasks,
  });
}
