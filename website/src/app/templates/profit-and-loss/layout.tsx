import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/profit-and-loss",
  "A quarterly profit and loss statement from the design system alone: sections that close on subtotals, down to the bottom line, against the quarter before."
);

export default function ProfitAndLossTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
