import { NextResponse } from "next/server";
import { adminCookie, getAdminSession } from "../../../../lib/admin-auth";
import { writeAuditLog } from "../../../../lib/admin-audit";

export const runtime = "nodejs";

export async function POST(request) {
  const session = getAdminSession(request);
  const response = NextResponse.json({ ok: true });
  const cookie = adminCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  if (session) void writeAuditLog({ actor: session.email, action: "logout", entityType: "session", summary: "Admin signed out" });
  return response;
}
