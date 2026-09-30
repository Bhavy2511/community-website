"use client";

import Image from "next/image";

export default function EventDetailsCarousel({ items, eyebrow = "BEHIND THE EVENT", title = <>Every detail,<br /><em>made together.</em></>, copy = "The work, rituals and experiences that make a community celebration feel complete - all visible in one flowing story." }) {
  return <section className="event-details-section"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p className="section-copy">{copy}</p></div><div className="event-detail-list">{items.map((item, index) => <article key={`${item.title}-${index}`} className="event-detail-slide"><div className="event-detail-image"><Image src={item.image} alt={item.title || "Event memory"} fill sizes="(max-width: 680px) 100vw, 50vw" /></div><div className="event-detail-copy">{item.title && <h3>{item.title}</h3>}<p>{item.copy}</p>{item.facts && <ul>{item.facts.map((fact) => <li key={fact}><span>•</span>{fact}</li>)}</ul>}</div></article>)}</div></section>;
}
