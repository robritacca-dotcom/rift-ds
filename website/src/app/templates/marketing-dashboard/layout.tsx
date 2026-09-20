import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/marketing-dashboard",
  "A marketing analytics dashboard built from the design system alone: KPI tiles, a funnel, trend charts, and a campaign table, with every value a semantic token."
);

export default function MarketingDashboardTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
