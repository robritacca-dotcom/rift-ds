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
 * field is the row with no scene: the site's own ShaderField, which an
 * absent attribute means. The row marked `off` paints nothing at all: no
 * field, no scene and no GL context, the plain page floor. The registry's `default` names the row a visit
 * with no stored pick gets.
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
  /** True on the one row that paints nothing: no field, no scene, the plain page. */
  off?: boolean;
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

   Rift, both bands: the library scene exactly as it ships, with no tuning
   and no passes, so the site shows the tear at its own defaults.

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

   Of the four that follow, Prism, Waves and Aurora fill their box with no
   top fade, since each is dark at its own top or is colour all the way
   up; Meteors keeps the default top fade, as Horizon does. All four take
   the lighter grain.

   Prism, both bands: the stone sits right of centre, so the strong beams
   fall beside a centred headline and behind a page's links rather than
   through a title, with the glow eased and a long bottom fade, so the
   beams give out into the page before the content starts.

   Meteors, home: the limb is flattened and levelled and set so it only
   just clears the top of the chat frame across its whole width, the sun
   peeking over it, and the shower falls behind the hero; the scene's own
   lean would lift the limb's left end into the counts. The flare is eased
   so the counts above it read. Meteors, page: the limb crosses the
   standard band behind the title and the planet below it fades to the
   page floor inside the scene, as Horizon's world does.

   Waves, home: the sea is set so its far edge lies under the
   counts, so the dots run behind the calls to action and into the chat
   frame and never behind a number, with the dots a little smaller. Waves,
   page: the sea is raised so its brightest dots sit behind the header,
   and the bottom fade starts high, so by the title it is down to a faint
   glow: a title cannot be read through a field of points.

   Aurora, both bands: the one background that is colour edge to edge, so
   it is dimmed on the home page and a little further under a
   title, and a long bottom fade takes it to the page.

   Highway, home: the horizon lies on the hero's own divider, the hairline
   between the subtitle and the counts, so the scene's line and the page's
   are one line (the crown is that rule's height in the band at desktop
   widths), and the vanishing point is pushed past the right edge of the
   page, so the trails cross the whole hero from that side and their
   meeting point is only a glow at the edge.
   They run behind the counts and the calls to action and into the chat
   frame, and the vanishing light is eased so it does not compete with the
   headline. No top fade: the sky is dark at its own top.
   Highway, page: the horizon is raised to sit just above the sidebar and the
   page title, so the title stands on the road rather than under the
   horizon line and the trails run behind it (lower, the bottom fade takes
   the trails out almost as they begin), with the trails and the vanishing light
   eased further and a long bottom fade, so they give out before the
   content starts. Both bands take half as much grain again as the other
   scenes' lighter setting: the highway is a long exposure, and the grain is
   part of that.

   Ocean, both bands: the one background that is a day scene on a light
   page, so it is water edge to edge in both modes and takes no top fade
   and no grain, which would sit on clear water as dirt. In both the animals
   are fainter and smaller than the scene's own and the glints fewer, since
   they swim behind a headline or a title and the tall bands would
   otherwise draw a shark across the whole hero; the wake is halved too,
   since a school crossing the counts and the calls to action with a full
   wake of characters behind it read as clutter. Home: the light on the
   water is eased so it does not compete with the headline. Page: the net
   of light is eased too, and a long bottom fade takes the water to the
   page before the content starts.

   Sky, both bands: the other background with a day of its own, so like
   the ocean it is sky edge to edge in both modes and takes no top fade.
   It takes twice the other scenes' lighter grain, which on a painted sky
   is the paint's tooth and part of the look. In both the sun is eased,
   which dims the burning cloud with it, the sky is a little shallower
   than the scene's own and there is a little less cloud, since a headline
   or a title is read against it: at full strength the cloud on a dark
   page outshines the type, and a deep sky on a light page costs dark type
   its contrast. The fire itself is left whole, since the drama is the
   point of the pick. Home: the scene's own low sun and horizon, so the
   hot cloud and the burning strip gather low in the band, under the
   headline and the calls to action rather than behind them. Page: the
   band is short and the content starts under it, so the horizon is
   dropped out of the band, which a bottom fade would wash out anyway, and
   the sun is raised to the middle of the band and moved out to the side,
   clear of the title, with the cloud a little smaller so a short band
   still holds a few masses, and a long bottom fade takes the sky to the
   page before the content starts. The plane's path is laid clear of the
   page's type in each band. Home: it climbs out of the right edge through
   the open corner between the header and the headline, beside the theme
   swatches, and leaves through the gap between the header's links and its
   buttons. Page: it flies level through the strip between the header and
   the breadcrumb. Both are fitted to the desktop layout; a narrow screen
   has no such corridor, and the plane is a few pixels long.

   Galaxy, both bands: a night scene that is dark at its own top, so it
   takes no top fade, and the lighter grain. The scene's own galaxy sits
   in the middle of its box, which in either band is where the type is, so
   in both it is moved up into the open corner on the
   right, clear of a centred headline and of a page's title and links,
   with the core eased so the brightest thing on the page is not the
   background, and the stars thinned since type is read through them.
   Home: under the header's buttons, beside the theme swatches, its lower
   arm giving out before the headline. Page: in the strip between the
   header and the page's links, with a long bottom fade so the stars are
   gone before the content starts. The nebula is eased in both, since
   type is read on it. Home: it falls from the upper left to the lower
   right, through the hero and under the galaxy, at the scene's own
   angle. Page: it is flattened and raised to cross the top of the band,
   behind the header, and eased further, so the title sits under its
   lower edge and the fade takes the rest. */
