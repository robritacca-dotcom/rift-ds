/**
 * The landing page template, rendered full viewport. The route is chromeless
 * (see CHROMELESS_ROUTES in src/config/chromeless.ts) because the shared
 * footer, chat panel, and palette would sit inside the product page being
 * shown; the implementation lives in components/templates/LandingPage. Its
 * fictional product keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import LandingPage from "@/components/templates/LandingPage/LandingPage";

export default function LandingPageTemplatePage() {
  return <LandingPage />;
}
