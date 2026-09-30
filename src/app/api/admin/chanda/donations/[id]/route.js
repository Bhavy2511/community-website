import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../../lib/mongodb";
import ChandaDonation from "../../../../../../models/ChandaDonation";
import { writeAuditLog } from "../../../../../../lib/admin-audit";
export const runtime = "nodejs";
export async function DELETE(request, { params }) {
  const admin = getAdminSession(request);
  if (!admin || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  try { await connectMongo(); const donation = await ChandaDonation.findById(params.id).lean(); if (!donation) return NextResponse.json({ error: "Receipt was not found." }, { status: 404 }); await ChandaDonation.deleteOne({ _id: donation._id }); void writeAuditLog({ actor: admin.email, action: "chanda_donation_deleted", entityType: "ChandaDonation", entityId: donation._id.toString(), summary: `${donation.receiptNumber} · ${donation.donorName} · ₹${donation.amount}` }); return NextResponse.json({ ok: true, id: donation._id.toString() }); } catch (error) { console.error("Unable to delete Chanda receipt", error); return NextResponse.json({ error: "Unable to remove this receipt." }, { status: 503 }); }
}
