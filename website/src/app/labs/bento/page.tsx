/**
 * Labs: the bento. Feature banners in a grid, each with a texture of its
 * own (a shader wash, a particle halo, a dotted sphere, hairlines) and a
 * small piece of real library UI that moves quietly inside it. The expand
 * button opens the banner into a full overlay, morphing the card into the
 * panel through a view transition.
 *
 * An experiment towards a pair of library components (the banner and the
 * overlay), so everything here is page-local until the shape settles.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import Bento from "./Bento";

export default function LabsBentoPage() {
  return <Bento />;
}
