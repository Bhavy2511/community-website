import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const CHANDA_ADMIN_COOKIE = "gc_iitg_chanda_admin";
const MAX_AGE = 60 * 60;
const adminEmail = () => (process.env.CHANDA_ADMIN_EMAIL || "garbaraas.iitg@gmail.com").trim().toLowerCase();
const secret = () => {
  const dedicated = process.env.CHANDA_ADMIN_SESSION_SECRET || "";
  if (dedicated.length >= 32) return dedicated;
  const main = process.env.SESSION_SECRET || "";
  return main.length >= 32 ? createHmac("sha256", main).update("chanda-admin-session-v1").digest("hex") : "";
};
const encode = (value) => Buffer.from(value).toString("base64url");
const decode = (value) => Buffer.from(value, "base64url").toString("utf8");
const signature = (value) => createHmac("sha256", secret()).update(value).digest("base64url");

export function isChandaAdminConfigured() { return Boolean(process.env.CHANDA_ADMIN_PASSWORD_HASH && secret()); }
export function chandaAdminEmail() { return adminEmail(); }
export function verifyChandaAdminPassword(password) {
  const [algorithm, salt, expected] = String(process.env.CHANDA_ADMIN_PASSWORD_HASH || "").split("$");
  if (algorithm !== "scrypt" || !salt || !expected || typeof password !== "string") return false;
  try {
    const derived = scryptSync(password, Buffer.from(salt, "base64url"), 64);
    const expectedBuffer = Buffer.from(expected, "base64url");
    return expectedBuffer.length === derived.length && timingSafeEqual(expectedBuffer, derived);
  } catch { return false; }
}
export function createChandaAdminSession() {
  const payload = encode(JSON.stringify({ email: adminEmail(), nonce: randomBytes(12).toString("base64url"), exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return `${payload}.${signature(payload)}`;
}
export function getChandaAdminSession(request) {
  if (!isChandaAdminConfigured()) return null;
  const [payload, supplied] = String(request.cookies.get(CHANDA_ADMIN_COOKIE)?.value || "").split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(decode(payload));
    return data.email === adminEmail() && data.exp > Math.floor(Date.now() / 1000) ? { email: data.email } : null;
  } catch { return null; }
}
export function chandaAdminCookie(value = "", maxAge = 0) {
  return { name: CHANDA_ADMIN_COOKIE, value, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge } };
}
export { MAX_AGE as CHANDA_ADMIN_SESSION_MAX_AGE };
