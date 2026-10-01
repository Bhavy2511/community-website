import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import DandiyaOrder from "../../../../../models/DandiyaOrder";
import { createPickupToken } from "../../../../../lib/kurta-pickup";

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

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const quantity = parseInt(body.quantity, 10) || 1;

    if (!name || name.length > 120) {
      return respond({ error: "Please enter a valid name." }, { status: 400 });
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

    const totalAmount = quantity * depositPerPair;
    const amountInPaise = totalAmount * 100;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `rzp_ord_${Date.now()}`;
    let isLiveRazorpay = false;

    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const orderOptions = {
          amount: amountInPaise,
          currency: "INR",
          receipt: `dandiya_${Date.now()}`,
          notes: {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            quantity: quantity,
            product: "dandiya",
          },
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);
        razorpayOrderId = razorpayOrder.id;
        isLiveRazorpay = true;
      } catch (rzpErr) {
        console.error("Razorpay API Error creating order:", rzpErr);
      }
    }

    // Register pending order in MongoDB (Amazon-style Pending Payment registration)
    const pickup = createPickupToken("DN");
    let pendingDbId = "";

    if (hasMongoConfiguration()) {
      try {
        await connectMongo();
        const pendingOrder = await DandiyaOrder.create({
          name,
          phone,
          email,
          quantity,
          unitDeposit: depositPerPair,
          totalAmount,
          paymentMethod: "online",
          paymentStatus: "pending_payment",
          paymentReference: "",
          razorpayOrderId: razorpayOrderId,
          pickupCode: pickup.code,
          pickupTokenHash: pickup.tokenHash,
          distributionStatus: "pending",
          orderedAt: new Date(),
        });
        pendingDbId = pendingOrder._id.toString();
      } catch (dbErr) {
        console.error("Failed to create pending order in MongoDB:", dbErr);
      }
    }

    const upiIntentUrl = `upi://pay?pa=gujaraticommunityiitg@upi&pn=Gujarati%20Community%20IITG&am=${totalAmount}&cu=INR&tr=${encodeURIComponent(razorpayOrderId)}&tn=${encodeURIComponent(`Dandiya deposit - ${quantity} pairs`)}`;

    return respond({
      ok: true,
      mode: isLiveRazorpay ? "razorpay" : "upi_intent",
      orderId: razorpayOrderId,
      dbOrderId: pendingDbId,
      amount: amountInPaise,
      totalAmount,
      currency: "INR",
      keyId: keyId || "rzp_test_demo",
      upiIntentUrl,
    });
  } catch (err) {
    console.error("Create Razorpay Order Error:", err);
    return respond({ error: "Could not initialize online payment. Please try again." }, { status: 500 });
  }
}
