import GarbaRaasOrderShell from "../../components/GarbaRaasOrderShell";
import DandiyaDistributionForm from "../../components/DandiyaDistributionForm";

export const metadata = {
  title: "Dandiya Collection | GarbaRaas IITG",
  description: "Borrow Dandiya sticks for GarbaRaas 2026 at IIT Guwahati on a refundable deposit basis.",
};

export default function DandiyaPage() {
  return (
    <GarbaRaasOrderShell product="dandiya">
      <DandiyaDistributionForm />
    </GarbaRaasOrderShell>
  );
}
