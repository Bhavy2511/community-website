"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("All");
  useEffect(() => { fetch("/api/news").then((response) => response.json()).then((data) => setArticles(data.articles || [])).catch(() => {}); }, []);
  const categories = ["All", ...new Set(articles.map((item) => item.category).filter(Boolean))];
  const visibleArticles = category === "All" ? articles : articles.filter((item) => item.category === category);
  return <main><SiteHeader /><PageHero eyebrow="GUJARATI COMMUNITY IITG" title={<>News and<br /><em>updates.</em></>} copy="Programme announcements, community opportunities and published updates from the team." image="/community/news/garbaraas-2026-theme-reveal.jpg" imagePosition="center 42%" />
    <section className="news-section"><div className="section-heading"><div><p className="eyebrow">LATEST UPDATES</p><h2>Published by the<br /><em>community.</em></h2></div><p className="section-copy">Clear information about what is planned, what has changed and how you can take part.</p></div><div className="news-filters" aria-label="Filter news by category">{categories.map((item) => <button type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="news-grid news-grid-all">{visibleArticles.map((item) => <article key={item.id || item.slug}><div className="news-card-image" style={{ backgroundImage: `url(${item.slug === "exclusive-festive-kurta-by-garbaraas-order-now" ? "/community/news/garbaraas-2026-kurta-order-poster.jpeg" : item.coverImage || item.image})` }} /><div><p>{item.category} · {item.eventDate || item.date || "Community update"}</p><span>{item.status}</span><h3>{item.title}</h3><p className="news-copy">{item.summary || item.copy}</p>{item.slug && <Link href={`/news/${item.slug}`} className="news-read-link">Read update <span aria-hidden="true">↗</span></Link>}</div></article>)}</div>{visibleArticles.length === 0 && <p className="news-empty">No updates in this category yet.</p>}</section><SiteFooter /></main>;
}
