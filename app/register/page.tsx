"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page since registration is disabled
    router.push("/login");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 16, color: "#64748b" }}>Redirecting to login...</p>
      </div>
    </div>
  );
}
