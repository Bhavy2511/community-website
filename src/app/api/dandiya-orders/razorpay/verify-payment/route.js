import { NextResponse } from "next/server";
import crypto from "crypto";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import DandiyaOrder from "../../../../../models/DandiyaOrder";
import { escapeEmailHtml, sendAgentMail } from "../../../../../lib/agentmail";
import { createPickupQr, createPickupToken, pickupUrl } from "../../../../../lib/kurta-pickup";

export const runtime = "nodejs";

const depositPerPair = 50;
const maxPairs = 10;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const phonePattern = /^\d{10}$/;

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

  const paymentLabel = "Online via UPI (Paid & Verified)";

  const emailText = `GarbaRaas IITG - Dandiya Collection Pass

Thank you, ${order.name}! Your Dandiya deposit payment of ₹${order.totalAmount} has been verified online.

ORDER DETAILS
Order Reference / Pass Code: ${order.pickupCode}
Name: ${order.name}
WhatsApp Number: ${order.phone}
Email: ${order.email}
Dandiya Quantity: ${order.quantity} pair(s)
Deposit Paid: ₹${order.totalAmount} (${paymentLabel})
Payment Ref / Txn ID: ${order.razorpayPaymentId || order.paymentReference}
Order Date: ${orderedAt}

COLLECTION INSTRUCTIONS
Please bring this email or screenshot of the QR Code to the Dandiya Collection Counter.
Your payment is fully verified online. Show your QR Code pass to collect your Dandiya sticks directly!
Your deposit of ₹${order.totalAmount} is 100% refundable when you return the Dandiya sticks after the event — no questions asked.

For any queries, please contact the GarbaRaas team.

Thank you,
GarbaRaas IITG
https://gujarati-community-iitg.vercel.app/`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #193630; background: #fffcf8; padding: 24px; border: 1px solid #e2d9c8;">
      <p style="color: #d36d31; letter-spacing: 2px; font-size: 11px; font-weight: bold; margin: 0 0 4px;">GARBARAAS IITG · DANDIYA COLLECTION</p>
      <h1 style="font-family: Georgia, serif; font-weight: 500; margin: 0 0 16px; color: #193630;">Payment Verified! Thank You, ${escapeEmailHtml(order.name)}!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #425e55;">Your online payment for Dandiya deposit has been confirmed. Below is your official collection pass.</p>
      
      <div style="margin: 20px 0; padding: 16px; background: #f8f3ea; border-left: 4px solid #d36d31;">
        <h2 style="font-size: 15px; margin: 0 0 10px; color: #193630;">Pass &amp; Payment Details</h2>
        <p style="font-size: 13px; line-height: 1.7; margin: 0;">
          <strong>Pass Code:</strong> <span style="color: #d36d31; font-family: monospace; font-size: 15px;">${escapeEmailHtml(order.pickupCode)}</span><br>
          <strong>Name:</strong> ${escapeEmailHtml(order.name)}<br>
          <strong>WhatsApp:</strong> ${escapeEmailHtml(order.phone)}<br>
          <strong>Dandiya Quantity:</strong> ${order.quantity} pair(s)<br>
          <strong>Total Deposit:</strong> ₹${order.totalAmount} (${paymentLabel})<br>
          <strong>Transaction ID:</strong> <span style="font-family: monospace;">${escapeEmailHtml(order.razorpayPaymentId || order.paymentReference)}</span><br>
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
      subject: `[Paid & Confirmed] Dandiya Collection Pass - ${order.pickupCode} | GarbaRaas 2026`,
      text: emailText,
      html: emailHtml,
      labels: ["website", "dandiya-order", "online-payment"],
      attachments: [
        {
          filename: `dandiya-pass-${order.pickupCode}.png`,
          content_type: "image/png",
          content: pickup.qrPngBase64,
        },
      ],
    }).catch((err) => {
      console.error("Dandiya online invoice email error:", err);
      return false;
    })
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name: rawName,
      phone: rawPhone,
      email: rawEmail,
      quantity: rawQuantity,
    } = body;

    const name = typeof rawName === "string" ? rawName.trim() : "";
    const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const quantity = parseInt(rawQuantity, 10) || 1;

    if (!name || name.length > 120 || !phonePattern.test(phone) || !emailPattern.test(email)) {
      return respond({ error: "Invalid customer details provided for payment verification." }, { status: 400 });
    }

    if (quantity < 1 || quantity > maxPairs) {
      return respond({ error: `Quantity must be between 1 and ${maxPairs} pairs.` }, { status: 400 });
    }

    // STRICT VERIFICATION: Razorpay payment ID and order ID are REQUIRED
    if (!razorpay_payment_id || !razorpay_order_id) {
      return respond({ error: "Payment verification failed. No valid transaction ID returned." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // HMAC Signature verification
    if (keySecret) {
      if (!razorpay_signature) {
        return respond({ error: "Payment verification failed. Missing transaction signature." }, { status: 400 });
      }

      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("Razorpay signature mismatch!", { generatedSignature, razorpay_signature });
        return respond({ error: "Payment verification failed. Invalid transaction signature." }, { status: 400 });
      }
    }

    const totalAmount = quantity * depositPerPair;
    const pickup = createPickupToken("DN");

    const orderData = {
      name,
      phone,
      email,
      quantity,
      unitDeposit: depositPerPair,
      totalAmount,
      paymentMethod: "online",
      paymentStatus: "paid",
      paymentReference: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || "",
      pickupCode: pickup.code,
      pickupTokenHash: pickup.tokenHash,
      distributionStatus: "pending",
      orderedAt: new Date(),
    };

    const pickupQr = await createPickupQr(pickup.token, "dandiya");

    let savedOrder = null;
    if (hasMongoConfiguration()) {
      try {
        await connectMongo();
        savedOrder = await DandiyaOrder.create(orderData);
      } catch (dbErr) {
        console.error("Failed to persist paid Dandiya order in MongoDB", dbErr);
      }
    }

    // Send confirmation email
    let emailSent = false;
    try {
      emailSent = await sendDandiyaInvoice(orderData, pickupQr);
    } catch (emailErr) {
      console.error("Online payment invoice email error:", emailErr);
    }

    // Format direct WhatsApp text message link
    const waText = encodeURIComponent(
      `*GarbaRaas IITG - Dandiya Collection Pass*\n\nHi ${name},\nYour online payment is verified & your Dandiya collection pass is ready!\n\n*Pass Code:* ${pickup.code}\n*Pairs:* ${quantity} (${totalAmount} INR deposit paid online)\n*Payment:* Online via UPI (Paid & Confirmed)\n*Txn ID:* ${razorpay_payment_id}\n\nPlease check your email (${email}) for your QR Code pass, or show this code at the counter.\n\nThank you!`
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
        paymentMethod: "online",
        paymentStatus: "paid",
        pickupCode: pickup.code,
        paymentReference: razorpay_payment_id,
      },
    });
  } catch (err) {
    console.error("Error verifying payment and generating Dandiya order:", err);
    return respond({ error: "Could not verify payment. Please contact support if debited." }, { status: 500 });
  }
}
