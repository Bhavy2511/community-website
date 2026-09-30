"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function submit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending your note..." });
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send your note right now.");
      setForm(initialForm);
      setStatus({ type: "success", message: payload.emailSent ? "Thank you. Your note is saved and has been emailed to the team." : "Thank you. Your note is saved and the team will reply soon." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Phone number <span>optional</span><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label>Subject<input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
      <label className="form-message">Your question<textarea required rows="6" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
      <button className="button contact-submit" disabled={status.type === "loading"}>{status.type === "loading" ? "Sending..." : "Send your note"}<span>↗</span></button>
      {status.type !== "idle" && <p className={`form-status ${status.type}`}>{status.message}</p>}
    </form>
  );
}
