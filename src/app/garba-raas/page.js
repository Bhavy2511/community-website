"use client";

import EventSlideshow from "../../components/EventSlideshow";
import EventDetailsCarousel from "../../components/EventDetailsCarousel";
import EventAtAGlance from "../../components/EventAtAGlance";
import EventYearNav from "../../components/EventYearNav";
import GarbaRaasViewTabs from "../../components/GarbaRaasViewTabs";
import Image from "next/image";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { garbaRaas2025Slides } from "../../data/event-photos";

const behindGarbaRaas = [
  { title: "Pandal and decoration", copy: "A welcoming space begins with colour, lighting and handmade details that carry the feeling of Navratri onto campus.", image: "/community/garba-raas-2025/garbaraas-2025-09.jpg" },
  { title: "DJ and sound", copy: "The playlist, sound checks and steady rhythm give every dancer - from first-timers to regulars - a place in the circle.", image: "/community/garba-raas-2025/garbaraas-2025-05.jpg" },
  { title: "Chaniya choli stall", copy: "Festive clothing, jewellery and last-minute finishing touches help the evening feel colourful from the first photograph.", image: "/community/garba-raas-2025/garbaraas-2025-06.jpg" },
  { title: "Kurta and koti merch", copy: "Community merchandise lets volunteers and participants carry a small piece of GarbaRaas beyond one night.", image: "/community/garba-raas-2025/garbaraas-2025-07.jpg" },
  { title: "Aarti and prasad", copy: "The celebration makes space for shared ritual and gratitude before the dance floor fills with movement.", image: "/community/garba-raas-2025/garbaraas-2025-10.jpg" },
  { title: "Dandiya sticks", copy: "Simple pairs of sticks turn introductions into exchanges of rhythm, laughter and a common step.", image: "/community/garba-raas-2025/garbaraas-2025-04.jpg" },
  { title: "Workshop", copy: "Practice sessions make GarbaRaas open to everyone, whether they arrive with years of experience or curiosity for a first step.", image: "/community/garba-raas-2025/workshop/workshop3.jpg" },
  { title: "Posters and communication", copy: "Every update, poster and volunteer message helps the celebration reach the next person ready to join the circle.", image: "/community/garba-raas-2025/workshop/workshop-poster.jpg" },
];

export default function GarbaRaasPage() {
  return <main><SiteHeader /><PageHero eyebrow="NAVRATRI AT IITG" title={<>GarbaRaas -<br /><em>our brightest circle.</em></>} copy="A flagship Navratri celebration where Gujarati rhythm meets the warmth of the IIT Guwahati community." image="/community/garba-raas-2025/garbaraas-2025-08.jpg"><Image className="event-mark" src="/community/garba-raas-2025/garba-raas-logo.png" alt="GarbaRaas official logo" width={1611} height={449} priority /><a className="button light" href="/archive" data-curtain>See the archive <span>↗</span></a></PageHero>
    <EventYearNav eventName="GarbaRaas" activeYear="2025" years={[{ year: 2022, href: "/garbaraas/2022", status: "Core team story" }, { year: 2023, href: "/garbaraas/2023", status: "At a glance" }, { year: 2024, href: "/garbaraas/2024", status: "At a glance" }, { year: 2025, href: "/garbaraas/2025", status: "At a glance" }, { year: 2026, href: "/garbaraas/2026", status: "Live now" }]} />
    <GarbaRaasViewTabs year={2025}><EventAtAGlance eyebrow="GARBARAAS 2025" title={<>GarbaRaas 2025<br /><em>at a glance.</em></>} copy="One of the grandest GarbaRaas editions in its first four years, the 2025 celebration brought the IITG community together for four evenings, with the Director of IIT Guwahati joining as chief guest." facts={[{ label: "22-25 Sep", copy: "One of the grandest GarbaRaas editions to date" }, { label: "3000+", copy: "Footfall across the celebration" }, { label: "Workshop", copy: "22 and 23 Sep, 8 PM - 10:30 PM, New SAC" }, { label: "Aarti and prasad", copy: "24 and 25 Sep, 7 PM - 8 PM, Swimming Pool Area" }, { label: "Garba Dandiya Raas", copy: "24 and 25 Sep, 8 PM - 10:30 PM, Swimming Pool Area" }]} /><EventDetailsCarousel eyebrow="BEHIND GARBARAAS" title={<>Every detail,<br /><em>made together.</em></>} copy="The stalls, rituals and teamwork that make GarbaRaas feel complete - shown together below, with every part of the celebration visible." items={behindGarbaRaas} /><EventSlideshow eyebrow="2025 MEMORIES" title={<>Colour, rhythm and <em>belonging.</em></>} copy="A celebration made possible by student organisers, volunteers and everyone who joined the raas." slides={garbaRaas2025Slides} /><section className="callout-band"><p className="eyebrow light">KEEP THE CIRCLE GROWING</p><h2>Have an old GarbaRaas photo or story?</h2><a className="button light" href="/contact" data-curtain>Share it with us <span>↗</span></a></section></GarbaRaasViewTabs><SiteFooter /></main>;
}
