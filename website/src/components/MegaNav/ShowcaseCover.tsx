import type { MegaShowcase } from "@/config/navigation";
import { SceneCover } from "./SceneCover";
import { FigmaCover } from "./FigmaCover";
import { ThemesCover } from "./ThemesCover";

/**
 * The drawing a mega menu's showcase card carries, by its graphic key: a
 * token-drawn picture or a live library scene, never a raster. Decorative,
 * since the card's own title and description carry the meaning.
 */
export function ShowcaseCover({ graphic }: { graphic: MegaShowcase["graphic"] }) {
  if (graphic === "themes") return <ThemesCover />;
  if (graphic === "scene") return <SceneCover />;
  return <FigmaCover />;
}
