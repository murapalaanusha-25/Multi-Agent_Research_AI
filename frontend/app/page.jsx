"use client";
import { useState, useEffect, useRef } from "react";
import { api, saveAuth, loadAuth, clearAuth } from "../lib/api";

/* ── SVG Icon ───────────────────────────────────────────────────────────────*/
const Icon = ({ d, size = 16, style = {}, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, display:"block", ...style }}>
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
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  clock:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 3",
  more:     "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
};

function Spinner({ size = 16, color = "#7c3aed" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: "spin .75s linear infinite", flexShrink: 0, color }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}


/* ── Strip markdown formatting from text ───────────────────────────────────*/
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
  width: "100%", background: "#ffffff",
  border: "1px solid #e5e0f8", borderRadius: 10,
  padding: "11px 14px", color: "#111827", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box",
  transition: "border-color .2s, box-shadow .2s",
};
const lbl = {
  display: "block", marginBottom: 7, fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#7c3aed", fontFamily: "'Sora', sans-serif",
};

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <input {...props} style={{ ...inp, ...props.style }} />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", size = "md", style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    fontFamily: "'Sora', sans-serif", fontWeight: 600,
    borderRadius: 10, transition: "all .2s ease", whiteSpace: "nowrap",
  };
  const sizes = { sm: { padding: "7px 14px", fontSize: 12 }, md: { padding: "11px 22px", fontSize: 13 }, lg: { padding: "13px 28px", fontSize: 14 } };
  const variants = {
    primary:   { background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", color: "#fff", boxShadow: "0 4px 14px rgba(109,40,217,0.3)" },
    secondary: { background: "#f3f0ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
    ghost:     { background: "transparent", color: "#374151", border: "1px solid #e5e7eb" },
    danger:    { background: "#fff1f3", color: "#be123c", border: "1px solid #fecdd3" },
    teal:      { background: "linear-gradient(135deg,#0d9488,#14b8a6)", color: "#fff", boxShadow: "0 4px 14px rgba(13,148,136,0.25)" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      className="btn-lift">
      {children}
    </button>
  );
}

function Alert({ type = "error", children }) {
  if (!children) return null;
  const s = {
    error:   { bg: "#fff1f3", border: "#fecdd3", color: "#be123c" },
    success: { bg: "#f0fdf9", border: "#99f6e4", color: "#0f766e" },
    warn:    { bg: "#fffbeb", border: "#fde68a", color: "#b45309" },
  }[type];
  return (
    <div style={{ padding: "11px 16px", borderRadius: 10, fontSize: 13,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #ede9fe", borderRadius: 16,
      boxShadow: "0 1px 4px rgba(109,40,217,0.06), 0 8px 24px rgba(109,40,217,0.04)",
      ...style,
    }}>{children}</div>
  );
}

/* ── AUTH ───────────────────────────────────────────────────────────────────*/
function AuthScreen({ onLogin }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [show, setShow]         = useState(false);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState("");
  const [ok, setOk]             = useState("");

  const submit = async () => {
    setErr(""); setOk("");
    if (mode === "login") {
      if (!email || !pass) { setErr("Please fill all fields"); return; }
      setBusy(true);
      try {
        const d = await api.login({ email, password: pass });
        saveAuth(d.access_token, d.user); onLogin(d.user);
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    } else if (mode === "signup") {
      if (!name || !email || !pass) { setErr("Please fill all fields"); return; }
      setBusy(true);
      try {
        const d = await api.signup({ name, email, password: pass });
        saveAuth(d.access_token, d.user); onLogin(d.user);
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    } else if (mode === "forgot") {
      if (!email) { setErr("Please enter your email"); return; }
      setBusy(true);
      try {
        await api.forgotPassword(email);
        setOk("Reset link sent! Check your inbox and click the link to set a new password.");
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    }
  };

  const FEATURES = [
    [I.zap,    "Groq Llama 3.3 70B — ultra-fast"],
    [I.search, "Tavily live web search"],
    [I.book,   "Professional PDF export"],
    [I.chat,   "Persistent AI chat sessions"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7ff", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left branding panel */}
      <div style={{
        width: "44%", flexShrink: 0,
        background: "linear-gradient(145deg,#f3f0ff 0%,#faf9ff 100%)",
        borderRight: "1px solid #ede9fe",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 52px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, left: -60, width: 320, height: 320, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 260, height: 260, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle,rgba(13,148,136,0.1) 0%,transparent 70%)", filter: "blur(40px)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(109,40,217,0.35)" }}>
            <Icon d={I.flask} size={20} style={{ color: "white" }} />
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e1433" }}>
            Research<span style={{ color: "#7c3aed" }}>AI</span>
          </span>
        </div>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1.2, letterSpacing: "-0.03em", color: "#1e1433", marginBottom: 16 }}>
            Research at the<br />
            <span style={{ background: "linear-gradient(135deg,#7c3aed,#0d9488)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>speed of thought</span>
          </h1>
          <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Four AI agents collaborate to research, analyse, and write comprehensive reports on any topic.
          </p>
          {FEATURES.map(([path, txt]) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12, color: "#111827", fontSize: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={path} size={14} style={{ color: "#7c3aed" }} />
              </div>
              {txt}
            </div>
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 28 }}>
            {["Quantum Computing","Gene Editing","Neural Networks","Climate"].map(s => (
              <span key={s} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)", color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ color: "#6b7280", fontSize: 11, position: "relative", zIndex: 1 }}>Powered by Groq · Tavily · MongoDB</div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="fade-in">
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 26, color: "#111827", marginBottom: 6, letterSpacing: "-0.02em" }}>
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : mode === "forgot" ? "Forgot password" : "Welcome back"}
          </h2>
          <p style={{ color: "#374151", fontSize: 14, marginBottom: 28 }}>
            {mode === "login" ? "Sign in to your workspace" : mode === "signup" ? "Free forever, no credit card" : mode === "forgot" ? "Enter your email to receive a reset link" : "Sign in to your workspace"}
          </p>

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
                    style={{ ...inp, paddingRight: 44 }} />
                  <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
                    <Icon d={show ? I.eyeOff : I.eye} size={15} />
                  </button>
                </div>
                {mode === "login" && (
                  <div style={{ textAlign: "right", marginTop: 7 }}>
                    <button onClick={() => { setMode("forgot"); setErr(""); setOk(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}


            <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(109,40,217,0.3)", transition: "all .2s" }} className="btn-lift">
              {busy && <Spinner size={16} color="#fff" />}
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
            </button>

            <div style={{ textAlign: "center", color: "#374151", fontSize: 13 }}>
              {mode === "login" ? (
                <>No account?{" "}<button onClick={() => { setMode("signup"); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Sign up free</button></>
              ) : (
                <button onClick={() => { setMode("login"); setErr(""); setOk(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Back to sign in</button>
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
  { icon: I.brain,  label: "Planning",    desc: "Breaking into subtopics", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { icon: I.search, label: "Research",    desc: "Gathering information",   color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { icon: I.zap,    label: "Summarising", desc: "Extracting insights",     color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { icon: I.pen,    label: "Writing",     desc: "Composing report",        color: "#047857", bg: "#f0fdf4", border: "#a7f3d0" },
];

const SUGGESTIONS = ["Artificial Intelligence","Quantum Computing","CRISPR Gene Editing","Climate Change","Blockchain","Space Colonisation"];

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
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "#f8f7ff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", letterSpacing: "-0.02em", marginBottom: 4 }}>Research Generator</h2>
          <p style={{ color: "#374151", fontSize: 13 }}>4 agents research, analyse, and write a full report on any topic.</p>
        </div>

        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !busy && generate()}
              placeholder="Enter a research topic…" disabled={busy}
              style={{ ...inp, flex: 1, fontSize: 15, padding: "12px 16px" }} />
            <Btn onClick={generate} disabled={busy || !topic.trim()}>
              {busy ? <><Spinner size={14} color="#fff" /><span>Working…</span></> : <><Icon d={I.zap} size={14} /><span>Generate</span></>}
            </Btn>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setTopic(s)} style={{ background: "#f8f7ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "4px 13px", color: "#374151", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f3f0ff"; e.currentTarget.style.color = "#7c3aed"; e.currentTarget.style.borderColor = "#c4b5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f8f7ff"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#ede9fe"; }}>
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
                  <div key={i} style={{ padding: "14px 12px", borderRadius: 12, textAlign: "center", background: done ? "#f0fdf9" : active ? a.bg : "#fafafa", border: `1px solid ${done ? "#a7f3d0" : active ? a.border : "#f0eeff"}`, opacity: done || active ? 1 : 0.4, transition: "all .4s ease" }} className={active ? "agent-active" : ""}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", background: done ? "rgba(13,148,136,0.1)" : active ? `${a.color}18` : "#f3f0ff" }}>
                      <Icon d={done ? I.check : a.icon} size={16} style={{ color: done ? "#0d9488" : active ? a.color : "#c4b5fd", strokeWidth: 2 }} />
                    </div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 11, color: done ? "#0f766e" : active ? a.color : "#9ca3af", marginBottom: 3 }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: active ? "#374151" : "#9ca3af" }}>{done ? "Complete" : active ? a.desc : "Queued"}</div>
                  </div>
                );
              })}
            </div>

            {/* Log */}
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #ede9fe" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#f8f7ff", borderBottom: "1px solid #ede9fe" }}>
                {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#374151", marginLeft: 4 }}>pipeline · researchai</span>
                {busy && <Spinner size={11} style={{ marginLeft: "auto" }} />}
              </div>
              <div ref={logRef} className="terminal" style={{ height: 140, overflowY: "auto", padding: "12px 16px" }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ color: l.type === "ok" || l.type === "success" ? "#0f766e" : l.type === "error" ? "#be123c" : l.type === "agent" ? "#7c3aed" : "#374151", lineHeight: 1.8 }}>
                    <span style={{ color: "#6b7280", marginRight: 10, userSelect: "none" }}>{l.t}</span>
                    {l.type === "agent" && <span style={{ color: "#c4b5fd", marginRight: 6 }}>›</span>}
                    {l.msg}
                  </div>
                ))}
                {busy && <span style={{ color: "#c4b5fd" }} className="cursor-blink">|</span>}
              </div>
            </div>
          </div>
        )}

        {err && <div style={{ marginBottom: 14 }}><Alert type="error">{err}</Alert></div>}

        {report && (
          <Card style={{ overflow: "hidden" }} className="fade-in">
            <div style={{ padding: "22px 26px", background: "linear-gradient(135deg,#f5f3ff,#f8f7ff)", borderBottom: "1px solid #ede9fe", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div className="status-dot" />
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0d9488" }}>Report Ready</span>
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 10 }}>{report.topic}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {report.subtopics?.map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
                <div style={{ color: "#374151", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{report.word_count} words · {report.sections?.length} sections</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn variant="ghost" size="sm" onClick={() => api.downloadReport(report.id)}><Icon d={I.download} size={13} /><span>PDF</span></Btn>
                <Btn variant="teal" size="sm" onClick={() => setViewing(true)}>Read Report</Btn>
              </div>
            </div>
            {report.sections?.slice(0, 2).map((s, i) => (
              <div key={i} style={{ padding: "18px 26px", borderBottom: "1px solid #f3f0ff", background: "#ffffff" }} className="section-card">
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7c3aed", marginBottom: 8 }}>{String(i + 1).padStart(2, "0")} · {s.title}</div>
                <p style={{ color: "#111827", fontSize: 13, lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>{s.content}</p>
              </div>
            ))}
            <div style={{ padding: "14px 26px", textAlign: "center", background: "#ffffff" }}>
              <button onClick={() => setViewing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
                Read full report · {report.sections?.length} sections
              </button>
            </div>
          </Card>
        )}

        {!busy && step < 0 && (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px", background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={I.flask} size={30} style={{ color: "#a78bfa" }} />
            </div>
            <p style={{ color: "#374151", fontSize: 14 }}>Enter a topic above to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── REPORT VIEWER ──────────────────────────────────────────────────────────*/
function ReportViewer({ report, onBack }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "#f8f7ff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }} className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Btn variant="ghost" size="sm" onClick={onBack}><Icon d={I.back} size={14} />Back</Btn>
          <div style={{ flex: 1 }} />
          <Btn variant="secondary" size="sm" onClick={() => api.downloadReport(report.id)}><Icon d={I.download} size={13} />Download PDF</Btn>
        </div>
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", background: "linear-gradient(135deg,#f5f3ff,#f0fdf9,#ffffff)", borderBottom: "1px solid #ede9fe" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div className="status-dot" />
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0d9488" }}>Research Report</span>
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: "#111827", letterSpacing: "-0.02em", marginBottom: 12 }}>{report.topic}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {report.subtopics?.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
            <div style={{ color: "#374151", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
              {report.word_count} words · {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {report.sections?.map((s, i) => (
            <div key={i} style={{ padding: "24px 32px", borderBottom: "1px solid #faf9ff", background: "#ffffff" }} className="section-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 6, padding: "2px 8px" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827" }}>{s.title}</span>
              </div>
              <p style={{ color: "#111827", fontSize: 14, lineHeight: 1.85, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap" }}>{s.content}</p>
            </div>
          ))}
          {report.references?.length > 0 && (
            <div style={{ padding: "22px 32px", background: "#faf9ff" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 10 }}>References</div>
              {report.references.map((r, i) => (
                <p key={i} style={{ color: "#374151", fontSize: 12, fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>[{i + 1}] {r}</p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


/* ── Session Item Component ─────────────────────────────────────────────────*/
function SessionItem({ session: s, active, editing, editTitle, onOpen, onEditChange, onEditKeyDown, onEditBlur, onRename, onDelete }) {
  const rowRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => setOpen(false);
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

  const menuOpen = open;

  return (
    <div
      ref={rowRef}
      onClick={onOpen}
      style={{
        position: "relative", borderRadius: 9, marginBottom: 3,
        background: active ? "#f5f3ff" : "transparent",
        border: `1px solid ${active ? "#ddd6fe" : "transparent"}`,
        transition: "background .15s, border-color .15s",
        cursor: "pointer",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#faf9ff"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 6px 9px 11px" }}>
        <Icon d={I.chat} size={13} style={{ color: active ? "#7c3aed" : "#9ca3af", flexShrink: 0 }} />

        {editing ? (
          <input autoFocus value={editTitle}
            onChange={onEditChange} onKeyDown={onEditKeyDown} onBlur={onEditBlur}
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, fontSize: 12, border: "1px solid #c4b5fd", borderRadius: 6, padding: "2px 7px", outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#111827", background: "#fff", minWidth: 0 }} />
        ) : (
          <span style={{ flex: 1, color: active ? "#6d28d9" : "#111827", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{s.title}</span>
        )}

        <button onClick={handleMenuToggle} title="Options"
          style={{ flexShrink: 0, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: menuOpen ? "#ede9fe" : "transparent", border: `1px solid ${menuOpen ? "#ddd6fe" : "transparent"}`, borderRadius: 6, cursor: "pointer", transition: "all .1s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#ddd6fe"; }}
          onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280">
            <circle cx="12" cy="5"  r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>
      </div>

      {/* Fixed-position dropdown — renders outside overflow:hidden containers */}
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 160), background: "#ffffff", border: "1px solid #ede9fe", borderRadius: 10, boxShadow: "0 8px 28px rgba(109,40,217,0.18)", zIndex: 9999, overflow: "hidden" }}>
          <button onClick={(e) => { setOpen(false); onRename(e); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Icon d={I.edit} size={14} style={{ color: "#7c3aed" }} /> Rename
          </button>
          <div style={{ height: 1, background: "#f3f0ff", margin: "0 10px" }} />
          <button onClick={() => { setOpen(false); onDelete(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#be123c", fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff1f3"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Icon d={I.trash} size={14} style={{ color: "#be123c" }} /> Delete Chat
          </button>
        </div>
      )}
    </div>
  );
}

/* ── CHAT ───────────────────────────────────────────────────────────────────*/
function ChatPage() {
  const [sessions, setSessions]   = useState([]);
  const [activeId, setActiveId]   = useState(null);
  const [msgs, setMsgs]           = useState([]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [editId, setEditId]       = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const bottomRef                 = useRef(null);

  useEffect(() => {
    api.getSessions().then(setSessions).catch(() => {}).finally(() => setLoading(false));
  }, []);
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
    try {
      await api.deleteSession(id);
      setSessions(p => p.filter(s => s.id !== id));
      if (activeId === id) newChat();
    } catch {}
  };

  const startRename = (s, e) => {
    e.stopPropagation();
    setEditId(s.id); setEditTitle(s.title);
  };

  const commitRename = async (id) => {
    if (!editTitle.trim()) { setEditId(null); return; }
    setSessions(p => p.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s));
    setEditId(null);
    // Optional: persist to backend if you add a rename endpoint later
  };

  const STARTERS = ["What is machine learning?","Explain quantum entanglement","How does CRISPR work?","What causes climate change?"];

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

      {/* Sessions sidebar */}
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff", borderRight: "1px solid #f0eeff", position: "relative" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #f0eeff" }}>
          <button onClick={newChat} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 9, background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#6d28d9", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all .15s" }}>
            <Icon d={I.plus} size={13} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {loading && <p style={{ color: "#374151", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Loading…</p>}
          {!loading && sessions.length === 0 && <p style={{ color: "#374151", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No chats yet</p>}
          {sessions.map(s => (
            <SessionItem
              key={s.id}
              session={s}
              active={activeId === s.id}
              editing={editId === s.id}
              editTitle={editTitle}
              onOpen={() => editId !== s.id && openSession(s.id)}
              onEditChange={e => setEditTitle(e.target.value)}
              onEditKeyDown={e => { if (e.key === "Enter") commitRename(s.id); if (e.key === "Escape") setEditId(null); }}
              onEditBlur={() => commitRename(s.id)}
              onRename={e => startRename(s, e)}
              onDelete={() => deleteSession(s.id)}
            />
          ))}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #f0eeff" }}>
          <p style={{ color: "#374151", fontSize: 10, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>30-day session retention</p>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f8f7ff" }}>
        {msgs.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ textAlign: "center", maxWidth: 460 }} className="fade-in">
              <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px", background: "linear-gradient(135deg,#f5f3ff,#f0fdf9)", border: "1px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.08)" }}>
                <Icon d={I.robot} size={28} style={{ color: "#7c3aed" }} />
              </div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: "#111827", marginBottom: 8 }}>Ask me anything</h3>
              <p style={{ color: "#374151", fontSize: 13, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>Powered by Groq Llama 3.3 70B</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {STARTERS.map(q => (
                  <button key={q} onClick={() => setInput(q)} style={{ textAlign: "left", background: "#ffffff", border: "1px solid #ede9fe", borderRadius: 10, padding: "11px 14px", color: "#374151", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s", boxShadow: "0 1px 4px rgba(124,58,237,0.04)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.color = "#6d28d9"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#ede9fe"; e.currentTarget.style.color = "#374151"; }}>
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,#f5f3ff,#f0fdf9)", border: "1px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(124,58,237,0.08)" }}>
                    <Icon d={I.robot} size={16} style={{ color: "#7c3aed" }} />
                  </div>
                )}
                <div style={{ maxWidth: "72%", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "12px 16px", fontSize: 14, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap", background: m.role === "user" ? "linear-gradient(135deg,#6d28d9,#8b5cf6)" : "#ffffff", border: m.role === "user" ? "none" : "1px solid #ede9fe", color: m.role === "user" ? "#ffffff" : "#111827", boxShadow: m.role === "user" ? "0 4px 14px rgba(109,40,217,0.25)" : "0 1px 4px rgba(124,58,237,0.05)" }}>
                  {m.role === "assistant" ? stripMarkdown(m.content) : m.content}
                </div>
                {m.role === "user" && (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "#f5f3ff", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon d={I.user} size={15} style={{ color: "#7c3aed" }} />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#f5f3ff,#f0fdf9)", border: "1px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={I.robot} size={16} style={{ color: "#7c3aed" }} />
                </div>
                <div style={{ borderRadius: "16px 16px 16px 4px", padding: "14px 18px", background: "#ffffff", border: "1px solid #ede9fe", display: "flex", alignItems: "center", gap: 5 }}>
                  {[1,2,3].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: "#c4b5fd" }} className={`dot-${n}`} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div style={{ padding: "14px 20px", borderTop: "1px solid #f0eeff", background: "#ffffff" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything…" disabled={typing}
              style={{ ...inp, flex: 1 }} />
            <button onClick={send} disabled={typing || !input.trim()} style={{ background: typing || !input.trim() ? "#f3f0ff" : "linear-gradient(135deg,#6d28d9,#8b5cf6)", border: "none", borderRadius: 10, padding: "0 18px", cursor: typing || !input.trim() ? "not-allowed" : "pointer", color: typing || !input.trim() ? "#c4b5fd" : "white", display: "flex", alignItems: "center", boxShadow: typing || !input.trim() ? "none" : "0 4px 14px rgba(109,40,217,0.28)", transition: "all .2s" }}>
              {typing ? <Spinner size={17} /> : <Icon d={I.send} size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HISTORY ────────────────────────────────────────────────────────────────*/
function HistoryPage() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [err, setErr]           = useState("");

  useEffect(() => {
    api.getHistory().then(setReports).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, []);

  const openReport = async (id) => {
    try { setSelected(await api.getReport(id)); } catch (e) { setErr(e.message); }
  };
  const del = async (id, e) => {
    e.stopPropagation();
    try { await api.deleteReport(id); setReports(p => p.filter(r => r.id !== id)); } catch (e) { setErr(e.message); }
  };

  if (selected) return <ReportViewer report={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "#f8f7ff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 26 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", letterSpacing: "-0.02em", marginBottom: 4 }}>History</h2>
          <p style={{ color: "#374151", fontSize: 13 }}>{reports.length} reports · 30-day retention</p>
        </div>

        {err && <div style={{ marginBottom: 14 }}><Alert type="error">{err}</Alert></div>}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spinner size={28} style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ color: "#374151", fontSize: 13 }}>Loading…</p>
          </div>
        )}
        {!loading && reports.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, margin: "0 auto 14px", background: "#f5f3ff", border: "1px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={I.inbox} size={28} style={{ color: "#c4b5fd" }} />
            </div>
            <p style={{ color: "#374151" }}>No reports yet</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map(r => (
            <div key={r.id} onClick={() => r.status === "completed" && openReport(r.id)}
              style={{ padding: "18px 22px", borderRadius: 12, background: "#ffffff", border: "1px solid #f0eeff", cursor: r.status === "completed" ? "pointer" : "default", transition: "all .2s", boxShadow: "0 1px 4px rgba(124,58,237,0.04)" }}
              onMouseEnter={e => { if (r.status === "completed") { e.currentTarget.style.borderColor = "#ddd6fe"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.08)"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0eeff"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(124,58,237,0.04)"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.topic}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600, fontFamily: "'Sora', sans-serif", background: r.status === "completed" ? "#f0fdf9" : r.status === "failed" ? "#fff1f3" : "#fffbeb", border: `1px solid ${r.status === "completed" ? "#a7f3d0" : r.status === "failed" ? "#fecdd3" : "#fde68a"}`, color: r.status === "completed" ? "#0f766e" : r.status === "failed" ? "#be123c" : "#b45309" }}>
                      {r.status === "completed" ? "Completed" : r.status === "failed" ? "Failed" : "Processing"}
                    </span>
                    <span style={{ color: "#374151", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {r.word_count > 0 && <span style={{ color: "#374151", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{r.word_count}w</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  {r.status === "completed" && (
                    <button onClick={e => { e.stopPropagation(); api.downloadReport(r.id); }} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#7c3aed", display: "flex", alignItems: "center" }}>
                      <Icon d={I.download} size={13} />
                    </button>
                  )}
                  <button onClick={e => del(r.id, e)} style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", background: "#fff1f3", border: "1px solid #fecdd3", color: "#be123c", display: "flex", alignItems: "center" }}>
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

/* ── PROFILE ────────────────────────────────────────────────────────────────*/
function ProfilePage({ user, onUserUpdate }) {
  const [name, setName]   = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState("");
  const [ok, setOk]       = useState("");

  const saveProfile = async () => {
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.updateProfile({ name, email });
      const u = { ...user, name, email };
      localStorage.setItem("rai_user", JSON.stringify(u));
      onUserUpdate(u); setOk("Profile updated!");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const changePw = async () => {
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.changePassword({ old_password: oldPw, new_password: newPw });
      setOk("Password changed!"); setOldPw(""); setNewPw("");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: "#f8f7ff" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", letterSpacing: "-0.02em", marginBottom: 24 }}>Profile</h2>

        <Card style={{ padding: 22, marginBottom: 14, background: "linear-gradient(135deg,#f5f3ff,#f0fdf9)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "white", boxShadow: "0 6px 20px rgba(109,40,217,0.3)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 3 }}>{user.name}</div>
              <div style={{ color: "#374151", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 7 }}>{user.email}</div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", background: user.is_verified ? "#f0fdf9" : "#fffbeb", border: `1px solid ${user.is_verified ? "#a7f3d0" : "#fde68a"}`, color: user.is_verified ? "#0f766e" : "#b45309" }}>
                {user.is_verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </Card>

        {(err || ok) && <div style={{ marginBottom: 12 }}><Alert type={ok ? "success" : "error"}>{ok || err}</Alert></div>}

        <Card style={{ padding: 24, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 18 }}>Edit Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Btn onClick={saveProfile} disabled={busy} variant="primary" size="sm" style={{ width: "fit-content" }}>
              {busy && <Spinner size={13} color="#fff" />} Save Changes
            </Btn>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 18 }}>Change Password</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Current Password" type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="••••••••" />
            <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
            <Btn onClick={changePw} disabled={busy || !oldPw || !newPw} variant="secondary" size="sm" style={{ width: "fit-content" }}>
              Update Password
            </Btn>
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
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: "#f8f7ff" }}>

      {/* Sidebar */}
      <div style={{ width: sidebar ? 220 : 60, flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff", borderRight: "1px solid #f0eeff", transition: "width .2s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden", boxShadow: "2px 0 12px rgba(124,58,237,0.04)" }}>

        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: sidebar ? "space-between" : "center", padding: sidebar ? "0 16px" : "0", borderBottom: "1px solid #f0eeff", flexShrink: 0 }}>
          {sidebar && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}>
                <Icon d={I.flask} size={16} style={{ color: "white" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: "#111827" }}>Research<span style={{ color: "#7c3aed" }}>AI</span></div>
                <div style={{ color: "#6b7280", fontSize: 9, letterSpacing: "0.15em", fontFamily: "'DM Mono', monospace" }}>MULTI-AGENT</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebar(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 6, display: "flex", alignItems: "center" }}>
            <Icon d={sidebar ? I.close : I.menu} size={14} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebar ? 10 : 0, justifyContent: sidebar ? "flex-start" : "center", padding: sidebar ? "10px 12px" : "13px 0", borderRadius: 9, marginBottom: 2, background: page === n.id ? "#f5f3ff" : "transparent", border: `1px solid ${page === n.id ? "#e0d9ff" : "transparent"}`, color: page === n.id ? "#6d28d9" : "#374151", fontWeight: page === n.id ? 600 : 400, fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", transition: "all .15s" }} className={`nav-item ${page === n.id ? "active" : ""}`}>
              <Icon d={n.icon} size={15} style={{ color: page === n.id ? "#7c3aed" : "#6b7280" }} />
              {sidebar && <span>{n.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "8px 8px 12px", borderTop: "1px solid #f0eeff", flexShrink: 0 }}>
          {sidebar && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", marginBottom: 4, borderRadius: 9, background: "#faf9ff" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,#6d28d9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 11, color: "white" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#111827", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ color: "#6b7280", fontSize: 10, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebar ? 9 : 0, justifyContent: sidebar ? "flex-start" : "center", padding: sidebar ? "9px 12px" : "12px 0", borderRadius: 9, background: "transparent", border: "1px solid transparent", color: "#be123c", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff1f3"; e.currentTarget.style.borderColor = "#fecdd3"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            <Icon d={I.logout} size={14} style={{ color: "#be123c" }} />
            {sidebar && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ height: 60, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", background: "#ffffff", borderBottom: "1px solid #f0eeff", boxShadow: "0 1px 8px rgba(124,58,237,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "#111827" }}>
              {{ research: "Research Generator", chat: "AI Chat", history: "History", profile: "Profile" }[page]}
            </span>
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#7c3aed", letterSpacing: "0.05em" }}>
              Llama 3.3 · 70B
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div className="status-dot" />
            <span style={{ fontFamily: "'Sora', sans-serif", color: "#0d9488", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>LIVE</span>
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
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7ff" }}>
      <Spinner size={32} />
    </div>
  );
  if (!user) return <AuthScreen onLogin={u => setUser(u)} />;
  return <Shell user={user} onLogout={() => { clearAuth(); setUser(null); }} onUserUpdate={setUser} />;
}