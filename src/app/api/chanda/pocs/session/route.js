import { NextResponse } from "next/server";
import connectMongo from "../../../../../lib/mongodb";
import ChandaPoc from "../../../../../models/ChandaPoc";
import { getPocSession, pocCookie } from "../../../../../lib/chanda-auth";

export const runtime = "nodejs";
export async function GET(request) {
  const session = getPocSession(request); if (!session) return NextResponse.json({ authenticated: false });
  try { await connectMongo(); const poc = await ChandaPoc.findById(session.pocId).lean(); return NextResponse.json({ authenticated: Boolean(poc?.status === "active"), poc: poc ? { fullName: poc.fullName, hostel: session.collectionHostel || poc.hostel } : null }); } catch { return NextResponse.json({ authenticated: false }); }
}
export async function DELETE() { const response = NextResponse.json({ ok: true }); const cookie = pocCookie(); response.cookies.set(cookie.name, cookie.value, cookie.options); return response; }
