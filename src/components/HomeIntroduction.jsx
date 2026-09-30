import MemberCount from "./MemberCount";

export default function HomeIntroduction() {
  return (
    <section className="intro reveal" id="about">
      <div className="intro-layout">
        <div>
          <p className="eyebrow">WHO WE ARE</p>
          <h2>Culture is stronger when it has a <em>community.</em></h2>
        </div>
        <div className="intro-aside">
          <p>Gujarati Community IITG brings students, professors and alumni together in the North-East - to celebrate traditions, help each other settle in, and build connections that last beyond campus.</p>
          <span>IIT GUWAHATI · ASSAM</span>
        </div>
      </div>
      <div className="stats">
        <div><MemberCount /><span>members to connect with</span></div>
        <div><b>2022</b><span>our digital archive begins</span></div>
        <div><b>10 years</b><span>of shared vision</span></div>
      </div>
      <div className="intro-footer">
        <a className="section-expand" href="/vision" data-curtain>Read our full vision <span>↗</span></a>
        <p>Roots. Rhythm. Together.</p>
      </div>
    </section>
  );
}
