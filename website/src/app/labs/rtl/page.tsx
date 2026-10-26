/**
 * Labs: the right-to-left bench. The library laid out in Arabic, in an
 * Arabic locale, with a switch back to left to right: logical sides, the
 * direction sign, mirrored glyphs, flipped arrow keys and drags, start-side
 * popups and drawers, and numbers and dates written in ar-EG. The page-level
 * accessibility check renders it in both themes, and the gesture stress
 * check drags its split pane (scripts/gestures.json), so a component that
 * breaks right to left fails a served-site check, not just a story.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs). Its Arabic copy is
 * placeholder content for the layout, not site prose.
 */

import { RtlBench } from "./RtlBench";

export default function LabsRtlPage() {
  return <RtlBench />;
}
