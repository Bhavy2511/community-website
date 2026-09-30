import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import KurtaOrder from "../../../models/KurtaOrder";
import { escapeEmailHtml, sendAgentMail } from "../../../lib/agentmail";
import { createPickupQr, createPickupToken, pickupUrl } from "../../../lib/kurta-pickup";
import { kurtaOrdersEnabled } from "../../../lib/merch-orders";

export const runtime = "nodejs";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phonePattern = /^\d{10}$/;
const sizes = new Set(["M", "L", "XL", "XXL"]);
const receiptTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReceiptBytes = 4 * 1024 * 1024;
const maxRequestBytes = maxReceiptBytes + 512 * 1024;
const maxOrderQuantity = 4;
const singlePrice = 499;
const bulkPrice = 449;
const designNames = new Map([
  ["design-01", "Kesariya Raas"], ["design-02", "Neel Bandhej"], ["design-03", "Gulabi Leher"], ["design-04", "Rangrez"], ["design-05", "Mogra Utsav"], ["design-06", "Kutch Katha"], ["design-07", "Saffron Bloom"], ["design-08", "Rangoli"], ["design-09", "Chandni Chowk"], ["design-10", "Rajwadi"],
]);
const clean = (value) => typeof value === "string" ? value.trim() : "";
const submissionKeyPattern = /^[a-f\d-]{36}$/i;
const respond = (body, init = {}) => NextResponse.json(body, { ...init, headers: { "Cache-Control": "no-store", ...(init.headers || {}) } });
const personalDetailsText = (order) => `PERSONAL DETAILS
Name: ${order.name}
Roll number: ${order.rollNumber}
Mobile: ${order.phone}
Email: ${order.email}
Hostel / residence: ${order.hostelOrResidence}
Department: ${order.branch}
Degree: ${order.degree}`;
const personalDetailsHtml = (order) => `<h2 style="font-size:18px;margin:26px 0 10px;color:#193630">Personal details</h2><p><strong>Name:</strong> ${escapeEmailHtml(order.name)}<br><strong>Roll number:</strong> ${escapeEmailHtml(order.rollNumber)}<br><strong>Mobile:</strong> ${escapeEmailHtml(order.phone)}<br><strong>Email:</strong> ${escapeEmailHtml(order.email)}<br><strong>Hostel / residence:</strong> ${escapeEmailHtml(order.hostelOrResidence)}<br><strong>Department:</strong> ${escapeEmailHtml(order.branch)}<br><strong>Degree:</strong> ${escapeEmailHtml(order.degree)}</p>`;

