"use client";

/**
 * The mobile dashboard template: Boardline, the marketing dashboard's
 * fictional product, as an iOS app. The screen is the phone and nothing
 * else: there is no tablet or desktop layout. At a phone's width the page
 * is the app, edge to edge; anything wider draws an iPhone Pro Max (440 x
 * 956) in a bezel with status bar and home indicator, the playground chat
 * stage's device recipe with a real Pro Max's deeper corners and a pure
 * white or black bezel, scaled to fit and centred on the dotted ground.
 * The templates carousel draws it in its phone mock whichever device is
 * picked (the `mobileOnly` flag on its sidebar entry).
 *
 * Composition calls, against design.md's Template screens section:
 * - The chrome is the two platform components set to `ios`: TopAppBar with
 *   a large title that collapses as the column scrolls, and BottomNav's
 *   Liquid Glass capsule floating over the content at full size throughout
 *   (no minimise on scroll). Neither is fixed to the viewport:
 *   both ride the app area, so the framed phone carries them inside it.
 * - The menu button opens a left Drawer holding a NavList, the drawer
 *   pattern NavList's own doc names; the profile is Avatar initials.
 * - The stage is a single column of Panels on the dashboard rung set: the
 *   marketing dashboard's KPI tiles two up, its ad spend chart, its channel
 *   share bars, and its campaigns as a list, because a data table does not
 *   fit a phone and a row list is what a phone app shows instead.
 * - One control species per row: a full-width SegmentedControl is the only
 *   filter on each tab (the date range on Overview, delivery on Campaigns).
 * - The assistant is the shared TemplateAssistant re-seated as a full-screen
 *   sheet over the app area, tab bar included, launched from BottomNav's
 *   set-apart circle where an iOS app would put search.
 * - Framed, the stage carries the way back to /templates (the site's mark
 *   and wordmark) and the theme switcher pair; at a phone's width both move
 *   into the menu drawer's footer. design.md's Template screens rule 6
 *   records this shape for the family.
 *
 * All data is fictional and pinned, so the route is excluded from the chat
 * corpus (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import Link from "next/link";
import React from "react";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import { BottomNav } from "rift-ds/components/BottomNav/BottomNav";
import { Button } from "rift-ds/components/Button/Button";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { NavList } from "rift-ds/components/NavList/NavList";
import { Panel } from "rift-ds/components/Panel/Panel";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Stat } from "rift-ds/components/Stat/Stat";
import { TopAppBar } from "rift-ds/components/TopAppBar/TopAppBar";
import { ComboChart } from "rift-ds/charts";
import BrandMark from "../../BrandMark/BrandMark";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import SidebarSwitchers from "../SidebarSwitchers/SidebarSwitchers";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import { BRAND_NAME } from "@/config/brand.generated";
import styles from "./MobileDashboard.module.css";

/* ---------------------------------------------------------------- data */

type Tab = "overview" | "campaigns" | "reports" | "inbox";

const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
  { key: "overview", label: "Overview", icon: "space_dashboard" },
  { key: "campaigns", label: "Campaigns", icon: "campaign" },
  { key: "reports", label: "Reports", icon: "monitoring" },
  { key: "inbox", label: "Inbox", icon: "inbox", badge: 9 },
];

const MENU = [
  { label: "Home", href: "#home" },
  { label: "Marketing", href: "#marketing" },
  { label: "Calendar", href: "#calendar" },
  { label: "Projects", href: "#projects" },
  { label: "Support", href: "#support" },
  { label: "Settings", href: "#settings" },
];

const RANGES = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
];

/* The marketing dashboard's four KPIs, the same figures. */
const KPIS = [
  {
    icon: "payments",
    value: "$24,380",
    label: "Ad spend",
    delta: "+8.4%",
    trend: "up" as const,
  },
  {
    icon: "visibility",
    value: "1.94M",
    label: "Impressions",
    delta: "+12.6%",
    trend: "up" as const,
  },
  {
    icon: "conversion_path",
    value: "1,286",
    label: "Conversions",
    delta: "+5.2%",
    trend: "up" as const,
  },
  {
    icon: "ads_click",
    value: "$1.24",
    label: "Cost per click",
    delta: "-3.1%",
    trend: "down" as const,
  },
];

/* The last six months of the marketing dashboard's ad spend series ($K),
   with ROAS on the second axis. A phone shows half a year, not twelve bars. */
