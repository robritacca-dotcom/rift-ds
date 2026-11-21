/**
 * The docs template, rendered full viewport. The route is chromeless (see
 * CHROMELESS_ROUTES in src/config/chromeless.ts) because the shared footer,
 * chat panel, and palette would sit inside the documentation site being
 * shown; the implementation lives in components/templates/Docs. Its
 * fictional product keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 *
 * A Server Component so the code samples are highlighted here, at build
 * time, and the page ships no highlighter.
 */

import { highlight } from "rift-ds/code/highlight";
import Docs from "@/components/templates/Docs/Docs";
import { USAGE, VARIANTS } from "@/components/templates/Docs/docsSamples";

export default async function DocsTemplatePage() {
  const [usageLines, variantLines] = await Promise.all([highlight(USAGE, "tsx"), highlight(VARIANTS, "tsx")]);
  return <Docs usageLines={usageLines} variantLines={variantLines} />;
}
