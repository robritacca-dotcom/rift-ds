'use client';

import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { handleLayerEscape, useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useFoldedSections } from '../../behaviors/useFoldedSections';
import { useScrollLock } from '../../behaviors/useScrollLock';
import { BREAKPOINT_MOBILE_PX, BREAKPOINT_TABLET_PX, mediaAbove, mediaBelow } from '../../tokens/breakpoints';
import { Avatar } from '../Avatar/Avatar';
import { Kbd } from '../Kbd/Kbd';
import type { Shortcut, ShortcutKeyLabels } from '../../behaviors/shortcut-keys';
import { PixelAvatar, distinctPixelInks } from '../PixelAvatar/PixelAvatar';
import type { PixelInk } from '../PixelAvatar/PixelAvatar';
import { SubNavPanel } from '../SubNavPanel/SubNavPanel';
import { warnOnce } from '../../behaviors/devWarning';
import { MOTION_SCROLL_SETTLE_MS } from '../../tokens/motion';
import { DrillMenu, type DrillMenuEntry, type DrillMenuItem } from '../DrillMenu/DrillMenu';
import type { SubNavPanelItem } from '../SubNavPanel/SubNavPanel';
import { Tooltip } from '../Tooltip/Tooltip';
import '../../behaviors/shell.css';
import './AppSidebar.css';
import '../../behaviors/direction.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/* ============================================
   TYPES
   ============================================ */

export interface AppSidebarSubItem {
  /** Unique key for this sub-item */
  key: string;
  /** Display label */
  label: string;
  /** Click handler — also fires on a link sub-item, so a consumer can route client-side */
  onClick?: () => void;
  /** Renders the sub-item as a real link to this URL instead of a button. Ignored when the sub-item has children, whose row opens them */
  href?: string;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */
  badge?: string | number;
  /** A second line under the label, shown where the sub-item is listed in the side panel and the phone drawer */
  description?: string;
  /** Icon before the label in the side panel and the phone drawer: a Material Symbol name or a custom element, such as a swatch */
  icon?: string | React.ReactNode;
  /** In a list of choices (a setting's options), whether this one is chosen: true carries the chosen mark in the side panel and the phone drawer. Picking a choice is an action, so the panel and the drawer stay open */
  selected?: boolean;
  /** Group heading this entry sits under when it is listed in the panel (see `subNav`); ignored in the accordion */
  group?: string;
  /**
   * The next level down. With `subNav="accordion"` a sub-item's children are
   * level 3 and open in the side panel; with `subNav="panel"` they are the
   * panel's own accordion. Navigation stops at three levels, so deeper
   * children are not rendered.
   */
  children?: AppSidebarSubItem[];
}

