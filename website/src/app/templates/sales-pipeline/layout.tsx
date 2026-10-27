import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/sales-pipeline",
  "A sales CRM's companies view from the design system alone: a live data table with badges, meters and sparklines, filters, and an assistant at the side."
);

export default function SalesPipelineTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