const AD_SPEND = [
  { month: "Jul", spend: 17.8, roas: 3.6 },
  { month: "Aug", spend: 19.2, roas: 3.7 },
  { month: "Sep", spend: 20.7, roas: 3.8 },
  { month: "Oct", spend: 22.6, roas: 4.0 },
  { month: "Nov", spend: 26.3, roas: 4.1 },
  { month: "Dec", spend: 31.1, roas: 4.3 },
];

const CHANNEL_SHARE = [
  { name: "Google Ads", icon: "search", pct: 39 },
  { name: "Meta", icon: "groups", pct: 25 },
  { name: "X Ads", icon: "tag", pct: 14 },
  { name: "LinkedIn", icon: "work", pct: 8 },
];

const CHANNEL_GLYPH: Record<string, string> = {
  google: "search",
  meta: "groups",
  x: "tag",
  linkedin: "work",
  email: "mail",
  web: "language",
};

type Delivery = "active" | "paused" | "draft";

const DELIVERY_BADGE: Record<
  Delivery,
  { label: string; variant: "positive" | "warning" | "neutral" }
> = {
  active: { label: "Active", variant: "positive" },
  paused: { label: "Paused", variant: "warning" },
  draft: { label: "Draft", variant: "neutral" },
};

type Campaign = {
  id: string;
  name: string;
  market: string;
  channel: string;
  delivery: Delivery;
  objective: string;
  spend: number;
};

/* A slice of the marketing dashboard's campaign book, newest first. */
const CAMPAIGNS: Campaign[] = [
  {
    id: "c03",
    name: "Founder story video",
    market: "US",
    channel: "linkedin",
    delivery: "active",
    objective: "Conversions",
    spend: 1330,
  },
  {
    id: "c07",
    name: "Cart retargeting",
    market: "UK",
    channel: "web",
    delivery: "draft",
    objective: "Awareness",
    spend: 0,
  },
  {
    id: "c12",
    name: "Free tier launch",
    market: "US",
    channel: "google",
    delivery: "active",
    objective: "Conversions",
    spend: 22940,
  },
  {
    id: "c11",
    name: "Partner co-marketing",
    market: "Global",
    channel: "linkedin",
    delivery: "active",
    objective: "Leads",
    spend: 12480,
  },
  {
    id: "c04",
    name: "Newsletter promo",
    market: "EU",
    channel: "web",
    delivery: "paused",
    objective: "Leads",
    spend: 34445,
  },
  {
    id: "c14",
    name: "Churn winback email",
    market: "EU",
    channel: "email",
    delivery: "active",
    objective: "Retargeting",
    spend: 2210,
  },
  {
    id: "c08",
    name: "Newsletter promo",
    market: "US",
    channel: "meta",
    delivery: "active",
    objective: "Awareness",
    spend: 28095,
  },
  {
    id: "c01",
    name: "Founder story video",
    market: "Global",
    channel: "web",
    delivery: "active",
    objective: "Awareness",
    spend: 34800,
  },
  {
    id: "c15",
    name: "Product tour video",
    market: "US",
    channel: "meta",
    delivery: "draft",
    objective: "Awareness",
    spend: 0,
  },
  {
    id: "c02",
    name: "Holiday gift guide",
    market: "Global",
    channel: "meta",
    delivery: "paused",
    objective: "Traffic",
    spend: 30884,
  },
];

const DELIVERY_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
];

/** Whole dollars with thousands separators, formatted by hand so the
    static HTML and the hydrating client never disagree over a locale. */
