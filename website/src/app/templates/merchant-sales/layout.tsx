import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/merchant-sales",
  "A merchant's sales screen from the design system alone: the month's numbers over 100,000 orders in a live data table you can change by describing what you want."
);

export default function MerchantSalesTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
