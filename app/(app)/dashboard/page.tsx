"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const B = "1px solid rgba(0,0,0,0.08)";

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#f59e0b",
  DONE: "#22c55e",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

function StatCard({ label, value, icon, color, sub }: { label: string; value: number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", border: B, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const tasksByStatus = data?.tasksByStatus ?? {};
  const totalTasks = Object.values(tasksByStatus).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Here's what's happening with your projects</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Projects" value={stats.totalProjects ?? 0} color="#6366f1"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>} />
        <StatCard label="My Open Tasks" value={stats.myTasks ?? 0} color="#3b82f6"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} />
        <StatCard label="Overdue Tasks" value={stats.overdueTasks ?? 0} color="#ef4444"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
        <StatCard label="Done This Week" value={stats.completedThisWeek ?? 0} color="#22c55e"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Task Status Breakdown */}
        <div style={{ background: "#fff", border: B, borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Task Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = tasksByStatus[status] ?? 0;
              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[status] }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{count}</span>
                  </div>
                  <ProgressBar value={count} max={totalTasks} color={STATUS_COLORS[status]} />
                </div>
              );
            })}
          </div>
          {totalTasks === 0 && (
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", marginTop: 16 }}>No tasks assigned yet</p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div style={{ background: "#fff", border: B, borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Due Soon</h2>
          {data?.upcomingTasks?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.upcomingTasks.map((task: any) => (
                <Link key={task.id} href={`/projects/${task.projectId}/tasks/${task.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, border: B, textDecoration: "none", transition: "background 150ms" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.project?.color ?? "#6366f1", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{task.project?.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 500, flexShrink: 0 }}>
                    {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No tasks due in the next 7 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: "#fff", border: B, borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Recent Activity</h2>
        {data?.recentActivity?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {data.recentActivity.map((log: any, i: number) => (
              <div key={log.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < data.recentActivity.length - 1 ? B : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#374151" }}>
                    <span style={{ fontWeight: 500 }}>{log.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                    {log.project && <span style={{ color: "#6366f1" }}> · {log.project.name}</span>}
                    {log.task && <span style={{ color: "#64748b" }}> — {log.task.title}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>No recent activity</p>
        )}
      </div>
    </div>
  );
}
