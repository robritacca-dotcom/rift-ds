import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
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
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Where layouts switch, and what they are built from</p>
            <p className={styles.introBody}>
              Breakpoints are the widths a layout changes at. The page shell is the frame every doc page sits in: a navigation rail, the content column and a details rail. Both are measured in values with one home each, so a page never invents its own.
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
