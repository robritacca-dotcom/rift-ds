/* ============================================
   SHARED NAVIGATION CONFIG
   Single source of truth for all nav, sidebar,
   and subnav links across the site.
   ============================================ */

import type { Metadata } from "next";
import {
  COMPONENT_COUNT,
  componentMetadata,
  componentCategoryMetadata,
} from "rift-ds/components/registry";

export interface NavLink {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Optional logo path (e.g. "/logos/Intuit.svg") rendered to the left of the label in Sidebar */
  logo?: string;
  /** One-line summary — Sidebar's `searchable` filter matches against it too */
  description?: string;
}

/** A row in a mega menu — provide either an `icon` (Material Symbol) or a `logo` (image path) */
export interface MegaItem {
  href: string;
  label: string;
  description: string;
  icon?: string; // Material Symbols name
  logo?: string; // Path to logo SVG/image — rendered in the icon slot when set
  /**
   * The page needs a pointer and a wide viewport, so it stays out of the
   * mobile IA: the drawer never lists it, and the surfaces that render on
   * every viewport (footer, DS landing hero, home DS card) hide its link
   * below the nav's 959px breakpoint. The mega panels need no guard — they
   * only exist above it.
   */
  desktopOnly?: boolean;
}

/** One step in a breadcrumb trail; omit href for the current page (last item) */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/* ============================================
   TOP NAV — the sections, each with its own mega panel
   ============================================ */

/** A titled column in a mega panel's link grid. */
export interface MegaGroup {
  id: string;
  /** Column header, set in the overline face. */
  label: string;
  items: MegaItem[];
}

/** The featured-page card rendered beside a panel's link grid. */
export interface MegaShowcase {
  href: string;
  overline: string;
  label: string;
  description: string;
  /** Which cover the card draws — a token-drawn vector, never a raster. */
  graphic: "pipeline" | "primitives";
}

/**
 * One top-level nav section. Every section renders as a header trigger; a
 * section with a `mega` opens its own panel on hover or focus, and a click
 * on the trigger lands on `href`. Everything below (drawer, footer, palette,
 * breadcrumbs, sitemap) derives from this array — add a section here and it
 * appears everywhere at once.
 */
export interface NavSection {
  id: string;
  label: string;
  href: string;
  /** Trigger icon — reused wherever the section renders as a row. */
  icon: string;
  /** One-line summary for panels, the footer and the palette. */
  description: string;
  mega?: { groups: MegaGroup[]; showcase?: MegaShowcase };
  isActive: (path: string) => boolean;
}

/* Category icons for the Components panel, keyed by registry category id. */
const CATEGORY_ICONS: Record<string, string> = {
  actions: "touch_app",
  ai: "smart_toy",
  charts: "bar_chart",
  "data-display": "table_chart",
  effects: "blur_on",
  feedback: "notifications",
  forms: "edit_note",
  layout: "space_dashboard",
  maps: "public",
  navigation: "explore",
  overlays: "picture_in_picture",
};

/* The Components panel: category anchors on the index, derived from the
   registry — never a hand list, and never all the components (the sidebar
   accordions own that depth). Two balanced columns. */
/* Panel rows keep to a line or two: a registry description that elaborates
   after a colon or a ", from" clause is cut at the boundary for display —
   derived from the registry, never restated, and the full sentence still
   serves the corpus and MCP. */
const trimForPanel = (description: string): string => {
  const cut = description.split(/: |, from /)[0].replace(/[,.]$/, "");
  // A lead-in this short says nothing alone ("Page scaffolding.") — keep
  // the whole sentence and let the panel's two-line clamp bound it.
  if (cut.length < 40) return description;
  return `${cut}.`;
};

const componentCategoryItems: MegaItem[] = componentCategoryMetadata.map(
  (cat) => ({
    href: `/components#${cat.id}`,
    label: cat.label,
    description: trimForPanel(cat.description),
    icon: CATEGORY_ICONS[cat.id] ?? "widgets",
  })
);

/* The Foundations and Templates panels derive from the sidebar arrays below
   (declared before them in file order, so these builders run lazily). */
const FOUNDATION_ICONS: Record<string, string> = {
  "/foundations/elevation": "layers",
  "/foundations/icons": "apps",
  "/foundations/logos": "diamond",
  "/foundations/motion": "animation",
  "/foundations/colour-primitives": "palette",
  "/foundations/colour-mode": "invert_colors",
  "/foundations/spatial": "straighten",
  "/foundations/themes": "palette",
  "/foundations/typography": "text_fields",
};

