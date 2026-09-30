"use client";

import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const fallbackIssues = [
  { id: "01", date: "September 2026", title: "The first circle", copy: "A working notebook for the people, events and small acts of care that keep Gujarati Community IITG moving.", status: "In preparation" },
  { id: "02", date: "August 2026", title: "Before the lights come on", copy: "Notes from the teams preparing GarbaRaas 2026, and the traditions that make a new batch feel at home.", status: "Planned" },
  { id: "03", date: "Archive issue", title: "Where it began", copy: "A collected record of the first gatherings, the places that hosted them and the people who made room for one more.", status: "Coming soon" },
];

export default function MagazinePage() {
  const [issues,setIssues]=useState(fallbackIssues);
  useEffect(()=>{fetch("/api/magazine").then(response=>response.json()).then(data=>{if(data.issues?.length)setIssues(data.issues)}).catch(()=>{})},[]);
  return <main><SiteHeader /><PageHero eyebrow="THE CIRCLE · MONTHLY" title={<>A small record of<br /><em>what we share.</em></>} copy="A future monthly magazine for Gujarati Community IITG: people, opportunities, memories and honest progress on the ten-year plan." image="/community/garba-raas-2025/garbaraas-2025-02.jpg"><a className="button light" href="/contact" data-curtain>Suggest a story <span>↗</span></a></PageHero>
    <section className="magazine-intro"><p className="eyebrow">THE CIRCLE</p><h2>Not a brochure. A living <em>notebook.</em></h2><p>Each issue will be made from real contributions: a student finding a mentor, an old photograph finally named, a volunteer who stayed late to put the chairs away. The archive will grow with the community.</p></section>
    <section className="magazine-grid">{issues.map((issue) => <article key={issue.id || issue.slug}><p className="eyebrow">{issue.issueLabel || issue.date} · {issue.status}</p><h3>{issue.title}</h3><p>{issue.summary || issue.copy}</p><a href={issue.slug ? `/magazine/${issue.slug}` : "/contact"} data-curtain>{issue.slug ? "Read issue" : "Contribute a note"} <span>↗</span></a></article>)}</section>
    <section className="magazine-signup"><p className="eyebrow">BE PART OF THE NEXT ISSUE</p><h2>Have a memory, opportunity or idea to share?</h2><a className="button dark" href="/contact" data-curtain>Write to the team <span>↗</span></a></section><SiteFooter /></main>;
}
