"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const B = "1px solid rgba(0,0,0,0.08)";

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => null as HTMLInputElement | null);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const arr = value.padEnd(6, " ").split("");
    arr[i] = v.slice(-1) || " ";
    onChange(arr.join("").trimEnd());
    if (v && i < 5) (refs[i + 1] as any)?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) (refs[i - 1] as any)?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {Array(6).fill("").map((_, i) => (
        <input key={i} ref={el => { refs[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={value[i]?.trim() || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          style={{ width: 48, height: 52, textAlign: "center", fontSize: 20, fontWeight: 600, border: B, borderRadius: 10, outline: "none", background: "#fafafa", transition: "border-color 150ms" }}
          onFocus={e => (e.target.style.borderColor = "#6366f1")}
          onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.08)")} />
      ))}
    </div>
  );
}

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.replace(/\s/g, "").length !== 6) { setMessage("Enter a valid 6-digit code"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setMessage("Email verified! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "Verification failed");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.success ? "New code sent to your email!" : data.error || "Failed to resend");
      setIsSuccess(data.success);
    } catch {
      setMessage("Failed to resend OTP");
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
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, background: "#eff6ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.3px" }}>Verify your email</h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              {email ? <>Code sent to <strong>{email}</strong></> : "Enter your verification code"}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <OTPInput value={otp} onChange={setOtp} />

            {message && (
              <div style={{ background: isSuccess ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: isSuccess ? "#16a34a" : "#dc2626", textAlign: "center" }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 0", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>Didn't receive the code?</p>
            <button onClick={handleResend}
              style={{ fontSize: 13, color: "#6366f1", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Resend code
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 16 }}>
            <Link href="/login" style={{ color: "#6366f1", textDecoration: "none" }}>← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
