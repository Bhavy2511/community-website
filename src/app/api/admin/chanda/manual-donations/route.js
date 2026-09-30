import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import ChandaDonation from "../../../../../models/ChandaDonation";
import { writeAuditLog } from "../../../../../lib/admin-audit";
import { CHANDA_HOSTELS } from "../../../../../lib/chanda-options";

export const runtime = "nodejs";
const clean = (value) => typeof value === "string" ? value.trim() : "";
const receiptEmail = (value) => {
  const email = clean(value).toLowerCase();
  return email && !email.includes("@") ? `${email}@iitg.ac.in` : email;
};
const receiptNumber = () => `GR-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
export async function POST(request) {
  const admin = getAdminSession(request);
  if (!admin || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter the donation details." }, { status: 400 }); }
  const donation = { donorName: clean(body.donorName), donorHostel: clean(body.donorHostel), donorEmail: receiptEmail(body.donorEmail), amount: Number(body.amount), paymentMethod: clean(body.paymentMethod), paymentReference: clean(body.paymentReference), submittedAt: new Date(body.submittedAt) };
  if (!donation.donorName || !CHANDA_HOSTELS.includes(donation.donorHostel) || !Number.isInteger(donation.amount) || donation.amount < 1 || donation.amount > 100000 || !["cash", "online"].includes(donation.paymentMethod) || Number.isNaN(donation.submittedAt.getTime()) || donation.submittedAt > new Date()) return NextResponse.json({ error: "Select a valid hostel and enter a valid donor, amount, payment method and past collection time." }, { status: 400 });
  try {
    await connectMongo();
    const saved = await ChandaDonation.create({ ...donation, submissionKey: `admin-${randomBytes(18).toString("hex")}`, receiptNumber: receiptNumber(), recordingSource: "admin" });
    void writeAuditLog({ actor: admin.email, action: "chanda_manual_donation_created", entityType: "ChandaDonation", entityId: saved._id.toString(), summary: `${saved.donorName} · ₹${saved.amount} historical Chanda entry recorded` });
    return NextResponse.json({ donation: { ...saved.toObject(), id: saved._id.toString() } }, { status: 201 });
  } catch (error) { console.error("Unable to add historical Chanda donation", error); return NextResponse.json({ error: "Unable to save this donation." }, { status: 503 }); }
}
