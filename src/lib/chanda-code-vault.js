import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const key = () => createHash("sha256").update(process.env.CHANDA_ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || "").digest();
export function encryptAccessCode(code) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}
export function decryptAccessCode(value) {
  try {
    const [ivText, tagText, dataText] = String(value || "").split(".");
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(dataText, "base64url")), decipher.final()]).toString("utf8");
  } catch { return ""; }
}
