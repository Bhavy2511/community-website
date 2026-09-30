"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const routeNames = {
  "/": "Home",
  "/garbaraas": "GarbaRaas",
  "/garba-raas": "GarbaRaas",
  "/nutan-varsh-milan": "Nutan Varsh Milan",
  "/farewell": "Farewell",
  "/sharad-poonam": "Sharad Poonam",
  "/vision": "Vision",
  "/archive": "Archive",
  "/directory": "Directory",
  "/contact": "Contact Us",
  "/food-guide": "Food Guide",
  "/events": "Events",
  "/news": "News",
  "/future-events": "Future Events",
  "/initiatives": "Initiatives",
  "/mentorship": "Mentorship",
  "/join": "Join the Community",
};

function getDestination(path) {
  const coreTeamMatch = path.match(/^\/garbaraas\/(\d{4})\/core-team$/);
  if (coreTeamMatch) return `GarbaRaas ${coreTeamMatch[1]} Core Team`;

  const yearMatch = path.match(/^\/garbaraas\/(\d{4})$/);
  if (yearMatch) return `GarbaRaas ${yearMatch[1]}`;

  return routeNames[path] || "Gujarati Community IITG";
}

export default function CurtainTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (phase !== "closing") return;
    setPhase("opening");
    const timer = window.setTimeout(() => setPhase("idle"), 760);
    return () => window.clearTimeout(timer);
    // The pathname change is the signal to reopen the curtains.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("route-transition-active", phase !== "idle");
    return () => document.body.classList.remove("route-transition-active");
  }, [phase]);

  useEffect(() => {
    function handleNavigation(event) {
      const link = event.target.closest("a[data-curtain]");
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
      const href = link.getAttribute("href");
      if (!href?.startsWith("/") || href === pathname || phase !== "idle") return;

      event.preventDefault();
      const path = href.split("?")[0].split("#")[0] || "/";
      setDestination(link.dataset.transitionLabel || getDestination(path));
      setPhase("closing");
      window.setTimeout(() => router.push(href), 820);
    }

    document.addEventListener("click", handleNavigation);
    return () => document.removeEventListener("click", handleNavigation);
  }, [pathname, phase, router]);

  return (
    <div className={`curtain-transition ${phase}`} aria-hidden="true">
      <div className="curtain-panel curtain-panel-left" />
      <div className="curtain-panel curtain-panel-right" />
      <div className="curtain-copy">
        <div className="curtain-brand-title">Gujarati Community IITG</div>
        <div className="curtain-destination"><span>Entering</span><b>{destination}</b></div>
      </div>
    </div>
  );
}
