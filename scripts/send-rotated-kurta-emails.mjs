import fs from "node:fs/promises";
import crypto from "node:crypto";
import mongoose from "mongoose";
import QRCode from "qrcode";

const manifest = JSON.parse(await fs.readFile("backups/kurta-pickup-rotation-manifest-2026-09-30.json", "utf8"));
const M = mongoose.models.KurtaOrder || mongoose.model("KurtaOrder", new mongoose.Schema({}, { strict: false, collection: "kurtaorders" }));
const key = process.env.AGENTMAIL_API_KEY_GARBARAAS;
const inbox = process.env.KURTA_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to";
const origin = (process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL || "gujarati-community-iitg.vercel.app"}`).replace(/\/$/, "");
const esc = (v) => String(v ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const fmt = (v) => new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const qr = async (token) => { const url = `${origin}/admin/kurta-orders/collect?token=${encodeURIComponent(token)}`; const b = await QRCode.toBuffer(url, { errorCorrectionLevel: "M", margin: 2, width: 520, color: { dark: "#102d27", light: "#f8f3ea" } }); return { dataUrl: `data:image/png;base64,${b.toString("base64")}`, base64: b.toString("base64") }; };

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "gujarati-community-iitg", serverSelectionTimeoutMS: 10000 });
const verified = [];
for (const item of manifest.tokens) {
  const order = await M.findById(item.orderId).select("+pickupTokenHash").lean();
  const hash = crypto.createHash("sha256").update(item.newToken).digest("hex");
  if (!order || order.email !== item.email || order.pickupCode !== item.newPickupCode || order.pickupTokenHash !== hash) throw new Error(`Mongo verification failed for ${item.email}`);
  verified.push({ item, order });
}
const listRes = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages?limit=100`, { headers: { Authorization: `Bearer ${key}` } });
if (!listRes.ok) throw new Error(`AgentMail inbox check failed (${listRes.status})`);
const listed = await listRes.json();
const prior = new Set((listed.messages || []).map((m) => `${m.to?.[0] || m.recipient || ""}|${m.subject || ""}`));
const duplicates = verified.filter(({ item }) => prior.has(`${item.email}|Your kurta pickup pass - ${item.suffix} | GarbaRaas 2026 IITG`));
if (duplicates.length) throw new Error(`Aborted: ${duplicates.length} replacement messages already exist`);
const sent = [], failed = [];
for (const { item, order } of verified) {
  try {
    const pickup = await qr(item.newToken);
    const subject = `Your kurta pickup pass - ${item.suffix} | GarbaRaas 2026 IITG`;
    const rows = (order.designs || []).map((d) => `<tr><td style="padding:8px 0;border-bottom:1px solid #d2c9ba">${esc(d.name)}</td><td style="padding:8px 0;border-bottom:1px solid #d2c9ba;text-align:center">${d.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #d2c9ba;text-align:right">${esc((d.sizes || []).join(", "))}</td></tr>`).join("");
    const text = `GarbaRaas IITG sends you warm greetings!\n\nThank you, ${order.name}. Your kurta order has been placed.\n\nORDER DETAILS\nOrder reference: ${order._id}\nPickup code: ${item.newPickupCode}\n\n${(order.designs || []).map((d) => `${d.name}: ${d.quantity} x sizes ${(d.sizes || []).join(", ")}`).join("\n")}\n\nPrice per kurta: Rs. ${order.unitPrice}\nTotal kurtas: ${order.totalCount}\nAmount payable: Rs. ${order.amount}\nSubmitted: ${fmt(order.orderedAt)}\n\nKeep the attached QR code and pickup code safe for collection.\n\nFor any query contact:\nNidhi Sharma: 6355515926\nDarshan Agrawal: 8770510588\n\nThank you,\nGarbaRaas IITG`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;color:#193630"><p style="color:#b64c28;letter-spacing:2px;font-size:12px">GARBARAAS IITG · KURTA PICKUP PASS</p><h1 style="font-family:Georgia,serif;font-weight:500">Your pickup pass</h1><p>Warm greetings from GarbaRaas IITG, ${esc(order.name)}.</p><p>Your replacement pickup pass is ready. The previous pass has been replaced for security.</p><p><strong>Reference:</strong> ${esc(order._id)}<br><strong>Pickup code:</strong> ${esc(item.newPickupCode)}<br><strong>Submitted:</strong> ${esc(fmt(order.orderedAt))}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px 0;text-align:left;border-bottom:2px solid #193630">Design</th><th style="padding:8px 0;text-align:center;border-bottom:2px solid #193630">Qty</th><th style="padding:8px 0;text-align:right;border-bottom:2px solid #193630">Sizes</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Total kurtas:</strong> ${order.totalCount}<br><strong>Amount paid:</strong> Rs. ${order.amount}</p><div style="margin-top:28px;padding:18px;background:#f8f3ea;text-align:center"><p style="margin:0 0 10px;font-size:13px">Show this QR code when collecting your kurta.</p><img src="${pickup.dataUrl}" width="210" height="210" alt="Kurta pickup QR code" /><p style="margin:10px 0 0;font-size:13px"><strong>${esc(item.newPickupCode)}</strong></p></div><p style="margin-top:24px"><strong>For any query contact:</strong><br>Nidhi Sharma: 6355515926<br>Darshan Agrawal: 8770510588</p><p>Thank you,<br><strong>GarbaRaas IITG</strong></p></div>`;
    const res = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ to: [item.email], subject, text, html, labels: ["website", "kurta-order", "pickup-pass-replacement"], attachments: [{ filename: `kurta-pickup-${item.newPickupCode}.png`, content_type: "image/png", content: pickup.base64 }] }) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
    sent.push({ email: item.email, suffix: item.suffix, messageId: body.message_id || true, newPickupCode: item.newPickupCode });
  } catch (error) { failed.push({ email: item.email, suffix: item.suffix, error: error.message }); }
}
console.log(JSON.stringify({ checkedMongo: verified.length, agentMailInboxCount: listed.count, sent, failed }, null, 2));
await mongoose.disconnect();
if (failed.length) process.exitCode = 2;
