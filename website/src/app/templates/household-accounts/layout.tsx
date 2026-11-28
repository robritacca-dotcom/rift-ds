import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/household-accounts",
  "Every account a household holds at every bank, who owns each one and what it holds today, adding up to net worth."
);

export default function HouseholdAccountsTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
