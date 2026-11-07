/**
 * How a DESIGN.md import shapes the playground's shader.
 *
 * Colour needs nothing here: every scene reads the background field's roles
 * (--color-ambient-*), and the importer already rewrites those from the
 * action colour ("Action fade"), so a Spotify file gives a green horizon as
 * it gives a green field. What this adds is character: a few traits the file
 * states, read from the theme the importer built (never from its prose),
 * each nudging the scenes' settings by a factor. The factors multiply the
 * scene's own values and are held to each slider's range when applied, so a
 * nudge can never push a setting off its scale.
 *
 * One function answers both readers: the importer's report row (what the
 * file did to the shader, in rift's words) and the playground (the values it
 * seeds a scene with). Pure: no DOM, no React.
 */
import type { ShaderSceneParamSpec as ParamSpec } from "rift-ds/components/ShaderScene/ShaderScene";

/** What the importer's theme says that the shader reads. */
export type ShaderTraits = {
  /** The file describes its dark mode and leaves the light one to rift. */
  darkFirst?: boolean;
  elevation?: "default" | "flat" | "soft";
  /** The corner scale, in percent of rift's. */
  radiusScale?: number;
  pill?: boolean;
  /** The action colour, as hex. */
  brand?: string;
};

/** Factors per scene id, then per setting key; "field" is ShaderField's params. */
export type ShaderCharacter = {
  factors: Record<string, Record<string, number>>;
  /** Plain-language reasons, one per trait that moved anything. */
  reasons: string[];
};

const chroma = (hex: string) => {
  const n = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  if (Number.isNaN(n)) return 1;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return Math.max(r, g, b) - Math.min(r, g, b);
};

export function shaderCharacterFrom(traits: ShaderTraits): ShaderCharacter {
  const factors: Record<string, Record<string, number>> = {};
  const reasons: string[] = [];
  const nudge = (scene: string, key: string, by: number) => {
    factors[scene] ??= {};
    factors[scene][key] = (factors[scene][key] ?? 1) * by;
  };

  if (traits.darkFirst) {
    nudge("horizon", "glow", 0.85);
    nudge("rift", "glow", 0.85);
    nudge("field", "intensity", 0.85);
    reasons.push("it is dark first, so the light runs lower");
  }

  if (traits.elevation === "flat") {
    nudge("horizon", "glow", 0.85);
    nudge("horizon", "beam", 0.5);
    nudge("rift", "glow", 0.8);
    nudge("field", "intensity", 0.85);
    reasons.push("its surfaces are flat, so the glow and the beam are quieter");
  } else if (traits.elevation === "soft") {
    nudge("horizon", "glow", 1.1);
    nudge("rift", "glow", 1.1);
    reasons.push("its depth is soft, so the glow lifts a little");
  }

  if (traits.radiusScale !== undefined && traits.radiusScale < 50 && !traits.pill) {
    nudge("horizon", "warp", 0.6);
    nudge("rift", "wave", 0.6);
    nudge("field", "warp", 0.7);
    reasons.push("its corners are square, so the flow is stiller");
  } else if (traits.pill || (traits.radiusScale ?? 100) > 140) {
    nudge("horizon", "warp", 1.25);
    nudge("rift", "wave", 1.25);
    nudge("field", "warp", 1.2);
    reasons.push("its corners are round, so the flow is looser");
  }

  if (traits.brand && chroma(traits.brand) < 0.15) {
    nudge("horizon", "glow", 0.9);
    nudge("rift", "glow", 0.9);
    nudge("field", "intensity", 0.8);
    reasons.push("its action colour is near neutral, so the colour is quieter");
  }

  return { factors, reasons };
}

/** A scene's values with the character's factors applied, held to each slider's range. */
export function applyCharacter<T extends object>(
  values: T,
  sceneId: string,
  params: readonly Pick<ParamSpec, "key" | "min" | "max">[],
  character: ShaderCharacter | null
): T {
  const factors = character?.factors[sceneId];
  if (!factors) return values;
  const out = { ...values } as Record<string, number>;
  for (const param of params) {
    const by = factors[param.key];
    if (by === undefined || out[param.key] === undefined) continue;
    out[param.key] = Math.min(param.max, Math.max(param.min, out[param.key] * by));
  }
  return out as T;
}
