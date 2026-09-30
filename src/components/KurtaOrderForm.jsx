"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const singlePrice = 499;
const bulkPrice = 449;
const maxKurtaPerOrder = 4;
const sizes = ["M", "L", "XL", "XXL"];
const sizeChart = [
  ["M", "39", "17.50", "24", "40.50"],
  ["L", "41", "18", "24.50", "41"],
  ["XL", "43", "19", "25", "41.50"],
  ["XXL", "45", "19.50", "25.50", "42"],
];
const designs = [
  ["design-01", "Kesariya Raas", "/kurta-pictures/1.jpeg"],
  ["design-02", "Neel Bandhej", "/kurta-pictures/2.jpeg"],
  ["design-03", "Gulabi Leher", "/kurta-pictures/3.jpeg"],
  ["design-04", "Rangrez", "/kurta-pictures/4.jpeg"],
  ["design-05", "Mogra Utsav", "/kurta-pictures/5.jpeg"],
  // Keep the stable design-10 id so existing MongoDB orders remain readable.
  ["design-10", "Rajwadi", "/kurta-pictures/10.jpeg"],
  ["design-06", "Kutch Katha", "/kurta-pictures/6.jpeg"],
  ["design-07", "Saffron Bloom", "/kurta-pictures/7.jpeg"],
  ["design-08", "Rangoli", "/kurta-pictures/8.jpeg"],
  ["design-09", "Chandni Chowk", "/kurta-pictures/9.jpeg"],
];

const initialSelections = Object.fromEntries(designs.map(([id]) => [id, { quantity: 0, sizes: [] }]));
const hostelOptions = ["Brahmaputra", "Dhansiri", "Dihing", "Dikhow", "Disang", "Gaurang", "Kameng", "Kapili", "Manas", "Siang", "Umiam", "Barak", "Lohit", "Subansiri", "Married Scholars' Hostel", "Faculty Quarters", "Day scholar / local residence", "Other residence"];
const degreeOptions = ["B.Tech", "M.Tech", "PhD", "B.Des", "M.Des", "MA", "MBA", "B.Sc", "M.Sc", "M.Sc (By Research)", "M.Sc+PhD", "M.Tech+PhD", "B.Sc (Hons) in DS & AI", "Others"];
const departmentOptions = ["Computer Science & Engineering", "Electronics & Communication Engineering", "Electronics and Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biosciences & Bioengineering", "Design", "Humanities & Social Sciences", "Mathematics", "Physics", "Chemistry", "School of Energy Sciences and Engineering", "Agro and Rural Technology", "Health Sciences and Technology", "Centre for Sustainable Polymers", "Centre for Disaster Management and Research", "School of Data Science and Artificial Intelligence", "CICPS", "Other"];

function formatAmount(amount) { return `₹${amount.toLocaleString("en-IN")}`; }

