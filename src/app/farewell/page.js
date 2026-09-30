import EventSlideshow from "../../components/EventSlideshow";
import EventAtAGlance from "../../components/EventAtAGlance";
import EventDetailsCarousel from "../../components/EventDetailsCarousel";
import EventYearNav from "../../components/EventYearNav";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { farewell2025Slides } from "../../data/event-photos";

const farewellDetails = [
  { title: "A warm send-off", copy: "A Farewell is a pause to celebrate the graduating students, their friendships and the work they leave behind for the next team.", image: "/community/farewell-2025/farewell-2025-01.jpg" },
  { title: "Memories that travel", copy: "The people who leave IITG take this community with them, while their stories remain part of every future celebration.", image: "/community/farewell-2025/farewell-2025-02.jpg" },
  { title: "The next chapter", copy: "Every goodbye makes room for new student leaders, new friendships and another year of Gujarati Community IITG.", image: "/community/farewell-2025/farewell-2025-03.jpg" },
];

export default function FarewellPage() {
  return <main><SiteHeader /><PageHero eyebrow="FAREWELL 2025" title={<>For every<br /><em>next chapter.</em></>} copy="A warm send-off for graduating members and the memories they leave with Gujarati Community IITG." image="/community/farewell-2025/farewell-2025-04.jpg"><a className="button light" href="/archive" data-curtain>See the 2025 archive <span>↗</span></a></PageHero><EventYearNav eventName="Farewell" activeYear="2025" years={[{ year: 2025, href: "/farewell", status: "2025 collection" }, { year: 2026, status: "Coming soon" }]} /><EventAtAGlance eyebrow="FAREWELL 2025" title={<>Farewell 2025<br /><em>at a glance.</em></>} copy="A celebration of graduating students, the friendships built at IITG and the community that travels with every alumnus." facts={[{ label: "2025", copy: "A shared send-off for graduating members" }, { label: "Community", copy: "Students, friends and the people who made IITG home" }, { label: "Legacy", copy: "Memories carried forward by every next batch" }]} /><EventDetailsCarousel eyebrow="BEHIND THE FAREWELL" title={<>Goodbyes made<br /><em>together.</em></>} copy="The people, memories and continuity that make a Farewell more than a final photograph." items={farewellDetails} /><EventSlideshow eyebrow="2025 MEMORIES" title={<>A chapter ends,<br /><em>the circle remains.</em></>} copy="Four moments from the Gujarati Community IITG Farewell 2025." slides={farewell2025Slides} /><section className="callout-band"><p className="eyebrow light">KEEP IN TOUCH</p><h2>Once Gujarati Community IITG, always family.</h2><a className="button light" href="/contact" data-curtain>Stay connected <span>↗</span></a></section><SiteFooter /></main>;
}
