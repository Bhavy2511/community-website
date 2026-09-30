export default function EventYearNav({ eventName, years, activeYear, onSelect }) {
  return <nav className="event-year-nav" aria-label={`${eventName} editions by year`}>
    <p className="eyebrow">EXPLORE BY YEAR</p>
    <div>{years.map((year) => {
      const active = String(year.year) === String(activeYear);
      const label = year.status || (active ? "Current collection" : "Photo collection coming soon");
      return year.href ? <a key={year.year} className={active ? "active" : ""} href={onSelect ? undefined : year.href} onClick={onSelect ? (event) => { event.preventDefault(); onSelect(String(year.year)); } : undefined} data-curtain><b>{year.year}</b><span>{label}</span></a> : <span key={year.year} className="pending"><b>{year.year}</b><span>{label}</span></span>;
    })}</div>
  </nav>;
}
