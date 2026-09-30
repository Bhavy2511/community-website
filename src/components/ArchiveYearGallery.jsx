"use client";

import { useMemo, useState } from "react";
import ArchiveGallery from "./ArchiveGallery";
import EventYearNav from "./EventYearNav";

export default function ArchiveYearGallery({ items }) {
  const [year, setYear] = useState("2025");
  const [query, setQuery] = useState("");
  const availableYears = [2025, 2024, 2023, 2022];
  const yearItems = useMemo(() => items.filter((item) => String(item.year) === year), [items, year]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => normalizedQuery
    ? items.filter((item) => `${item.event || ""} ${item.year || ""}`.toLowerCase().includes(normalizedQuery))
    : yearItems, [items, normalizedQuery, yearItems]);
  const years = availableYears.map((item) => ({ year: item, status: item === 2025 ? "Current collection" : "Photo collection" }));
  return <><EventYearNav eventName="community archive" years={years.map((item) => ({ ...item, href: `#archive-${item.year}` }))} activeYear={year} onSelect={setYear} /><div className="archive-search" style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: "2rem", margin: "2.5rem 0 1.5rem" }}><label className="search-field" style={{ maxWidth: "30rem" }}><span>⌕</span><input aria-label="Search the archive" placeholder="Search by event name or year" value={query} onChange={(event) => setQuery(event.target.value)} /></label><p style={{ margin: "0 0 .7rem" }}>{normalizedQuery ? `${filteredItems.length} matching memories across all years` : `Showing ${year} memories`}</p></div><div className="archive-year-results" id={`archive-${year}`} key={`${year}-${normalizedQuery}`}><ArchiveGallery items={filteredItems} /></div></>;
}
