import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../../../lib/mongodb";
import ChandaPoc from "../../../../../models/ChandaPoc";
import { hashRollNumber, isChandaConfigured } from "../../../../../lib/chanda-auth";
import { loginAllowed, registerLoginFailure } from "../../../../../lib/admin-rate-limit";
import { escapeEmailHtml, sendAgentMail } from "../../../../../lib/agentmail";
import { CHANDA_BRANCHES, CHANDA_DEGREES, CHANDA_YEARS_OF_STUDY, iitgEmailFromUsername, isChandaFullName, isIitgEmail, isIndianPhone } from "../../../../../lib/chanda-options";

export const runtime = "nodejs";
const degrees = new Set(CHANDA_DEGREES);
const yearsOfStudy = new Set(CHANDA_YEARS_OF_STUDY);
const clean = (value) => typeof value === "string" ? value.trim() : "";

async function notifyChandaAdmin(poc) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gujarati-community-iitg.vercel.app").replace(/\/$/, "");
  const adminUrl = `${siteUrl}/admin/chanda`;
  const details = [
    ["Name", poc.fullName], ["IITG email", poc.email], ["Roll number", poc.rollNumber], ["Hostel", poc.hostel],
    ["Branch", poc.branch], ["Degree", poc.degree], ["Year of study", poc.yearOfStudy], ["Contact", poc.phone],
  ];
  const textDetails = details.map(([label, value]) => `${label}: ${value}`).join("\n");
  const tableRows = details.map(([label, value]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ded1bd;color:#60756e">${escapeEmailHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #ded1bd;text-align:right;color:#173a31;font-weight:600">${escapeEmailHtml(value)}</td></tr>`).join("");
  return sendAgentMail({
    to: process.env.CHANDA_POC_REQUEST_TO_EMAIL || "r.pansuriya@iitg.ac.in",
    subject: `Action needed: new GarbaRaas Chanda POC request from ${poc.fullName}`,
    text: `A new GarbaRaas Chanda POC sign-up request is waiting for review.\n\n${textDetails}\n\nOpen Chanda admin to generate or assign the hostel code:\n${adminUrl}\n\nFor any queries:\nYash Modi: +91 79-84223250\nAarsh Jain: +91 99092 01117`,
    html: `<div style="margin:0;padding:0;background:#f6f0e5;color:#173a31;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto"><div style="padding:28px 34px;background:#12382f;color:#fffaf0"><p style="margin:0 0 10px;color:#efc861;font-size:11px;font-weight:700;letter-spacing:2px">GARBARAAS IITG · POC REQUEST</p><h1 style="margin:0;font-family:Georgia,serif;font-size:31px;font-weight:500;line-height:1.12">A new POC needs your approval.</h1></div><div style="padding:32px 34px;background:#fffaf0"><p style="margin:0 0 18px;font-size:16px;line-height:1.65">A Chanda POC sign-up request has been submitted. Review the details below, then assign an available four-digit code for the selected hostel to activate access.</p><table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${tableRows}</table><a href="${adminUrl}" style="display:inline-block;margin-top:26px;padding:13px 18px;color:#fffaf0;background:#b54d29;font-size:13px;font-weight:700;text-decoration:none">Open Chanda admin →</a><p style="margin:20px 0 0;color:#60756e;font-size:12px;line-height:1.55">Sign in to the main admin workspace first, then unlock Chanda admin access.</p><p style="margin:18px 0 0;padding-top:16px;border-top:1px solid #ded1bd;color:#173a31;font-size:13px;line-height:1.65"><strong>For any queries</strong><br>Yash Modi: +91 79-84223250<br>Aarsh Jain: +91 99092 01117</p></div><div style="padding:18px 34px;background:#12382f;color:#d9e3dd;font-size:12px"><strong style="color:#efc861;letter-spacing:1px">GARBARAAS IITG</strong><br>POC access notification</div></div></div>`,
    labels: ["website", "chanda", "poc-request"],
    inboxId: process.env.CHANDA_AGENTMAIL_INBOX || process.env.KURTA_ORDER_AGENTMAIL_INBOX || "garbaraas.iitg@agentmail.to",
    apiKey: process.env.AGENTMAIL_API_KEY_GARBARAAS || process.env.AGENTMAIL_API_KEY_COMMUNITY,
  });
}

export async function POST(request) {
  if (!hasMongoConfiguration() || !isChandaConfigured()) return NextResponse.json({ error: "Chanda collection is not configured yet." }, { status: 503 });
  if (!loginAllowed(request)) return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter your POC details." }, { status: 400 }); }
  const poc = { fullName: clean(body.fullName), rollNumber: clean(body.rollNumber).toLowerCase(), hostel: clean(body.hostel), branch: clean(body.branch), degree: clean(body.degree), yearOfStudy: clean(body.yearOfStudy), phone: clean(body.phone), email: iitgEmailFromUsername(body.email) };
  if (!isChandaFullName(poc.fullName)) return NextResponse.json({ error: "Enter your full name using letters and spaces only." }, { status: 400 });
  if (!poc.rollNumber || !poc.hostel || !CHANDA_BRANCHES.includes(poc.branch) || !degrees.has(poc.degree) || !yearsOfStudy.has(poc.yearOfStudy)) return NextResponse.json({ error: "Please complete all academic and hostel details." }, { status: 400 });
  if (!isIndianPhone(poc.phone)) return NextResponse.json({ error: "Contact number must contain exactly 10 digits. Remove any leading 0 or country code." }, { status: 400 });
  if (!isIitgEmail(poc.email)) return NextResponse.json({ error: "Enter your IITG email username, excluding @iitg.ac.in." }, { status: 400 });
  try {
    await connectMongo();
    await ChandaPoc.create({ ...poc, passwordHash: hashRollNumber(poc.rollNumber), status: "pending" });
    if (process.env.AGENTMAIL_API_KEY_GARBARAAS || process.env.AGENTMAIL_API_KEY_COMMUNITY) {
      try { await notifyChandaAdmin(poc); } catch (error) { console.error("Chanda POC request notification failed", error); }
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    registerLoginFailure(request);
    if (error?.code === 11000) return NextResponse.json({ error: "A request with this IITG email or roll number already exists." }, { status: 409 });
    console.error("Unable to register Chanda POC", error);
    return NextResponse.json({ error: "Unable to submit your sign-up request." }, { status: 503 });
  }
}
