"use client";
/* eslint-disable @next/next/no-img-element -- payment QR location is configured by the senior admin. */

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CHANDA_BRANCHES, CHANDA_DEGREES, CHANDA_HOSTELS, CHANDA_YEARS_OF_STUDY, iitgEmailFromUsername } from "../lib/chanda-options";

const createSubmissionKey = () => crypto.randomUUID();
const blankDonation = (donorHostel = "") => ({
  submissionKey: createSubmissionKey(),
  donorName: "",
  donorHostel,
  donorEmail: "",
  amount: "",
  paymentMethod: "online",
});
const blankSignup = () => ({
  fullName: "",
  rollNumber: "",
  hostel: "",
  branch: "",
  degree: "",
  yearOfStudy: "",
  phone: "",
  email: "",
});
const scrollToTop = () => {
  if (typeof window === "undefined") return;
  const resetScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  resetScroll();
  window.requestAnimationFrame(() => {
    resetScroll();
    window.requestAnimationFrame(resetScroll);
  });
};
const networkError = "We could not reach the Chanda service. Check your connection and try again.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const receiptEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return email && !email.includes("@") ? `${email}@iitg.ac.in` : email;
};

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function HostelSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} required>
      <option value="">Select hostel</option>
      {CHANDA_HOSTELS.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </select>
  );
}

function BranchSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} required>
      <option value="">Select branch / department</option>
      {CHANDA_BRANCHES.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </select>
  );
}

function FormField({ label, hint, required = false, children }) {
  return (
    <label>
      <span className="chanda-field-label">
        {label}
        {required && <sup aria-hidden="true">*</sup>}
      </span>
      {children}
      {hint && <small className="chanda-field-hint">{hint}</small>}
    </label>
  );
}

function ChandaNotification({ error, loading }) {
  if (!error && !loading) return null;
  return (
    <div
      className={`chanda-notification ${error ? "is-error" : "is-loading"}`}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <span aria-hidden="true">{error ? "!" : "…"}</span>
      {error || loading}
    </div>
  );
}