export const SITE_BACKGROUNDS: readonly SiteBackgroundEntry[] = data.backgrounds as SiteBackgroundEntry[];

export type SiteBackground = string;

/** The field: the row with no scene that is not the off row, the one an absent attribute means. */
export const FIELD_BACKGROUND =
  SITE_BACKGROUNDS.find((entry) => !entry.scene && !entry.off)?.id ?? "field";

/** The served default: the row a visit with no stored pick gets (the
    registry's `default`). A scene, so a first visit carries the attribute;
    the field, once picked, is stored by name and so survives the default. */
export const DEFAULT_BACKGROUND: string = (data as { default?: string }).default ?? FIELD_BACKGROUND;

/** The ids the attribute ever carries: every row but the field, so the
    rows that paint a scene and the off row, which the attribute must name
    for the band to stay empty from the first paint. */
export const SCENE_BACKGROUND_IDS = SITE_BACKGROUNDS.filter((entry) => entry.scene || entry.off).map(
  (entry) => entry.id,
);

/** The registry row for an id, when it is one. */
export const backgroundEntry = (id: string | null | undefined): SiteBackgroundEntry | undefined =>
  SITE_BACKGROUNDS.find((entry) => entry.id === id);

/** Whether a stored or attribute value names a background the attribute carries (a scene, or off). */
export const isSceneBackground = (value: string | null | undefined): value is string =>
  typeof value === "string" && SCENE_BACKGROUND_IDS.includes(value);

/** Every id a stored pick may name. */
export const BACKGROUND_IDS = SITE_BACKGROUNDS.map((entry) => entry.id);

/** A stored pick, or the served default when nothing valid is stored. */
export const resolveBackground = (stored: string | null | undefined): string =>
  typeof stored === "string" && BACKGROUND_IDS.includes(stored) ? stored : DEFAULT_BACKGROUND;

/** Puts a stored pick (or the default) back on <html>; the pre-paint script's work, for the restore path. */
export function restoreSiteBackground(root: HTMLElement, stored: string | null) {
  const background = resolveBackground(stored);
  if (isSceneBackground(background)) root.setAttribute(BACKGROUND_ATTR, background);
  else root.removeAttribute(BACKGROUND_ATTR);
}
