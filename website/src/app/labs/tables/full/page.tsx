/**
 * Labs: the tables bench's most complex table as a full page, the way an
 * app screen would carry it: a top bar, then the Everything table filling
 * the rest of the viewport, its header sticking while sixty rows scroll.
 *
 * Noindex, chromeless (src/config/chromeless.ts) and excluded from the chat
 * corpus (EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs), like the
 * bench it opens from.
 */

import { FullTable } from "./FullTable";

export const metadata = {
  title: "Labs: tables, full page",
  description:
    "The table bench's most complex table, every column and row control on, filling a page the way an app screen would.",
  robots: { index: false, follow: false },
};

export default function LabsTablesFullPage() {
  return <FullTable />;
}