const DOC_ITEM_ICONS: Record<string, string> = {
  "/overview": "account_tree",
  "/docs/get-started": "rocket_launch",
  "/blueprints/claude": "description",
  "/blueprints/design": "description",
  "/blueprints/content-design": "description",
  "/skills": "construction",
  "/loops": "all_inclusive",
  "/releases": "new_releases",
};

const linksToMegaItems = (
  links: NavLink[],
  icons: Record<string, string>
): MegaItem[] =>
  links
    .filter((l) => l.label !== "Contents")
    .map((l) => ({
      href: l.href,
      label: l.label,
      description: l.description ?? "",
      icon: icons[l.href] ?? "description",
    }));

/** The top-level sections, in header order. Built lazily (see navSections). */
function buildNavSections(): NavSection[] {
  return [
    {
      id: "components",
      label: "Components",
      href: "/components",
      icon: "widgets",
      description: `${COMPONENT_COUNT} React components, each with live examples and Storybook docs`,
      mega: {
        groups: [
          {
            id: "categories",
            label: "Categories",
            items: componentCategoryItems,
          },
        ],
      },
      isActive: (path) => path.startsWith("/components"),
    },
    {
      id: "foundations",
      label: "Foundations",
      href: "/foundations",
      icon: "category",
      description:
        "Colours, type, spacing, motion, and icons, defined once as tokens",
      mega: {
        groups: [
          {
            id: "foundations",
            label: "Foundations",
            // Primitive colours leaves the grid: it is the panel's showcase.
            items: linksToMegaItems(
              foundationsSidebarLinks.filter(
                (l) => l.href !== "/foundations/colour-primitives"
              ),
              FOUNDATION_ICONS
            ),
          },
        ],
        showcase: {
          href: "/foundations/colour-primitives",
          overline: "The raw layer",
          label: "Primitive colours",
          description:
            "The raw ramps every colour token resolves to. Retune a primitive and the whole system follows.",
          graphic: "primitives",
        },
      },
      isActive: (path) => path.startsWith("/foundations"),
    },
    {
      id: "templates",
      label: "Templates",
      href: "/templates",
      icon: "dashboard_customize",
      description:
        "Whole screens assembled from the system's components and tokens",
      // Deliberately no mega: the index page is the menu.
      isActive: (path) => path.startsWith("/templates"),
    },
    {
      id: "playground",
      label: "Playground",
      href: "/playground",
      icon: "tune",
      description: "Re-theme the whole system live: components, type and chat",
      // Deliberately no mega: the trigger is the destination.
      isActive: (path) => path === "/playground" || path === "/graph",
    },
    {
      id: "docs",
      label: "Docs",
      href: "/docs",
      icon: "menu_book",
      description:
        "How the system works, what you can reuse, and where to start",
      mega: {
        groups: [
          {
            id: "learn",
            label: "Learn",
            // Get started leaves the grid: it is the panel's showcase.
            items: linksToMegaItems(
              docsSidebarLinks.filter((l) => l.href === "/overview"),
              DOC_ITEM_ICONS
            ),
          },
          {
            id: "blueprints",
            label: "Blueprints",
            items: linksToMegaItems(
              docsSidebarLinks.filter((l) => l.href.startsWith("/blueprints")),
              DOC_ITEM_ICONS
            ),
          },
          {
            id: "meta",
            label: "The system at work",
            items: linksToMegaItems(
              docsSidebarLinks.filter((l) =>
                ["/skills", "/loops", "/releases"].includes(l.href)
              ),
              DOC_ITEM_ICONS
            ),
          },
        ],
        showcase: {
          href: "/docs/get-started",
          overline: "Start here",
          label: "Get started",
          description:
            "Install the package, load the tokens, and theme the system to your brand in minutes.",
          graphic: "pipeline",
        },
      },
      isActive: (path) =>
        path.startsWith("/docs") ||
        path === "/overview" ||
        path.startsWith("/blueprints") ||
        path.startsWith("/skills") ||
        path.startsWith("/loops") ||
        path.startsWith("/releases"),
    },
  ];
}

let navSectionsCache: NavSection[] | undefined;
/** The top-level sections — lazy so the sidebar arrays below exist first. */
export function getNavSections(): NavSection[] {
  return (navSectionsCache ??= buildNavSections());
}

/**
 * The sections as flat rows — the footer's Design system column, the
 * palette's section group, and the landing page's section buttons all read
 * this one list.
 */
