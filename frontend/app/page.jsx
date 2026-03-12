"use client";
import { useState, useEffect, useRef } from "react";
import { api, saveAuth, loadAuth, clearAuth } from "../lib/api";

/* ── Design tokens ──────────────────────────────────────────────────────────*/
// White bg · near-black text · orange accent
const T = {
  bg:        "#ffffff",
  bgSoft:    "#fafafa",
  bgMuted:   "#f5f5f5",
  border:    "#e8e8e8",
  borderHov: "#d0d0d0",
  text:      "#0a0a0a",
  textSec:   "#404040",
  textMuted: "#888888",
  accent:    "#f97316",        // orange
  accentDark:"#ea6c0a",
  accentBg:  "#fff7ed",
  accentBorder:"#fed7aa",
  green:     "#16a34a",
  greenBg:   "#f0fdf4",
  red:       "#dc2626",
  redBg:     "#fef2f2",
  amber:     "#d97706",
  amberBg:   "#fffbeb",
};

/* ── SVG Icon ───────────────────────────────────────────────────────────────*/
const Icon = ({ d, size = 16, style = {}, strokeWidth = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...style }}>
    <path d={d} />
  </svg>
);

const I = {
  flask:    "M9 3h6M8 3v6l-4 9a1 1 0 0 0 .93 1.38h10.14A1 1 0 0 0 16 18L12 9V3",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  chat:     "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  book:     "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  plus:     "M12 5v14M5 12h14",
  trash:    "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  back:     "M19 12H5M12 19l-7-7 7-7",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  x:        "M18 6L6 18M6 6l12 12",
  check:    "M20 6L9 17l-5-5",
  menu:     "M3 12h18M3 6h18M3 18h18",
  close:    "M18 6L6 18M6 6l12 12",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  search:   "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm5.71-2.29 4 4",
  brain:    "M12 4.5C10 2.5 6 2.5 5 6c-1.5.5-3 2-3 4 0 1.5.8 3 2 3.5V15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5c1.2-.5 2-2 2-3.5 0-2-1.5-3.5-3-4C18 2.5 14 2.5 12 4.5z",
  globe:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0c-1.67 2.33-2.67 5-2.67 10S10.33 19.67 12 22m0-20c1.67 2.33 2.67 5 2.67 10S13.67 19.67 12 22M2.5 9h19M2.5 15h19",
  inbox:    "M22 12h-6l-2 3H10l-2-3H2M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6m20 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6",
  pen:      "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  robot:    "M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3zM9 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm4 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM9 11h6",
  clock:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 3",
  more:     "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
};