export interface AppSidebarItem {
  /** Unique key for this item */
  key: string;
  /** Item icon — Material Symbol name (string) or custom element (ReactNode). Optional only when `pixelAvatar` draws the mark instead */
  icon?: string | React.ReactNode;
  /**
   * Draws a generated PixelAvatar in the icon seat instead of `icon`, for
   * rows that name a thing rather than a place — projects, workspaces,
   * accounts. `true` seeds the character from `label`; a string seeds it
   * from that value, so a renamed item can keep its character by passing a
   * stable id. The sidebar spreads the inks across all of its avatar rows,
   * so neighbours differ in colour as well as shape. The character is
   * decorative: the label beside it is the name
   */
  pixelAvatar?: boolean | string;
  /** Display label (shown when expanded) */
  label: string;
  /** Click handler — also fires on a link item, so a consumer can route client-side */
  onClick?: () => void;
  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */
  href?: string;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours and, while the rail is collapsed, rides the icon's corner; a word stays a quiet pill, hidden while collapsed */
  badge?: string | number;
  /** The setting's current value at the row's trailing end while expanded, such as "Dark" on a row whose sub-items are a setting's choices */
  value?: string;
  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav="panel"` */
  children?: AppSidebarSubItem[];
  /** A keyboard hint at the row's end while expanded, in the shortcut grammar (`mod+shift+o`), drawn in the reader's platform legends. Decorative: bind the action with `useShortcut` */
  keys?: Shortcut;
}

/** What a section's `content` function is told about where it is drawn. */
export interface AppSidebarSectionContext {
  /** Whether the rail is expanded (the drawer always is). */
  expanded: boolean;
  /** Whether it is drawn in the drawer rather than on the rail. */
  drawer: boolean;
  /** Closes the drawer, for content whose rows are destinations. Does nothing on the rail. */
  closeDrawer: () => void;
}

/** A button in a section's heading, such as a project list's add. */
export interface AppSidebarSectionAction {
  /** Its accessible name, and the row's text in the drawer. */
  label: string;
  /** A Material Symbol name. Defaults to `add`. */
  icon?: string;
  /** What pressing it does. */
  onClick: () => void;
}

export interface AppSidebarSection {
  /** The heading above the group. Optional for a single section and for the first; with more than one, give the rest their heading, so every group the gaps set apart is named. A section with `content` may name its own groups instead */
  category?: string;
  /** Nav items in this section. Pass an empty list for a section that is all `content` */
  items: AppSidebarItem[];
  /** Stable identity for the section's fold state, the key `collapsedSections` lists. Defaults to `category`; set it when the heading is translated or may change, or two headings share their text */
  id?: string;
  /**
   * The section's own content after its rows, for a rail whose content is
   * more than destinations (a chat's history). On the expanded rail it sits
   * under the section's fold, at the rail's expanded width; the collapsed
   * rail, which has no room for it, folds it away; in the drawer it follows
   * the section's rows on the first level. A function is told where it is
   * drawn, so its rows can close the drawer.
   */
  content?: React.ReactNode | ((context: AppSidebarSectionContext) => React.ReactNode);
  /** A button in the section's heading on the expanded rail, and a row after the section's rows in the drawer, such as a project list's add */
  action?: AppSidebarSectionAction;
}

export interface AppSidebarProfile {
  /** User display name */
  name: string;
  /** The quiet second line under the name, usually the email. Left empty, the row shows the name alone */
  email?: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** A mark of its own in the avatar's place, such as a generated avatar; wins over `avatarUrl` */
  avatar?: React.ReactNode;
}

/** How the rail decides between its rail and drawer forms. */
export type AppSidebarResponsive = 'viewport' | 'container' | 'rail' | 'drawer';

/** The three app shell modes, how the rail meets the page: edge to edge behind a hairline, floating as a card, or flush beside a raised inset surface. */
export type AppSidebarLayout = 'flush' | 'floating' | 'inset';

/** Props owned by AppSidebar itself — everything else falls through to the `<nav>`. */
type AppSidebarOwnProps = {
  /** Navigation sections */
  sections: AppSidebarSection[];
  /**
   * Let the reader fold each titled section under its heading: the heading
   * becomes a toggle with a chevron, and the section's rows glide shut
   * beneath it. Every section starts open. A section is known by its
   * `id`, or its `category` when it has none, the key the fold state lists. The collapsed rail and the
   * phone drawer show every row whatever is folded, since neither shows
   * the headings.
   * @default false
   */
  collapsibleSections?: boolean;
  /** Controlled list of folded sections, by each section's `id` (its `category` when it has none). Needs `collapsibleSections`. */
  collapsedSections?: string[];
  /** Sections folded at first (uncontrolled), by `id` (else `category`). Needs `collapsibleSections`. */
  defaultCollapsedSections?: string[];
  /** Fires with the full new list of folded sections whenever a heading is pressed, in both controlled and uncontrolled modes. */
  onCollapsedSectionsChange?: (collapsedSections: string[]) => void;
  /** Profile data for the bottom section */
  profile?: AppSidebarProfile;
  /** Key of the currently active item. When one of its children is the current page (`activeSubKey` or `activeTertiaryKey`), that child carries `aria-current` instead, and this row drops its fill while the child shows below it. */
  activeKey?: string;
  /** Key of the currently active sub-item */
  activeSubKey?: string;
  /** Key of the currently active third-level item, listed in the side panel */
  activeTertiaryKey?: string;
  /**
   * Where an item's sub-items show. `panel` (the default) opens a top-level
   * item's sub-items straight into the side panel, with their children as
   * the panel's accordion, and the collapsed rail shows each label under its
   * icon. `accordion` opens them under the row instead, and a sub-item's own
   * children open in a side panel as level 3. On small screens both modes
   * drill in inside the drawer instead.
   * @default 'panel'
   */
  subNav?: 'accordion' | 'panel';
  /** Whether the side panel starts open when there is one to show */
  defaultPanelOpen?: boolean;
  /** Controlled open state of the side panel */
  panelOpen?: boolean;
  /** Called when the side panel opens or collapses */
  onPanelOpenChange?: (open: boolean) => void;
  /** Whether sidebar starts expanded */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expand/collapse changes */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Whether the reader can collapse the rail. `false` keeps it expanded: no
   * toggle, and a click on the rail opens nothing.
   * @default true
   */
  collapsible?: boolean;
  /**
   * How the rail decides between its rail and its drawer form. `viewport`
   * (the default) follows the window: the rail folds on entering the tablet
   * band and turns into the drawer at the mobile breakpoint. `container`
   * does the same by the width of the rail's parent, for a rail inside a
   * framed host. `rail` and `drawer` leave the decision to the host, which
   * measures its own room (a chat does, at its own widths). Every value but
   * `viewport` needs `fixed={false}`: the drawer then covers the parent, not
   * the page, and holds no page scroll lock.
   * @default 'viewport'
   */
  responsive?: AppSidebarResponsive;
  /** Controlled open state of the drawer form */
  drawerOpen?: boolean;
  /** Whether the drawer form starts open (uncontrolled) */
  defaultDrawerOpen?: boolean;
  /** Called when the drawer opens or closes, including every close of its own: the scrim, the close button, Escape, a destination row, and growing back into the rail form */
  onDrawerOpenChange?: (open: boolean) => void;
  /**
   * Fold the rail to its icon form when the side panel opens and its parent
   * has too little room for the expanded rail, the panel and a readable
   * column beside them: under 1000px (the 280px rail, the 240px panel and a
   * 480px column). For a rail in a narrow host, such as a chat.
   * @default false
   */
  foldForPanel?: boolean;
  /** Replaces any legend an item's `keys` hint is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard */
  keyLabels?: ShortcutKeyLabels;
  /** Callback when profile more button clicked */
  onProfileMore?: () => void;
  /**
   * How the rail meets the page, one of the three app shell modes. `flush`
   * runs it edge to edge on the shell colour behind a hairline divider,
   * nothing raised. `floating` floats it off the viewport edges as a glass card:
   * inset with rounded corners, the translucent glass fill over a backdrop
   * blur, and the floating shadow (the inset defaults to 20px and is
   * overridable via the --ds-sidebar-float-inset custom property). `inset`
   * runs it flush on the app shell colour, beside a raised content surface
   * inset from the edges, as AppLayout's `inset` layout draws it. Inside a
   * host that marks itself a shell (AppLayout, a chat or template page), the
   * rail reads that host's mode from the shell recipe. Defaults to
   * `inset` (or `floating` while the deprecated `floating` is set).
   * @default 'inset'
   */
  layout?: AppSidebarLayout;
  /**
   * Floats the rail as a glass card, the same as `layout="floating"`.
   * @deprecated Use `layout="floating"`.
   */
  floating?: boolean;
  /**
   * Pin the rail to the viewport. `true` (the default) fixes it to the
   * viewport's start edge at the viewport's height, with the side panel and
   * the phone drawer fixed beside it, as a full-page app wants. `false`
   * lays it out in its parent instead, for a framed preview or a layout that
   * is not the whole page: the parent is a flex row with a definite height,
   * the rail is its first item at the parent's height (sticky, so it holds
   * while the parent scrolls), and the content beside it gives way as the
   * rail expands and the side panel opens. On a phone the trigger, the scrim
   * and the drawer stay inside the parent too.
   */
  fixed?: boolean;
  /** Rendered under the logo row, above the nav; fades out while collapsed */
  topSlot?: React.ReactNode;
  /** Keeps `topSlot` shown while collapsed instead of fading it, clipped by the sweeping rail as the nav rows are, for content that draws its own collapsed form: a switcher that holds its mark on the rail's axis and fades the rest. The slot carries `data-expanded`, so its content can key off the rail's state */
  persistentTopSlot?: boolean;
  /** Rendered above the profile block; fades out while collapsed */
  footerSlot?: React.ReactNode;
  /**
   * Rows above the sections in the phone drawer, in DrillMenu's shape, such
   * as a switcher that drills into its choices. When set, the drawer shows
   * these in `topSlot`'s place, since a dropdown has no room to open on a
   * full-screen menu.
   */
  drawerTopEntries?: DrillMenuEntry[];
  /**
   * Rows after the sections in the phone drawer, in DrillMenu's shape, such
   * as appearance settings that drill into their choices. When set, the
   * drawer shows these in `footerSlot`'s place.
   */
  drawerBottomEntries?: DrillMenuEntry[];
  /**
   * One primary action at the rail's foot, below the profile and full width,
   * as the site header's drawer pins its call to action: in the expanded
   * rail and the phone drawer alike, where it stays in view while the
   * levels above it scroll. The collapsed rail has no room for it, so it
   * fades out with the labels and is inert.
   */
  footerAction?: React.ReactNode;
  /** Rendered above the profile block while the rail is collapsed, in `footerSlot`'s place: the same controls at their smallest, such as a SegmentedControl's or ThemeToggle's `cycle` circle, stacked and centred on the rail's axis. The two forms share one cell and crossfade with the rail, and whichever is hidden is inert */
  collapsedFooterSlot?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** Logo element — defaults to the built-in brand mark */
  logo?: React.ReactNode;
  /** Text shown next to logo when expanded */
  logoText?: string;
  /**
   * Below the mobile breakpoint the rail hides and this fixed hamburger
   * button opens it as an overlay drawer instead. Set false when the
   * host renders its own trigger in the page chrome.
   */
  showMobileTrigger?: boolean;
  /** Accessible name of the mobile hamburger trigger that opens the drawer */
  openLabel?: string;
  /** Accessible name of the toggle when it closes the mobile drawer */
  closeLabel?: string;
  /** Accessible name of the toggle (and the collapsed logo) when it expands the rail */
  expandLabel?: string;
  /** Accessible name of the toggle when it collapses the rail */
  collapseLabel?: string;
  /** Accessible name of the profile block's more button */
  profileMoreLabel?: string;
  /**
   * The phone drawer's menu: the accessible name of its navigation, and what
   * the back row says on every second level
   */
  menuLabel?: string;
  /**
   * The phone drawer's back row's accessible name, given the title of the level it
   * returns to, for a site in another language. The drill menu's own default.
   */
  drawerBackLabel?: (title: string) => string;
  /**
   * The text of the overview row a drilled level opens with when its row has
   * a page of its own, given that row's label, for a site in another
   * language. The drill menu's own default.
   */
  drawerOverviewLabel?: (label: string) => string;
};

export interface AppSidebarProps
  extends AppSidebarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof AppSidebarOwnProps | 'children'> {}

/** The room a parent needs to keep the rail expanded beside an open side
    panel (`foldForPanel`): the expanded rail (280), the panel (240) and a
    readable column (480). */
const FOLD_FOR_PANEL_ROOM = 280 + 240 + 480;

/** A badge that is a count (`3`, `"12"`, `"99+"`), which takes the count
    badge pair; a word such as "New" keeps the quiet pill. */
function isCount(badge: string | number) {
  return typeof badge === 'number' || /^\d+\+?$/.test(badge.trim());
}

/* ============================================
   INLINE LOGO SVG
   ============================================ */
function DefaultLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* The brand mark — a column with two outer spikes — in currentColor
          so it follows the sidebar's own text colour through both themes.
          Hand-mirrored from website/src/config/brand-mark.ts; the library
          cannot import from the website, so a change there moves here. */}
      <path d="M12 1.5 V22.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 7 V12 L2 16.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 7 V12 L22 16.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================
   COMPONENT
   ============================================ */

/**
 * AppSidebar — a collapsible left-hand navigation rail.
 *
 * **Collapsed** (64 px): icon-only buttons, logo mark, avatar.
 * **Expanded** (280 px): labels, category headings, accordion
 * sub-items with tree-line connectors, and a profile section.
 * A third level opens in a `SubNavPanel` beside the rail (see `subNav`).
 *
 * The forwarded ref and any unrecognised props target the `<nav>` (the rail,
 * and the drawer on small screens). The landmark is labelled "App
 * navigation" by default; pass `aria-label` to name it differently. A
 * passed `id` replaces the generated one, and the mobile trigger's
 * `aria-controls` follows it.
 */
export const AppSidebar = React.forwardRef<HTMLElement, AppSidebarProps>(function AppSidebar({
  sections,
  collapsibleSections = false,
  collapsedSections,
  defaultCollapsedSections,
  onCollapsedSectionsChange,
  profile,
  activeKey,
  activeSubKey,
  activeTertiaryKey,
  subNav = 'panel',
  defaultPanelOpen = true,
  panelOpen: controlledPanelOpen,
  onPanelOpenChange,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  collapsible = true,
  responsive = 'viewport',
  drawerOpen: controlledDrawerOpen,
  defaultDrawerOpen = false,
  onDrawerOpenChange,
  foldForPanel = false,
  keyLabels,
  onProfileMore,
  layout: layoutProp,
  floating: floatingProp = false,
  fixed = true,
  topSlot,
  persistentTopSlot = false,
  footerSlot,
  drawerTopEntries,
  drawerBottomEntries,
  footerAction,
  collapsedFooterSlot,
  className = '',
  logo,
  logoText = 'Rift',
  showMobileTrigger = true,
  openLabel = 'Open navigation',
  closeLabel = 'Close navigation',
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
  profileMoreLabel = 'Profile options',
  menuLabel = 'Menu',
  drawerBackLabel = (title) => `Back to ${title}`,
  drawerOverviewLabel = (label) => `${label} overview`,
  linkComponent,
  ...rest
}, ref) {
  const baseClass = 'ds-app-sidebar';
  // The deprecated boolean still floats the rail when no layout is given.
  const layout: AppSidebarLayout = layoutProp ?? (floatingProp ? 'floating' : 'inset');
  const floating = layout === 'floating';
  const contained = !fixed;
  const Link = useLinkComponent(linkComponent);
  // A gap between groups always carries a heading naming the group, in
  // the rail and in the phone drawer alike. The first section may lead
  // unnamed (a chat's New chat row), and a section with content names its
  // own groups.
  if (sections.length > 1 && sections.some((section, index) => index > 0 && !section.category && !section.content)) {
    warnOnce('AppSidebar: with more than one section, give each after the first a `category`, so every group the gaps set apart is named.');
  }
  const sized = responsive !== 'viewport';
  if (sized && fixed) {
    warnOnce('AppSidebar: `responsive` other than "viewport" needs `fixed={false}`: the drawer form covers the rail\'s parent.');
  }

  /* The avatar rows' inks, spread across the whole sidebar so neighbours
     differ in colour as well as shape. */
  const avatarSeed = (item: AppSidebarItem) =>
    typeof item.pixelAvatar === 'string' ? item.pixelAvatar : item.label;
  const avatarItems = sections.flatMap((section) =>
    section.items.filter((item) => item.pixelAvatar),
  );
  const avatarInks = new Map<string, PixelInk>();
  distinctPixelInks(avatarItems.map(avatarSeed)).forEach((ink, index) => {
    avatarInks.set(avatarItems[index].key, ink);
  });

  /* Expand / collapse */
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  // A rail the reader cannot collapse is always expanded.
  const isExpanded = collapsible ? (controlledExpanded ?? internalExpanded) : true;
  const onExpandedChangeRef = useRef(onExpandedChange);
  useEffect(() => {
    onExpandedChangeRef.current = onExpandedChange;
  }, [onExpandedChange]);

  const toggleExpanded = useCallback(() => {
    const next = !isExpanded;
    setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, onExpandedChange]);

  /* Tablet band (769-959px): the expanded rail is a third of the
     viewport, so entering the band folds it to the icon rail once —
     through the same path a click takes, so controlled hosts hear it.
     Deliberately entry-only: the visitor can re-expand by hand. A rail
     sized by its container or its host folds by that room instead (the
     container measure below), never by the window. */
  useEffect(() => {
    if (responsive !== 'viewport') return;
    const band = window.matchMedia(`${mediaAbove(BREAKPOINT_MOBILE_PX)} and ${mediaBelow(BREAKPOINT_TABLET_PX)}`);
    const onChange = () => {
      if (band.matches) {
        setInternalExpanded(false);
        onExpandedChangeRef.current?.(false);
      }
    };
    onChange();
    band.addEventListener('change', onChange);
    return () => band.removeEventListener('change', onChange);
  }, [responsive]);

  /* Mobile drawer: below the breakpoint the rail is hidden and the
     trigger opens it as a modal overlay, on the shared behavior layer
     like every other overlay (dismissal stack, focus trap, scroll
     lock). The trigger is CSS-gated to the mobile media query, so the
     overlay can only ever activate there; crossing back up while open
     closes it, or the scroll lock would outlive the drawer. */
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(defaultDrawerOpen);
  const drawerOpenState = controlledDrawerOpen ?? internalDrawerOpen;
  const onDrawerOpenChangeRef = useRef(onDrawerOpenChange);
  useEffect(() => {
    onDrawerOpenChangeRef.current = onDrawerOpenChange;
  }, [onDrawerOpenChange]);
  /* Every open and close goes through here, so a controlled host hears
     the drawer's own closes too. */
  const setMobileOpen = useCallback(
    (next: boolean) => {
      setInternalDrawerOpen(next);
      if (next !== drawerOpenState) onDrawerOpenChange?.(next);
    },
    [drawerOpenState, onDrawerOpenChange],
  );

  /* The rail's form. By the window, CSS decides (the media blocks), so the
     first paint never flashes the wrong one. By the container, the parent's
     width is measured against the same breakpoints, and entering the
     tablet band folds the rail once, as the window does. By the host, it
     says. */
  const [containerForm, setContainerForm] = useState<'rail' | 'drawer'>('rail');
  const form: 'rail' | 'drawer' | null =
    responsive === 'rail' ? 'rail' : responsive === 'drawer' ? 'drawer' : responsive === 'container' ? containerForm : null;
  // The rail form has no drawer to show, so an open one waits unseen.
  const mobileOpen = drawerOpenState && form !== 'rail';
  /* The toggle's one name, spoken and shown: closing the drawer on a phone,
     otherwise collapsing or expanding the rail. */
  const toggleLabel = mobileOpen ? closeLabel : isExpanded ? collapseLabel : expandLabel;
  const drawerRef = useRef<HTMLElement | null>(null);
  /* The top block scrolls when the rows outgrow the rail (a long nav, or a
     roomier theme's taller rows), and fades out at whichever end has more
     past it, so the last row meets a fade rather than a hard cut against
     the profile. The edges are written straight to the DOM, so a scroll
     re-renders nothing (SideNav's scrollable rule). */
  const topRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const edges = () => {
      const max = top.scrollHeight - top.clientHeight;
      top.toggleAttribute('data-fade-start', top.scrollTop > 1);
      top.toggleAttribute('data-fade-end', top.scrollTop < max - 1);
    };
    /* The scrollbar stays out of sight until the rail scrolls (SideNav's
       rule): a scroll marks it, and the mark clears once it settles. */
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      edges();
      top.setAttribute('data-scrolling', '');
      clearTimeout(settle);
      settle = setTimeout(() => top.removeAttribute('data-scrolling'), MOTION_SCROLL_SETTLE_MS);
    };
    edges();
    top.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(edges);
    resize.observe(top);
    for (const child of Array.from(top.children)) resize.observe(child);
    return () => {
      top.removeEventListener('scroll', onScroll);
      clearTimeout(settle);
      resize.disconnect();
    };
  }, []);
  /** Keep the internal ref (focus trap, drill focus) while honouring a forwarded one. */
  const setDrawerRef = (node: HTMLElement | null) => {
    drawerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  const generatedDrawerId = useId();
  // The trigger's aria-controls points here, so a consumer id must replace
  // the generated one rather than be overwritten by it.
  const drawerId = rest.id ?? generatedDrawerId;
  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);
  const layer = useLayer({ open: mobileOpen, onDismiss: closeMobile });
  useFocusScope(drawerRef, { active: mobileOpen });
  // A drawer over its parent leaves the page free to scroll.
  useScrollLock(mobileOpen && !sized);
  useEffect(() => {
    if (responsive !== 'container') return;
    const parent = drawerRef.current?.parentElement;
    if (!parent) return;
    let band = false;
    const measure = () => {
      const width = parent.clientWidth;
      const next = width <= BREAKPOINT_MOBILE_PX ? 'drawer' : 'rail';
      setContainerForm(next);
      /* Growing back into the rail form closes the drawer, and says so. */
      if (next === 'rail') {
        setInternalDrawerOpen((open) => {
          if (open) onDrawerOpenChangeRef.current?.(false);
          return false;
        });
      }
      const inBand = width > BREAKPOINT_MOBILE_PX && width < BREAKPOINT_TABLET_PX;
      if (inBand && !band) {
        setInternalExpanded(false);
        onExpandedChangeRef.current?.(false);
      }
      band = inBand;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [responsive]);
  useEffect(() => {
    if (!mobileOpen || sized) return;
    const query = window.matchMedia(mediaAbove(BREAKPOINT_MOBILE_PX));
    const onChange = () => {
      if (query.matches) setMobileOpen(false);
    };
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mobileOpen, sized, setMobileOpen]);

  /* Accordion open keys. The accordion holding the current page starts
     open, so a three-level path is visible from the first render. */
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (subNav !== 'panel' && (activeSubKey || activeTertiaryKey)) {
      for (const section of sections) {
        for (const item of section.items) {
          const holdsActive = item.children?.some(
            (sub) =>
              sub.key === activeSubKey ||
              sub.children?.some((leaf) => leaf.key === activeTertiaryKey),
          );
          if (holdsActive) initial.add(item.key);
        }
      }
    }
    return initial;
  });

  const toggleAccordion = useCallback((key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /* ---- Side panel (the level below the accordion, or the whole
     second level when subNav is 'panel') ----
     The panel's source is the row whose children it lists: a sub-item in
     accordion mode, a top-level item in panel mode. It starts on the row
     holding the current page, and a click on any row with children moves
     it there. */
  const isPanelMode = subNav === 'panel';
  const [panelSourceKey, setPanelSourceKey] = useState<string | undefined>(() => {
    for (const section of sections) {
      for (const item of section.items) {
        if (isPanelMode) {
          if (
            item.children?.length &&
            (item.key === activeKey || item.children.some((c) => c.key === activeSubKey))
          ) {
            return item.key;
          }
        } else {
          for (const sub of item.children ?? []) {
            if (
              sub.children?.length &&
              (sub.key === activeSubKey || sub.children.some((c) => c.key === activeTertiaryKey))
            ) {
              return sub.key;
            }
          }
        }
      }
    }
    return undefined;
  });

  /* Resolve the source to what the panel shows. Accordion mode passes the
     sub-item's children without their own children: three levels is the
     cap, so a fourth never renders. */
  let panelSource: { label: string; parentLabel?: string; items: SubNavPanelItem[] } | undefined;
  for (const section of sections) {
    for (const item of section.items) {
      if (isPanelMode && item.key === panelSourceKey && item.children?.length) {
        panelSource = { label: item.label, items: item.children };
      }
      if (!isPanelMode) {
        for (const sub of item.children ?? []) {
          if (sub.key === panelSourceKey && sub.children?.length) {
            panelSource = {
              label: sub.label,
              parentLabel: item.label,
              items: sub.children.map(({ children: _deeper, ...leaf }) => leaf),
            };
          }
        }
      }
    }
  }

  const [internalPanelOpen, setInternalPanelOpen] = useState(defaultPanelOpen);
  const isPanelOpen = controlledPanelOpen ?? internalPanelOpen;
  const setPanelOpen = useCallback(
    (next: boolean) => {
      setInternalPanelOpen(next);
      if (next !== isPanelOpen) onPanelOpenChange?.(next);
    },
    [isPanelOpen, onPanelOpenChange],
  );
  const panelVisible = Boolean(panelSource) && isPanelOpen;
  const panelId = useId();

  /* In a narrow host the expanded rail and the side panel together would
     leave the column beside them too little room, so opening the panel
     folds the rail to its icon form (through the same path a click takes).
     Room is the parent's width against the expanded rail, the panel and
     a readable column. */
  useEffect(() => {
    if (!foldForPanel || !panelVisible || !isExpanded || mobileOpen) return;
    const parent = drawerRef.current?.parentElement;
    if (!parent) return;
    if (parent.clientWidth < FOLD_FOR_PANEL_ROOM) {
      setInternalExpanded(false);
      onExpandedChangeRef.current?.(false);
    }
  }, [foldForPanel, panelVisible, isExpanded, mobileOpen]);

  /* The phone drawer draws its own levels (a DrillMenu, below), so opening
     it only flips the flag. */
  const openMobile = useCallback(() => setMobileOpen(true), [setMobileOpen]);

  /** A row with children that feeds the panel was pressed. */
  const selectPanelSource = useCallback(
    (key: string) => {
      if (key === panelSourceKey && isPanelOpen) {
        setPanelOpen(false);
      } else {
        setPanelSourceKey(key);
        setPanelOpen(true);
      }
    },
    [panelSourceKey, isPanelOpen, setPanelOpen],
  );

  /* Collapsed, the whole rail is an expand target (ThreadPanel's rule): a
     click on its dead space opens it, while the rows, the logo, the slots'
     controls and an open menu inside the rail keep their own jobs. Only
     attached while it can fire, so the host's own handler runs alone the
     rest of the time. */
  /* The phone drawer is a DrillMenu: the sections as its first level, a
     row with children drilling into them (both subNav modes), a sub-item
     with children one level further, the panel's groups as headed
     sections, and the host's drawer entries before and after. A row with
     an href is a link; one without is an action that closes the drawer
     once its onClick has run, since in an app a row is a destination. It
     opens on the level that holds the current page. */
  const drawerClicks = new Map<string, (() => void) | undefined>();
  const sectionContent = (section: AppSidebarSection, context: AppSidebarSectionContext) =>
    typeof section.content === 'function' ? section.content(context) : section.content;
  const subEntries = (subs: AppSidebarSubItem[], deeper: boolean): DrillMenuEntry[] => {
    const entries: DrillMenuEntry[] = [];
    for (const sub of subs) {
      const row = subRow(sub, deeper);
      const last = entries[entries.length - 1];
      if (sub.group) {
        if (last && 'type' in last && last.label === sub.group) last.items.push(row);
        else entries.push({ type: 'section', id: `group-${sub.group}`, label: sub.group, items: [row] });
      } else entries.push(row);
    }
    return entries;
  };
  const subRow = (sub: AppSidebarSubItem, deeper: boolean): DrillMenuItem => {
    drawerClicks.set(sub.key, sub.onClick);
    return {
      id: sub.key,
      label: sub.label,
      badge: sub.badge,
      description: sub.description,
      icon: sub.icon,
      current: sub.key === activeSubKey || sub.key === activeTertiaryKey || undefined,
      ...(deeper && sub.children?.length
        ? { items: subEntries(sub.children, false) }
        : sub.href
          ? { href: sub.href }
          : sub.selected !== undefined
            ? // A choice: it applies where it is, and the drawer stays on its level.
              { selected: sub.selected, onClick: () => sub.onClick?.() }
            : { onClick: () => { sub.onClick?.(); closeMobile(); } }),
    };
  };
  const itemRow = (item: AppSidebarItem): DrillMenuItem => {
    drawerClicks.set(item.key, item.onClick);
    return {
      id: item.key,
      label: item.label,
      badge: item.badge,
      icon: item.pixelAvatar ? (
        <span className={`${baseClass}__drawer-avatar`}>
          <PixelAvatar name={avatarSeed(item)} ink={avatarInks.get(item.key)} />
        </span>
      ) : (
        item.icon
      ),
      value: item.value,
      current: item.key === activeKey || undefined,
      ...(item.children?.length
        ? { items: subEntries(item.children, true) }
        : item.href
          ? { href: item.href }
          : { onClick: () => { item.onClick?.(); closeMobile(); } }),
    };
  };
  const drawerStack: DrillMenuEntry[] = mobileOpen
    ? [
        ...(drawerTopEntries ?? []),
        ...sections.map((section, si) => ({
          type: 'section' as const,
          id: `section-${si}`,
          label: section.category,
          items: [
            ...section.items.map(itemRow),
            // The heading's action, as a row after the section's own.
            ...(section.action
              ? [{
                  id: `section-${si}-action`,
                  label: section.action.label,
                  icon: section.action.icon ?? 'add',
                  onClick: section.action.onClick,
                }]
              : []),
          ],
          content: sectionContent(section, { expanded: true, drawer: true, closeDrawer: closeMobile }),
        })),
        ...(drawerBottomEntries ?? []),
      ]
    : [];
  let drawerPath: string[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      for (const sub of item.children ?? []) {
        if (sub.key === activeSubKey) drawerPath = [item.key];
        if (sub.children?.some((leaf) => leaf.key === activeTertiaryKey))
          drawerPath = sub.children.length && !isPanelMode ? [item.key, sub.key] : [item.key];
      }
    }
  }

  const showExpanded = isExpanded || mobileOpen;
  /* Sections fold only where their headings show: the expanded rail. */
  const sectionsId = useId();
  const { isFolded, toggle: toggleSection } = useFoldedSections({
    collapsed: collapsedSections,
    defaultCollapsed: defaultCollapsedSections,
    onChange: onCollapsedSectionsChange,
  });
  const foldsSections = collapsibleSections && isExpanded && !mobileOpen;
  const expandOnClick = !showExpanded && collapsible
    ? (event: React.MouseEvent<HTMLElement>) => {
        rest.onClick?.(event);
        if (event.defaultPrevented) return;
        // A portalled overlay's press bubbles here through React without being
        // inside the rail, and a control only counts when it is inside it too:
        // a tabindex on the rail or an ancestor must not stop every click.
        const rail = event.currentTarget;
        const target = event.target as Element;
        if (!rail.contains(target)) return;
        const control = target.closest('button, a, input, select, textarea, label, [tabindex], [role="button"], [role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]');
        if (control && control !== rail && rail.contains(control)) return;
        toggleExpanded();
      }
    : undefined;

  const classes = [
    baseClass,
    // The drawer always shows the expanded layout: an icon rail inside
    // a modal overlay would be all cost and no labels.
    isExpanded || mobileOpen ? `${baseClass}--expanded` : '',
    collapsibleSections ? `${baseClass}--collapsible-sections` : '',
    floating ? `${baseClass}--floating` : '',
    layout === 'inset' ? `${baseClass}--inset` : '',
    contained ? `${baseClass}--contained` : '',
    sized ? `${baseClass}--sized` : '',
    form ? `${baseClass}--${form}-form` : '',
    mobileOpen ? `${baseClass}--mobile-open` : '',
    isPanelMode ? `${baseClass}--panel-mode` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {showMobileTrigger && (
        <button
          type="button"
          className={[
            `${baseClass}__mobile-trigger`,
            contained ? `${baseClass}__mobile-trigger--contained` : '',
            sized ? `${baseClass}__mobile-trigger--sized` : '',
            form === 'drawer' ? `${baseClass}__mobile-trigger--drawer-form` : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={openLabel}
          aria-expanded={mobileOpen}
          aria-controls={drawerId}
          onClick={openMobile}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            menu
          </span>
        </button>
      )}
      {mobileOpen && (
        <div className={`${baseClass}__scrim${contained ? ` ${baseClass}__scrim--contained` : ''}${sized ? ` ${baseClass}__scrim--sized` : ''}`} onClick={() => layer.ownsPress() && closeMobile()} aria-hidden="true" />
      )}
    <nav
      aria-label="App navigation"
      {...rest}
      ref={setDrawerRef}
      id={drawerId}
      className={classes}
      onClick={expandOnClick ?? rest.onClick}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event);
        /* While the drawer is open, Escape goes to the layer stack here,
           before it can bubble to a host that closes on Escape (a docked
           chat panel): the topmost layer (a tooltip over the drawer, or the
           drawer) is dismissed and the key marked handled. */
        if (mobileOpen && !event.defaultPrevented) {
          handleLayerEscape(event.nativeEvent);
          /* React's event keeps its own flag, which a host's onKeyDown
             reads: mark it handled there too. */
          if (event.nativeEvent.defaultPrevented) event.preventDefault();
        }
      }}
    >
      {/* ---- TOP ---- */}
      <div ref={topRef} className={`${baseClass}__top`}>
        {/* Logo */}
        <div className={`${baseClass}__logo`}>
          <div
            className={`${baseClass}__logo-inner`}
            onClick={!isExpanded && collapsible ? toggleExpanded : undefined}
            role={!isExpanded ? 'button' : undefined}
            tabIndex={!isExpanded ? 0 : undefined}
            aria-label={!isExpanded ? expandLabel : undefined}
            onKeyDown={!isExpanded ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(); } } : undefined}
            style={!isExpanded ? { cursor: 'pointer' } : undefined}
          >
            <span className={`${baseClass}__logo-icon`}>
              {logo || <DefaultLogo />}
            </span>
            <span className={`${baseClass}__logo-text`}>{logoText}</span>
          </div>
          {/* In the mobile drawer the rail has nothing to collapse to, so
              the same button becomes the drawer's close control. Driven by
              `mobileOpen` rather than a media query: the flag can only be
              true below the breakpoint, so the two never disagree. */}
          {/* The tooltip names the control as ThreadPanel's toggle does, so
              every rail's collapse reads the same; it opens toward the
              rail's interior, where there is room for it. */}
          {(collapsible || mobileOpen) && (
          <Tooltip content={toggleLabel} position="start" className={`${baseClass}__toggle-tip`}>
            <button
              className={`${baseClass}__toggle`}
              onClick={mobileOpen ? closeMobile : toggleExpanded}
              aria-label={toggleLabel}
            >
              <span className="material-symbols-rounded ds-mirror-rtl">
                {mobileOpen ? 'close' : isExpanded ? 'left_panel_close' : 'left_panel_open'}
              </span>
            </button>
          </Tooltip>
          )}
        </div>

        {/* Consumer slot under the logo row; hidden while collapsed, it is
            inert, unless it persists and draws its own collapsed form */}
        {topSlot && !(mobileOpen && drawerTopEntries) && (
          <div
            className={[
              `${baseClass}__top-slot`,
              persistentTopSlot ? `${baseClass}__top-slot--persistent` : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-expanded={showExpanded}
            inert={!showExpanded && !persistentTopSlot}
          >
            {topSlot}
          </div>
        )}

        {/* The phone drawer: every level as a DrillMenu */}
        {mobileOpen ? (
          <DrillMenu
            className={`${baseClass}__drawer-stack`}
            items={drawerStack}
            defaultPath={drawerPath}
            rootLabel={menuLabel}
            backLabel={drawerBackLabel}
            overviewLabel={drawerOverviewLabel}
            navLabel={menuLabel}
            linkComponent={Link}
            onNavigate={(item) => {
              if (item.id) drawerClicks.get(item.id)?.();
              closeMobile();
            }}
          />
        ) : (
        <div className={`${baseClass}__sections`}>
        {/* Nav sections */}
        {sections.map((section, si) => {
          /* The fold state's key: the section's id, else its heading. */
          const foldKey = section.id ?? section.category;
          return (
          <div key={si} className={`${baseClass}__nav${section.content && section.items.length === 0 ? ` ${baseClass}__nav--content-only` : ''}`}>
            {(section.category || section.action) && (
            <div className={`${baseClass}__heading`}>
            {section.category && (
              <div className={`${baseClass}__category`} id={`${sectionsId}-heading-${si}`}>
                {section.category}
              </div>
            )}
            {/* The fold is the chevron alone, named by the heading, so the
                heading keeps its seat on the icon line and only the chevron
                answers the pointer. */}
            {section.category && foldsSections && foldKey && (
              <button
                type="button"
                className={`${baseClass}__fold`}
                aria-expanded={!isFolded(foldKey)}
                aria-controls={`${sectionsId}-section-${si}`}
                aria-labelledby={`${sectionsId}-heading-${si}`}
                onClick={() => toggleSection(foldKey)}
              >
                <span className={`${baseClass}__fold-chevron material-symbols-rounded`} aria-hidden="true">
                  expand_more
                </span>
              </button>
            )}
            {section.action && (
              <button
                type="button"
                className={`${baseClass}__section-action`}
                aria-label={section.action.label}
                onClick={section.action.onClick}
                inert={!isExpanded}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  {section.action.icon ?? 'add'}
                </span>
              </button>
            )}
            </div>
            )}

            {/* The section's rows, in a panel that glides shut when the
                heading folds it (SideNav's grid-rows fold). Without
                `collapsibleSections`, or while the headings are hidden (the
                collapsed rail), it stays open and adds nothing. */}
            <div
              id={`${sectionsId}-section-${si}`}
              className={`${baseClass}__section-panel ${
                section.category && foldsSections && foldKey && isFolded(foldKey) ? '' : `${baseClass}__section-panel--open`
              }`}
              inert={Boolean(section.category && foldsSections && foldKey && isFolded(foldKey))}
            >
            <div className={`${baseClass}__section-rows`}>
            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openKeys.has(item.key);
              /* Panel mode: the row feeding a visible panel carries the
                 selection, so the rail shows which section is open. */
              const feedsPanel = isPanelMode && hasChildren;
              const isSource = feedsPanel && item.key === panelSourceKey;
              /* The current page is one of this row's children (or theirs).
                 Then only that row is the current page: this one carries no
                 aria-current, and while the child shows below it (the rail
                 expanded, the accordion open) it drops its fill too, so one
                 row reads as current. Collapsed or closed, the parent is the
                 only sign of where the reader is, so it keeps the fill. */
              const childCurrent = Boolean(
                hasChildren &&
                  item.children!.some(
                    (sub) =>
                      sub.key === activeSubKey ||
                      sub.children?.some((leaf) => leaf.key === activeTertiaryKey),
                  ),
              );
              const childShows = childCurrent && !isPanelMode && (isExpanded || mobileOpen) && isOpen;
              const isActive =
                (isPanelMode && panelVisible ? isSource : activeKey === item.key) && !childShows;

              /* A leaf item with an href is a real link; an accordion row
                 stays a button whatever it declares, because its job is to
                 toggle, not navigate. */
              const isLink = Boolean(item.href) && !hasChildren;

              const itemClasses = [
                `${baseClass}__btn`,
                isActive ? `${baseClass}__btn--active` : '',
              ]
                .filter(Boolean)
                .join(' ');

              const itemContent = (
                <>
                  <span className={`${baseClass}__btn-left`}>
                    {/* The icon's seat anchors the collapsed rail's copy of
                        the count to the icon's corner, presentational like
                        the caption: the trailing pill stays the one that is
                        read, and the two crossfade with the rail. */}
                    <span className={`${baseClass}__btn-seat`}>
                      {item.pixelAvatar ? (
                        <span className={`${baseClass}__btn-icon ${baseClass}__btn-icon--avatar`}>
                          <PixelAvatar name={avatarSeed(item)} ink={avatarInks.get(item.key)} />
                        </span>
                      ) : (
                        <span
                          className={`${baseClass}__btn-icon${typeof item.icon === 'string' ? ` material-symbols-rounded ${mirrorClass(item.icon)}` : ` ${baseClass}__btn-icon--node`}`}
                        >
                          {item.icon}
                        </span>
                      )}
                      {item.badge !== undefined && isCount(item.badge) && (
                        <span className={`${baseClass}__btn-corner-badge`} aria-hidden="true">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <span className={`${baseClass}__btn-label`}>{item.label}</span>
                  </span>
                  {/* Panel mode's rail names each destination under its
                      icon. A second, presentational copy of the label, so
                      the inline label can fade in beside the icon while
                      this one fades out beneath it, and neither moves. */}
                  {isPanelMode && (
                    <span className={`${baseClass}__btn-caption`} aria-hidden="true">
                      {item.label}
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className={`${baseClass}__btn-badge${isCount(item.badge) ? ` ${baseClass}__btn-badge--count` : ''}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.value && <span className={`${baseClass}__btn-value`}>{item.value}</span>}
                  {item.keys && (
                    <span className={`${baseClass}__btn-keys`} aria-hidden="true">
                      <Kbd keys={item.keys} keyLabels={keyLabels} size="compact" aria-keyshortcuts={undefined} />
                    </span>
                  )}
                  {/* Accordion rows turn the chevron down when open; a row
                      feeding the panel points it at the panel and holds. */}
                  {hasChildren && (
                    <span
                      className={[
                        `${baseClass}__btn-chevron material-symbols-rounded ds-mirror-rtl`,
                        isOpen && !isPanelMode ? `${baseClass}__btn-chevron--open` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      chevron_right
                    </span>
                  )}
                </>
              );

              return (
                <React.Fragment key={item.key}>
                  {isLink && item.href ? (
                    <Link
                      className={itemClasses}
                      href={item.href}
                      onClick={() => item.onClick?.()}
                      aria-current={isActive ? 'page' : undefined}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={itemClasses}
                      onClick={() => {
                        if (feedsPanel) {
                          selectPanelSource(item.key);
                        } else if (hasChildren) {
                          /* On the collapsed rail the accordion has nowhere
                             to open, so the row expands the rail first. */
                          if (!isExpanded && !mobileOpen) {
                            toggleExpanded();
                            setOpenKeys((prev) => new Set(prev).add(item.key));
                          } else {
                            toggleAccordion(item.key);
                          }
                        }
                        item.onClick?.();
                      }}
                      aria-expanded={
                        feedsPanel
                          ? mobileOpen
                            ? undefined
                            : isSource && panelVisible
                          : hasChildren
                            ? isOpen
                            : undefined
                      }
                      aria-controls={feedsPanel && !mobileOpen ? panelId : undefined}
                      aria-current={activeKey === item.key && !childCurrent ? 'page' : undefined}
                      data-panel-source={isSource ? 'true' : undefined}
                      title={!isExpanded && !isPanelMode ? item.label : undefined}
                    >
                      {itemContent}
                    </button>
                  )}

                  {/* Sub-items */}
                  {hasChildren && !isPanelMode && (
                    <div
                      className={[
                        `${baseClass}__sub-items`,
                        isOpen && isExpanded ? `${baseClass}__sub-items--open` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {item.children!.map((sub) => {
                        const subHasChildren = Boolean(sub.children?.length);
                        const subIsSource = subHasChildren && sub.key === panelSourceKey;
                        const subActive = panelVisible && subHasChildren
                          ? subIsSource
                          : activeSubKey === sub.key;
                        const subClasses = [
                          `${baseClass}__sub-btn`,
                          subActive ? `${baseClass}__sub-btn--active` : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        const subLabel = (
                          <>
                            <span className={`${baseClass}__sub-label`}>{sub.label}</span>
                            {sub.badge !== undefined && (
                              <span className={`${baseClass}__btn-badge${isCount(sub.badge) ? ` ${baseClass}__btn-badge--count` : ''}`}>
                                {sub.badge}
                              </span>
                            )}
                            {subHasChildren && (
                              <span
                                className={`${baseClass}__sub-chevron material-symbols-rounded ds-mirror-rtl`}
                                aria-hidden="true"
                              >
                                chevron_right
                              </span>
                            )}
                          </>
                        );
                        return (
                          <div key={sub.key} className={`${baseClass}__sub-item`}>
                            <div className={`${baseClass}__sub-line`} />
                            {subHasChildren ? (
                              <button
                                type="button"
                                className={subClasses}
                                onClick={() => {
                                  selectPanelSource(sub.key);
                                  sub.onClick?.();
                                }}
                                aria-expanded={mobileOpen ? undefined : subIsSource && panelVisible}
                                aria-controls={mobileOpen ? undefined : panelId}
                                aria-current={
                                  activeSubKey === sub.key &&
                                  !sub.children?.some((leaf) => leaf.key === activeTertiaryKey)
                                    ? 'page'
                                    : undefined
                                }
                                data-panel-source={subIsSource ? 'true' : undefined}
                              >
                                {subLabel}
                              </button>
                            ) : sub.href ? (
                              <Link
                                className={subClasses}
                                href={sub.href}
                                onClick={sub.onClick}
                                aria-current={subActive ? 'page' : undefined}
                              >
                                {subLabel}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className={subClasses}
                                onClick={sub.onClick}
                                aria-current={subActive ? 'page' : undefined}
                              >
                                {subLabel}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            </div>
            {section.content && (
              /* The section's own content, under its fold. The collapsed
                 rail has no room for it, so it folds away there and leaves
                 the tab order. */
              <div
                className={`${baseClass}__section-content${showExpanded ? ` ${baseClass}__section-content--shown` : ''}`}
                inert={!showExpanded}
              >
                <div className={`${baseClass}__section-content-inner`}>
                  {sectionContent(section, { expanded: isExpanded, drawer: false, closeDrawer: () => {} })}
                </div>
              </div>
            )}
            </div>
          </div>
          );
        })}
        </div>
        )}
      </div>

      {/* ---- BOTTOM — consumer slot + profile ---- */}
      <div className={`${baseClass}__bottom`}>
        {/* The footer's two forms share one cell (SiteHeader's actions /
            condensedActions rule): the expanded slot fades out as the
            collapsed one fades in, and the hidden form is inert, so no
            invisible control stays in the tab order. */}
        {(footerSlot || collapsedFooterSlot) && !(mobileOpen && drawerBottomEntries) && (
          <div className={`${baseClass}__footer`}>
            {footerSlot && (
              <div className={`${baseClass}__footer-slot`} inert={!showExpanded}>
                {footerSlot}
              </div>
            )}
            {collapsedFooterSlot && (
              <div
                className={`${baseClass}__footer-slot ${baseClass}__footer-slot--collapsed`}
                inert={showExpanded}
              >
                {collapsedFooterSlot}
              </div>
            )}
          </div>
        )}
        {profile && (
        <div className={`${baseClass}__profile`}>
          <div className={`${baseClass}__profile-left`}>
            {/* Avatar owns the fallback ladder: the picture when there is
                one, the person's initials when there is not, and the generic
                glyph when there is neither. The hand-rolled box this replaced
                drew an empty disc for every profile with no avatarUrl. */}
            {profile.avatar ? (
              <span className={`${baseClass}__avatar ${baseClass}__avatar--node`}>{profile.avatar}</span>
            ) : (
              <Avatar
                className={`${baseClass}__avatar`}
                size="md"
                name={profile.name}
                src={profile.avatarUrl}
              />
            )}
            <div className={`${baseClass}__profile-info`}>
              <span className={`${baseClass}__profile-name`}>{profile.name}</span>
              {profile.email && <span className={`${baseClass}__profile-email`}>{profile.email}</span>}
            </div>
          </div>
          {onProfileMore && (
            <button
              className={`${baseClass}__profile-more`}
              onClick={onProfileMore}
              aria-label={profileMoreLabel}
            >
              <span className="material-symbols-rounded">more_horiz</span>
            </button>
          )}
        </div>
        )}
        {footerAction && (
          <div className={`${baseClass}__footer-action`} inert={!showExpanded}>
            {footerAction}
          </div>
        )}
      </div>
    </nav>
      {/* The side panel, fixed beside the rail. Kept mounted while it has a
          source so it can slide; inert while hidden. CSS keeps it off small
          screens, where the drawer's drill-in shows the same level. */}
      {panelSource && !mobileOpen && (
        <SubNavPanel
          linkComponent={Link}
          key={panelSourceKey}
          id={panelId}
          className={[
            `${baseClass}__panel`,
            panelVisible ? `${baseClass}__panel--visible` : '',
            isExpanded ? `${baseClass}__panel--beside-expanded` : '',
            isPanelMode ? `${baseClass}__panel--panel-mode` : '',
            floating ? `${baseClass}__panel--floating` : '',
            layout === 'inset' ? `${baseClass}__panel--inset` : '',
            contained ? `${baseClass}__panel--contained` : '',
            sized ? `${baseClass}__panel--sized` : '',
          ]
            .filter(Boolean)
            .join(' ')}
          items={panelSource.items}
          title={panelSource.label}
          activeKey={activeTertiaryKey ?? activeSubKey}
          onCollapse={() => setPanelOpen(false)}
          inert={!panelVisible}
        />
      )}
    </>
  );
});

AppSidebar.displayName = 'AppSidebar';
