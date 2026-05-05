import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";

const UpdateMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

const RemoveMemberSchema = z.object({
  userId: z.string(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await db.projectMember.findMany({
    where: { projectId: id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const requester = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });
  if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, role } = UpdateMemberSchema.parse(await req.json());
    const target = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });
    if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (target.role === "OWNER") return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });

    const updated = await db.projectMember.update({
      where: { projectId_userId: { projectId: id, userId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const requester = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: session.user.id } },
  });

  // Can remove self, or admin/owner can remove others
  const isSelf = userId === session.user.id;
  const canManage = requester?.role === "OWNER" || requester?.role === "ADMIN";

  if (!isSelf && !canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "OWNER") return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });

  await db.projectMember.delete({
    where: { projectId_userId: { projectId: id, userId } },
  });

  return NextResponse.json({ success: true });
}
