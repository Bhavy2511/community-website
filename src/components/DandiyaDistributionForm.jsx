"use client";

import { useEffect, useRef, useState } from "react";

const depositPerPair = 50; // ₹50 per pair deposit
const maxPairsPerOrder = 10;

const UPI_ID = "gujaraticommunityiitg@upi"; // TODO: Replace with actual UPI ID
const UPI_NAME = "Gujarati Community IITG";

function formatAmount(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function DandiyaDistributionForm() {
  const detailsFormRef = useRef(null);

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    email: "",
    quantity: 1,
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [completedPass, setCompletedPass] = useState(null);

  // Online UPI Modal States
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiModalPhase, setUpiModalPhase] = useState("select"); // "select" | "confirming"
  const [paymentReference, setPaymentReference] = useState("");
  const [selectedApp, setSelectedApp] = useState("");

  const totalAmount = details.quantity * depositPerPair;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function goToPayment(event) {
    event.preventDefault();
    setError("");
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(details.email);
    if (
      !details.name.trim() ||
      !/^\d{10}$/.test(details.phone) ||
      !emailValid ||
      !details.quantity
    ) {
      setError("Please complete all fields with a valid phone number and email address.");
      return;
    }
    if (details.quantity < 1 || details.quantity > maxPairsPerOrder) {
      setError(`You can borrow between 1 and ${maxPairsPerOrder} pairs.`);
      return;
    }
    setStep(2);
  }

  function handlePaymentSubmit() {
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    setError("");
    setStatus("");

    if (paymentMethod === "online") {
      // Open UPI App Selection Modal
      setShowUpiModal(true);
      setUpiModalPhase("select");
      setPaymentReference("");
      return;
    }

    // Cash payment flow
    processCashOrder();
  }

  async function processCashOrder() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dandiya-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name.trim(),
          phone: details.phone.trim(),
          email: details.email.trim(),
          quantity: details.quantity,
          paymentMethod: "cash",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create collection pass.");
      }

      setCompletedPass(data);
      setStep(3); // Move to Pass Confirmation Step
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Unable to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function launchUpiApp(appName, deepLink) {
    setSelectedApp(appName);
    // Deep link to trigger selected app / system intent
    const upiUrl = deepLink || `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Dandiya deposit - ${details.quantity} pairs`)}`;
    
    // Open UPI payment app
    window.location.href = upiUrl;

    // Transition modal to confirmation phase
    setUpiModalPhase("confirming");
  }

  async function confirmOnlinePayment() {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/dandiya-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name.trim(),
          phone: details.phone.trim(),
          email: details.email.trim(),
          quantity: details.quantity,
          paymentMethod: "online",
          paymentReference: paymentReference.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Online payment confirmation failed.");
      }

      setShowUpiModal(false);
      setCompletedPass(data);
      setStep(3); // Move to Pass Confirmation Step
    } catch (err) {
      console.error("Online payment confirmation error:", err);
      setError(err.message || "Could not confirm online payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelOnlinePayment() {
    setShowUpiModal(false);
    setUpiModalPhase("select");
    setPaymentReference("");
    setError("Payment was canceled or not completed. No collection QR code was generated.");
  }

  function resetForm() {
    setStep(1);
    setDetails({ name: "", phone: "", email: "", quantity: 1 });
    setPaymentMethod("cash");
    setError("");
    setStatus("");
    setCompletedPass(null);
    setShowUpiModal(false);
  }

  const baseUpiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Dandiya deposit - ${details.quantity} pairs`)}`;

  return (
    <main className="kurta-order-page dandiya-order-page">
      <div className="kurta-order-shell">

        {/* Header intro */}
        <section className="dandiya-page-header">
          <h1>Dandiya <em>Collection</em></h1>
        </section>

        {/* Deposit info strip */}
        <section className="kurta-merch-intro dandiya-info-strip" aria-labelledby="dandiya-info-heading">
          <div className="kurta-merch-copy">
            <p className="eyebrow">ABOUT DANDIYA COLLECTION</p>
            <h2 id="dandiya-info-heading">Deposit-based. <em>Return &amp; reclaim.</em></h2>
            <p>
              We lend Dandiya sticks to all GarbaRaas participants on a refundable deposit basis. Bring them back after the event and your full deposit is returned — no questions asked.
            </p>
          </div>
          <div className="kurta-price-offer">
            <p className="eyebrow">DEPOSIT AMOUNT</p>
            <div className="kurta-price-feature">
              <strong>{formatAmount(depositPerPair)}</strong>
              <span>per pair · fully refundable</span>
            </div>
          </div>
        </section>

        {/* Step indicator */}
        <div className="kurta-steps" aria-label="Form progress">
          <span className={step === 1 ? "active" : "complete"}>01 <b>Your details</b></span>
          <i />
          <span className={step === 2 ? "active" : step === 3 ? "complete" : ""}>02 <b>Payment</b></span>
          <i />
          <span className={step === 3 ? "active" : ""}>03 <b>Collection Pass</b></span>
        </div>

        {/* Notifications */}
        {(error || status) && (
          <div
            className={`kurta-order-notification ${error ? "is-error" : "is-success"}`}
            role="status"
            aria-live="polite"
          >
            {error || status}
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <form ref={detailsFormRef} onSubmit={goToPayment} className="kurta-details-page">
            <section className="kurta-panel">
              <div className="kurta-panel-heading">
                <div>
                  <p className="eyebrow">STEP 01</p>
                  <h2>Your details.</h2>
                </div>
              </div>

              <div className="kurta-details-stack">
                <label>
                  Full name *
                  <input
                    required
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </label>

                <label>
                  WhatsApp number *
                  <input
                    required
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit WhatsApp number"
                    autoComplete="tel"
                  />
                </label>

                <label>
                  Email address *
                  <input
                    required
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  Quantity of Dandiya pairs *
                  <input
                    required
                    type="number"
                    min={1}
                    max={maxPairsPerOrder}
                    value={details.quantity}
                    onChange={(e) => setDetails({ ...details, quantity: Math.max(1, Math.min(maxPairsPerOrder, parseInt(e.target.value) || 1)) })}
                    placeholder={`1 – ${maxPairsPerOrder}`}
                  />
                </label>
              </div>

              {/* Live deposit preview */}
              <div className="dandiya-deposit-preview">
                <span>Deposit for {details.quantity} pair{details.quantity !== 1 ? "s" : ""}</span>
                <strong>{formatAmount(totalAmount)}</strong>
              </div>
            </section>

            {error && <p className="kurta-form-error" role="alert">{error}</p>}

            <button className="kurta-primary-button" type="submit">
              Continue to payment <span>↗</span>
            </button>
          </form>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <section className="kurta-payment-layout">
            {/* Summary */}
            <div className="kurta-panel kurta-summary-panel">
              <div className="kurta-panel-heading">
                <div><h2>Order Summary</h2></div>
                <span>{details.name}</span>
              </div>

              <div className="kurta-summary-list">
                <div>
                  <span>Dandiya pairs</span>
                  <b>{details.quantity} × {formatAmount(depositPerPair)}</b>
                </div>
              </div>

              <div className="kurta-total">
                <span>Total pairs</span>
                <strong>{details.quantity}</strong>
                <span>Deposit payable</span>
                <strong>{formatAmount(totalAmount)}</strong>
              </div>

              <p className="dandiya-refund-note">
                ✦ This deposit is fully refundable upon return of Dandiya sticks after the event.
              </p>
            </div>

            {/* Payment panel */}
            <div className="kurta-panel kurta-qr-panel dandiya-payment-panel">
              <p className="eyebrow">STEP 02 · PAYMENT</p>
              <h2>Choose how<br /><em>to pay.</em></h2>

              <div className="dandiya-payment-options">
                <label className={`dandiya-payment-option ${paymentMethod === "cash" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => { setPaymentMethod(e.target.value); setStatus(""); setError(""); }}
                  />
                  <div className="dandiya-payment-option-body">
                    <span className="dandiya-radio-dot" aria-hidden="true">
                      {paymentMethod === "cash" && <span />}
                    </span>
                    <span className="dandiya-payment-option-icon">₹</span>
                    <div>
                      <b>Cash at counter</b>
                      <p>Pay cash at the collection counter. A QR code pass will be sent to your email &amp; WhatsApp.</p>
                    </div>
                  </div>
                </label>

                <label className={`dandiya-payment-option ${paymentMethod === "online" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => { setPaymentMethod(e.target.value); setStatus(""); setError(""); }}
                  />
                  <div className="dandiya-payment-option-body">
                    <span className="dandiya-radio-dot" aria-hidden="true">
                      {paymentMethod === "online" && <span />}
                    </span>
                    <span className="dandiya-payment-option-icon">📱</span>
                    <div>
                      <b>Pay online via UPI</b>
                      <p>Choose Amazon Pay, GPay, PhonePe, Paytm or any UPI app on your phone.</p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === "online" && (
                <div className="dandiya-upi-note">
                  <p className="eyebrow" style={{ marginBottom: ".4rem" }}>AMOUNT TO PAY</p>
                  <strong className="dandiya-upi-amount">{formatAmount(totalAmount)}</strong>
                  <p>Tapping the button below will let you choose Amazon Pay, GPay, PhonePe or Paytm.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="kurta-payment-actions">
              <button
                className="kurta-secondary-button"
                type="button"
                onClick={() => { setStep(1); setError(""); setStatus(""); }}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                className="kurta-primary-button"
                type="button"
                onClick={handlePaymentSubmit}
                disabled={!paymentMethod || isSubmitting}
                aria-disabled={!paymentMethod || isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : paymentMethod === "online"
                  ? `Pay ${formatAmount(totalAmount)} via UPI`
                  : paymentMethod === "cash"
                  ? "Confirm cash payment"
                  : "Select payment method"} <span>↗</span>
              </button>
            </div>

            {error && <p className="kurta-form-error" role="alert">{error}</p>}
            {status && <p className="kurta-form-success" role="status">{status}</p>}
          </section>
        )}

        {/* Online UPI App Selection & Payment Verification Modal */}
        {showUpiModal && (
          <div className="dandiya-upi-modal-overlay">
            <div className="dandiya-upi-modal-card">
              <button
                type="button"
                className="dandiya-upi-modal-close"
                onClick={cancelOnlinePayment}
                aria-label="Close UPI payment modal"
              >
                ✕
              </button>

              {upiModalPhase === "select" ? (
                <>
                  <p className="eyebrow">ONLINE UPI PAYMENT</p>
                  <h2>Select your <em>UPI App</em></h2>
                  <p className="dandiya-upi-modal-desc">
                    Paying <strong>{formatAmount(totalAmount)}</strong> deposit for {details.quantity} pair{details.quantity !== 1 ? "s" : ""}.
                  </p>

                  <div className="dandiya-upi-apps-grid">
                    <button
                      type="button"
                      className="dandiya-upi-app-card"
                      onClick={() => launchUpiApp("Amazon Pay", baseUpiUrl)}
                    >
                      <span className="dandiya-upi-app-icon amazon">📦</span>
                      <b>Amazon Pay</b>
                      <small>Fast UPI checkout</small>
                    </button>

                    <button
                      type="button"
                      className="dandiya-upi-app-card"
                      onClick={() => launchUpiApp("Google Pay", baseUpiUrl)}
                    >
                      <span className="dandiya-upi-app-icon gpay">🔵</span>
                      <b>Google Pay</b>
                      <small>GPay UPI app</small>
                    </button>

                    <button
                      type="button"
                      className="dandiya-upi-app-card"
                      onClick={() => launchUpiApp("PhonePe", baseUpiUrl)}
                    >
                      <span className="dandiya-upi-app-icon phonepe">🟣</span>
                      <b>PhonePe</b>
                      <small>PhonePe UPI</small>
                    </button>

                    <button
                      type="button"
                      className="dandiya-upi-app-card"
                      onClick={() => launchUpiApp("Paytm", baseUpiUrl)}
                    >
                      <span className="dandiya-upi-app-icon paytm">💙</span>
                      <b>Paytm UPI</b>
                      <small>Paytm Payments</small>
                    </button>

                    <button
                      type="button"
                      className="dandiya-upi-app-card default-app"
                      onClick={() => launchUpiApp("Any UPI App", baseUpiUrl)}
                    >
                      <span className="dandiya-upi-app-icon all">📱</span>
                      <b>Any UPI App</b>
                      <small>System app chooser</small>
                    </button>
                  </div>

                  <div className="dandiya-upi-id-box">
                    <span>UPI ID: <strong>{UPI_ID}</strong></span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(UPI_ID)}
                    >
                      Copy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="eyebrow">PAYMENT VERIFICATION</p>
                  <h2>Completing <em>Payment...</em></h2>
                  <p className="dandiya-upi-modal-desc">
                    Opening <strong>{selectedApp || "your UPI app"}</strong> to pay <strong>{formatAmount(totalAmount)}</strong>.
                  </p>

                  <div className="dandiya-upi-confirm-box">
                    <label>
                      UPI Transaction Ref / UTR (Optional)
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. 428190xxxxxx"
                      />
                    </label>

                    <p className="dandiya-upi-confirm-note">
                      Once payment is completed, tap the button below to generate your Dandiya Collection QR Code Pass.
                    </p>

                    <div className="dandiya-upi-modal-actions">
                      <button
                        type="button"
                        className="kurta-primary-button"
                        onClick={confirmOnlinePayment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Generating Pass..." : "✓ I Have Completed Payment"} <span>↗</span>
                      </button>

                      <button
                        type="button"
                        className="kurta-secondary-button cancel-btn"
                        onClick={cancelOnlinePayment}
                        disabled={isSubmitting}
                      >
                        ✕ Payment Canceled / Failed
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Collection Pass & Confirmation */}
        {step === 3 && completedPass && (
          <section className="dandiya-pass-confirmation">
            <div className="dandiya-pass-banner">
              <span className="dandiya-pass-badge">✓ ORDER CONFIRMED</span>
              <h2>Thank You, <em>{completedPass.orderDetails.name}!</em></h2>
              <p>
                We have generated your Dandiya Collection Pass. A thank-you email with your QR Code has been sent to <strong>{completedPass.orderDetails.email}</strong> and a WhatsApp message to <strong>{completedPass.orderDetails.phone}</strong>.
              </p>
            </div>

            <div className="dandiya-pass-card">
              <div className="dandiya-pass-card-header">
                <p className="eyebrow">DANDIYA COLLECTION PASS</p>
                <span className="dandiya-pass-code">{completedPass.pickupCode}</span>
              </div>

              <div className="dandiya-pass-qr-wrap">
                {completedPass.qrDataUrl ? (
                  <img
                    src={completedPass.qrDataUrl}
                    alt={`Dandiya Collection QR Code ${completedPass.pickupCode}`}
                    className="dandiya-pass-qr-img"
                  />
                ) : (
                  <div className="dandiya-pass-qr-placeholder">QR CODE</div>
                )}
                <p className="dandiya-pass-scan-note">
                  Show this QR code at the collection counter
                </p>
              </div>

              <div className="dandiya-pass-details-list">
                <div>
                  <span>Full Name</span>
                  <strong>{completedPass.orderDetails.name}</strong>
                </div>
                <div>
                  <span>WhatsApp Contact</span>
                  <strong>{completedPass.orderDetails.phone}</strong>
                </div>
                <div>
                  <span>Dandiya Quantity</span>
                  <strong>{completedPass.orderDetails.quantity} Pair{completedPass.orderDetails.quantity !== 1 ? "s" : ""}</strong>
                </div>
                <div>
                  <span>Deposit Amount</span>
                  <strong className="saffron-text">
                    {formatAmount(completedPass.orderDetails.totalAmount)} ({completedPass.orderDetails.paymentMethod === "online" ? "Paid Online via UPI" : "Cash at Counter"})
                  </strong>
                </div>
              </div>

              <div className="dandiya-pass-instructions">
                <p>
                  <strong>Collection Steps:</strong><br />
                  1. Visit the Dandiya Collection Counter.<br />
                  2. Present this QR code or Pass Code <strong>({completedPass.pickupCode})</strong> to our team.<br />
                  3. {completedPass.orderDetails.paymentMethod === "online" ? "Your payment is verified online. Collect your Dandiya pairs directly." : `Pay ${formatAmount(completedPass.orderDetails.totalAmount)} in cash to collect your Dandiya pairs.`}<br />
                  4. Return the Dandiya sticks after the event to reclaim your full deposit in cash.
                </p>
              </div>

              <div className="dandiya-pass-actions">
                {completedPass.whatsappUrl && (
                  <a
                    href={completedPass.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="dandiya-wa-button"
                  >
                    <span>💬</span> Send / Save via WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="kurta-secondary-button"
                >
                  Print / Save Pass
                </button>
              </div>
            </div>

            <div className="dandiya-pass-footer-action">
              <button type="button" onClick={resetForm} className="kurta-primary-button">
                Place another collection request <span>↗</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Decorative art strip, matching the kurta/koti pages */}
      <div className="kurta-order-art-strip" aria-hidden="true" />
    </main>
  );
}
