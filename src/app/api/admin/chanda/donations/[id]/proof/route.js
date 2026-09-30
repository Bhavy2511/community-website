import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../../../lib/chanda-admin-auth";
import connectMongo from "../../../../../../../lib/mongodb";
import ChandaDonation from "../../../../../../../models/ChandaDonation";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  if (!getAdminSession(request) || !getChandaAdminSession(request)) return NextResponse.json({ error: "Chanda admin access required." }, { status: 403 });
  try {
    await connectMongo();
    const donation = await ChandaDonation.findById(params.id).select("+paymentProofBase64 paymentProofContentType paymentProofFilename").lean();
    if (!donation?.paymentProofBase64 || !donation.paymentProofContentType) return new Response(null, { status: 404 });
    return new Response(Buffer.from(donation.paymentProofBase64, "base64"), { headers: { "Content-Type": donation.paymentProofContentType, "Content-Disposition": `inline; filename="${encodeURIComponent(donation.paymentProofFilename || "payment-proof")}"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Unable to load Chanda payment proof", error);
    return NextResponse.json({ error: "Unable to load payment proof." }, { status: 503 });
  }
}
