/**
 * The sign-in template, rendered full viewport. The route is chromeless (see
 * CHROMELESS_ROUTES in src/config/chromeless.ts) because the shared footer,
 * chat panel, and palette would sit inside the product screen being shown;
 * the implementation lives in components/templates/SignIn. Its fictional
 * product keeps the route out of the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs).
 */

import SignIn from "@/components/templates/SignIn/SignIn";

export default function SignInTemplatePage() {
  return <SignIn />;
}
