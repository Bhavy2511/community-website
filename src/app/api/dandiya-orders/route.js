import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import DandiyaOrder from "../../../models/DandiyaOrder";
import { escapeEmailHtml, sendAgentMail } from "../../../lib/agentmail";
import { createPickupQr, createPickupToken, pickupUrl } from "../../../lib/kurta-pickup";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phonePattern = /^\d{10}$/;
const depositPerPair = 50;
const maxPairs = 10;

const respond = (body, init = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });

async function sendDandiyaInvoice(order, pickup) {
  const orderedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const paymentLabel = order.paymentMethod === "cash" ? "Cash at Counter" : "Online via UPI";

  const emailText = `GarbaRaas IITG - Dandiya Collection Pass

Thank you, ${order.name}! Your Dandiya deposit request has been placed.

ORDER DETAILS
Order Reference / Pass Code: ${order.pickupCode}
Name: ${order.name}
WhatsApp Number: ${order.phone}
Email: ${order.email}
Dandiya Quantity: ${order.quantity} pair(s)
Deposit Payable: ₹${order.totalAmount} (${paymentLabel})
Order Date: ${orderedAt}

COLLECTION INSTRUCTIONS
Please bring this email or screenshot of the QR Code to the Dandiya Collection Counter.
${order.paymentMethod === "cash" ? `Pay ₹${order.totalAmount} in cash at the counter to collect your Dandiya sticks.` : "Show your payment pass to collect your Dandiya sticks."}
Your deposit of ₹${order.totalAmount} is 100% refundable when you return the Dandiya sticks after the event — no questions asked.

For any queries, please contact the GarbaRaas team.

Thank you,
GarbaRaas IITG
https://gujarati-community-iitg.vercel.app/`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #193630; background: #fffcf8; padding: 24px; border: 1px solid #e2d9c8;">
      <p style="color: #d36d31; letter-spacing: 2px; font-size: 11px; font-weight: bold; margin: 0 0 4px;">GARBARAAS IITG · DANDIYA COLLECTION</p>
      <h1 style="font-family: Georgia, serif; font-weight: 500; margin: 0 0 16px; color: #193630;">Thank You, ${escapeEmailHtml(order.name)}!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #425e55;">Your Dandiya deposit request has been successfully recorded. Please save this email and QR Code pass for collection.</p>
      
      <div style="margin: 20px 0; padding: 16px; background: #f8f3ea; border-left: 4px solid #d36d31;">
        <h2 style="font-size: 15px; margin: 0 0 10px; color: #193630;">Pass &amp; Order Details</h2>
        <p style="font-size: 13px; line-height: 1.7; margin: 0;">
          <strong>Pass Code:</strong> <span style="color: #d36d31; font-family: monospace; font-size: 15px;">${escapeEmailHtml(order.pickupCode)}</span><br>
          <strong>Name:</strong> ${escapeEmailHtml(order.name)}<br>
          <strong>WhatsApp:</strong> ${escapeEmailHtml(order.phone)}<br>
          <strong>Dandiya Quantity:</strong> ${order.quantity} pair(s)<br>
          <strong>Total Deposit:</strong> ₹${order.totalAmount} (${paymentLabel})<br>
          <strong>Date:</strong> ${orderedAt}
        </p>
      </div>

      <div style="margin: 24px 0; padding: 20px; background: #ffffff; border: 1px dashed #c7b9a5; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 13px; font-weight: bold; color: #193630;">Show this QR Code at the collection counter:</p>
        <img src="${pickup.qrDataUrl}" width="220" height="220" alt="Dandiya Collection QR Code" style="display: block; margin: 0 auto 12px; border: 8px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
        <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #d36d31;">${escapeEmailHtml(order.pickupCode)}</p>
      </div>

      <div style="margin-top: 20px; padding: 14px; background: #edf5ef; border-radius: 4px; color: #175c3d; font-size: 13px; line-height: 1.5;">
        <strong>✦ Fully Refundable Deposit:</strong> Return your Dandiya sticks after the event and your full deposit of ₹${order.totalAmount} will be returned to you immediately.
      </div>

      <p style="margin-top: 28px; font-size: 13px; color: #788d84; line-height: 1.6;">
        If you have any questions, feel free to contact our team or reply to this email.<br>
        Warm regards,<br>
        <strong>GarbaRaas IITG Team</strong>
      </p>
    </div>
  `;

  return Boolean(
    await sendAgentMail({
      apiKey: process.env.AGENTMAIL_API_KEY_GARBARAAS,
      inboxId: process.env.DANDIYA_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to",
      to: order.email,
      subject: `Your Dandiya Collection Pass - ${order.pickupCode} | GarbaRaas 2026 IITG`,
      text: emailText,
      html: emailHtml,
      labels: ["website", "dandiya-order"],
      attachments: [
        {
          filename: `dandiya-pass-${order.pickupCode}.png`,
          content_type: "image/png",
          content: pickup.qrPngBase64,
        },
      ],
    }).catch((err) => {
      console.error("Dandiya agentmail error:", err);
      return false;
    })
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const quantity = parseInt(body.quantity, 10) || 1;
    const paymentMethod = body.paymentMethod === "online" ? "online" : "cash";

    if (!name || name.length > 120) {
      return respond({ error: "Please enter your valid name." }, { status: 400 });
    }
    if (!phonePattern.test(phone)) {
      return respond({ error: "Please enter a valid 10-digit WhatsApp number." }, { status: 400 });
    }
    if (!emailPattern.test(email)) {
      return respond({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (quantity < 1 || quantity > maxPairs) {
      return respond({ error: `Quantity must be between 1 and ${maxPairs} pairs.` }, { status: 400 });
    }

    const paymentReference = typeof body.paymentReference === "string" ? body.paymentReference.trim() : "";
    const totalAmount = quantity * depositPerPair;
    const pickup = createPickupToken("DN");

    const orderData = {
      name,
      phone,
      email,
      quantity,
      unitDeposit: depositPerPair,
      totalAmount,
      paymentMethod,
      paymentReference,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      pickupCode: pickup.code,
      pickupTokenHash: pickup.tokenHash,
      distributionStatus: "pending",
      orderedAt: new Date(),
    };

    const pickupQr = await createPickupQr(pickup.token, "dandiya");
    const pickupPass = {
      code: pickup.code,
      qrDataUrl: pickupQr.qrDataUrl,
      token: pickup.token,
      url: pickupUrl(pickup.token, "dandiya"),
    };

    let savedOrder = null;
    if (hasMongoConfiguration()) {
      try {
        await connectMongo();
        savedOrder = await DandiyaOrder.create(orderData);
      } catch (dbErr) {
        console.error("Failed to persist Dandiya order in MongoDB", dbErr);
      }
    }

    // Attempt sending confirmation email
    let emailSent = false;
    try {
      emailSent = await sendDandiyaInvoice(orderData, pickupQr);
    } catch (emailErr) {
      console.error("Dandiya order email error:", emailErr);
    }

    // Format direct WhatsApp text message link
    const waText = encodeURIComponent(
      `*GarbaRaas IITG - Dandiya Collection Pass*\n\nHi ${name},\nYour Dandiya collection pass is ready!\n\n*Pass Code:* ${pickup.code}\n*Pairs:* ${quantity} (${totalAmount} INR deposit)\n*Payment:* ${paymentMethod === "cash" ? "Cash at Counter" : "UPI Online"}\n\nPlease check your email (${email}) for your QR Code pass, or show this code at the counter.\n\nThank you!`
    );
    const whatsappUrl = `https://wa.me/91${phone}?text=${waText}`;

    return respond({
      ok: true,
      orderId: savedOrder ? savedOrder._id.toString() : `DAN-${Date.now()}`,
      pickupCode: pickup.code,
      qrDataUrl: pickupQr.qrDataUrl,
      token: pickup.token,
      emailSent,
      whatsappUrl,
      orderDetails: {
        name,
        phone,
        email,
        quantity,
        totalAmount,
        paymentMethod,
        pickupCode: pickup.code,
      },
    });
  } catch (err) {
    console.error("Error processing Dandiya order:", err);
    return respond(
      { error: "Could not process order. Please try again." },
      { status: 500 }
    );
  }
}
