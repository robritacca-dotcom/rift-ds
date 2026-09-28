/**
 * The mobile dashboard template, rendered full viewport: the app itself at
 * a phone's width, a framed phone on the dotted ground at any other. The
 * route is chromeless (see CHROMELESS_ROUTES in src/config/chromeless.ts)
 * because the shared footer, chat panel, and palette would sit around the
 * phone being shown; the implementation lives in
 * components/templates/MobileDashboard. Its fictional demo data keeps the
 * route out of the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs).
 */

import MobileDashboard from "@/components/templates/MobileDashboard/MobileDashboard";

export default function MobileDashboardTemplatePage() {
  return <MobileDashboard />;
}
