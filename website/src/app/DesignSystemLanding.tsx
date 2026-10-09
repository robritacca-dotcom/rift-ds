"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import MegaNav from "../components/MegaNav/MegaNav";
import { ExtendedBackground } from "../components/BlurBackground/BlurBackground";
import FadeDivider from "../components/FadeDivider/FadeDivider";
import styles from "./page.module.css";
import { FIGMA_FILE_URL, NPM_URL, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";
import { THEME_SELECTOR_ORDER, themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, BASE_THEME_ID, SERVED_THEME_ID } from "@/lib/theme/brand";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { AgentPlan } from "rift-ds/components/AgentPlan/AgentPlan";
import { AnimatedNumber } from "rift-ds/components/AnimatedNumber/AnimatedNumber";
import { AgentStatus } from "rift-ds/components/AgentStatus/AgentStatus";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { ChatHeader } from "rift-ds/components/ChatHeader/ChatHeader";
import { ChatMarker } from "rift-ds/components/ChatMarker/ChatMarker";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { ChatThread } from "rift-ds/components/ChatThread/ChatThread";
import { Composer } from "rift-ds/components/Composer/Composer";
import { AttachmentTile } from "rift-ds/components/Attachment/AttachmentTile";
import { InterruptCard } from "rift-ds/components/InterruptCard/InterruptCard";
import { MessageActions } from "rift-ds/components/MessageActions/MessageActions";
import { MessageCard } from "rift-ds/components/MessageCard/MessageCard";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Prose } from "rift-ds/components/Prose/Prose";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { SourceChip } from "rift-ds/components/SourceChip/SourceChip";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { ButtonGroup } from "rift-ds/components/ButtonGroup/ButtonGroup";
import {
  FigmaIcon,
  GitHubIcon,
  NpmIcon,
  StorybookIcon,
} from "../components/BrandIcons/BrandIcons";
import { Card } from "rift-ds/components/Card/Card";
import { CardStack } from "rift-ds/components/CardStack/CardStack";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import {
  ContributionGraph,
  type ContributionDay,
} from "rift-ds/components/ContributionGraph/ContributionGraph";
import { DateInput } from "rift-ds/components/DateInput/DateInput";
import { DatePicker } from "rift-ds/components/DatePicker/DatePicker";
import { Dropdown } from "rift-ds/components/Dropdown/Dropdown";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import {
  EventCalendar,
  type EventCalendarEvent,
} from "rift-ds/components/EventCalendar/EventCalendar";
import {
  GanttChart,
  type GanttChartItem,
  type GanttChartMilestone,
} from "rift-ds/components/GanttChart/GanttChart";
import {
  Globe,
  type GlobeArc,
  type GlobePoint,
} from "rift-ds/components/Globe/Globe";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { MapCallout } from "rift-ds/components/MapCallout/MapCallout";
import { MapLegend } from "rift-ds/components/MapLegend/MapLegend";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { SelectionCard } from "rift-ds/components/SelectionCard/SelectionCard";
import { Skeleton } from "rift-ds/components/Skeleton/Skeleton";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Table } from "rift-ds/components/Table/Table";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { Timeline } from "rift-ds/components/Timeline/Timeline";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import {
  WorldMap,
  type WorldMapPoint,
} from "rift-ds/components/WorldMap/WorldMap";
import { COMPONENT_COUNT } from "rift-ds/components/registry";
import { TOKEN_COUNT } from "rift-ds/tokens/registry";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { AreaChart, BarChart, PieChart } from "rift-ds/charts";

/* ---------- fixed demo data (all mock — a small finance product) ---------- */

const REVENUE_DATA = [
  { label: "Jan", value: 182 },
  { label: "Feb", value: 210 },
  { label: "Mar", value: 168 },
  { label: "Apr", value: 254 },
  { label: "May", value: 291 },
  { label: "Jun", value: 262 },
  { label: "Jul", value: 318 },
];

const PORTFOLIO_DATA = [
  { month: "Feb", value: 84.2, benchmark: 82.0 },
  { month: "Mar", value: 81.9, benchmark: 82.8 },
  { month: "Apr", value: 88.4, benchmark: 84.1 },
  { month: "May", value: 92.7, benchmark: 85.9 },
  { month: "Jun", value: 91.3, benchmark: 87.2 },
  { month: "Jul", value: 97.8, benchmark: 88.6 },
];

const HOLDINGS_COLUMNS = [
  { key: "ticker", header: "Ticker" },
  { key: "shares", header: "Shares", align: "right" as const },
  { key: "value", header: "Value", align: "right" as const },
];

const HOLDINGS_ROWS = [
  { id: "vgro", cells: { ticker: "VGRO", shares: "412", value: "$14,830" } },
  { id: "xeqt", cells: { ticker: "XEQT", shares: "260", value: "$9,215" } },
  { id: "zag", cells: { ticker: "ZAG", shares: "705", value: "$8,904" } },
];

const CURRENCY_OPTIONS = [
  { label: "USD — US dollar", value: "usd" },
  { label: "EUR — euro", value: "eur" },
  { label: "GBP — pound sterling", value: "gbp" },
];

const RANGE_SEGMENTS = [
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
];

const STATEMENT_TABS = [
  { value: "statements", label: "Statements" },
  { value: "invoices", label: "Invoices" },
  { value: "tax", label: "Tax" },
];

const STATEMENTS = [
  { month: "June 2026", meta: "PDF · 84 KB" },
  { month: "May 2026", meta: "PDF · 87 KB" },
  { month: "April 2026", meta: "PDF · 80 KB" },
];

const INVOICES = [
  { id: "#3461", client: "Acme Ltd", amount: "$12,400.00", status: "Paid", variant: "positive" },
  { id: "#3462", client: "Northwind", amount: "$8,150.00", status: "Pending", variant: "info" },
  { id: "#3458", client: "Globex", amount: "$21,090.00", status: "Overdue", variant: "error" },
  { id: "#3464", client: "Initech", amount: "$3,600.00", status: "Draft", variant: "neutral" },
] as const;

