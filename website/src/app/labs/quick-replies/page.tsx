/**
 * Labs: quick replies. The five levels of how an agent's reply can end,
 * each one a button that plays its exchange in a scripted chat beside it.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import QuickReplies from "./QuickReplies";

export default function LabsQuickRepliesPage() {
  return <QuickReplies />;
}