export default function ChandaPortal() {
  const [session, setSession] = useState(null);
  const [login, setLogin] = useState({
    email: "",
    rollNumber: "",
    hostel: "",
    accessCode: "",
  });
  const [signup, setSignup] = useState(blankSignup);
  const [authMode, setAuthMode] = useState("login");
  const [donation, setDonation] = useState(blankDonation);
  const [collectionStep, setCollectionStep] = useState("details");
  const [qrUrl, setQrUrl] = useState("");
  const [paymentQrIsDemo, setPaymentQrIsDemo] = useState(false);
  const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState(false);
  const [screen, setScreen] = useState("form");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading your Chanda collection workspace…");
  const [completedReceiptNumber, setCompletedReceiptNumber] = useState("");

  const loadSession = useCallback(async () => {
    setLoadingMessage("Loading your Chanda collection workspace…");
    try {
      const { data } = await requestJson("/api/chanda/pocs/session", { cache: "no-store" });
      setSession(data.authenticated ? data.poc : false);
    } catch {
      setSession(false);
      setError(networkError);
    } finally {
      setLoadingMessage("");
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);
  useEffect(() => {
    const context = typeof document !== "undefined" ? document.getElementById("chanda-header-context") : null;
    if (!context) return;
    const label = context.querySelector("span");
    const value = context.querySelector("strong");
    if (!label || !value) return;
    label.textContent = session ? "Collection hostel" : "GarbaRaas 2026";
    value.textContent = session ? session.hostel : "Chanda collection";
    context.setAttribute("aria-label", session ? `Collection hostel: ${session.hostel}` : "Current workspace");
  }, [session]);
  useEffect(() => {
    if (!session) return undefined;
    setDonation((current) => ({ ...current, donorHostel: session.hostel }));
    setLoadingMessage("Loading secure payment details…");
    const controller = new AbortController();

    requestJson("/api/chanda/donations", { cache: "no-store", signal: controller.signal })
      .then(({ response, data }) => {
        if (!response.ok) throw new Error("Unable to load payment settings");
        setQrUrl(data.qrUrl || "");
        setPaymentQrIsDemo(Boolean(data.paymentQrIsDemo));
        setOnlinePaymentAvailable(Boolean(data.onlinePaymentAvailable));
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(networkError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMessage("");
      });

    return () => controller.abort();
  }, [session]);

  const update = (set, field) => (event) =>
    set((current) => ({ ...current, [field]: event.target.value }));

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setLoadingMessage("Signing you in to your collection workspace…");
    try {
      const { response, data } = await requestJson("/api/chanda/pocs/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...login, email: iitgEmailFromUsername(login.email) }),
      });
      if (!response.ok) return setError(data.error || "Unable to sign in.");
      setSession(data.poc);
      scrollToTop();
    } catch {
      setError(networkError);
    } finally {
      setBusy(false);
      setLoadingMessage("");
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setLoadingMessage("Submitting your POC request…");
    try {
      const { response, data } = await requestJson("/api/chanda/pocs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signup, email: iitgEmailFromUsername(signup.email) }),
      });
      if (!response.ok) return setError(data.error || "Unable to submit your request.");
      setSignup(blankSignup());
      setAuthMode("login");
      setNotice("Your request has been submitted. You can sign in after the Chanda admin assigns your hostel code.");
      scrollToTop();
    } catch {
      setError(networkError);
    } finally {
      setBusy(false);
      setLoadingMessage("");
    }
  }

  async function recordDonation() {
    setBusy(true);
    setError("");
    setLoadingMessage("Recording the contribution and preparing the receipt…");
    try {
      const { response, data } = await requestJson("/api/chanda/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donation),
      });
      if (!response.ok) return setError(data.error || "Unable to record this contribution.");
      setCompletedReceiptNumber(data.receiptNumber || "");
      setNotice(data.emailSent ? "The GarbaRaas thank-you receipt, including a PDF copy, has been sent to the donor." : "Collection recorded. The receipt PDF is saved securely and the thank-you email will send once the GarbaRaas mail inbox is configured.");
      setDonation(blankDonation(session.hostel));
      setCollectionStep("details");
      setScreen("complete");
      scrollToTop();
    } catch {
      setError(networkError);
    } finally {
      setBusy(false);
      setLoadingMessage("");
    }
  }

  function continueCollection(event) {
    event.preventDefault();
    setError("");
    const donorEmail = receiptEmail(donation.donorEmail);
    if (!emailPattern.test(donorEmail)) {
      setError("Enter an IITG username (for example, rahul.123) or a complete email address such as rahul@gmail.com.");
      return;
    }
    setDonation((current) => ({ ...current, donorEmail, donorHostel: session.hostel }));
    setCollectionStep("payment");
    scrollToTop();
  }

  async function signOut() {
    try {
      await fetch("/api/chanda/pocs/session", { method: "DELETE" });
    } finally {
      setSession(false);
      setDonation(blankDonation());
      setScreen("form");
      setCollectionStep("details");
      scrollToTop();
    }
  }

  const headerSession =
    session && typeof document !== "undefined"
      ? document.getElementById("chanda-header-session")
      : null;
  const mobileNavSession =
    session && typeof document !== "undefined"
      ? document.getElementById("chanda-mobile-nav-session")
      : null;
  const headerSignOut = session && (headerSession || mobileNavSession)
    ? <>
      {headerSession && createPortal(
        <button
          className="chanda-header-signout"
          type="button"
          onClick={signOut}
        >
          Sign out
        </button>,
        headerSession,
      )}
      {mobileNavSession && createPortal(
        <button
          className="chanda-header-signout chanda-mobile-nav-signout"
          type="button"
          onClick={signOut}
        >
          Sign out
        </button>,
        mobileNavSession,
      )}
    </>
    : null;

  if (session === null)
    return (
      <main className="chanda-shell">
        <ChandaNotification error={error} loading={loadingMessage} />
        <p>Loading collection workspace…</p>
      </main>
    );

  if (!session)
    return (
      <main className="chanda-shell">
        <ChandaNotification error={error} loading={loadingMessage} />
        <section className="chanda-auth">
          <p className="eyebrow">GARBARAAS IITG · POC ACCESS</p>
          <h1>Chanda collection</h1>
          <p>
            Help make GarbaRaas possible, one thoughtful contribution at a time.
          </p>
          {notice && <p className="chanda-notice">{notice}</p>}
          <div className="chanda-tabs" role="tablist">
            <button
              className={authMode === "login" ? "selected" : ""}
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
              role="tab"
              aria-selected={authMode === "login"}
            >
              Sign in
            </button>
            <button
              className={authMode === "signup" ? "selected" : ""}
              onClick={() => {
                setAuthMode("signup");
                setError("");
              }}
              role="tab"
              aria-selected={authMode === "signup"}
            >
              Sign up
            </button>
          </div>
          <p className="chanda-required-note"><span aria-hidden="true">*</span> Required fields</p>
          {authMode === "login" ? (
            <form key="login" onSubmit={submitLogin}>
              <FormField label="IITG email username (excluding @iitg.ac.in)" hint="Example: r.pansuriya — we add @iitg.ac.in automatically." required>
                <input
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={login.email}
                  onChange={update(setLogin, "email")}
                  placeholder="r.pansuriya"
                  required
                />
              </FormField>
              <FormField label="Roll number" required>
                <input
                  value={login.rollNumber}
                  onChange={update(setLogin, "rollNumber")}
                  autoComplete="current-password"
                  required
                />
              </FormField>
              <FormField label="Collection hostel" hint="Choose the hostel where you are collecting Chanda today." required>
                <HostelSelect
                  value={login.hostel}
                  onChange={update(setLogin, "hostel")}
                />
              </FormField>
              <FormField label="Four-digit POC code" hint="This private code is issued by the Chanda admin." required>
                <input
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  value={login.accessCode}
                  onChange={update(setLogin, "accessCode")}
                  required
                />
              </FormField>
              <small>Your sign-in stays active for one hour.</small>
              {error && <p className="admin-message error">{error}</p>}
              <button className="button dark" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form key="signup" onSubmit={submitSignup}>
              <FormField label="Full name" required>
                <input
                  value={signup.fullName}
                  onChange={update(setSignup, "fullName")}
                  placeholder="First Middle Surname"
                  required
                />
              </FormField>
              <FormField label="IITG email username (excluding @iitg.ac.in)" hint="Example: r.pansuriya — we add @iitg.ac.in automatically." required>
                <input
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={signup.email}
                  onChange={update(setSignup, "email")}
                  placeholder="r.pansuriya"
                  required
                />
              </FormField>
              <FormField label="Roll number" required>
                <input
                  value={signup.rollNumber}
                  onChange={update(setSignup, "rollNumber")}
                  required
                />
              </FormField>
              <FormField label="Hostel" required>
                <HostelSelect
                  value={signup.hostel}
                  onChange={update(setSignup, "hostel")}
                />
              </FormField>
              <FormField label="Branch / department" required>
                <BranchSelect
                  value={signup.branch}
                  onChange={update(setSignup, "branch")}
                />
              </FormField>
              <FormField label="Degree" required>
                <select
                  value={signup.degree}
                  onChange={update(setSignup, "degree")}
                  required
                >
                  <option value="">Select degree</option>
                  {CHANDA_DEGREES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Graduating Year" required>
                <select
                  value={signup.yearOfStudy}
                  onChange={update(setSignup, "yearOfStudy")}
                  required
                >
                  <option value="">Select year</option>
                  {CHANDA_YEARS_OF_STUDY.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="WhatsApp contact number" required>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={signup.phone}
                  onChange={update(setSignup, "phone")}
                  placeholder="10-digit WhatsApp number"
                  required
                />
              </FormField>
              {error && <p className="admin-message error">{error}</p>}
              <button className="button dark" disabled={busy}>
                {busy ? "Submitting…" : "Submit POC request"}
              </button>
            </form>
          )}
          <a className="chanda-back-link" href="/garbaraas/2026">
            ← Back to GarbaRaas 2026
          </a>
        </section>
      </main>
    );

  if (screen === "complete")
    return (
      <>
        {headerSignOut}
        <main className="chanda-shell">
          <ChandaNotification error={error} loading={loadingMessage} />
          <section className="chanda-complete">
            <p className="eyebrow">GARBARAAS IITG · COLLECTION RECORDED</p>
            <h1>Thank you for keeping the Raas moving.</h1>
            <p>{notice}</p>
            {completedReceiptNumber && (
              <p className="chanda-receipt-number">
                Receipt number <strong>{completedReceiptNumber}</strong>
              </p>
            )}
            <button
              className="button dark"
              onClick={() => {
                setScreen("form");
                setNotice("");
                setCompletedReceiptNumber("");
                scrollToTop();
              }}
            >
              Collect another Chanda
            </button>
          </section>
        </main>
      </>
    );

  if (collectionStep === "payment")
    return (
      <>
        {headerSignOut}
        <main className="chanda-shell">
          <ChandaNotification error={error} loading={loadingMessage} />
          <header className="chanda-header">
            <div>
              <p className="eyebrow">GARBARAAS IITG · STEP 2 OF 2</p>
              <h1>Confirm the payment.</h1>
              <p>
                Keep the donor with you until the payment is completed and this
                receipt is recorded.
              </p>
            </div>
          </header>
          <section className="chanda-payment-step">
            <div className="chanda-payment-summary">
              <p className="eyebrow">RECEIPT SUMMARY</p>
              <dl>
                <div>
                  <dt>Donor</dt>
                  <dd>{donation.donorName}</dd>
                </div>
                <div>
                  <dt>Contribution</dt>
                  <dd>₹{Number(donation.amount).toLocaleString("en-IN")}</dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>
                    {donation.paymentMethod === "cash" ? "Cash" : "Online"}
                  </dd>
                </div>
                <div>
                  <dt>Hostel</dt>
                  <dd>{donation.donorHostel}</dd>
                </div>
                <div>
                  <dt>Receipt email</dt>
                  <dd>{donation.donorEmail}</dd>
                </div>
              </dl>
              <button
                className="chanda-back-button"
                onClick={() => {
                  setCollectionStep("details");
                  scrollToTop();
                }}
              >
                ← Edit donor details
              </button>
              {donation.paymentMethod === "cash" && (
                <button
                  className="button dark chanda-confirm-cash"
                  disabled={busy}
                  onClick={recordDonation}
                >
                  {busy ? "Recording…" : "Record cash contribution"}
                </button>
              )}
            </div>
            {donation.paymentMethod === "online" && (
              <aside className="chanda-qr chanda-payment-qr">
                <p className="eyebrow">GARBARAAS PAYMENT QR</p>
                <h2>Scan and pay</h2>
                {qrUrl && (
                  <img
                    src={qrUrl}
                    width="560"
                    height="560"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    alt={
                      paymentQrIsDemo
                        ? "Demo Chanda QR code - do not pay"
                        : "GarbaRaas Chanda payment QR code"
                    }
                  />
                )}
                {paymentQrIsDemo || !onlinePaymentAvailable ? (
                  <p className="chanda-notice">
                    <strong>Demo only.</strong> Online collection opens after
                    the senior admin installs the official GarbaRaas QR. Use
                    cash for now.
                  </p>
                ) : (
                  <>
                    <p>
                      Ask the donor to verify the amount before completing
                      payment.
                    </p>
                  </>
                )}
              </aside>
            )}
            {donation.paymentMethod === "online" &&
              !paymentQrIsDemo &&
              onlinePaymentAvailable && (
                <div className="chanda-payment-confirmation">
                  <button
                    className="button dark"
                    disabled={busy}
                    onClick={recordDonation}
                  >
                    {busy ? "Recording…" : "I have received payment"}
                  </button>
                </div>
              )}
          </section>
        </main>
      </>
    );

  return (
    <>
      {headerSignOut}
      <main className="chanda-shell">
        <ChandaNotification error={error} loading={loadingMessage} />
        <header className="chanda-header">
          <div>
            <p className="eyebrow">GARBARAAS IITG · STEP 1 OF 2</p>
            <h1>Kem Cho, {session.fullName.split(" ")[0]}.</h1>
            <p>Chanda collection for <strong>{session.hostel}</strong>.</p>
          </div>
        </header>
        <section className="chanda-receipt">
          <form onSubmit={continueCollection}>
            <p className="eyebrow">DONOR RECEIPT</p>
            <h2>Contribution details</h2>
            <p className="chanda-required-note"><span aria-hidden="true">*</span> Required fields</p>
            <FormField label="Donor name" required>
              <input
                value={donation.donorName}
                onChange={update(setDonation, "donorName")}
                required
              />
            </FormField>
            <FormField label="Amount (₹)" required>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={donation.amount}
                onChange={update(setDonation, "amount")}
                required
              />
            </FormField>
            <FormField label="Payment method" required>
              <select
                value={donation.paymentMethod}
                onChange={update(setDonation, "paymentMethod")}
              >
                <option value="online">Online</option>
                <option value="cash">Cash</option>
              </select>
            </FormField>
            <FormField label="Thank-you receipt email" hint="Example: rahul.123 sends to rahul.123@iitg.ac.in. Full addresses, including Gmail, also work." required>
              <input
                type="text"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={donation.donorEmail}
                onChange={update(setDonation, "donorEmail")}
                placeholder="rahul.123 or rahul@gmail.com"
                required
              />
            </FormField>
            {error && <p className="admin-message error">{error}</p>}
            <button className="button dark" disabled={busy}>
              {busy ? "Saving…" : "Continue to confirmation"}
            </button>
          </form>
          <aside className="chanda-receipt-aside">
            <p className="eyebrow">GARBARAAS IITG</p>
            <h2>A warm thank you, every time.</h2>
            <p>
              Each contribution receives a thoughtful GarbaRaas receipt in the
              donor’s inbox.
            </p>
            <span>Celebrate together</span>
          </aside>
        </section>
      </main>
    </>
  );
}
