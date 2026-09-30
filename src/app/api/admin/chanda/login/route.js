import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { chandaAdminCookie, chandaAdminEmail, CHANDA_ADMIN_SESSION_MAX_AGE, createChandaAdminSession, isChandaAdminConfigured, verifyChandaAdminPassword } from "../../../../../lib/chanda-admin-auth";
import { clearLoginFailures, loginAllowed, registerLoginFailure } from "../../../../../lib/admin-rate-limit";
import { writeAuditLog } from "../../../../../lib/admin-audit";

export const runtime = "nodejs";
export async function POST(request) {
  const primary = getAdminSession(request);
  if (!primary) return NextResponse.json({ error: "Sign in to the main admin workspace first." }, { status: 401 });
  if (!isChandaAdminConfigured()) return NextResponse.json({ error: "Chanda admin access is not configured yet." }, { status: 503 });
  if (!loginAllowed(request)) return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter the Chanda admin credentials." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email !== chandaAdminEmail() || !verifyChandaAdminPassword(password)) {
    registerLoginFailure(request);
    return NextResponse.json({ error: "That Chanda admin email or password is not correct." }, { status: 401 });
  }
  clearLoginFailures(request);
  const response = NextResponse.json({ ok: true, email });
  const cookie = chandaAdminCookie(createChandaAdminSession(), CHANDA_ADMIN_SESSION_MAX_AGE);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  void writeAuditLog({ actor: primary.email, action: "chanda_admin_login", entityType: "ChandaAdminSession", summary: `Second-factor Chanda access granted for ${email}` });
  return response;
}
