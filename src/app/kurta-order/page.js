import GarbaRaasOrderShell from "../../components/GarbaRaasOrderShell";
import KurtaOrderForm from "../../components/KurtaOrderForm";
import { kurtaOrdersEnabled } from "../../lib/merch-orders";

export const metadata = {
  title: "Kurta Order | Gujarati Community IITG",
  description: "Place your Gujarati Community IITG kurta group order.",
};

export default function KurtaOrderPage() {
  if (!kurtaOrdersEnabled()) return <GarbaRaasOrderShell product="kurta"><main className="garbaraas-order-coming-soon"><p className="eyebrow">GARBARAAS 2026 · KURTA</p><h1>Kurta orders<br /><em>coming soon.</em></h1><p>Our official festival kurtas are being prepared. Please check back soon for ordering details.</p><a className="section-expand" href="/garbaraas/2026">Back to GarbaRaas 2026 <span>↗</span></a></main></GarbaRaasOrderShell>;
  return (
    <GarbaRaasOrderShell product="kurta">
      <KurtaOrderForm />
    </GarbaRaasOrderShell>
  );
}
