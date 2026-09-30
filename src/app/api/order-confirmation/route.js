import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import { createPickupQr, pickupTokenHash } from "../../../lib/kurta-pickup";
import KurtaOrder from "../../../models/KurtaOrder";
import KotiOrder from "../../../models/KotiOrder";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderType = searchParams.get("type") === "koti" ? "koti" : "kurta";
  const token = searchParams.get("token") || "";
  if (token.length < 20 || !hasMongoConfiguration()) return NextResponse.json({ error: "This order confirmation link is not valid." }, { status: 400 });
  try {
    await connectMongo();
    const Model = orderType === "koti" ? KotiOrder : KurtaOrder;
    const order = await Model.findOne({ pickupTokenHash: pickupTokenHash(token) }).select("pickupCode").lean();
    if (!order) return NextResponse.json({ error: "This order confirmation link is not valid." }, { status: 404 });
    const pickupQr = await createPickupQr(token, orderType);
    return NextResponse.json({ orderType, pickupPass: { code: order.pickupCode, qrDataUrl: pickupQr.qrDataUrl } });
  } catch (error) {
    console.error("Unable to load order confirmation", error);
    return NextResponse.json({ error: "Unable to load this order confirmation." }, { status: 503 });
  }
}
