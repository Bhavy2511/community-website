import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import KurtaOrder from "../../../../models/KurtaOrder";

export const runtime = "nodejs";

export async function GET(request) {
  if (!getAdminSession(request)) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  try {
    await connectMongo();
    const orders = await KurtaOrder.find({}, { "paymentReceipt.data": 0 }).sort({ orderedAt: -1 }).lean();
    return NextResponse.json({ orders: orders.map((order) => ({ ...order, id: order._id.toString() })) });
  } catch (error) {
    console.error("Unable to load kurta orders", error);
    return NextResponse.json({ error: "Unable to load orders." }, { status: 503 });
  }
}