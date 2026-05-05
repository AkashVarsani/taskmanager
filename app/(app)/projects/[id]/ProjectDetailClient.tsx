"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const B = "1px solid rgba(0,0,0,0.08)";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: { id: string; name: string | null; email: string } | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; email: string; avatarUrl: string | null };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  members: Member[];
  tasks: Task[];
}

function Avatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
  if (image) return <img src={image} alt={name || ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function CreateTaskModal({ 
  projectId, 
  members, 
  onClose, 
  onCreated 
}: { 
  projectId: string; 
  members: Member[]; 
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create task");
        return;
      }
      toast.success("Task created!");
      onCreated();
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Create New Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Task Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Design homepage mockup"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add more details..." rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Assign To</label>
            <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}>
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>{member.user.name || member.user.email}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: B, background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteMemberModal({ projectId, onClose, onInvited }: { projectId: string; onClose: () => void; onInvited: () => void }) {
  const [form, setForm] = useState({ email: "", role: "MEMBER" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send invitation");
        return;
      }
      toast.success("Invitation sent!");
      onInvited();
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Invite Team Member</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="colleague@example.com"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}>
              <option value="MEMBER">Member - Can view and edit tasks</option>
              <option value="ADMIN">Admin - Can manage team and settings</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: B, background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailClient({ project, currentUserId }: { project: Project; currentUserId: string }) {
  const [activeTab, setActiveTab] = useState<"tasks" | "team">("tasks");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const router = useRouter();

  const todoTasks = project.tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = project.tasks.filter((t) => t.status === "DONE");

  const currentUserMember = project.members.find(m => m.userId === currentUserId);
  const isOwner = project.ownerId === currentUserId;
  const isAdmin = currentUserMember?.role === "ADMIN" || isOwner;

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const member = project.members.find(m => m.id === memberId);
      const res = await fetch(`/api/projects/${project.id}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member?.userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to remove member");
        return;
      }
      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const member = project.members.find(m => m.id === memberId);
      const res = await fetch(`/api/projects/${project.id}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member?.userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update role");
        return;
      }
      toast.success("Role updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{project.name}</h1>
        {project.description && (
          <p style={{ color: "#64748b", fontSize: 15 }}>{project.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
          <button onClick={() => setActiveTab("tasks")}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: activeTab === "tasks" ? 600 : 400, cursor: "pointer", background: activeTab === "tasks" ? "#fff" : "transparent", color: activeTab === "tasks" ? "#0f172a" : "#64748b", boxShadow: activeTab === "tasks" ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            Tasks ({project.tasks.length})
          </button>
          <button onClick={() => setActiveTab("team")}
            style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 14, fontWeight: activeTab === "team" ? 600 : 400, cursor: "pointer", background: activeTab === "team" ? "#fff" : "transparent", color: activeTab === "team" ? "#0f172a" : "#64748b", boxShadow: activeTab === "team" ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            Team ({project.members.length})
          </button>
        </div>

        {activeTab === "tasks" ? (
          <button onClick={() => setShowCreateTask(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        ) : isAdmin && (
          <button onClick={() => setShowInviteMember(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { label: "To Do", tasks: todoTasks, bg: "#f1f5f9", color: "#475569", borderColor: "#e2e8f0" },
            { label: "In Progress", tasks: inProgressTasks, bg: "#fef3c7", color: "#92400e", borderColor: "#fde68a" },
            { label: "Done", tasks: doneTasks, bg: "#d1fae5", color: "#065f46", borderColor: "#a7f3d0" },
          ].map(column => (
            <div key={column.label}>
              <div style={{ marginBottom: 16, padding: "8px 12px", background: column.bg, borderRadius: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: column.color }}>
                  {column.label} ({column.tasks.length})
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {column.tasks.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>No tasks yet</p>
                ) : (
                  column.tasks.map((task) => (
                    <div key={task.id} style={{ background: "#fff", border: `1px solid ${column.borderColor}`, borderRadius: 8, padding: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{task.title}</h4>
                      {task.description && (
                        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{task.description}</p>
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
          ))}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {project.members.map(member => {
            const isMemberOwner = project.ownerId === member.userId;
            const canManage = isAdmin && !isMemberOwner && member.userId !== currentUserId;
            
            return (
              <div key={member.id} style={{ background: "#fff", border: B, borderRadius: 12, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={member.user.name} image={member.user.avatarUrl} size={48} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                      {member.user.name || member.user.email}
                      {isMemberOwner && <span style={{ marginLeft: 8, fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>OWNER</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{member.user.email}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {canManage ? (
                    <select value={member.role} onChange={e => handleChangeRole(member.id, e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: B, fontSize: 13, outline: "none", background: "#fafafa", cursor: "pointer", fontWeight: 500 }}>
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", background: "#eff6ff", padding: "6px 12px", borderRadius: 6 }}>
                      {isMemberOwner ? "Owner" : member.role}
                    </span>
                  )}

                  {canManage && (
                    <button onClick={() => handleRemoveMember(member.id)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateTask && (
        <CreateTaskModal projectId={project.id} members={project.members} onClose={() => setShowCreateTask(false)} onCreated={() => router.refresh()} />
      )}

      {showInviteMember && (
        <InviteMemberModal projectId={project.id} onClose={() => setShowInviteMember(false)} onInvited={() => router.refresh()} />
      )}
    </div>
  );
}
