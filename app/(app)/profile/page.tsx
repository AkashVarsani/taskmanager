"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const B = "1px solid rgba(0,0,0,0.08)";

function Avatar({ name, image, size = 80 }: { name?: string | null; image?: string | null; size?: number }) {
  if (image) return <img src={image} alt={name || ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const initials = name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff" }}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => { setProfile(d); setEditName(d.name || ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update profile"); return; }
      setProfile(data);
      toast.success("Profile updated!");
    } catch { toast.error("Something went wrong"); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords do not match"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to change password"); return; }
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch { toast.error("Something went wrong"); }
    finally { setSavingPw(false); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>Profile</h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div style={{ background: "#fff", border: B, borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <Avatar name={profile?.name} image={profile?.avatarUrl} size={72} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{profile?.name || "User"}</div>
            <div style={{ fontSize: 14, color: "#64748b" }}>{profile?.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: profile?.role === "ADMIN" ? "#eff6ff" : "#f1f5f9", color: profile?.role === "ADMIN" ? "#6366f1" : "#64748b" }}>
                {profile?.role}
              </span>
              {profile?.isVerified && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#f0fdf4", color: "#16a34a" }}>✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={profile?.email || ""} disabled
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#f8fafc", boxSizing: "border-box", color: "#94a3b8" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Member Since</label>
            <input type="text" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""} disabled
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#f8fafc", boxSizing: "border-box", color: "#94a3b8" }} />
          </div>
          <button type="submit" disabled={savingProfile}
            style={{ padding: "10px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.7 : 1 }}>
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{ background: "#fff", border: B, borderRadius: 12, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>Change Password</h2>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Current Password", key: "currentPassword" },
            { label: "New Password", key: "newPassword" },
            { label: "Confirm New Password", key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
              <input type={showPw ? "text" : "password"} value={(pwForm as any)[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
            </div>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", cursor: "pointer" }}>
            <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} />
            Show passwords
          </label>
          <button type="submit" disabled={savingPw}
            style={{ padding: "10px 0", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: savingPw ? "not-allowed" : "pointer", opacity: savingPw ? 0.7 : 1 }}>
            {savingPw ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
