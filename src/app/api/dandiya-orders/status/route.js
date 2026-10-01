import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import DandiyaOrder from "../../../../models/DandiyaOrder";
import { createPickupQr } from "../../../../lib/kurta-pickup";

export const runtime = "nodejs";

const respond = (body, init = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });

// GET: Check payment status for polling (Amazon-style status check)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId") || "";
  const razorpayOrderId = searchParams.get("razorpayOrderId") || "";

  if (!orderId && !razorpayOrderId) {
    return respond({ error: "Order ID is required." }, { status: 400 });
  }

  if (!hasMongoConfiguration()) {
    return respond({ status: "pending_payment", message: "Waiting for bank confirmation..." });
  }

  try {
    await connectMongo();

    let order = null;
    if (orderId) {
      if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await DandiyaOrder.findById(orderId);
      } else {
        order = await DandiyaOrder.findOne({
          $or: [{ pickupCode: orderId.toUpperCase() }, { razorpayOrderId: orderId }],
        });
      }
    } else if (razorpayOrderId) {
      order = await DandiyaOrder.findOne({ razorpayOrderId });
    }

    if (!order) {
      return respond({ status: "pending_payment", message: "Order initializing..." });
    }

    if (order.paymentStatus === "paid") {
      let qrDataUrl = "";
      if (order.pickupTokenHash) {
        try {
          const pickupQr = await createPickupQr(order.pickupCode, "dandiya");
          qrDataUrl = pickupQr.qrDataUrl;
        } catch {
          // ignore
        }
      }

      const waText = encodeURIComponent(
        `*GarbaRaas IITG - Dandiya Collection Pass*\n\nHi ${order.name},\nYour online payment is verified & your Dandiya collection pass is ready!\n\n*Pass Code:* ${order.pickupCode}\n*Pairs:* ${order.quantity} (${order.totalAmount} INR deposit paid online)\n*Payment:* Online via UPI (Paid & Confirmed)\n*Txn ID:* ${order.paymentReference || order.razorpayPaymentId}\n\nPlease check your email (${order.email}) for your QR Code pass, or show this code at the counter.\n\nThank you!`
      );
      const whatsappUrl = `https://wa.me/91${order.phone}?text=${waText}`;

      return respond({
        ok: true,
        status: "paid",
        pickupCode: order.pickupCode,
        qrDataUrl,
        emailSent: true,
        whatsappUrl,
        orderDetails: {
          name: order.name,
          phone: order.phone,
          email: order.email,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: "paid",
          pickupCode: order.pickupCode,
          paymentReference: order.paymentReference || order.razorpayPaymentId,
        },
      });
    }

    if (order.paymentStatus === "cancelled" || order.paymentStatus === "failed") {
      return respond({
        ok: true,
        status: order.paymentStatus,
        message: "Payment attempt was cancelled or failed.",
      });
    }

    return respond({
      ok: true,
      status: order.paymentStatus || "pending_payment",
      message: "Waiting for bank payment verification...",
    });
  } catch (err) {
    console.error("Error checking order status:", err);
    return respond({ status: "pending_payment", message: "Polling error..." });
  }
}

// POST: Cancel pending payment attempt
export async function POST(request) {
  try {
    const { orderId, action } = await request.json();

    if (!orderId) {
      return respond({ error: "Order ID is required." }, { status: 400 });
    }

    if (action === "cancel" && hasMongoConfiguration()) {
      await connectMongo();
      let order = null;
      if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await DandiyaOrder.findById(orderId);
      } else {
        order = await DandiyaOrder.findOne({
          $or: [{ pickupCode: orderId.toUpperCase() }, { razorpayOrderId: orderId }],
        });
      }

      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "cancelled";
        await order.save();
      }
    }

    return respond({ ok: true, status: "cancelled" });
  } catch (err) {
    console.error("Error cancelling order:", err);
    return respond({ error: "Could not cancel order." }, { status: 500 });
  }
}
