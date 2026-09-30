import ChandaPortal from "../../components/ChandaPortal";
import GarbaRaasOrderShell from "../../components/GarbaRaasOrderShell";

export const metadata = { title: "Chanda Collection | GarbaRaas IITG", robots: { index: false, follow: false } };

export default function ChandaPage() {
  return <GarbaRaasOrderShell product="chanda"><ChandaPortal /></GarbaRaasOrderShell>;
}
