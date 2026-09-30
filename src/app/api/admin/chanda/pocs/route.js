import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import ChandaPoc from "../../../../../models/ChandaPoc";
import { hashRollNumber } from "../../../../../lib/chanda-auth";
import { writeAuditLog } from "../../../../../lib/admin-audit";
import { CHANDA_BRANCHES, CHANDA_DEGREES, CHANDA_HOSTELS, CHANDA_YEARS_OF_STUDY, isChandaFullName, isIitgEmail, isIndianPhone } from "../../../../../lib/chanda-options";

export const runtime = "nodejs";
const clean = (value) => typeof value === "string" ? value.trim() : "";
const degrees = new Set(CHANDA_DEGREES);
const hostels = new Set(CHANDA_HOSTELS);
const branches = new Set(CHANDA_BRANCHES);
const yearsOfStudy = new Set(CHANDA_YEARS_OF_STUDY);

export async function POST(request) {
  const admin = getAdminSession(request);
  if (!admin || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter the POC details." }, { status: 400 }); }
  const poc = { fullName: clean(body.fullName), rollNumber: clean(body.rollNumber).toLowerCase(), hostel: clean(body.hostel), branch: clean(body.branch), degree: clean(body.degree), yearOfStudy: clean(body.yearOfStudy), phone: clean(body.phone), email: clean(body.email).toLowerCase() };
  if (!isChandaFullName(poc.fullName) || !poc.rollNumber || !hostels.has(poc.hostel) || !branches.has(poc.branch) || !degrees.has(poc.degree) || !yearsOfStudy.has(poc.yearOfStudy) || !isIndianPhone(poc.phone) || !isIitgEmail(poc.email)) return NextResponse.json({ error: "Choose valid hostel, branch, degree and year details, then enter the POC's full name, IITG email and 10-digit contact number." }, { status: 400 });
  try {
    await connectMongo();
    const saved = await ChandaPoc.create({ ...poc, passwordHash: hashRollNumber(poc.rollNumber), status: "pending" });
    void writeAuditLog({ actor: admin.email, action: "chanda_poc_created", entityType: "ChandaPoc", entityId: saved._id.toString(), summary: `${saved.fullName} (${saved.rollNumber}) added as a pending POC` });
    return NextResponse.json({ poc: { ...saved.toObject(), id: saved._id.toString() } }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) return NextResponse.json({ error: "This IITG email or roll number already has a POC account." }, { status: 409 });
    console.error("Unable to create Chanda POC", error);
    return NextResponse.json({ error: "Unable to create this POC account." }, { status: 503 });
  }
}
