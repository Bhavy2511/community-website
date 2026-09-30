import EventSlideshow from "../../components/EventSlideshow";
import EventDetailsCarousel from "../../components/EventDetailsCarousel";
import EventAtAGlance from "../../components/EventAtAGlance";
import EventYearNav from "../../components/EventYearNav";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { nutanVarsh2025Slides } from "../../data/event-photos";

const details = [
  { title: "First time at IITG", copy: "The inaugural Nutan Varsh Milan created a new IITG tradition, with an open welcome for every Gujarati student, family and friend.", image: "/community/nutan-varsh-2025/poster-first-time-iitg.jpg" },
  { title: "A warm welcome", copy: "The team begins with introductions, greetings and a space where new members can immediately feel at home.", image: "/community/nutan-varsh-2025/nutan-varsh-milan-2025-01.jpeg" },
  { title: "Shared Gujarati flavours", copy: "Familiar food brings everyone around the same table and lets conversations flow naturally across batches.", image: "/community/nutan-varsh-2025/nutan-varsh-milan-2025-05.jpeg" },
  { title: "Blessings and tradition", copy: "The celebration carries the warmth of the Gujarati New Year through shared rituals, wishes and gratitude.", image: "/community/nutan-varsh-2025/nutan-varsh-milan-2025-08.jpeg" },
  { title: "New connections", copy: "A gathering where students, faculty, alumni and families meet as one extended IITG community.", image: "/community/nutan-varsh-2025/nutan-varsh-milan-2025-12.jpeg" },
  { title: "Memories for the next batch", copy: "Each photograph preserves a beginning that future teams can return to, grow and celebrate again.", image: "/community/nutan-varsh-2025/nutan-varsh-milan-2025-17.jpeg" },
];

export default function NutanVarshPage() {
  return <main><SiteHeader /><PageHero eyebrow="NUTAN VARSH MILAN 2025" title={<>A new year,<br /><em>shared warmly.</em></>} copy="Gujarati New Year at IIT Guwahati is a moment for familiar food, blessings, introductions and a community that feels closer to home." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom"><a className="button light" href="/contact" data-curtain>Join the next one <span>↗</span></a></PageHero>
    <EventYearNav eventName="Nutan Varsh Milan" activeYear="2025" years={[{ year: 2025, href: "/nutan-varsh-milan", status: "First IITG celebration" }, { year: 2026, status: "Coming soon" }]} />
    <EventAtAGlance eyebrow="ગુજરાતી બેસતું વર્ષ" title={<>Nutan Varsh 2025<br /><em>at a glance.</em></>} copy="The first Nutan Varsh Milan at IITG gathered students, faculty and families around a shared table, creating a gentle first connection for every new member." facts={[{ label: "First at IITG", copy: "A new Gujarati New Year tradition on campus" }, { label: "Welcome", copy: "For students, faculty, alumni and friends" }, { label: "Food", copy: "Gujarati flavours and conversations over dinner" }, { label: "Connection", copy: "New introductions that become lasting ties" }]} />
    <EventDetailsCarousel eyebrow="BEHIND NUTAN VARSH" title={<>Every detail,<br /><em>made together.</em></>} copy="The welcome, shared food, traditions and new connections that made the first Nutan Varsh Milan at IITG feel like home." items={details} />
    <section className="callout-band"><p className="eyebrow light">NEXT CHAPTER</p><h2>Help us welcome the next batch.</h2><a className="button light" href="/contact" data-curtain>Volunteer with us <span>↗</span></a></section>
    <EventSlideshow eyebrow="2025 CELEBRATION" title={<>A table set for <em>everyone.</em></>} copy="The 2025 photographs preserve the effort behind a personal campus gathering." slides={nutanVarsh2025Slides} />
    <SiteFooter /></main>;
}
