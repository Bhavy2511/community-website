"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHANDA_HOSTELS } from "../../../../lib/chanda-options";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const dateKey = (value) => new Date(value).toLocaleDateString("en-CA");

export default function ChandaInsightsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [dailyDate, setDailyDate] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/chanda", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok)
      return setError(body.error || "Unlock Chanda admin access first.");
    setData(body);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const analytics = useMemo(() => {
    if (!data) return null;
    const cash = data.donations.filter((item) => item.paymentMethod === "cash");
    const online = data.donations.filter(
      (item) => item.paymentMethod === "online",
    );
    const totals = new Map();
    data.donations.forEach((item) => {
      const key = item.poc?._id || "unknown";
      const current = totals.get(key) || {
        name: item.poc?.fullName || "Unknown POC",
        hostel: item.poc?.hostel || "—",
        amount: 0,
        count: 0,
      };
      current.amount += item.amount;
      current.count += 1;
      totals.set(key, current);
    });
    const observedHostels = [
      ...new Set(
        data.hostelTotals
          .map((item) => item.hostel)
          .concat(data.donations.map((item) => item.donorHostel)),
      ),
    ].filter(Boolean);
    const hostels = [
      ...CHANDA_HOSTELS,
      ...observedHostels.filter((hostel) => !CHANDA_HOSTELS.includes(hostel)),
    ];
    const hostelTotals = hostels.map(
      (hostel) =>
        data.hostelTotals.find((item) => item.hostel === hostel) || {
          hostel,
          donors: 0,
          amount: 0,
        },
    );
    const daily = new Map();
    data.donations.forEach((item) => {
      const day = dateKey(item.submittedAt);
      if (!daily.has(day)) daily.set(day, new Map());
      const byHostel = daily.get(day);
      const current = byHostel.get(item.donorHostel) || { amount: 0, count: 0 };
      current.amount += item.amount;
      current.count += 1;
      byHostel.set(item.donorHostel, current);
    });
    const dailyHostel = [...daily.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, byHostel]) => ({
        day,
        rows: hostels.map((hostel) => ({
          hostel,
          ...(byHostel.get(hostel) || { amount: 0, count: 0 }),
        })),
      }));
    return {
      cash,
      online,
      pocTotals: [...totals.values()].sort((a, b) => b.amount - a.amount),
      hostelTotals,
      dailyHostel,
    };
  }, [data]);
  if (error)
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <p>{error}</p>
          <a className="button dark" href="/admin/chanda">
            Open Chanda dashboard
          </a>
        </section>
      </main>
    );
  if (!analytics)
    return (
      <main className="admin-shell">
        <p>Loading Chanda insights…</p>
      </main>
    );
  const visibleDailyHostel = dailyDate
    ? analytics.dailyHostel.filter((item) => item.day === dailyDate)
    : analytics.dailyHostel;
  return (
    <main className="admin-shell">
      <header className="admin-top chanda-admin-hero">
        <div>
          <p className="eyebrow">GARBARAAS · INSIGHTS</p>
          <h1>Collection insights</h1>
          <p>
            Understand collection performance across payment methods, hostels
            and POCs.
          </p>
        </div>
        <div className="admin-top-actions">
          <button className="admin-secondary" onClick={load}>
            Refresh
          </button>
          <a className="admin-secondary" href="/admin/chanda">
            Overview
          </a>
          <a className="admin-secondary" href="/admin/chanda/receipts">
            Receipts
          </a>
          <a className="admin-secondary" href="/admin/chanda/pocs">
            Manage POCs
          </a>
        </div>
      </header>
      <section className="chanda-admin-summary">
        <article>
          <p className="eyebrow">TOTAL COLLECTION</p>
          <strong>{money(data.summary.amount)}</strong>
          <span>{data.summary.count} donor receipts</span>
        </article>
        <article>
          <p className="eyebrow">ONLINE</p>
          <strong>
            {money(
              analytics.online.reduce((sum, item) => sum + item.amount, 0),
            )}
          </strong>
          <span>{analytics.online.length} receipts</span>
        </article>
        <article>
          <p className="eyebrow">CASH</p>
          <strong>
            {money(analytics.cash.reduce((sum, item) => sum + item.amount, 0))}
          </strong>
          <span>{analytics.cash.length} receipts</span>
        </article>
      </section>
      <section className="chanda-admin-section">
        <p className="eyebrow">POC PERFORMANCE</p>
        <h2>Collector activity</h2>
        <div className="chanda-poc-performance">
          {analytics.pocTotals.length ? (
            analytics.pocTotals.map((item, index) => (
              <article key={`${item.name}-${index}`}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.hostel} · {item.count} receipt
                    {item.count === 1 ? "" : "s"}
                  </span>
                </div>
                <strong>{money(item.amount)}</strong>
              </article>
            ))
          ) : (
            <p>No POC activity yet.</p>
          )}
        </div>
      </section>
      <section className="chanda-admin-section">
        <p className="eyebrow">HOSTEL-WISE VIEW</p>
        <h2>Where contributions are coming from</h2>
        <div className="chanda-hostel-grid">
          {analytics.hostelTotals.map((item) => (
            <article key={item.hostel}>
              <strong>{item.hostel}</strong>
              <span>
                {item.donors} donor{item.donors === 1 ? "" : "s"}
                {" · "}{item.receipts || 0} receipt{item.receipts === 1 ? "" : "s"}
              </span>
              <b>{money(item.amount)}</b>
              <small>Per head {money(item.donors ? Math.round(item.amount / item.donors) : 0)}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="chanda-admin-section">
        <p className="eyebrow">DAILY HOSTEL REGISTER</p>
        <h2>Every hostel, every collection day</h2>
        <p className="chanda-section-copy">
          Daily totals are grouped by donor hostel. Hostels with no collection
          on a day remain visible as zero.
        </p>
        {analytics.dailyHostel.length ? (
          <>
            <label className="chanda-daily-date-filter">
              Select collection date
              <select
                value={dailyDate}
                onChange={(event) => setDailyDate(event.target.value)}
              >
                <option value="">All collection dates</option>
                {analytics.dailyHostel.map(({ day }) => (
                  <option key={day} value={day}>
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(`${day}T12:00:00`))}
                  </option>
                ))}
              </select>
            </label>
            {visibleDailyHostel.map(({ day, rows }) => (
              <div className="chanda-daily-hostel" key={day}>
                <h3>
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "full",
                  }).format(new Date(`${day}T12:00:00`))}
                </h3>
                <div className="chanda-daily-hostel-grid">
                  {rows.map((row) => (
                    <article key={row.hostel}>
                      <strong>{row.hostel}</strong>
                      <span>
                        {row.count} receipt{row.count === 1 ? "" : "s"}
                      </span>
                      <b>{money(row.amount)}</b>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>No daily collections yet.</p>
        )}
      </section>
    </main>
  );
}
