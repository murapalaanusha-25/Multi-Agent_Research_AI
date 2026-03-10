const BASE = "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rai_token");
}

async function req(method, path, body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const api = {
  signup:         (d) => req("POST", "/auth/signup",          d, false),
  login:          (d) => req("POST", "/auth/login",           d, false),
  verifyEmail:    (t) => req("POST", `/auth/verify-email?token=${t}`, null, false),
  forgotPassword:    (e) => req("POST", "/auth/forgot-password",     { email: e }, false),
  forgotPasswordDev: (e) => req("POST", "/auth/forgot-password-dev", { email: e }, false),
  directReset:       (d) => req("POST", "/auth/direct-reset",          d,           false),
  resetPassword:     (d) => req("POST", "/auth/reset-password",      d, false),

  getProfile:     ()  => req("GET",    "/user/profile"),
  updateProfile:  (d) => req("PUT",    "/user/update",          d),
  changePassword: (d) => req("POST",   "/user/change-password", d),
  deleteAccount:  ()  => req("DELETE", "/user/delete"),

  generateReport: (topic) => req("POST",   "/research/generate", { topic }),
  getHistory:     ()      => req("GET",    "/research/history"),
  getReport:      (id)    => req("GET",    `/research/${id}`),
  deleteReport:   (id)    => req("DELETE", `/research/${id}`),

  downloadReport: async (id) => {
    const t   = getToken();
    const res = await fetch(`${BASE}/research/${id}/download`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) throw new Error("Download failed");
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement("a");
    a.href         = url;
    const cd       = res.headers.get("Content-Disposition") || "";
    const rawName  = cd.split("filename=")[1] || "";
    const safeName = rawName.replace(/['"]/g, "").trim();
    a.download     = safeName || ("ResearchAI_" + id + ".pdf");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  sendMessage:   (d)  => req("POST",   "/chat/message",       d),
  getSessions:   ()   => req("GET",    "/chat/sessions"),
  getSession:    (id) => req("GET",    `/chat/session/${id}`),
  deleteSession: (id) => req("DELETE", `/chat/session/${id}`),
};

export function saveAuth(token, user) {
  localStorage.setItem("rai_token", token);
  localStorage.setItem("rai_user",  JSON.stringify(user));
}

export function loadAuth() {
  const token = localStorage.getItem("rai_token");
  const raw   = localStorage.getItem("rai_user");
  if (!token || !raw) return null;
  try { return { token, user: JSON.parse(raw) }; }
  catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem("rai_token");
  localStorage.removeItem("rai_user");
}