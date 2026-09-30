import { notFound } from "next/navigation";
import GarbaRaasOrderShell from "../../components/GarbaRaasOrderShell";
import KotiOrderForm from "../../components/KotiOrderForm";
import { kotiOrdersEnabled } from "../../lib/merch-orders";

export const metadata = { title: "Koti Order | Gujarati Community IITG", description: "The GarbaRaas 2026 koti order page." };

export default function KotiOrderPage() {
  if (!kotiOrdersEnabled()) notFound();
  return <GarbaRaasOrderShell product="koti"><KotiOrderForm /></GarbaRaasOrderShell>;
}
