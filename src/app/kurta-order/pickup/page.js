"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import GarbaRaasOrderShell from "../../../components/GarbaRaasOrderShell";

export default function KurtaPickupPage() {
  const [pickupPass, setPickupPass] = useState(null);
  const [orderType, setOrderType] = useState("kurta");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") === "koti" ? "koti" : "kurta";
    const token = params.get("token") || "";
    setOrderType(type);
    if (token) {
      fetch(`/api/order-confirmation?type=${type}&token=${encodeURIComponent(token)}`, { cache: "no-store" })
        .then(async (response) => ({ response, data: await response.json() }))
        .then(({ response, data }) => {
          if (!response.ok) throw new Error(data.error || "Unable to load this order confirmation.");
          setPickupPass(data.pickupPass);
          setOrderType(data.orderType);
          setStatus("ready");
        })
        .catch(() => setStatus("error"));
      return;
    }
    try {
      const kotiPass = sessionStorage.getItem("kotiPickupPass");
      const kurtaPass = sessionStorage.getItem("kurtaPickupPass");
      const saved = type === "koti" ? kotiPass : (kurtaPass || kotiPass);
      if (saved) { setPickupPass(JSON.parse(saved)); setOrderType(type === "koti" || (!kurtaPass && kotiPass) ? "koti" : "kurta"); setStatus("ready"); return; }
    } catch { /* The emailed pickup pass remains available if browser storage is unavailable. */ }
    setStatus("error");
  }, []);

  const label = orderType === "koti" ? "KOTI ORDER" : "KURTA ORDER";
  return <GarbaRaasOrderShell product={orderType}><main className="kurta-order-page kurta-pickup-page"><section className="kurta-pickup-pass"><p className="eyebrow">{label}</p><h1>Thank <em>you!</em></h1>{status === "loading" ? <p>Loading your secure pickup pass…</p> : pickupPass ? <><p className="kurta-pickup-message">Your {orderType} will be delivered soon. We’ll contact you once it arrives.</p><Image src={pickupPass.qrDataUrl} width={520} height={520} loading="eager" unoptimized alt={`${orderType} pickup QR code`} /><p>Keep this QR code for delivery and collection. Your order details have also been emailed to you. If you don’t see the email in your inbox, please check your <strong>junk or spam folder</strong>.</p><strong>{pickupPass.code}</strong></> : <p>This confirmation link is unavailable. Please use the pickup QR sent to your email, or contact the GarbaRaas team.</p>}<a className="kurta-secondary-button" href={orderType === "koti" ? "/koti-order" : "/kurta-order"}>Back to {orderType} orders</a></section></main></GarbaRaasOrderShell>;
}
