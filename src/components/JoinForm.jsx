"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", phone: "", programme: "", graduationYear: "", hometown: "", interests: "", website: "" };

export default function JoinForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your registration..." });
    try {
      const response = await fetch("/api/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit your registration.");
      setForm(initialForm);
      setStatus({ type: "success", message: payload.emailSent ? "Welcome. Your registration is saved and the team has been notified." : "Welcome. Your registration is saved and the team will be in touch." });
    } catch (error) { setStatus({ type: "error", message: error.message }); }
  }

  return <form className="contact-form" onSubmit={submit}><label>Full name<input required value={form.name} onChange={update("name")} /></label><label>Email address<input required type="email" value={form.email} onChange={update("email")} /></label><label>Phone number <span>optional</span><input type="tel" value={form.phone} onChange={update("phone")} /></label><label>Programme<input placeholder="Example: B.Tech, M.Tech, PhD" value={form.programme} onChange={update("programme")} /></label><label>Graduation year <span>optional</span><input inputMode="numeric" value={form.graduationYear} onChange={update("graduationYear")} /></label><label>Hometown in Gujarat <span>optional</span><input value={form.hometown} onChange={update("hometown")} /></label><label className="form-message">How would you like to be involved? <span>optional</span><textarea rows="5" value={form.interests} onChange={update("interests")} /></label><label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={update("website")} /></label><button className="button contact-submit" disabled={status.type === "loading"}>{status.type === "loading" ? "Sending..." : "Be part of the community"}<span>↗</span></button>{status.type !== "idle" && <p className={`form-status ${status.type}`}>{status.message}</p>}</form>;
}
