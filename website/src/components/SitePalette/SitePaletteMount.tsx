"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "rift-ds/components/CommandPalette/CommandPalette";
import type { CommandPaletteGroup } from "rift-ds/components/CommandPalette/CommandPalette";
import { componentMetadata } from "rift-ds/components/registry";
import {
  docsSidebarLinks,
  getSectionItems,
  foundationsSidebarLinks,
} from "@/config/navigation";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import { useSiteChat } from "@/components/SiteChat/ChatContext";
import { SITE_PALETTE_OPEN_EVENT } from "./palette-bus";
import styles from "./SitePalette.module.css";
import { ASSISTANT_NAME } from "@/config/brand.generated";

/* Mirrors the page rail's 959px breakpoint: desktopOnly pages (the canvas) stay
   out of the mobile IA, so the palette hides their rows below it too. */
const DESKTOP_QUERY = "(min-width: 960px)";

const subscribeDesktop = (onChange: () => void) => {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

/* Same attribute dance as ThemeToggle's handleChange — the MutationObserver
   every toggle instance holds picks the change up, so the header control
   stays in sync with a theme set from here. */
const setTheme = (value: "light" | "dark" | "system") => {
  const root = document.documentElement;
  root.setAttribute("data-theme-setting", value);
  const resolved =
    value === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : value;
  root.setAttribute("data-theme", resolved);
  localStorage.setItem("theme", value);
};

/* Icons for the docs cluster rows, keyed by href so the rows themselves
   stay derived from docsSidebarLinks. */
const DOC_ICONS: Record<string, string> = {
  "/overview": "account_tree",
  "/docs/get-started": "rocket_launch",
  "/blueprints/claude": "description",
  "/blueprints/design": "description",
  "/blueprints/content-design": "description",
  "/skills": "construction",
  "/loops": "all_inclusive",
  "/releases": "new_releases",
};

/**
 * The site-wide command palette (an experiment). Mounted once from the root
 * layout, like the chat panel, so Cmd+K works on every chrome-bearing page
 * and an open palette survives nothing (it navigates and closes).
 *
 * The resting view is the doors: top-level pages, the design system
 * cluster, and a few actions. Typing widens the pool to every component
 * and foundation page — all derived from the navigation config and the
 * component registry, never listed by hand here — plus the one exception:
 * the ask-chat row, built from the query itself, which hands the typed
 * question to the site chat.
 */
export function SitePaletteMount() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { setOpen: setChatOpen, send: sendChat } = useSiteChat();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isDesktop = useSyncExternalStore(subscribeDesktop, readDesktop, () => false);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  // The header's search button lives in a different tree (see palette-bus).
  useEffect(() => {
    const onOpenEvent = () => setOpen(true);
    window.addEventListener(SITE_PALETTE_OPEN_EVENT, onOpenEvent);
    return () => window.removeEventListener(SITE_PALETTE_OPEN_EVENT, onOpenEvent);
  }, []);

  // Close on any navigation the palette didn't drive (back button, a link
  // clicked under the docked panel) — same pattern as MegaNav.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const go = (href: string) => () => router.push(href);

    const navigation: CommandPaletteGroup = {
      label: "Navigation",
      commands: [
        {
          id: "nav-home",
          label: "Home",
          description: "The design system on one page",
          icon: "home",
          onSelect: go("/"),
        },
      ],
    };

    const designSystem: CommandPaletteGroup = {
      label: "Design system",
      commands: [
        ...getSectionItems()
          .filter((item) => isDesktop || !item.desktopOnly)
          .map((item) => ({
            id: `ds-${item.href}`,
            label: item.label,
            description: item.description,
            icon: item.icon,
            onSelect: go(item.href),
          })),
        ...docsSidebarLinks.slice(1).map((link) => ({
          id: `ds-${link.href}`,
          label: link.label,
          description: link.description,
          icon: DOC_ICONS[link.href] ?? "description",
          onSelect: go(link.href),
        })),
      ],
    };

    const actions: CommandPaletteGroup = {
      label: "Actions",
      commands: [
        {
          id: "theme-light",
          label: "Light theme",
          description: "Switch the site to light",
          icon: "light_mode",
          keywords: ["theme", "appearance", "mode"],
          onSelect: () => setTheme("light"),
        },
        {
          id: "theme-dark",
          label: "Dark theme",
          description: "Switch the site to dark",
          icon: "dark_mode",
          keywords: ["theme", "appearance", "mode"],
          onSelect: () => setTheme("dark"),
        },
        {
          id: "theme-system",
          label: "System theme",
          description: "Follow the OS setting",
          icon: "routine",
          keywords: ["theme", "appearance", "mode", "auto"],
          onSelect: () => setTheme("system"),
        },
        {
          id: "open-chat",
          label: "Ask the site chat",
          description: "Answers questions about the system",
          icon: "forum",
          keywords: ["ai", "help", "assistant"],
          onSelect: () => setChatOpen(true),
        },
      ],
    };

    // The resting view stays short; the deep collections join once a query
    // gives the built-in filter something to narrow them with.
    if (!hasQuery) return [navigation, designSystem, actions];

    // The Stripe-style escape hatch: whatever was typed can be handed to the
    // site chat as a question. The row's label IS the query, which is what
    // keeps it visible — the built-in filter matches labels against the
    // query, and a label that contains it always survives. Sits last, below
    // the concrete matches, and when nothing else matches it is the whole
    // result set: the dead-end empty state becomes an answer path.
    const askChat: CommandPaletteGroup = {
      label: `Ask ${ASSISTANT_NAME}`,
      commands: [
        {
          id: "ask-chat-query",
          label: trimmedQuery,
          description: "Get an answer from the site chat",
          // The AI-ring chip — the system's "a model answers here" signal,
          // worn as a passive badge, wearing the FAB's own face (forum +
          // the "Ask" label) so the row points at the surface it opens;
          // the chip replaces the row's leading icon rather than repeating
          // it. aria-hidden because the group heading already says it, and
          // decorative rather than the AiButton component because a real
          // button inside the option row would nest interactive controls.
          trailing: (
            <span className={styles.askChip} aria-hidden="true">
              <span
                className={`material-symbols-rounded ${styles.askChipIcon}`}
              >
                forum
              </span>
              Ask {ASSISTANT_NAME}
            </span>
          ),
          onSelect: () => {
            setChatOpen(true);
            sendChat(trimmedQuery);
          },
        },
      ],
    };

    const components: CommandPaletteGroup = {
      label: "Components",
      commands: [...componentMetadata]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((c) => ({
          id: `component-${c.slug}`,
          label: c.label,
          description: c.description,
          icon: "widgets",
          keywords: ["component", c.category],
          onSelect: go(`/components/${c.slug}`),
        })),
    };

    const foundations: CommandPaletteGroup = {
      label: "Foundations",
      commands: foundationsSidebarLinks.slice(1).map((link) => ({
        id: `foundation-${link.href}`,
        label: link.label,
        description: link.description,
        icon: "category",
        keywords: ["foundations", "tokens"],
        onSelect: go(link.href),
      })),
    };

    return [
      navigation,
      designSystem,
      components,
      foundations,
      actions,
      askChat,
    ];
  }, [hasQuery, trimmedQuery, isDesktop, router, setChatOpen, sendChat]);

  if (CHROMELESS_ROUTES.has(pathname)) return null;

  return (
    <CommandPalette
      className={styles.palette}
      open={open}
      onOpenChange={handleOpenChange}
      groups={groups}
      // Names both things the field does now that a query can be handed to
      // the chat. Still short enough for the input on a 375px phone, where
      // the longer pages-components-actions form clipped mid-word.
      placeholder="Search or ask anything"
      // Unreachable while the ask row exists (its label is the query, so it
      // matches every query) — kept as the fallback should that ever change.
      emptyMessage="No matches. Try another word."
      // The showcase page's demo binds Cmd+K itself; there the header's
      // search button still opens this one, but the hotkey stays the demo's.
      hotkey={pathname !== "/components/command-palette"}
      onSearchChange={setQuery}
    />
  );
}
