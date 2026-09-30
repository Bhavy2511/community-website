"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function EventSlideshow({ eyebrow, title, copy, slides, action }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("next");
  const [paused, setPaused] = useState(false);

  const show = useCallback((index, nextDirection = "next") => {
    setDirection(nextDirection);
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => show(current + 1, "next"), [current, show]);
  const previous = useCallback(() => show(current - 1, "previous"), [current, show]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(next, 4800);
    return () => window.clearTimeout(timer);
  }, [current, next, paused]);

  if (!slides?.length) return null;
  const slide = slides[current];

  return (
    <section className="event-slideshow-section">
      <div className="section-heading inverse event-slideshow-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
        <div className="event-slideshow-aside"><p className="section-copy">{copy}</p>{action}</div>
      </div>
      <div className="event-slideshow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
        <figure className={`event-slide ${direction}`} key={`${slide.image}-${current}`}>
          <Image src={slide.image} alt={slide.alt} fill sizes="100vw" style={slide.imagePosition ? { objectPosition: slide.imagePosition } : undefined} />
          <div className="event-slide-shade" />
          <figcaption><div><h3>{slide.title}</h3><p>{slide.caption}</p></div><b>{slide.year}</b></figcaption>
        </figure>
        <button className="event-slide-arrow previous" type="button" onClick={previous} aria-label="Previous photograph">←</button>
        <button className="event-slide-arrow next" type="button" onClick={next} aria-label="Next photograph">→</button>
        <div className="event-slide-dots" role="tablist" aria-label="Choose a photograph">
          {slides.map((item, index) => <button key={item.image} type="button" className={index === current ? "active" : ""} onClick={() => show(index, index < current ? "previous" : "next")} aria-label={`Show photograph ${index + 1}`} aria-selected={index === current} role="tab" />)}
        </div>
      </div>
    </section>
  );
}
