import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../../lib/mongodb";
import ChandaPoc from "../../../../../../models/ChandaPoc";
import ChandaAccessCode from "../../../../../../models/ChandaAccessCode";
import { accessCodeLookup } from "../../../../../../lib/chanda-auth";
import { writeAuditLog } from "../../../../../../lib/admin-audit";

export const runtime = "nodejs";
export async function PATCH(request, { params }) {
  const admin = getAdminSession(request);
  if (!admin || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Choose an account action." }, { status: 400 }); }
  const accessCode = typeof body.accessCode === "string" ? body.accessCode.trim() : "";
  if (!accessCode && body.status !== "disabled") return NextResponse.json({ error: "Assign a hostel code to activate a POC account." }, { status: 400 });
  if (accessCode && !/^\d{4}$/.test(accessCode)) return NextResponse.json({ error: "Enter a valid four-digit code." }, { status: 400 });
  try {
    await connectMongo();
    if (accessCode) {
      const poc = await ChandaPoc.findById(params.id);
      if (!poc) return NextResponse.json({ error: "POC was not found." }, { status: 404 });
      if (poc.status !== "pending" || poc.accessCode) return NextResponse.json({ error: "Only a pending POC without a code can be activated." }, { status: 409 });
      const code = await ChandaAccessCode.findOne({ hostel: poc.hostel, status: "available", codeLookup: accessCodeLookup(accessCode) });
      if (!code) return NextResponse.json({ error: "That available code was not found for this POC's hostel." }, { status: 400 });
      const assigned = await ChandaAccessCode.findOneAndUpdate({ _id: code._id, status: "available" }, { status: "assigned", poc: poc._id, assignedAt: new Date() }, { new: true });
      if (!assigned) return NextResponse.json({ error: "That code was just assigned. Please use another code." }, { status: 409 });
      const updated = await ChandaPoc.findOneAndUpdate({ _id: poc._id, status: "pending", accessCode: null }, { accessCode: assigned._id, status: "active" }, { new: true }).lean();
      if (!updated) {
        await ChandaAccessCode.updateOne({ _id: assigned._id, status: "assigned", poc: poc._id }, { status: "available", poc: null, assignedAt: null });
        return NextResponse.json({ error: "This POC was updated elsewhere. Refresh and try again." }, { status: 409 });
      }
      void writeAuditLog({ actor: admin.email, action: "chanda_poc_code_assigned", entityType: "ChandaPoc", entityId: poc._id.toString(), summary: `${poc.fullName} activated with a hostel POC code` });
      return NextResponse.json({ poc: { ...updated, accessCode: { codeHint: assigned.codeHint, status: assigned.status }, id: updated._id.toString() } });
    }
    const poc = await ChandaPoc.findByIdAndUpdate(params.id, { status: body.status }, { new: true }).lean();
    if (!poc) return NextResponse.json({ error: "POC was not found." }, { status: 404 });
    void writeAuditLog({ actor: admin.email, action: `chanda_poc_${body.status}`, entityType: "ChandaPoc", entityId: poc._id.toString(), summary: `${poc.fullName} (${poc.rollNumber}) set to ${body.status}` });
    return NextResponse.json({ poc: { ...poc, id: poc._id.toString() } });
  } catch { return NextResponse.json({ error: "Unable to update this POC." }, { status: 503 }); }
}
