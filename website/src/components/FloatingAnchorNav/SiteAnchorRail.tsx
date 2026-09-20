"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AnchorNavItem } from "@robr0/design-system/components/AnchorNav/AnchorNav";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import {
  ANCHOR_NAV_EXCLUDED_ROUTES,
  ANCHOR_NAV_SELF_MANAGED_ROUTES,
} from "@/config/anchor-nav";
import FloatingAnchorNav from "./FloatingAnchorNav";

/* The site-wide floating anchor nav, mounted once from the root layout.
   After each navigation it reads the page's h2 headings out of
   #main-content and renders the rail when there are enough to be worth
   navigating — so every content page gets one with no per-page wiring,
   and a page with one section gets none.

   Discovery rules:
   - Headings inside an <aside> are rail furniture (case-study details,
     article links), not sections of the document — skipped.
   - Headings inside [data-anchor-ignore] are skipped: the marker for
     showcase demos of heading-bearing components, whose h2s belong to
     the demo, not the page.
   - A heading's anchor is its own id, else its enclosing section's id
     (pages with hand-placed anchors keep their deep-linkable targets),
     else a slug assigned from its text — those exist client-side only,
     which is fine for on-page wayfinding.
   The matching scroll landing comes from the global scroll-margin rule
   on main h2 in globals.css. */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const MIN_ITEMS = 2;

export default function SiteAnchorRail() {
  const pathname = usePathname();
  const [items, setItems] = useState<AnchorNavItem[]>([]);

  useEffect(() => {
    const gated =
      CHROMELESS_ROUTES.has(pathname) ||
      ANCHOR_NAV_EXCLUDED_ROUTES.has(pathname) ||
      ANCHOR_NAV_SELF_MANAGED_ROUTES.has(pathname);
    const main = gated ? null : document.getElementById("main-content");

    const scan = () => {
      const used = new Set<string>();
      const found: AnchorNavItem[] = [];
      for (const heading of main?.querySelectorAll("h2") ?? []) {
        if (heading.closest("aside, [data-anchor-ignore]")) continue;
        const label = (heading.textContent ?? "").trim();
        if (!label) continue;

        let id = heading.id;
        if (!id) {
          const section = heading.closest("section[id]");
          if (section) id = section.id;
        }
        if (!id) {
          const base = slugify(label) || "section";
          id = base;
          let n = 2;
          while (used.has(id) || document.getElementById(id)) id = `${base}-${n++}`;
          heading.id = id;
        }
        if (used.has(id)) continue;
        used.add(id);
        found.push({ id, label });
      }

      setItems((prev) => {
        const next = found.length >= MIN_ITEMS ? found : [];
        const same =
          prev.length === next.length &&
          prev.every((p, i) => p.id === next[i].id && p.label === next[i].label);
        return same ? prev : next;
      });
    };

    // The page's headings only exist in the DOM after render, so the first
    // read has to live in an effect; the no-change guard above stops any
    // cascade beyond the one render that mounts the rail
    scan();
    if (!main) return;
    // Streamed or late-hydrating content lands after the first pass;
    // re-scan is idempotent (assigned ids are found again, not re-made)
    const observer = new MutationObserver(scan);
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  if (items.length === 0) return null;
  return <FloatingAnchorNav items={items} />;
}
