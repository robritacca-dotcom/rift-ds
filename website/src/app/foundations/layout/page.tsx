import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import PageLinks from "@/components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Table } from "rift-ds/components/Table/Table";
import {
  BREAKPOINTS,
  BREAKPOINT_MID_PX,
  BREAKPOINT_TABLET_PX,
  mediaFor,
} from "rift-ds/tokens/breakpoints";
import { SITE_BREAKPOINTS } from "@/config/breakpoints";
import { LAYOUT_PROPERTIES } from "@/config/layout-properties";
import { readLayers, readLayoutProperties, type LayoutValue } from "@/lib/layout-source";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/layout");

/* ============================================
   BREAKPOINT DATA
   Read from the two breakpoint modules, never typed here: the validator
   holds each module's list to its constants, so a new step appears on
   this page by existing. Widths ascend; the height step closes the list.
   ============================================ */

/* The ruler every bar is drawn against: wide enough for the widest step
   to sit inside it with room to show the side above it. */
const RULER_PX = 1600;

const breakpoints = [
  ...BREAKPOINTS.map((b) => ({ ...b, scope: "Library" as const })),
  ...SITE_BREAKPOINTS.map((b) => ({ ...b, scope: "Site" as const })),
].sort((a, b) => (a.axis === b.axis ? a.px - b.px : a.axis === "width" ? -1 : 1));

/* ============================================
   LAYOUT PROPERTY DATA
   Values come out of globals.css at build time (lib/layout-source); the
   descriptions from config/layout-properties, which the build holds to
   the stylesheet in both directions.
   ============================================ */

/** "291px" → 291, for drawing; a value that is not a plain px length draws nothing. */
const px = (v: LayoutValue | null | undefined) => {
  const m = v?.resolved?.match(/^([\d.]+)px$/);
  return m ? Number(m[1]) : null;
};

/** The value as a reader wants it: the length, with the token it comes from when there is one. */
const shown = (v: LayoutValue) => {
  const token = v.declared.match(/^var\((--[\w-]+)\)$/)?.[1];
  return v.resolved && token ? `${v.resolved} (${token})` : v.resolved ?? v.declared;
};

