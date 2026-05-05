"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const B = "1px solid rgba(0,0,0,0.08)";

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  TASK_UPDATED: "✏️",
  TASK_COMMENTED: "💬",
  PROJECT_INVITED: "🤝",
  PROJECT_UPDATED: "📁",
  MENTION: "@",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAcceptInvite = async (notificationId: string, token: string) => {
    setProcessingInvite(notificationId);
    try {
      const res = await fetch(`/api/invite/${token}`, { method: "PATCH" });
      const data = await res.json();
      
      if (res.ok) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Redirect to the project
        router.push(`/projects/${data.projectId}`);
      } else {
        alert(data.error || "Failed to accept invitation");
      }
    } catch (err) {
      alert("Failed to accept invitation");
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeclineInvite = async (notificationId: string, token: string) => {
    setProcessingInvite(notificationId);
    try {
      const res = await fetch(`/api/invite/${token}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        alert(data.error || "Failed to decline invitation");
      }
    } catch (err) {
      alert("Failed to decline invitation");
    } finally {
      setProcessingInvite(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ padding: "8px 16px", borderRadius: 8, border: B, background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 12, border: B }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 14, color: "#64748b" }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: B, borderRadius: 12, overflow: "hidden" }}>
          {notifications.map((n, i) => {
            const isInvite = n.type === "PROJECT_INVITED";
            const token = isInvite && n.link ? n.link.split("/").pop() : null;
            const isProcessing = processingInvite === n.id;

            return (
              <div key={n.id}
                style={{ display: "flex", gap: 14, padding: "16px 20px", borderBottom: i < notifications.length - 1 ? B : "none", background: n.read ? "#fff" : "#fafbff", transition: "background 150ms" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {TYPE_ICONS[n.type] || "🔔"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: "#0f172a" }}>{n.title}</span>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0", lineHeight: 1.4 }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
                    {new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>

                  {isInvite && token && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => handleAcceptInvite(n.id, token)}
                        disabled={isProcessing}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 6,
                          border: "none",
                          background: isProcessing ? "#cbd5e1" : "#6366f1",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          transition: "background 150ms"
                        }}
                        onMouseEnter={e => { if (!isProcessing) (e.currentTarget as HTMLElement).style.background = "#4f46e5"; }}
                        onMouseLeave={e => { if (!isProcessing) (e.currentTarget as HTMLElement).style.background = "#6366f1"; }}>
                        {isProcessing ? "Processing..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(n.id, token)}
                        disabled={isProcessing}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 6,
                          border: B,
                          background: "#fff",
                          color: "#64748b",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          transition: "all 150ms"
                        }}
                        onMouseEnter={e => { if (!isProcessing) { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; (e.currentTarget as HTMLElement).style.color = "#0f172a"; } }}
                        onMouseLeave={e => { if (!isProcessing) { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#64748b"; } }}>
                        Decline
                      </button>
                    </div>
                  )}

                  {!isInvite && n.link && (
                    <Link href={n.link}
                      onClick={() => { if (!n.read) markRead(n.id); }}
                      style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
                      View →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
