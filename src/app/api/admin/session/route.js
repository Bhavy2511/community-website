import { NextResponse } from "next/server";
import { getAdminSession, isAdminConfigured } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request) {
  const session = getAdminSession(request);
  return NextResponse.json({ configured: isAdminConfigured(), authenticated: Boolean(session), email: session?.email || null });
}
