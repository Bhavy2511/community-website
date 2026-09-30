import { NextResponse } from "next/server";
import { adminCookie, createAdminSession, isAdminConfigured, SESSION_MAX_AGE, verifyAdminPassword } from "../../../../lib/admin-auth";
import { clearLoginFailures, loginAllowed, registerLoginFailure } from "../../../../lib/admin-rate-limit";
import { writeAuditLog } from "../../../../lib/admin-audit";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isAdminConfigured()) return NextResponse.json({ error: "Admin login is not configured yet. Add the admin variables to .env.local." }, { status: 503 });
  if (!loginAllowed(request)) return NextResponse.json({ error: "Too many login attempts. Please wait 15 minutes and try again." }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email.length > 200 || password.length > 500 || email !== process.env.ADMIN_EMAIL?.trim().toLowerCase() || !verifyAdminPassword(password)) {
    registerLoginFailure(request);
    return NextResponse.json({ error: "That email or password is not correct." }, { status: 401 });
  }
  clearLoginFailures(request);
  const response = NextResponse.json({ ok: true, email: process.env.ADMIN_EMAIL });
  const cookie = adminCookie(createAdminSession(process.env.ADMIN_EMAIL), SESSION_MAX_AGE);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  void writeAuditLog({ actor: process.env.ADMIN_EMAIL, action: "login", entityType: "session", summary: "Admin signed in" });
  return response;
}
