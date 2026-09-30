"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const eventDetails = {
  "GarbaRaas": { href: "/garbaraas/2026", label: "NAVRATRI AT IITG", title: "GarbaRaas", copy: "Colour, rhythm and one open circle." },
  "GarbaRaas workshop": { href: "/garbaraas/2026", label: "LEARN THE STEPS", title: "GarbaRaas workshop", copy: "A welcome for every first step." },
  "Nutan Varsh Milan": { href: "/nutan-varsh-milan", label: "GUJARATI NEW YEAR", title: "Nutan Varsh Milan", copy: "A shared table, a warm beginning." },
  "Farewell 2025": { href: "/farewell", label: "FAREWELL 2025", title: "For every next chapter", copy: "A send-off that keeps the circle close." },
};

export default function GalleryCarousel({ items }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 4500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  function move(step) {
    setIndex((current) => (current + step + items.length) % items.length);
  }

  return (
    <section className="gallery-section" id="gallery">
      <div className="section-heading gallery-heading">
        <div><p className="eyebrow">EVENT HIGHLIGHTS</p><h2>What we make <em>together.</em></h2></div>
        <div className="gallery-heading-actions"><p className="section-copy">The celebrations, workshops and shared tables that keep Gujarati culture moving at IIT Guwahati.</p><a className="section-expand" href="/events" data-curtain>Explore all events <span>↗</span></a><div className="gallery-controls"><button onClick={() => move(-1)} aria-label="Previous event highlight">←</button><button onClick={() => move(1)} aria-label="Next event highlight">→</button></div></div>
      </div>
      <div className="gallery-viewport">
        <div className="gallery-track" style={{ "--gallery-index": index }}>
          {items.map((item, itemIndex) => {
            const detail = eventDetails[item.event] || { href: "/events", label: "COMMUNITY EVENT", title: item.event, copy: "A community memory in the making." };
            return <a className={itemIndex === index ? "gallery-card active" : "gallery-card"} href={detail.href} data-curtain key={`${item.id}-${itemIndex}`}>
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 680px) 82vw, 720px" />
              <span className="gallery-card-shade" />
              <span className="gallery-card-content"><small>{detail.label}</small><strong>{detail.title}</strong><em>{detail.copy}</em><i>Explore event <span className="arrow-glyph" aria-hidden="true" /></i></span><b className="gallery-card-year">{item.year}</b>
            </a>;
          })}
        </div>
      </div>
      <div className="gallery-progress"><span style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div>
    </section>
  );
}
