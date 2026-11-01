/**
 * The analytics template, rendered full viewport. The route is chromeless
 * (see CHROMELESS_ROUTES in src/config/chromeless.ts) because the shared
 * footer, chat panel, and palette would sit inside the app shell being shown.
 * Its fictional demo data keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import Analytics from "@/components/templates/Analytics/Analytics";

export default function AnalyticsTemplatePage() {
  return <Analytics />;
}
