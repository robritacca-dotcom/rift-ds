"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Routes every internal plain-anchor click through the App Router.
 *
 * The design system's components (Card, EntityCard, Button-as-link…) render
 * real `<a>` tags — correct for a framework-agnostic npm package, but in
 * this app a plain anchor is a full page load, which tears down the root
 * layout and with it the chat provider: clicking an article or case-study
 * card closed an open conversation. This listener converts those clicks
 * into client-side navigations, so layout state (the chat, a stream in
 * flight) survives every internal link, not just the ones that happen to
 * use next/link.
 *
 * Deliberately conservative: primary button only, no modifier keys, same
 * origin, no target, no download, not /api, and not file-ish paths (the
 * /blueprints download links point at real .md files). Next's own <Link>
 * clicks arrive here with defaultPrevented already set and pass through.
 */
export function ClientNav() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/api/")) return;
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;

      event.preventDefault();
      router.push(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
