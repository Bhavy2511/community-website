import MemberDirectory from "../../components/MemberDirectory";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export default function DirectoryPage() {
  return <main><SiteHeader /><PageHero eyebrow="THE PEOPLE OF OUR COMMUNITY" title={<>Find your<br /><em>people.</em></>} copy="A consent-first directory for members, faculty, alumni and the student team. Private contact details stay private." image="/community/nutan-varsh-2025/nutan-varsh-milan-2025-09.jpeg" imagePosition="center bottom" /><MemberDirectory initialView="core" standalone /><section className="directory-explainer"><p className="eyebrow">JOIN THE COMMUNITY</p><h2>Be part of the circle.</h2><p>Join Gujarati Community IITG, meet fellow students, faculty and alumni, and help carry our traditions forward.</p><a className="button dark" href="/contact" data-curtain>Join the community <span>↗</span></a></section><SiteFooter /></main>;
}
