import EventAtAGlance from "./EventAtAGlance";
import EventDetailsCarousel from "./EventDetailsCarousel";
import EventSlideshow from "./EventSlideshow";
import EventYearNav from "./EventYearNav";
import GarbaRaasViewTabs from "./GarbaRaasViewTabs";
import PageHero from "./PageHero";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

const years = [{ year: 2022, href: "/garbaraas/2022", status: "Core team story" }, { year: 2023, href: "/garbaraas/2023", status: "At a glance" }, { year: 2024, href: "/garbaraas/2024", status: "At a glance" }, { year: 2025, href: "/garbaraas/2025", status: "At a glance" }, { year: 2026, href: "/garbaraas/2026", status: "Live now" }];

const yearFacts = {
  2022: [{ label: "The first edition", copy: "The beginning of GarbaRaas at IIT Guwahati" }, { label: "Venue", copy: "Manas Community Hall · IITG" }, { label: "Archive", copy: "The founding celebration, preserved in 11 photographs" }],
  2023: [{ label: "First open-area edition", copy: "GarbaRaas moved to the Swimming Pool Arena at IITG" }, { label: "Venue", copy: "Swimming Pool Arena · open area" }, { label: "Archive", copy: "Community memories, preserved year by year" }],
  2024: [{ label: "Rain-plan edition", copy: "The celebration began at the Swimming Pool Arena" }, { label: "Weather shift", copy: "Rain moved GarbaRaas to the New SAC second-floor area" }, { label: "Archive", copy: "Community memories, preserved year by year" }],
};

export default function GarbaRaasYearPage({ year, slides }) {
  const details = (year === 2022 ? slides : slides.slice(0, 3)).map((slide) => ({ title: slide.title, copy: slide.caption, image: slide.image }));
  const facts = yearFacts[year] || [{ label: `${slides.length} photos`, copy: `GarbaRaas ${year} memories` }, { label: "GarbaRaas", copy: "A continuing IITG Navratri tradition" }, { label: "Archive", copy: "Community memories, preserved year by year" }];
  return <main><SiteHeader /><PageHero eyebrow={`GARBARAAS ${year}`} title={<>GarbaRaas<br /><em>{year}.</em></>} copy={`A preserved photo collection from GarbaRaas ${year} at IIT Guwahati.`} image={slides[0].image}><a className="button light" href="/archive" data-curtain>Browse the archive <span>↗</span></a></PageHero><EventYearNav eventName="GarbaRaas" activeYear={String(year)} years={years} /><GarbaRaasViewTabs year={year}><EventAtAGlance eyebrow={`GARBARAAS ${year}`} title={<>GarbaRaas {year}<br /><em>at a glance.</em></>} copy={`GarbaRaas ${year} brought the community together through Navratri rhythm, shared traditions and the people who keep the IITG circle moving.`} facts={facts} /><EventDetailsCarousel eyebrow={`BEHIND GARBARAAS ${year}`} title={<>A year of<br /><em>memories.</em></>} copy={`A closer look at GarbaRaas ${year} through the available photo collection.`} items={details} /><EventSlideshow eyebrow={`${year} MEMORIES`} title={year === 2022 ? <>The circle<br /><em>begins.</em></> : <>The circle<br /><em>continues.</em></>} copy={`Explore the GarbaRaas ${year} photo collection.`} slides={slides} /></GarbaRaasViewTabs><SiteFooter /></main>;
}
