import { createHmac, scryptSync, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "gc_iitg_admin";
const SESSION_MAX_AGE = 60 * 60 * 8;

function base64url(value) { return Buffer.from(value).toString("base64url"); }
function decode(value) { return Buffer.from(value, "base64url").toString("utf8"); }
function signature(value) { return createHmac("sha256", process.env.SESSION_SECRET || "").update(value).digest("base64url"); }

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET);
}

export function verifyAdminPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [algorithm, salt, expected] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expected || typeof password !== "string") return false;
  try {
    const derived = scryptSync(password, Buffer.from(salt, "base64url"), 64);
    const expectedBuffer = Buffer.from(expected, "base64url");
    return expectedBuffer.length === derived.length && timingSafeEqual(expectedBuffer, derived);
  } catch { return false; }
}

export function createAdminSession(email) {
  const payload = base64url(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }));
  return `${payload}.${signature(payload)}`;
}

export function getAdminSession(request) {
  if (!isAdminConfigured()) return null;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const data = JSON.parse(decode(payload));
    if (data.email !== process.env.ADMIN_EMAIL || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email };
  } catch { return null; }
}

export function adminCookie(value = "", maxAge = 0) {
  return { name: ADMIN_COOKIE, value, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge } };
}

export { SESSION_MAX_AGE };
