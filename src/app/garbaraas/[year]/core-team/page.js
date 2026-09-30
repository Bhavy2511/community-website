import { notFound } from "next/navigation";
import EventYearNav from "../../../../components/EventYearNav";
import GarbaRaasCoreTeam from "../../../../components/GarbaRaasCoreTeam";
import PageHero from "../../../../components/PageHero";
import SiteFooter from "../../../../components/SiteFooter";
import SiteHeader from "../../../../components/SiteHeader";

const years = [2022, 2023, 2024, 2025, 2026];
const yearNavigation = years.map((year) => ({ year, href: `/garbaraas/${year}`, status: year === 2026 ? "Live now" : year === 2022 ? "Core team story" : "At a glance" }));

export function generateStaticParams() {
  return years.map((year) => ({ year: String(year) }));
}

export default function GarbaRaasCoreTeamPage({ params }) {
  const year = Number(params.year);
  if (!years.includes(year)) notFound();
  return <main><SiteHeader /><PageHero eyebrow={`GARBARAAS ${year}`} title={<>The team behind<br /><em>the circle.</em></>} copy={`Meet the students who made GarbaRaas ${year} possible at IIT Guwahati.`} image="/community/garba-raas-2025/garbaraas-2025-04.jpg"><a className="button light" href={`/garbaraas/${year}`} data-curtain>Back to GarbaRaas {year} <span>↗</span></a></PageHero><EventYearNav eventName="GarbaRaas" activeYear={String(year)} years={yearNavigation} /><GarbaRaasCoreTeam year={year} /><SiteFooter /></main>;
}
