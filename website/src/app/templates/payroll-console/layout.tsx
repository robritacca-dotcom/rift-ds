import { pageMetadata } from "@/config/navigation";

/* Parked: listed in hiddenTemplateLinks (src/config/navigation.ts), so it is
   in no nav, sitemap or llms.txt, and kept out of search the way labs are. */
export const metadata = {
  ...pageMetadata(
    "/templates/payroll-console",
    "A payroll product with the chat docked as a side rail: a pay run's totals, its stages, and the people in it, beside an assistant whose agent panel opens in place."
  ),
  robots: { index: false, follow: false },
};

export default function PayrollConsoleTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
