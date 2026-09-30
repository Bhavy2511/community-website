"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { coreTeamByYear } from "../data/core-team";
import PaginationControls from "./PaginationControls";

const filters = ["All", "Core team", "Faculty", "Members", "Alumni"];
const defaultPageSize = 16;
const initials = (name) => name.split(" ").map((part) => part[0]).slice(0, 2).join("");

function Portrait({ person, priority = false }) {
  if (!person.image) return <span className="team-portrait monogram" aria-hidden="true">{initials(person.name)}</span>;
  return <span className="team-portrait"><Image src={person.image} alt={`Portrait of ${person.name}`} fill sizes="(max-width: 700px) 88vw, 13rem" priority={priority} /></span>;
}

function CoreTeam({ query, initialYear = "2026", compact = false }) {
  const [year, setYear] = useState(initialYear);
  const team = coreTeamByYear[year];
  const normalizedQuery = query.trim().toLowerCase();
  const matching = (person) => !normalizedQuery || `${person.name} ${person.role || ""} ${person.detail}`.toLowerCase().includes(normalizedQuery);
  const head = team.students[0];
  const students = team.students.slice(1).filter(matching);
  const guidingProfessors = team.professors.filter(matching);

  return <div className={`team-directory ${compact ? "team-directory-compact" : ""}`}>
    <div className="team-year-switcher" aria-label="Choose a core team year"><span>CORE TEAM YEAR</span><div>{Object.entries(coreTeamByYear).map(([teamYear, entry]) => <button key={teamYear} type="button" className={year === teamYear ? "selected" : ""} onClick={() => setYear(teamYear)}><b>{entry.label}</b><small>{year === teamYear ? "Viewing roster" : "View roster"}</small></button>)}</div></div>
    {matching(head) && <article className="community-head">{compact ? <div className="compact-head-image"><Portrait person={head} priority /></div> : <Portrait person={head} priority />}<div><p className="eyebrow">COMMUNITY HEAD</p><h3>{head.name}</h3><p className="team-role">{head.detail}</p>{compact && <p className="compact-head-copy">Building connections across batches.<br />Keeping Gujarati traditions close at IITG.</p>}<div className="team-description"><p>Viraj has played a central role in bringing Gujarati students at IIT Guwahati from a scattered network into a more connected, organised community.</p><p>His work has helped establish a shared member directory, clearer communication channels and a foundation for cultural traditions that future student teams can carry forward.</p></div><span className="leadership-mark">FOUNDATION AND CONTINUITY</span></div></article>}
    <div className="team-branch" aria-hidden="true"><span>↓</span></div>
    <section className="team-group"><div className="team-group-heading"><div><p className="eyebrow">STUDENT CORE TEAM</p><span className="team-intro">The student team turns ideas into events, welcomes new members and carries the day-to-day rhythm of the community.</span></div></div><div className="team-card-grid">{students.map((person) => <article className="team-card" key={person.name}><Portrait person={person} /><div><p>{person.role}</p><h3>{person.name}</h3><span>{person.detail}</span></div></article>)}</div></section>
    <section className="team-group faculty-group"><div className="team-group-heading"><div><p className="eyebrow">GUIDING PROFESSORS</p><span className="team-intro">Our faculty advisers offer perspective, encouragement and institutional guidance as the community grows with each new batch.</span></div></div><div className="team-card-grid professor-grid">{guidingProfessors.map((person) => <article className="team-card professor-card" key={person.name}><Portrait person={person} /><div><p>Guiding professor</p><h3>{person.name}</h3><span>{person.detail}</span></div></article>)}</div></section>
    {!students.length && !guidingProfessors.length && !matching(head) && <p className="empty-state">No core-team profiles match your search.</p>}
  </div>;
}

