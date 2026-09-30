import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import Inquiry from "../../../models/Inquiry";
import { sendAgentMail } from "../../../lib/agentmail";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function emailTeam(inquiry) {
  return sendAgentMail({
    to: "gujaraticommunityiitg@gmail.com",
    replyTo: inquiry.email,
    subject: `[Gujarati Community IITG] ${inquiry.subject}`,
    text: `New website inquiry\n\nName: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || "Not provided"}\n\n${inquiry.message}`,
    labels: ["website", "contact"],
  });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  if (clean(body.website)) return NextResponse.json({ ok: true, emailSent: false });

  const inquiry = { name: clean(body.name), email: clean(body.email), phone: clean(body.phone), subject: clean(body.subject), message: clean(body.message) };
  if (!inquiry.name || !inquiry.subject || !inquiry.message || !emailPattern.test(inquiry.email)) return NextResponse.json({ error: "Please add your name, a valid email, subject and message." }, { status: 400 });
  if ([inquiry.name, inquiry.subject, inquiry.message].some((value) => value.length > (value === inquiry.message ? 4000 : value === inquiry.subject ? 180 : 120))) return NextResponse.json({ error: "One of the form fields is too long." }, { status: 400 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "The inquiry system is being configured. Please email gujaraticommunityiitg@gmail.com directly for now." }, { status: 503 });

  try {
    await connectMongo();
    const saved = await Inquiry.create(inquiry);
    let emailSent = false;
    try { emailSent = await emailTeam(saved); } catch (emailError) { console.error("Inquiry saved but email was not delivered", emailError); }
    return NextResponse.json({ ok: true, emailSent });
  } catch (error) {
    console.error("Unable to save inquiry", error);
    return NextResponse.json({ error: "We could not save your note right now. Please email gujaraticommunityiitg@gmail.com." }, { status: 503 });
  }
}
