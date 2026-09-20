import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/sales-pipeline",
  "A sales CRM's companies view built from the design system alone: the wired data table holding the whole screen with badges, meters, and sparklines in its rows, matching selects filtering the book live, and an assistant docked at the side."
);

export default function SalesPipelineTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
