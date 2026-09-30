"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function CollectKotiOrderContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState({ type: "loading", message: "Checking Koti pickup pass…" });
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setState({ type: "error", message: "This Koti pickup pass is missing its secure code." }); return; }
    fetch("/api/admin/koti-orders/collection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => { if (!response.ok) throw new Error(data.error); const message = data.alreadyDelivered ? "This Koti order was already marked as delivered." : `Koti collection recorded.${data.deliveryEmailSent ? " A delivery confirmation email was sent." : " Delivery recorded, but the confirmation email could not be sent."}`; setState({ type: "success", message, order: data.order }); })
      .catch((error) => setState({ type: "error", message: error.message || "Unable to record this Koti collection." }));
  }, [searchParams]);
  return <main className="admin-shell"><section className="admin-login pickup-scan-result"><p className="eyebrow">KOTI PICKUP</p><h1>{state.type === "success" ? "Merch Delivered!" : state.type === "error" ? "Pickup not recorded." : "Checking pass…"}</h1><p>{state.message}</p>{state.order && <div className="pickup-order-details"><div className="pickup-order-heading"><strong>{state.order.name}</strong><span>{state.order.pickupCode}</span></div><p><b>Order details</b><br />{state.order.totalCount} koti{state.order.totalCount === 1 ? "" : "s"} · ₹{state.order.amount}</p><p><b>Personal details</b><br />Roll number: {state.order.rollNumber}<br />Mobile: {state.order.phone}<br />Email: {state.order.email}<br />Hostel / residence: {state.order.hostelOrResidence}<br />Department: {state.order.branch}<br />Degree: {state.order.degree}</p><p><b>Ordered items</b><br />{state.order.designs.map((design) => { const sizes = design.sizes || (design.size ? [design.size] : []); return `${design.name} — ${design.quantity} × ${sizes.join(", ") || "Size not recorded"}`; }).join("; ")}</p><p><b>Pickup code</b><br /><strong>{state.order.pickupCode}</strong></p></div>}<a className="button dark" href="/admin/koti-orders">Back to koti orders</a></section></main>;
}

export default function CollectKotiOrderPage() {
  return <Suspense fallback={<main className="admin-shell"><p>Opening Koti pickup pass…</p></main>}><CollectKotiOrderContent /></Suspense>;
}
