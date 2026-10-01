import { NextResponse } from "next/server";
import crypto from "crypto";

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return respond({ error: "Missing required payment parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return respond({ error: "Razorpay Key Secret is missing on server." }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Signature mismatch:", { generatedSignature, razorpay_signature });
      return respond({ error: "Invalid payment signature. Verification failed." }, { status: 400 });
    }

    return respond({
      ok: true,
      status: "paid",
      message: "Payment verified successfully.",
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (err) {
    console.error("Razorpay Verify Signature Error:", err);
    return respond({ error: err.message || "Failed to verify payment signature." }, { status: 500 });
  }
}
