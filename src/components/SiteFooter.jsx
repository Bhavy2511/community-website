import Image from "next/image";

export default function SiteFooter() {
  return <footer><a className="footer-brand" href="/" data-curtain><Image src="/community/gujarati-community-iitg-logo-dark.png" alt="Gujarati Community IITG" width={174} height={58} /></a><a className="footer-tech-team" href="mailto:gujaraticommunityiitg@gmail.com" title="Email Gujarati Community IITG Tech Team">Made by Gujarati Community IITG Tech Team <span>↗</span></a><span>© 2026</span></footer>;
}
