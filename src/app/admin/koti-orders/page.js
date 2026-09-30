"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function formatDate(value) { return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—"; }
function searchableOrderText(order) { return [order.id, order.name, order.rollNumber, order.phone, order.email, order.pickupCode, order.paymentStatus, order.deliveryStatus, order.paymentReviewNote, order.amount, order.totalCount, order.hostelOrResidence, order.branch, order.degree, ...(order.designs || []).flatMap((design) => [design.name, design.designId, ...(design.sizes || []), design.quantity])].filter(Boolean).join(" ").toLowerCase(); }

export default function KotiOrdersAdminPage() {
  const [state, setState] = useState("loading");
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const loadOrders = useCallback(async () => {
    const response = await fetch("/api/admin/koti-orders", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setState(response.status === 401 ? "signed-out" : "error"); setMessage(data.error || "Unable to load Koti orders."); return; }
    setOrders(data.orders || []); setState("ready");
  }, []);
  useEffect(() => { loadOrders(); }, [loadOrders]);
  const filteredOrders = useMemo(() => { const query = search.trim().toLowerCase(); return query ? orders.filter((order) => searchableOrderText(order).includes(query)) : orders; }, [orders, search]);
  async function updateReview(order, paymentStatus) {
    const paymentReviewNote = window.prompt("Review note (required):", order.paymentReviewNote || "");
    if (paymentReviewNote === null || !paymentReviewNote.trim()) return;
    setBusyId(order.id); setMessage("");
    const response = await fetch(`/api/admin/koti-orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus, paymentReviewNote }) });
    const data = await response.json(); setBusyId("");
    if (!response.ok) { console.error("Unable to update Koti payment review", data.error); return; }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...data.order } : item));
  }
  if (state === "loading") return <main className="admin-shell"><p>Loading Koti orders…</p></main>;
  if (state === "signed-out") return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">ADMIN ACCESS</p><h1>Sign in first.</h1><p>Open the publishing workspace, sign in, then return here to review payment receipts.</p><a className="button dark" href="/admin">Open admin sign in</a></section></main>;
  if (state === "error") return <main className="admin-shell"><section className="admin-login"><p className="admin-message error">{message}</p></section></main>;
  return <main className="admin-shell"><header className="admin-top"><div><p className="eyebrow">GARBARAAS KOTI ORDER</p><h1>Payment review</h1><p>{filteredOrders.length} of {orders.length} order{orders.length === 1 ? "" : "s"}</p></div><a className="admin-secondary" href="/admin">Back to publishing</a></header><label className="kurta-admin-search">Search orders<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, email, design, size, pickup code…" /></label>{message && <p className="admin-message error">{message}</p>}<section className="kurta-admin-list">{orders.length === 0 ? <p className="admin-empty">No Koti orders have been submitted yet.</p> : filteredOrders.length === 0 ? <p className="admin-empty">No orders match “{search}”.</p> : filteredOrders.map((order) => <article key={order.id}><div><p className="eyebrow">{(order.paymentStatus || "submitted").replace("_", " ")} · {order.deliveryStatus === "delivered" ? "delivered" : "awaiting collection"} · {formatDate(order.orderedAt)}</p><h2>{order.name}</h2><p>{order.phone} · {order.email}{order.rollNumber ? ` · Roll no.: ${order.rollNumber}` : ""}</p><p>{order.designs.map((design) => `${design.name} (${design.quantity} × ${(design.sizes || []).filter(Boolean).join(", ")})`).join(", ")}</p>{(order.hostelOrResidence || order.branch || order.degree) && <p>{[order.hostelOrResidence, order.branch, order.degree].filter(Boolean).join(" · ")}</p>}<p><b>{order.totalCount} koti{order.totalCount === 1 ? "" : "s"} · ₹{order.amount}</b> · Pickup: {order.pickupCode}</p>{order.deliveryStatus === "delivered" && <p className="kurta-review-note">Delivered {formatDate(order.deliveredAt)}.</p>}{order.paymentReviewNote && <p className="kurta-review-note"><strong>Review note:</strong> {order.paymentReviewNote}</p>}</div><div className="kurta-admin-actions"><a className="admin-secondary" href={`/api/admin/koti-orders/${order.id}/receipt`} target="_blank" rel="noreferrer">View receipt</a>{order.paymentStatus === "verified" ? <button type="button" disabled>Verified</button> : <><button type="button" disabled={busyId === order.id} onClick={() => updateReview(order, "verified")}>Mark verified</button><button type="button" disabled={busyId === order.id} onClick={() => updateReview(order, "needs_clarification")}>Needs clarification</button></>}</div></article>)}</section></main>;
}