/** A stylesheet comment ("the chat button") as a sentence ("The chat button."). */
const sentence = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}${/[.!?]$/.test(s) ? "" : "."}`;

/* ============================================
   APP SHELL DATA
   The three app shell modes, as the shell recipe in the package
   (src/behaviors/shell.css) defines them; design.md's "App shells"
   section is the spec these sentences summarise.
   ============================================ */

const appShells = [
  {
    id: "flush",
    title: "Flush",
    plane: "The shell colour",
    rail: "Edge to edge on the shell colour, a hairline divider at its end",
    content: "Crisp on the app surface, beside the divider",
    edge: "Nothing raised, no gap",
    lever: "For a chat only, the backdrop: blur (the glass and a strong blur over what lies behind) or solid",
  },
  {
    id: "floating",
    title: "Floating",
    plane: "The page colour",
    rail: "A glass card held off the edges by the float gap",
    content: "On the page, centred beside the card",
    edge: "Raised: the hairline and the floating shadow on the card",
    lever: "None",
  },
  {
    id: "inset",
    title: "Inset",
    plane: "The shell colour",
    rail: "Edge to edge on the shell colour",
    content: "A raised surface held off the other edges by the inset gap, scrolling inside itself",
    edge: "Raised: the hairline and the floating shadow on the surface",
    lever: "None",
  },
] as const;

const appShellHosts = [
  { id: "app-layout", host: "AppLayout", how: "layout: a rail and a content area in any mode" },
  { id: "app-sidebar", host: "AppSidebar", how: "layout: the rail's own treatment, read from the host's mode" },
  { id: "chat-widget", host: "ChatWidget", how: "layout and backdrop: the chat as the page, its history rail and trailing panels in the mode, and in flush blur or solid" },
  { id: "chat-launcher", host: "ChatLauncher", how: "surface=\"inset\": the docked chat as the inset surface's twin beside it" },
  { id: "block", host: "The app shell block", how: "SHELL_LAYOUT at the top of the file npx rift-ds init block writes" },
] as const;

/* ============================================
   PAGE WIDTH DATA
   The width axis of the shell recipe (src/behaviors/shell.css): how wide
   a page's content runs, set apart from the shell mode. design.md's "App
   shells" section is the spec.
   ============================================ */

const pageWidths = [
  {
    id: "contained",
    title: "Contained",
    note: "The content centred at the contained width, the room either side left to the plane",
  },
  {
    id: "full",
    title: "Full",
    note: "The content runs the whole width the mode leaves it, the side gutter aside",
  },
] as const;

const widthProperties = [
  {
    id: "contained-width",
    name: "--ds-shell-contained-width",
    value: "1440px",
    role: "The contained width. A host or a page sets its own on any element down to the column: AppLayout takes 1120px for an app's working column, a template its own on its content class.",
  },
  {
    id: "content-max",
    name: "--ds-shell-content-max",
    value: "none when full",
    role: "The column's maximum: none on a full page, unset on a contained one, so the column falls back to the contained width.",
  },
  {
    id: "gutter",
    name: "--ds-shell-gutter",
    value: "20px, 16px at 768px and below",
    role: "The side gutter every width keeps, so a full page never touches the window's edge.",
  },
] as const;

const widthHosts = [
  { id: "app-layout", host: "AppLayout", how: "width: contained (1120px) or full, in flush, floating or inset" },
  { id: "site-layout", host: "SiteLayout", how: "width: the header, the columns and the footer's row, contained (1440px) or full" },
  { id: "site-header", host: "SiteHeader", how: "width: the bar's contents contained or edge to edge, with the gutter; unset, it fills its host with none" },
  { id: "templates", host: "The templates", how: "The width switch beside the mode switch in the rail's footer, kept for every template" },
  { id: "app-block", host: "The app shell block", how: "CONTENT_WIDTH beside SHELL_LAYOUT at the top of the file" },
  { id: "docs-block", host: "The docs block", how: "PAGE_WIDTH and HEADER_WIDTH at the top of the file" },
] as const;

/* ============================================
   SITE SHELL DATA
   SiteLayout's frame: a header over a sidebar, the content and an aside,
   laid out by the header's width, the page's width and where the sidebar
   docks, each set apart.
   ============================================ */

const siteShells = [
  {
    id: "contained-content",
    header: "contained",
    dock: "content",
    title: "Contained, docked to the content",
    note: "Header, sidebar, content and aside centre together at the contained width",
  },
  {
    id: "full-content",
    header: "full",
    dock: "content",
    title: "Full header, docked to the content",
    note: "The bar runs edge to edge; the three columns stay centred below it",
  },
  {
    id: "full-edge",
    header: "full",
    dock: "edge",
    title: "Full header, docked to the edge",
    note: "The sidebar holds the window's start edge behind a hairline; the content is contained in the room after it",
  },
] as const;

const siteLevers = [
  { id: "header", lever: "Header width", prop: "SiteHeader width", values: "contained, full, or unset (fills its host)" },
  { id: "page", lever: "Page width", prop: "SiteLayout width", values: "contained or full" },
  { id: "dock", lever: "Sidebar dock", prop: "SiteLayout sidebarDock", values: "content (the row's first column) or edge (the window's start edge)" },
] as const;

/* ============================================
   PAGE
   ============================================ */

export default function LayoutPage() {
  const values = readLayoutProperties();
  const get = (name: string) => {
    const v = values.get(name);
    if (!v) throw new Error(`/foundations/layout: globals.css declares no ${name}`);
    return v;
  };

  const sidebar = get("--layout-sidebar-width");
  const gap = get("--layout-column-gap");
  const rail = get("--layout-rail-width");

  /* The two states the shell takes: full width, drawn against a 1440px
     viewport, and the mid step, drawn at the mid breakpoint's own width. */
  const shells = [
    {
      title: `Wider than ${BREAKPOINT_MID_PX}px`,
      reference: 1440,
      sidebar: sidebar.base,
      gap: gap.base,
      rail: rail.base,
    },
    {
      title: `Mid, ${BREAKPOINT_TABLET_PX + 1} to ${BREAKPOINT_MID_PX}px`,
      reference: BREAKPOINT_MID_PX,
      sidebar: sidebar.mid ?? sidebar.base,
      gap: gap.mid ?? gap.base,
      rail: rail.mid ?? rail.base,
    },
  ];

  /* Layers share a slab width when they share a value: the slab is the
     layer's rank in the stack, not its number, since the numbers jump
     from tens to thousands. */
  const layers = readLayers();
  const ranks = [...new Set(layers.map((l) => l.value))];
  const rankOf = new Map(ranks.map((v, i) => [v, i]));

  const tableRows = LAYOUT_PROPERTIES.filter((p) => !p.shell).map((p) => ({
    id: p.name,
    cells: {
      name: <code className={styles.query}>{p.name}</code>,
      value: <code className={styles.value}>{shown(get(p.name).base)}</code>,
      role: p.role,
    },
  }));

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Layout</h1>
            {/* No Storybook story to point at; the link row carries the token files. */}
            <PageLinks />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Where layouts switch, and what they are built from</p>
            <p className={styles.introBody}>
              Breakpoints are the widths a layout changes at. The page shell is the frame every doc page sits in: a navigation rail, the content column and a details rail. The app shells are the three ways an app built from the package meets the page. All are measured in values with one home each, so a page never invents its own.
            </p>
          </div>

          <section className={`${styles.group} animate-in animate-delay-2`}>
            <SectionTitle title="Breakpoints" />
            <p className={styles.groupNote}>
              The library’s steps ship in rift-ds/tokens/breakpoints, where JavaScript builds its media queries from them; the site’s own steps belong to its templates and stages. A stylesheet can’t read a variable inside a media query, so CSS writes the number, and the build fails on any width outside the set unless the rule says why it breaks somewhere else. Each bar below is the viewport’s width (its height, for a height step), from nothing to {RULER_PX}px, and the filled part is where the step’s rules apply.
            </p>
            <ul className={styles.breakpointList}>
              {breakpoints.map((b) => {
                const pct = (b.px / RULER_PX) * 100;
                return (
                  <li key={`${b.scope}-${b.label}`} className={styles.breakpoint}>
                    <div className={styles.breakpointHead}>
                      <span className={styles.breakpointName}>{b.label}</span>
                      <code className={styles.query}>{mediaFor(b)}</code>
                      <Badge variant="neutral" label={b.scope} />
                    </div>
                    <div
                      className={`${styles.track} ${b.side === "above" ? styles.trackAbove : ""}`}
                      style={{ "--bp-pct": `${pct}%` } as React.CSSProperties}
                      aria-hidden="true"
                    >
                      <span className={styles.fill} />
                      <span className={styles.edge} />
                    </div>
                    <p className={styles.breakpointRole}>{b.role}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.group}>
            <SectionTitle title="Page shell" />
            <p className={styles.groupNote}>
              The site’s doc pages share one frame, sized by three custom properties in its global stylesheet. At the mid step both rails narrow and the gap tightens, so the content column keeps a readable measure; at the tablet step the navigation rail moves into the header drawer. These belong to the site, not the package.
            </p>
            <div className={styles.shells}>
              {shells.map((s) => {
                const pct = (v: LayoutValue) => `${((px(v) ?? 0) / s.reference) * 100}%`;
                return (
                  <figure key={s.title} className={styles.shell}>
                    <div
                      className={styles.shellFrame}
                      style={
                        {
                          "--shell-sidebar": pct(s.sidebar),
                          "--shell-gap": pct(s.gap),
                          "--shell-rail": pct(s.rail),
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    >
                      <span className={`${styles.shellColumn} ${styles.shellSidebar}`}>Navigation</span>
                      <span className={`${styles.shellColumn} ${styles.shellContent}`}>Content</span>
                      <span className={`${styles.shellColumn} ${styles.shellRail}`}>Details</span>
                    </div>
                    <figcaption className={styles.shellCaption}>
                      <span className={styles.shellTitle}>{s.title}</span>
                      <span>
                        <code className={styles.query}>--layout-sidebar-width</code> {shown(s.sidebar)}
                      </span>
                      <span>
                        <code className={styles.query}>--layout-column-gap</code> {shown(s.gap)}
                      </span>
                      <span>
                        <code className={styles.query}>--layout-rail-width</code> {shown(s.rail)}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </section>

          <section className={styles.group}>
            <SectionTitle title="App shells" />
            <p className={styles.groupNote}>
              An app built from the package lays out in one of three shell modes: how the navigation rail and the content meet the page. The templates, the chat home and AppLayout all draw the same three from one recipe in the package, so a mode looks the same wherever it is used. The edge belongs to the mode, never a choice of its own: floating and inset are raised, flush never is. A chat in flush takes one lever more, the backdrop: blur says it rests above something, as the site chat rests over a page, and solid that it is its own page. An app layout or a template is always the floor, so it has no backdrop. The templates open inset; a chat that is the page opens flush with the blur backdrop. How wide the content runs is not the mode&apos;s to decide: Page width, below, is its own axis.
            </p>
            <div className={styles.appShells}>
              {appShells.map((shell) => (
                <figure key={shell.id} className={styles.shell}>
                  <div className={styles.appShellFrame} data-mode={shell.id} aria-hidden="true">
                    <span className={styles.appShellRail} />
                    <span className={styles.appShellContent} />
                  </div>
                  <figcaption className={styles.shellCaption}>
                    <span className={styles.shellTitle}>{shell.title}</span>
                    <span>{shell.edge}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <Table
              columns={[
                { key: "mode", header: "Mode" },
                { key: "plane", header: "Plane" },
                { key: "rail", header: "Rail" },
                { key: "content", header: "Content" },
                { key: "lever", header: "Lever" },
              ]}
              rows={appShells.map((shell) => ({
                id: shell.id,
                cells: { mode: shell.title, plane: shell.plane, rail: shell.rail, content: shell.content, lever: shell.lever },
              }))}
              bordered
            />
            <p className={styles.groupNote}>
              The rails share one geometry in every mode: the logo, the row icons, the group headings, the footer controls and the avatar sit on one leading line; the collapse toggle sits on one trailing line; a row&apos;s own trailing item, a count or a time, keeps a step more room inside its pill. The two gaps are <code className={styles.query}>--ds-shell-inset</code>, the inset surface&apos;s, and <code className={styles.query}>--ds-sidebar-float-inset</code>, the floating card&apos;s. Below the mobile breakpoint every mode gives way to the plain page, and the rail becomes a drawer. A chat too narrow for its inline rail gives way the same way, flush on the solid backdrop, whatever the screen.
            </p>
            <Table
              columns={[
                { key: "host", header: "Drawn by" },
                { key: "how", header: "How it takes a mode" },
              ]}
              rows={appShellHosts.map((h) => ({ id: h.id, cells: { host: <code className={styles.query}>{h.host}</code>, how: h.how } }))}
              bordered
            />
          </section>

          <section className={styles.group}>
            <SectionTitle title="Page width" />
            <p className={styles.groupNote}>
              How wide a page&apos;s content runs is a second axis, set apart from the shell mode, so any mode takes either width: flush, floating or inset can each be contained or full. Contained centres the content at the contained width and leaves the room either side to the plane; full runs it the whole width the mode leaves it. Every width keeps the side gutter, so content never touches the window&apos;s edge. The shell recipe declares the axis once, and every host that lays out a page reads it, the site&apos;s own header and layout included.
            </p>
            <div className={styles.appShells}>
              {pageWidths.map((width) => (
                <figure key={width.id} className={styles.shell}>
                  <div className={styles.appShellFrame} data-mode="floating" aria-hidden="true">
                    <span className={styles.appShellRail} />
                    <span className={styles.widthStage}>
                      <span className={styles.widthColumn} data-width={width.id} />
                    </span>
                  </div>
                  <figcaption className={styles.shellCaption}>
                    <span className={styles.shellTitle}>{width.title}</span>
                    <span>{width.note}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <Table
              columns={[
                { key: "name", header: "Property" },
                { key: "value", header: "Value" },
                { key: "role", header: "Role" },
              ]}
              rows={widthProperties.map((p) => ({
                id: p.id,
                cells: {
                  name: <code className={styles.query}>{p.name}</code>,
                  value: <code className={styles.value}>{p.value}</code>,
                  role: p.role,
                },
              }))}
              bordered
            />
            <p className={styles.groupNote}>
              A host&apos;s column reads the maximum with the contained width as its fallback and centres itself, so a page can set its own contained width anywhere above its column. Where the column is also the inset surface&apos;s scroller, a contained page centres by its padding instead, so the scrollbar stays at the surface&apos;s edge.
            </p>
            <Table
              columns={[
                { key: "host", header: "Set by" },
                { key: "how", header: "How it takes a width" },
              ]}
              rows={widthHosts.map((h) => ({ id: h.id, cells: { host: <code className={styles.query}>{h.host}</code>, how: h.how } }))}
              bordered
            />
          </section>

          <section className={styles.group}>
            <SectionTitle title="Site shells" />
            <p className={styles.groupNote}>
              A site of pages, documentation or marketing, lays out under a top header rather than beside an app&apos;s rail. SiteLayout is its frame: a SiteHeader over a navigation sidebar, the content and an on-this-page aside, then a SiteFooter. Three levers set it, each apart from the others: how wide the header bar runs, how wide the page runs, and where the sidebar docks. A site is the floor of its page, so it takes none of the app shell modes and no surface of its own.
            </p>
            <div className={styles.appShells}>
              {siteShells.map((site) => (
                <figure key={site.id} className={styles.shell}>
                  <div className={styles.siteFrame} data-header={site.header} data-dock={site.dock} aria-hidden="true">
                    <span className={styles.siteHeader}>
                      <span className={styles.siteHeaderBar} />
                    </span>
                    <span className={styles.siteBody}>
                      {site.dock === "edge" && <span className={styles.siteSidebar} />}
                      <span className={styles.siteRow}>
                        {site.dock === "content" && <span className={styles.siteSidebar} />}
                        <span className={styles.siteContent} />
                        <span className={styles.siteAside} />
                      </span>
                    </span>
                  </div>
                  <figcaption className={styles.shellCaption}>
                    <span className={styles.shellTitle}>{site.title}</span>
                    <span>{site.note}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <Table
              columns={[
                { key: "lever", header: "Lever" },
                { key: "prop", header: "Set with" },
                { key: "values", header: "Values" },
              ]}
              rows={siteLevers.map((l) => ({
                id: l.id,
                cells: { lever: l.lever, prop: <code className={styles.query}>{l.prop}</code>, values: l.values },
              }))}
              bordered
            />
            <p className={styles.groupNote}>
              The sidebar sticks below the header and scrolls on its own, so a long list of pages never carries the page along; the aside sticks beside the content. Below 1152px the aside gives way, and below 960px the sidebar folds into a drawer behind a menu button. The docs block, <code className={styles.query}>npx rift-ds init block docs</code>, is SiteLayout with a full header over a sidebar docked to the edge.
            </p>
          </section>

          <section className={styles.group}>
            <SectionTitle title="Stacking" />
            <p className={styles.groupNote}>
              The order surfaces rise in when they leave their component: a menu over the page, a dialog over the menu, a toast over the dialog. The library’s layers are tokens anyone using the package can read; the site adds its own above them. Ordering inside a single component stays a small local number. Highest first.
            </p>
            <ol className={styles.layerList}>
              {[...layers].reverse().map((l) => (
                <li
                  key={l.name}
                  className={styles.layer}
                  style={{ "--stack-rank": `${((rankOf.get(l.value) ?? 0) + 1) / ranks.length}` } as React.CSSProperties}
                >
                  <span className={styles.layerValue}>{l.value}</span>
                  <span className={styles.layerSlab} aria-hidden="true" />
                  <span className={styles.layerText}>
                    <code className={styles.query}>{l.name}</code>
                    <span className={styles.layerRole}>{sentence(l.role)}</span>
                  </span>
                  <Badge variant="neutral" label={l.scope} />
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.group}>
            <SectionTitle title="Other layout properties" />
            <p className={styles.groupNote}>
              The rest of the shell’s measurements: clearances, heights and the chat panel’s seat. Values are as the stylesheet declares them.
            </p>
            <Table
              columns={[
                { key: "name", header: "Property" },
                { key: "value", header: "Value" },
                { key: "role", header: "What it sizes" },
              ]}
              rows={tableRows}
              bordered
            />
          </section>
        </main>
      </div>
    </>
  );
}
