import Link from "next/link";

export default function HomeNews({ newsItems }) {
  const homeItems = newsItems.slice(0, 3);
  return (
    <section className="news-section home-news" id="news">
      <div className="section-heading">
        <div><p className="eyebrow">NEWS &amp; UPDATES</p><h2>News and<br /><em>updates.</em></h2></div>
        <p className="section-copy">Confirmed announcements, upcoming programmes and practical information.</p>
      </div>
      <div className="news-grid">
        {homeItems.map((item) => (
          <Link className="news-card-link" href={item.slug === "exclusive-festive-kurta-by-garbaraas-order-now" ? "/kurta-order" : item.slug ? `/news/${item.slug}` : "/news"} key={item.id || item.slug}>
          <article>
            <div className="news-card-image" style={{ backgroundImage: `url(${item.slug === "exclusive-festive-kurta-by-garbaraas-order-now" ? "/community/news/garbaraas-2026-kurta-order-poster.jpeg" : item.coverImage || item.image})` }} />
            <div>
              <p>{item.category} · {item.eventDate || item.date || "Community update"}</p>
              <span>{item.status}</span>
              <h3>{item.title}</h3>
              <p className="news-copy">{item.summary || item.copy}</p>
            </div>
            <span className="news-card-arrow">{item.slug === "exclusive-festive-kurta-by-garbaraas-order-now" ? "Order now" : "View update"} <b aria-hidden="true">↗</b></span>
          </article>
          </Link>
        ))}
        {homeItems.length === 0 && <p className="news-empty">No homepage updates have been published yet.</p>}
      </div>
      <a className="section-expand" href="/news" data-curtain>See all news and updates <span>↗</span></a>
    </section>
  );
}
