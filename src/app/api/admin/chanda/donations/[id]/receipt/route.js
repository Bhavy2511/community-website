import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../../../lib/mongodb";
import ChandaDonation from "../../../../../../../models/ChandaDonation";
import { createChandaReceiptPdf } from "../../../../../../../lib/chanda-receipt-pdf";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  if (!getAdminSession(request) || !getChandaAdminSession(request)) {
    return NextResponse.json({ error: "Chanda admin access required." }, { status: 403 });
  }
  if (!hasMongoConfiguration()) {
    return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  }

  try {
    await connectMongo();
    const donation = await ChandaDonation.findById(params.id)
      .select("+receiptPdfBase64 +receiptPdfFilename")
      .lean();
    if (!donation) {
      return NextResponse.json({ error: "Receipt was not found." }, { status: 404 });
    }

    const collectedAt = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(donation.submittedAt));
    const receiptPdf = donation.receiptPdfBase64 || createChandaReceiptPdf({
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      donorHostel: donation.donorHostel,
      donorEmail: donation.donorEmail,
      collectedAt,
    });
    const filename = donation.receiptPdfFilename || `garbaraas-chanda-${donation.receiptNumber}.pdf`;
    return new Response(Buffer.from(receiptPdf, "base64"), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Unable to load Chanda receipt PDF", error);
    return NextResponse.json({ error: "Unable to load the receipt PDF." }, { status: 503 });
  }
}
