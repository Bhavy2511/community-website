import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { initiatives } from "../../data/initiatives";

export const metadata = { title: "Initiatives | Gujarati Community IITG", description: "The practical programmes building a lasting Gujarati Community at IIT Guwahati." };

export default function InitiativesPage() {
  return <main><SiteHeader /><PageHero eyebrow="COMMUNITY INITIATIVES" title={<>What we build<br /><em>between gatherings.</em></>} copy="Six practical programmes for belonging, continuity and a community that remains useful to every new batch at IIT Guwahati." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom"><a className="button light" href="/contact" data-curtain>Build with us <span>↗</span></a></PageHero>
    <section className="initiatives-page-list">{initiatives.map((item) => <article key={item.slug}><p>{item.status}</p><div><h2>{item.title}</h2><span>{item.summary}</span></div><a className="button dark" href={item.slug === "mentorship-network" ? "/mentorship" : `/initiatives/${item.slug}`} data-curtain>Open initiative <span>↗</span></a></article>)}</section>
    <section className="callout-band"><p className="eyebrow light">A PLACE TO CONTRIBUTE</p><h2>Every useful community is built by people who take part.</h2><a className="button light" href="/contact" data-curtain>Contact the community <span>↗</span></a></section><SiteFooter /></main>;
}
