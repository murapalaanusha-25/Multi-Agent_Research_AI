"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const Icon = ({ d, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...style }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  flask:  "M9 3h6M8 3v6l-4 9a1 1 0 0 0 .93 1.38h10.14A1 1 0 0 0 16 18L12 9V3",
  eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  check:  "M20 6L9 17l-5-5",
  back:   "M19 12H5M12 19l-7-7 7-7",
  lock:   "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
};

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24"
      style={{ animation: "spin .75s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" fill="none" stroke="white"
        strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

const inp = {
  width: "100%", background: "#ffffff", border: "1px solid #e5e0f8",
  borderRadius: 10, padding: "12px 14px", color: "#111827", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
  boxSizing: "border-box", transition: "border-color .2s",
};
const lbl = {
  display: "block", marginBottom: 7, fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#7c3aed", fontFamily: "'Sora', sans-serif",
};

function ResetForm() {
  const params = useSearchParams();

  // Extract token — handle Gmail link wrapping / URL encoding
  const [token, setToken] = useState("");
  useEffect(() => {
    // Try standard ?token= param first
    let t = params.get("token") || "";
    // Gmail sometimes wraps URLs: the real URL becomes a query param of Google's redirect
    if (!t) {
      const fullUrl = window.location.href;
      const match = fullUrl.match(/[?&]token=([^&]+)/);
      if (match) t = match[1];
    }
    // Decode in case of URL encoding
    try { t = decodeURIComponent(t); } catch {}
    setToken(t);
    if (t) console.log("[ResetPage] Token found, length:", t.length);
    else console.warn("[ResetPage] No token found in URL:", window.location.href);
  }, [params]);

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [err,       setErr]       = useState("");
  const [ok,        setOk]        = useState("");

  const submit = async () => {
    setErr(""); setOk("");
    if (!token)              { setErr("No reset token found. Please use the link from your email exactly as sent."); return; }
    if (!password)           { setErr("Please enter a new password."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    setBusy(true);
    try {
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setOk("Password updated successfully! Redirecting to sign in…");
      setTimeout(() => { window.location.href = "/"; }, 2500);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f8f7ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(109,40,217,0.35)" }}>
              <Icon d={ICONS.flask} size={21} style={{ color: "white" }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, color: "#111827" }}>
              Research<span style={{ color: "#7c3aed" }}>AI</span>
            </span>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 26, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Set new password
          </h1>
          <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
            Enter a new password for your account
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#ffffff", border: "1px solid #ede9fe", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "0 4px 24px rgba(109,40,217,0.08)" }}>

          {/* Success state */}
          {ok && (
            <div style={{ padding: 20, borderRadius: 12, background: "#f0fdf9", border: "1px solid #a7f3d0", marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={ICONS.check} size={14} style={{ color: "white", strokeWidth: 2.5 }} />
                </div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#0f766e" }}>Password Updated!</span>
              </div>
              <p style={{ color: "#0f766e", fontSize: 13, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                Your password has been changed. You can now sign in with your new password.
              </p>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", color: "white", padding: "10px 20px", borderRadius: 9, textDecoration: "none", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 14px rgba(109,40,217,0.3)" }}>
                Go to Sign In
              </a>
            </div>
          )}

          {!ok && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* No token warning */}
              {!token && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                  <strong>No reset token found.</strong> Please click the button in your email — do not copy and paste only part of the link.
                </div>
              )}

              {/* Error */}
              {err && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fff1f3", border: "1px solid #fecdd3", color: "#be123c", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                  {err}
                </div>
              )}

              {/* New password */}
              <div>
                <label style={lbl}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    style={{ ...inp, paddingRight: 46 }}
                    disabled={!token} />
                  <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 0 }}>
                    <Icon d={showPw ? ICONS.eyeOff : ICONS.eye} size={16} />
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label style={lbl}>Confirm Password</label>
                <input type={showPw ? "text" : "password"} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder="Re-enter new password"
                  disabled={!token}
                  style={{ ...inp, borderColor: confirm && confirm !== password ? "#fecdd3" : confirm && confirm === password ? "#a7f3d0" : "#e5e0f8" }} />
                {confirm && confirm !== password && <p style={{ color: "#be123c", fontSize: 11, marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>Passwords do not match</p>}
                {confirm && confirm === password  && <p style={{ color: "#0f766e", fontSize: 11, marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>Passwords match</p>}
              </div>

              {/* Submit */}
              <button
                onClick={submit}
                disabled={busy || !token || !password || password !== confirm}
                style={{
                  width: "100%", padding: "13px",
                  background: busy || !token || !password || password !== confirm
                    ? "#f3f0ff"
                    : "linear-gradient(135deg,#6d28d9,#8b5cf6)",
                  border: "none", borderRadius: 10,
                  color: busy || !token || !password || password !== confirm ? "#c4b5fd" : "white",
                  fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
                  cursor: busy || !token || !password || password !== confirm ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: busy ? "none" : "0 4px 20px rgba(109,40,217,0.25)",
                  transition: "all .2s",
                }}>
                {busy ? <><Spinner /> Resetting…</> : <><Icon d={ICONS.lock} size={15} style={{ color: "inherit" }} /> Reset Password</>}
              </button>

              <div style={{ textAlign: "center" }}>
                <a href="/" style={{ color: "#7c3aed", fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "'Sora', sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon d={ICONS.back} size={13} style={{ color: "#7c3aed" }} />
                  Back to Sign In
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Debug info — remove in production */}
        {process.env.NODE_ENV === "development" && (
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>
            Token: {token ? `${token.slice(0, 12)}… (${token.length} chars)` : "NOT FOUND"}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f8f7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e5e0f8", borderTopColor: "#7c3aed", animation: "spin .75s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}