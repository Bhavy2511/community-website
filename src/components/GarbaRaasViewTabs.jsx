"use client";

import { useState } from "react";
import GarbaRaasCoreTeam from "./GarbaRaasCoreTeam";

export default function GarbaRaasViewTabs({ year, children }) {
  const [view, setView] = useState("event");

  return <><section className="garbaraas-view-switcher"><p className="eyebrow">EXPLORE GARBARAAS {year}</p><div role="tablist" aria-label={`GarbaRaas ${year} page view`}><button type="button" role="tab" aria-selected={view === "event"} className={view === "event" ? "active" : ""} onClick={() => setView("event")}>GarbaRaas {year}</button><button type="button" role="tab" aria-selected={view === "team"} className={view === "team" ? "active" : ""} onClick={() => setView("team")}>Meet the Core Team</button></div></section><div className="garbaraas-view-content" key={view}>{view === "event" ? children : <GarbaRaasCoreTeam year={year} />}</div></>;
}
