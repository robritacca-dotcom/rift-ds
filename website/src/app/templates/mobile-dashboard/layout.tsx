import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/mobile-dashboard",
  "A marketing dashboard as an iOS app, built from the design system alone: a large-title top bar, a Liquid Glass tab bar, KPI tiles, a spend chart, and a campaign list."
);

export default function MobileDashboardTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
