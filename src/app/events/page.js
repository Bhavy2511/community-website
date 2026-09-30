import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { events } from "../../data/site-content";

const destinations = { garba: "/garbaraas/2026", "new-year": "/nutan-varsh-milan", "sharad-poonam": "/sharad-poonam", "farewell-2025": "/farewell" };

export default function EventsPage() {
  return <main><SiteHeader /><PageHero eyebrow="THE COMMUNITY CALENDAR" title={<>Moments we make<br /><em>together.</em></>} copy="Our events give every batch reasons to meet, celebrate and carry Gujarati culture forward at IIT Guwahati." image="/community/garba-raas-2025/garbaraas-2025-04.jpg" />
    <section className="events-page-list">{events.map((event) => <article key={event.id} className={event.image ? "with-image" : ""}>{event.image && <div className="event-list-image" style={{ backgroundImage: `url(${event.image})` }} />}<div><p>{event.month}</p><h2>{event.name}</h2><span>{event.description}</span></div><a className="button dark" href={destinations[event.id] || "/contact"} data-curtain>Explore event<span>↗</span></a></article>)}</section>
    <section className="callout-band"><p className="eyebrow light">COME SAY KEM CHO</p><h2>Bring an idea for the next gathering.</h2><a className="button light" href="/contact" data-curtain>Talk to the team <span>↗</span></a></section><SiteFooter /></main>;
}
