"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* Set by ClientNav for a click on a link marked `data-keep-scroll`, the
   exception: the next page change keeps the reader where they are. */
let keepNextScroll = false;

/* Where the reader left each page, so Back and Forward return them there:
   the browser's own restoration does not reach a page the router renders. */
const leftAt = new Map<string, number>();

/** Keep the scroll position across the next page change (a link marked `data-keep-scroll`). */
export function keepScrollOnNextNavigation() {
  keepNextScroll = true;
}

/**
 * A new page starts at its top. Next scrolls a changed route into view
 * only when the new page's first element is off screen, and under the site
 * frame it usually is not (the frame persists and the page's first node can
 * sit in view), so a reader who had scrolled down one page landed part-way
 * down the next. This makes the rule explicit: a change of pathname scrolls
 * the window to the top before paint.
 *
 * The exceptions keep their scroll: a change of search params alone (a tab,
 * a filter) never changes the pathname; a link to a `#section` is left to
 * the browser and Next, which scroll to the target; Back and Forward return
 * to where the reader left that page; and a link marked `data-keep-scroll`
 * opts out (ClientNav reads the attribute).
 */
export function NavScrollReset() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const popped = useRef(false);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    /* The window still holds the page being left at this point. */
    leftAt.set(previous.current, window.scrollY);
    previous.current = pathname;
    const wasPop = popped.current;
    const keep = keepNextScroll || window.location.hash !== "";
    keepNextScroll = false;
    popped.current = false;
    if (!wasPop && keep) return;
    const top = wasPop ? (leftAt.get(pathname) ?? 0) : 0;
    const go = () => window.scrollTo({ top, left: 0, behavior: "instant" });
    /* Once before paint, and again a frame later, after the new page's late
       layout (fonts, a hero settling) has moved it. */
    go();
    const frame = requestAnimationFrame(go);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
