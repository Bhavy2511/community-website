"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { initiatives } from "../data/initiatives";

const links = [
  ["Vision", "/vision"],
  ["News", "/news"],
  ["Directory", "/directory"],
  ["Archive", "/archive"],
  ["Contact Us", "/contact"],
];

const eventLinks = [
  ["All events", "/events", "Community calendar"],
  ["GarbaRaas", "/garbaraas/2026", "Navratri at IITG"],
  ["Nutan Varsh Milan", "/nutan-varsh-milan", "Gujarati New Year"],
  ["Farewell", "/farewell", "For every next chapter"],
  ["Sharad Poonam", "/sharad-poonam", "Ashwin full moon after Navratri"],
];

const initiativeLinks = [
  ["All initiatives", "/initiatives", "Community programmes"],
  ...initiatives.map((item) => [item.title, item.slug === "mentorship-network" ? "/mentorship" : `/initiatives/${item.slug}`, item.status]),
  ["Food guide", "/food-guide", "Gujarati comfort food nearby"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [initiativesOpen, setInitiativesOpen] = useState(false);
  const pathname = usePathname();
  const isMainLinkActive = (href) => pathname === href || (href === "/news" && pathname.startsWith("/news/"));
  const isEventLinkActive = (href) => {
    if (href === "/events") return pathname === href;
    if (href === "/garbaraas/2026") return pathname === "/garba-raas" || pathname.startsWith("/garbaraas");
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const eventsActive = eventLinks.some(([, href]) => isEventLinkActive(href));
  const isInitiativeLinkActive = (href) => href === "/mentorship" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const initiativesActive = pathname === "/initiatives" || initiativeLinks.some(([, href]) => isInitiativeLinkActive(href));
  const toggleMobileEvents = (event) => {
    if (window.matchMedia("(max-width: 950px)").matches) {
      event.preventDefault();
      setEventsOpen((value) => !value);
    }
  };
  const toggleMobileInitiatives = (event) => {
    if (window.matchMedia("(max-width: 950px)").matches) {
      event.preventDefault();
      setInitiativesOpen((value) => !value);
    }
  };

  return (
    <header className="site-header">
      <a className="brand" href="/" data-curtain aria-label="Gujarati Community IITG home">
        <Image
          src="/community/gujarati-community-iitg-logo-dark.png"
          alt="Gujarati Community IITG logo with Gujarat, lion, and IIT Guwahati building motifs"
          width={272}
          height={91}
          priority
        />
        <span className="sr-only">Gujarati Community IITG</span>
      </a>
      <button className={`menu-button${open ? " is-open" : ""}`} aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
        <span /><span /><span />
      </button>
      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        <div className="mobile-nav-heading"><div><span>GUJARATI COMMUNITY IITG</span></div><button type="button" aria-label="Close navigation" onClick={() => { setOpen(false); setEventsOpen(false); setInitiativesOpen(false); }}>×</button></div>
        <a href="/" data-curtain className={pathname === "/" ? "active" : ""}>Home</a>
        {links.slice(0, 3).map(([label, href]) => <a key={href} href={href} data-curtain className={isMainLinkActive(href) ? "active" : ""}>{label}</a>)}
        <div className={`nav-event-menu${eventsOpen ? " open" : ""}`}>
          <div className="nav-event-trigger"><a href="/events" data-curtain className={eventsActive ? "active" : ""} onClick={toggleMobileEvents}>Events</a><button type="button" aria-label="Show event menu" aria-expanded={eventsOpen} onClick={() => setEventsOpen((value) => !value)} /></div>
          <div className="nav-event-dropdown" aria-label="All events">{eventLinks.map(([label, href, description]) => <a key={href} href={href} data-curtain className={isEventLinkActive(href) ? "active" : ""}><div><b>{label}</b><span>{description}</span></div></a>)}</div>
        </div>
        <a href="/future-events" data-curtain className={pathname === "/future-events" ? "active" : ""}>Future events</a>
        <div className={`nav-event-menu nav-initiative-menu${initiativesOpen ? " open" : ""}`}>
          <div className="nav-event-trigger"><a href="/initiatives" data-curtain className={initiativesActive ? "active" : ""} onClick={toggleMobileInitiatives}>Initiatives</a><button type="button" aria-label="Show initiatives menu" aria-expanded={initiativesOpen} onClick={() => setInitiativesOpen((value) => !value)} /></div>
          <div className="nav-event-dropdown" aria-label="All initiatives">{initiativeLinks.map(([label, href, description]) => <a key={href} href={href} data-curtain className={isInitiativeLinkActive(href) ? "active" : ""}><div><b>{label}</b><span>{description}</span></div></a>)}</div>
        </div>
        {links.slice(3).map(([label, href]) => <a key={href} href={href} data-curtain className={isMainLinkActive(href) ? "active" : ""}>{label}</a>)}
      </nav>
      {open && <button className="nav-backdrop" type="button" aria-label="Close navigation" onClick={() => { setOpen(false); setEventsOpen(false); setInitiativesOpen(false); }} />}
    </header>
  );
}
