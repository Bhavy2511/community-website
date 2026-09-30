import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../../../lib/chanda-admin-auth";
import { writeAuditLog } from "../../../../../../../lib/admin-audit";
import connectMongo, { hasMongoConfiguration } from "../../../../../../../lib/mongodb";
import ChandaDonation from "../../../../../../../models/ChandaDonation";
import { sendChandaThankYou } from "../../../../../../../lib/chanda-thank-you";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const admin = getAdminSession(request);
  if (!admin || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  try {
    await connectMongo();
    const donation = await ChandaDonation.findById(params.id).select("+receiptPdfBase64 +thankYouEmailTo +thankYouEmailMessageId");
    if (!donation) return NextResponse.json({ error: "Receipt was not found." }, { status: 404 });
    if (!donation.donorEmail) return NextResponse.json({ error: "This receipt has no recipient email address." }, { status: 400 });
    try {
      const email = await sendChandaThankYou(donation);
      donation.thankYouEmailTo = donation.donorEmail;
      donation.thankYouEmailMessageId = email.messageId;
      donation.thankYouEmailSentAt = new Date();
      donation.thankYouEmailLastError = "";
      donation.thankYouEmailLastAttemptAt = new Date();
      donation.thankYouEmailAttemptCount += 1;
      await donation.save();
      void writeAuditLog({ actor: admin.email, action: "chanda_receipt_resent", entityType: "ChandaDonation", entityId: donation._id.toString(), summary: `${donation.receiptNumber} resent to ${donation.donorEmail}` });
      return NextResponse.json({ ok: true, sentAt: donation.thankYouEmailSentAt, attemptCount: donation.thankYouEmailAttemptCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email delivery error.";
      donation.thankYouEmailLastError = message.slice(0, 500);
      donation.thankYouEmailLastAttemptAt = new Date();
      donation.thankYouEmailAttemptCount += 1;
      await donation.save();
      console.error("Chanda receipt resend failed", error);
      return NextResponse.json({ error: donation.thankYouEmailLastError }, { status: 502 });
    }
  } catch (error) {
    console.error("Unable to resend Chanda receipt", error);
    return NextResponse.json({ error: "Unable to resend the receipt email." }, { status: 503 });
  }
}
