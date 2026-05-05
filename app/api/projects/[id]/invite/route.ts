import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { email, role } = InviteSchema.parse(await req.json());

    const project = await db.project.findUnique({
      where: { id },
      include: { owner: { select: { name: true } } },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found. They need to sign up first." }, { status: 404 });
    }

    // Check if already a member
    const alreadyMember = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: existingUser.id } },
    });
    if (alreadyMember) return NextResponse.json({ error: "User is already a member" }, { status: 409 });

    // Check for existing pending invitation
    const existingInvite = await db.invitation.findFirst({
      where: { projectId: id, email: email.toLowerCase(), status: "PENDING" },
    });
    if (existingInvite) return NextResponse.json({ error: "Invitation already sent" }, { status: 409 });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const invitation = await db.invitation.create({
      data: {
        email: email.toLowerCase(),
        projectId: id,
        senderId: session.user.id,
        role,
        expiresAt,
      },
    });

    const sender = await db.user.findUnique({ where: { id: session.user.id }, select: { name: true } });

    // Create notification for the user with token in link
    await db.notification.create({
      data: {
        userId: existingUser.id,
        type: "PROJECT_INVITED",
        title: "Project Invitation",
        message: `${sender?.name || "Someone"} invited you to join "${project.name}" as ${role === "ADMIN" ? "an Admin" : "a Member"}`,
        link: `/invite/${invitation.token}`,
      },
    });

    return NextResponse.json({ success: true, message: "Invitation sent successfully" });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    console.error("[POST /api/projects/[id]/invite]", err);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
