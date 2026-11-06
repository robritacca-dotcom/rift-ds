/**
 * Labs: the marketing dashboard's original home, kept as the fidelity
 * pressure test it began as — a reference product rebuilt from the system
 * alone, where any shortfall against the reference is a finding about the
 * system, not this page. The implementation lives in
 * components/templates/MarketingDashboard; its public template was folded
 * into merchant sales, so this is the one route that renders it.
 *
 * This route stays noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import MarketingDashboard from "@/components/templates/MarketingDashboard/MarketingDashboard";

export default function LabsMarketingPage() {
  return <MarketingDashboard />;
}
