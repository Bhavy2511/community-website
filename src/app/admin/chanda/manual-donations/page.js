"use client";

import { useState } from "react";
import { CHANDA_HOSTELS } from "../../../../lib/chanda-options";

const initial = () => ({
  donorName: "",
  donorHostel: "",
  donorEmail: "",
  amount: "",
  paymentMethod: "online",
  paymentReference: "",
  submittedAt: new Date().toISOString().slice(0, 16),
});
export default function HistoricalChandaDonationsPage() {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/chanda/manual-donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();
    setBusy(false);
    if (!response.ok)
      return setMessage(body.error || "Unable to save this donation.");
    setForm(initial());
    setMessage(
      `Saved ${body.donation.receiptNumber}. No donor email was sent.`,
    );
  }
  return (
    <main className="admin-shell">
      <header className="admin-top chanda-admin-hero">
        <div>
          <p className="eyebrow">GARBARAAS · HISTORICAL ENTRIES</p>
          <h1>Add earlier donations</h1>
          <p>
            Record Chanda collected before the portal went live. These entries
            do not send donor emails.
          </p>
        </div>
        <div className="admin-top-actions">
          <a className="admin-secondary" href="/admin/chanda">
            Overview
          </a>
          <a className="admin-secondary" href="/admin/chanda/receipts">
            Receipts
          </a>
        </div>
      </header>
      {message && <p className="chanda-admin-flash">{message}</p>}
      <section className="chanda-admin-section">
        <form className="chanda-poc-create" onSubmit={submit}>
          <label>
            Donor name
            <input
              value={form.donorName}
              onChange={update("donorName")}
              required
            />
          </label>
          <label>
            Donor hostel
            <select
              value={form.donorHostel}
              onChange={update("donorHostel")}
              required
            >
              <option value="">Select hostel</option>
              {CHANDA_HOSTELS.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>
          </label>
          <label>
            Donor receipt email <small>Optional. A username such as rahul.123 is saved as rahul.123@iitg.ac.in; complete Gmail addresses also work.</small>
            <input
              type="text"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={form.donorEmail}
              onChange={update("donorEmail")}
            />
          </label>
          <label>
            Amount (₹)
            <input
              type="number"
              min="1"
              step="1"
              value={form.amount}
              onChange={update("amount")}
              required
            />
          </label>
          <label>
            Payment method
            <select
              value={form.paymentMethod}
              onChange={update("paymentMethod")}
            >
              <option value="online">Online</option>
              <option value="cash">Cash</option>
            </select>
          </label>
          <label>
            Payment reference <small>Optional</small>
            <input
              value={form.paymentReference}
              onChange={update("paymentReference")}
            />
          </label>
          <label>
            Collection date and time
            <input
              type="datetime-local"
              max={new Date().toISOString().slice(0, 16)}
              value={form.submittedAt}
              onChange={update("submittedAt")}
              required
            />
          </label>
          <button className="button dark" disabled={busy}>
            {busy ? "Saving…" : "Save historical donation"}
          </button>
        </form>
      </section>
    </main>
  );
}
