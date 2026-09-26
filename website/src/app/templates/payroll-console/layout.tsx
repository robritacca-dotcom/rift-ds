import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/payroll-console",
  "A payroll product with the chat docked as a side rail: a pay run's totals, its stages, and the people in it, beside an assistant whose agent panel opens in place."
);

export default function PayrollConsoleTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
