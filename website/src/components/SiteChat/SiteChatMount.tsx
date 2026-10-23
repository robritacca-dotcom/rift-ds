"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ChatLauncher, useChatWidget } from "rift-ds/chat";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import { getPageSummary } from "@/data/page-summaries";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import { useSiteWidgetProps } from "./useSiteWidgetProps";
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";

/* The TLDR panel is hover-summoned, so it exists only where hover exists: a
   touch tap has no dwell to summon it with, and the synthetic mouseenter a
   tap fires would pop the panel in the way of opening the chat. The server
   snapshot is false, so the server always renders the plain FAB and the
   panel mounts after hydration on pointer devices, which is also what keeps
   the FAB immune to the server's idea of the pathname: the root route's ISR
   regeneration can see a pathname the client never would, and a summary
   rendered from it is a hydration mismatch that blanks the whole site. */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const subscribeHover = (onChange: () => void) => {
  const media = window.matchMedia(HOVER_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readHover = () => window.matchMedia(HOVER_QUERY).matches;

/**
 * The site-wide panel: the package's ChatLauncher, configured for this site.
 * The launcher owns the floating button, the docked, overlay, floating and
 * takeover forms and the host attribute on <html> (globals.css pads the page
 * beside a docked panel and hides it behind a takeover from that attribute);
 * this wrapper supplies what only the site knows: the page's TLDR for the
 * button's hover panel, the routes that carry no chrome, and the widget
 * props every host of the site chat shares (useSiteWidgetProps).
 */
export function SiteChatMount() {
  const pathname = usePathname();
  const canHover = useSyncExternalStore(subscribeHover, readHover, () => false);
  const summary = canHover ? getPageSummary(pathname) : null;
  const widget = useSiteWidgetProps();

  /* One count per opening, whatever opened it: the button, a summary chip,
     the palette's ask row or a page handing a question over. Read here,
     under the provider, so the package itself stays free of analytics. */
  const { open } = useChatWidget();
  useEffect(() => {
    if (open) trackEvent(SITE_EVENTS.openChat);
  }, [open]);

  return (
    <ChatLauncher
      label={`Ask ${ASSISTANT_NAME}`}
      hidden={CHROMELESS_ROUTES.has(pathname)}
      panelLabel="Site chat"
      summary={
        summary
          ? { title: summary.title, caption: summary.caption, text: summary.text, chips: summary.chips }
          : undefined
      }
      widget={widget}
    />
  );
}
