"use client";

import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { places as fallbackPlaces } from "../../data/site-content";

export default function FoodGuidePage() {
  const [places, setPlaces] = useState(fallbackPlaces);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Food guide unavailable")))
      .then((payload) => { if (payload.places?.length) setPlaces(payload.places); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return <main><SiteHeader /><PageHero eyebrow="AROUND GUWAHATI" title={<>When you need<br />a taste of <em>home.</em></>} copy="A living list of Gujarati and Rajasthani comfort food, maintained by the community for students settling into Guwahati." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-07.jpeg"><a className="button light" href="/contact" data-curtain>Suggest a place <span>↗</span></a></PageHero>
    <section className="food-guide-intro"><p className="eyebrow">COMMUNITY PICKS</p><h2>Good food is a shortcut to <em>belonging.</em></h2><p>These are early community recommendations. Exact addresses, menus and map links are published only after the student team verifies them, so the guide stays useful rather than becoming a list of outdated names.</p></section>
    <section className="food-guide-list">{places.map((place) => <article key={place._id || place.id || place.name}><div><p>{place.cuisine} · {place.locality}</p><h2>{place.name}</h2><small>{place.description}</small>{place.address && <address>{place.address}</address>}</div><div className="food-guide-action">{place.mapUrl ? <a className="button dark" href={place.mapUrl} target="_blank" rel="noreferrer">Open map <span>↗</span></a> : <span>{place.verified ? "Verified by community" : "Map link being verified"}</span>}</div></article>)}</section>
    <section className="callout-band"><p className="eyebrow light">MAKE THIS GUIDE BETTER</p><h2>Know a place that feels like home?</h2><a className="button light" href="/contact" data-curtain>Send a recommendation <span>↗</span></a></section><SiteFooter /></main>;
}
