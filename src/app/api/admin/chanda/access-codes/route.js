import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { getChandaAdminSession } from "../../../../../lib/chanda-admin-auth";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import ChandaAccessCode from "../../../../../models/ChandaAccessCode";
import { accessCodeLookup, hashAccessCode } from "../../../../../lib/chanda-auth";
import { encryptAccessCode } from "../../../../../lib/chanda-code-vault";

export const runtime = "nodejs";
const clean = (value) => typeof value === "string" ? value.trim() : "";

export async function POST(request) {
  if (!getAdminSession(request) || !getChandaAdminSession(request)) return NextResponse.json({ error: "Separate Chanda admin access is required." }, { status: 401 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "MongoDB is not configured yet." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Choose a hostel." }, { status: 400 }); }
  const hostel = clean(body.hostel);
  if (!hostel || hostel.length > 120) return NextResponse.json({ error: "Choose a valid hostel name." }, { status: 400 });
  try {
    await connectMongo();
    const existing = await ChandaAccessCode.countDocuments({ hostel, status: { $in: ["available", "assigned"] } });
    const required = 20 - existing;
    if (required <= 0) return NextResponse.json({ error: "This hostel already has its 20 active POC codes." }, { status: 409 });
    const codes = [];
    while (codes.length < required) {
      const code = String(randomInt(1000, 10000));
      try { await ChandaAccessCode.create({ hostel, codeLookup: accessCodeLookup(code), codeHash: hashAccessCode(code), codeCiphertext: encryptAccessCode(code), codeHint: `••${code.slice(-2)}` }); codes.push(code); } catch (error) { if (error?.code !== 11000) throw error; }
    }
    return NextResponse.json({ hostel, codes, total: existing + codes.length }, { status: 201 });
  } catch (error) { console.error("Unable to generate Chanda access codes", error); return NextResponse.json({ error: "Unable to generate POC codes." }, { status: 503 }); }
}
