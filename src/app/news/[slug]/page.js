"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";

export default function NewsArticlePage({ params }) {
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState("loading");
  useEffect(() => { fetch(`/api/news/${params.slug}`).then(async (response) => ({ response, data: await response.json() })).then(({ response, data }) => { if (!response.ok) throw new Error(data.error); setArticle(data.article); setState("ready"); fetch("/api/news").then(result=>result.json()).then(payload=>setRelated((payload.articles||[]).filter(item=>item.slug!==params.slug).slice(0,3))).catch(()=>{}); }).catch(() => setState("missing")); }, [params.slug]);
  const share=async()=>{const url=window.location.href;if(navigator.share){await navigator.share({title:article.title,text:article.summary,url}).catch(()=>{})}else{await navigator.clipboard.writeText(url);window.alert("Article link copied.")}};
  if (state === "loading") return <main><SiteHeader /><section className="news-article-state">Loading update…</section><SiteFooter /></main>;
  if (state === "missing") return <main><SiteHeader /><section className="news-article-state"><p className="eyebrow">NEWS</p><h1>This update is not available.</h1><Link href="/news" className="text-link">Back to all news</Link></section><SiteFooter /></main>;
  const isKurtaArticle = article.slug === "exclusive-festive-kurta-by-garbaraas-order-now";
  const heroImage = isKurtaArticle ? "/community/news/garbaraas-2026-kurta-order-poster.jpeg" : article.coverImage;
  return <main><SiteHeader /><article className="news-article"><div className={`news-article-hero${isKurtaArticle ? " news-article-hero-kurta" : ""}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(11,38,31,.78), rgba(11,38,31,.22)), url(${heroImage})` }}><div><p className="eyebrow">{article.category} · {article.eventDate || "Community update"}</p><span>{article.status}</span><h1>{article.title}</h1><p>{article.summary}</p>{article.location && <small>{article.location}</small>}</div></div><div className="news-article-body"><p className="eyebrow">{article.author} · {article.publishedAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(article.publishedAt)) : ""}</p>{(article.content || article.summary).split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="news-article-actions">{article.ctaLabel && article.ctaHref && <a className="button dark" href={article.ctaHref}>{article.ctaLabel}</a>}<button type="button" className="button outline" onClick={share}>Share update</button></div><Link href="/news" className="text-link">Back to all news</Link></div></article>{related.length>0&&<section className="related-news"><p className="eyebrow">MORE FROM THE COMMUNITY</p><div>{related.map(item=><Link href={`/news/${item.slug}`} key={item.slug}><span>{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p></Link>)}</div></section>}<SiteFooter /></main>;
}
