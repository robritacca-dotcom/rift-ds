"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NAV_START_EVENT } from "./nav-events";
import styles from "./NavProgress.module.css";

/**
 * The navigation progress bar: a thin line across the top of the window
 * from the moment a navigation starts until the next page shows.
 *
 * A client-side navigation holds the old page on screen until the new one
 * is ready, which on a heavy page is long enough to read as a click that
 * did nothing. The bar is the answer the click gets at once.
 *
 * It starts on the event `instrumentation-client.ts` fires and finishes
 * when the route (path or query) has changed, which is the commit of the
 * new page. The state is written straight onto the element, never held in
 * React: the bar must move while React is busy rendering the page it is
 * waiting for, and its motion is CSS on the compositor for the same reason.
 * Decorative, so hidden from assistive technology; the route announcer
 * already speaks the new page's title.
 */
function NavProgressBar() {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? "";
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onStart = () => {
      const bar = barRef.current;
      if (!bar) return;
      // Restart from the left when a second navigation interrupts the first.
      bar.removeAttribute("data-state");
      void bar.offsetWidth;
      bar.setAttribute("data-state", "loading");
    };
    window.addEventListener(NAV_START_EVENT, onStart);
    return () => window.removeEventListener(NAV_START_EVENT, onStart);
  }, []);

  // The route changed: the new page is on screen.
  useEffect(() => {
    const bar = barRef.current;
    if (bar?.getAttribute("data-state") === "loading") bar.setAttribute("data-state", "done");
  }, [pathname, search]);

  return <div ref={barRef} className={styles.bar} aria-hidden="true" />;
}

export function NavProgress() {
  // useSearchParams suspends a prerendered page; the bar has nothing to
  // show until a navigation anyway.
  return (
    <Suspense fallback={null}>
      <NavProgressBar />
    </Suspense>
  );
}
