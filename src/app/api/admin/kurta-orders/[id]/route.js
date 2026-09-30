import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { writeAuditLog } from "../../../../../lib/admin-audit";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import KurtaOrder from "../../../../../models/KurtaOrder";

export const runtime = "nodejs";

const statuses = new Set(["submitted", "verified", "needs_clarification"]);

export async function PATCH(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasMongoConfiguration() || !mongoose.Types.ObjectId.isValid(params.id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid review update." }, { status: 400 }); }
  if (!statuses.has(body.paymentStatus)) return NextResponse.json({ error: "Choose a valid payment status." }, { status: 400 });
  const note = typeof body.paymentReviewNote === "string" ? body.paymentReviewNote.trim().slice(0, 500) : "";
  if (!note) return NextResponse.json({ error: "A review note is required before changing the payment status." }, { status: 400 });
  try {
    await connectMongo();
    const order = await KurtaOrder.findById(params.id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.paymentStatus === "verified") return NextResponse.json({ error: "This payment has already been verified." }, { status: 409 });
    order.paymentStatus = body.paymentStatus;
    order.paymentReviewNote = note;
    order.paymentReviewedAt = new Date();
    order.paymentReviewedBy = session.email;
    await order.save();
    void writeAuditLog({ actor: session.email, action: `kurta_payment_${body.paymentStatus}`, entityType: "kurta_order", entityId: String(order._id), summary: order.name });
    return NextResponse.json({ order: { id: String(order._id), paymentStatus: order.paymentStatus, paymentReviewNote: order.paymentReviewNote, paymentReviewedAt: order.paymentReviewedAt } });
  } catch (error) {
    console.error("Unable to update kurta order", error);
    return NextResponse.json({ error: "Unable to update the payment review." }, { status: 503 });
  }
}
