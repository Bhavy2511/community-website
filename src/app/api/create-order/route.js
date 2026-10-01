import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

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
    const body = await request.json().catch(() => ({}));
    const rawAmount = body.amount;
    
    // Amount in paise, default to 5000 (₹50) if not provided, min 100 paise (₹1)
    const amountInPaise = parseInt(rawAmount, 10) || 5000;

    if (amountInPaise < 100) {
      return respond({ error: "Amount must be at least 100 paise (₹1)." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return respond({ error: "Razorpay credentials not configured on server." }, { status: 401 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = body.receipt || `rcpt_${Date.now()}`;
    const orderOptions = {
      amount: amountInPaise,
      currency: body.currency || "INR",
      receipt: receipt,
      notes: body.notes || {
        source: "GarbaRaas IITG Community",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return respond({
      ok: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err) {
    console.error("Razorpay Create Order Error:", err);
    return respond({ error: err.message || "Failed to create Razorpay order." }, { status: 500 });
  }
}
