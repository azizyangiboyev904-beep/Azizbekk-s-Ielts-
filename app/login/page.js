"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../theme.css";

function LoginForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      router.push(params.get("next") || "/");
    } else {
      setErr(true);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="shell-brand" style={{ marginBottom: 20 }}>
          <div className="brand-mark">✓</div>
          <div>
            <div className="topbar-title">IELTS Pro</div>
            <div className="topbar-sub">Private access</div>
          </div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
          Passcode
        </label>
        <input
          className="input"
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your passcode"
        />
        {err && (
          <div style={{ color: "var(--bad)", fontSize: 13, marginTop: 10 }}>
            Wrong passcode. Try again.
          </div>
        )}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
          Enter
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
