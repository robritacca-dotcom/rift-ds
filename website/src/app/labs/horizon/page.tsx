/**
 * Labs: the horizon chat, a surface experiment. The site chat over a soft
 * planet horizon at night (HorizonCanvas), the way a product home puts its
 * prompt box over a hero shader. The chat is the real one: SiteChat on the
 * root provider, restyled, with nothing rebuilt.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import HorizonStage from "./HorizonStage";

export default function LabsHorizonPage() {
  return <HorizonStage />;
}
