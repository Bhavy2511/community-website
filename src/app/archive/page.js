import ArchiveYearGallery from "../../components/ArchiveYearGallery";
import PageHero from "../../components/PageHero";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { garbaRaas2022Archive, garbaRaas2023Archive, garbaRaas2024Archive, garbaRaas2025Archive, garbaRaasWorkshopArchive, nutanVarsh2025Archive, nutanVarsh2025Poster } from "../../data/event-photos";

const galleryItems = [...garbaRaas2025Archive, ...garbaRaasWorkshopArchive, nutanVarsh2025Poster, ...nutanVarsh2025Archive, ...garbaRaas2024Archive, ...garbaRaas2023Archive, ...garbaRaas2022Archive];

export default function ArchivePage() {
  return <main><SiteHeader /><PageHero eyebrow="COMMUNITY MEMORY ARCHIVE" title={<>The years that<br /><em>made us.</em></>} copy="A growing record of photographs, invitations and stories from Gujarati Community IITG events." image="/community/garba-raas-2025/garbaraas-2025-01.jpg"><a className="button light" href="/contact" data-curtain>Contribute a memory <span>↗</span></a></PageHero>
    <section className="archive-page"><div className="section-heading"><div><p className="eyebrow">2022-2025</p><h2>Our growing <em>record.</em></h2></div><p className="section-copy">Browse the community archive year by year. New photographs are added as each collection is curated.</p></div><ArchiveYearGallery items={galleryItems} /></section>
    <section className="callout-band"><p className="eyebrow light">HELP GROW THE ARCHIVE</p><h2>Have photographs to share?</h2><a className="button light" href="/contact" data-curtain>Send them to us <span>↗</span></a></section><SiteFooter /></main>;
}
