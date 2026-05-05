"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const B = "1px solid rgba(0,0,0,0.08)";

function Avatar({ name, image, size = 36 }: { name?: string | null; image?: string | null; size?: number }) {
  if (image) return <img src={image} alt={name || ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<any>({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = (p = 1, s = "") => {
    setLoading(true);
    fetch(`/api/admin/users?page=${p}&search=${encodeURIComponent(s)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(page, search); }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Failed to update role"); return; }
      setData((prev: any) => ({ ...prev, users: prev.users.map((u: any) => u.id === userId ? { ...u, role } : u) }));
      toast.success("Role updated");
    } catch { toast.error("Something went wrong"); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>User Management</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{data.total} total users</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by name or email..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fff" }}
          onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
        <button type="submit" style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Search
        </button>
      </form>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ background: "#fff", border: B, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["User", "Email", "Role", "Projects", "Tasks", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px", borderBottom: B }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users?.map((user: any, i: number) => (
                <tr key={user.id} style={{ borderBottom: i < data.users.length - 1 ? B : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={user.name} image={user.avatarUrl} size={32} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{user.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b" }}>{user.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: user.role === "ADMIN" ? "#eff6ff" : "#f1f5f9", color: user.role === "ADMIN" ? "#6366f1" : "#64748b" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{user._count?.ownedProjects ?? 0}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{user._count?.assignedTasks ?? 0}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: "5px 10px", borderRadius: 6, border: B, fontSize: 12, outline: "none", background: "#fafafa", cursor: "pointer" }}>
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: B }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 6, border: B, background: "#fff", fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>
                Previous
              </button>
              <span style={{ padding: "6px 14px", fontSize: 13, color: "#64748b" }}>Page {page} of {data.pages}</span>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                style={{ padding: "6px 14px", borderRadius: 6, border: B, background: "#fff", fontSize: 13, cursor: page === data.pages ? "not-allowed" : "pointer", opacity: page === data.pages ? 0.5 : 1 }}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