async function sendInvoice(order, orderId, pickup) {
  const orderedAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  const rows = order.designs.map((design) => `<tr><td style="padding:8px 0;border-bottom:1px solid #d2c9ba">${escapeEmailHtml(design.name)}</td><td style="padding:8px 0;border-bottom:1px solid #d2c9ba;text-align:center">${design.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #d2c9ba;text-align:right">${escapeEmailHtml(design.sizes.join(", "))}</td></tr>`).join("");
  return Boolean(await sendAgentMail({
    apiKey: process.env.AGENTMAIL_API_KEY_GARBARAAS,
    inboxId: process.env.KURTA_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to",
    to: order.email,
    subject: `Your kurta order is placed - ${orderId.slice(-8).toUpperCase()} | GarbaRaas 2026 IITG`,
    text: `GarbaRaas IITG sends you warm greetings!\n\nThank you, ${order.name}. Your kurta order has been placed.\n\n${personalDetailsText(order)}\n\nORDER DETAILS\nOrder reference: ${orderId}\nPickup code: ${order.pickupCode}\n\n${order.designs.map((design) => `${design.name}: ${design.quantity} x sizes ${design.sizes.join(", ")}`).join("\n")}\n\nPrice per kurta: Rs. ${order.unitPrice}\nTotal kurtas: ${order.totalCount}\nAmount payable: Rs. ${order.amount}\nSubmitted: ${orderedAt}\n\nCOLLECTION\nYour kurta will be delivered soon. We will contact you when it arrives. Keep this QR code and email safe for collection. If you do not see this email in your inbox, please check your junk or spam folder.\n\nFor any query contact:\nNidhi Sharma: 6355515926\nDarshan Agrawal: 8770510588\n\nThank you,\nGarbaRaas IITG\n\nFollow us on Instagram: https://www.instagram.com/garbaraas_iitg/\nVisit our website: https://gujarati-community-iitg.vercel.app/garbaraas/2026`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#193630"><p style="color:#b64c28;letter-spacing:2px;font-size:12px">GARBARAAS IITG · KURTA ORDER</p><h1 style="font-family:Georgia,serif;font-weight:500">Thank you!</h1><p>Warm greetings from GarbaRaas IITG, ${escapeEmailHtml(order.name)}.</p><p>Your kurta order has been placed.</p>${personalDetailsHtml(order)}<p><strong>Reference:</strong> ${escapeEmailHtml(orderId)}<br><strong>Pickup code:</strong> ${escapeEmailHtml(order.pickupCode)}<br><strong>Submitted:</strong> ${escapeEmailHtml(orderedAt)}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px 0;text-align:left;border-bottom:2px solid #193630">Design</th><th style="padding:8px 0;text-align:center;border-bottom:2px solid #193630">Qty</th><th style="padding:8px 0;text-align:right;border-bottom:2px solid #193630">Sizes</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:24px"><strong>Price per kurta:</strong> Rs. ${order.unitPrice}<br><strong>Total kurtas:</strong> ${order.totalCount}<br><strong>Amount payable:</strong> Rs. ${order.amount}</p><div style="margin-top:28px;padding:18px;background:#f8f3ea;text-align:center"><p style="margin:0 0 10px;font-size:13px">Keep this pickup pass for collection.</p><img src="${pickup.qrDataUrl}" width="210" height="210" alt="Kurta pickup QR code" /><p style="margin:10px 0 0;font-size:13px"><strong>${escapeEmailHtml(order.pickupCode)}</strong></p></div><p style="margin-top:24px;padding:14px;background:#f8f3ea;color:#527269;font-size:13px"><strong>Collection:</strong> Your kurta will be delivered soon. We will contact you when it arrives. Keep this QR code and email safe for collection. If you do not see this email in your inbox, please check your junk or spam folder.</p><p style="margin-top:24px"><strong>For any query contact:</strong><br>Nidhi Sharma: 6355515926<br>Darshan Agrawal: 8770510588</p><p style="margin-top:24px">Thank you,<br><strong>GarbaRaas IITG</strong></p><p>Follow us on <a href="https://www.instagram.com/garbaraas_iitg/">Instagram</a><br>Visit our <a href="https://gujarati-community-iitg.vercel.app/garbaraas/2026">website</a></p></div>`,
    labels: ["website", "kurta-order"],
    attachments: [{ filename: `kurta-pickup-${order.pickupCode}.png`, content_type: "image/png", content: pickup.qrPngBase64 }],
  }));
}

