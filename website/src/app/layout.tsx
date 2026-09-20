import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@robr0/design-system/tokens/tokens.css";
// Every generated data-brand preset theme (src/tokens/presets/): with the
// bundle loaded site-wide, setting data-brand="<id>" on <html> rethemes
// every page immediately, light and dark, with zero runtime JS.
import "@robr0/design-system/tokens/presets/presets.css";
// Single source of the Material Symbols base styles and icon-size scale.
// Imported explicitly rather than relying on it arriving incidentally through
// a component import, so pages that use raw .material-symbols-rounded spans
// (e.g. /foundations/icons) are styled deterministically.
import "@robr0/design-system/fonts/material-symbols.css";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { buildDesignSystemJsonLd, buildWebsiteJsonLd, SITE_URL } from "@/lib/structuredData";
import { BRAND_NAME, GA_ID, TITLE_SUFFIX } from "@/config/brand.generated";
import { SiteChatProvider } from "@/components/SiteChat/ChatContext";
import { SiteChatMount } from "@/components/SiteChat/SiteChatMount";
import { SitePaletteMount } from "@/components/SitePalette/SitePaletteMount";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { SiteFooterMount } from "@/components/SiteFooter/SiteFooterMount";
import SiteAnchorRail from "@/components/FloatingAnchorNav/SiteAnchorRail";
import { ClientNav } from "@/components/ClientNav/ClientNav";
import BlurBackground from "@/components/BlurBackground/BlurBackground";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-nunito-sans",
});

// Kept under 160 characters so search results render it whole.
const SITE_DESCRIPTION = `${BRAND_NAME}: a free, open source React design system for AI products. Tokens, components, themes and templates, published to npm and enforced by the build.`;

