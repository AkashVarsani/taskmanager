import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true },
        },
        tasks: {
          include: {
            assignee: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Project Not Found</h1>
          <p style={{ color: "#64748b" }}>The project you're looking for doesn't exist.</p>
        </div>
      );
    }

    const userMember = project.members.find((m) => m.userId === session.user!.id);
    if (!userMember) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: "#64748b" }}>You don't have access to this project.</p>
        </div>
      );
    }

    return <ProjectDetailClient project={project} currentUserId={session.user.id} />;
  } catch (error) {
    console.error("Error loading project:", error);
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "#dc2626" }}>Error Loading Project</h1>
        <p style={{ color: "#64748b", marginBottom: 16 }}>
          There was an error loading this project. Please try again.
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
