"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const price = 349;
const maxKotiPerOrder = 1;
const sizes = ["M", "L", "XL", "XXL"];
const designs = [
  ["design-01", "Koti Design 1", "/koti-pictures/koti1-v2.jpeg"], ["design-02", "Koti Design 2", "/koti-pictures/koti2-v2.jpeg"],
  ["design-03", "Koti Design 3", "/koti-pictures/koti3-v2.jpeg"], ["design-04", "Koti Design 4", "/koti-pictures/koti4-v2.jpeg"],
];
const initialSelections = Object.fromEntries(designs.map(([id]) => [id, { quantity: 0, sizes: [] }]));
const hostelOptions = ["Brahmaputra", "Dhansiri", "Dihing", "Dikhow", "Disang", "Gaurang", "Kameng", "Kapili", "Manas", "Siang", "Umiam", "Barak", "Lohit", "Subansiri", "Married Scholars' Hostel", "Faculty Quarters", "Day scholar / local residence", "Other residence"];
const degreeOptions = ["B.Tech", "M.Tech", "PhD", "B.Des", "M.Des", "MA", "MBA", "B.Sc", "M.Sc", "M.Sc (By Research)", "M.Sc+PhD", "M.Tech+PhD", "B.Sc (Hons) in DS & AI", "Others"];
const departmentOptions = ["Computer Science & Engineering", "Electronics & Communication Engineering", "Electronics and Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biosciences & Bioengineering", "Design", "Humanities & Social Sciences", "Mathematics", "Physics", "Chemistry", "School of Energy Sciences and Engineering", "Agro and Rural Technology", "Health Sciences and Technology", "Centre for Sustainable Polymers", "Centre for Disaster Management and Research", "School of Data Science and Artificial Intelligence", "CICPS", "Other"];
const formatAmount = (amount) => `₹${amount.toLocaleString("en-IN")}`;