export function getSectionItems(): MegaItem[] {
  return getNavSections().map(({ href, label, description, icon }) => ({
    href,
    label,
    description,
    icon,
  }));
}

/* ============================================
   SECTION SIDEBAR LINKS
   ============================================ */

/**
 * Derived from the component registry — never hand-maintained.
 *
 * Every entry's label, slug and description live in
 * src/components/registry.json, so adding a component to the registry puts it
 * in the sidebar, the sitemap, the mega-nav and the breadcrumbs at once. The
 * alphabetical order and the nav entry itself used to be checked by
 * validate-website-surfaces.mjs; both are now structurally guaranteed.
 */
export const componentsSidebarLinks: NavLink[] = [
  { href: "/components", label: "Components overview" },
  ...[...componentMetadata]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((c) => ({
      href: `/components/${c.slug}`,
      label: c.label,
      description: c.description,
    })),
];

/** A titled group of sidebar links; the header toggles the group's accordion. */
export interface SidebarGroup {
  id: string;
  label: string;
  links: NavLink[];
}

/**
 * The components sidebar, grouped by category — one accordion per registry
 * category, components alphabetical by label within each. Categories have no
 * page of their own; they are sections of the /components index (`#<id>`
 * anchors) and these sidebar groups.
 */
export const componentsSidebarGroups: SidebarGroup[] = componentCategoryMetadata.map(
  (cat) => ({
    id: cat.id,
    label: cat.label,
    links: [...componentMetadata]
      .filter((c) => c.category === cat.id)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((c) => ({
        href: `/components/${c.slug}`,
        label: c.label,
        description: c.description,
      })),
  })
);

export const foundationsSidebarLinks: NavLink[] = [
  { href: "/foundations", label: "Contents" },
  { href: "/foundations/accessibility", label: "Accessibility", description: "What the build enforces, and what it does not" },
  { href: "/foundations/elevation", label: "Elevation", description: "The shadow and depth tokens" },
  { href: "/foundations/icons", label: "Icons", description: "The icon font and its size scale" },
  { href: "/foundations/logos", label: "Logos", description: "The brand marks and how they are used" },
  { href: "/foundations/motion", label: "Motion", description: "The duration and easing tokens" },
  { href: "/foundations/colour-primitives", label: "Primitive colours", description: "The raw values behind the colour tokens" },
  { href: "/foundations/colour-mode", label: "Semantic colours", description: "Every colour token in both themes" },
  { href: "/foundations/spatial", label: "Semantic spacing", description: "The spacing, radius, and border tokens" },
  { href: "/foundations/themes", label: "Themes", description: "Every shipped look, applied live or copied into your app" },
  { href: "/foundations/typography", label: "Typography", description: "The type scale, weights, and faces" },
];

/**
 * Sidebar for the Docs cluster — the /docs index page, the system overview,
 * and the artifacts visitors can take and reuse (the links array below is
 * the list). (Sub-pages keep their original URLs; /docs is the landing.)
 */
export const docsSidebarLinks: NavLink[] = [
  { href: "/docs", label: "Contents" },
  { href: "/overview", label: "Overview", description: "How the system is built, tested, and shipped" },
  { href: "/docs/get-started", label: "Get started", description: "Install the package and theme it" },
  { href: "/blueprints/claude", label: "Claude MD", description: "The agent instructions behind this repo" },
  { href: "/blueprints/design", label: "Design MD", description: "The design spec behind the system" },
  { href: "/blueprints/content-design", label: "Content MD", description: "The style guide behind the words" },
  { href: "/skills", label: "Skills", description: "The agent skills that maintain the site" },
  { href: "/loops", label: "Loops", description: "The recurring loops that keep it current" },
  { href: "/releases", label: "Release log", description: "One entry per npm release" },
];

/**
 * Sidebar for the Templates section — complete screens built from the
 * library's components and tokens alone. Curated order: strongest first.
 */
