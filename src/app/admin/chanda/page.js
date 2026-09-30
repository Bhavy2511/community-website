"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const dateKey = (value) => new Date(value).toLocaleDateString("en-CA");
const initialData = { donations: [], pocs: [], hostelTotals: [], summary: { amount: 0, count: 0 } };
export default function ChandaAdminPage() {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(initialData);
  const [message, setMessage] = useState("");
  const [access, setAccess] = useState(null);
  const [chandaPassword, setChandaPassword] = useState("");
  const [accessBusy, setAccessBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/chanda", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) {
      setState(body.code === "primary_auth_required" ? "signed-out" : "error");
      setMessage(body.error || "Unable to load Chanda records.");
      return;
    }
    setData(body);
    setState("ready");
  }, []);

  const loadAccess = useCallback(async () => {
    const response = await fetch("/api/admin/chanda/session", { cache: "no-store" });
    const body = await response.json();
    setAccess(body);
    if (body.authenticated) load();
  }, [load]);

  useEffect(() => { loadAccess(); }, [loadAccess]);

  async function signInToChanda(event) {
    event.preventDefault(); setAccessBusy(true); setMessage("");
    const response = await fetch("/api/admin/chanda/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: access.email, password: chandaPassword }) });
    const body = await response.json(); setAccessBusy(false);
    if (!response.ok) return setMessage(body.error || "Unable to unlock Chanda access.");
    setChandaPassword(""); setAccess((current) => ({ ...current, authenticated: true })); load();
  }

  async function signOutOfChanda() {
    await fetch("/api/admin/chanda/logout", { method: "POST" });
    setAccess((current) => ({ ...current, authenticated: false }));
    setData(initialData); setState("loading"); setMessage("");
  }

  const analytics = useMemo(() => {
    const cash = data.donations.filter((item) => item.paymentMethod === "cash");
    const online = data.donations.filter((item) => item.paymentMethod === "online");
    const today = dateKey(new Date());
    const pocMap = new Map();
    for (const donation of data.donations) {
      const key = donation.poc?._id || "unknown";
      const current = pocMap.get(key) || { id: key, name: donation.poc?.fullName || "Unknown POC", hostel: donation.poc?.hostel || "—", amount: 0, count: 0 };
      current.amount += donation.amount;
      current.count += 1;
      pocMap.set(key, current);
    }
    const pocTotals = [...pocMap.values()].sort((a, b) => b.amount - a.amount);
    const dailyTotals = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
      const key = dateKey(date);
      const matching = data.donations.filter((item) => dateKey(item.submittedAt) === key);
      return { key, label: new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric" }).format(date), amount: matching.reduce((sum, item) => sum + item.amount, 0), count: matching.length };
    });
    return {
      cashAmount: cash.reduce((sum, item) => sum + item.amount, 0), cashCount: cash.length,
      onlineAmount: online.reduce((sum, item) => sum + item.amount, 0), onlineCount: online.length,
      emailSent: data.donations.filter((item) => item.thankYouEmailSentAt).length,
      todayAmount: data.donations.filter((item) => dateKey(item.submittedAt) === today).reduce((sum, item) => sum + item.amount, 0),
      average: data.summary.count ? Math.round(data.summary.amount / data.summary.count) : 0,
      pocTotals, dailyTotals,
    };
  }, [data]);

  if (!access) return <main className="admin-shell"><p>Loading Chanda access…</p></main>;
  if (!access.primaryAuthenticated) return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">ADMIN ACCESS</p><h1>Sign in to admin first.</h1><p>Chanda records require the main admin workspace, followed by the separate GarbaRaas Chanda credential.</p><a className="button dark" href="/admin">Open admin sign in</a></section></main>;
  if (!access.configured) return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">CHANDA ADMIN SETUP</p><h1>One secure credential remains.</h1><p>Set the separate Chanda admin password hash and session secret in the server environment, then return here.</p></section></main>;
  if (!access.authenticated) return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">GARBARAAS IITG · CHANDA ADMIN</p><h1>Unlock Chanda records.</h1><p>Use the dedicated GarbaRaas Chanda credential. This second access session expires after one hour.</p><form onSubmit={signInToChanda}><label>Email<input type="email" value={access.email} readOnly /></label><label>Password<input type="password" value={chandaPassword} onChange={(event) => setChandaPassword(event.target.value)} autoComplete="current-password" required /></label>{message && <p className="admin-message error">{message}</p>}<button type="submit" disabled={accessBusy}>{accessBusy ? "Unlocking…" : "Unlock Chanda dashboard"}</button></form></section></main>;
  if (state === "loading") return <main className="admin-shell"><p>Loading Chanda records…</p></main>;
  if (state === "signed-out") return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">ADMIN ACCESS</p><h1>Sign in first.</h1><p>Only the senior-admin account can open Chanda records.</p><a className="button dark" href="/admin">Open admin sign in</a></section></main>;
  if (state === "error") return <main className="admin-shell"><section className="admin-login"><p className="admin-message error">{message}</p></section></main>;

  const maxDaily = Math.max(...analytics.dailyTotals.map((item) => item.amount), 1);
  const maxPoc = Math.max(...analytics.pocTotals.map((item) => item.amount), 1);

  return <main className="admin-shell chanda-dashboard">
    <header className="admin-top chanda-admin-hero"><div><p className="eyebrow">GARBARAAS · CONFIDENTIAL</p><h1>Chanda command centre</h1><p>Live collection oversight and donor receipt health.</p></div><div className="admin-top-actions"><button className="admin-secondary" onClick={load}>Refresh data</button><a className="admin-secondary" href="/admin/chanda/manual-donations">Add historical donation</a><a className="admin-secondary" href="/admin/chanda/pocs">Manage POCs</a><button className="admin-secondary" onClick={signOutOfChanda}>Lock Chanda</button><a className="admin-secondary" href="/admin">Back to admin</a></div></header>
    {message && <p className="chanda-admin-flash">{message}</p>}
    <section className="chanda-dashboard-overview">
    <div className="chanda-dashboard-summary-band"><section className="chanda-admin-summary">
      <article><p className="eyebrow">TOTAL COLLECTION</p><strong>{money(data.summary.amount)}</strong><span>{data.summary.donors || 0} unique donor{data.summary.donors === 1 ? "" : "s"} · {data.summary.count} receipt{data.summary.count === 1 ? "" : "s"}</span></article>
      <article><p className="eyebrow">TODAY</p><strong>{money(analytics.todayAmount)}</strong><span>Average contribution {money(analytics.average)}</span></article>
      <article><p className="eyebrow">EMAIL HEALTH</p><strong>{data.summary.count ? Math.round((analytics.emailSent / data.summary.count) * 100) : 100}%</strong><span>{analytics.emailSent} of {data.summary.count} thank-you emails sent</span></article>
      <article><p className="eyebrow">ACTIVE POCS</p><strong>{data.pocs.filter((poc) => poc.status === "active").length}</strong><span>{data.pocs.filter((poc) => poc.status === "pending").length} awaiting approval</span></article>
    </section></div>

    <div className="chanda-dashboard-nav-band"><nav className="chanda-admin-nav" aria-label="Chanda admin sections"><a href="/admin/chanda/insights"><span className="chanda-admin-nav-index">01</span><strong>Collection insights</strong><small>Payment mix, POC performance and hostel totals.</small><span className="chanda-admin-nav-arrow" aria-hidden="true">↗</span></a><a href="/admin/chanda/receipts"><span className="chanda-admin-nav-index">02</span><strong>Receipt register</strong><small>Search, filter and export donor receipts.</small><span className="chanda-admin-nav-arrow" aria-hidden="true">↗</span></a><a href="/admin/chanda/pocs"><span className="chanda-admin-nav-index">03</span><strong>POC access</strong><small>Review requests, generate codes and activate POCs.</small><span className="chanda-admin-nav-arrow" aria-hidden="true">↗</span></a><a href="/admin/chanda/manual-donations"><span className="chanda-admin-nav-index">04</span><strong>Historical donations</strong><small>Add collections received before the portal went live.</small><span className="chanda-admin-nav-arrow" aria-hidden="true">↗</span></a></nav></div>
    </section>

    <section className="chanda-insight-grid">
      <article className="chanda-insight-card"><p className="eyebrow">LAST 7 DAYS</p><h2>Collection rhythm</h2><div className="chanda-bars">{analytics.dailyTotals.map((item) => <div key={item.key}><span>{item.label}</span><div><i style={{ height: `${Math.max((item.amount / maxDaily) * 100, item.amount ? 8 : 2)}%` }} /></div><b>{money(item.amount)}</b></div>)}</div></article>
      <article className="chanda-insight-card"><p className="eyebrow">PAYMENT MIX</p><h2>Cash and online</h2><div className="chanda-payment-mix"><div><span>Online · {analytics.onlineCount}</span><strong>{money(analytics.onlineAmount)}</strong><i style={{ width: `${data.summary.amount ? (analytics.onlineAmount / data.summary.amount) * 100 : 0}%` }} /></div><div><span>Cash · {analytics.cashCount}</span><strong>{money(analytics.cashAmount)}</strong><i style={{ width: `${data.summary.amount ? (analytics.cashAmount / data.summary.amount) * 100 : 0}%` }} /></div></div></article>
    </section>

    <section className="chanda-admin-section"><p className="eyebrow">POC PERFORMANCE</p><h2>Collector activity</h2><div className="chanda-poc-performance">{analytics.pocTotals.length ? analytics.pocTotals.map((item, index) => <article key={item.id}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{item.name}</strong><span>{item.hostel} · {item.count} receipt{item.count === 1 ? "" : "s"}</span><i><em style={{ width: `${(item.amount / maxPoc) * 100}%` }} /></i></div><strong>{money(item.amount)}</strong></article>) : <p>No POC activity yet.</p>}</div></section>

    <section className="chanda-admin-section"><p className="eyebrow">HOSTEL-WISE VIEW</p><h2>Where contributions are coming from</h2><p className="chanda-section-copy">Every hostel stays visible, including hostels with no receipts yet. Per-head Chanda uses unique donors, while receipt count retains every recorded contribution.</p><div className="chanda-hostel-grid">{data.hostelTotals.length ? data.hostelTotals.map((item) => <article key={item.hostel}><strong>{item.hostel}</strong><span>{item.donors} donor{item.donors === 1 ? "" : "s"} · {item.receipts || 0} receipt{item.receipts === 1 ? "" : "s"}</span><b>{money(item.amount)}</b><small>Per head {money(item.perHead)}</small></article>) : <p>No hostels configured.</p>}</div></section>

  </main>;
}