const SITE_TITLE = `${BRAND_NAME} · An open source, AI-ready React design system`;

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${TITLE_SUFFIX}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  // No root `alternates.canonical` — it would be inherited by every page,
  // canonicalising the whole site to the homepage. Each page sets its own
  // canonical (via pageMetadata/sectionMetadata or an explicit alternates
  // block); pages that set none self-canonicalise to their own URL.
  keywords: [
    BRAND_NAME,
    "design system",
    "design tokens",
    "React components",
    "component library",
    "open source design system",
    "MCP",
  ],
  authors: [{ name: "Robert Ritacca" }],
  creator: "Robert Ritacca",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: BRAND_NAME,
    locale: "en_US",
    type: "website",
    // og:image (and the Twitter image) come from the file-convention
    // opengraph-image.tsx routes — the root one plus per-section overrides —
    // so every page gets a branded 1200×630 card, not one static Thumbnail.
  },
  twitter: {
    // Card type only, inherited by every page. No title/description here:
    // Twitter falls back to each page's og:title/og:description, so pages get
    // their own card text instead of inheriting the homepage's.
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The software keyboard shrinks the layout viewport rather than covering
  // it, so 100dvh surfaces (the phone chat takeover) end above the keys.
  // Android Chrome honours this; Safari ignores it, and the phone takeover
  // is built not to need it (SiteChat.module.css).
  interactiveWidget: "resizes-content",
  // Matches the white-floor UI: pure white in light, near-black in dark.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

const themeScript = `
(function() {
  var root = document.documentElement;
  var saved = localStorage.getItem('theme');
  var setting = saved === 'light' || saved === 'dark' ? saved : 'system';
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  root.setAttribute('data-theme-setting', setting);
  root.setAttribute('data-theme', setting === 'system' ? (media.matches ? 'dark' : 'light') : setting);
  media.addEventListener('change', function (event) {
    if (root.getAttribute('data-theme-setting') === 'system') {
      root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
    }
  });
  /* The visitor's theme pick (the hero's dot row) rides the same pre-paint
     path as light/dark: the stored brand replaces the server's mono default
     before first render, so a returning visitor never flashes the wrong
     theme. "default" means the Dragonspine-original look (attribute off);
     storage being unavailable (private mode) leaves the shipped mono. */
  try {
    var brand = localStorage.getItem('brand');
    if (brand === 'default') root.removeAttribute('data-brand');
    else if (brand) root.setAttribute('data-brand', brand);
  } catch (e) {}
  /* An attribute, deliberately not a class: React owns <html>'s className
     (the next/font variable class), so a hydration failure's client
     re-render rewrites it — a ready *class* gets wiped and the site stays
     visibility:hidden forever. React never touches attributes it does not
     render, so the ready mark survives any hydration fallback. */
  root.setAttribute('data-theme-ready', '');
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The next/font variable class lives on <html>, not <body>: globals.css
  // feeds var(--font-nunito-sans) into the design system's
  // --font-family-primary token at :root, and a custom property resolves its
  // var() references on the element that declares it — on <body> the variable
  // would be invisible to :root and the token would go invalid.
  return (
    // The shipped landing look is the black & white preset, served from its
    // generated stylesheet: data-brand="mono" on the server-rendered html.
    // Every theme dot swaps this attribute; the Dragonspine-original dot
    // removes it (falling back to the raw token files).
    <html
      lang="en"
      data-brand="mono"
      data-theme="dark"
      data-theme-setting="system"
      className={nunitoSans.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols is served from the design system's own bundled
            @font-face (src/fonts/material-symbols.css, imported above) — the
            woff2 is emitted into the build, so the font was being shipped twice.

            The Google Fonts <link> that used to sit here is deliberately gone.
            Besides the duplicate request, that stylesheet ships its own
            `.material-symbols-rounded { font-size: 24px }` rule, which tied on
            specificity with the design system's token-driven sizing and — being
            a <link> in <head> — won, pinning every icon to 24px regardless of
            --icon-size. Re-adding it would silently break the icon-size scale.

            Nunito Sans comes from next/font/google, which self-hosts at build
            time, so no preconnect to fonts.googleapis.com is needed either. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDesignSystemJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
        />
        {/* Analytics is off until GA_ID has a value (the brand module ships
            it empty until the product's own GA4 property exists). */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        {/* Must run before first paint (html stays visibility:hidden until
            data-theme-ready lands). Emitted as raw HTML in a hidden div, not a React
            <script> element: parser-inserted scripts still execute, while
            React-rendered ones are inert on client render and trigger a dev
            warning ("Encountered a script tag while rendering…"). */}
        <div
          hidden
          dangerouslySetInnerHTML={{ __html: `<script>${themeScript}</script>` }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/* Site chrome, mounted once for the same reason the chat provider is:
            the root layout never remounts on client-side navigation. That is
            load-bearing here rather than tidy. Rendered per page, every route
            change destroyed the canvas and with it the GL context, forcing a
            fresh context, shader compile, link and reveal fade on every
            navigation — a context cannot outlive the canvas it was created
            from. Mounted here it is built once per session and navigation
            costs nothing. Pages that want the full-viewport variant say so
            with FullBleedBackground; see globals.css. */}
        <BlurBackground />
        {/* The chat provider lives here because the root layout never
            remounts on client-side navigation: the transcript, a stream in
            flight, and the draft all survive route changes. The panel mounts
            after {children} so it sits last in the tab order. */}
        <SiteChatProvider>
          {/* Internal plain-anchor clicks become client-side navigations, so
              the providers above (and an open chat) survive card links. */}
          <ClientNav />
          {children}
          {/* The footer is site chrome, mounted once here rather than per
              page. The chat panel stays after it, last in the tab order. */}
          <SiteFooterMount>
            <SiteFooter />
          </SiteFooterMount>
          {/* The floating on-this-page nav: reads each page's h2 headings
              after navigation, gated by src/config/anchor-nav.ts. */}
          <SiteAnchorRail />
          <SiteChatMount />
          {/* The global command palette (an experiment): mounted once beside
              the chat, so Cmd+K and the header's search button work on every
              chrome-bearing page. Inside the chat provider because the
              palette both opens the panel and can hand it a typed query as
              a question (the ask row's send). */}
          <SitePaletteMount />
        </SiteChatProvider>
      </body>
    </html>
  );
}