const ACTIVITY = [
  { name: "Danilo Sousa", action: "Approved invoice #3461", when: "9:41 am" },
  { name: "Zahra Ambessa", action: "Updated client details for Acme Ltd", when: "8:20 am" },
  { name: "Jasper Eriksson", action: "Created 4 invoices", when: "Yesterday" },
];

/* The stack behind the system, named without versions: the README's Tech
   section owns the version claims, and the build holds those to
   package.json — a second surface restating numbers would just be a
   second place for them to rot. */
const TECH_STACK = ["React", "TypeScript", "Vite", "Next.js", "Storybook", "Recharts"];

const SAVINGS_GOALS = [
  { label: "Retirement", target: "$420,000 target", value: 72 },
  { label: "House deposit", target: "$85,000 target", value: 38 },
];

/* Spending mix for the donut card — sums to a plausible month */
const SPENDING_DATA = [
  { name: "Housing", value: 2150 },
  { name: "Groceries", value: 640 },
  { name: "Transport", value: 310 },
  { name: "Dining", value: 280 },
  { name: "Subscriptions", value: 120 },
];

const AGENT_MODELS = [
  { label: "Fable 5", value: "fable-5", description: "Deepest reasoning for planning questions" },
  { label: "Sonnet 5", value: "sonnet-5", description: "Fast answers for everyday lookups" },
];

const PROMPT_IDEAS = [
  { id: "dining", label: "Dining spend this month", icon: "restaurant" },
  { id: "runway", label: "How long will my runway last?", icon: "timeline" },
  { id: "duplicates", label: "Find duplicate subscriptions", icon: "content_copy" },
];

const RECONCILE_STEPS = [
  { label: "Pull the July statements", status: "completed" as const },
  { label: "Match invoices to deposits", status: "active" as const, detail: "31 of 34 matched" },
  { label: "Flag the rest for review", status: "pending" as const },
];

const ANSWER_ACTIONS = [
  { id: "copy", icon: "content_copy", label: "Copy" },
  { id: "retry", icon: "refresh", label: "Retry" },
  { id: "thumb-up", icon: "thumb_up", label: "Good answer" },
];

const SCHEDULE_OPTIONS = [
  { value: "weekly", label: "Weekly", description: "Every Friday, balances over $10" },
  { value: "monthly", label: "Monthly", description: "On the 15th of each month" },
];

/* Client cities for the globe card — one arc per invoice, traced home to
   the head office. Amounts match the invoice list card. */
const PAYMENT_ROUTES = [
  { id: "london", lat: 51.5, lng: -0.12, label: "LDN", client: "Acme Ltd", amount: "$12,400.00" },
  { id: "singapore", lat: 1.35, lng: 103.82, label: "SIN", client: "Northwind", amount: "$8,150.00" },
  { id: "sao-paulo", lat: -23.55, lng: -46.63, label: "GRU", client: "Globex", amount: "$21,090.00" },
  { id: "sydney", lat: -33.86, lng: 151.2, label: "SYD", client: "Initech", amount: "$3,600.00" },
];

const GLOBE_POINTS: GlobePoint[] = [
  { id: "toronto", lat: 43.65, lng: -79.38, label: "YYZ", kind: "anchor" },
  ...PAYMENT_ROUTES.map(
    (r): GlobePoint => ({ id: r.id, lat: r.lat, lng: r.lng, label: r.label, kind: "point" })
  ),
];

const GLOBE_ARCS: GlobeArc[] = PAYMENT_ROUTES.map((r, i) => ({
  from: r.id,
  to: "toronto",
  altitude: i % 2 ? 0.3 : undefined,
}));

/* July on the money calendar — payroll runs, invoice due dates, and the
   filings. The month is pinned so the grid never depends on the clock. */
const CALENDAR_MONTH = "2026-07";

/* The card renders these as dot-only pills (see calendarFit), so the titles
   serve as the pills' accessible names rather than visible text. */
const CALENDAR_EVENTS: EventCalendarEvent[] = [
  { id: "inv-3461-paid", date: "2026-07-02", title: "Invoice #3461 paid", color: "mint" },
  { id: "payroll-1", date: "2026-07-03", title: "Payroll run", color: "cobalt" },
  { id: "gst", date: "2026-07-08", title: "GST filing", color: "coral" },
  { id: "inv-3462-due", date: "2026-07-14", title: "Invoice #3462 due", color: "amber" },
  { id: "board-review", date: "2026-07-16", title: "Board review", color: "violet" },
  { id: "payroll-2", date: "2026-07-17", title: "Payroll run", color: "cobalt" },
  { id: "inv-3458-due", date: "2026-07-21", title: "Invoice #3458 due", color: "amber" },
  { id: "payout", date: "2026-07-24", title: "Payout to the bank", color: "mint" },
  { id: "payroll-3", date: "2026-07-31", title: "Payroll run", color: "cobalt" },
];

/* The quarter close as a schedule — books to filing, with the today rule
   pinned mid-audit so server and client always draw it in the same place. */
const CLOSE_TODAY = "2026-07-18";

const CLOSE_ITEMS: GanttChartItem[] = [
  { id: "books", label: "Close the books", start: "2026-07-01", end: "2026-07-10", color: "cobalt", progress: 100 },
  { id: "reconcile", label: "Reconciliation", start: "2026-07-06", end: "2026-07-17", color: "mint", progress: 80 },
  { id: "audit", label: "External audit", start: "2026-07-15", end: "2026-08-07", color: "violet", progress: 30 },
  { id: "board", label: "Board sign-off", start: "2026-08-10", end: "2026-08-14", color: "amber", projected: true },
];

const CLOSE_MILESTONES: GanttChartMilestone[] = [
  { id: "filing", label: "Filing deadline", date: "2026-08-31", color: "coral" },
];

/* Payout coverage for the flat map — where the platform can send money,
   colour-coded by how fast a payout settles there. */
