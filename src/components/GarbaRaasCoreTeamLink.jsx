export default function GarbaRaasCoreTeamLink({ year }) {
  return <section className="garba-core-team-link"><p className="eyebrow">THE TEAM BEHIND THE EVENT</p><h2>Meet the GarbaRaas<br /><em>{year} core team.</em></h2><p>Discover the students who shaped this year’s celebration, along with their academic details and portraits as they are added.</p><a className="button dark" href={`/garbaraas/${year}/core-team`} data-curtain>View the {year} core team <span>↗</span></a></section>;
}
