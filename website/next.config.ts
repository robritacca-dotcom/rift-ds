import type { NextConfig } from "next";
import path from "path";

const worktreeRoot = path.resolve(__dirname, '..');

// The GA tag and the inline theme-bootstrap script in layout.tsx require
// 'unsafe-inline'; tighten to nonces only if those become external scripts.
// React dev mode needs eval() for its debugging features; never allowed in prod.
const scriptEval =
  process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${scriptEval} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src 'self'",
  // Same-origin only: the site may frame its own pages (the canvas board
  // pattern), and no other origin may, which is all the clickjacking
  // protection was ever for.
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // The legacy form of frame-ancestors 'self' above, for the same reason.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No page uses the camera, microphone, or geolocation; deny them outright.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an X-Powered-By response header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Preserve inbound links after IA cleanups: the /design-md and bare
  // /blueprints stub pages were retired.
  // /design-system used to redirect to /foundations after its stub was retired;
  // that redirect is gone because the path is a real page again (the DS landing).
  async redirects() {
    return [
      // The DS landing was promoted to the home page when the site became
      // the design system's own; the old URL keeps resolving.
      { source: "/design-system", destination: "/", permanent: true },
      { source: "/design-md", destination: "/blueprints/design", permanent: true },
      { source: "/blueprints", destination: "/docs", permanent: true },
      // The porting guide was unpublished from /blueprints in August 2026 and
      // its source deleted from the repo soon after. The URL was public, so
      // the redirect outlives the page: straight to /docs, matching the bare
      // /blueprints redirect above, so no chain.
      { source: "/blueprints/porting-guide", destination: "/docs", permanent: true },
      // The Customization section became the top-level /playground, and its
      // install guide moved into the Docs cluster.
      { source: "/customization", destination: "/playground", permanent: true },
      { source: "/customization/playground", destination: "/playground", permanent: true },
      { source: "/customization/get-started", destination: "/docs/get-started", permanent: true },
      // The chat bench merged into the playground as its Chat view
      // (August 2026) — one tool, one link; the old QA URL lands there.
      { source: "/robr0-gpt", destination: "/playground?view=chat", permanent: true },
    ];
  },
  // The design system arrives as a real (workspace-linked) package whose
  // exports point at TypeScript source — Next compiles it like first-party
  // code. This keeps the website on the exact import surface consumers get.
  transpilePackages: ['@robr0/design-system'],
  turbopack: {
    root: worktreeRoot,
  },
};

export default nextConfig;
