import Image from "next/image";
import EventYearNav from "../../../components/EventYearNav";
import GarbaRaasViewTabs from "../../../components/GarbaRaasViewTabs";
import PageHero from "../../../components/PageHero";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";

const years = [
  { year: 2022, href: "/garbaraas/2022", status: "Core team story" },
  { year: 2023, href: "/garbaraas/2023", status: "At a glance" },
  { year: 2024, href: "/garbaraas/2024", status: "At a glance" },
  { year: 2025, href: "/garbaraas/2025", status: "At a glance" },
  { year: 2026, href: "/garbaraas/2026", status: "Live now" },
];

export default function GarbaRaas2026Page() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="GARBARAAS 2026"
        title={
          <>
            GarbaRaas 2026
            <br />
            <em>is live now.</em>
          </>
        }
            copy="The circle is coming alive. Stay tuned for dates, workshop details and event updates."
        image="/community/garba-raas-2025/garbaraas-2025-11.jpg"
      >
        <a
          className="button light"
          href="https://www.instagram.com/garbaraas_iitg"
          target="_blank"
          rel="noreferrer"
        >
          Follow GarbaRaas IITG <span>↗</span>
        </a>
      </PageHero>
      <EventYearNav eventName="GarbaRaas" activeYear="2026" years={years} />
      <GarbaRaasViewTabs year={2026}>
        <section className="garbaraas-2026-merch garbaraas-2026-merch-hero">
          <div className="garbaraas-2026-merch-copy">
            <p className="eyebrow">ORDERED FROM SURAT, GUJARAT.</p>
            <h2>
              GarbaRaas festival
              <br />
              <em>kurta.</em>
            </h2>
            <p>
              Limited-time offer: order by 30 September, EOD. Bring a friend
              and order two or more kurtas together to get the ₹449-per-kurta
              offer.
            </p>
          </div>
          <a
            className="garbaraas-2026-merch-card"
            href="/kurta-order"
            target="_blank"
            rel="noreferrer"
          >
            <div className="garbaraas-2026-card-image">
              <Image
                src="/kurta-pictures/1.jpeg"
                alt="GarbaRaas Kurta"
                fill
                sizes="(max-width: 900px) 84vw, 32vw"
                priority
              />
            </div>
            <div className="garbaraas-2026-card-copy">
              <small>NOW OPEN</small>
              <h3>Kurta</h3>
              <p>Ten designs</p>
            </div>
            <span className="garbaraas-2026-card-link">
              Order now for details & offers <b aria-hidden="true">↗</b>
            </span>
          </a>
        </section>
        <section className="garbaraas-2026-kurta-posters" aria-label="GarbaRaas Kurta offers">
          <a href="/kurta-order" target="_blank" rel="noreferrer">
            <Image
              src="/community/news/garbaraas-2026-kurta-order-poster.jpeg"
              alt="GarbaRaas 2026 festival kurta order poster"
              width={1080}
              height={1350}
              sizes="(max-width: 760px) 84vw, 38vw"
            />
          </a>
          <a href="/kurta-order" target="_blank" rel="noreferrer">
            <Image
              src="/community/news/garbaraas-2026-kurta-pricing.jpeg"
              alt="GarbaRaas 2026 kurta pricing offer poster"
              width={1080}
              height={1350}
              sizes="(max-width: 760px) 84vw, 38vw"
            />
          </a>
        </section>
        <section className="garbaraas-2026-update garbaraas-2026-update-below">
          <p className="eyebrow">SAVE THE DATE</p>
          <h2>
            Updates will
            <br />
            appear here.
          </h2>
          <p>
            Workshop details, registrations, chief guest announcements and the
            2026 programme will be published as the team confirms them.
          </p>
          <a className="section-expand" href="/garbaraas/2026/core-team" data-curtain>
            Contact the organising team <span>↗</span>
          </a>
        </section>
      </GarbaRaasViewTabs>
      <SiteFooter />
    </main>
  );
}
