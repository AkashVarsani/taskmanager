"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const B = "1px solid rgba(0,0,0,0.08)";

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8", IN_PROGRESS: "#3b82f6", IN_REVIEW: "#f59e0b", DONE: "#22c55e",
};
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review", DONE: "Done",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#f97316", URGENT: "#ef4444",
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    // Fetch all projects and their tasks assigned to me
    fetch("/api/projects")
      .then(r => r.json())
      .then(async (projects: any[]) => {
        if (!Array.isArray(projects)) { setLoading(false); return; }
        const allTasks: any[] = [];
        await Promise.all(projects.map(async (p: any) => {
          try {
            const res = await fetch(`/api/projects/${p.id}/tasks`);
            const data = await res.json();
            if (Array.isArray(data)) {
              data.forEach((t: any) => {
                if (t.assigneeId) allTasks.push({ ...t, project: { id: p.id, name: p.name, color: p.color } });
              });
            }
          } catch {}
        }));
        setTasks(allTasks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (task: any, status: string) => {
    try {
      const res = await fetch(`/api/projects/${task.project.id}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
      toast.success("Status updated");
    } catch { toast.error("Something went wrong"); }
  };

  const filtered = tasks.filter(t => {
    const statusOk = filter === "ALL" || t.status === filter;
    const priorityOk = priorityFilter === "ALL" || t.priority === priorityFilter;
    return statusOk && priorityOk;
  });

  const overdue = filtered.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE");
  const upcoming = filtered.filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && t.status !== "DONE");
  const noDue = filtered.filter(t => !t.dueDate && t.status !== "DONE");
  const done = filtered.filter(t => t.status === "DONE");

  const groups = [
    { label: "Overdue", tasks: overdue, color: "#ef4444" },
    { label: "Upcoming", tasks: upcoming, color: "#f59e0b" },
    { label: "No Due Date", tasks: noDue, color: "#94a3b8" },
    { label: "Completed", tasks: done, color: "#22c55e" },
  ].filter(g => g.tasks.length > 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>My Tasks</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
          {["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: filter === s ? 600 : 400, cursor: "pointer", background: filter === s ? "#fff" : "transparent", color: filter === s ? "#0f172a" : "#64748b", boxShadow: filter === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {s === "ALL" ? "All" : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: 4 }}>
          {["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: priorityFilter === p ? 600 : 400, cursor: "pointer", background: priorityFilter === p ? "#fff" : "transparent", color: priorityFilter === p ? "#0f172a" : "#64748b", boxShadow: priorityFilter === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {p === "ALL" ? "All Priority" : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 12, border: B }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 14, color: "#64748b" }}>No tasks match your current filters</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groups.map(group => (
            <div key={group.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{group.label}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", borderRadius: 10, padding: "1px 7px" }}>{group.tasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.tasks.map((task: any) => {
                  const isOverdueTask = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                  return (
                    <div key={task.id} style={{ background: "#fff", border: B, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} title={task.priority} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/projects/${task.project.id}/tasks/${task.id}`}
                          style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#6366f1")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#0f172a")}>
                          {task.title}
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.project.color }} />
                          <span style={{ fontSize: 12, color: "#64748b" }}>{task.project.name}</span>
                          {task.dueDate && (
                            <span style={{ fontSize: 12, color: isOverdueTask ? "#ef4444" : "#94a3b8", fontWeight: isOverdueTask ? 600 : 400 }}>
                              · {isOverdueTask ? "Overdue: " : ""}{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <select value={task.status} onChange={e => handleStatusChange(task, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: 6, border: B, fontSize: 12, outline: "none", background: "#fafafa", color: STATUS_COLORS[task.status], fontWeight: 600, cursor: "pointer" }}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
