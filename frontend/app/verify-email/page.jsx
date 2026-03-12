"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const T = {
  bg:           "#ffffff",
  bgSoft:       "#fafafa",
  border:       "#e8e8e8",
  text:         "#0a0a0a",
  textSec:      "#404040",
  textMuted:    "#888888",
  accent:       "#f97316",
  accentBg:     "#fff7ed",
  accentBorder: "#fed7aa",
  green:        "#16a34a",
  greenBg:      "#f0fdf4",
  red:          "#dc2626",
  redBg:        "#fef2f2",
  amber:        "#d97706",
  amberBg:      "#fffbeb",
};

const Icon = ({ d, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...style }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  flask:  "M9 3h6M8 3v6l-4 9a1 1 0 0 0 .93 1.38h10.14A1 1 0 0 0 16 18L12 9V3",
  check:  "M20 6L9 17l-5-5",
  x:      "M18 6L6 18M6 6l12 12",
  mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5",
  back:   "M19 12H5M12 19l-7-7 7-7",
};

function Spinner() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24"
      style={{ animation: "spin .75s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" fill="none" stroke={T.accent}
        strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

function VerifyContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let token = params.get("token") || "";
    if (!token) {
      const fullUrl = window.location.href;
      const match = fullUrl.match(/[?&]token=([^&]+)/);
      if (match) token = match[1];
    }
    try { token = decodeURIComponent(token); } catch {}

    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please click the exact link from your email.");
      return;
    }

    fetch(`http://localhost:8000/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Verification failed");
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        setTimeout(() => { window.location.href = "/"; }, 3000);
      })
      .catch(e => {
        setStatus("error");
        setMessage(e.message);
      });
  }, [params]);

  return (
    <div style={{
      minHeight: "100vh", background: T.bgSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .4s ease}
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }} className="fade-in">

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ICONS.flask} size={18} style={{ color: T.accent }} />
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, color: T.text }}>
            Research<span style={{ color: T.accent }}>AI</span>
          </span>
        </div>

        {/* Card */}
        <div style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "36px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>

          {/* Loading */}
          {status === "loading" && (
            <div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <Spinner />
              </div>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 24, color: T.text, marginBottom: 10 }}>Verifying your email…</h2>
              <p style={{ color: T.textMuted, fontSize: 14 }}>Please wait a moment.</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.greenBg, border: `2px solid #bbf7d0`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Icon d={ICONS.check} size={26} style={{ color: T.green, strokeWidth: 2.5 }} />
              </div>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 10 }}>Email Verified!</h2>
              <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{message}</p>
              <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 20 }}>Redirecting to sign in in 3 seconds…</p>
              <a href="/" style={{ display: "inline-block", background: T.accent, color: "#fff", padding: "11px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 14px rgba(249,115,22,0.35)` }}>
                Go to Sign In
              </a>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.redBg, border: `2px solid #fecaca`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Icon d={ICONS.x} size={26} style={{ color: T.red, strokeWidth: 2.5 }} />
              </div>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 10 }}>Verification Failed</h2>
              <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{message}</p>
              <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 28 }}>
                The link may have expired or already been used. Links are valid for 24 hours.
              </p>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: T.accent, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <Icon d={ICONS.back} size={14} style={{ color: T.accent }} /> Back to Sign In
              </a>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: T.textMuted, fontSize: 12 }}>
          Need help? Contact support.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={32} height={32} viewBox="0 0 24 24" style={{ animation: "spin .75s linear infinite" }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <circle cx="12" cy="12" r="9" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
        </svg>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}