const COVERAGE_CITIES = [
  { id: "new-york", lat: 40.71, lng: -74.0, label: "New York", currency: "USD", settles: "Same day", tier: 1 },
  { id: "mexico-city", lat: 19.43, lng: -99.13, label: "Mexico City", currency: "MXN", settles: "1–2 days", tier: 2 },
  { id: "sao-paulo", lat: -23.55, lng: -46.63, label: "São Paulo", currency: "BRL", settles: "1–2 days", tier: 2 },
  { id: "london", lat: 51.5, lng: -0.12, label: "London", currency: "GBP", settles: "Same day", tier: 1 },
  { id: "berlin", lat: 52.52, lng: 13.4, label: "Berlin", currency: "EUR", settles: "Same day", tier: 1 },
  { id: "lagos", lat: 6.52, lng: 3.38, label: "Lagos", currency: "NGN", settles: "3–5 days", tier: 3 },
  { id: "mumbai", lat: 19.08, lng: 72.88, label: "Mumbai", currency: "INR", settles: "1–2 days", tier: 2 },
  { id: "singapore", lat: 1.35, lng: 103.82, label: "Singapore", currency: "SGD", settles: "Same day", tier: 1 },
  { id: "tokyo", lat: 35.68, lng: 139.69, label: "Tokyo", currency: "JPY", settles: "1–2 days", tier: 2 },
  { id: "sydney", lat: -33.86, lng: 151.2, label: "Sydney", currency: "AUD", settles: "1–2 days", tier: 2 },
];

const COVERAGE_POINTS: WorldMapPoint[] = [
  { id: "toronto", lat: 43.65, lng: -79.38, label: "Toronto", kind: "anchor" },
  ...COVERAGE_CITIES.map(
    (c): WorldMapPoint => ({
      id: c.id,
      lat: c.lat,
      lng: c.lng,
      label: c.label,
      color: `var(--color-chart-series-${c.tier})`,
    })
  ),
];

/* Virtual cards for the deck — same team as the activity card. */
const TEAM_CARDS = [
  { name: "Danilo Sousa", number: "•••• 4021", limit: "$2,000 monthly limit" },
  { name: "Zahra Ambessa", number: "•••• 8874", limit: "$1,200 monthly limit" },
  { name: "Jasper Eriksson", number: "•••• 1149", limit: "$500 monthly limit" },
];

// A fixed five months of activity for the contribution graph card — enough
// weeks that the stretch-to-fit cells stay small
const tradingDays: ContributionDay[] = Array.from({ length: 22 * 7 }, (_, i) => {
  const d = new Date(2026, 0, 4 + i);
  const level = ([0, 1, 3, 0, 2, 4, 1, 0, 2, 3, 1, 4, 0, 2][i % 14]) as ContributionDay["level"];
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    count: level * 3,
    level,
  };
});

/* ---------- card shells ---------- */

interface ComponentLink {
  label: string;
  href: string;
}

/** A live demo panel: scenario heading, the working components, and the
    pages they come from in the footer. */
function DemoCard({
  heading,
  sub,
  links,
  children,
}: {
  heading: string;
  sub?: string;
  links: ComponentLink[];
  children: React.ReactNode;
}) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{heading}</h3>
        {sub && <p className={styles.cardSub}>{sub}</p>}
      </header>
      <div className={styles.cardBody}>{children}</div>
      <footer className={styles.cardLinks}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.cardLink}>
            {l.label}
          </Link>
        ))}
      </footer>
    </article>
  );
}

/** A plain content panel: same shell as a demo card, without the footer of
    component links. Sole current use is the Install card. */
function NavCard({
  heading,
  sub,
  children,
}: {
  heading: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{heading}</h3>
        {sub && <p className={styles.cardSub}>{sub}</p>}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </article>
  );
}

/** One escalator column: the cards render twice into a track that translates
    by exactly one copy's height, so the loop is seamless. Exactly one copy is
    live at a time — the other is aria-hidden and inert, keeping the pair out
    of the accessibility tree and tab order as a single column. Which copy is
    live follows the loop: inert also removes a subtree from pointer
    hit-testing, so a statically inert duplicate turns into visible-but-dead
    UI (arrow cursor, no hover, no pause) for the stretch of the cycle where
    it fills the window. A slow poll keeps the copy occupying the window the
    interactive one, and never swaps under a pointer or focus, since flipping
    inert mid-hover would drop the hover and un-pause the track. `render` is
    a function (not children) so a copy can vary anything that must be
    document-unique, like a radio group name. */
function EscalatorColumn({
  direction,
  duration,
  render,
}: {
  direction: "up" | "down";
  duration: string;
  render: (copy: "a" | "b") => React.ReactNode;
}) {
  const colRef = useRef<HTMLDivElement>(null);
  const stackARef = useRef<HTMLDivElement>(null);
  const stackBRef = useRef<HTMLDivElement>(null);
  const [liveCopy, setLiveCopy] = useState<"a" | "b">("a");

  useEffect(() => {
    const col = colRef.current;
    const a = stackARef.current;
    const b = stackBRef.current;
    if (!col || !a || !b) return;
    const visibleHeight = (el: HTMLElement, win: DOMRect) => {
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(r.bottom, win.bottom) - Math.max(r.top, win.top));
    };
    const tick = () => {
      if (col.matches(":hover") || col.matches(":focus-within")) return;
      const win = col.getBoundingClientRect();
      setLiveCopy(visibleHeight(a, win) >= visibleHeight(b, win) ? "a" : "b");
    };
    tick();
    /* The track drifts ~10px/s and the handover zone spans hundreds of px,
       so a 1s poll can't miss it; rAF would be waste. */
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      ref={colRef}
      className={`${styles.col} ${direction === "up" ? styles.colUp : styles.colDown}`}
      style={{ "--escalator-duration": duration } as React.CSSProperties}
    >
      <div className={styles.escalatorTrack}>
        <div
          ref={stackARef}
          className={styles.escalatorStack}
          aria-hidden={liveCopy !== "a" || undefined}
          inert={liveCopy !== "a"}
        >
          {render("a")}
        </div>
        <div
          ref={stackBRef}
          className={`${styles.escalatorStack} ${styles.escalatorDupe}`}
          aria-hidden={liveCopy !== "b" || undefined}
          inert={liveCopy !== "b"}
        >
          {render("b")}
        </div>
      </div>
    </div>
  );
}

/* Below the collage breakpoint the three escalators fold into one. The
   window is CSS (page.module.css owns the 1023px rule and the shorter
   window), but which columns exist is a render decision, so the same
   breakpoint is read here. The server snapshot is the three-column
   layout: the markup hydrates identically everywhere and a narrow
   viewport switches on the client's first paint. */
