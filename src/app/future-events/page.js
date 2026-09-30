import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const futureEvents = [
  {
    number: "01",
    title: "Smart ID Card",
    eyebrow: "MEMBER CONNECTIVITY",
    copy: "A Gujarati Community Smart ID Card initiative for verified members, built around identity, connectivity, a secure member database and easier access to future community programmes.",
    status: "Foundation phase",
  },
  {
    number: "02",
    title: "Mentorship throughout the year",
    eyebrow: "YEAR-ROUND PROGRAMME",
    copy: "A simple support system pairing senior students with juniors for academic guidance, settling into IITG, career conversations and the everyday questions that are easier to ask within the community.",
    status: "In planning",
  },
  {
    number: "03",
    title: "Makar Sankranti - Undhiyu Program and Get-Together",
    eyebrow: "SEASONAL COMMUNITY GATHERING",
    copy: "A warm Makar Sankranti gathering around undhiyu, shared food and time together with the Gujarati Community IITG family.",
    status: "In planning",
  },
];

export default function FutureEventsPage() {
  return <main><SiteHeader /><PageHero eyebrow="WHAT COMES NEXT" title={<>The circle keeps<br /><em>growing.</em></>} copy="Future programmes that help Gujarati Community IITG stay connected between celebrations." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom"><a className="button light" href="/contact" data-curtain>Share an idea <span>-&gt;</span></a></PageHero>
    <section className="future-events-intro"><p className="eyebrow">FUTURE EVENTS</p><h2>More ways to show up<br /><em>for one another.</em></h2><p className="lead-copy">The community calendar will grow beyond annual celebrations. These programmes are being shaped with students and alumni, and details will be added as each one is ready.</p></section>
    <section className="future-events-list" aria-label="Future community programmes">{futureEvents.map((event) => <article key={event.number}><div><p className="eyebrow">{event.eyebrow}</p><h3>{event.title}</h3><p>{event.copy}</p></div><span className="future-event-status">{event.status}</span></article>)}</section>
    <section className="callout-band"><p className="eyebrow light">HAVE AN IDEA?</p><h2>Bring the next programme to life.</h2><a className="button light" href="/contact" data-curtain>Talk to the team <span>-&gt;</span></a></section><SiteFooter /></main>;
}