export default function MemberDirectory({ initialView = "members", initialCoreTeamYear = "2026", compactCoreTeam = false, standalone = false, pageSize = defaultPageSize, showCoreTeam = true }) {
  const [view, setView] = useState(initialView);
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState("idle");
  const [page, setPage] = useState(1);
  const [databaseTotal, setDatabaseTotal] = useState(0);

  useEffect(() => {
    if (view !== "members") return undefined;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (query.trim()) params.set("q", query.trim());
    if (filter !== "All") params.set("category", filter);
    setStatus("loading");
    fetch(`/api/members?${params}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Directory unavailable")))
      .then((payload) => { if (payload.source !== "mongodb") throw new Error("Directory unavailable"); setMembers(payload.members || []); setDatabaseTotal(payload.pagination?.total || 0); setStatus("ready"); })
      .catch((error) => { if (error.name !== "AbortError") { setMembers([]); setStatus("error"); } });
    return () => controller.abort();
  }, [view, page, query, filter, pageSize]);

  const visibleMembers = useMemo(() => [...members]
    .filter((member) => {
      const searchable = `${member.name} ${member.programme} ${member.department} ${member.role}`.toLowerCase();
      return searchable.includes(query.toLowerCase()) && (filter === "All" || member.category === filter);
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })), [members, query, filter]);
  const totalPages = Math.max(1, Math.ceil(databaseTotal / pageSize));
  const changeQuery = (value) => { setQuery(value); setPage(1); };
  const changeFilter = (value) => { setFilter(value); setPage(1); };
  const changeView = (nextView) => { setView(nextView); setQuery(""); setFilter("All"); setPage(1); };

  return <section className={`directory ${standalone ? "directory-standalone" : ""}`} id="directory">
    <div className="section-heading"><div><p className="eyebrow">COMMUNITY DIRECTORY</p><h2>{view === "core" ? <>The people who keep<br /><em>the circle moving.</em></> : <>Find your <em>people.</em></>}</h2></div><p className="section-copy">{view === "core" ? "Meet the student team and guiding professors behind Gujarati Community IITG." : "Search by name, degree, department or role. Private contact details never leave our secure database."}</p></div>
    {showCoreTeam && <div className="directory-view-tabs" role="tablist" aria-label="Directory view"><button type="button" className={view === "core" ? "selected" : ""} onClick={() => changeView("core")} role="tab" aria-selected={view === "core"}>Core Team</button><button type="button" className={view === "members" ? "selected" : ""} onClick={() => changeView("members")} role="tab" aria-selected={view === "members"}>Members</button></div>}
    <div className="directory-tools"><label className="search-field"><span>⌕</span><input aria-label={view === "core" ? "Search the core team" : "Search the community directory"} placeholder={view === "core" ? "Search the core team" : "Search name, degree or department"} value={query} onChange={(event) => changeQuery(event.target.value)} /></label>{view === "members" && <div className="filters" aria-label="Filter members">{filters.map((item) => <button type="button" key={item} className={filter === item ? "selected" : ""} onClick={() => changeFilter(item)}>{item}</button>)}</div>}</div>
    {view === "core" ? <CoreTeam query={query} initialYear={initialCoreTeamYear} compact={compactCoreTeam} /> : <><div className="member-grid">{visibleMembers.map((member) => <article className="member-card" key={member._id}><span className="monogram">{initials(member.name)}</span><p>{member.category}</p><h3>{member.name}</h3><span>{[member.programme, member.department, member.graduationYear].filter(Boolean).join(" · ")}</span><small>{member.leadershipRole || member.role}</small></article>)}{status === "loading" && <p className="empty-state">Loading the community directory...</p>}{status === "ready" && !visibleMembers.length && <p className="empty-state">No members match your search.</p>}{status === "error" && <p className="empty-state">The directory is temporarily unavailable. Please try again shortly.</p>}</div>{status === "ready" && <PaginationControls page={page} totalPages={totalPages} total={databaseTotal} pageSize={pageSize} onPageChange={setPage} label="Community directory" />}</>}
    {!standalone && <a className="section-expand" href="/directory" data-curtain>Explore the full directory <span>↗</span></a>}
  </section>;
}
