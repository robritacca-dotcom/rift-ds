/**
 * The payroll console template, rendered full viewport. The route is
 * chromeless (see CHROMELESS_ROUTES in src/config/chromeless.ts) because the
 * shared footer, chat panel, and palette would sit inside the app shell being
 * shown; the implementation lives in components/templates/PayrollConsole and
 * is shared with its labs origin at /labs/payroll. Its fictional demo data
 * keeps the route out of the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs).
 */

import PayrollConsole from "@/components/templates/PayrollConsole/PayrollConsole";

export default function PayrollConsoleTemplatePage() {
  return <PayrollConsole />;
}
