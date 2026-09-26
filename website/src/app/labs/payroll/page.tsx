/**
 * Labs: the payroll console's original home, kept as the experiment it began
 * as — the chat imagined as a docked side rail beside a product, where the
 * agent panel had to earn its room. The implementation now lives in
 * components/templates/PayrollConsole and also ships publicly at
 * /templates/payroll-console.
 *
 * This route stays noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import PayrollConsole from "@/components/templates/PayrollConsole/PayrollConsole";

export default function LabsPayrollPage() {
  return <PayrollConsole />;
}
