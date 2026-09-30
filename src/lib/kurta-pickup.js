import { createHash, randomBytes } from "crypto";
import QRCode from "qrcode";

export function createPickupToken(prefix = "KR") {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex"), code: `${prefix}-${randomBytes(5).toString("hex").toUpperCase()}` };
}

export function pickupTokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function pickupUrl(token, orderType = "kurta") {
  const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || vercelOrigin || "http://localhost:3000").replace(/\/$/, "");
  return `${origin}/admin/${orderType}-orders/collect?token=${encodeURIComponent(token)}`;
}

export async function createPickupQr(token, orderType = "kurta") {
  const options = { errorCorrectionLevel: "M", margin: 2, width: 520, color: { dark: "#102d27", light: "#f8f3ea" } };
  const url = pickupUrl(token, orderType);
  const qrPng = await QRCode.toBuffer(url, options);
  const qrPngBase64 = qrPng.toString("base64");
  return { qrDataUrl: `data:image/png;base64,${qrPngBase64}`, qrPngBase64 };
}