export const templatesSidebarLinks: NavLink[] = [
  { href: "/templates", label: "Contents" },
  {
    href: "/templates/marketing-dashboard",
    label: "Marketing dashboard",
    description: "An analytics app shell built from the system alone",
  },
  {
    href: "/templates/relay-console",
    label: "Relay console",
    description: "A network operations screen flipping between globe and map",
  },
  {
    href: "/templates/team-calendar",
    label: "Team calendar",
    description: "A month view with the sprint's to-dos on a rail beside it",
  },
  {
    href: "/templates/agent-workbench",
    label: "Agent workbench",
    description: "A coding agent mid-task, its session beside the staged diff",
  },
  {
    href: "/templates/roadmap-planner",
    label: "Roadmap planner",
    description: "A planning tool around the Gantt timeline and its detail rail",
  },
  {
    href: "/templates/sales-pipeline",
    label: "Sales pipeline",
    description: "A CRM companies view built around the wired data table",
  },
  {
    href: "/templates/payroll-console",
    label: "Payroll console",
    description: "A pay run beside a docked assistant whose agent panel opens in place",
  },
  {
    href: "/templates/sign-in",
    label: "Sign in",
    description: "A product front door: the providers beside an ambient panel",
  },
];

/* ============================================
   HELPERS
   ============================================ */

/**
 * Returns sidebar links with the matching href marked active.
 */
export function getSidebarLinks(links: NavLink[], activeHref: string) {
  const sidebarLinks = links.map((link) => ({
    ...link,
    active: link.href === activeHref ? true : undefined,
  }));

  return { sidebarLinks };
}

/**
 * Every sidebar array, in one place, so a page's canonical name can be looked
 * up from its href. This is the single source of truth for page titles — the
 * nav label, the breadcrumb, and the browser-tab title all resolve from here.
 */
const allSidebarLinks: NavLink[] = [
  ...componentsSidebarLinks,
  ...foundationsSidebarLinks,
  ...docsSidebarLinks,
  ...templatesSidebarLinks,
];

/** The canonical label for a route, taken from the nav config (or undefined). */
export function getNavLabel(href: string): string | undefined {
  return allSidebarLinks.find((link) => link.href === href)?.label;
}

/** The brand suffix appended to every page's browser-tab title. */
export { TITLE_SUFFIX } from "./brand.generated";
import { TITLE_SUFFIX } from "./brand.generated";
/** Next.js title template — applied to child route segments' titles. */
export const TITLE_TEMPLATE = `%s · ${TITLE_SUFFIX}`;

/**
 * Sections whose layout segment ships its own `opengraph-image.tsx`. Sub-pages
 * of these sections use the section's card, not the root one — a segment that
 * declares `openGraph` replaces the inherited block wholesale (images
 * included), so the nearest ancestor card has to be re-stated per page rather
 * than inherited. Checked against the filesystem by
 * scripts/validate-website-surfaces.mjs, so an added or removed section image
 * can't leave this list stale.
 */
export const SECTION_OG_IMAGE_SEGMENTS = ["/components", "/foundations"];

/** The og:image for a page: its section's own card when one exists, else the root card. */
function ogImageForPath(path?: string): string {
  const section = SECTION_OG_IMAGE_SEGMENTS.find((s) => path?.startsWith(`${s}/`));
  return `${section ?? ""}/opengraph-image`;
}

/**
 * Open Graph block for one page, so shares and link unfurls carry the page's
 * own title and description. Without this, every page inherits the root
 * layout's `openGraph` wholesale (Next merges metadata per top-level key, not
 * per nested field) and unfurls as the homepage. The bare title is deliberate:
 * `og:site_name` carries the brand, so unfurlers don't render the suffix twice.
 * `path` is resolved against `metadataBase`; omit it on section layouts, where
 * an inherited `og:url` would mislabel every sub-page (same reasoning as the
 * canonical rule on `sectionMetadata`).
 */
export function pageOpenGraph(
  title: string,
  description?: string,
  path?: string,
  type: "website" | "article" = "website"
): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    ...(description ? { description } : {}),
    ...(path ? { url: path } : {}),
    siteName: TITLE_SUFFIX,
    locale: "en_US",
    type,
    // Branded card fallback — without this, pages that declare `openGraph`
    // would render no og:image at all (see SECTION_OG_IMAGE_SEGMENTS). A
    // file-convention image in the page's own segment (a case study's
    // opengraph-image.tsx) still outranks this field.
    images: ogImageForPath(path),
  };
}

/**
 * Metadata for a section landing layout (Components, Foundations, Work). Sets
 * the section's own suffixed title AND re-declares the title template so the
 * suffix cascades to the section's sub-pages — Next only applies a template to
 * direct children, so intermediate layouts must carry it or grandchildren would
 * render bare, unsuffixed titles.
 *
 * Deliberately sets NO canonical: this layout wraps the section's sub-pages, and
 * `alternates` inherits, so a canonical here would make every sub-page that
 * doesn't override it self-canonicalise to the section landing. The landing (and
 * any sub-page without its own canonical) self-canonicalises to its own URL by
 * default; leaf pages set explicit canonicals via `pageMetadata` or directly.
 */
