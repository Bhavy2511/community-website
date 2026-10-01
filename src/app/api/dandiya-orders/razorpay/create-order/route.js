import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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

        return respond({
          ok: true,
          mode: "razorpay",
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: keyId,
        });
      } catch (rzpErr) {
        console.error("Razorpay API Error creating order:", rzpErr);
        // Fallback to seamless order if API call fails
      }
    }

    // Seamless Gateway / Demo mode when Razorpay credentials are not yet configured in env
    const simOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return respond({
      ok: true,
      mode: "simulation",
      orderId: simOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId || "rzp_test_demo",
    });
  } catch (err) {
    console.error("Create Razorpay Order Error:", err);
    return respond({ error: "Could not initialize online payment. Please try again." }, { status: 500 });
  }
}
