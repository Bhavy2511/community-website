import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const CHANDA_COOKIE = "gc_iitg_chanda_poc";
const MAX_AGE = 60 * 60;
const secret = () => {
  const dedicated = process.env.CHANDA_SESSION_SECRET || "";
  if (dedicated.length >= 32) return dedicated;
  const adminSecret = process.env.SESSION_SECRET || "";
  return adminSecret.length >= 32 ? createHmac("sha256", adminSecret).update("chanda-poc-session-v1").digest("hex") : "";
};
const encode = (value) => Buffer.from(value).toString("base64url");
const sign = (value) => createHmac("sha256", secret()).update(value).digest("base64url");

export function isChandaConfigured() { return Boolean(secret()); }
export function hashRollNumber(rollNumber) {
  const salt = randomBytes(16).toString("base64url");
  return `scrypt$${salt}$${scryptSync(rollNumber, Buffer.from(salt, "base64url"), 64).toString("base64url")}`;
}
export function verifyRollNumber(rollNumber, stored) {
  const [algorithm, salt, expected] = String(stored || "").split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(rollNumber, Buffer.from(salt, "base64url"), 64);
  const expectedBuffer = Buffer.from(expected, "base64url");
  return expectedBuffer.length === actual.length && timingSafeEqual(expectedBuffer, actual);
}
export function hashAccessCode(code) { return hashRollNumber(code); }
export function verifyAccessCode(code, stored) { return verifyRollNumber(code, stored); }
export function accessCodeLookup(code) { return createHmac("sha256", secret()).update(`chanda-access-code:${code}`).digest("hex"); }
export function createPocSession(pocId, collectionHostel = "") {
  const payload = encode(JSON.stringify({ pocId, collectionHostel, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return `${payload}.${sign(payload)}`;
}
export function getPocSession(request) {
  if (!isChandaConfigured()) return null;
  const token = request.cookies.get(CHANDA_COOKIE)?.value;
  const [payload, supplied] = String(token || "").split(".");
  if (!payload || !supplied) return null;
  const expected = sign(payload);
  if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Math.floor(Date.now() / 1000) && data.pocId ? data : null;
  } catch { return null; }
}
export function pocCookie(value = "", maxAge = 0) {
  return { name: CHANDA_COOKIE, value, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge } };
}
export { MAX_AGE as CHANDA_SESSION_MAX_AGE };
