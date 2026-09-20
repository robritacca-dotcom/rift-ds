/* ============================================
   SHADER BACKGROUND CONFIG ACCESSOR
   Single source of truth for *this site's*
   background: which renderer paints it, the
   eight shader parameters, and the eight blob
   definitions. BlurBackground reads it; nothing
   else owns a copy of these numbers.

   The renderer itself is the design system's
   ShaderField component, and the shapes below
   are its published types — imported, not
   restated, so the config can never describe a
   field the component does not render.

   The blob table in the JSON is ported 1:1 from
   the CSS blobs in globals.css — same centres,
   same sizes, same drift periods — so the field
   and its fallback are the same picture. One
   deliberate divergence: "crop" holds the field
   near the scale it was composed at on a narrow
   viewport, which the vw-sized CSS discs cannot
   do, so below about 1440px the fallback shows
   the whole composition where the field crops
   into it. Both read as the same ambient wash;
   only the framing differs, and only on a
   machine that cannot run the shader.

   To retune: dial a look in with the dev-only
   panel (append ?tune=1 to any page in
   `npm run dev --workspace website`), then
   paste the panel's snippet
   values back into shader-background.json.

   To roll back to the CSS blobs site-wide: set
   "mode" to "css". Nothing needs deleting — the
   blobs are always rendered underneath, and the
   shader simply never mounts.

   Validated by scripts/validate-shader-background.mjs.
   ============================================ */

import type {
  ShaderBlob,
  ShaderParams,
} from "@robr0/design-system/components/ShaderField/ShaderField";
import data from "./shader-background.json";

export type { ShaderBlob, ShaderParams };

/** Which renderer paints the background across the whole site. */
export type BackgroundMode = "shader" | "css";

export interface ShaderBackgroundConfig {
  mode: BackgroundMode;
  params: ShaderParams;
  blobs: ShaderBlob[];
}

export const shaderBackground: ShaderBackgroundConfig =
  data as ShaderBackgroundConfig;
