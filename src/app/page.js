"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GalleryCarousel from "../components/GalleryCarousel";
import HeroSlider from "../components/HeroSlider";
import HomeInitiatives from "../components/HomeInitiatives";
import HomeIntroduction from "../components/HomeIntroduction";
import HomeNews from "../components/HomeNews";
import HomePathways from "../components/HomePathways";
import MemberDirectory from "../components/MemberDirectory";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { galleryItems as fallbackGallery, heroSlides, places as fallbackPlaces, roadmap } from "../data/site-content";
import { initiatives } from "../data/initiatives";

export default function Home() {
  const [galleryItems, setGalleryItems] = useState(fallbackGallery);
  const [places, setPlaces] = useState(fallbackPlaces);
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Content unavailable")))
      .then((payload) => {
        if (payload.gallery?.length) setGalleryItems(payload.gallery.map((item) => ({ ...item, id: item._id })));
        if (payload.places?.length) setPlaces(payload.places.map((place) => ({ ...place, id: place._id })));
      })
      .catch((error) => { if (error.name !== "AbortError") console.info("Using bundled public content."); });
    fetch("/api/news?home=1", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("News unavailable")))
      .then((payload) => {
        setNewsItems(payload.articles || []);
      })
      .catch((error) => { if (error.name !== "AbortError") console.info("News is temporarily unavailable."); });
    return () => controller.abort();
  }, []);

  const homeGalleryItems = galleryItems.filter((item, index, allItems) => item.event !== "Farewell 2025" || allItems.findIndex((candidate) => candidate.event === "Farewell 2025") === index);

  return (
    <main>
      <SiteHeader />
      <HeroSlider slides={heroSlides} />

      <HomeIntroduction />

      <HomeNews newsItems={newsItems} />

      <section className="kurta-home-section" id="kurta-koti">
        <div className="kurta-home-heading"><p className="eyebrow">Ordered from Surat, Gujarat.</p><h2>GarbaRaas festival<br /><em>kurta.</em></h2><p>Something festive is being stitched together for the next community celebration.</p></div>
        <div className="kurta-home-options"><a className="kurta-home-option kurta-option" href="/kurta-order" target="_blank" rel="noreferrer"><div className="kurta-home-image"><Image src="/kurta-pictures/1.jpeg" alt="GarbaRaas Kurta" fill sizes="(max-width: 680px) 84vw, 22vw" /></div><div className="kurta-home-option-copy"><small>NOW OPEN</small><h3>Kurta</h3><p>Ten designs</p></div><span className="kurta-home-option-link">View and order here <b aria-hidden="true">↗</b></span></a></div>
      </section>

      <HomeInitiatives initiatives={initiatives} />

      <HomePathways />

      <GalleryCarousel items={homeGalleryItems} />

      <section className="roadmap" id="vision">
        <div className="roadmap-title"><p className="eyebrow">OUR TEN-YEAR VISION</p><h2>From a gathering<br />to a <em>legacy.</em></h2><a className="section-expand" href="/vision" data-curtain>Read the ten-year plan <span>↗</span></a></div>
        <div className="timeline">
          {roadmap.map((phase) => <article key={phase.years}><b>{phase.years}</b><h3>{phase.title}</h3><p>{phase.description}</p></article>)}
        </div>
      </section>

      <section className="food" id="food">
        <div className="food-intro"><p className="eyebrow">AROUND GUWAHATI</p><h2>When you need a taste of <em>home.</em></h2><p className="section-copy">A community-curated guide to Gujarati and Rajasthani comfort food nearby. Addresses and recommendations will be verified before publication.</p><a className="section-expand" href="/food-guide" data-curtain>Open the food guide <span>↗</span></a></div>
        <div className="food-list">
          {places.map((place) => <a className="food-list-card" key={place.id} href={place.mapUrl || "/food-guide"} target={place.mapUrl ? "_blank" : undefined} rel={place.mapUrl ? "noreferrer" : undefined} data-curtain={place.mapUrl ? undefined : true}><div><p>{place.cuisine} · {place.locality}</p><h3>{place.name}</h3><small>{place.description}</small></div><b className="arrow-glyph" aria-hidden="true" /></a>)}
        </div>
      </section>

      <section className="archive-banner" id="archive">
        <Image src="/community/gallery/garba-night.jpeg" alt="GarbaRaas at night" fill sizes="100vw" />
        <div><p className="eyebrow light">MEMORY ARCHIVE · 2022-NOW</p><h2>Every year,<br />a new <em>chapter.</em></h2><p>Photographs, event stories and the people who carried each celebration forward.</p><a className="button light" href="/archive" data-curtain>Browse the archive <span>↗</span></a></div>
      </section>

      <MemberDirectory initialView="core" initialCoreTeamYear="2026" compactCoreTeam pageSize={8} showCoreTeam />

      <section className="join" id="join">
        <p className="eyebrow light">COME SAY KEM CHO</p><h2>There is always room<br />for one more.</h2><p>Students, faculty and alumni - Gujarati or simply curious - are always welcome.</p><a className="button light" href="/contact" data-curtain>Join Gujarati Community IITG <span>↗</span></a>
      </section>

      <SiteFooter />
    </main>
  );
}
