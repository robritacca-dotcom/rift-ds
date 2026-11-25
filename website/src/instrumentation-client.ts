/**
 * Tells the page a client-side navigation has started.
 *
 * The App Router changes the URL only when the next page is ready to show,
 * so between a click and that moment nothing on screen moves. This hook is
 * the one place every navigation passes through as it starts (a link, a
 * `router.push`, back and forward), so it announces the start as a window
 * event and NavProgress draws the bar from it. Nothing is measured, stored
 * or sent anywhere.
 */
import { NAV_START_EVENT } from "@/components/NavProgress/nav-events";

export function onRouterTransitionStart(url: string) {
  try {
    const next = new URL(url, window.location.href);
    // A jump within the page (a hash link, the page's own link) shows at
    // once and never changes the route, so no bar would ever be finished.
    if (next.pathname === window.location.pathname && next.search === window.location.search) return;
    window.dispatchEvent(new Event(NAV_START_EVENT));
  } catch {
    // An unreadable URL draws no bar; the navigation itself is untouched.
  }
}
