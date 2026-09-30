import { NextResponse } from "next/server";
import connectMongo, { hasMongoConfiguration } from "../../../lib/mongodb";
import MentorshipInterest from "../../../models/MentorshipInterest";
import { sendAgentMail } from "../../../lib/agentmail";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, length = 1600) => typeof value === "string" ? value.trim().slice(0, length) : "";
const allowedAreas = new Set(["Placements and careers", "Internships", "Academics", "Higher studies", "Research", "Settling into IITG", "Leadership and community work"]);

async function notifyTeam(interest) {
  return sendAgentMail({
    to: process.env.CONTACT_TO_EMAIL || "gujaraticommunityiitg@gmail.com",
    replyTo: interest.email,
    subject: `[Gujarati Community IITG] New mentorship interest - ${interest.name}`,
    text: `New mentorship interest\n\nRole: ${interest.role}\nName: ${interest.name}\nEmail: ${interest.email}\nPhone: ${interest.phone || "Not provided"}\nProgramme: ${interest.programme || "Not provided"}\nOrganisation / role: ${interest.organisation || "Not provided"}\nGraduation year: ${interest.graduationYear || "Not provided"}\nFocus areas: ${interest.areas.join(", ") || "Not provided"}\n\nNote: ${interest.note || "Not provided"}`,
    labels: ["website", "mentorship"],
  });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit the form again." }, { status: 400 }); }
  if (clean(body.website)) return NextResponse.json({ ok: true });
  const role = body.role === "mentor" ? "mentor" : body.role === "mentee" ? "mentee" : "";
  const areas = Array.isArray(body.areas) ? body.areas.filter((area) => allowedAreas.has(area)).slice(0, 7) : [];
  const interest = { role, name: clean(body.name, 120), email: clean(body.email, 254), phone: clean(body.phone, 40), programme: clean(body.programme, 140), graduationYear: clean(body.graduationYear, 12), organisation: clean(body.organisation, 160), areas, note: clean(body.note), consent: Boolean(body.consent) };
  if (!interest.role || !interest.name || !emailPattern.test(interest.email) || !interest.consent) return NextResponse.json({ error: "Please add your name, valid email and consent to be contacted about mentorship." }, { status: 400 });
  if (!hasMongoConfiguration()) return NextResponse.json({ error: "Mentorship registration is being configured. Please email gujaraticommunityiitg@gmail.com for now." }, { status: 503 });
  try {
    await connectMongo();
    const saved = await MentorshipInterest.create(interest);
    let emailSent = false;
    try { emailSent = await notifyTeam(saved); } catch (emailError) { console.error("Mentorship interest saved but email was not delivered", emailError); }
    return NextResponse.json({ ok: true, emailSent });
  }
  catch (error) { console.error("Unable to save mentorship interest", error); return NextResponse.json({ error: "We could not save your interest right now. Please try again later." }, { status: 503 }); }
}
