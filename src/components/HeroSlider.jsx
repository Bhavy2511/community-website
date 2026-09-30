"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDirection("next");
      setIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function move(step) {
    setDirection(step > 0 ? "next" : "previous");
    setIndex((current) => (current + step + slides.length) % slides.length);
  }

  const active = slides[index];

  return (
    <section className={`hero-slider ${direction}`} id="home" aria-roledescription="carousel" aria-label="Community highlights">
      <div className={`hero-slide hero-slide-${direction}`} key={active.id}>
        <Image
          className="hero-backdrop"
          src={active.image}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          style={active.imagePosition ? { objectPosition: active.imagePosition } : undefined}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">{active.eyebrow}</p>
          <h1>{active.title}</h1>
          <p>{active.copy}</p>
          <div className="hero-actions">
            <a className="button light" href={active.primaryHref} data-curtain>{active.primaryLabel}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
      <button className="slider-arrow previous" onClick={() => move(-1)} aria-label="Previous slide">←</button>
      <button className="slider-arrow next" onClick={() => move(1)} aria-label="Next slide">→</button>
      <div className="slider-dots" role="tablist" aria-label="Choose a slide">
        {slides.map((slide, slideIndex) => (
          <button key={slide.id} className={slideIndex === index ? "active" : ""} onClick={() => { setDirection(slideIndex > index ? "next" : "previous"); setIndex(slideIndex); }} aria-label={`Show slide ${slideIndex + 1}`} aria-current={slideIndex === index ? "true" : undefined} />
        ))}
      </div>
    </section>
  );
}
