/**
 * The Shaders view's templates, one per scene: the scene and only what differs from its defaults
 * (settings, speed, which passes are on and how). Picking one rebuilds the
 * values from the scene's defaults and lays these on top, so a template
 * never has to restate a setting it does not change. A new template is one
 * entry here.
 */
import {
  SHADER_PASSES as PASSES,
  shaderSceneDefaults as defaultsFor,
  type ShaderSceneDefinition as Scene,
  type ShaderSceneValues as Values,
} from "rift-ds/components/ShaderScene/ShaderScene";
import { SCENES } from "./scenes";

export type Template = {
  id: string;
  label: string;
  description: string;
  sceneId: string;
  speed?: number;
  scene?: Record<string, number>;
  passes?: Record<string, { on?: boolean; params?: Record<string, number> }>;
};

export const TEMPLATES: Template[] = [
  {
    id: "field",
    label: "Field",
    description: "The home page's ambient field: soft colour that flows and streams.",
    sceneId: "field",
    passes: { fadeTop: { on: false }, fadeBottom: { params: { from: 0, to: 0.45 } } },
  },
  {
    id: "horizon",
    label: "Horizon",
    description: "A planet's limb at night: a fixed sun, soft layers of light, clouds and ocean.",
    sceneId: "horizon",
  },
  {
    id: "rift",
    label: "Rift",
    description: "A glowing tear in the page, opening at its middle, light streaming in.",
    sceneId: "rift",
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, vignette: { on: true, params: { amount: 0.6 } } },
  },
  {
    id: "glyphs",
    label: "Glyphs",
    description: "Soft light printed in type: characters that thicken with the brightness.",
    sceneId: "glyphs",
    speed: 1,
    passes: { fadeTop: { on: false }, fadeBottom: { on: false }, grain: { params: { amount: 0.06 } } },
  },
];

/** The template a first pick lands on, and the right rail's reset target: the
    field, the home page's own shader. */
export const DEFAULT_TEMPLATE = TEMPLATES.find((t) => t.id === "field") ?? TEMPLATES[0];

export const sceneOf = (template: Template): Scene =>
  SCENES.find((scene) => scene.id === template.sceneId) ?? SCENES[0];

/** The scene's defaults with the template's differences laid on top. */
export function valuesOf(template: Template): Values {
  const scene = sceneOf(template);
  return {
    speed: template.speed ?? 1.6,
    scene: { ...defaultsFor(scene.params), ...template.scene },
    passes: Object.fromEntries(
      PASSES.map((pass) => {
        const change = template.passes?.[pass.id];
        return [
          pass.id,
          {
            on: change?.on ?? pass.on,
            params: { ...defaultsFor(pass.params), ...change?.params },
          },
        ];
      })
    ),
  };
}
