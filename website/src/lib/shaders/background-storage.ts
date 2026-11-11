/**
 * The site's backgrounds: the registry of what a visitor can put behind
 * every page, and the pick's names and restore, with no React in any of it.
 * The root layout (a Server Component) interpolates the key, the attribute
 * and the ids into its pre-paint script, and restoreDocumentTheme puts a
 * stored pick back, so this half lives apart from the hooks in
 * lib/shaders/background, which re-exports it and owns the contract.
 *
 * A new background is one row in website/src/data/site-backgrounds.json:
 * the header's switcher, the pre-paint script and BlurBackground all read
 * the list through SITE_BACKGROUNDS here. A row names a library ShaderScene and how it is tuned for each
 * band BlurBackground paints (globals.css owns the bands): `home` for the
 * tall bands, the extended one under the home hero and a full-bleed page,
 * and `page` for the standard band under every other page's title. The
 * field is the row with no scene: the site's own ShaderField, the served
 * default, which an absent attribute means.
 */
import type { ShaderSceneId } from "rift-ds/components/ShaderScene/ShaderScene";
import data from "@/data/site-backgrounds.json";

/** The attribute on <html> that carries the pick; absent means the field. */
export const BACKGROUND_ATTR = "data-background";

/** The localStorage key the layout's pre-paint script reads. */
export const BACKGROUND_STORAGE_KEY = "background";

type SceneTuning = {
  params?: Partial<Record<string, number>>;
  passes?: Partial<Record<string, { on?: boolean; params?: Partial<Record<string, number>> }>>;
};

export type SiteBackgroundEntry = {
  /** The id the attribute and storage carry. */
  id: string;
  /** The name the switchers show. */
  label: string;
  /** One line under the name in the header's menu. */
  description: string;
  /** The Material Symbol the header's trigger and menu rows wear. */
  icon: string;
  /** The library scene painted in the field's place; none means the field itself. */
  scene?: ShaderSceneId;
  /** The scene in the tall bands: low, under a hero. */
  home?: SceneTuning;
  /** The scene in the standard band: the top half of it, under a title. */
  page?: SceneTuning;
};

/* The rows live in website/src/data/site-backgrounds.json, the registry
   (CLAUDE.md's Registries table), typed here against the library's scene
   ids so a row can never name a scene the package does not ship; the
   validator holds the params and passes to each scene's declared ranges.
   The tuning each row carries is a design decision, so its reasons live
   here beside the type rather than in the data:

   Horizon, home: set low in the extended band, so its bright limb lands
   under the hero's calls to action and peeks over the top of the chat
   frame below them, rather than behind the counts, with the beam softened
   so the counts above it stay readable.

   Horizon, page: the top half of the scene in the standard band. The limb
   sits high, so the sky's glow and the arc itself are what the band shows
   under the page title, and the world below it fades to the page floor
   inside the scene (the fadeBottom pass) before the band's own fade
   finishes the job; the beam is softened as on the home page.

   Glyphs, home: the whole composition dropped (rise), so the streak and
   its core land under the hero's calls to action and over the top of the
   chat frame rather than behind the headline and the counts, with the
   type thinned and the exposure eased. That alone left the bloom above
   the core printing bright type straight through the counts, so the top
   fade starts as low as it can and falls off fast: by the counts' row the
   scene is down to about a third, and the counts and their labels read.

   Glyphs, page: the streak sits in the upper half of the standard band,
   between the header and the page title, with no top fade to cut it and a
   longer bottom fade so the blooms below it are gone before the content
   starts; thinner type and less exposure again, since a title sits on it.
   Both bands take far less grain than the scenes' default: grain over
   type reads as noise in the characters.

   The four that follow fill their box with no top fade, since each is
   dark at its own top or is colour all the way up, and all take the
   lighter grain.

   Prism, both bands: the stone sits right of centre, so the strong beams
   fall beside a centred headline and behind a page's links rather than
   through a title, with the glow eased and a long bottom fade, so the
   beams give out into the page before the content starts.

   Meteors, home: the limb set low, as Horizon's is, so it meets the top
   of the chat frame and the shower falls behind the hero; the flare is
   eased so the counts above it read. Meteors, page: the limb crosses the
   standard band behind the title and the planet below it fades to the
   page floor inside the scene, as Horizon's world does.

   Waves, home: the sea is lowered until its far edge lies under the
   counts, so the dots run behind the calls to action and into the chat
   frame and never behind a number, with the dots a little smaller. Waves,
   page: the sea is raised so its brightest dots sit behind the header,
   and the bottom fade starts high, so by the title it is down to a faint
   glow: a title cannot be read through a field of points.

   Aurora, both bands: the one background that is colour edge to edge, so
   it is dimmed to half on the home page and a little further under a
   title, and a long bottom fade takes it to the page. */
export const SITE_BACKGROUNDS: readonly SiteBackgroundEntry[] = data.backgrounds as SiteBackgroundEntry[];

export type SiteBackground = string;

/** The served default: the row with no scene. */
export const DEFAULT_BACKGROUND = SITE_BACKGROUNDS.find((entry) => !entry.scene)?.id ?? "field";

/** The ids that paint a scene, the ones the attribute ever carries. */
export const SCENE_BACKGROUND_IDS = SITE_BACKGROUNDS.filter((entry) => entry.scene).map(
  (entry) => entry.id,
);

/** The registry row for an id, when it is one. */
export const backgroundEntry = (id: string | null | undefined): SiteBackgroundEntry | undefined =>
  SITE_BACKGROUNDS.find((entry) => entry.id === id);

/** Whether a stored or attribute value names a background that paints a scene. */
export const isSceneBackground = (value: string | null | undefined): value is string =>
  typeof value === "string" && SCENE_BACKGROUND_IDS.includes(value);

/** Puts a stored pick back on <html>; the pre-paint script's work, for the restore path. */
export function restoreSiteBackground(root: HTMLElement, stored: string | null) {
  if (isSceneBackground(stored)) root.setAttribute(BACKGROUND_ATTR, stored);
  else root.removeAttribute(BACKGROUND_ATTR);
}