export default function KotiOrderForm() {
  const submissionKeyRef = useRef("");
  const submittingRef = useRef(false);
  const detailsFormRef = useRef(null);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ name: "", rollNumber: "", phone: "", email: "", hostelOrResidence: "", branch: "", degree: "" });
  const [selections, setSelections] = useState(initialSelections);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const selected = designs.map(([id, name, image]) => ({ id, name, image, ...selections[id] })).filter((design) => design.quantity > 0);
  const total = selected.reduce((sum, design) => sum + design.quantity, 0);
  const amount = total * price;
  const selectionsComplete = selected.length > 0 && total <= maxKotiPerOrder && selected.every((design) => design.sizes.length === design.quantity && design.sizes.every(Boolean));
  useEffect(() => {
    if (step !== 2) return undefined;
    const frame = window.requestAnimationFrame(() => {
      detailsFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  function updateQuantity(id, value) {
    const quantity = Number(value);
    setSelections((current) => ({ ...current, [id]: { quantity, sizes: quantity ? Array.from({ length: quantity }, (_, index) => current[id].sizes[index] || "") : [] } }));
  }
  function updatePieceSize(id, index, value) {
    setSelections((current) => { const nextSizes = [...current[id].sizes]; nextSizes[index] = value; return { ...current, [id]: { ...current[id], sizes: nextSizes } }; });
  }
  function goToDetails(event) {
    event.preventDefault(); setError("");
    if (!selected.length || selected.some((design) => design.sizes.length !== design.quantity || design.sizes.some((size) => !size))) return setError("Choose a size for every koti piece.");
    if (total > maxKotiPerOrder) return setError(`A single order can contain a maximum of ${maxKotiPerOrder} kotis.`);
    setStep(2);
  }
  function goToPayment(event) {
    event.preventDefault(); setError("");
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(details.email);
    if (!details.name.trim() || !details.rollNumber.trim() || !/^\d{10}$/.test(details.phone) || !emailValid || !details.hostelOrResidence.trim() || !details.branch.trim() || !details.degree.trim()) return setError("Please complete all your details with a valid roll number, phone number and email address.");
    setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function submitOrder() {
    if (submittingRef.current) return;
    if (!paymentReceipt || !paymentConfirmed) return setError("Upload your payment receipt and confirm that you paid the exact amount before submitting.");
    setStatus("Saving your koti order..."); setError("");
    submittingRef.current = true;
    try {
      if (!submissionKeyRef.current) submissionKeyRef.current = crypto.randomUUID();
      const formData = new FormData();
      formData.append("submissionKey", submissionKeyRef.current);
      Object.entries(details).forEach(([key, value]) => formData.append(key, value));
      formData.append("paymentConfirmed", String(paymentConfirmed));
      formData.append("designs", JSON.stringify(selected.map(({ id, name, quantity, sizes: pieceSizes }) => ({ designId: id, name, quantity, sizes: pieceSizes }))));
      formData.append("paymentReceipt", paymentReceipt);
      const response = await fetch("/api/koti-orders", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to save your koti order.");
      sessionStorage.setItem("kotiPickupPass", JSON.stringify(payload.pickupPass));
      window.location.assign(`/kurta-order/pickup?type=koti&token=${encodeURIComponent(payload.pickupPass.token)}`);
    } catch (submitError) { setStatus(""); setError(submitError.message); submittingRef.current = false; }
  }
  const qrUrl = `/api/payment-qr?product=koti&amount=${amount}`;
  const updateDetail = (key, value) => setDetails((current) => ({ ...current, [key]: value }));

  return <main className={`kurta-order-page kurta-order-page--kurta koti-order-page ${step === 3 ? "kurta-order-page--payment" : ""}`}>
    <div className="kurta-order-shell">
      {(error || status) && <div className={`kurta-order-notification ${error ? "is-error" : "is-success"}`} role="status" aria-live="polite">{error || status}</div>}
      <section className="kurta-event-copy"><div className="kurta-event-title"><h1>GarbaRaas 2026 - Official <em>Koti</em> Order Form</h1></div><div className="kurta-event-details"><p>Please fill this form carefully to place your order for an official GarbaRaas 2026 koti.</p><p>For any query contact:<br /><strong>Nidhi Sharma: 6355515926</strong><br /><strong>Darshan Agrawal: 8770510588</strong></p></div></section>
      <section className="kurta-merch-intro" aria-labelledby="koti-merch-heading"><div className="kurta-merch-copy"><p className="eyebrow">OFFICIAL KOTI</p><h2 id="koti-merch-heading">Made for<br /><em>GarbaRaas.</em></h2><p>Choose your preferred design and size. Every koti is priced the same and includes a secure payment and pickup confirmation flow.</p></div><div className="kurta-price-offer"><p className="eyebrow">KOTI PRICE</p><div className="kurta-price-feature"><strong>₹349</strong><span>per koti</span></div></div></section>
      <div className="kurta-steps" aria-label="Order progress"><span className={step === 1 ? "active" : "complete"}>01 <b>Designs</b></span><i /><span className={step === 2 ? "active" : step > 2 ? "complete" : ""}>02 <b>Personal details</b></span><i /><span className={step === 3 ? "active" : ""}>03 <b>Payment</b></span></div>
      {step === 1 ? <form onSubmit={goToDetails} className="kurta-form">
        <section className="kurta-panel"><div className="kurta-panel-heading"><div><p className="eyebrow">KOTI SIZES</p><h2>Choose your sizes.</h2></div></div><div className="koti-size-cards" aria-label="Available koti sizes">{sizes.map((size) => <div key={size}><b>{size}</b></div>)}</div></section>
        <section className="kurta-panel"><div className="kurta-panel-heading"><div><p className="eyebrow">4 DESIGNS</p><h2>Pick your koti.</h2></div><span>One koti per order</span></div><div className="kurta-design-grid">{designs.map(([id, name, image], index) => { const quantity = selections[id].quantity; const quantityWithoutDesign = total - quantity; return <article className="kurta-design-card" key={id}><button className="kurta-design-image" type="button" onClick={() => setPreview({ name, image })} aria-label={`Enlarge ${name}`}><Image src={image} alt={`${name} koti design`} fill loading="eager" sizes="(max-width: 680px) 88vw, (max-width: 950px) 44vw, 31vw" quality={76} /><span>0{index + 1}</span></button><div className="kurta-design-info"><h3>{name}</h3><label>Number of kotis<select value={String(quantity)} onChange={(event) => updateQuantity(id, event.target.value)}><option value="0">None</option><option value="1" disabled={quantityWithoutDesign + 1 > maxKotiPerOrder}>1</option></select></label>{Array.from({ length: Math.max(quantity, 1) }, (_, piece) => <label key={`${id}-piece-${piece}`} className={`piece-size${quantity === 0 ? " disabled" : ""}`}>{quantity < 1 ? "Size" : `Piece ${piece + 1} size`}<select disabled={quantity < 1} value={quantity > 0 ? selections[id].sizes[piece] || "" : ""} onChange={(event) => updatePieceSize(id, piece, event.target.value)}><option value="">{quantity < 1 ? "Choose quantity first" : "Choose size"}</option>{quantity > 0 && sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>)}</div></article>; })}</div></section>
        {error && <p className="kurta-form-error" role="alert">{error}</p>}<button className="kurta-primary-button" type="submit" disabled={!selectionsComplete} aria-disabled={!selectionsComplete} title={selectionsComplete ? "Continue to personal details" : "Choose a quantity and size for every koti first"}>Add personal details <span>↗</span></button>
      </form> : step === 2 ? <form ref={detailsFormRef} onSubmit={goToPayment} className="kurta-details-page"><section className="kurta-panel"><div className="kurta-panel-heading"><div><h2>Add your details.</h2></div></div><div className="kurta-details-stack"><label>Full name *<input required value={details.name} onChange={(event) => updateDetail("name", event.target.value)} placeholder="Your full name" /></label><label>Roll No. *<input required value={details.rollNumber} onChange={(event) => updateDetail("rollNumber", event.target.value)} placeholder="Your roll number" /></label><label>Mobile no. *<input required inputMode="numeric" maxLength={10} pattern="[0-9]{10}" value={details.phone} onChange={(event) => updateDetail("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" /></label><label>Email address *<input required type="email" title="Enter a valid email address" value={details.email} onChange={(event) => updateDetail("email", event.target.value)} placeholder="name@example.com" /></label><label>Hostel / residence *<select required value={details.hostelOrResidence} onChange={(event) => updateDetail("hostelOrResidence", event.target.value)}><option value="">Choose hostel or residence</option>{hostelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Department *<select required value={details.branch} onChange={(event) => updateDetail("branch", event.target.value)}><option value="">Choose department</option>{departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Degree *<select required value={details.degree} onChange={(event) => updateDetail("degree", event.target.value)}><option value="">Choose degree</option>{degreeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div></section>{error && <p className="kurta-form-error" role="alert">{error}</p>}<div className="kurta-step-actions"><button className="kurta-secondary-button" type="button" onClick={() => setStep(1)}>Back</button><button className="kurta-primary-button" type="submit">Continue to payment <span>↗</span></button></div></form> : <section className="kurta-payment-layout"><div className="kurta-panel kurta-summary-panel"><div className="kurta-panel-heading"><div><h2>Order Summary</h2></div><span>{details.name}</span></div><div className="kurta-summary-list">{selected.map((design) => <div key={design.id}><span>{design.name}<small>{design.sizes.join(", ")}</small></span><b>{design.quantity} × {formatAmount(price)}</b></div>)}</div><div className="kurta-total"><span>Total kotis</span><strong>{total}</strong><span>Amount payable</span><strong>{formatAmount(amount)}</strong></div></div><div className="kurta-panel kurta-qr-panel"><p className="eyebrow">PAYMENT</p><h2>Scan to pay<br /><em>{formatAmount(amount)}</em></h2><Image className="kurta-qr" src={qrUrl} width={560} height={560} loading="eager" unoptimized alt={`Payment QR code for ${formatAmount(amount)}`} /><p className="kurta-qr-note">Scan this QR code to pay the exact amount, then upload your payment receipt to continue.</p><label className="kurta-receipt-upload">Payment receipt *<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0] || null; if (file && file.size > 4 * 1024 * 1024) { event.target.value = ""; setPaymentReceipt(null); setError("Receipt must be smaller than 4 MB."); return; } setPaymentReceipt(file); setError(""); }} /><small>{paymentReceipt ? paymentReceipt.name : "JPG, PNG or WebP · max 4 MB"}</small></label><label className="kurta-payment-confirmation"><input type="checkbox" checked={paymentConfirmed} onChange={(event) => setPaymentConfirmed(event.target.checked)} /> I have paid {formatAmount(amount)} and this screenshot is the payment proof for this order.</label></div><div className="kurta-payment-actions"><button className="kurta-secondary-button" type="button" onClick={() => { setStep(2); setStatus(""); setError(""); }}>Back</button><button className="kurta-primary-button" type="button" onClick={submitOrder} disabled={Boolean(status) || !paymentReceipt || !paymentConfirmed} aria-disabled={Boolean(status) || !paymentReceipt || !paymentConfirmed}>{status || "Confirm & submit"} <span>↗</span></button></div>{error && <p className="kurta-form-error" role="alert">{error}</p>}{status && <p className="kurta-form-success" role="status">{status}</p>}</section>}
    </div>
    {preview && <div className="kurta-image-modal" role="dialog" aria-modal="true" aria-label={`${preview.name} enlarged view`} onClick={() => setPreview(null)}><button type="button" onClick={() => setPreview(null)} aria-label="Close enlarged image">×</button><Image src={preview.image} alt={`${preview.name} enlarged`} width={1000} height={1400} loading="eager" sizes="90vw" quality={82} /></div>}
    <div className="kurta-order-art-strip" aria-hidden="true" />
  </main>;
}
