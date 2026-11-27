import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/accounts-by-month",
  "A household's accounts at every bank, at each month end: who owns each one, its balance and the change from the month before, adding up to net worth."
);

export default function AccountsByMonthTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
