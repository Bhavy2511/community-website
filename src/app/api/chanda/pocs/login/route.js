import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import ChandaPoc from "../../../../../models/ChandaPoc";
import ChandaAccessCode from "../../../../../models/ChandaAccessCode";
import { accessCodeLookup, createPocSession, CHANDA_SESSION_MAX_AGE, isChandaConfigured, pocCookie, verifyAccessCode, verifyRollNumber } from "../../../../../lib/chanda-auth";
import { clearLoginFailures, loginAllowed, registerLoginFailure } from "../../../../../lib/admin-rate-limit";
import { CHANDA_HOSTELS, iitgEmailFromUsername } from "../../../../../lib/chanda-options";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasMongoConfiguration() || !isChandaConfigured()) return NextResponse.json({ error: "Chanda collection is not configured yet." }, { status: 503 });
  if (!loginAllowed(request)) return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter your IITG email, roll number, collection hostel and POC code." }, { status: 400 }); }
  const email = iitgEmailFromUsername(body.email);
  const rollNumber = typeof body.rollNumber === "string" ? body.rollNumber.trim().toLowerCase() : "";
  const collectionHostel = typeof body.hostel === "string" ? body.hostel.trim() : "";
  const accessCode = typeof body.accessCode === "string" ? body.accessCode.trim() : "";
  if (!CHANDA_HOSTELS.includes(collectionHostel)) return NextResponse.json({ error: "Choose the hostel where you are collecting Chanda." }, { status: 400 });
  if (!/^\d{4}$/.test(accessCode)) return NextResponse.json({ error: "Enter your four-digit POC code." }, { status: 400 });
  try {
    await connectMongo();
    const poc = await ChandaPoc.findOne({ email }).select("+passwordHash");
    if (!poc || !verifyRollNumber(rollNumber, poc.passwordHash)) { registerLoginFailure(request); return NextResponse.json({ error: "Those POC credentials are not correct." }, { status: 401 }); }
    if (poc.status !== "active") return NextResponse.json({ error: poc.status === "pending" ? "Your sign-up is awaiting Chanda admin approval." : "This collection account is not active." }, { status: 403 });
    const code = poc.accessCode ? await ChandaAccessCode.findOne({ _id: poc.accessCode, poc: poc._id, status: "assigned", codeLookup: accessCodeLookup(accessCode) }).select("+codeHash") : null;
    if (!code || !verifyAccessCode(accessCode, code.codeHash)) { registerLoginFailure(request); return NextResponse.json({ error: "Those POC credentials are not correct." }, { status: 401 }); }
    clearLoginFailures(request);
    const response = NextResponse.json({ ok: true, poc: { fullName: poc.fullName, hostel: collectionHostel } });
    const cookie = pocCookie(createPocSession(poc._id.toString(), collectionHostel), CHANDA_SESSION_MAX_AGE);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error("Unable to sign in Chanda POC", error);
    return NextResponse.json({ error: "Sign in is temporarily unavailable." }, { status: 503 });
  }
}
