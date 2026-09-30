import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { writeAuditLog } from "../../../../../lib/admin-audit";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import { pickupTokenHash } from "../../../../../lib/kurta-pickup";
import { sendDeliveryConfirmation } from "../../../../../lib/delivery-email";
import KurtaOrder from "../../../../../models/KurtaOrder";

export const runtime = "nodejs";

export async function POST(request) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: "Please sign in on this device before scanning a pickup pass." }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid pickup pass." }, { status: 400 }); }
  const token = typeof body.token === "string" ? body.token : "";
  if (token.length < 20 || !hasMongoConfiguration()) return NextResponse.json({ error: "This pickup pass is not valid." }, { status: 400 });
  try {
    await connectMongo();
    const order = await KurtaOrder.findOne({ pickupTokenHash: pickupTokenHash(token) }).select("+pickupTokenHash");
    if (!order) return NextResponse.json({ error: "This pickup pass is not valid." }, { status: 404 });
    if (order.paymentStatus !== "verified") return NextResponse.json({ error: "Verify this order’s payment before recording collection." }, { status: 409 });
    const alreadyDelivered = order.deliveryStatus === "delivered";
    let deliveryEmailSent = false;
    if (!alreadyDelivered) {
      order.deliveryStatus = "delivered";
      order.deliveredAt = new Date();
      order.deliveredBy = session.email;
      await order.save();
      void writeAuditLog({ actor: session.email, action: "kurta_delivered", entityType: "kurta_order", entityId: String(order._id), summary: order.pickupCode });
      try { deliveryEmailSent = await sendDeliveryConfirmation({ order, orderType: "kurta" }); } catch (emailError) { console.error("Kurta delivered but confirmation email was not sent", emailError); }
    }
    return NextResponse.json({ ok: true, alreadyDelivered, deliveryEmailSent, order: { pickupCode: order.pickupCode, name: order.name, rollNumber: order.rollNumber, phone: order.phone, email: order.email, hostelOrResidence: order.hostelOrResidence, branch: order.branch, degree: order.degree, totalCount: order.totalCount, amount: order.amount, designs: order.designs, orderedAt: order.orderedAt, deliveredAt: order.deliveredAt } });
  } catch (error) { console.error("Unable to collect kurta order", error); return NextResponse.json({ error: "Unable to record this collection." }, { status: 503 }); }
}
