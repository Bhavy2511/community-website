"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANDA_BRANCHES, CHANDA_DEGREES, CHANDA_HOSTELS, CHANDA_YEARS_OF_STUDY } from "../../../../lib/chanda-options";

const blankPoc = { fullName: "", rollNumber: "", hostel: "", branch: "", degree: "", yearOfStudy: "", phone: "", email: "" };
const initialData = { pocs: [], accessCodes: [] };

function PocDetailsFields({ value, onChange }) {
  return <>
    <label>Full name<input value={value.fullName} onChange={onChange("fullName")} placeholder="First Middle Surname" required /></label>
    <label>Roll number<input value={value.rollNumber} onChange={onChange("rollNumber")} required /></label>
    <label>Hostel<select value={value.hostel} onChange={onChange("hostel")} required><option value="">Select hostel</option>{CHANDA_HOSTELS.map((hostel) => <option key={hostel} value={hostel}>{hostel}</option>)}</select></label>
    <label>Branch / department<select value={value.branch} onChange={onChange("branch")} required><option value="">Select branch / department</option>{CHANDA_BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}</select></label>
    <label>Degree<select value={value.degree} onChange={onChange("degree")} required><option value="">Select degree</option>{CHANDA_DEGREES.map((degree) => <option key={degree} value={degree}>{degree}</option>)}</select></label>
    <label>Year of study<select value={value.yearOfStudy} onChange={onChange("yearOfStudy")} required><option value="">Select year</option>{CHANDA_YEARS_OF_STUDY.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
    <label>Contact number<input inputMode="numeric" value={value.phone} onChange={onChange("phone")} required /></label>
    <label>IITG email<input type="email" value={value.email} onChange={onChange("email")} required /></label>
  </>;
}

export default function ChandaPocAdminPage() {
  const [data, setData] = useState(initialData);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [newPoc, setNewPoc] = useState(blankPoc);
  const [pocBusy, setPocBusy] = useState(false);
  const [codeHostel, setCodeHostel] = useState("");
  const [customHostel, setCustomHostel] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [codeBusy, setCodeBusy] = useState(false);
  const [pocActionBusy, setPocActionBusy] = useState("");
  const pocActionLock = useRef(false);
  const [pocCodes, setPocCodes] = useState({});
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedPocHostel, setSelectedPocHostel] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/chanda?includeCodes=1", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) {
      setState("locked");
      setMessage(body.error || "Unlock Chanda admin access first.");
      return;
    }
    setData(body);
    setSelectedHostel((current) => current || CHANDA_HOSTELS[0] || body.accessCodes?.[0]?.hostel || "");
    setSelectedPocHostel((current) => current || body.pocs?.find((poc) => poc.status === "active")?.hostel || "");
    setState("ready");
  }, []);

  useEffect(() => { load(); }, [load]);
  const update = (field) => (event) => setNewPoc((current) => ({ ...current, [field]: event.target.value }));

  async function createPoc(event) {
    event.preventDefault();
    setPocBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/chanda/pocs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPoc) });
    const body = await response.json();
    setPocBusy(false);
    if (!response.ok) return setMessage(body.error || "Unable to add this POC.");
    setData((current) => ({ ...current, pocs: [body.poc, ...current.pocs] }));
    setNewPoc(blankPoc);
    setMessage(`${body.poc.fullName} was added as a pending POC.`);
  }

  async function generateCodes(event) {
    event.preventDefault();
    setCodeBusy(true);
    setMessage("");
    setGeneratedCodes([]);
    const hostel = codeHostel === "__new__" ? customHostel.trim() : codeHostel;
    const response = await fetch("/api/admin/chanda/access-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hostel }) });
    const body = await response.json();
    setCodeBusy(false);
    if (!response.ok) return setMessage(body.error || "Unable to generate hostel codes.");
    setGeneratedCodes(body.codes);
    setSelectedHostel(body.hostel);
    setMessage(`${body.codes.length} codes generated for ${body.hostel}.`);
    load();
  }

  async function generateAllCodes() {
    setCodeBusy(true);
    setMessage("");
    setGeneratedCodes([]);
    const results = await Promise.all(CHANDA_HOSTELS.map(async (hostel) => {
      const response = await fetch("/api/admin/chanda/access-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hostel }) });
      const body = await response.json();
      return { response, body };
    }));
    const generated = results.filter(({ response }) => response.ok).reduce((sum, { body }) => sum + (body.codes?.length || 0), 0);
    setCodeBusy(false);
    setMessage(generated ? `${generated} codes generated across all hostels. Existing complete hostels were left unchanged.` : "All configured hostels already have 20 codes.");
    await load();
  }

  async function assignCode(poc) {
    const accessCode = String(pocCodes[poc.id] || "").trim();
    if (pocActionLock.current || pocActionBusy || !accessCode) return setMessage(accessCode ? "Another POC action is already in progress." : "Select an available code before activating this POC.");
    setMessage("");
    pocActionLock.current = true;
    setPocActionBusy(poc.id);
    try {
      const response = await fetch(`/api/admin/chanda/pocs/${poc.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessCode }) });
      const body = await response.json();
      if (!response.ok) return setMessage(body.error || "Unable to assign this code.");
      setData((current) => ({
        ...current,
        pocs: current.pocs.map((item) => item.id === poc.id ? body.poc : item),
        accessCodes: current.accessCodes.map((code) => code.hostel === poc.hostel && code.code === accessCode
          ? { ...code, status: "assigned", poc: { id: poc.id, fullName: poc.fullName, phone: poc.phone } }
          : code),
      }));
      setPocCodes((current) => ({ ...current, [poc.id]: "" }));
      setSelectedPocHostel(poc.hostel);
      setMessage(`${poc.fullName} is now active.`);
    } catch {
      setMessage("Unable to reach the activation service. Please try again.");
    } finally {
      pocActionLock.current = false;
      setPocActionBusy("");
    }
  }

  const { codeGroups, availableCodesByHostel, assignedCodeByPocId } = useMemo(() => {
    const groups = {};
    const availableByHostel = {};
    const assignedByPoc = new Map();

    for (const code of data.accessCodes) {
      (groups[code.hostel] ||= []).push(code);
      if (code.status === "available" && code.code) (availableByHostel[code.hostel] ||= []).push(code);
      if (code.poc?.id && code.code) assignedByPoc.set(code.poc.id, code.code);
    }

    return {
      codeGroups: groups,
      availableCodesByHostel: availableByHostel,
      assignedCodeByPocId: assignedByPoc,
    };
  }, [data.accessCodes]);
  const { pendingPocs, activePocs, pocHostelTabs } = useMemo(() => {
    const pending = [];
    const active = [];
    const hostels = new Set();

    for (const poc of data.pocs) {
      if (poc.status === "pending") pending.push(poc);
      if (poc.status === "active") {
        active.push(poc);
        hostels.add(poc.hostel);
      }
    }

    return { pendingPocs: pending, activePocs: active, pocHostelTabs: [...hostels].sort() };
  }, [data.pocs]);
  const hostelTabs = [...CHANDA_HOSTELS, ...Object.keys(codeGroups).filter((hostel) => !CHANDA_HOSTELS.includes(hostel)).sort()];
  const selectedCodes = codeGroups[selectedHostel] || [];
  const visiblePocs = useMemo(() => activePocs.filter((poc) => !selectedPocHostel || poc.hostel === selectedPocHostel), [activePocs, selectedPocHostel]);

  if (state === "loading") return <main className="admin-shell"><p>Loading POC access…</p></main>;
  if (state === "locked") return <main className="admin-shell"><section className="admin-login"><p className="eyebrow">CHANDA ADMIN ACCESS</p><h1>Unlock Chanda first.</h1><p>{message}</p><a className="button dark" href="/admin/chanda">Open Chanda dashboard</a></section></main>;

  return <main className="admin-shell">
    <header className="admin-top chanda-admin-hero"><div><p className="eyebrow">GARBARAAS · POC ADMINISTRATION</p><h1>Hostel POC access</h1><p>Review sign-up requests, issue hostel codes and activate approved collectors.</p></div><div className="admin-top-actions"><button className="admin-secondary" onClick={load}>Refresh</button><a className="admin-secondary" href="/admin/chanda">Back to dashboard</a></div></header>
    {message && <p className="chanda-admin-flash">{message}</p>}

    <section className="chanda-admin-section"><p className="eyebrow">HOSTEL POC CODES</p><h2>Generate up to 20 codes per hostel</h2><p className="chanda-section-copy">Generate a private code sheet for each hostel. Assign one available code to a pending POC to activate their collection access.</p><form className="chanda-poc-create" onSubmit={generateCodes}><label>Hostel<select value={codeHostel} onChange={(event) => setCodeHostel(event.target.value)} required><option value="">Select hostel</option>{CHANDA_HOSTELS.map((hostel) => <option key={hostel} value={hostel}>{hostel}</option>)}<option value="__new__">Add a new hostel…</option></select></label>{codeHostel === "__new__" && <label>New hostel name<input value={customHostel} onChange={(event) => setCustomHostel(event.target.value)} placeholder="Enter hostel name" required /></label>}<button className="button dark" disabled={codeBusy}>{codeBusy ? "Generating…" : "Generate remaining codes"}</button><button className="button light" type="button" onClick={generateAllCodes} disabled={codeBusy}>{codeBusy ? "Generating all…" : "Generate all hostel codes"}</button></form>{generatedCodes.length > 0 && <div className="chanda-code-sheet"><strong>New codes: {generatedCodes.join(" · ")}</strong><p>Save these now. They are displayed only once and should be shared privately.</p></div>}</section>

    <section className="chanda-admin-section">
      <p className="eyebrow">POC REQUESTS</p>
      <h2>Pending sign-up requests</h2>
      <p className="chanda-section-copy">Public sign-ups stay pending. A POC becomes active only after you assign an available four-digit code from their hostel.</p>
      <form className="chanda-poc-create" onSubmit={createPoc}><PocDetailsFields value={newPoc} onChange={update} /><button className="button dark" disabled={pocBusy}>{pocBusy ? "Creating…" : "Add pending POC"}</button></form>
      <div className="chanda-poc-list">
        {pendingPocs.length ? pendingPocs.map((poc) => {
          const busy = pocActionBusy === poc.id;
          const availableCodes = availableCodesByHostel[poc.hostel] || [];
          return <article key={poc.id}>
            <div className="chanda-poc-details"><strong>{poc.fullName}</strong><p>{poc.rollNumber} · {poc.hostel} · {poc.branch}</p><p>{poc.degree} · {poc.yearOfStudy}</p><p>{poc.email} · {poc.phone}</p></div>
            <div className="chanda-poc-actions">
              <span className={`chanda-status ${poc.status}`}>{poc.status}</span>
              {poc.accessCode?.codeHint ? <p>Code {assignedCodeByPocId.get(poc.id) || poc.accessCode.codeHint}</p> : poc.status !== "disabled" ? <div className="chanda-poc-activate"><select aria-label={`Available code for ${poc.fullName}`} value={pocCodes[poc.id] || ""} onChange={(event) => setPocCodes((current) => ({ ...current, [poc.id]: event.target.value }))} disabled={Boolean(pocActionBusy) || !availableCodes.length}><option value="">{availableCodes.length ? "Select available code" : "No available codes"}</option>{availableCodes.map((code) => <option key={code.id} value={code.code}>{code.code}</option>)}</select><button type="button" onClick={() => assignCode(poc)} disabled={Boolean(pocActionBusy) || !String(pocCodes[poc.id] || "").match(/^\d{4}$/)}>{busy ? "Activating…" : "Assign & activate"}</button></div> : null}
            </div>
          </article>;
        }) : <p>No pending sign-up requests.</p>}
      </div>
    </section>

    <section className="chanda-admin-section"><p className="eyebrow">HOSTEL-WISE CODE INVENTORY</p><h2>All generated codes and assignments</h2><p className="chanda-section-copy">Each hostel has up to 20 private codes. Available codes are marked unassigned and can be selected for a pending POC.</p>{hostelTabs.length > 0 && <div className="chanda-hostel-tabs" role="tablist">{hostelTabs.map((hostel) => <button key={hostel} className={selectedHostel === hostel ? "selected" : ""} onClick={() => setSelectedHostel(hostel)} role="tab" aria-selected={selectedHostel === hostel}>{hostel}</button>)}</div>}{selectedHostel && <div className="chanda-code-group"><h3>{selectedHostel}</h3><div className="chanda-code-grid">{selectedCodes.map((code) => <article key={code.id}><strong>{code.code || code.codeHint}</strong><span className={`chanda-status ${code.status}`}>{code.status === "available" ? "unassigned" : "assigned"}</span><small>{code.poc ? <>Assigned to {code.poc.fullName}<br />{code.poc.phone || "Contact unavailable"}</> : "Ready for assignment"}</small></article>)}</div></div>}{!data.accessCodes.length && <p className="admin-empty">No hostel codes have been generated yet.</p>}</section>

    <section className="chanda-admin-section"><p className="eyebrow">POC HOSTEL DIRECTORY</p><h2>Active POCs by hostel</h2><div className="chanda-hostel-tabs chanda-poc-tabs" role="tablist">{pocHostelTabs.map((hostel) => <button key={hostel} className={selectedPocHostel === hostel ? "selected" : ""} onClick={() => setSelectedPocHostel(hostel)} role="tab" aria-selected={selectedPocHostel === hostel}>{hostel}</button>)}</div><div className="chanda-poc-directory">{visiblePocs.length ? visiblePocs.map((poc) => <article key={poc.id}><strong>{poc.fullName}</strong><span>{poc.phone || "Contact unavailable"}{assignedCodeByPocId.get(poc.id) ? ` · Code ${assignedCodeByPocId.get(poc.id)}` : ""} · {poc.status}</span></article>) : <p>No active POC accounts yet.</p>}</div></section>
  </main>;
}
