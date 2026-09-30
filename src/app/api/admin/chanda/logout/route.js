import { NextResponse } from "next/server";
import { chandaAdminCookie, getChandaAdminSession } from "../../../../../lib/chanda-admin-auth";

export const runtime = "nodejs";
export async function POST(request) {
  const session = getChandaAdminSession(request);
  const response = NextResponse.json({ ok: true });
  const cookie = chandaAdminCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
