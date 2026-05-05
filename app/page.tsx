import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>TaskFlow</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none" }}>
            Sign In
          </Link>
          <Link href="/login" style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#6366f1" }}>Team Task Manager</span>
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: "#0f172a", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
          Manage tasks,<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ship faster</span>
        </h1>
        <p style={{ fontSize: 18, color: "#64748b", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Create projects, assign tasks, track progress, and collaborate with your team — all in one place.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/login" style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontSize: 16, fontWeight: 600, color: "#fff", textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
            Start for free →
          </Link>
          <Link href="/login" style={{ padding: "14px 32px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 16, fontWeight: 500, color: "#374151", textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { icon: "📋", title: "Kanban Board", desc: "Visualize your workflow with drag-and-drop task boards. Track progress from To Do to Done." },
            { icon: "👥", title: "Team Collaboration", desc: "Invite team members, assign roles, and collaborate in real-time on shared projects." },
            { icon: "🔔", title: "Smart Notifications", desc: "Get notified when tasks are assigned, updated, or commented on via email and in-app alerts." },
            { icon: "📊", title: "Progress Dashboard", desc: "See your project health at a glance with stats, overdue tasks, and activity feeds." },
            { icon: "🔐", title: "Role-Based Access", desc: "Control who can do what with Admin, Member, and Owner roles per project." },
            { icon: "📧", title: "Email Invitations", desc: "Invite collaborators via email with secure, time-limited invitation links." },
          ].map(f => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 20, padding: "60px 40px", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>Ready to get organized?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 28 }}>Join teams already using TaskFlow to ship faster.</p>
          <Link href="/login" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: "#fff", fontSize: 15, fontWeight: 700, color: "#6366f1", textDecoration: "none" }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: 13, color: "#94a3b8" }}>
        © {new Date().getFullYear()} TaskFlow. Built with Next.js & PostgreSQL.
      </footer>
    </div>
  );
}