function Spinner({ size = 16, color = T.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: "spin .75s linear infinite", flexShrink: 0, color }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").replace(/```/g, "").trim())
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ── Shared styles ──────────────────────────────────────────────────────────*/
const inp = {
  width: "100%", background: T.bg,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  padding: "11px 14px", color: T.text, fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box",
  transition: "border-color .15s",
};
const lbl = {
  display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.08em",
  color: T.textMuted, fontFamily: "'DM Sans', sans-serif",
};

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <input {...props} style={{ ...inp, ...props.style }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border} />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", size = "md", style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
    borderRadius: 8, transition: "all .15s", whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "7px 14px", fontSize: 12 },
    md: { padding: "11px 22px", fontSize: 13 },
    lg: { padding: "13px 28px", fontSize: 14 },
  };
  const variants = {
    primary:   { background: T.accent, color: "#fff", boxShadow: `0 4px 16px rgba(249,115,22,0.35)` },
    secondary: { background: T.bgMuted, color: T.text, border: `1.5px solid ${T.border}` },
    ghost:     { background: "transparent", color: T.textSec, border: `1.5px solid ${T.border}` },
    danger:    { background: T.redBg, color: T.red, border: `1.5px solid #fecaca` },
    teal:      { background: T.text, color: "#fff", boxShadow: `0 4px 16px rgba(0,0,0,0.2)` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Alert({ type = "error", children }) {
  if (!children) return null;
  const s = {
    error:   { bg: T.redBg,   border: "#fecaca", color: T.red   },
    success: { bg: T.greenBg, border: "#bbf7d0", color: T.green },
    warn:    { bg: T.amberBg, border: "#fde68a", color: T.amber },
  }[type];
  return (
    <div style={{ padding: "11px 16px", borderRadius: 8, fontSize: 13,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", ...style,
    }}>{children}</div>
  );
}

/* ── AUTH ───────────────────────────────────────────────────────────────────*/
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async () => {
    setErr(""); setOk("");
    if (mode === "login") {
      if (!email || !pass) { setErr("Please fill all fields"); return; }
      setBusy(true);
      try { const d = await api.login({ email, password: pass }); saveAuth(d.access_token, d.user); onLogin(d.user); }
      catch (e) { setErr(e.message); } finally { setBusy(false); }
    } else if (mode === "signup") {
      if (!name || !email || !pass) { setErr("Please fill all fields"); return; }
      setBusy(true);
      try { const d = await api.signup({ name, email, password: pass }); saveAuth(d.access_token, d.user); onLogin(d.user); }
      catch (e) { setErr(e.message); } finally { setBusy(false); }
    } else if (mode === "forgot") {
      if (!email) { setErr("Please enter your email"); return; }
      setBusy(true);
      try { await api.forgotPassword(email); setOk("Reset link sent! Check your inbox."); }
      catch (e) { setErr(e.message); } finally { setBusy(false); }
    }
  };

  const FEATURES = [
    [I.brain,  "Planning Agent — breaks topics into subtopics"],
    [I.search, "Research Agent — live web search via Tavily"],
    [I.zap,    "Analysis Agent — extracts key insights"],
    [I.pen,    "Writing Agent — composes full reports"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg}}
        .fade-in{animation:fadeIn .4s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .hover-row:hover{background:${T.bgSoft}!important}
        .nav-btn{transition:all .15s}
        .nav-btn:hover{background:${T.bgSoft}!important}
        .agent-pulse{animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        .dot-1{animation:bounce .8s .0s infinite alternate}
        .dot-2{animation:bounce .8s .15s infinite alternate}
        .dot-3{animation:bounce .8s .3s infinite alternate}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-5px)}}
        .status-dot{width:7px;height:7px;border-radius:50%;background:#16a34a;animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        input:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px rgba(249,115,22,0.1)!important}
        textarea:focus{border-color:${T.accent}!important;outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
        input::-ms-reveal,input::-ms-clear{display:none}
        input[type=password]::-webkit-contacts-auto-fill-button,input[type=password]::-webkit-credentials-auto-fill-button{visibility:hidden}
        .terminal{background:#0a0a0a;color:#e4e4e4;font-family:'DM Mono',monospace;font-size:11px}
        .section-card:hover{background:${T.bgSoft}!important}
        .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${T.accentBg};border:1px solid ${T.accentBorder};color:${T.accent};font-family:'DM Sans',sans-serif}
      `}</style>

      {/* Left panel */}
      <div style={{
        width: "45%", flexShrink: 0, background: T.bgSoft,
        borderRight: `1.5px solid ${T.border}`,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "52px 56px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: T.accent }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={I.flask} size={19} style={{ color: T.accent }} />
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, color: T.text, letterSpacing: "-0.02em" }}>
            Research<span style={{ color: T.accent }}>AI</span>
          </span>
        </div>

        {/* Hero */}
        <div>
          <div style={{ display: "inline-block", background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.06em", marginBottom: 20, textTransform: "uppercase" }}>
            Multi-Agent AI
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 44, lineHeight: 1.15, color: T.text, marginBottom: 18, letterSpacing: "-0.01em" }}>
            Research at the<br />speed of thought
          </h1>
          <p style={{ color: T.textSec, fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
            Four specialised AI agents collaborate to research, analyse, and write comprehensive reports on any topic.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
            {FEATURES.map(([path, txt]) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: 13, color: T.textSec, fontSize: 13 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Icon d={path} size={14} style={{ color: T.accent }} />
                </div>
                <span>{txt}</span>
              </div>
            ))}
          </div>
          
        </div>

        <div style={{ color: T.textMuted, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>Powered by Groq · Tavily · MongoDB</div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "52px 48px", background: T.bg }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fade-in">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 8, letterSpacing: "-0.01em" }}>
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
            </h2>
            <p style={{ color: T.textMuted, fontSize: 14 }}>
              {mode === "login" ? "Sign in to your workspace" : mode === "signup" ? "Free forever, no credit card" : "Enter your email to receive a reset link"}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Alert type="error">{err}</Alert>
            <Alert type="success">{ok}</Alert>

            {mode === "signup" && <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoFocus />}
            {(mode === "login" || mode === "signup" || mode === "forgot") && (
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus={mode !== "signup"} />
            )}
            {(mode === "login" || mode === "signup") && (
              <div>
                <label style={lbl}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={show ? "text" : "password"} value={pass}
                    onChange={e => setPass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    placeholder="••••••••"
                    style={{ ...inp, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.border} />
                  <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center" }}>
                    <Icon d={show ? I.eyeOff : I.eye} size={15} />
                  </button>
                </div>
                {mode === "login" && (
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <button onClick={() => { setMode("forgot"); setErr(""); setOk(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px", background: busy ? T.bgMuted : T.accent, border: "none", borderRadius: 8, color: busy ? T.textMuted : "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: busy ? "none" : `0 4px 18px rgba(249,115,22,0.35)`, transition: "all .15s" }}>
              {busy && <Spinner size={16} color={T.textMuted} />}
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>

            <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13 }}>
              {mode === "login" ? (
                <>No account?{" "}<button onClick={() => { setMode("signup"); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Sign up free</button></>
              ) : (
                <button onClick={() => { setMode("login"); setErr(""); setOk(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>← Back to sign in</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AGENTS ─────────────────────────────────────────────────────────────────*/
const AGENTS = [
  { icon: I.brain,  label: "Planning",    desc: "Breaking into subtopics", color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
  { icon: I.search, label: "Research",    desc: "Gathering information",   color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { icon: I.zap,    label: "Summarising", desc: "Extracting insights",     color: T.amber,   bg: T.amberBg, border: "#fde68a" },
  { icon: I.pen,    label: "Writing",     desc: "Composing report",        color: T.green,   bg: T.greenBg, border: "#bbf7d0" },
];

const SUGGESTIONS = ["Artificial Intelligence", "Quantum Computing", "CRISPR Gene Editing", "Climate Change", "Blockchain", "Space Colonisation"];

function ResearchPage() {
  const [topic, setTopic]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [step, setStep]       = useState(-1);
  const [logs, setLogs]       = useState([]);
  const [report, setReport]   = useState(null);
  const [viewing, setViewing] = useState(false);
  const [err, setErr]         = useState("");
  const logRef                = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs(p => [...p, { msg, type, t: new Date().toLocaleTimeString("en", { hour12: false }) }]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const generate = async () => {
    if (!topic.trim() || busy) return;
    setErr(""); setReport(null); setBusy(true); setLogs([]); setStep(0); setViewing(false);
    addLog(`Starting pipeline: "${topic}"`, "info");
    addLog("Agent 1 (Planning) running…", "agent");
    const timers = [
      setTimeout(() => { setStep(1); addLog("Agent 1 complete — subtopics ready", "ok"); addLog("Agent 2 (Research) running…", "agent"); }, 3500),
      setTimeout(() => { setStep(2); addLog("Agent 2 complete — research gathered", "ok"); addLog("Agent 3 (Summarisation) running…", "agent"); }, 10000),
      setTimeout(() => { setStep(3); addLog("Agent 3 complete — insights extracted", "ok"); addLog("Agent 4 (Report Writer) running…", "agent"); }, 16000),
    ];
    try {
      const data = await api.generateReport(topic);
      timers.forEach(clearTimeout);
      setStep(4);
      addLog("Agent 4 complete — report ready", "ok");
      addLog(`${data.word_count} words across ${data.sections?.length} sections`, "success");
      setReport(data);
    } catch (e) {
      timers.forEach(clearTimeout);
      setErr(e.message); addLog("Pipeline failed: " + e.message, "error");
    } finally { setBusy(false); }
  };

  if (viewing && report) return <ReportViewer report={report} onBack={() => setViewing(false)} />;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: T.bgSoft }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 4 }}>Research Generator</h2>
          <p style={{ color: T.textMuted, fontSize: 13 }}>4 agents research, analyse, and write a full report on any topic.</p>
        </div>

        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !busy && generate()}
              placeholder="Enter a research topic…" disabled={busy}
              style={{ ...inp, flex: 1, fontSize: 15, padding: "12px 16px" }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border} />
            <Btn onClick={generate} disabled={busy || !topic.trim()}>
              {busy ? <><Spinner size={14} color="#fff" /><span>Working…</span></> : <><Icon d={I.zap} size={14} /><span>Generate</span></>}
            </Btn>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setTopic(s)}
                style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "4px 13px", color: T.textSec, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentBg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; e.currentTarget.style.background = T.bg; }}>
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* Agent pipeline */}
        {(busy || step >= 0) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
              {AGENTS.map((a, i) => {
                const done = i < step, active = i === step && busy;
                return (
                  <div key={i} style={{ padding: "14px 12px", borderRadius: 10, textAlign: "center", background: done ? T.greenBg : active ? a.bg : T.bg, border: `1.5px solid ${done ? "#bbf7d0" : active ? a.border : T.border}`, opacity: done || active ? 1 : 0.35, transition: "all .4s ease" }} className={active ? "agent-pulse" : ""}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", background: done ? "#dcfce7" : active ? `${a.color}18` : T.bgMuted }}>
                      <Icon d={done ? I.check : a.icon} size={16} style={{ color: done ? T.green : active ? a.color : T.textMuted, strokeWidth: 2 }} />
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: done ? T.green : active ? a.color : T.textMuted, marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: active ? T.textSec : T.textMuted }}>{done ? "Complete" : active ? a.desc : "Queued"}</div>
                  </div>
                );
              })}
            </div>
            {/* Log terminal */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1.5px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                {["#ef4444", "#f59e0b", "#22c55e"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, marginLeft: 4 }}>pipeline · researchai</span>
                {busy && <Spinner size={11} style={{ marginLeft: "auto" }} color={T.accent} />}
              </div>
              <div ref={logRef} className="terminal" style={{ height: 140, overflowY: "auto", padding: "12px 16px" }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ color: l.type === "ok" || l.type === "success" ? "#4ade80" : l.type === "error" ? "#f87171" : l.type === "agent" ? "#fb923c" : "#a3a3a3", lineHeight: 1.8 }}>
                    <span style={{ color: "#525252", marginRight: 10, userSelect: "none" }}>{l.t}</span>
                    {l.type === "agent" && <span style={{ color: "#fb923c", marginRight: 6 }}>›</span>}
                    {l.msg}
                  </div>
                ))}
                {busy && <span style={{ color: "#fb923c" }}>▋</span>}
              </div>
            </div>
          </div>
        )}

        {err && <div style={{ marginBottom: 14 }}><Alert type="error">{err}</Alert></div>}

        {report && (
          <Card style={{ overflow: "hidden" }} className="fade-in">
            <div style={{ padding: "22px 26px", borderBottom: `1.5px solid ${T.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div className="status-dot" />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.green }}>Report Ready</span>
                </div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 10 }}>{report.topic}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {report.subtopics?.map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
                <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{report.word_count} words · {report.sections?.length} sections</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn variant="ghost" size="sm" onClick={() => api.downloadReport(report.id)}><Icon d={I.download} size={13} /><span>PDF</span></Btn>
                <Btn variant="teal" size="sm" onClick={() => setViewing(true)}>Read Report</Btn>
              </div>
            </div>
            {report.sections?.slice(0, 2).map((s, i) => (
              <div key={i} style={{ padding: "18px 26px", borderBottom: `1px solid ${T.bgMuted}`, background: T.bg }} className="section-card">
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.accent, marginBottom: 7 }}>{String(i + 1).padStart(2, "0")} · {s.title}</div>
                <p style={{ color: T.textSec, fontSize: 13, lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>{s.content}</p>
              </div>
            ))}
            <div style={{ padding: "14px 26px", textAlign: "center", background: T.bg }}>
              <button onClick={() => setViewing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                Read full report · {report.sections?.length} sections →
              </button>
            </div>
          </Card>
        )}

        {!busy && step < 0 && (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, margin: "0 auto 16px", background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Icon d={I.flask} size={28} style={{ color: T.accent }} />
            </div>
            <p style={{ color: T.textMuted, fontSize: 14 }}>Enter a topic above to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── REPORT VIEWER ──────────────────────────────────────────────────────────*/
function ReportViewer({ report, onBack }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: T.bgSoft }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }} className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Btn variant="ghost" size="sm" onClick={onBack}><Icon d={I.back} size={14} />Back</Btn>
          <div style={{ flex: 1 }} />
          <Btn variant="secondary" size="sm" onClick={() => api.downloadReport(report.id)}><Icon d={I.download} size={13} />Download PDF</Btn>
        </div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "32px 36px", borderBottom: `1.5px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div className="status-dot" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.green, fontFamily: "'DM Sans', sans-serif" }}>Research Report</span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 32, color: T.text, marginBottom: 14, letterSpacing: "-0.01em" }}>{report.topic}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {report.subtopics?.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
            <div style={{ color: T.textMuted, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
              {report.word_count} words · {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {report.sections?.map((s, i) => (
            <div key={i} style={{ padding: "24px 36px", borderBottom: `1px solid ${T.bgMuted}`, background: T.bg }} className="section-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.accent, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 5, padding: "2px 8px", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text }}>{s.title}</span>
              </div>
              <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.85, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap" }}>{s.content}</p>
            </div>
          ))}
          {report.references?.length > 0 && (
            <div style={{ padding: "22px 36px", background: T.bgSoft }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 10 }}>References</div>
              {report.references.map((r, i) => (
                <p key={i} style={{ color: T.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>[{i + 1}] {r}</p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ── SESSION ITEM ───────────────────────────────────────────────────────────*/
function SessionItem({ session: s, active, editing, editTitle, onOpen, onEditChange, onEditKeyDown, onEditBlur, onRename, onDelete }) {
  const rowRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={rowRef} onClick={onOpen}
      style={{ position: "relative", borderRadius: 7, marginBottom: 2, background: active ? T.accentBg : "transparent", border: `1.5px solid ${active ? T.accentBorder : "transparent"}`, transition: "all .15s", cursor: "pointer" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bgMuted; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 6px 9px 10px" }}>
        <Icon d={I.chat} size={13} style={{ color: active ? T.accent : T.textMuted, flexShrink: 0 }} />
        {editing ? (
          <input autoFocus value={editTitle} onChange={onEditChange} onKeyDown={onEditKeyDown} onBlur={onEditBlur}
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, fontSize: 12, border: `1.5px solid ${T.accent}`, borderRadius: 5, padding: "2px 7px", outline: "none", fontFamily: "'DM Sans', sans-serif", color: T.text, background: T.bg, minWidth: 0 }} />
        ) : (
          <span style={{ flex: 1, color: active ? T.accent : T.text, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 600 : 400 }}>{s.title}</span>
        )}
        <button onClick={handleMenuToggle}
          style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: open ? T.bgMuted : "transparent", border: "none", borderRadius: 5, cursor: "pointer", transition: "all .1s" }}
          onMouseEnter={e => e.currentTarget.style.background = T.bgMuted}
          onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={T.textMuted}>
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 155), background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden" }}>
          <button onClick={(e) => { setOpen(false); onRename(e); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.text, fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgSoft}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Icon d={I.edit} size={13} style={{ color: T.accent }} /> Rename
          </button>
          <div style={{ height: 1, background: T.border, margin: "0 10px" }} />
          <button onClick={() => { setOpen(false); onDelete(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.red, fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = T.redBg}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Icon d={I.trash} size={13} style={{ color: T.red }} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── CHAT ───────────────────────────────────────────────────────────────────*/
function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [editId, setEditId]     = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { api.getSessions().then(setSessions).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const openSession = async (id) => {
    try { const s = await api.getSession(id); setActiveId(id); setMsgs(s.messages || []); } catch {}
  };
  const newChat = () => { setActiveId(null); setMsgs([]); };

  const send = async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim(); setInput("");
    setMsgs(p => [...p, { role: "user", content: msg }]);
    setTyping(true);
    try {
      const res = await api.sendMessage({ session_id: activeId, message: msg });
      setMsgs(p => [...p, { role: "assistant", content: res.message }]);
      if (!activeId) {
        setActiveId(res.session_id);
        setSessions(p => [{ id: res.session_id, title: res.title || "New Chat", updated_at: new Date() }, ...p]);
      }
    } catch (e) {
      setMsgs(p => [...p, { role: "assistant", content: "Error: " + e.message }]);
    } finally { setTyping(false); }
  };

  const deleteSession = async (id) => {
    try { await api.deleteSession(id); setSessions(p => p.filter(s => s.id !== id)); if (activeId === id) newChat(); } catch {}
  };
  const startRename = (s, e) => { e.stopPropagation(); setEditId(s.id); setEditTitle(s.title); };
  const commitRename = (id) => {
    if (!editTitle.trim()) { setEditId(null); return; }
    setSessions(p => p.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s));
    setEditId(null);
  };

  const STARTERS = ["What is machine learning?", "Explain quantum entanglement", "How does CRISPR work?", "What causes climate change?"];

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: T.bg, borderRight: `1.5px solid ${T.border}` }}>
        <div style={{ padding: 12, borderBottom: `1px solid ${T.border}` }}>
          <button onClick={newChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, background: T.accent, border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <Icon d={I.plus} size={13} style={{ color: "#fff" }} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {loading && <p style={{ color: T.textMuted, fontSize: 12, textAlign: "center", padding: "20px 0" }}>Loading…</p>}
          {!loading && sessions.length === 0 && <p style={{ color: T.textMuted, fontSize: 12, textAlign: "center", padding: "20px 0" }}>No chats yet</p>}
          {sessions.map(s => (
            <SessionItem key={s.id} session={s} active={activeId === s.id} editing={editId === s.id} editTitle={editTitle}
              onOpen={() => editId !== s.id && openSession(s.id)}
              onEditChange={e => setEditTitle(e.target.value)}
              onEditKeyDown={e => { if (e.key === "Enter") commitRename(s.id); if (e.key === "Escape") setEditId(null); }}
              onEditBlur={() => commitRename(s.id)}
              onRename={e => startRename(s, e)}
              onDelete={() => deleteSession(s.id)} />
          ))}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
          <p style={{ color: T.textMuted, fontSize: 10, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>30-day session retention</p>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: T.bgSoft }}>
        {msgs.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ textAlign: "center", maxWidth: 440 }} className="fade-in">
              <div style={{ width: 60, height: 60, borderRadius: 14, margin: "0 auto 20px", background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <Icon d={I.robot} size={26} style={{ color: T.accent }} />
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 8 }}>Ask me anything</h3>
              <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Powered by Groq Llama 3.3 70B</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {STARTERS.map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    style={{ textAlign: "left", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "11px 14px", color: T.textSec, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}>
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 18, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={I.robot} size={15} style={{ color: T.accent }} />
                  </div>
                )}
                <div style={{ maxWidth: "72%", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "11px 16px", fontSize: 14, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap", background: m.role === "user" ? T.text : T.bg, border: m.role === "user" ? "none" : `1.5px solid ${T.border}`, color: m.role === "user" ? "#ffffff" : T.text, boxShadow: m.role === "user" ? "0 4px 14px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
                  {m.role === "assistant" ? stripMarkdown(m.content) : m.content}
                </div>
                {m.role === "user" && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: T.bgMuted, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={I.user} size={14} style={{ color: T.textSec }} />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={I.robot} size={15} style={{ color: T.accent }} />
                </div>
                <div style={{ borderRadius: "14px 14px 14px 4px", padding: "14px 18px", background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", gap: 5 }}>
                  {[1, 2, 3].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent }} className={`dot-${n}`} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        <div style={{ padding: "14px 20px", borderTop: `1.5px solid ${T.border}`, background: T.bg }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything…" disabled={typing}
              style={{ ...inp, flex: 1 }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border} />
            <button onClick={send} disabled={typing || !input.trim()}
              style={{ background: typing || !input.trim() ? T.bgMuted : T.accent, border: "none", borderRadius: 8, padding: "0 18px", cursor: typing || !input.trim() ? "not-allowed" : "pointer", color: typing || !input.trim() ? T.textMuted : "#fff", display: "flex", alignItems: "center", boxShadow: typing || !input.trim() ? "none" : `0 4px 14px rgba(249,115,22,0.35)`, transition: "all .15s" }}>
              {typing ? <Spinner size={17} color={T.textMuted} /> : <Icon d={I.send} size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HISTORY ────────────────────────────────────────────────────────────────*/
function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => { api.getHistory().then(setReports).catch(e => setErr(e.message)).finally(() => setLoading(false)); }, []);
  const openReport = async (id) => { try { setSelected(await api.getReport(id)); } catch (e) { setErr(e.message); } };
  const del = async (id, e) => { e.stopPropagation(); try { await api.deleteReport(id); setReports(p => p.filter(r => r.id !== id)); } catch (e) { setErr(e.message); } };

  if (selected) return <ReportViewer report={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: T.bgSoft }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 4 }}>History</h2>
          <p style={{ color: T.textMuted, fontSize: 13 }}>{reports.length} reports · 30-day retention</p>
        </div>
        {err && <div style={{ marginBottom: 14 }}><Alert type="error">{err}</Alert></div>}
        {loading && <div style={{ textAlign: "center", padding: "60px 0" }}><Spinner size={28} /><p style={{ color: T.textMuted, fontSize: 13, marginTop: 12 }}>Loading…</p></div>}
        {!loading && reports.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, margin: "0 auto 14px", background: T.bg, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={I.inbox} size={26} style={{ color: T.textMuted }} />
            </div>
            <p style={{ color: T.textMuted }}>No reports yet</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map(r => (
            <div key={r.id} onClick={() => r.status === "completed" && openReport(r.id)}
              style={{ padding: "18px 22px", borderRadius: 10, background: T.bg, border: `1.5px solid ${T.border}`, cursor: r.status === "completed" ? "pointer" : "default", transition: "all .15s" }}
              onMouseEnter={e => { if (r.status === "completed") e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: T.text, marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.topic}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: r.status === "completed" ? T.greenBg : r.status === "failed" ? T.redBg : T.amberBg, border: `1px solid ${r.status === "completed" ? "#bbf7d0" : r.status === "failed" ? "#fecaca" : "#fde68a"}`, color: r.status === "completed" ? T.green : r.status === "failed" ? T.red : T.amber }}>
                      {r.status === "completed" ? "Completed" : r.status === "failed" ? "Failed" : "Processing"}
                    </span>
                    <span style={{ color: T.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {r.word_count > 0 && <span style={{ color: T.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{r.word_count}w</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  {r.status === "completed" && (
                    <button onClick={e => { e.stopPropagation(); api.downloadReport(r.id); }} style={{ padding: "7px 10px", borderRadius: 7, cursor: "pointer", background: T.bg, border: `1.5px solid ${T.border}`, color: T.textSec, display: "flex", alignItems: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}>
                      <Icon d={I.download} size={13} />
                    </button>
                  )}
                  <button onClick={e => del(r.id, e)} style={{ padding: "7px 10px", borderRadius: 7, cursor: "pointer", background: T.redBg, border: `1px solid #fecaca`, color: T.red, display: "flex", alignItems: "center" }}>
                    <Icon d={I.trash} size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PASSWORD INPUT ─────────────────────────────────────────────────────────*/
