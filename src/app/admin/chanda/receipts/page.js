"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const dateKey = (value) => new Date(value).toLocaleDateString("en-CA");
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const csvCell = (value) => {
  let safe = String(value ?? "");
  if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replaceAll('"', '""')}"`;
};

export default function ChandaReceiptsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendingId, setResendingId] = useState("");
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [hostel, setHostel] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/chanda", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) return setError(body.error || "Unlock Chanda admin access first.");
    setData({
      ...body,
      donations: body.donations.map((item) => item.poc?.phone ? {
        ...item,
        poc: { ...item.poc, hostel: `${item.poc.hostel} · ${item.poc.phone}` },
      } : item),
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const receipts = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;
    return data.donations.filter((item) =>
      (!needle || [item.receiptNumber, item.donorName, item.donorEmail, item.poc?.fullName].filter(Boolean).join(" ").toLowerCase().includes(needle)) &&
      (method === "all" || item.paymentMethod === method) &&
      (hostel === "all" || item.donorHostel === hostel) &&
      (!from || new Date(item.submittedAt) >= from) &&
      (!to || new Date(item.submittedAt) <= to),
    );
  }, [data, query, method, hostel, dateFrom, dateTo]);

  function exportCsv() {
    const headers = ["Receipt", "Donor", "Hostel", "Email", "Amount", "Payment", "Payment reference", "POC", "Recorded", "Source", "Thank-you email"];
    const rows = receipts.map((item) => [item.receiptNumber, item.donorName, item.donorHostel, item.donorEmail, item.amount, item.paymentMethod, item.paymentReference, item.poc?.fullName || "Admin entry", item.submittedAt, item.recordingSource || "poc", item.thankYouEmailSentAt ? "Sent" : "Not sent"]);
    const url = URL.createObjectURL(new Blob([[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `garbaraas-chanda-${dateKey(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function resendReceipt(item) {
    setError("");
    setMessage("");
    setResendingId(item.id);
    try {
      const response = await fetch(`/api/admin/chanda/donations/${item.id}/resend`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) return setError(body.error || "Unable to resend this receipt.");
      setData((current) => ({
        ...current,
        donations: current.donations.map((donation) => donation.id === item.id ? {
          ...donation,
          thankYouEmailSentAt: body.sentAt,
          thankYouEmailLastError: "",
          thankYouEmailAttemptCount: body.attemptCount,
        } : donation),
      }));
      setMessage(`Receipt ${item.receiptNumber} has been resent.`);
    } catch {
      setError("Unable to reach the resend service.");
    } finally {
      setResendingId("");
    }
  }

  if (error && !data) return <main className="admin-shell"><section className="admin-login"><p>{error}</p><a className="button dark" href="/admin/chanda">Open Chanda dashboard</a></section></main>;
  if (!data) return <main className="admin-shell"><p>Loading Chanda receipts…</p></main>;

  return (
    <main className="admin-shell">
      <header className="admin-top chanda-admin-hero">
        <div>
          <p className="eyebrow">GARBARAAS · CONFIDENTIAL REGISTER</p>
          <h1>Donor receipts</h1>
          <p>Use only the filters you need, then download a clean CSV.</p>
        </div>
        <div className="admin-top-actions">
          <button className="admin-secondary" onClick={load}>Refresh</button>
          <a className="admin-secondary" href="/admin/chanda">Overview</a>
          <a className="admin-secondary" href="/admin/chanda/insights">Insights</a>
          <a className="admin-secondary" href="/admin/chanda/manual-donations">Historical entries</a>
        </div>
      </header>
      {message && <p className="chanda-admin-flash">{message}</p>}
      {error && <p className="admin-message error">{error}</p>}
      <section className="chanda-admin-section">
        <div className="chanda-register-heading">
          <h2>Receipt register</h2>
          <button className="button dark" onClick={exportCsv} disabled={!receipts.length}>Export filtered CSV</button>
        </div>
        <div className="chanda-admin-filters">
          <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Donor, email, receipt or POC" /></label>
          <label>Payment<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="all">All methods</option><option value="online">Online</option><option value="cash">Cash</option></select></label>
          <label>Donor hostel<select value={hostel} onChange={(event) => setHostel(event.target.value)}><option value="all">All hostels</option>{data.hostelTotals.map((item) => <option key={item.hostel}>{item.hostel}</option>)}</select></label>
          <label>From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label>To<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
        </div>
        <p className="chanda-filter-result">Showing {receipts.length} receipts · {money(receipts.reduce((sum, item) => sum + item.amount, 0))}</p>
        <div className="chanda-table-wrap">
          <table className="chanda-table">
            <thead><tr><th>Receipt</th><th>Donor</th><th>Contribution</th><th>Collector</th><th>Recorded</th><th>Email</th><th>PDF</th></tr></thead>
            <tbody>{receipts.map((item) => <tr key={item.id} className={item.recordingSource === "admin" ? "chanda-historical-receipt" : undefined}>
              <td>{item.receiptNumber}</td>
              <td><strong>{item.donorName}</strong>{item.recordingSource === "admin" && <span className="chanda-historical-badge">Historical entry</span>}<br /><span>{item.donorHostel}{item.donorEmail ? ` · ${item.donorEmail}` : ""}</span></td>
              <td>{money(item.amount)}<br /><span>{item.paymentMethod}{item.paymentReference ? ` · ${item.paymentReference}` : ""}</span></td>
              <td>{item.poc?.fullName || "Admin entry"}<br /><span>{item.poc?.hostel || "Historical"}</span></td>
              <td>{formatDate(item.submittedAt)}</td>
              <td>{item.thankYouEmailSentAt ? "Sent" : <><span>Not sent{item.thankYouEmailLastError ? ` · ${item.thankYouEmailLastError}` : ""}</span><br /><button className="admin-secondary" type="button" disabled={resendingId === item.id} onClick={() => resendReceipt(item)}>{resendingId === item.id ? "Resending…" : "Resend email"}</button></>}</td>
              <td><a className="admin-secondary chanda-receipt-pdf-link" href={`/api/admin/chanda/donations/${item.id}/receipt`} target="_blank" rel="noreferrer">Download PDF</a></td>
            </tr>)}</tbody>
          </table>
          {!receipts.length && <p className="admin-empty">No receipts match these filters.</p>}
        </div>
      </section>
    </main>
  );
}