export default function KurtaOrderForm() {
  const submissionKeyRef = useRef("");
  const submittingRef = useRef(false);
  const detailsFormRef = useRef(null);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ name: "", rollNumber: "", phone: "", email: "", hostelOrResidence: "", branch: "", degree: "" });
  const [selections, setSelections] = useState(initialSelections);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [preview, setPreview] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const selected = designs.map(([id, name, image]) => ({ id, name, image, ...selections[id] })).filter((design) => design.quantity > 0);
  const total = selected.reduce((sum, design) => sum + design.quantity, 0);
  const unitPrice = total >= 2 ? bulkPrice : singlePrice;
  const amount = total * unitPrice;
  const selectionsComplete = selected.length > 0 && total <= maxKurtaPerOrder && selected.every((design) => design.sizes.length === design.quantity && design.sizes.every(Boolean));
  useEffect(() => {
    if (step !== 2) return;
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
    setSelections((current) => { const sizesForDesign = [...current[id].sizes]; sizesForDesign[index] = value; return { ...current, [id]: { ...current[id], sizes: sizesForDesign } }; });
  }
  function goToDetails(event) {
    event.preventDefault();
    setError("");
    if (!selected.length || selected.some((design) => design.sizes.length !== design.quantity || design.sizes.some((size) => !size))) {
      setError("Choose a size for every kurta piece.");
      return;
    }
    if (total > maxKurtaPerOrder) {
      setError(`A single order can contain a maximum of ${maxKurtaPerOrder} kurtas.`);
      return;
    }
    setStep(2);
  }

  function goToPayment(event) {
    event.preventDefault();
    setError("");
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(details.email);
    if (!details.name.trim() || !details.rollNumber.trim() || !/^\d{10}$/.test(details.phone) || !emailValid || !details.hostelOrResidence.trim() || !details.branch.trim() || !details.degree.trim()) {
      setError("Please complete all your details with a valid roll number, phone number and email address.");
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitOrder() {
    if (submittingRef.current) return;
    if (!paymentReceipt || !paymentConfirmed) {
      setError("Upload your payment receipt and confirm that you paid the exact amount before submitting.");
      return;
    }
    setStatus("Saving your order...");
    setError("");
    submittingRef.current = true;
    try {
      if (!submissionKeyRef.current) submissionKeyRef.current = crypto.randomUUID();
      const formData = new FormData();
      formData.append("submissionKey", submissionKeyRef.current);
      formData.append("name", details.name);
      formData.append("rollNumber", details.rollNumber);
      formData.append("phone", details.phone);
      formData.append("email", details.email);
      formData.append("hostelOrResidence", details.hostelOrResidence);
      formData.append("branch", details.branch);
      formData.append("degree", details.degree);
      formData.append("paymentConfirmed", String(paymentConfirmed));
      formData.append("designs", JSON.stringify(selected.map(({ id, name, quantity, sizes: pieceSizes }) => ({ designId: id, name, quantity, sizes: pieceSizes }))));
      formData.append("paymentReceipt", paymentReceipt);
      const response = await fetch("/api/kurta-orders", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to save your order.");
      sessionStorage.setItem("kurtaPickupPass", JSON.stringify(payload.pickupPass));
      window.location.assign(`/kurta-order/pickup?type=kurta&token=${encodeURIComponent(payload.pickupPass.token)}`);
    } catch (submitError) {
      setStatus("");
      setError(submitError.message);
      submittingRef.current = false;
    }
  }

  const qrUrl = `/api/payment-qr?product=kurta&amount=${amount}&v=20260924-1`;

  return <main className={`kurta-order-page kurta-order-page--kurta ${step === 3 ? "kurta-order-page--payment" : ""}`}>
    <div className="kurta-order-shell">
      {(error || status) && <div className={`kurta-order-notification ${error ? "is-error" : "is-success"}`} role="status" aria-live="polite">{error || status}</div>}
      <section className="kurta-event-copy"><div className="kurta-event-title"><h1>GarbaRaas 2026 - Official Festival <em>Kurta</em> Order Form</h1></div><div className="kurta-event-details"><p>This order form is open to everyone. Please fill it out carefully to place your order for the official GarbaRaas 2026 kurta.</p><p>For any query contact:<br /><strong>Nidhi Sharma: 6355515926</strong><br /><strong>Darshan Agrawal: 8770510588</strong></p></div></section>
      <section className="kurta-merch-intro" aria-labelledby="kurta-merch-heading"><div className="kurta-merch-copy"><p className="eyebrow">ABOUT THE KURTA</p><h2 id="kurta-merch-heading">Made in Surat.<br /><em>Made to last.</em></h2><p>Our kurtas are ordered from Surat, Gujarat, using really good material. There is no GarbaRaas branding on the kurta, so you can wear it across all the festivals and celebrations at IIT Guwahati.</p></div><div className="kurta-price-offer"><p className="eyebrow">ORDERING OFFER</p><div className="kurta-price-feature"><strong>₹449</strong><span>per kurta when you order 2 or more</span></div><div className="kurta-price-single"><strong>₹499</strong><span>for one kurta</span></div></div></section>
      <div className="kurta-steps" aria-label="Order progress"><span className={step === 1 ? "active" : "complete"}>01 <b>Designs</b></span><i /><span className={step === 2 ? "active" : step > 2 ? "complete" : ""}>02 <b>Personal details</b></span><i /><span className={step === 3 ? "active" : ""}>03 <b>Payment</b></span></div>
      {step === 1 ? <form onSubmit={goToDetails} className="kurta-form">
        <section className="kurta-panel"><div className="kurta-panel-heading"><div><p className="eyebrow">SIZE PREFERENCE</p><h2>Find your fit.</h2></div><span>Measurements in inches</span></div><div className="size-table-wrap"><table><thead><tr><th>Size</th><th>Chest</th><th>Shoulder</th><th>Sleeve</th><th>Length</th></tr></thead><tbody>{sizeChart.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>
        <section className="kurta-panel"><div className="kurta-panel-heading"><div><p className="eyebrow">10 DESIGNS</p><h2>Pick your designs.</h2></div><span>Maximum {maxKurtaPerOrder} kurtas per order</span></div><div className="kurta-design-grid">{designs.map(([id, name, image], index) => { const quantity = selections[id].quantity; const quantityWithoutDesign = total - quantity; return <article className="kurta-design-card" key={id}><button className="kurta-design-image" type="button" onClick={() => setPreview({ name, image })} aria-label={`Enlarge ${name}`}><Image src={image} alt={`${name} kurta design`} fill loading="eager" sizes="(max-width: 680px) 88vw, (max-width: 950px) 44vw, 31vw" quality={76} /><span>0{index + 1}</span></button><div className="kurta-design-info"><h3>{name}</h3><label>Number of kurtas<select value={String(quantity)} onChange={(event) => updateQuantity(id, event.target.value)}><option value="0">None</option><option value="1" disabled={quantityWithoutDesign + 1 > maxKurtaPerOrder}>1</option><option value="2" disabled={quantityWithoutDesign + 2 > maxKurtaPerOrder}>2</option><option value="3" disabled={quantityWithoutDesign + 3 > maxKurtaPerOrder}>3</option></select></label>{Array.from({ length: Math.max(quantity, 1) }, (_, piece) => <label key={`${id}-piece-${piece}`} className={`piece-size${quantity === 0 ? " disabled" : ""}`}>{quantity < 1 ? "Size" : `Piece ${piece + 1} size`}<select disabled={quantity < 1} value={quantity > 0 ? selections[id].sizes[piece] || "" : ""} onChange={(event) => updatePieceSize(id, piece, event.target.value)}><option value="">{quantity < 1 ? "Choose quantity first" : "Choose size"}</option>{quantity > 0 && sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>)}</div></article>; })}</div></section>
        {error && <p className="kurta-form-error" role="alert">{error}</p>}<button className="kurta-primary-button" type="submit" disabled={!selectionsComplete} aria-disabled={!selectionsComplete} title={selectionsComplete ? "Continue to personal details" : "Choose a quantity and size for every kurta first"}>Add personal details <span>↗</span></button>
      </form> : step === 2 ? <form ref={detailsFormRef} onSubmit={goToPayment} className="kurta-details-page"><section className="kurta-panel"><div className="kurta-panel-heading"><div><h2>Add your details.</h2></div></div><div className="kurta-details-stack"><label>Full name *<input required value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} placeholder="Your full name" /></label><label>Roll No. *<input required value={details.rollNumber} onChange={(event) => setDetails({ ...details, rollNumber: event.target.value })} placeholder="Your roll number" /></label><label>Mobile no. *<input required inputMode="numeric" maxLength={10} pattern="[0-9]{10}" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit number" /></label><label>Email address *<input required type="email" title="Enter a valid email address" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} placeholder="name@example.com" /></label><label>Hostel / residence *<select required value={details.hostelOrResidence} onChange={(event) => setDetails({ ...details, hostelOrResidence: event.target.value })}><option value="">Choose hostel or residence</option>{hostelOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Department *<select required value={details.branch} onChange={(event) => setDetails({ ...details, branch: event.target.value })}><option value="">Choose department</option>{departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Degree *<select required value={details.degree} onChange={(event) => setDetails({ ...details, degree: event.target.value })}><option value="">Choose degree</option>{degreeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div></section>{error && <p className="kurta-form-error" role="alert">{error}</p>}<div className="kurta-step-actions"><button className="kurta-secondary-button" type="button" onClick={() => setStep(1)}>Back</button><button className="kurta-primary-button" type="submit">Continue to payment <span>↗</span></button></div></form> : <section className="kurta-payment-layout">
        <div className="kurta-panel kurta-summary-panel"><div className="kurta-panel-heading"><div><h2>Order Summary</h2></div><span>{details.name}</span></div><div className="kurta-summary-list">{selected.map((design) => <div key={design.id}><span>{design.name}<small>{design.sizes.join(", ")}</small></span><b>{design.quantity} × {formatAmount(unitPrice)}</b></div>)}</div><div className="kurta-total"><span>Total kurtas</span><strong>{total}</strong><span>Amount payable</span><strong>{formatAmount(amount)}</strong></div></div>
        <div className="kurta-panel kurta-qr-panel"><p className="eyebrow">PAYMENT</p><h2>Scan to pay<br /><em>{formatAmount(amount)}</em></h2><Image className="kurta-qr" src={qrUrl} width={560} height={560} loading="eager" unoptimized alt={`Payment QR code for ${formatAmount(amount)}`} /><p className="kurta-qr-note">Scan this QR code to pay the exact amount, then upload your payment receipt to continue.</p><label className="kurta-receipt-upload">Payment receipt *<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0] || null; if (file && file.size > 4 * 1024 * 1024) { event.target.value = ""; setPaymentReceipt(null); setError("Receipt must be smaller than 4 MB."); return; } setPaymentReceipt(file); setError(""); }} /><small>{paymentReceipt ? paymentReceipt.name : "JPG, PNG or WebP · max 4 MB"}</small></label><label className="kurta-payment-confirmation"><input type="checkbox" checked={paymentConfirmed} onChange={(event) => setPaymentConfirmed(event.target.checked)} /> I have paid {formatAmount(amount)} and this screenshot is the payment proof for this order.</label></div>
        <div className="kurta-payment-actions"><button className="kurta-secondary-button" type="button" onClick={() => { setStep(2); setStatus(""); setError(""); }}>Back</button><button className="kurta-primary-button" type="button" onClick={submitOrder} disabled={Boolean(status) || !paymentReceipt || !paymentConfirmed} aria-disabled={Boolean(status) || !paymentReceipt || !paymentConfirmed}>Confirm &amp; submit <span>↗</span></button></div>{error && <p className="kurta-form-error" role="alert">{error}</p>}{status && <p className="kurta-form-success" role="status">{status}</p>}
      </section>}
    </div>
    {preview && <div className="kurta-image-modal" role="dialog" aria-modal="true" aria-label={`${preview.name} enlarged view`} onClick={() => setPreview(null)}><button type="button" onClick={() => setPreview(null)} aria-label="Close enlarged image">×</button><Image src={preview.image} alt={`${preview.name} enlarged`} width={1000} height={1400} loading="eager" sizes="90vw" quality={82} /></div>}
    <div className="kurta-order-art-strip" aria-hidden="true" />
  </main>;
}
