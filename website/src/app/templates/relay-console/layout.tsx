import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/relay-console",
  "A network operations console from the design system alone: an interactive globe that flips to a world map, headline numbers, and an assistant at the side."
);

export default function RelayConsoleTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
