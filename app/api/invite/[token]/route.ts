import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, name: true, color: true } },
      sender: { select: { name: true, email: true } },
    },
  });

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.status !== "PENDING") return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
  if (invitation.expiresAt < new Date()) {
    await db.invitation.update({ where: { token }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
  }

  return NextResponse.json(invitation);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const invitation = await db.invitation.findUnique({ where: { token } });

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.status !== "PENDING") return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
  if (invitation.expiresAt < new Date()) {
    await db.invitation.update({ where: { token }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return NextResponse.json({ error: "This invitation was sent to a different email address" }, { status: 403 });
  }

  // Check if already a member
  const existing = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: invitation.projectId, userId: session.user.id } },
  });
  if (existing) {
    await db.invitation.update({ where: { token }, data: { status: "ACCEPTED" } });
    return NextResponse.json({ success: true, projectId: invitation.projectId });
  }

  await db.$transaction([
    db.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId: session.user.id,
        role: invitation.role,
      },
    }),
    db.invitation.update({ where: { token }, data: { status: "ACCEPTED" } }),
  ]);

  return NextResponse.json({ success: true, projectId: invitation.projectId });
}
