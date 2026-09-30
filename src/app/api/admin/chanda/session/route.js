import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { chandaAdminEmail, getChandaAdminSession, isChandaAdminConfigured } from "../../../../../lib/chanda-admin-auth";

export const runtime = "nodejs";
export async function GET(request) {
  const primary = getAdminSession(request);
  const chanda = getChandaAdminSession(request);
  return NextResponse.json({ primaryAuthenticated: Boolean(primary), configured: isChandaAdminConfigured(), authenticated: Boolean(primary && chanda), email: chandaAdminEmail() });
}
