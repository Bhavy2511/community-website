import mongoose from "mongoose";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../../lib/mongodb";
import KotiOrder from "../../../../../../models/KotiOrder";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  if (!getAdminSession(request)) return new Response("Please sign in.", { status: 401 });
  if (!hasMongoConfiguration() || !mongoose.Types.ObjectId.isValid(params.id)) return new Response(null, { status: 404 });
  try {
    await connectMongo();
    const order = await KotiOrder.findById(params.id).select("+paymentReceipt.data paymentReceipt.filename paymentReceipt.contentType").lean();
    const storedData = order?.paymentReceipt?.data;
    const receiptData = Buffer.isBuffer(storedData) ? storedData : storedData?.buffer;
    if (!receiptData) return new Response(null, { status: 404 });
    return new Response(receiptData, { headers: { "Content-Type": order.paymentReceipt.contentType, "Content-Disposition": `inline; filename="${encodeURIComponent(order.paymentReceipt.filename)}"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Unable to load Koti payment receipt", error);
    return new Response("Unable to load receipt.", { status: 503 });
  }
}