function formatSpend(amount: number): string {
  return `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** The chart palette token for a 1-based series slot. */
function seriesSwatch(series: number): string {
  return `var(--color-chart-series-${series})`;
}

/* The assistant is a mock over this screen's own numbers, the marketing
   dashboard's canned tour at phone scale, launched from the tab bar's
   set-apart glass circle where an iOS app would put search. */
const CHAT_SUGGESTIONS = [
  { id: "cpc", label: "Why did cost per click fall?" },
  { id: "month", label: "Summarise this month" },
  { id: "channel", label: "Which channel converts best?" },
];

const CHAT_REPLIES: Record<string, string> = {
  cpc: "Cost per click fell 3.1% to $1.24 because spend shifted toward Google Ads, which is winning cheaper auctions. It now carries 39% of traffic at the lowest cost per conversion on the account.",
  month: "Ad spend is $24,380, up 8.4%, and impressions grew 12.6% to 1.94M. Conversions rose 5.2% to 1,286 while cost per click fell 3.1%: more volume for slightly less money per click.",
  channel: "Google Ads converts best, with the largest share of the 1,286 conversions. Meta is second on volume, but its cost per conversion runs about a third higher.",
};

const CHAT_FALLBACK =
  "This assistant is a mock. In the real product this answer would come from your campaign data. Try one of the suggested questions for a canned tour.";

/* The framed phone's geometry: an iPhone Pro Max screen (440 x 956
   points) inside a 12px bezel with a Pro Max's deep corners, and the clearance kept from the window's
   edges. The breakpoint matches the stylesheet's framed media query. */
const FRAMED_QUERY = "(min-width: 600px)";
const DEVICE_W = 440 + 24;
const DEVICE_H = 956 + 24;
const FRAME_CLEARANCE = 32;
/* The drawn status bar's height and the screen's corner, both restated from
   the stylesheet's framed recipe for the drawer's placement. */
const STATUS_H = 54;
const SCREEN_RADIUS = 56;
const DRAWER_VARS = [
  "--md-app-top",
  "--md-app-left",
  "--md-app-width",
  "--md-app-height",
  "--md-app-scale",
  "--md-app-radius",
];

/* ------------------------------------------------------------- helpers */

function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <ul className={styles.campaignList}>
      {campaigns.map((c) => {
        const badge = DELIVERY_BADGE[c.delivery];
        return (
          <li key={c.id} className={styles.campaignRow}>
            <span className={styles.glyphChip} aria-hidden="true">
              <span className="material-symbols-rounded">
                {CHANNEL_GLYPH[c.channel]}
              </span>
            </span>
            <span className={styles.campaignText}>
              <span className={styles.campaignName}>{c.name}</span>
              <span className={styles.campaignMeta}>
                {c.market} · {c.objective}
              </span>
            </span>
            <span className={styles.campaignFigures}>
              <span className={styles.campaignSpend}>
                {formatSpend(c.spend)}
              </span>
              <Badge variant={badge.variant} label={badge.label} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- page */

export default function MobileDashboard() {
  const [tab, setTab] = React.useState<Tab>("overview");
  const [range, setRange] = React.useState("30d");
  const [deliveryFilter, setDeliveryFilter] = React.useState("all");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);

  /* The phone column is the scroll container, not the window, so the top
     bar watches it for its collapse. Held in state so TopAppBar
     re-subscribes once the node exists. The tab bar deliberately stays
     full size through the whole scroll: the system bar's minimise-on-scroll
     was tried here and read as a jarring swap. */
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null);

  const selectTab = (key: string) => {
    setTab(key as Tab);
    scroller?.scrollTo({ top: 0 });
  };

  /* The framed phone: past a phone's width the screen is drawn at the
     Pro Max size and scaled to fit the window, keeping its proportions.
     The Drawer portals to the body, so while framed it is pinned over the
     app area's rect at the same scale, and opens inside the phone rather
     than at the window's edge. Under the breakpoint none of this applies:
     the page is the phone. */
  const stageRef = React.useRef<HTMLDivElement>(null);
  const appRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const stage = stageRef.current;
    const app = appRef.current;
    if (!stage || !app) return;
    const framed = window.matchMedia(FRAMED_QUERY);
    const root = document.documentElement;
    const fit = () => {
      if (!framed.matches) {
        stage.style.removeProperty("--phone-scale");
        for (const name of DRAWER_VARS) root.style.removeProperty(name);
        return;
      }
      const scale = Math.min(
        1,
        (stage.clientHeight - FRAME_CLEARANCE * 2) / DEVICE_H,
        (stage.clientWidth - FRAME_CLEARANCE) / DEVICE_W,
      );
      stage.style.setProperty("--phone-scale", String(scale));
      /* The drawer starts under the status bar (it overlays the app's
         top 54px) and keeps the screen's bottom corners. */
      const rect = app.getBoundingClientRect();
      root.style.setProperty("--md-app-top", `${rect.top + STATUS_H * scale}px`);
      root.style.setProperty("--md-app-left", `${rect.left}px`);
      root.style.setProperty("--md-app-width", `${app.offsetWidth}px`);
      root.style.setProperty("--md-app-height", `${app.offsetHeight - STATUS_H}px`);
      root.style.setProperty("--md-app-radius", `${SCREEN_RADIUS}px`);
      root.style.setProperty("--md-app-scale", String(scale));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    framed.addEventListener("change", fit);
    return () => {
      observer.disconnect();
      framed.removeEventListener("change", fit);
      for (const name of DRAWER_VARS) root.style.removeProperty(name);
    };
  }, []);

  const title = TABS.find((t) => t.key === tab)?.label ?? "Overview";
  const filtered =
    deliveryFilter === "all"
      ? CAMPAIGNS
      : CAMPAIGNS.filter((c) => c.delivery === deliveryFilter);

  return (
    <div ref={stageRef} className={styles.stage}>
      <HiddenBackground />
      <DotBackground />

      {/* The site's mark and wordmark, top left on the stage: the way back
          to the templates index, since this chromeless route has no
          header. At a phone's width it moves into the drawer too. */}
      <Link href="/templates" className={`${styles.stageLogo} ${styles.logo}`}>
        <BrandMark size={28} />
        <span className={styles.logoText}>{BRAND_NAME}</span>
        <span className={styles.srOnly}>, back to templates</span>
      </Link>

      {/* The theme switcher and colour mode toggle, on the stage beside
          the framed phone: the site header's pair, where the other
          templates carry it on their sidebar floor. At a phone's width
          there is no stage, so the pair moves into the menu drawer. */}
      <div className={styles.stageSwitchers}>
        <BrandSwitcher />
        <ThemeToggle />
      </div>

      <div className={styles.frameBox}>
        <div className={styles.device}>
          <div className={styles.screen}>
            {/* OS chrome, drawn only in the framed phone: at a real phone
                width the device's own status bar and home indicator are
                there already. Set dressing, hidden from the tree. */}
            <div className={styles.statusBar} aria-hidden="true">
              <span className={styles.statusTime}>9:41</span>
              <span className={styles.dynamicIsland} />
              <span className={styles.statusIcons}>
                <span className="material-symbols-rounded">
                  signal_cellular_alt
                </span>
                <span className="material-symbols-rounded">wifi</span>
                <span className="material-symbols-rounded">battery_full</span>
              </span>
            </div>

            <div ref={appRef} className={styles.app}>
              <div ref={setScroller} className={styles.scroller}>
                <TopAppBar
                  key={tab}
                  platform="ios"
                  size="large"
                  title={title}
                  subtitle={
                    tab === "overview" ? "Boardline · Team space" : undefined
                  }
                  navigation="menu"
                  onNavigate={() => setMenuOpen(true)}
                  scrollTarget={scroller}
                  actions={[
                    {
                      key: "notifications",
                      icon: "notifications",
                      label: "Notifications",
                      badge: true,
                    },
                  ]}
                  overflowActions={[
                    { key: "new", icon: "add", label: "New campaign" },
                    { key: "export", icon: "download", label: "Export report" },
                    { key: "settings", icon: "settings", label: "Settings" },
                  ]}
                />

                <main className={styles.content}>
                  {tab === "overview" && (
                    <>
                      <SegmentedControl
                        segments={RANGES}
                        activeSegment={range}
                        onSegmentChange={setRange}
                        size="compact"
                        fullWidth
                        ariaLabel="Date range"
                      />

                      <div className={styles.kpiGrid}>
                        {KPIS.map((kpi) => (
                          <Panel
                            key={kpi.label}
                            padding="compact"
                            className={styles.kpi}
                          >
                            <span className={styles.kpiIcon} aria-hidden="true">
                              <span className="material-symbols-rounded">
                                {kpi.icon}
                              </span>
                            </span>
                            <Stat
                              value={kpi.value}
                              label={kpi.label}
                              delta={kpi.delta}
                              trend={kpi.trend}
                            />
                          </Panel>
                        ))}
                      </div>

                      <Panel aria-label="Ad spend by month">
                        <Stat
                          value="$137.7K"
                          label="Ad spend, last six months"
                          delta="+9.4%"
                          trend="up"
                          deltaPlacement="inline"
                        />
                        <ComboChart
                          data={AD_SPEND}
                          xKey="month"
                          barKey="spend"
                          barLabel="Ad spend ($K)"
                          lineKey="roas"
                          lineLabel="ROAS"
                          height={200}
                          bare
                        />
                        <div className={styles.legendRow}>
                          <LegendTile
                            swatch={seriesSwatch(1)}
                            label="Ad spend"
                            value="$137.7K"
                          />
                          <LegendTile
                            swatch={seriesSwatch(2)}
                            label="ROAS, average"
                            value="3.9x"
                          />
                        </div>
                      </Panel>

                      <Panel aria-label="Traffic by channel">
                        <h2 className={styles.panelTitle}>
                          Traffic by channel
                        </h2>
                        <div className={styles.channelList}>
                          {CHANNEL_SHARE.map((channel) => (
                            <div
                              key={channel.name}
                              className={styles.channelRow}
                            >
                              <div className={styles.channelMeta}>
                                <span className={styles.channelName}>
                                  <span
                                    className={`material-symbols-rounded ${styles.channelGlyph}`}
                                    aria-hidden="true"
                                  >
                                    {channel.icon}
                                  </span>
                                  {channel.name}
                                </span>
                                <span className={styles.channelPct}>
                                  {channel.pct}%
                                </span>
                              </div>
                              <ProgressBar
                                value={channel.pct}
                                size="compact"
                                ariaLabel={`${channel.name} share of traffic`}
                              />
                            </div>
                          ))}
                        </div>
                      </Panel>

                      <Panel aria-label="Recent campaigns">
                        <div className={styles.panelHead}>
                          <h2 className={styles.panelTitle}>
                            Recent campaigns
                          </h2>
                          <Button
                            variant="tertiary"
                            size="compact"
                            label="See all"
                            onClick={() => selectTab("campaigns")}
                          />
                        </div>
                        <CampaignList campaigns={CAMPAIGNS.slice(0, 4)} />
                      </Panel>
                    </>
                  )}

                  {tab === "campaigns" && (
                    <>
                      <SegmentedControl
                        segments={DELIVERY_FILTERS}
                        activeSegment={deliveryFilter}
                        onSegmentChange={setDeliveryFilter}
                        size="compact"
                        fullWidth
                        ariaLabel="Filter by delivery"
                      />
                      <Panel aria-label="Campaigns">
                        <div className={styles.panelHead}>
                          <h2 className={styles.panelTitle}>
                            {filtered.length}{" "}
                            {filtered.length === 1 ? "campaign" : "campaigns"}
                          </h2>
                        </div>
                        <CampaignList campaigns={filtered} />
                      </Panel>
                    </>
                  )}

                  {(tab === "reports" || tab === "inbox") && (
                    <EmptyState
                      icon={tab === "reports" ? "query_stats" : "inbox"}
                      title="Not in this template"
                      description="Only Overview and Campaigns are built on this screen."
                      size="compact"
                    />
                  )}
                </main>
              </div>

              <div className={styles.tabBar}>
                <BottomNav
                  platform="ios"
                  items={TABS}
                  activeKey={tab}
                  onValueChange={selectTab}
                  search={{
              label: "Ask Boardline AI",
              icon: "auto_awesome",
              onClick: () => setChatOpen(true),
            }}
                  aria-label="Boardline"
                />
              </div>

              {/* The assistant opens as a sheet over the whole app area,
                  tab bar included: on a phone the chat is a screen, not a
                  docked panel. */}
              <TemplateAssistant
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                className={styles.assistantSheet}
                title="Boardline AI"
                askLine="Ask about campaigns, channels, spend, or performance"
                suggestions={CHAT_SUGGESTIONS}
                replies={CHAT_REPLIES}
                fallback={CHAT_FALLBACK}
                disclaimer="A mock assistant with canned answers over this screen's numbers."
              />
            </div>

            <div className={styles.homeBar} aria-hidden="true">
              <span className={styles.homeIndicator} />
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        className={styles.menuDrawer}
        title="Boardline"
        side="left"
        size="sm"
        footer={
          <div className={styles.drawerFooter}>
            <div className={styles.profile}>
              <Avatar name="Mara Esmer" size="md" />
              <span className={styles.profileText}>
                <span className={styles.profileName}>Mara Esmer</span>
                <span className={styles.profileEmail}>mara@boardline.app</span>
              </span>
            </div>
            <div className={styles.drawerSwitchers}>
              <Link href="/templates" className={styles.logo}>
                <BrandMark size={24} />
                <span className={styles.logoText}>{BRAND_NAME}</span>
                <span className={styles.srOnly}>, back to templates</span>
              </Link>
              <SidebarSwitchers />
            </div>
          </div>
        }
      >
        <NavList
          items={MENU}
          currentHref="#marketing"
          onNavigate={(_, event) => {
            event.preventDefault();
            setMenuOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
}
