/**
 * Labs: the glass chat, a surface experiment. A chat window as frosted
 * glass over a piece of procedural pixel art, with scanlines across the
 * stage. The chat is the real one: SiteChat on the root provider, restyled,
 * with nothing rebuilt.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import GlassChat from "./GlassChat";

/* The backdrop slot: a picture dropped at this path in public/ replaces
   the procedural tree. Checked on the server, so a missing file is the
   tree rather than a failed request. */
const BACKDROP = "/labs/glass-chat-bg.jpg";

export default function LabsGlassChatPage() {
  const hasBackdrop = existsSync(join(process.cwd(), "public", BACKDROP));
  return <GlassChat backdrop={hasBackdrop ? BACKDROP : undefined} />;
}
