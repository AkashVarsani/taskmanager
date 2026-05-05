import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

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

    const todoTasks = project.tasks.filter((t) => t.status === "TODO");
    const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS");
    const doneTasks = project.tasks.filter((t) => t.status === "DONE");

    return (
      <div style={{ padding: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{project.name}</h1>
          {project.description && (
            <p style={{ color: "#64748b", fontSize: 15 }}>{project.description}</p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {/* TODO Column */}
          <div>
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "#f1f5f9", borderRadius: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
                To Do ({todoTasks.length})
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todoTasks.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>
                  No tasks yet
                </p>
              ) : (
                todoTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                        {task.description}
                      </p>
                    )}
                    {task.assignee && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Assigned to: {task.assignee.name || task.assignee.email}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div>
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "#fef3c7", borderRadius: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#92400e" }}>
                In Progress ({inProgressTasks.length})
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {inProgressTasks.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>
                  No tasks yet
                </p>
              ) : (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                        {task.description}
                      </p>
                    )}
                    {task.assignee && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Assigned to: {task.assignee.name || task.assignee.email}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DONE Column */}
          <div>
            <div style={{ marginBottom: 16, padding: "8px 12px", background: "#d1fae5", borderRadius: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#065f46" }}>
                Done ({doneTasks.length})
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {doneTasks.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>
                  No tasks yet
                </p>
              ) : (
                doneTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #a7f3d0",
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{task.title}</h4>
                    {task.description && (
                      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                        {task.description}
                      </p>
                    )}
                    {task.assignee && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Assigned to: {task.assignee.name || task.assignee.email}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            💡 <strong>Tip:</strong> Use the "My Tasks" page to create and manage tasks for this project.
          </p>
        </div>
      </div>
    );
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
