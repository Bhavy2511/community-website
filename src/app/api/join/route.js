import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import MembershipInterest from "../../../models/MembershipInterest";
import { sendAgentMail } from "../../../lib/agentmail";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) => typeof value === "string" ? value.trim() : "";

async function notifyTeam(member) {
  return sendAgentMail({
    to: process.env.CONTACT_TO_EMAIL || "gujaraticommunityiitg@gmail.com",
    replyTo: member.email,
    subject: `[Gujarati Community IITG] New membership interest - ${member.name}`,
    text: `New community membership interest\n\nName: ${member.name}\nEmail: ${member.email}\nPhone: ${member.phone || "Not provided"}\nProgramme: ${member.programme || "Not provided"}\nGraduation year: ${member.graduationYear || "Not provided"}\nHometown: ${member.hometown || "Not provided"}\nInterests: ${member.interests || "Not provided"}`,
    labels: ["website", "membership"],
  });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  if (clean(body.website)) return NextResponse.json({ ok: true, emailSent: false });
  const member = { name: clean(body.name), email: clean(body.email), phone: clean(body.phone), programme: clean(body.programme), graduationYear: clean(body.graduationYear), hometown: clean(body.hometown), interests: clean(body.interests) };
  if (!member.name || !emailPattern.test(member.email)) return NextResponse.json({ error: "Please add your name and a valid email address." }, { status: 400 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "Membership registration is being configured. Please email gujaraticommunityiitg@gmail.com for now." }, { status: 503 });
  try {
    await connectMongo();
    const saved = await MembershipInterest.create(member);
    let emailSent = false;
    try { emailSent = await notifyTeam(saved); } catch (emailError) { console.error("Membership interest saved but email was not delivered", emailError); }
    return NextResponse.json({ ok: true, emailSent });
  } catch (error) {
    console.error("Unable to save membership interest", error);
    return NextResponse.json({ error: "We could not save your registration right now. Please email gujaraticommunityiitg@gmail.com." }, { status: 503 });
  }
}