export function sectionMetadata(label: string, description?: string): Metadata {
  // `default` is the bare label — the root layout's template adds the suffix to
  // it once. `template` carries the suffix down to this section's sub-pages.
  const title = { default: label, template: TITLE_TEMPLATE };
  // No `url` in the Open Graph block — see pageOpenGraph. Sub-pages override
  // the whole block via pageMetadata, so this only renders on the landing.
  const openGraph = pageOpenGraph(label, description);
  return description ? { title, description, openGraph } : { title, openGraph };
}

/**
 * Builds a page's Next.js `Metadata` with its `title` derived from the nav
 * label for `href`, so the browser-tab title can never drift from the sidebar
 * label or breadcrumb. Pass a `description` to keep the page's bespoke SEO copy.
 * Self-canonicalizes to `href` (resolved against `metadataBase`) so the page
 * owns its own canonical instead of inheriting one from a parent layout.
 * Throws at build time if `href` has no nav label — that surfaces a page whose
 * title source is missing rather than silently falling back to the site default.
 */
export function pageMetadata(href: string, description?: string): Metadata {
  const title = getNavLabel(href);
  if (!title) {
    throw new Error(
      `pageMetadata: no nav label found for "${href}". Add it to a sidebar links array in navigation.ts.`
    );
  }
  const alternates = { canonical: href };
  const openGraph = pageOpenGraph(title, description, href);
  return description
    ? { title, description, alternates, openGraph }
    : { title, alternates, openGraph };
}

/**
 * Metadata for a component showcase page, resolved entirely from the registry.
 *
 * Replaces hand-writing the same one-line description in both registry.json and
 * the page's layout.tsx — the registry is the only place it lives now.
 */
export function componentPageMetadata(slug: string): Metadata {
  const meta = componentMetadata.find((c) => c.slug === slug);
  if (!meta) {
    throw new Error(
      `componentPageMetadata: no component registered with slug "${slug}". ` +
        `Add it to src/components/registry.json.`
    );
  }
  return pageMetadata(`/components/${slug}`, meta.description);
}

/* ============================================
   BREADCRUMBS
   Builds a trail based on pathname, walking the
   IA: <Section> > <Page>. Sections are top-level
   now, so a landing page needs no breadcrumb and
   a sub-page's trail is two items.
   ============================================ */

interface SectionConfig {
  base: string;
  label: string;
  sidebar: NavLink[] | null;
}

const breadcrumbSections: SectionConfig[] = [
  // Docs cluster pages are handled directly in getBreadcrumbs (driven by
  // docsSidebarLinks) since their URLs don't share a /docs prefix.
  { base: "/foundations", label: "Foundations", sidebar: foundationsSidebarLinks },
  { base: "/components", label: "Components", sidebar: componentsSidebarLinks },
  { base: "/templates", label: "Templates", sidebar: templatesSidebarLinks },
];

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Strip trailing slash (but keep "/")
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

  // Top-level pages carry no breadcrumb — the home page IS the landing.
  if (path === "/" || path === "/docs") {
    return [];
  }

  // The playground and graph are immersive surfaces: their slim StageToolbar
  // renders this trail (they live in no sidebar array, so the generic
  // section loop can't resolve them).
  if (path === "/playground") {
    return [{ label: "Playground" }];
  }
  if (path === "/graph") {
    return [{ label: "System graph" }];
  }

  // Docs cluster — the landing lives at /docs but sub-pages keep their
  // original URLs, so match against the sidebar links (no shared prefix).
  const docsLink = docsSidebarLinks.find((l) => l.href === path && l.href !== "/docs");
  if (docsLink) {
    return [{ label: "Docs", href: "/docs" }, { label: docsLink.label }];
  }

  for (const section of breadcrumbSections) {
    // Section landing (e.g. /components) — top-level, no trail.
    if (path === section.base) {
      return [];
    }

    // Sub-page within a section (e.g. /components/button)
    if (path.startsWith(section.base + "/")) {
      const subLink = section.sidebar?.find((l) => l.href === path);
      const subLabel = subLink?.label ?? slugToTitle(path.slice(section.base.length + 1));
      return [{ label: section.label, href: section.base }, { label: subLabel }];
    }
  }

  return [];
}
