/**
 * Labs: the marketing dashboard's original home, kept as the fidelity
 * pressure test it began as — a reference product rebuilt from the system
 * alone, where any shortfall against the reference is a finding about the
 * system, not this page. The implementation now lives in
 * components/templates/MarketingDashboard and also ships publicly at
 * /templates/marketing-dashboard.
 *
 * This route stays noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import MarketingDashboard from "@/components/templates/MarketingDashboard/MarketingDashboard";

export default function LabsMarketingPage() {
  return <MarketingDashboard />;
}
