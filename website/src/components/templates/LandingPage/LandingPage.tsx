"use client";

/**
 * The landing page template: the marketing front page for Pennant, a
 * fictional payments platform, built from the design system alone. It takes
 * its shape from a large payments company's home page and keeps a fraction
 * of it: a hero with a signup, a customer strip, a bento of products, a
 * stats band, a developer split, and a closing call to action. Six sections
 * where the reference runs past twenty, because a template shows a pattern
 * once rather than repeating it.
 *
 * Composition calls, and the design.md rules behind them:
 *
 * - **The hero's scenery is the site's own ambient field**, not a field of
 *   its own: the page declares the home page's extended band with the
 *   ExtendedBackground marker, so the shared layer the root layout mounts
 *   once runs full width across the top of the document, behind the glass
 *   header, and fades into the page floor before the products. It keeps the
 *   site's conventions with it: the same tuning, the same thinner light
 *   mode, and the same retheming with every preset. The shell draws no
 *   page colour of its own, so the field shows through.
 * - **The product is shown, not described.** The mock beside the headline is
 *   a checkout built from the real controls (Input, SegmentedControl, Button)
 *   with a Widget overlapping it, and every bento tile carries a small piece
 *   of working library UI rather than an illustration. The bento is
 *   BentoTile, the library's feature tile, with its shader pair.
 * - **One job per control species** (rule 2): the hero's two calls to action
 *   are one Button pair, primary and tertiary; the header's are the same
 *   pair at compact size; the closing band repeats the hero's pair.
 * - The product mark is the shared ProductMark disc (the family's
 *   convention), and the product name follows the playground's Product name
 *   lever through useStagedProductName. The customer strip is fictional
 *   names set as text, never logos: a real company's mark would put words
 *   in its mouth.
 * - The theme switchers ride the footer, the way the sign-in screen carries
 *   them on its pane's floor: this screen has no sidebar.
 *
 * No assistant panel: a marketing page has no signed-in product to offer
 * one, the sign-in screen's reasoning. Figures are fixed values that count
 * up once on mount, with no timers, so the mock cannot drift from what it
 * renders. All data is fictional, so the route is excluded from the chat
 * corpus (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React from "react";
import { AnimatedNumber } from "rift-ds/components/AnimatedNumber/AnimatedNumber";
import { Badge } from "rift-ds/components/Badge/Badge";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { BottomNav } from "rift-ds/components/BottomNav/BottomNav";
import { Button } from "rift-ds/components/Button/Button";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import {
  CommandPalette,
  type CommandPaletteGroup,
} from "rift-ds/components/CommandPalette/CommandPalette";
import { Divider } from "rift-ds/components/Divider/Divider";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import { DropdownMenu } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { Gauge } from "rift-ds/components/Gauge/Gauge";
import { Input } from "rift-ds/components/Input/Input";
import { Meter } from "rift-ds/components/Meter/Meter";
import { NavList } from "rift-ds/components/NavList/NavList";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Stat } from "rift-ds/components/Stat/Stat";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { Widget } from "rift-ds/components/Widget/Widget";
import { ExtendedBackground } from "@/components/BlurBackground/BlurBackground";
import FadeDivider from "@/components/FadeDivider/FadeDivider";
import SidebarSwitchers from "../SidebarSwitchers/SidebarSwitchers";
import { ProductMark } from "../ProductMark/ProductMark";
import { useStagedProductName } from "../useStagedProductName";
import styles from "./LandingPage.module.css";

const PRODUCT = "Pennant";

const NAV = ["Products", "Developers", "Pricing", "Customers"];

/**
 * The phone's tab bar: four destinations, each a section of this page, with
 * search on the iOS bar's own circle beside them. A landing page has no
 * assistant, so the circle opens the command palette the header's search
 * button opens at wider widths.
 */
const TABS = [
  { key: "top", label: "Home", icon: "home" },
  { key: "products", label: "Products", icon: "grid_view" },
  { key: "developers", label: "Developers", icon: "code" },
  { key: "pricing", label: "Pricing", icon: "sell" },
];

/** A 555 number, the range set aside for fiction. */
const PHONE = "1 800 555 0134";

