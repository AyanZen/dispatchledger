const HTML_ESCAPE = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]);
}

export function trimString(value, maxLen = 500) {
  if (value == null) return "";
  return String(value).trim().slice(0, maxLen);
}

export function sanitizeUsername(username) {
  const value = trimString(username, 64);
  if (!value || !/^[a-zA-Z0-9._-]+$/.test(value)) return null;
  return value;
}

export function sanitizeEmail(email) {
  const value = trimString(email, 254).toLowerCase();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

/** Derive an internal username slug from the email local part. */
export function usernameFromEmail(email) {
  const local = email.split("@")[0] || "";
  const sanitized = sanitizeUsername(local.replace(/[^a-zA-Z0-9._-]/g, "."));
  return sanitized || null;
}

export function sanitizeRole(role) {
  return role === "admin" ? "admin" : "staff";
}

/** @deprecated Use sanitizeAssignableRole from @/lib/roles.js */

export function isValidCuid(id) {
  return typeof id === "string" && /^c[a-z0-9]{24,}$/i.test(id);
}
