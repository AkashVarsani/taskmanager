"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const B = "1px solid rgba(0,0,0,0.08)";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  ARCHIVED: "#94a3b8",
  COMPLETED: "#6366f1",
};

function Avatar({ name, image, size = 24 }: { name?: string | null; image?: string | null; size?: number }) {
  if (image) return <img src={image} alt={name || ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: any) => void }) {
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [loading, setLoading] = useState(false);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#f97316"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create project"); return; }
      toast.success("Project created!");
      onCreated(data);
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>New Project</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Project Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Website Redesign"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's this project about?"
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #0f172a" : "3px solid transparent", cursor: "pointer", transition: "border 150ms" }} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: B, background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => { setProjects(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? projects : projects.filter(p => p.status === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>Projects</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f1f5f9", borderRadius: 8, padding: 4, width: "fit-content" }}>
        {["ALL", "ACTIVE", "COMPLETED", "ARCHIVED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: filter === s ? 600 : 400, cursor: "pointer", background: filter === s ? "#fff" : "transparent", color: filter === s ? "#0f172a" : "#64748b", boxShadow: filter === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 150ms" }}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 12, border: B }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>No projects yet</h3>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)}
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(project => {
            const totalTasks = project._count?.tasks ?? 0;
            const doneTasks = project.tasks?.filter((t: any) => t.status === "DONE").length ?? 0;
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}
                style={{ background: "#fff", border: B, borderRadius: 12, padding: 20, textDecoration: "none", display: "block", transition: "box-shadow 150ms, transform 150ms" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: project.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: project.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{project.name}</div>
                      <div style={{ fontSize: 11, color: STATUS_COLORS[project.status] ?? "#94a3b8", fontWeight: 500 }}>
                        {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{totalTasks} tasks</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{progress}%</span>
                  </div>
                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: project.color, borderRadius: 2, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {/* Members */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex" }}>
                    {project.members?.slice(0, 4).map((m: any, i: number) => (
                      <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, border: "2px solid #fff", borderRadius: "50%" }}>
                        <Avatar name={m.user?.name} image={m.user?.avatarUrl} size={26} />
                      </div>
                    ))}
                    {project.members?.length > 4 && (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f1f5f9", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#64748b", marginLeft: -8 }}>
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  );
}
