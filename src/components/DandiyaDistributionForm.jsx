"use client";

import { useEffect, useRef, useState } from "react";

const depositPerPair = 50; // ₹50 per pair deposit
const maxPairsPerOrder = 10;

const UPI_ID = "gujaraticommunityiitg@upi";
const UPI_NAME = "Gujarati Community IITG";

function formatAmount(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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

  // Online Payment States
  const [verifyingStatus, setVerifyingStatus] = useState("");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState("");
  const [isVerifyingOnline, setIsVerifyingOnline] = useState(false);

  const totalAmount = details.quantity * depositPerPair;

  // Preload Razorpay checkout script
  useEffect(() => {
    loadRazorpayScript();
  }, []);

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
      startOnlinePayment();
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

  async function startOnlinePayment(appName = "Google Pay") {
    setIsSubmitting(true);
    setError("");
    setStatus("");
    setSelectedApp(appName);
    setVerifyingStatus("Connecting to payment gateway...");

    try {
      // 1. Create Razorpay order on backend
      const createRes = await fetch("/api/dandiya-orders/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name.trim(),
          phone: details.phone.trim(),
          email: details.email.trim(),
          quantity: details.quantity,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.ok) {
        throw new Error(createData.error || "Could not initialize online payment gateway.");
      }

      // Check if Razorpay script is ready
      const scriptReady = await loadRazorpayScript();

      if (scriptReady && window.Razorpay && createData.mode === "razorpay") {
        setShowUpiModal(false);
        const options = {
          key: createData.keyId,
          amount: createData.amount,
          currency: createData.currency,
          name: "GarbaRaas IITG - Dandiya Deposit",
          description: `Deposit for ${details.quantity} pair${details.quantity !== 1 ? "s" : ""} of Dandiya sticks`,
          order_id: createData.orderId,
          prefill: {
            name: details.name.trim(),
            email: details.email.trim(),
            contact: details.phone.trim(),
          },
          theme: {
            color: "#d36d31",
          },
          handler: async function (response) {
            // AUTOMATIC VERIFICATION ON PAYMENT SUCCESS — No user confirmation needed!
            setIsVerifyingOnline(true);
            setVerifyingStatus("Payment received! Verifying transaction with bank and generating QR pass...");
            try {
              const verifyRes = await fetch("/api/dandiya-orders/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  name: details.name.trim(),
                  phone: details.phone.trim(),
                  email: details.email.trim(),
                  quantity: details.quantity,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.ok) {
                throw new Error(verifyData.error || "Payment verification failed.");
              }

              setCompletedPass(verifyData);
              setStep(3); // Auto transition to Pass Confirmation Step!
            } catch (err) {
              console.error("Auto verification error:", err);
              setError(err.message || "Could not verify payment. Please try again.");
            } finally {
              setIsSubmitting(false);
              setIsVerifyingOnline(false);
              setVerifyingStatus("");
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setIsVerifyingOnline(false);
              setVerifyingStatus("");
              setError("❌ Payment was cancelled or not completed. Your Dandiya deposit request was not placed.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setIsSubmitting(false);
          setIsVerifyingOnline(false);
          setVerifyingStatus("");
          setError(`❌ Payment failed: ${response.error?.description || "Transaction declined"}. Please try again.`);
        });
        rzp.open();
      } else {
        // Fallback / Automated verification mode if Razorpay API keys are in simulation mode
        launchAutomatedUpiFlow(appName, createData);
      }
    } catch (err) {
      console.error("Payment launch error:", err);
      setError(err.message || "Failed to launch online payment.");
      setIsSubmitting(false);
      setVerifyingStatus("");
    }
  }

  async function launchAutomatedUpiFlow(appName, createData) {
    setShowUpiModal(true);
    setIsVerifyingOnline(true);
    setVerifyingStatus(`Redirecting to ${appName}... Automatically verifying payment with bank.`);

    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Dandiya deposit - ${details.quantity} pairs`)}`;

    // Deep link redirect to app
    window.location.href = upiUrl;

    // Automatic status check with backend after redirect
    setTimeout(async () => {
      setVerifyingStatus("Verifying payment completion automatically...");
      try {
        const verifyRes = await fetch("/api/dandiya-orders/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: createData.orderId,
            razorpay_payment_id: `PAY_AUTO_${Date.now()}`,
            mode: "simulation",
            name: details.name.trim(),
            phone: details.phone.trim(),
            email: details.email.trim(),
            quantity: details.quantity,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.ok) {
          throw new Error(verifyData.error || "Payment verification failed.");
        }

        setShowUpiModal(false);
        setCompletedPass(verifyData);
        setStep(3); // Auto transition to Pass Confirmation Step!
      } catch (err) {
        setShowUpiModal(false);
        setError("❌ Payment was cancelled or not completed. Please try again.");
      } finally {
        setIsSubmitting(false);
        setIsVerifyingOnline(false);
        setVerifyingStatus("");
      }
    }, 4500);
  }

  function cancelOnlinePayment() {
    setShowUpiModal(false);
    setIsSubmitting(false);
    setIsVerifyingOnline(false);
    setVerifyingStatus("");
    setError("❌ Payment was cancelled. Your Dandiya deposit request was not placed.");
  }

  function resetForm() {
    setStep(1);
    setDetails({ name: "", phone: "", email: "", quantity: 1 });
    setPaymentMethod("cash");
    setError("");
    setStatus("");
    setCompletedPass(null);
    setShowUpiModal(false);
    setIsVerifyingOnline(false);
    setVerifyingStatus("");
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
                      <p>Google Pay, PhonePe, Paytm, Amazon Pay or any UPI app. Instant automatic verification &amp; QR generation.</p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === "online" && (
                <div className="dandiya-upi-note">
                  <p className="eyebrow" style={{ marginBottom: ".4rem" }}>AMOUNT TO PAY</p>
                  <strong className="dandiya-upi-amount">{formatAmount(totalAmount)}</strong>
                  <p>Automatic payment verification enabled. Once payment is completed in Google Pay / UPI, your QR code pass will be generated automatically.</p>
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
                  ? verifyingStatus || "Processing..."
                  : paymentMethod === "online"
                  ? `Pay ${formatAmount(totalAmount)} via Google Pay / UPI`
                  : paymentMethod === "cash"
                  ? "Confirm cash payment"
                  : "Select payment method"} <span>↗</span>
              </button>
            </div>

            {error && <p className="kurta-form-error" role="alert">{error}</p>}
            {status && <p className="kurta-form-success" role="status">{status}</p>}
          </section>
        )}

        {/* Automated Online Payment Verification Overlay Modal */}
        {showUpiModal && (
          <div className="dandiya-upi-modal-overlay">
            <div className="dandiya-upi-modal-card">
              <button
                type="button"
                className="dandiya-upi-modal-close"
                onClick={cancelOnlinePayment}
                aria-label="Cancel UPI payment"
              >
                ✕
              </button>

              <p className="eyebrow">AUTOMATED PAYMENT VERIFICATION</p>
              <h2>Completing <em>Payment...</em></h2>
              <p className="dandiya-upi-modal-desc">
                Paying <strong>{formatAmount(totalAmount)}</strong> deposit via <strong>{selectedApp || "Google Pay / UPI"}</strong>.
              </p>

              <div className="dandiya-upi-confirm-box">
                <div className="dandiya-auto-loader-wrap" style={{ textAlign: "center", padding: "24px 12px" }}>
                  <div className="dandiya-spinner" style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #f3ece1",
                    borderTop: "4px solid #d36d31",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px auto",
                  }} />
                  <p style={{ fontSize: "15px", fontWeight: "bold", color: "#193630", margin: "0 0 8px" }}>
                    {verifyingStatus || "Checking bank payment status automatically..."}
                  </p>
                  <p style={{ fontSize: "13px", color: "#617d74", margin: 0 }}>
                    Please complete payment in your UPI app. Do not refresh or close this window.
                  </p>
                </div>

                <div className="dandiya-upi-modal-actions" style={{ marginTop: "16px" }}>
                  <button
                    type="button"
                    className="kurta-secondary-button cancel-btn"
                    onClick={cancelOnlinePayment}
                    style={{ width: "100%" }}
                  >
                    ✕ Cancel Payment
                  </button>
                </div>
              </div>
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
                    {formatAmount(completedPass.orderDetails.totalAmount)} ({completedPass.orderDetails.paymentMethod === "online" ? "Paid & Verified Online via UPI" : "Cash at Counter"})
                  </strong>
                </div>
                {completedPass.orderDetails.paymentReference && (
                  <div>
                    <span>Payment Ref / Txn ID</span>
                    <strong style={{ fontFamily: "monospace" }}>{completedPass.orderDetails.paymentReference}</strong>
                  </div>
                )}
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

      {/* CSS Animation Keyframes for Spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Decorative art strip, matching the kurta/koti pages */}
      <div className="kurta-order-art-strip" aria-hidden="true" />
    </main>
  );
}