/**
 * The languages the header offers, each with a small flag. Flags are drawn
 * in their own fixed colours, not theme tokens: like the file-format marks,
 * recognition is their whole job, and a flag recoloured by a preset is no
 * longer the flag. Inline SVG rather than emoji, because emoji flags render
 * as two bare letters on Windows.
 */
const LANGUAGES = [
  {
    id: "en",
    label: "English",
    flag: (
      <>
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0 30 20M30 0 0 20" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
      </>
    ),
  },
  {
    id: "fr",
    label: "Français",
    flag: (
      <>
        <rect width="10" height="20" fill="#002395" />
        <rect x="10" width="10" height="20" fill="#FFFFFF" />
        <rect x="20" width="10" height="20" fill="#ED2939" />
      </>
    ),
  },
  {
    id: "de",
    label: "Deutsch",
    flag: (
      <>
        <rect width="30" height="6.67" fill="#000000" />
        <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
        <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
      </>
    ),
  },
  {
    id: "es",
    label: "Español",
    flag: (
      <>
        <rect width="30" height="20" fill="#AA151B" />
        <rect y="5" width="30" height="10" fill="#F1BF00" />
      </>
    ),
  },
  {
    id: "ja",
    label: "日本語",
    flag: (
      <>
        <rect width="30" height="20" fill="#FFFFFF" />
        <circle cx="15" cy="10" r="6" fill="#BC002D" />
      </>
    ),
  },
];

function Flag({ id }: { id: string }) {
  const lang = LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
  return (
    <svg viewBox="0 0 30 20" className={styles.flag} aria-hidden="true">
      {lang.flag}
    </svg>
  );
}

/**
 * The customer strip's fictional companies. Each gets a small glyph and its
 * own wordmark treatment so the strip reads as six brands rather than six
 * words; all are drawn in currentColor, so the strip stays one quiet tone
 * in every theme, the way a logo wall is set. None is a real company's mark.
 */
