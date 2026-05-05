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

interface Project {
  id: string;
  name: string;
  description: string | null;
  members: Array<{
    id: string;
    userId: string;
    user: { id: string; name: string | null; email: string };
  }>;
  tasks: Task[];
}

function CreateTaskModal({ 
  projectId, 
  members, 
  onClose, 
  onCreated 
}: { 
  projectId: string; 
  members: Project["members"]; 
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Create New Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Task Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Design homepage mockup"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add more details about this task..."
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
                Priority
              </label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Assign To
            </label>
            <select
              value={form.assigneeId}
              onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", cursor: "pointer" }}
            >
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name || member.user.email}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: B, background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailClient({ 
  project 
}: { 
  project: Project 
}) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const router = useRouter();

  const todoTasks = project.tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = project.tasks.filter((t) => t.status === "DONE");

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{project.name}</h1>
          {project.description && (
            <p style={{ color: "#64748b", fontSize: 15 }}>{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Task
        </button>
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

      {showCreateTask && (
        <CreateTaskModal
          projectId={project.id}
          members={project.members}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
