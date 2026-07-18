import { redirect } from "react-router-dom";

const ACCESS_KEY = "notesera_access_token";
const USER_KEY = "notesera_student_user";
const AUTH_EVENT = "notesera-student-auth";

const backendUrl =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStudentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStudentSession({ accessToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearStudentSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isStudentLoggedIn() {
  return Boolean(getAccessToken());
}

export function subscribeStudentAuth(callback) {
  const handler = () => callback(getStudentUser());
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export async function authFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 45000;
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    if (response.status === 401) {
      clearStudentSession();
    }

    let data = null;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text || "Unexpected server response." };
    }

    return { response, data };
  } catch (err) {
    const aborted = err?.name === "AbortError";
    return {
      response: { ok: false, status: 0 },
      data: {
        isErr: true,
        message: aborted
          ? "Server is taking too long (it may be waking up). Please try again."
          : "Could not reach the server. Check your connection and try again.",
      },
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchAuthMeta() {
  const { response, data } = await authFetch("/auth/meta");
  if (!response.ok) {
    return {
      colleges: ["Medi-Caps University", "IPS Academy", "Acropolis Institute"],
      years: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    };
  }
  return data?.body || data;
}

export async function signupStudent(payload) {
  const { response, data } = await authFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.ok && data?.body?.accessToken) {
    setStudentSession({
      accessToken: data.body.accessToken,
      user: data.body.user,
    });
  }
  return { ok: response.ok, data };
}

export async function verifyStudentEmail(token) {
  const { response, data } = await authFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  if (response.ok && data?.body?.accessToken) {
    setStudentSession({
      accessToken: data.body.accessToken,
      user: data.body.user,
    });
  }
  return { ok: response.ok, data };
}

export async function verifyStudentOtp({ email, otp }) {
  const { response, data } = await authFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  if (response.ok && data?.body?.accessToken) {
    setStudentSession({
      accessToken: data.body.accessToken,
      user: data.body.user,
    });
  }
  return { ok: response.ok, data };
}

export async function resendVerificationEmail(email) {
  const { response, data } = await authFetch("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return { ok: response.ok, data };
}

export async function loginStudent(payload) {
  const { response, data } = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.ok && data?.body?.accessToken) {
    setStudentSession({
      accessToken: data.body.accessToken,
      user: data.body.user,
    });
  }
  return { ok: response.ok, data };
}

export async function logoutStudent() {
  try {
    await authFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }
  clearStudentSession();
}

export async function fetchStudentMe() {
  const { response, data } = await authFetch("/auth/me");
  if (!response.ok) return null;
  const user = data?.body?.user;
  if (user) setStudentSession({ accessToken: getAccessToken(), user });
  return user;
}

export async function updateStudentProfile(payload) {
  const { response, data } = await authFetch("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (response.ok && data?.body?.user) {
    setStudentSession({
      accessToken: getAccessToken(),
      user: data.body.user,
    });
  }
  return { ok: response.ok, data };
}

export async function changeStudentPassword(payload) {
  const { response, data } = await authFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ok: response.ok, data };
}

export function getUserInitials(user) {
  const name = (user?.name || user?.email || "?").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function requireStudentAuthLoader({ request }) {
  if (!getAccessToken()) {
    const url = new URL(request.url);
    const next = `${url.pathname}${url.search}`;
    throw redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return null;
}

export function loginRedirectPath(next) {
  if (!next || !next.startsWith("/")) return "/";
  return next;
}