// Must be defined outside ProfilePage — if defined inside, React recreates it
// as a new component on every render, causing inputs to lose focus after each keystroke.
function PwInput({ label, val, setVal, show, setShow, placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder={placeholder || "••••••••"}
          style={{ ...inp, paddingRight: 44 }}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
        />
        <button
          onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center" }}>
          <Icon d={show ? I.eyeOff : I.eye} size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── PROFILE ────────────────────────────────────────────────────────────────*/
function ProfilePage({ user, onUserUpdate }) {
  // Profile section state
  const [name,      setName]      = useState(user.name);
  const [email,     setEmail]     = useState(user.email);
  const [profBusy,  setProfBusy]  = useState(false);
  const [profErr,   setProfErr]   = useState("");
  const [profOk,    setProfOk]    = useState("");

  // Password section state
  const [oldPw,     setOldPw]     = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwBusy,    setPwBusy]    = useState(false);
  const [pwErr,     setPwErr]     = useState("");
  const [pwOk,      setPwOk]      = useState("");

  useEffect(() => { setName(user.name); setEmail(user.email); }, [user]);

  const saveProfile = async () => {
    setProfErr(""); setProfOk("");
    if (!name.trim())  { setProfErr("Name cannot be empty"); return; }
    if (!email.trim()) { setProfErr("Email cannot be empty"); return; }
    setProfBusy(true);
    try {
      const res = await api.updateProfile({ name: name.trim(), email: email.trim() });
      const u = { ...user, name: res.name, email: res.email };
      localStorage.setItem("rai_user", JSON.stringify(u));
      onUserUpdate(u);
      setName(res.name);
      setEmail(res.email);
      setProfOk(res.message);
    } catch (e) { setProfErr(e.message); } finally { setProfBusy(false); }
  };

  const changePw = async () => {
    setPwErr(""); setPwOk("");
    if (!oldPw)           { setPwErr("Please enter your current password"); return; }
    if (!newPw)           { setPwErr("Please enter a new password"); return; }
    if (newPw.length < 6) { setPwErr("New password must be at least 6 characters"); return; }
    if (oldPw === newPw)  { setPwErr("New password must be different from current"); return; }
    setPwBusy(true);
    try {
      const res = await api.changePassword({ old_password: oldPw, new_password: newPw });
      setPwOk(res.message || "Password changed successfully!");
      setOldPw(""); setNewPw("");
    } catch (e) { setPwErr(e.message); } finally { setPwBusy(false); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: T.bgSoft }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 24 }}>Profile</h2>

        {/* Avatar card */}
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, flexShrink: 0, background: T.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: T.accent, fontFamily: "'DM Sans', sans-serif" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 2 }}>{user.name}</div>
              <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{user.email}</div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: user.is_verified ? T.greenBg : T.amberBg, border: `1px solid ${user.is_verified ? "#bbf7d0" : "#fde68a"}`, color: user.is_verified ? T.green : T.amber }}>
                {user.is_verified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit profile */}
        <Card style={{ padding: 24, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 16 }}>Edit Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {profErr && <Alert type="error">{profErr}</Alert>}
            {profOk  && <Alert type="success">{profOk}</Alert>}
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <div>
              <Btn onClick={saveProfile} disabled={profBusy} variant="primary" size="sm" style={{ width: "fit-content" }}>
                {profBusy ? <><Spinner size={13} color="#fff" /> Saving…</> : "Save Changes"}
              </Btn>
            </div>
          </div>
        </Card>

        {/* Change password */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 16 }}>Change Password</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pwErr && <Alert type="error">{pwErr}</Alert>}
            {pwOk  && <Alert type="success">{pwOk}</Alert>}
            <PwInput label="Current Password" val={oldPw} setVal={setOldPw} show={showOld} setShow={setShowOld} />
            <PwInput label="New Password" val={newPw} setVal={setNewPw} show={showNew} setShow={setShowNew} placeholder="Minimum 6 characters" />
            {newPw.length > 0 && newPw.length < 6 && (
              <p style={{ color: T.red, fontSize: 11, marginTop: -8, fontFamily: "'DM Sans', sans-serif" }}>At least 6 characters required</p>
            )}
            <div>
              <Btn onClick={changePw} disabled={pwBusy || !oldPw || !newPw} variant="secondary" size="sm" style={{ width: "fit-content" }}>
                {pwBusy ? <><Spinner size={13} color={T.text} /> Updating…</> : "Update Password"}
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── SHELL ──────────────────────────────────────────────────────────────────*/
const NAV = [
  { id: "research", label: "Research", icon: I.flask },
  { id: "chat",     label: "Chat",     icon: I.chat  },
  { id: "history",  label: "History",  icon: I.book  },
  { id: "profile",  label: "Profile",  icon: I.user  },
];

