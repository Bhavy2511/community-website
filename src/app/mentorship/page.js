import MentorshipSwitcher from "../../components/MentorshipSwitcher";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

const steps = [["01", "Register interest", "Tell us whether you are offering guidance or looking for it, and what kind of conversation would help."], ["02", "Small, thoughtful matching", "The team reviews interests in short cycles instead of promising instant automated matches."], ["03", "A useful first conversation", "A simple introduction, an agreed topic and no pressure to turn it into a formal long-term commitment."]];

export const metadata = { title: "Mentorship · Gujarati Community IITG", description: "A people-first mentorship network for Gujarati Community IITG." };

export default function MentorshipPage() {
  return <main><SiteHeader /><PageHero eyebrow="COMMUNITY MENTORSHIP" title={<>A little guidance<br />can change a <em>semester.</em></>} copy="A quiet, practical way for students, seniors and alumni to have the conversations that are often hardest to ask for alone." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom"><a className="button light" href="#take-part">Take part <span>↗</span></a></PageHero>
    <section className="mentorship-intro"><div><p className="eyebrow">NOT A DIRECTORY. A CONVERSATION.</p><h2>Good advice usually starts with someone making time.</h2></div><p>This programme is being built around useful, human conversations: placement preparation, a first internship, a research question, higher studies, campus life or simply finding one’s footing at IITG.</p></section>
    <section className="mentorship-steps">{steps.map(([number, title, copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}</section>
    <section className="mentorship-principles"><p className="eyebrow">HOW WE WILL RUN IT</p><div><article><h3>Opt in, always</h3><p>No student or alumnus is added automatically. Interest comes first, then a conversation.</p></article><article><h3>Small cycles</h3><p>We will begin with manageable groups and learn what actually helps before growing the programme.</p></article><article><h3>Respectful boundaries</h3><p>Mentors offer perspective, not guarantees. Students decide what advice fits their own path.</p></article></div></section>
    <section className="mentorship-forms" id="take-part"><div className="section-heading"><div><p className="eyebrow">TAKE PART</p><h2>Bring what you know. Ask what you <em>need.</em></h2></div><p className="section-copy">The first cycle will be organised by the community team. Registering interest does not guarantee a match, but it helps us build the programme around real needs.</p></div><MentorshipSwitcher /></section><SiteFooter /></main>;
}
