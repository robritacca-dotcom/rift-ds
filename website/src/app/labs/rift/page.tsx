/**
 * Labs: the rift, a surface experiment. The site's chat as frosted glass over
 * a tear in the page. The chat is the real one, restyled, with nothing rebuilt.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import RiftStage from "./RiftStage";

export default function LabsRiftPage() {
  return <RiftStage />;
}
