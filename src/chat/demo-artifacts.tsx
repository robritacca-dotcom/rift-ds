'use client';

/**
 * The demo's artifacts: the two things its script makes that want more room
 * than a turn. The dashboard is live React content, drawn through an
 * artifact renderer from the same board the welcome screen can wear, so it
 * follows the theme; the launch page is a plain HTML document, framed the
 * way a model's own output would be.
 */
import type { ChatArtifactRenderers } from './context';
import { DemoDashboardArtifact } from './demo-card-components';
import type { ChatArtifact } from './types';

/** Draws the demo's live artifact kinds. Pass to `ChatProvider`'s `artifactRenderers`. */
export const DEMO_ARTIFACT_RENDERERS: ChatArtifactRenderers = {
  'demo-dashboard': () => <DemoDashboardArtifact />,
};

export const DEMO_DASHBOARD_ARTIFACT: ChatArtifact = {
  id: 'launch-dashboard',
  title: 'Launch dashboard',
  kind: 'demo-dashboard',
  meta: 'Dashboard',
  icon: 'space_dashboard',
};

/* A whole page in one string: its own styles, no scripts, nothing fetched.
   The colours are the page's own on purpose (a framed document is somebody
   else's page, not a themed surface), but it does what a considerate page
   does and follows the reader's light or dark preference. A frame reads
   that preference from the `color-scheme` of the element that embeds it, so
   a host whose theme sets `color-scheme` gets a preview that turns with it. */
const LAUNCH_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Acme Workspaces</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; color: #14181f; background: #f6f4ef; line-height: 1.5; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; }
  .brand { font-weight: 700; letter-spacing: -0.01em; }
  nav { display: flex; gap: 20px; font-size: 14px; color: #55606e; }
  .hero { padding: 56px 32px 40px; max-width: 720px; }
  .eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #7a5cff; }
  h1 { margin: 12px 0 16px; font-size: clamp(32px, 6vw, 52px); line-height: 1.05; letter-spacing: -0.03em; }
  .lede { margin: 0 0 28px; font-size: 18px; color: #414b58; max-width: 52ch; }
  .cta { display: inline-block; padding: 12px 22px; border-radius: 999px; background: #14181f; color: #fff; font-weight: 600; font-size: 15px; }
  .ghost { margin-left: 16px; font-size: 15px; font-weight: 600; color: #14181f; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; padding: 8px 32px 48px; }
  .card { padding: 20px; border-radius: 16px; background: #fff; border: 1px solid #e7e3da; }
  .card h2 { margin: 0 0 6px; font-size: 16px; }
  .card p { margin: 0; font-size: 14px; color: #55606e; }
  footer { padding: 20px 32px 32px; font-size: 13px; color: #7b8592; }
  @media (prefers-color-scheme: dark) {
    body { color: #eef0f3; background: #101216; }
    nav, .card p, footer { color: #98a1ad; }
    .eyebrow { color: #a999ff; }
    .lede { color: #c2c8d0; }
    .cta { background: #eef0f3; color: #101216; }
    .ghost { color: #eef0f3; }
    .card { background: #181b21; border-color: #2a2e36; }
  }
</style>
</head>
<body>
<header>
  <span class="brand">Acme</span>
  <nav><span>Product</span><span>Plans</span><span>Sign in</span></nav>
</header>
<section class="hero">
  <span class="eyebrow">Launching this week</span>
  <h1>One workspace for the whole team.</h1>
  <p class="lede">Shared projects, guest seats and ninety days of version history, ready the moment your team joins.</p>
  <span class="cta">Start the free trial</span><span class="ghost">See the plans</span>
</section>
<section class="grid">
  <div class="card"><h2>Shared workspaces</h2><p>Every project in one place, open to the people who need it.</p></div>
  <div class="card"><h2>Guest seats</h2><p>Bring in a client or a contractor without buying a full seat.</p></div>
  <div class="card"><h2>Version history</h2><p>Ninety days of every change, one click from restored.</p></div>
</section>
<footer>Acme is a made-up company. This page is a demo artifact.</footer>
</body>
</html>`;

export const DEMO_PAGE_ARTIFACT: ChatArtifact = {
  id: 'launch-page',
  title: 'Launch page',
  kind: 'html',
  meta: 'Web page',
  icon: 'web',
  html: LAUNCH_PAGE_HTML,
};