const CUSTOMERS: { name: string; style: string; glyph: React.ReactNode }[] = [
  {
    name: "Northwind",
    style: "wordUpper",
    glyph: <path d="M12 2 20 22l-8-5-8 5z" />,
  },
  {
    name: "Loomis & Park",
    style: "wordSerifish",
    glyph: (
      <>
        <circle cx="9" cy="12" r="7" fill="none" strokeWidth="2.5" />
        <circle cx="15" cy="12" r="7" fill="none" strokeWidth="2.5" />
      </>
    ),
  },
  {
    name: "Halcyon",
    style: "wordLight",
    glyph: (
      <>
        <path d="M2 18a10 10 0 0 1 20 0z" />
        <rect x="2" y="20" width="20" height="2.5" rx="1.25" />
      </>
    ),
  },
  {
    name: "Brightlane",
    style: "wordTight",
    glyph: (
      <>
        <path d="M5 22 11 2h3L8 22z" />
        <path d="M12 22 18 2h3l-6 20z" />
      </>
    ),
  },
  {
    name: "Orrery",
    style: "wordLower",
    glyph: (
      <>
        <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" strokeWidth="2" transform="rotate(-25 12 12)" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="20" cy="7.5" r="2" />
      </>
    ),
  },
  {
    name: "Tidewater",
    style: "wordWide",
    glyph: (
      <>
        <path d="M2 9c3-3 5-3 7 0s5 3 7 0 5-3 6 0" fill="none" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M2 16c3-3 5-3 7 0s5 3 7 0 5-3 6 0" fill="none" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
];

const VOLUME_TREND = [12, 14, 13, 17, 16, 19, 22, 21, 25, 24, 28, 31];

const PAYOUTS = [
  { currency: "EUR", amount: "€18,240.00", status: "positive" as const, label: "Paid" },
  { currency: "GBP", amount: "£9,615.50", status: "info" as const, label: "In transit" },
  { currency: "JPY", amount: "¥1,204,000", status: "neutral" as const, label: "Scheduled" },
];

const RISK = [
  { label: "Card testing, stolen cards", status: "error" as const, verdict: "Blocked", count: "1,206" },
  { label: "New device, country differs", status: "warning" as const, verdict: "Review", count: "214" },
  { label: "Known customer, known card", status: "positive" as const, verdict: "Approved", count: "48.3k" },
];

const STATS = [
  { value: 46, format: (n: number) => `${Math.round(n)}`, label: "Currencies supported" },
  { value: 99.99, format: (n: number) => `${n.toFixed(2)}%`, label: "Uptime, last twelve months" },
  { value: 18, format: (n: number) => `$${Math.round(n)}bn`, label: "Processed last year" },
  { value: 4, format: (n: number) => `${Math.round(n)} days`, label: "Signup to first live payment" },
];

const SNIPPET = `import { Pennant } from "@pennant/node";

const pennant = new Pennant(process.env.PENNANT_KEY);

const session = await pennant.checkout.create({
  amount: 16538,
  currency: "usd",
  methods: ["card", "bank", "wallet"],
  successUrl: "https://example.com/thanks",
});`;

const DEV_POINTS = [
  "Typed client libraries for every major language",
  "Test mode that behaves exactly like live",
  "Webhooks you can replay from the dashboard",
];

const FOOTER = [
  { heading: "Products", links: ["Payments", "Billing", "Payouts", "Risk"] },
  { heading: "Developers", links: ["Documentation", "API reference", "Status", "Changelog"] },
  { heading: "Company", links: ["About", "Customers", "Careers", "Contact"] },
];

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${styles.icon} ${className ?? ""}`} aria-hidden="true">
      {name}
    </span>
  );
}

const CONVERSION_TREND = [61, 62, 61, 63, 64, 63, 65, 66, 66, 68, 67, 69, 70, 71, 70, 72, 73, 74];
const REVENUE_TREND = [280, 292, 301, 309, 322, 330, 346, 355, 371, 384, 398, 413];

/** A figure and the trend under it, the chart the two growth tiles lead with. */
function TrendFigure({
  label,
  value,
  delta,
  data,
}: {
  label: string;
  value: string;
  delta: string;
  data: number[];
}) {
  return (
    <div className={styles.trend}>
      <div className={styles.trendHead}>
        <span className={styles.trendLabel}>{label}</span>
        <span className={styles.trendValue}>
          {value} <Badge label={delta} variant="positive" />
        </span>
      </div>
      <Sparkline
        data={data}
        variant="area"
        width={400}
        height={72}
        label={`${label}, trending up`}
        className={styles.trendChart}
      />
    </div>
  );
}

/* The four scenes take four different forms, so the bento never shows the
   same thing twice: a trend over chips, a trend over a meter, a ledger, and
   a dial. */

function PaymentsScene() {
  return (
    <div className={styles.tileStack}>
      <TrendFigure label="Checkout conversion" value="74.1%" delta="+11.8%" data={CONVERSION_TREND} />
      <div className={styles.chips}>
        {["Card", "Bank transfer", "Wallet", "Pay later", "Local methods"].map((m, i) => (
          <Chip key={m} label={m} selected={i === 0} size="compact" />
        ))}
      </div>
    </div>
  );
}

function BillingScene() {
  return (
    <div className={styles.tileStack}>
      <TrendFigure label="Recurring revenue" value="$412.8k" delta="+3.7%" data={REVENUE_TREND} />
      <Meter label="API calls this month" value={72} showValue valueText="1.44m of 2m" variant="info" size="compact" />
    </div>
  );
}

function PayoutsScene() {
  return (
    <div className={styles.ledger}>
      <span className={styles.trendLabel}>Available to pay out</span>
      <span className={styles.ledgerTotal}>$41,926.18</span>
      <ul className={styles.ledgerRows}>
        {PAYOUTS.map((p) => (
          <li key={p.currency}>
            <span className={styles.rowLead}>{p.currency}</span>
            <span className={styles.rowValue}>{p.amount}</span>
            <StatusDot variant={p.status} label={p.label} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskScene() {
  return (
    <div className={styles.risk}>
      <Gauge
        value={12}
        bare
        size={136}
        label="Risk score today"
        thresholds={[
          { value: 0, tone: "positive" },
          { value: 50, tone: "warning" },
          { value: 80, tone: "error" },
        ]}
      />
      <ul className={styles.verdicts}>
        {RISK.map((r) => (
          <li key={r.verdict}>
            <span className={styles.verdictCount}>{r.count}</span>
            <StatusDot variant={r.status} label={r.verdict} size="sm" />
            <span className={styles.verdictNote}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Product = {
  id: string;
  title: string;
  description: string;
  highlight: 1 | 2 | 3 | 4 | 5 | 6;
  wide?: boolean;
  Scene: () => React.ReactElement;
  lede: string;
  points: string[];
  factsTitle: string;
  facts: [string, string][];
  features: { icon: string; title: string; body: string }[];
};

/**
 * The bento's four products. Each tile's scene is a small piece of working
 * library UI, and its overlay restates the product at reading length: a
 * lede, what it does, the scene again at full size beside the figures, and
 * three features. Every figure is fictional.
 */
const PRODUCTS: Product[] = [
  {
    id: "payments",
    title: "Accept payments anywhere",
    description: "Cards, banks, wallets and local methods, in one checkout that adapts to the buyer.",
    highlight: 2,
    wide: true,
    Scene: PaymentsScene,
    lede: "One checkout that shows each buyer the methods they already use, in their language and currency, and retries a declined card before it becomes a lost sale.",
    points: ["Over 40 payment methods", "Hosted, embedded or fully custom", "Smart retries on soft declines"],
    factsTitle: "Checkout, last 30 days",
    facts: [
      ["Conversion", "+11.8%"],
      ["Authorisation rate", "94.2%"],
      ["Median checkout time", "38s"],
      ["Methods shown", "6 per buyer"],
    ],
    features: [
      { icon: "language", title: "Localised by default", body: "Prices, copy and methods follow the buyer's country." },
      { icon: "bolt", title: "One-click returning buyers", body: "Saved details fill the form across every merchant." },
      { icon: "point_of_sale", title: "In person too", body: "The same account runs readers at the counter." },
    ],
  },
  {
    id: "billing",
    title: "Bill any way you price",
    description: "Flat, seat or usage based, metered as it happens.",
    highlight: 4,
    Scene: BillingScene,
    lede: "Model the price you actually want to charge, from a flat plan to per-call metering, and let invoices, proration and dunning run themselves.",
    points: ["Flat, tiered, seat and usage pricing", "Proration on every plan change", "Automatic dunning and recovery"],
    factsTitle: "Subscriptions, this month",
    facts: [
      ["Recurring revenue", "$412,800"],
      ["Recovered by dunning", "$18,240"],
      ["Net revenue retention", "118%"],
      ["Invoices sent", "9,214"],
    ],
    features: [
      { icon: "speed", title: "Real-time metering", body: "Usage events land on the invoice as they happen." },
      { icon: "receipt_long", title: "Invoices that explain themselves", body: "Line items buyers can read without a support ticket." },
      { icon: "autorenew", title: "Trials and upgrades", body: "Start free, convert later, prorate in the middle." },
    ],
  },
  {
    id: "payouts",
    title: "Pay out in local currency",
    description: "Send funds to sellers and suppliers where they bank.",
    highlight: 3,
    Scene: PayoutsScene,
    lede: "Hold balances in the currencies you earn in and send them where your sellers, contractors and suppliers already bank, at a rate you see before it settles.",
    points: ["Balances in 18 currencies", "Same-day payouts in 30 countries", "Rates locked before you send"],
    factsTitle: "Payouts, this week",
    facts: [
      ["Sent", "$1.92m"],
      ["Recipients", "3,480"],
      ["On time", "99.6%"],
      ["Average FX margin", "0.4%"],
    ],
    features: [
      { icon: "account_balance", title: "Local rails", body: "Funds move on each country's own bank network." },
      { icon: "verified_user", title: "Onboarding built in", body: "Collect and verify recipient details in one flow." },
      { icon: "schedule_send", title: "Scheduled or instant", body: "Pay daily, weekly, or the moment a sale clears." },
    ],
  },
  {
    id: "risk",
    title: "Stop fraud before it lands",
    description: "Every payment is scored in milliseconds, and you set the rules.",
    highlight: 1,
    wide: true,
    Scene: RiskScene,
    lede: "Every payment is scored against signals from the whole network before it is authorised. Block the obvious, review the doubtful, and let good customers straight through.",
    points: ["Scores every payment in under 100ms", "Rules you write in plain conditions", "Evidence packs for every dispute"],
    factsTitle: "Risk, last 30 days",
    facts: [
      ["Fraud rate", "0.03%"],
      ["Blocked", "1,206 payments"],
      ["Sent to review", "214"],
      ["Disputes won", "71%"],
    ],
    features: [
      { icon: "rule", title: "Your rules, first", body: "Write conditions on amount, country, device or history." },
      { icon: "fact_check", title: "A review queue", body: "Doubtful payments wait for a person, with the reasons." },
      { icon: "gavel", title: "Disputes handled", body: "Evidence is gathered and submitted for you." },
    ],
  },
];

function ProductDetail({ item }: { item: Product }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div className={styles.detailIntro}>
          <p className={styles.detailLede}>{item.lede}</p>
          <div className={styles.detailCtas}>
            <Button variant="primary" label="Start now" iconRight="arrow_forward" />
            <Button variant="secondary" label="Read the docs" />
          </div>
        </div>
        <ul className={styles.points}>
          {item.points.map((p) => (
            <li key={p}>
              <Icon name="check_circle" className={styles.pointIcon} />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.showcase}>
        <div className={styles.showMain} inert>
          <item.Scene />
        </div>
        <div className={styles.showSide}>
          <p className={styles.sideTitle}>{item.factsTitle}</p>
          <dl className={styles.facts}>
            {item.facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <ul className={styles.features}>
        {item.features.map((f) => (
          <li key={f.title}>
            <Icon name={f.icon} className={styles.featureIcon} />
            <strong>{f.title}</strong>
            <span>{f.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Checkout() {
  const [method, setMethod] = React.useState("card");
  return (
    <div className={styles.checkout} aria-label="Example checkout" role="group">
      <div className={styles.checkoutHead}>
        <span className={styles.checkoutMerchant}>
          <span className={styles.merchantMark} aria-hidden="true">
            <Icon name="local_cafe" />
          </span>
          Ember Roasters
        </span>
        <Badge label="Test mode" variant="warning" />
      </div>
      <dl className={styles.lines}>
        <div>
          <dt>Pour-over kettle</dt>
          <dd>$150.00</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>$15.38</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>$165.38</dd>
        </div>
      </dl>
      <Divider spacing="none" />
      <Input label="Email" placeholder="you@example.com" iconLeft="mail" size="compact" />
      <SegmentedControl
        aria-label="Payment method"
        size="compact"
        fullWidth
        value={method}
        onValueChange={setMethod}
        segments={[
          { value: "card", label: "Card", icon: "credit_card" },
          { value: "bank", label: "Bank", icon: "account_balance" },
          { value: "wallet", label: "Wallet", icon: "wallet" },
        ]}
      />
      <Input
        aria-label={method === "card" ? "Card number" : "Account"}
        placeholder={method === "card" ? "1234 1234 1234 1234" : method === "bank" ? "Choose your bank" : "Continue in your wallet"}
        iconLeft={method === "card" ? "credit_card" : method === "bank" ? "account_balance" : "wallet"}
        size="compact"
      />
      <Button variant="primary" label="Pay $165.38" iconLeft="lock" />
    </div>
  );
}

export default function LandingPage() {
  const product = useStagedProductName(PRODUCT);
  const [languageId, setLanguageId] = React.useState("en");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [tab, setTab] = React.useState("top");
  const language = LANGUAGES.find((l) => l.id === languageId) ?? LANGUAGES[0];

  /* Every command jumps to its section or does what the header would, so
     the palette is a second way through the same page, not a list of
     destinations that go nowhere. */
  const jump = (id: string) => () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const paletteGroups: CommandPaletteGroup[] = [
    {
      label: "Products",
      commands: PRODUCTS.map((p) => ({
        id: p.id,
        label: p.title,
        description: p.description,
        icon: { payments: "credit_card", billing: "receipt_long", payouts: "account_balance", risk: "shield" }[p.id],
        onSelect: jump("products"),
      })),
    },
    {
      label: "Developers",
      commands: [
        { id: "docs", label: "Documentation", icon: "menu_book", onSelect: jump("developers") },
        { id: "api", label: "API reference", icon: "data_object", keywords: ["endpoints"], onSelect: jump("developers") },
        { id: "status", label: "System status", icon: "monitor_heart", onSelect: jump("developers") },
      ],
    },
    {
      label: "Account",
      commands: [
        { id: "pricing", label: "Pricing", icon: "sell", onSelect: jump("pricing") },
        { id: "sales", label: "Talk to sales", icon: "call", keywords: ["phone", "contact"], onSelect: jump("pricing") },
        ...LANGUAGES.filter((l) => l.id !== languageId).map((l) => ({
          id: `lang-${l.id}`,
          label: `Switch to ${l.label}`,
          icon: <Flag id={l.id} />,
          keywords: ["language"],
          onSelect: () => setLanguageId(l.id),
        })),
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <ExtendedBackground />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* The dashboards' pattern: under the full layout, the menu sits
              top left, before the brand, and opens a drawer from that edge. */}
          <CircularButton
            icon="menu"
            variant="tertiary"
            size="compact"
            ariaLabel="Open menu"
            tooltip={false}
            onClick={() => setMenuOpen(true)}
            className={styles.menuButton}
          />
          <a href="#top" className={styles.brand}>
            <ProductMark />
            <span>{product}</span>
          </a>
          <nav aria-label="Main" className={styles.nav}>
            {NAV.map((item) => (
              <Button key={item} label={item} href={`#${item.toLowerCase()}`} variant="tertiary" size="compact" />
            ))}
          </nav>
          <div className={styles.headerActions}>
            <Button
              label={PHONE}
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              variant="tertiary"
              size="compact"
              iconLeft="call"
              className={styles.phone}
            />
            <DropdownMenu
              align="end"
              size="compact"
              trigger={
                <Button
                  label={language.label}
                  aria-label={`Language: ${language.label}`}
                  variant="tertiary"
                  size="compact"
                  iconLeft={<Flag id={language.id} />}
                  iconRight="expand_more"
                  className={styles.language}
                />
              }
              items={LANGUAGES.map((l) => ({
                label: l.label,
                icon: <Flag id={l.id} />,
                selected: l.id === language.id,
                onClick: () => setLanguageId(l.id),
              }))}
            />
            <CircularButton
              icon="search"
              variant="tertiary"
              size="compact"
              ariaLabel="Search"
              tooltip="Search (⌘K)"
              onClick={() => setPaletteOpen(true)}
              className={styles.headerSearch}
            />
            <Button label="Sign in" variant="tertiary" size="compact" iconLeft="account_circle" className={styles.signIn} />
            <Button label="Start now" variant="primary" size="compact" iconRight="arrow_forward" />
          </div>
        </div>
      </header>

      {/* The nav links, the phone number and the account actions, in a
          drawer from the left, the edge the menu button sits on; the theme
          switchers ride its footer, as on the mobile dashboard. */}
      <Drawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={product}
        side="left"
        size="sm"
        footer={
          <div className={styles.drawerFooter}>
            <div className={styles.drawerActions}>
              <Button label="Sign in" variant="secondary" iconLeft="account_circle" />
              <Button label="Start now" variant="primary" iconRight="arrow_forward" />
            </div>
            <SidebarSwitchers />
          </div>
        }
      >
        <NavList
          items={NAV.map((item) => ({ label: item, href: `#${item.toLowerCase()}` }))}
          onNavigate={() => setMenuOpen(false)}
        />
        <Divider spacing="md" />
        <Button
          label={PHONE}
          href={`tel:${PHONE.replace(/\s/g, "")}`}
          variant="tertiary"
          iconLeft="call"
        />
      </Drawer>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        groups={paletteGroups}
        placeholder={`Search ${product}`}
      />

      <main id="top" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <StatusDot variant="positive" pulse decorative />
              <span>
                <AnimatedNumber value={48213907} format={usd} /> processed today
              </span>
            </p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Payments that grow with every customer you add.
            </h1>
            <p className={styles.heroLede}>
              Take payments, run subscriptions and pay out in {STATS[0].value} currencies from one
              account, from your first sale to your millionth.
            </p>
            <form className={styles.signup} onSubmit={(e) => e.preventDefault()}>
              <Input aria-label="Work email" placeholder="Work email" iconLeft="mail" className={styles.signupInput} />
              <Button variant="primary" label="Start now" iconRight="arrow_forward" />
            </form>
          </div>

          <div className={styles.heroStage}>
            {/* The checkout and the Today widget are one pair: the widget is
                placed against the checkout, not the stage, so it keeps the
                same overlap at every width and the pair centres as one. */}
            <div className={styles.mock}>
              <Checkout />
              <Widget title="Today" className={styles.todayWidget}>
                <div className={styles.today}>
                  <span className={styles.todayValue}>
                    <AnimatedNumber value={48213} format={usd} />
                  </span>
                  <Badge label="+12.4%" variant="positive" />
                </div>
                <Sparkline data={VOLUME_TREND} variant="area" width={220} height={48} label="Volume today, trending up" className={styles.spark} />
              </Widget>
            </div>
          </div>
        </section>

        <FadeDivider />
        <section className={styles.customers} aria-label="Customers">
          <ul className={styles.customerList}>
            {CUSTOMERS.map((c) => (
              <li key={c.name} className={`${styles.customer} ${styles[c.style]}`}>
                <svg viewBox="0 0 24 24" className={styles.customerGlyph} fill="currentColor" stroke="currentColor" strokeWidth="0" aria-hidden="true">
                  {c.glyph}
                </svg>
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <FadeDivider />

        <section id="products" className={styles.section} aria-labelledby="products-title">
          <div className={styles.sectionHead}>
            <h2 id="products-title" className={styles.sectionTitle}>
              One account for how money moves.
            </h2>
            <p className={styles.sectionLede}>
              Each product works on its own and better together, on the same customer and ledger.
            </p>
          </div>
          <div className={styles.bento}>
            {PRODUCTS.map((item) => (
              <BentoTile
                key={item.id}
                title={item.title}
                description={item.description}
                headingLevel={3}
                highlight={item.highlight}
                align="end"
                className={item.wide ? styles.tileWide : undefined}
                expandedContent={<ProductDetail item={item} />}
              >
                <item.Scene />
              </BentoTile>
            ))}
          </div>
        </section>

        <FadeDivider className={styles.statsRule} />
        <section className={styles.stats} aria-label={`${product} in numbers`}>
          {STATS.map((s) => (
            <Stat key={s.label} value={<AnimatedNumber value={s.value} format={s.format} />} label={s.label} size="large" />
          ))}
        </section>

        <FadeDivider />

        <section id="developers" className={`${styles.section} ${styles.devSplit}`} aria-labelledby="dev-title">
          <div className={styles.devCopy}>
            <p className={styles.eyebrow}>Developers</p>
            <h2 id="dev-title" className={styles.sectionTitle}>
              Live in an afternoon, not a quarter.
            </h2>
            <p className={styles.sectionLede}>
              A checkout in a dozen lines, and an API that stays the same shape as you add products.
            </p>
            <ul className={styles.points}>
              {DEV_POINTS.map((p) => (
                <li key={p}>
                  <Icon name="check_circle" className={styles.pointIcon} />
                  {p}
                </li>
              ))}
            </ul>
            <Button variant="secondary" label="Read the docs" iconRight="arrow_forward" />
          </div>
          <CodeBlock code={SNIPPET} language="ts" filename="checkout.ts" className={styles.code} />
        </section>

        <section id="pricing" className={styles.cta} aria-labelledby="cta-title">
          <h2 id="cta-title" className={styles.sectionTitle}>
            Ready when your first customer is.
          </h2>
          <p className={styles.sectionLede}>
            No setup fees and no monthly minimum. Pay per successful payment, and talk to us when the volume
            calls for a custom rate.
          </p>
          <div className={styles.ctaActions}>
            <Button variant="primary" label="Start now" iconRight="arrow_forward" />
            <Button variant="tertiary" label="Talk to sales" iconRight="arrow_forward" />
          </div>
        </section>
      </main>

      <div className={styles.tabBar}>
        <BottomNav
          platform="ios"
          items={TABS}
          activeKey={tab}
          onValueChange={(key) => {
            setTab(key);
            jump(key)();
          }}
          search={{ label: "Search", icon: "search", onClick: () => setPaletteOpen(true) }}
          aria-label={product}
        />
      </div>

      <FadeDivider />
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brand}>
              <ProductMark />
              <span>{product}</span>
            </span>
            <p className={styles.legal}>{product} is a fictional product, built from the design system alone.</p>
            <SidebarSwitchers />
          </div>
          {FOOTER.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className={styles.footerCol}>
              <span className={styles.footerHeading}>{col.heading}</span>
              {col.links.map((l) => (
                <a key={l} href="#top">
                  {l}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </footer>
    </div>
  );
}
