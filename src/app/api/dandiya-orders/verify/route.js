import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import DandiyaOrder from "../../../../models/DandiyaOrder";
import { pickupTokenHash } from "../../../../lib/kurta-pickup";

export const runtime = "nodejs";

const respond = (body, init = {}) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });

// Verification & Distribution Endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const code = searchParams.get("code") || "";

  if (!token && !code) {
    return respond({ error: "No pass token or code provided." }, { status: 400 });
  }

  if (!hasMongoConfiguration()) {
    return respond({ error: "Database not configured." }, { status: 503 });
  }

  try {
    await connectMongo();
    let order = null;
    if (token) {
      const hash = pickupTokenHash(token);
      order = await DandiyaOrder.findOne({ pickupTokenHash: hash });
    } else if (code) {
      order = await DandiyaOrder.findOne({ pickupCode: code.toUpperCase() });
    }

    if (!order) {
      return respond(
        { ok: false, error: "INVALID PASS: No Dandiya order found matching this QR code / Pass code." },
        { status: 404 }
      );
    }

    const formattedDistributedAt = order.distributedAt
      ? new Date(order.distributedAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Kolkata",
        })
      : null;

    if (order.distributionStatus === "distributed") {
      return respond({
        ok: true,
        isDistributed: true,
        message: `⚠️ ALREADY DISTRIBUTED: Dandiya sticks for this pass were already issued on ${formattedDistributedAt}.`,
        order: {
          id: order._id,
          pickupCode: order.pickupCode,
          name: order.name,
          phone: order.phone,
          email: order.email,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          distributionStatus: order.distributionStatus,
          distributedAt: formattedDistributedAt,
          distributedBy: order.deliveredBy || "Counter Admin",
        },
      });
    }

    return respond({
      ok: true,
      isDistributed: false,
      message: "VALID PASS: Ready for Dandiya collection & cash payment.",
      order: {
        id: order._id,
        pickupCode: order.pickupCode,
        name: order.name,
        phone: order.phone,
        email: order.email,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        distributionStatus: order.distributionStatus,
      },
    });
  } catch (err) {
    console.error("Dandiya verify error:", err);
    return respond({ error: "Failed to verify pass." }, { status: 500 });
  }
}

// Mark as distributed
export async function POST(request) {
  try {
    const { token, code, distributedBy } = await request.json();
    if (!token && !code) {
      return respond({ error: "Pass token or code is required." }, { status: 400 });
    }

    if (!hasMongoConfiguration()) {
      return respond({ error: "Database not configured." }, { status: 503 });
    }

    await connectMongo();
    let query = {};
    if (token) {
      query.pickupTokenHash = pickupTokenHash(token);
    } else {
      query.pickupCode = code.toUpperCase();
    }

    const order = await DandiyaOrder.findOne(query);
    if (!order) {
      return respond({ error: "Pass not found." }, { status: 404 });
    }

    if (order.distributionStatus === "distributed") {
      const distributedAtFormatted = new Date(order.distributedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });
      return respond({
        error: `Dandiya sticks for this pass were ALREADY issued on ${distributedAtFormatted}. Cannot issue again!`,
        isDistributed: true,
      }, { status: 400 });
    }

    order.distributionStatus = "distributed";
    order.paymentStatus = "paid";
    order.distributedAt = new Date();
    order.distributedBy = distributedBy || "Counter Admin";
    await order.save();

    return respond({
      ok: true,
      message: `Successfully marked order ${order.pickupCode} as DISTRIBUTED! Total ₹${order.totalAmount} collected.`,
      order: {
        pickupCode: order.pickupCode,
        name: order.name,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        distributionStatus: "distributed",
        distributedAt: order.distributedAt,
      },
    });
  } catch (err) {
    console.error("Dandiya mark distributed error:", err);
    return respond({ error: "Could not mark order as distributed." }, { status: 500 });
  }
}
