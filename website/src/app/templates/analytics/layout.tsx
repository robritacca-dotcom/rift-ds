import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/analytics",
  "A realtime web analytics overview built from the design system alone: a world map of live visitors above a stats list, trend charts, and a table of cities."
);

export default function AnalyticsTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
