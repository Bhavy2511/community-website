export default function EventAtAGlance({ eyebrow, title, copy, facts }) {
  return <section className="event-glance"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p className="section-copy">{copy}</p></div><div className="event-glance-grid">{facts.map((fact) => <article key={fact.label}><b>{fact.label}</b><span>{fact.copy}</span></article>)}</div></section>;
}
