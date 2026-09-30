const pathways = [
  ["Student", "Join, volunteer or find a mentor"],
  ["Alumnus", "Mentor, share an opportunity or reconnect"],
  ["Faculty or partner", "Advise, validate or collaborate"],
];

export default function HomePathways() {
  return (
    <section className="home-pathways">
      <div><p className="eyebrow">FIND YOUR PLACE</p><h2>There is room for <em>your kind of help.</em></h2></div>
      <div className="home-pathways-list">
        {pathways.map(([audience, action]) => <a href="/contact" data-curtain key={audience}><b>{audience}</b><span>{action} <i className="arrow-glyph" aria-hidden="true" /></span></a>)}
      </div>
    </section>
  );
}
