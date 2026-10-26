/**
 * Labs: the table bench. Every table the system offers, staged side by side
 * from the smallest (a markdown table) to the largest (a data grid with
 * every column and row control on), each at a desktop, tablet or phone
 * width, in both themes. It is where the tables work is judged, phase by
 * phase, and where the gesture stress check drags the grips
 * (scripts/gestures.json), and the page scripts/validate-website-a11y.mjs
 * renders under forced colors.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import { TablesBench } from "./TablesBench";

export default function LabsTablesPage() {
  return <TablesBench />;
}