export async function POST(request) {
  if (!kurtaOrdersEnabled()) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxRequestBytes) return respond({ error: "The uploaded receipt is too large." }, { status: 413 });
  let form;
  try { form = await request.formData(); } catch { return respond({ error: "Please submit the form again." }, { status: 400 }); }
  const receipt = form.get("paymentReceipt");
  if (!receipt || typeof receipt === "string") return respond({ error: "Please upload your payment receipt." }, { status: 400 });
  if (!receiptTypes.has(receipt.type)) return respond({ error: "Receipt must be a JPG, PNG or WebP image." }, { status: 400 });
  if (!receipt.size || receipt.size > maxReceiptBytes) return respond({ error: "Receipt must be smaller than 4 MB." }, { status: 400 });
  let designs;
  try { designs = JSON.parse(clean(form.get("designs"))); } catch { return respond({ error: "Please submit your design selections again." }, { status: 400 }); }
  const order = {
    submissionKey: clean(form.get("submissionKey")),
    name: clean(form.get("name")), rollNumber: clean(form.get("rollNumber")), phone: clean(form.get("phone")), email: clean(form.get("email")),
    hostelOrResidence: clean(form.get("hostelOrResidence")), branch: clean(form.get("branch")), degree: clean(form.get("degree")),
    paymentConfirmed: form.get("paymentConfirmed") === "true",
    designs: Array.isArray(designs) ? designs.map((design) => ({ designId: clean(design.designId), name: clean(design.name), quantity: Number(design.quantity), sizes: Array.isArray(design.sizes) ? design.sizes.map(clean) : (design.size ? [clean(design.size)] : []) })) : [],
  };
  const validDesigns = order.designs.filter((design) => design.quantity > 0);
  if (!submissionKeyPattern.test(order.submissionKey)) return respond({ error: "This order session has expired. Please refresh and try again." }, { status: 400 });
  if (!order.name || order.name.length > 120 || !order.rollNumber || order.rollNumber.length > 40 || !phonePattern.test(order.phone) || !emailPattern.test(order.email) || !order.hostelOrResidence || !order.branch || !order.degree) return respond({ error: "Please complete all your details with a valid roll number, phone number and email address." }, { status: 400 });
  if (!order.paymentConfirmed) return respond({ error: "Please confirm that the payment was completed before submitting the order." }, { status: 400 });
  if (!validDesigns.length || new Set(validDesigns.map((design) => design.designId)).size !== validDesigns.length || validDesigns.some((design) => !designNames.has(design.designId) || ![1, 2, 3].includes(design.quantity) || design.sizes.length !== design.quantity || design.sizes.some((size) => !sizes.has(size)))) return respond({ error: "Choose a size for every kurta piece." }, { status: 400 });
  order.designs = validDesigns.map((design) => ({ ...design, name: designNames.get(design.designId) }));
  order.totalCount = validDesigns.reduce((total, design) => total + design.quantity, 0);
  if (order.totalCount > maxOrderQuantity) return respond({ error: `A single order can contain a maximum of ${maxOrderQuantity} kurtas.` }, { status: 400 });
  order.unitPrice = order.totalCount >= 2 ? bulkPrice : singlePrice;
  order.amount = order.totalCount * order.unitPrice;
  order.paymentConfirmedAt = new Date(); order.paymentStatus = "submitted";
  order.paymentReceipt = { filename: clean(receipt.name) || "payment-receipt", contentType: receipt.type, size: receipt.size, data: Buffer.from(await receipt.arrayBuffer()) };
  if (!hasMongoConfiguration()) return respond({ error: "Orders are being configured. Please try again shortly." }, { status: 503 });
  try {
    const pickup = createPickupToken(); order.pickupTokenHash = pickup.tokenHash; order.pickupCode = pickup.code;
    const [, pickupQr] = await Promise.all([connectMongo(), createPickupQr(pickup.token)]);
    const saved = await KurtaOrder.create(order); const orderId = saved._id.toString();
    const pickupPass = { ...pickupQr, url: pickupUrl(pickup.token) };
    let emailSent = false; try { emailSent = await sendInvoice(saved, orderId, pickupPass); } catch (emailError) { console.error("Kurta order saved but invoice email was not delivered", emailError); }
    return respond({ ok: true, orderId, emailSent, pickupPass: { code: saved.pickupCode, qrDataUrl: pickupPass.qrDataUrl, token: pickup.token } });
  } catch (error) {
    if (error?.code === 11000 && (error?.keyPattern?.submissionKey || error?.keyValue?.submissionKey)) return respond({ error: "This order has already been received. Please check your email for the pickup pass." }, { status: 409 });
    console.error("Unable to save kurta order", error); return respond({ error: "We could not save your order right now. Please try again." }, { status: 503 });
  }
}
