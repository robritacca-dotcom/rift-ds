import { GA_ID } from "@/config/brand.generated";

/**
 * The site's own analytics events, and the one place they are sent from.
 *
 * Google Analytics counts reading on its own (page views, scrolling, outbound
 * clicks, downloads). What it cannot see is the moment a visitor stops
 * reading about the system and takes it, and after the first launch post
 * (2026-10-23) that was the one question the report could not answer: a
 * four-times day with no way to tell a reader from an installer. These four
 * events are that moment: an install snippet copied, the agent starter copied
 * or downloaded, a component's markdown copied for an agent, and the chat
 * opened. Which of them count as key events is set in GA's admin by hand;
 * nothing here decides that.
 *
 * Rules, held by scripts/validate-analytics-events.mjs:
 *  - `SITE_EVENTS` is the table of names. A call site passes a member of it,
 *    never a string, so a renamed event cannot leave a stale name behind, and
 *    every member has at least one caller.
 *  - `trackEvent` is the only caller of `gtag` outside the layout's snippet.
 *    Without the snippet (GA_ID empty, the script blocked, a server render)
 *    it does nothing, so a page never depends on analytics being there.
 *  - A parameter is a surface or a slug, never text a visitor wrote: the
 *    values here are the site's own vocabulary, and /privacy discloses them.
 */
export const SITE_EVENTS = {
  /** An install path copied: the npm line, the init bin, the shadcn command, the clone, or a component page's strip. */
  copyInstall: "copy_install",
  /** The agent starter taken: copied from the hero or get-started, saved by curl, or exported themed from the playground. */
  copyAgentStarter: "copy_agent_starter",
  /** A component's prop contract copied for an agent from its docs page. */
  copyComponentMarkdown: "copy_component_markdown",
  /** The site chat opened, whatever opened it. */
  openChat: "open_chat",
} as const;

export type SiteEvent = (typeof SITE_EVENTS)[keyof typeof SITE_EVENTS];

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sends one event to GA when the snippet is loaded, and nothing otherwise. */
export function trackEvent(name: SiteEvent, params: EventParams = {}): void {
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
