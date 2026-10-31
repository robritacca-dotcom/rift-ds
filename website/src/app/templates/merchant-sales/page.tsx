/**
 * The merchant sales template, rendered full viewport. The route is
 * chromeless (see CHROMELESS_ROUTES in src/config/chromeless.ts) because the
 * shared footer, chat panel, and palette would sit inside the app shell
 * being shown; the implementation lives in components/templates/MerchantSales.
 * Its fictional demo data keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import MerchantSales from "@/components/templates/MerchantSales/MerchantSales";

export default function MerchantSalesTemplatePage() {
  return <MerchantSales />;
}
