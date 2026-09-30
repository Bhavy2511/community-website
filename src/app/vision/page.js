import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { roadmap } from "../../data/site-content";
import { initiatives } from "../../data/initiatives";

const details = [
  "Identity, flagship events, a core committee, faculty guidance, Smart ID cards and a secure member database.",
  "Culture, technology, outreach and alumni working groups, inter-community collaboration and formal campus recognition.",
  "A Gujarati Alumni Network IITG, mentorship, newsletters, heritage and innovation conversations, and internship pathways.",
  "A community fund, partnerships in Gujarat, a permanent advisory board, a digital archive and a strong leadership handover.",
];
const pathways = [["Student", "Join the community, receive updates, volunteer on a working group or help document an event."], ["Alumnus", "Mentor a student, share an opportunity, contribute a story or help strengthen professional pathways."], ["Faculty", "Advise, validate a programme, connect the community to institutional resources or collaborate on an initiative."], ["Partner or supporter", "Discuss an approved programme, specific need or in-kind contribution with the community and faculty guidance."]];

export default function VisionPage() {
  return <main><SiteHeader /><PageHero eyebrow="A TEN-YEAR COMMUNITY PLAN" title={<>From gathering<br />to <em>legacy.</em></>} copy="A practical, people-first roadmap for an inclusive Gujarati community at IIT Guwahati that survives every graduating batch." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-07.jpeg" imagePosition="center 25%"><a className="button light" href="/contact" data-curtain>Build this with us <span>↗</span></a></PageHero>
    <section className="story-section vision-purpose"><p className="eyebrow">HOW IT BEGAN</p><h2>A new year, and a long view.</h2><p className="lead-copy">On Gujarati Nutan Varsh, 22 October 2025, Gujarati Community IITG was established with a simple belief: culture becomes stronger when students, faculty, alumni and friends have a lasting way to find one another.</p><p className="vision-founding-copy">From the beginning, the vision reached beyond individual events. It was to build an inclusive, digitally connected community that protects the joy of gathering while creating the systems, records and relationships that can outlive every graduating batch.</p></section>
    <section className="vision-timeline">{roadmap.map((phase, index) => <article key={phase.years}><div><h2>{phase.title}</h2><p>{details[index]}</p></div></article>)}</section>
    <section className="impact-intro"><div><p className="eyebrow">WHAT WE ARE BUILDING</p><h2>A community that keeps <em>working.</em></h2></div><p>The events are the visible part. Behind them, students and alumni are building practical systems for belonging, mentorship, memory and continuity. Each initiative has a clear stage, an accountable next step and room for people to help. <a href="/mentorship" data-curtain>Explore the mentorship programme <span aria-hidden="true">↗</span></a></p></section>
    <section className="impact-initiatives">{initiatives.map((item) => <a href={item.slug === "mentorship-network" ? "/mentorship" : `/initiatives/${item.slug}`} data-curtain key={item.number}><article><p>{item.status}</p><h3>{item.title}</h3><div>{item.summary}</div><b>Open initiative <i className="arrow-glyph" aria-hidden="true" /></b></article></a>)}</section>
    <section className="impact-pathways"><div><p className="eyebrow">FIND YOUR PLACE</p><h2>There is room for <em>your kind of help.</em></h2></div><div>{pathways.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="principles"><p className="eyebrow">WHAT WE WILL PROTECT</p><div><article><b>01</b><h3>Open belonging</h3><p>Gujarati students, faculty, alumni and friends should always find a way in.</p></article><article><b>02</b><h3>Useful memory</h3><p>Events, processes and knowledge should be recorded for the next team.</p></article><article><b>03</b><h3>Responsible data</h3><p>Member information is collected only with consent and never exposed publicly.</p></article></div></section><SiteFooter /></main>;
}