function Shell({ user, onLogout, onUserUpdate }) {
  const [page, setPage]       = useState("research");
  const [sidebar, setSidebar] = useState(true);

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: T.bgSoft }}>
      {/* Sidebar */}
      <div style={{ width: sidebar ? 220 : 56, flexShrink: 0, display: "flex", flexDirection: "column", background: T.bg, borderRight: `1.5px solid ${T.border}`, transition: "width .2s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden", position: "relative" }}>
        {/* Orange top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.accent }} />

        <div style={{ height: 58, display: "flex", alignItems: "center", justifyContent: sidebar ? "space-between" : "center", padding: sidebar ? "0 14px" : "0", borderBottom: `1px solid ${T.border}`, flexShrink: 0, marginTop: 2 }}>
          {sidebar && (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={I.flask} size={15} style={{ color: T.accent }} />
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: T.text }}>Research<span style={{ color: T.accent }}>AI</span></div>
                <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace" }}>MULTI-AGENT</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebar(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 5, display: "flex" }}>
            <Icon d={sidebar ? I.close : I.menu} size={14} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebar ? 10 : 0, justifyContent: sidebar ? "flex-start" : "center", padding: sidebar ? "10px 12px" : "13px 0", borderRadius: 8, marginBottom: 2, background: page === n.id ? T.accentBg : "transparent", border: `1.5px solid ${page === n.id ? T.accentBorder : "transparent"}`, color: page === n.id ? T.accent : T.textSec, fontWeight: page === n.id ? 700 : 500, fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = T.bgMuted; }}
              onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = "transparent"; }}>
              <Icon d={n.icon} size={15} style={{ color: page === n.id ? T.accent : T.textMuted }} />
              {sidebar && <span>{n.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "8px 8px 12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {sidebar && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: T.bgSoft, border: `1px solid ${T.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: T.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 12, color: T.accent }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ color: T.textMuted, fontSize: 10, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={onLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebar ? 9 : 0, justifyContent: sidebar ? "flex-start" : "center", padding: sidebar ? "9px 12px" : "12px 0", borderRadius: 8, background: "transparent", border: "none", color: T.red, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <Icon d={I.logout} size={14} style={{ color: T.red }} />
            {sidebar && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ height: 58, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: T.bg, borderBottom: `1.5px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>
              {{ research: "Research Generator", chat: "AI Chat", history: "History", profile: "Profile" }[page]}
            </span>
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace", background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, letterSpacing: "0.04em" }}>
              Llama 3.3 · 70B
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div className="status-dot" />
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: T.green, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>LIVE</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {page === "research" && <ResearchPage />}
          {page === "chat"     && <ChatPage />}
          {page === "history"  && <HistoryPage />}
          {page === "profile"  && <ProfilePage user={user} onUserUpdate={onUserUpdate} />}
        </div>
      </div>
    </div>
  );
}

/* ── ROOT ───────────────────────────────────────────────────────────────────*/
export default function Home() {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { const s = loadAuth(); if (s) setUser(s.user); setReady(true); }, []);

  if (!ready) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <Spinner size={32} />
    </div>
  );
  if (!user) return <AuthScreen onLogin={u => setUser(u)} />;
  return <Shell user={user} onLogout={() => { clearAuth(); setUser(null); }} onUserUpdate={setUser} />;
}