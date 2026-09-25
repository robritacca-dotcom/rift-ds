/**
 * Labs: the payroll console. A deliberately light product screen whose real
 * subject is the chrome around it — the chat docked as a side rail the way
 * the site's own panel docks, and the agent panel opening inside it at
 * product scale rather than on a review stage.
 *
 * Not a template: it lives only here, outside the IA, noindex, chromeless,
 * and excluded from the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs). All data is fictional.
 */

import PayrollConsole from "./PayrollConsole";

export default function LabsPayrollPage() {
  return <PayrollConsole />;
}