const NARROW_COLLAGE_QUERY = "(max-width: 1023px)";

function subscribeNarrowCollage(onChange: () => void) {
  const mq = window.matchMedia(NARROW_COLLAGE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useNarrowCollage() {
  return useSyncExternalStore(
    subscribeNarrowCollage,
    () => window.matchMedia(NARROW_COLLAGE_QUERY).matches,
    () => false,
  );
}

/* ---------- page ---------- */

/* The step-07 swatches from the shared theme levers, plus the shipped
   default. Selecting one re-points the action tokens for the whole page —
   the same actionColorPlan the playground applies, on the same :root
   mechanism, so every live demo below re-tints without re-rendering. */
/* ---------- the theme selector ----------
   The hero's tile row is the primary way a visitor picks a theme: one
   tile per shipped look, in THEME_SELECTOR_ORDER, applied by swapping
   the data-brand attribute on <html> — the same one-attribute contract
   the package documents, exercised by the site itself. Each tile is a
   portrait — swatch, name in the theme's own heading face, and the font
   pairing — so the scale of what a pick changes is visible before the
   click. BASE_THEME_ID is the base look (attribute removed, the raw
   token files); the server ships SERVED_THEME_ID, so that is what a
   visitor lands on and its tile wakes up ringed. */

const SSR_BRAND = SERVED_THEME_ID;

function ThemeSwitcher() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(SSR_BRAND);
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");

  /* The attribute is the truth (it survives navigation, and anything may
     have set it before this mount) — read it once the client is up. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(document.documentElement.dataset.brand ?? BASE_THEME_ID);
  }, []);

  /* The tile names render in their themes' own faces, which need no
     loading here: every shipped face has self-hosted @font-face blocks
     in its preset's generated stylesheet, imported site-wide. */
  const pick = (id: string) => {
    applyBrand(id); // the shared helper owns the attribute + persistence
    setActive(id);
  };

  return (
    <div className={styles.accentRow} role="group" aria-label="Theme">
      {tiles.map((tile) => (
        <span key={tile.value} className={styles.swatchWrap}>
          <button
            type="button"
            className={`${styles.accentSwatch} ${active === tile.value ? styles.accentSwatchActive : ""}`}
            style={{ backgroundColor: tile.color }}
            aria-pressed={active === tile.value}
            aria-label={`${tile.label} (${tile.description})`}
            onClick={() => pick(tile.value)}
          />
          {/* The card names the look before the click: theme name in its
              own heading face, the pairing underneath in its body face.
              Hidden from the tree — the button's label carries both. */}
          <span className={styles.swatchTip} aria-hidden="true">
            <span className={styles.swatchTipName} style={{ fontFamily: tile.headingFont }}>
              {tile.label}
            </span>
            <span className={styles.swatchTipFont} style={{ fontFamily: tile.bodyFont }}>
              {tile.description}
            </span>
          </span>
        </span>
      ))}
      {/* The row ends where a new theme would begin: the dashed dot opens
          the playground, where a visitor builds their own. */}
      <span className={styles.swatchWrap}>
        <Link
          href="/playground"
          className={styles.accentSwatchAdd}
          aria-label="Make your own theme in the playground"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            add
          </span>
        </Link>
        <span className={styles.swatchTip} aria-hidden="true">
          <span className={styles.swatchTipName}>Make your own</span>
          <span className={styles.swatchTipFont}>Opens the playground</span>
        </span>
      </span>
    </div>
  );
}

export default function DesignSystemLanding() {
  const [alerts, setAlerts] = useState({ transactions: true, security: true, market: false });
  const [currency, setCurrency] = useState("usd");
  const [dueDate, setDueDate] = useState("2026-08-15");
  const [transferDate, setTransferDate] = useState("2026-08-03");
  const [threshold, setThreshold] = useState(50);
  const [range, setRange] = useState("6m");
  const [activeTab, setActiveTab] = useState("statements");
  const [page, setPage] = useState(3);
  const [receipt, setReceipt] = useState(true);
  const [schedule, setSchedule] = useState("monthly");
  const [holdingsFilter, setHoldingsFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState("fable-5");
  const [transferChoice, setTransferChoice] = useState<string | undefined>(undefined);
  const [calendarDay, setCalendarDay] = useState("2026-07-16");
  const [closeTask, setCloseTask] = useState<string | undefined>(undefined);

  const chartData = range === "6m" ? REVENUE_DATA.slice(1) : REVENUE_DATA;
  const narrow = useNarrowCollage();

  /* The three collage columns, as render functions so the layout can deal
     them out as three escalators or one (see the collage section). */
  const renderLeft = () => (<>
    <DemoCard
      heading="Spending by category"
      sub="Where this month's money went."
      links={[{ label: "Pie chart", href: "/components/pie-chart" }]}
    >
      <div className={styles.chartFlush}>
        <PieChart
          data={SPENDING_DATA}
          innerRadius={52}
          outerRadius={80}
          height={230}
          showLegend
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="The money month"
      sub="Payroll runs, due dates, and filings in one view."
      links={[{ label: "Event calendar", href: "/components/event-calendar" }]}
    >
      {/* calendarFit reduces pills to their dots — a day cell in a
          one-third column has no room for words. The events stay
          buttons so their titles survive as accessible names. */}
      <div className={styles.calendarFit}>
        <EventCalendar
          defaultMonth={CALENDAR_MONTH}
          events={CALENDAR_EVENTS}
          maxEventsPerDay={2}
          selectedDate={calendarDay}
          onDateClick={setCalendarDay}
          onEventClick={(event) => setCalendarDay(event.date)}
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="Financial performance"
      sub="Compared to the month before."
      links={[{ label: "Stat", href: "/components/stat" }]}
    >
      <div className={styles.statGrid}>
        <Stat value="$350K" label="MRR" delta="+3.2%" trend="up" />
        <Stat value="$211K" label="OpEx" delta="+12.8%" trend="down" />
        <Stat value="44.6%" label="GPM" delta="-1.2%" trend="down" />
        <Stat value="$443K" label="EBITDA" delta="+4.1%" trend="up" />
      </div>
    </DemoCard>

    <DemoCard
      heading="New invoice"
      sub="Bill a client in their own currency."
      links={[
        { label: "Input", href: "/components/input" },
        { label: "Dropdown", href: "/components/dropdown" },
        { label: "Date input", href: "/components/date-input" },
      ]}
    >
      <div className={styles.formStack}>
        <Input label="Client" placeholder="Acme Ltd" />
        <Dropdown
          label="Currency"
          value={currency}
          options={CURRENCY_OPTIONS}
          onValueChange={setCurrency}
        />
        <DateInput label="Due date" value={dueDate} onValueChange={setDueDate} />
        <Button label="Create invoice" variant="primary" iconLeft="receipt_long" />
      </div>
    </DemoCard>

    <DemoCard
      heading="Recent activity"
      sub="What happened over the past day."
      links={[{ label: "Avatar", href: "/components/avatar" }]}
    >
      <ul className={styles.rowList}>
        {ACTIVITY.map((a) => (
          <li key={a.name} className={styles.activityRow}>
            <Avatar name={a.name} size="sm" />
            <span className={styles.activityText}>
              <span className={styles.rowTitle}>{a.name}</span>
              <span className={styles.rowHint}>{a.action}</span>
            </span>
            <span className={styles.activityWhen}>{a.when}</span>
          </li>
        ))}
      </ul>
    </DemoCard>

    <DemoCard
      heading="Ask about your money"
      sub="Answers grounded in your own transactions."
      links={[
        { label: "Chat thread", href: "/components/chat-thread" },
        { label: "Chat message", href: "/components/chat-message" },
        { label: "Reasoning", href: "/components/reasoning" },
        { label: "Tool call", href: "/components/tool-call" },
        { label: "Source chip", href: "/components/source-chip" },
      ]}
    >
      <ChatHeader
        title="Money copilot"
        actions={
          <CircularButton icon="edit_square" variant="tertiary" ariaLabel="New chat" />
        }
      />
      <ChatThread ariaLabel="Example conversation" className={styles.chatDemoThread}>
        <ChatMarker>Today</ChatMarker>
        <ChatMessage role="user">
          How much did I spend on dining in July?
        </ChatMessage>
        <Reasoning size="compact" duration={2}>
          July has five weekends, so compare against a weekly average
          rather than the June total.
        </Reasoning>
        <ToolCall
          name="query_transactions"
          status="success"
          summary="86 transactions scanned"
        />
        <ChatMessage
          role="assistant"
          actions={<MessageActions items={ANSWER_ACTIONS} showTooltips={false} />}
          showActions
        >
          <Prose size="sm">
            <p>
              <strong>$280</strong> across nine visits, 12% less than
              June. Your cheapest week was the one you meal-prepped.
            </p>
          </Prose>
          <SourceChip index={1} title="July statement" />
        </ChatMessage>
      </ChatThread>
    </DemoCard>

    <DemoCard
      heading="Overdue invoices"
      links={[{ label: "Empty state", href: "/components/empty-state" }]}
    >
      <EmptyState
        icon="task_alt"
        title="Nothing overdue"
        description="Every invoice is paid or inside its terms."
        variant="bordered"
      />
    </DemoCard>

    <DemoCard
      heading="Documents"
      sub="Statements are generated on the 1st of each month."
      links={[
        { label: "Tabs", href: "/components/tabs" },
        { label: "Pagination", href: "/components/pagination" },
      ]}
    >
      <Tabs
        tabs={STATEMENT_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ariaLabel="Document types"
      />
      <ul className={styles.rowList}>
        {STATEMENTS.map((s) => (
          <li key={s.month} className={styles.statementRow}>
            <span className={`material-symbols-rounded ${styles.statementIcon}`} aria-hidden="true">
              description
            </span>
            <span className={styles.statementText}>
              <span className={styles.rowTitle}>{s.month}</span>
              <span className={styles.rowHint}>{s.meta}</span>
            </span>
            <span className={`material-symbols-rounded ${styles.statementDownload}`} aria-hidden="true">
              download
            </span>
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        pageCount={8}
        onPageChange={setPage}
        size="compact"
        ariaLabel="Statement pages"
      />
    </DemoCard>

    <DemoCard
      heading="Search"
      sub="Find any transaction, client, or invoice."
      links={[
        { label: "Kbd", href: "/components/kbd" },
        { label: "Chip", href: "/components/chip" },
      ]}
    >
      <div className={styles.searchTrigger}>
        <span className={`material-symbols-rounded ${styles.searchIcon}`} aria-hidden="true">
          search
        </span>
        <span className={styles.searchPlaceholder}>Search transactions…</span>
        <span className={styles.kbdKeys}>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </div>
      <div className={styles.recentRow}>
        <span className={styles.cardHint}>Recent</span>
        <Chip label="Acme Ltd" />
        <Chip label="#3461" />
      </div>
    </DemoCard>
  </>);

  const renderMiddle = (copy: "a" | "b") => (<>
    <NavCard
      heading="Install"
      sub={`${COMPONENT_COUNT} components on ${TOKEN_COUNT} semantic tokens, one package.`}
    >
      <CodeBlock code="npm install rift-ds" language="bash" />
      <div className={styles.buttonRow}>
        <Button label="Get started" variant="primary" size="compact" href="/docs/get-started" />
        <Button
          label="GitHub"
          variant="tertiary"
          size="compact"
          iconRight="open_in_new"
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </NavCard>

    <DemoCard
      heading="Quarter close"
      sub="Six weeks from closing the books to the filing."
      links={[{ label: "Gantt chart", href: "/components/gantt-chart" }]}
    >
      <div className={styles.ganttFit}>
        <GanttChart
          bare
          items={CLOSE_ITEMS}
          milestones={CLOSE_MILESTONES}
          range={{ start: "2026-07-01", end: "2026-09-12" }}
          showToday
          today={CLOSE_TODAY}
          showGrid
          selectedId={closeTask}
          onItemClick={(item) =>
            setCloseTask((current) => (current === item.id ? undefined : item.id))
          }
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="Trading activity"
      sub="One cell per trading day; darker means more trades."
      links={[{ label: "Contribution graph", href: "/components/contribution-graph" }]}
    >
      <div className={styles.scrollX}>
        <ContributionGraph bare days={tradingDays} showLegend />
      </div>
    </DemoCard>

    <DemoCard
      heading="Reconciling accounts"
      sub="A background agent matching invoices to deposits."
      links={[
        { label: "Agent status", href: "/components/agent-status" },
        { label: "Agent plan", href: "/components/agent-plan" },
      ]}
    >
      <AgentStatus state="working" label="Matching deposits" pattern="orbit" shimmer />
      <AgentPlan title="Reconciliation plan" steps={RECONCILE_STEPS} defaultOpen />
    </DemoCard>

    <DemoCard
      heading="Revenue"
      sub="Monthly, in thousands."
      links={[
        { label: "Bar chart", href: "/components/bar-chart" },
        { label: "Segmented control", href: "/components/segmented-control" },
      ]}
    >
      <div className={styles.chartToolbar}>
        <SegmentedControl
          segments={RANGE_SEGMENTS}
          activeSegment={range}
          onSegmentChange={setRange}
        />
      </div>
      <div className={styles.chartFlush}>
        <BarChart data={chartData} dataLabel="Revenue" height={210} />
      </div>
    </DemoCard>

    <DemoCard
      heading="Quick actions"
      links={[{ label: "Circular button", href: "/components/circular-button" }]}
    >
      <div className={styles.quickActions}>
        <div className={styles.quickAction}>
          <CircularButton icon="arrow_upward" variant="primary" ariaLabel="Send money" />
          <span className={styles.quickActionLabel}>Send</span>
        </div>
        <div className={styles.quickAction}>
          <CircularButton icon="arrow_downward" variant="secondary" ariaLabel="Request money" />
          <span className={styles.quickActionLabel}>Request</span>
        </div>
        <div className={styles.quickAction}>
          <CircularButton icon="add" variant="secondary" ariaLabel="Top up balance" />
          <span className={styles.quickActionLabel}>Top up</span>
        </div>
        <div className={styles.quickAction}>
          <CircularButton icon="more_horiz" variant="tertiary" ariaLabel="More actions" />
          <span className={styles.quickActionLabel}>More</span>
        </div>
      </div>
    </DemoCard>

    <DemoCard
      heading="Start a conversation"
      sub="Ask in plain language; pick the model behind it."
      links={[
        { label: "Composer", href: "/components/composer" },
        { label: "Prompt suggestions", href: "/components/prompt-suggestions" },
        { label: "Model picker", href: "/components/model-picker" },
        { label: "AI button", href: "/components/ai-button" },
      ]}
    >
      <PromptSuggestions
        suggestions={PROMPT_IDEAS}
        layout="wrap"
        size="compact"
        ariaLabel="Suggested questions"
        onValueChange={(id) =>
          setDraft(PROMPT_IDEAS.find((p) => p.id === id)?.label ?? "")
        }
      />
      <Composer
        value={draft}
        onValueChange={setDraft}
        onSubmit={() => setDraft("")}
        placeholder="Message the agent"
        actions={
          <ModelPicker
            models={AGENT_MODELS}
            value={model}
            onValueChange={setModel}
            placement="top"
          />
        }
      />
      <div className={styles.buttonRow}>
        <AiButton label="Summarise July" size="compact" />
      </div>
    </DemoCard>

    <DemoCard
      heading="Invoice paid"
      links={[{ label: "Button", href: "/components/button" }]}
    >
      <div className={styles.successPanel}>
        <span className={styles.successBadge}>
          <span className="material-symbols-rounded" aria-hidden="true">
            check
          </span>
        </span>
        <span className={styles.successAmount}>You received $17,975.30</span>
        <span className={styles.successHint}>
          Invoice #3463 settled. A receipt went to accounting@example.com.
        </span>
        <div className={styles.successActions}>
          <Button label="Next invoice" variant="primary" size="compact" />
          <Button label="Done" variant="secondary" size="compact" />
        </div>
      </div>
    </DemoCard>

    <DemoCard
      heading="Savings targets"
      sub="Active goals across your accounts."
      links={[{ label: "Progress bar", href: "/components/progress-bar" }]}
    >
      {SAVINGS_GOALS.map((goal) => (
        <div key={goal.label} className={styles.goal}>
          <div className={styles.goalHead}>
            <span className={styles.rowTitle}>{goal.label}</span>
            <span className={styles.rowHint}>{goal.target}</span>
          </div>
          <ProgressBar value={goal.value} showLabel ariaLabel={`${goal.label} progress`} />
        </div>
      ))}
    </DemoCard>

    <DemoCard
      heading="Payout schedule"
      sub="When your cleared balance is sent to the bank."
      links={[
        { label: "Selection card", href: "/components/selection-card" },
        { label: "Checkbox", href: "/components/checkbox" },
      ]}
    >
      <SelectionCard
        mode="radio"
        name={`ds-landing-schedule-${copy}`}
        options={SCHEDULE_OPTIONS}
        value={schedule}
        onChange={(v) => setSchedule(v as string)}
      />
      <Checkbox
        label="Email a receipt for each payout"
        checked={receipt}
        onChange={setReceipt}
      />
    </DemoCard>

    <DemoCard
      heading="Open positions"
      links={[
        { label: "Skeleton", href: "/components/skeleton" },
        { label: "Spinner", href: "/components/spinner" },
      ]}
    >
      <div className={styles.loadingRow}>
        <Spinner size="sm" label="Loading positions" />
        <span className={styles.cardHint}>Fetching the latest prices</span>
      </div>
      <Skeleton variant="text" lines={6} />
    </DemoCard>
  </>);

  const renderRight = () => (<>
    <DemoCard
      heading="Where payments come from"
      sub="Hover a city for the client and the invoice it settled."
      links={[
        { label: "Globe", href: "/components/globe" },
        { label: "Map callout", href: "/components/map-callout" },
        { label: "Map legend", href: "/components/map-legend" },
      ]}
    >
      <Globe
        points={GLOBE_POINTS}
        arcs={GLOBE_ARCS}
        defaultRotation={[-45, -25]}
        label="Client cities and the payment routes home"
        renderCallout={(point) => {
          const route = PAYMENT_ROUTES.find((r) => r.id === point.id);
          return (
            <MapCallout
              title={point.label ?? point.id}
              lines={
                route
                  ? [route.client, route.amount]
                  : ["Head office", `${PAYMENT_ROUTES.length} clients`]
              }
            />
          );
        }}
      />
      <MapLegend
        items={[
          { glyph: "anchor", label: "Head office" },
          { glyph: "point", label: "Client" },
          { glyph: "arc", label: "Payment route" },
        ]}
      />
    </DemoCard>

    <DemoCard
      heading="Portfolio value"
      sub="Against the index, in thousands."
      links={[{ label: "Area chart", href: "/components/area-chart" }]}
    >
      <div className={styles.chartFlush}>
        <AreaChart
          data={PORTFOLIO_DATA}
          xKey="month"
          series={[
            { dataKey: "value", label: "Portfolio" },
            { dataKey: "benchmark", label: "Benchmark", fillOpacity: 0.35 },
          ]}
          height={180}
          showLegend={false}
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="Payout coverage"
      sub="Hover a city for the currency and how fast it settles."
      links={[{ label: "World map", href: "/components/world-map" }]}
    >
      {/* The map fills its container — the wrapper owns the height. */}
      <div className={styles.mapFrame}>
        <WorldMap
          points={COVERAGE_POINTS}
          bounds={[-125, -42, 160, 62]}
          fit="cover"
          showZoomControls
          label="Cities the platform can send money to"
          renderCallout={(point) => {
            const city = COVERAGE_CITIES.find((c) => c.id === point.id);
            return (
              <MapCallout
                title={point.label ?? point.id}
                lines={city ? [city.currency, city.settles] : ["Head office"]}
              />
            );
          }}
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="Top holdings"
      sub="By market value."
      links={[
        { label: "Table", href: "/components/table" },
        { label: "Chip", href: "/components/chip" },
      ]}
    >
      <div className={styles.badgeRow}>
        <Chip
          label="All"
          selected={holdingsFilter === "all"}
          onClick={() => setHoldingsFilter("all")}
        />
        <Chip
          label="Equity"
          selected={holdingsFilter === "equity"}
          onClick={() => setHoldingsFilter("equity")}
        />
        <Chip
          label="Bonds"
          selected={holdingsFilter === "bonds"}
          onClick={() => setHoldingsFilter("bonds")}
        />
      </div>
      <Table
        columns={HOLDINGS_COLUMNS}
        rows={HOLDINGS_ROWS}
        bordered
        caption="Top holdings by market value"
        captionHidden
      />
    </DemoCard>

    <DemoCard
      heading="Team cards"
      sub="Click the deck to flip through the virtual cards you've issued."
      links={[
        { label: "Card stack", href: "/components/card-stack" },
        { label: "Card", href: "/components/card" },
      ]}
    >
      <CardStack label="Virtual team cards">
        {TEAM_CARDS.map((c) => (
          <Card key={c.name} title={c.name}>
            <div className={styles.teamCardBody}>
              <span className={styles.teamCardNumber}>{c.number}</span>
              <Badge variant="neutral" label={c.limit} />
            </div>
          </Card>
        ))}
      </CardStack>
    </DemoCard>

    <DemoCard
      heading="Schedule a transfer"
      sub="Pick the day the money should move."
      links={[{ label: "Date picker", href: "/components/date-picker" }]}
    >
      <div className={styles.calendarWrap}>
        <DatePicker size="compact" value={transferDate} onDateSelect={setTransferDate} />
      </div>
    </DemoCard>

    <DemoCard
      heading="Notifications"
      sub="Choose which alerts reach you."
      links={[{ label: "Toggle switch", href: "/components/toggle-switch" }]}
    >
      <div className={styles.settingRow}>
        <span className={styles.settingText}>
          <span className={styles.settingLabel}>Transaction alerts</span>
          <span className={styles.settingHint}>Deposits, withdrawals, and transfers</span>
        </span>
        <ToggleSwitch
          label="Transaction alerts"
          showLabel={false}
          checked={alerts.transactions}
          onChange={(v) => setAlerts((a) => ({ ...a, transactions: v }))}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingText}>
          <span className={styles.settingLabel}>Security alerts</span>
          <span className={styles.settingHint}>Login attempts and account changes</span>
        </span>
        <ToggleSwitch
          label="Security alerts"
          showLabel={false}
          checked={alerts.security}
          onChange={(v) => setAlerts((a) => ({ ...a, security: v }))}
        />
      </div>
      <div className={styles.settingRow}>
        <span className={styles.settingText}>
          <span className={styles.settingLabel}>Market updates</span>
          <span className={styles.settingHint}>Daily price summary</span>
        </span>
        <ToggleSwitch
          label="Market updates"
          showLabel={false}
          checked={alerts.market}
          onChange={(v) => setAlerts((a) => ({ ...a, market: v }))}
        />
      </div>
    </DemoCard>

    <DemoCard
      heading="Agent hand-offs"
      sub="The agent pauses before anything irreversible."
      links={[
        { label: "Interrupt card", href: "/components/interrupt-card" },
        { label: "Message card", href: "/components/message-card" },
        { label: "Attachment tile", href: "/components/attachment-tile" },
      ]}
    >
      <InterruptCard
        title="Send $2,500 to savings?"
        description="This transfer is larger than your usual amount."
        options={[
          { value: "allow", label: "Allow", variant: "primary" },
          { value: "deny", label: "Not now" },
        ]}
        value={transferChoice}
        onValueChange={setTransferChoice}
      />
      <MessageCard
        title="July statement is ready"
        description="Nine categories over 86 transactions."
        meta="Generated 1 Aug"
      />
      <AttachmentTile name="statement-july.pdf" kind="pdf" meta="84 KB" size="compact" />
    </DemoCard>

    <DemoCard
      heading="Invoices"
      sub="This month, most recent first."
      links={[{ label: "Badge", href: "/components/badge" }]}
    >
      <ul className={styles.rowList}>
        {INVOICES.map((inv) => (
          <li key={inv.id} className={styles.invoiceRow}>
            <span className={styles.invoiceText}>
              <span className={styles.rowTitle}>{inv.id}</span>
              <span className={styles.rowHint}>{inv.client}</span>
            </span>
            <span className={styles.invoiceAmount}>{inv.amount}</span>
            <Badge label={inv.status} variant={inv.variant} />
          </li>
        ))}
      </ul>
    </DemoCard>

    <DemoCard
      heading="Payout threshold"
      sub="The minimum balance before a payout is triggered."
      links={[{ label: "Slider", href: "/components/slider" }]}
    >
      <div className={styles.thresholdStack}>
        <div className={styles.thresholdReadout}>
          <span className={styles.thresholdLabel}>Minimum payout</span>
          <span className={styles.thresholdValue}>
            ${(threshold * 50).toLocaleString()}
          </span>
        </div>
        <Slider
          value={threshold}
          min={10}
          max={200}
          onValueChange={setThreshold}
          ariaLabel="Minimum payout amount"
        />
        <Button label="Save threshold" variant="secondary" size="compact" />
      </div>
    </DemoCard>

    <DemoCard
      heading="Invoice #3459"
      sub="From issue to payment in eleven days."
      links={[{ label: "Timeline", href: "/components/timeline" }]}
    >
      <Timeline
        items={[
          { meta: "21 Jun", title: "Issued", description: "Sent to Acme Ltd." },
          { meta: "24 Jun", title: "Approved", description: "Signed off by their finance team." },
          { meta: "2 Jul", title: "Paid", description: "$12,400.00 received." },
        ]}
      />
    </DemoCard>
  </>);

  return (
    <>
      <ExtendedBackground />
      <MegaNav />

      <main className={styles.page} id="main-content">
        {/* ---------- page header (deliberately light: this is the index of
             the design-system section, so it carries the tagline, the
             registry-counted metrics band, the section links, and the accent
             swatches — nothing else. Figma, Storybook, GitHub and npm live in
             the resources strip below the collage, plus the footer and the
             Install card.) ---------- */}
        <section className={styles.hero} aria-label="About the design system">
          {/* The entrance animation lives on this wrapper, NOT the section:
              .animate-in's will-change makes an ancestor a backdrop root,
              which would stop the theme tooltips blurring the page behind
              them. The theme row enters by opacity alone, outside it. */}
          <div className={`${styles.heroInner} animate-in`}>
          {/* The tagline is the h1: the nav wordmark owns the name. */}
          <h1 className={styles.pageTitle}>The AI-ready React design system</h1>
          <p className={styles.subDisplay}>
            Open source and fully themeable, built for AI products and coding
            agents.
          </p>
          <ButtonGroup
            ariaLabel="Get started"
            buttons={[
              { label: "Get started", variant: "primary" as const, href: "/docs/get-started" },
              { label: "Browse components", variant: "secondary" as const, href: "/components" },
            ]}
          />
          {/* The counts sit between the two rules; the theme dots close
              the hero. Every figure imports from the registry export that
              owns it, so the band can never overstate. */}
          <FadeDivider className={styles.heroDivider} />
          <div className={styles.statStrip} role="group" aria-label="What the system counts today">
            <Stat value={<AnimatedNumber value={COMPONENT_COUNT} />} label="Components" />
            <Stat value={<AnimatedNumber value={TOKEN_COUNT} />} label="Semantic tokens" />
            <Stat value={<AnimatedNumber value={THEME_SELECTOR_ORDER.length} />} label="Themes" />
            <Stat value={<AnimatedNumber value={MCP_TOOLS.length} />} label="MCP tools" />
            <Stat
              value={<AnimatedNumber value={0} format={(v) => `$${v.toFixed(2)}`} />}
              label="Cost"
            />
          </div>
          <FadeDivider className={styles.heroDivider} />
          </div>
          <div className={`${styles.heroThemes} animate-delay-1`}>
            <ThemeSwitcher />
          </div>
        </section>

        {/* ---------- collage: three curated columns of live demos + nav; one
             column below the breakpoint, so phones get the same drift ---------- */}
        <section
          className={`${styles.collage} animate-in animate-delay-1`}
          aria-label="Live component examples"
        >
          {narrow ? (
            /* One column carries every card; the duration is the three
               columns' summed so the drift keeps the desktop pace. */
            <EscalatorColumn direction="down" duration="1020s" render={(copy) => (<>
              {renderLeft()}
              {renderMiddle(copy)}
              {renderRight()}
            </>)} />
          ) : (
            <>
              <EscalatorColumn direction="down" duration="320s" render={() => renderLeft()} />
              <EscalatorColumn direction="up" duration="360s" render={(copy) => renderMiddle(copy)} />
              <EscalatorColumn direction="down" duration="340s" render={() => renderRight()} />
            </>
          )}
        </section>

        {/* ---------- where the system lives, and what it is built on ---------- */}
        <section
          className={`${styles.resourcesStrip} animate-in animate-delay-1`}
          aria-label="Resources and stack"
        >
          <ButtonGroup
            ariaLabel="External resources"
            buttons={[
              ...(SHOW_FIGMA_LINKS
                ? [
                    {
                      label: "Figma",
                      variant: "tertiary" as const,
                      iconLeft: <FigmaIcon />,
                      iconRight: "open_in_new",
                      href: FIGMA_FILE_URL,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  ]
                : []),
              {
                label: "Storybook",
                variant: "tertiary" as const,
                iconLeft: <StorybookIcon />,
                iconRight: "open_in_new",
                href: STORYBOOK_URL,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              {
                label: "GitHub",
                variant: "tertiary" as const,
                iconLeft: <GitHubIcon />,
                iconRight: "open_in_new",
                href: REPOSITORY_URL,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              {
                label: "npm",
                variant: "tertiary" as const,
                iconLeft: <NpmIcon />,
                iconRight: "open_in_new",
                href: NPM_URL,
                target: "_blank",
                rel: "noopener noreferrer",
              },
            ]}
          />
          <ul className={styles.techRow} aria-label="Built with">
            {TECH_STACK.map((name) => (
              <li key={name} className={styles.techItem}>
                {name}
              </li>
            ))}
          </ul>
        </section>
      </main>

    </>
  );
}
