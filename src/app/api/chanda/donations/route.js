import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../lib/mongodb";
import ChandaDonation from "../../../../models/ChandaDonation";
import ChandaPoc from "../../../../models/ChandaPoc";
import { getPocSession } from "../../../../lib/chanda-auth";
import { chandaActionAllowed } from "../../../../lib/chanda-rate-limit";
import { createChandaReceiptPdf } from "../../../../lib/chanda-receipt-pdf";
import { CHANDA_HOSTELS } from "../../../../lib/chanda-options";
import { sendChandaThankYou } from "../../../../lib/chanda-thank-you";

export const runtime = "nodejs";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const submissionKeyPattern = /^[a-f\d-]{36}$/i;
const DEFAULT_CHANDA_QR_URL = "/payment-qrs/chanda-senate-full.png";
const clean = (value) => typeof value === "string" ? value.trim() : "";
const receiptNumber = () => `GR-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
const receiptEmail = (value) => {
  const email = clean(value).toLowerCase();
  return email && !email.includes("@") ? `${email}@iitg.ac.in` : email;
};
const sessionPoc = async (request) => {
  const session = getPocSession(request);
  if (!session) return null;
  await connectMongo();
  const poc = await ChandaPoc.findOne({ _id: session.pocId, status: "active" });
  return poc ? { poc, collectionHostel: session.collectionHostel || poc.hostel } : null;
};

export async function GET(request) {
  const session = await sessionPoc(request).catch(() => null);
  if (!session) return NextResponse.json({ error: "Please sign in to collect Chanda." }, { status: 401 });
  const configuredQrUrl = process.env.CHANDA_PAYMENT_QR_URL || DEFAULT_CHANDA_QR_URL;
  return NextResponse.json({ qrUrl: configuredQrUrl, paymentQrIsDemo: false, onlinePaymentAvailable: true, poc: { fullName: session.poc.fullName, hostel: session.collectionHostel } }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } });
}

async function sendThankYou(donation) {
  return sendChandaThankYou(donation);
}

export async function POST(request) {
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "Chanda collection is not configured yet." }, { status: 503 });
  const session = await sessionPoc(request).catch(() => null);
  if (!session) return NextResponse.json({ error: "Your collection session has expired. Please sign in again." }, { status: 401 });
  if (!chandaActionAllowed(request, "donation", 120, 60 * 60 * 1000)) return NextResponse.json({ error: "This device has submitted too many collections. Please contact the senior admin." }, { status: 429 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Please complete the donor details." }, { status: 400 }); }
  const donation = { submissionKey: clean(body.submissionKey), donorName: clean(body.donorName), donorHostel: session.collectionHostel, donorEmail: receiptEmail(body.donorEmail), amount: Number(body.amount), paymentMethod: clean(body.paymentMethod) };
  if (!submissionKeyPattern.test(donation.submissionKey)) return NextResponse.json({ error: "This collection form has expired. Please refresh and enter the donor details again." }, { status: 400 });
  if (!donation.donorName || donation.donorName.length > 120 || !CHANDA_HOSTELS.includes(donation.donorHostel) || donation.donorEmail.length > 254 || !emailPattern.test(donation.donorEmail) || !Number.isInteger(donation.amount) || donation.amount < 1 || donation.amount > 100000 || !["cash", "online"].includes(donation.paymentMethod)) return NextResponse.json({ error: "Enter a valid email address. You may use an IITG username (for example, rahul.123) or any complete email address." }, { status: 400 });
  try {
    const existing = await ChandaDonation.findOne({ submissionKey: donation.submissionKey, poc: session.poc._id }).select("receiptNumber donorName amount paymentMethod submittedAt thankYouEmailSentAt").lean();
    if (existing) return NextResponse.json({ ok: true, replayed: true, receiptNumber: existing.receiptNumber, emailSent: Boolean(existing.thankYouEmailSentAt), donation: { donorName: existing.donorName, amount: existing.amount, paymentMethod: existing.paymentMethod, submittedAt: existing.submittedAt } });
    const generatedReceiptNumber = receiptNumber();
    const collectedAt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date());
    const receiptPdfBase64 = createChandaReceiptPdf({ receiptNumber: generatedReceiptNumber, donorName: donation.donorName, amount: donation.amount, paymentMethod: donation.paymentMethod, donorHostel: donation.donorHostel, donorEmail: donation.donorEmail, collectedAt });
    const saved = await ChandaDonation.create({ ...donation, poc: session.poc._id, receiptNumber: generatedReceiptNumber, receiptPdfBase64, receiptPdfFilename: `garbaraas-chanda-${generatedReceiptNumber}.pdf` });
    let emailSent = false;
    try {
      const emailConfig = process.env.AGENTMAIL_API_KEY_GARBARAAS || process.env.AGENTMAIL_API_KEY_COMMUNITY;
      if (!emailConfig) throw new Error("Chanda email is not configured.");
      const email = await sendThankYou(saved);
      saved.thankYouEmailTo = saved.donorEmail;
      saved.thankYouEmailMessageId = email.messageId;
      saved.thankYouEmailSentAt = new Date();
      saved.thankYouEmailLastError = "";
      saved.thankYouEmailLastAttemptAt = new Date();
      saved.thankYouEmailAttemptCount = 1;
      await saved.save();
      emailSent = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email delivery error.";
      console.error("Chanda thank-you email failed", error);
      saved.thankYouEmailLastError = message.slice(0, 500);
      saved.thankYouEmailLastAttemptAt = new Date();
      saved.thankYouEmailAttemptCount = 1;
      await saved.save();
    }
    return NextResponse.json({ ok: true, receiptNumber: saved.receiptNumber, emailSent, donation: { donorName: saved.donorName, amount: saved.amount, paymentMethod: saved.paymentMethod, submittedAt: saved.submittedAt } }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await ChandaDonation.findOne({ submissionKey: donation.submissionKey, poc: session.poc._id }).select("receiptNumber donorName amount paymentMethod submittedAt thankYouEmailSentAt").lean();
      if (existing) return NextResponse.json({ ok: true, replayed: true, receiptNumber: existing.receiptNumber, emailSent: Boolean(existing.thankYouEmailSentAt), donation: { donorName: existing.donorName, amount: existing.amount, paymentMethod: existing.paymentMethod, submittedAt: existing.submittedAt } });
    }
    console.error("Unable to save Chanda collection", error); return NextResponse.json({ error: "The collection could not be recorded. Please try again once before leaving this page." }, { status: 503 });
  }
}
