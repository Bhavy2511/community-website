import { notFound, redirect } from "next/navigation";
import PageHero from "../../../components/PageHero";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { initiativeBySlug, initiatives } from "../../../data/initiatives";

export function generateStaticParams() { return initiatives.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }) { const item=initiativeBySlug[params.slug]; return item ? { title:`${item.title} · Gujarati Community IITG`, description:item.summary } : {}; }

export default function InitiativePage({ params }) {
  const item=initiativeBySlug[params.slug];
  if (!item) notFound();
  if (item.slug === "mentorship-network") redirect("/mentorship");
  return <main><SiteHeader /><PageHero eyebrow={item.status} title={<>{item.title}</>} copy={item.summary} image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom"><a className="button light" href="/contact" data-curtain>Take part <span>↗</span></a></PageHero>
    <section className="initiative-story"><article><p className="eyebrow">WHY IT MATTERS</p><h2>A practical need,<br />not a <em>slogan.</em></h2><p>{item.why}</p></article><article><p className="eyebrow">TARGET OUTCOME</p><h3>{item.outcome}</h3></article><article><p className="eyebrow">NEXT MILESTONE</p><h3>{item.milestone}</h3></article><article><p className="eyebrow">HOW TO HELP</p><h3>{item.help}</h3></article></section>
    <section className="initiative-cta"><div className="initiative-cta-panel"><div><p className="eyebrow">BUILD IT WITH US</p><h2>Useful communities are made by people who show up.</h2></div><a className="button light" href="/contact" data-curtain>Contact the community <span>↗</span></a></div></section><SiteFooter /></main>;
}
