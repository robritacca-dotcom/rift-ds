/**
 * The profit and loss template, rendered full viewport. The route is
 * chromeless (see CHROMELESS_ROUTES in src/config/chromeless.ts) because the
 * shared footer, chat panel, and palette would sit inside the app shell
 * being shown; the implementation lives in components/templates/ProfitAndLoss.
 * Its fictional demo data keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import ProfitAndLoss from "@/components/templates/ProfitAndLoss/ProfitAndLoss";

export default function ProfitAndLossTemplatePage() {
  return <ProfitAndLoss />;
}
