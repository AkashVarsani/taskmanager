"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const B = "1px solid rgba(0,0,0,0.08)";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setMessage("Reset code sent! Redirecting...");
        setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Error sending reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 50%, #f0fdf4 100%)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>TaskFlow</span>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: B, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.3px" }}>Forgot password?</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>We'll send a reset code to your email</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: B, fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")}
                onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
            </div>

            {message && (
              <div style={{ background: isSuccess ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: isSuccess ? "#16a34a" : "#dc2626" }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 0", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20 }}>
            <Link href="/login" style={{ color: "#6366f1", textDecoration: "none" }}>← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
