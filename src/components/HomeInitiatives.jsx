export default function HomeInitiatives({ initiatives }) {
  return (
    <section className="home-building" id="building">
      <div className="section-heading">
        <div><p className="eyebrow">WHAT WE ARE BUILDING</p><h2>A community that keeps <em>working.</em></h2></div>
        <p className="section-copy">The celebrations are the beginning. These practical systems help people find one another, carry knowledge forward and make every batch part of the same circle.</p>
      </div>
      <div className="home-building-grid">
        {initiatives.map((item) => <a href={item.slug === "mentorship-network" ? "/mentorship" : `/initiatives/${item.slug}`} data-curtain key={item.number}><article><h3>{item.title}</h3><p>{item.summary}</p></article></a>)}
      </div>
      <a className="section-expand" href="/initiatives" data-curtain>Explore all initiatives <span>↗</span></a>
    </section>
  );
}
