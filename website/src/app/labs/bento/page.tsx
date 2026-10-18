/**
 * Labs: the bento. Feature banners in a grid, each a library BentoTile with
 * a small piece of real library UI that moves quietly inside it. The expand
 * button opens the banner into a full overlay, morphing the card into the
 * panel through a view transition.
 *
 * The proving ground BentoTile and BentoTileArt graduated from: the tile
 * now owns the background, the safe area and the overlay, and this page
 * owns only the grid, the scenes and what each overlay shows.
 *
 * This route is noindex, chromeless, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import Bento from "./Bento";

export default function LabsBentoPage() {
  return <Bento />;
}
