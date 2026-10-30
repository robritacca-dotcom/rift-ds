'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { useLayer } from '../../behaviors/useLayer';
import { isRtl } from '../../behaviors/direction';
import { MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';
import { CircularButton } from '../CircularButton/CircularButton';
import { Drawer } from '../Drawer/Drawer';
import { MegaMenu, type MegaMenuItem, type MegaMenuShowcase } from '../MegaMenu/MegaMenu';
import { NavList, type NavListItem } from '../NavList/NavList';
import { ProgressiveBlur } from '../ProgressiveBlur/ProgressiveBlur';
import './SiteHeader.css';
import '../../fonts/material-symbols.css';

/** One top-level section of the site: a pill in the bar, a row in the drawer. */
export interface SiteHeaderSection {
  /** A stable key for the section. */
  id: string;
  /** The pill's text. */
  label: string;
  /** The section's landing page: where a click on the pill goes. */
  href: string;
  /**
   * A mega menu for the section. Hovering or focusing the pill opens it; its
   * items are also the section's sub-list in the drawer.
   */
  mega?: {
    /** The panel's link rows. */
    items: MegaMenuItem[];
    /** A featured card beside the rows. */
    showcase?: MegaMenuShowcase;
  };
  /**
   * The section's sub-list in the drawer, when it should differ from its
   * menu's items: a page that needs a wide screen, say, left out of the
   * drawer that only narrow screens see. Defaults to the menu's items.
   */
  drawerItems?: { href: string; label: string }[];
  /**
   * Marks the section as the one being viewed. Left unset, the header works
   * it out from `currentHref`: the section's own page, a page under it, or
   * any page its menu lists.
   */
  current?: boolean;
}

/** Props owned by SiteHeader itself — everything else falls through to the `<header>`. */
type SiteHeaderOwnProps = {
  /**
   * The brand at the bar's start, usually a logo linking home. Rendered as
   * given, so it carries its own link.
   */
  brand?: React.ReactNode;
  /** The site's top-level sections, in order. */
  sections: SiteHeaderSection[];
  /** The path of the page being viewed, used to mark the current section, row and drawer item. */
  currentHref?: string;
  /** Controls at the bar's end that stay at every width, such as a search button; `condensedActions`, when given, stand in for them on the condensed step. */
  actions?: React.ReactNode;
  /**
   * The same controls drawn narrower, such as an icon-only CommandPaletteTrigger and a
   * `cycle` ThemeToggle. When the full row stops fitting, these take the place of
   * `actions` (the header adds `ds-site-header--condensed`), and the pills fold to the
   * menu button only when the condensed row does not fit either. Without it the
   * header folds as soon as the full row stops fitting.
   */
  condensedActions?: React.ReactNode;
  /**
   * Controls at the bar's end that show only while the pills fit, such as a
   * Get started button. Once the bar folds to its menu button they leave it; put
   * their drawer twin in `drawerFooter`.
   */
  wideActions?: React.ReactNode;
  /** Content for the drawer's footer, such as the controls `wideActions` holds in the bar. */
  drawerFooter?: React.ReactNode;
  /** Whether the folded bar's drawer is open, for a host that owns that state. Pair with `onDrawerOpenChange`. */
  drawerOpen?: boolean;
  /** Whether the drawer starts open, when the header owns its state. */
  defaultDrawerOpen?: boolean;
  /** Called when the drawer opens or closes, controlled or not. */
  onDrawerOpenChange?: (open: boolean) => void;
  /**
   * Where the bar folds before it has measured itself: on the first frame,
   * which a server-rendered page shows before its script runs. Below this
   * breakpoint (`tablet` or the wider `mid`) the bar starts folded by CSS
   * alone, so a phone never sees the pills overflow; the measurement takes
   * over once the script runs. Pick the step nearest where the pills stop
   * fitting, or `never` for a bar that fits at every width.
   */
  initialFold?: 'tablet' | 'mid' | 'never';
  /**
   * Whether the header sticks to the top of the viewport over a progressive
   * blur. Off, it scrolls away with the page and draws no blur.
   */
  sticky?: boolean;
  /**
   * How far, in pixels, the page scrolls before the page-surface tint fades
   * in over the sticky header's blur.
   */
  tintAfter?: number;
  /**
   * The component every link renders through, so a router's link (Next.js
   * `Link`) navigates without a reload. Falls back to the nearest
   * `LinkProvider`, then `<a>`.
   */
  linkComponent?: LinkComponent;
  /** The accessible name of the section links' `<nav>` landmark. */
  navLabel?: string;
  /** The accessible name of the menu button that opens the drawer. */
  drawerOpenLabel?: string;
  /**
   * The drawer's title, naming the dialog. Shown at its top when there is no
   * `brand`; with one, the brand takes its place and the title is read only
   * by assistive tech.
   */
  drawerTitle?: string;
  /** The accessible name of the drawer's close button. */
  drawerCloseLabel?: string;
  /** Additional CSS classes on the `<header>`. */
  className?: string;
};

export interface SiteHeaderProps
  extends SiteHeaderOwnProps,
    Omit<React.ComponentPropsWithRef<'header'>, keyof SiteHeaderOwnProps> {}

const isUnder = (href: string, currentHref?: string) =>
  currentHref != null && (currentHref === href || currentHref.startsWith(`${href}/`));

const sectionIsCurrent = (section: SiteHeaderSection, currentHref?: string) =>
  section.current ??
  (isUnder(section.href, currentHref) ||
    (section.mega?.items.some((item) => isUnder(item.href, currentHref)) ?? false));

/**
 * A site's top bar: the brand, a pill per section with a mega menu on any
 * section that has one, and actions at the end, sticking to the viewport
 * over a progressive blur whose tint arrives once the page scrolls. When
 * the pills no longer fit, measured on the bar's own width rather than the
 * viewport's, the bar folds to a menu button that opens a drawer of the
 * same sections. The forwarded ref and any unrecognised props target the
 * `<header>`.
 */
export function SiteHeader({
  brand,
  sections,
  currentHref,
  actions,
  condensedActions,
  wideActions,
  drawerFooter,
  drawerOpen: drawerOpenProp,
  defaultDrawerOpen = false,
  onDrawerOpenChange,
  initialFold = 'tablet',
  sticky = true,
  tintAfter = 48,
  linkComponent,
  navLabel = 'Primary',
  drawerOpenLabel = 'Open menu',
  drawerTitle = 'Menu',
  drawerCloseLabel = 'Close menu',
  className = '',
  ref,
  ...rest
}: SiteHeaderProps) {
  const Link = useLinkComponent(linkComponent);
  const baseClass = 'ds-site-header';
  const panelId = useId();

  const headerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const wideRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const condensedActionsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Set while Escape hands focus back to a pill, so that focus does not
  // reopen the panel it just closed.
  const returningFocus = useRef(false);
  // The page scrollbar's width as the drawer opened. The drawer's scroll lock
  // takes the scrollbar away and widens the bar by that much; measured
  // against the wider bar, a header within a scrollbar of its fold would
  // unfold, close the drawer, get its scrollbar back and fold again.
  const lockedGutter = useRef(0);

  const [openId, setOpenId] = useState<string | null>(null);
  // The section whose content the panel holds. It outlives openId, so a
  // closing panel fades out with its rows still in it rather than empty.
  const [shownId, setShownId] = useState<string | null>(null);
  const [condensed, setCondensed] = useState(false);
  const [folded, setFolded] = useState(false);
  // False until the first measurement: the CSS fold stands in until then.
  const [measured, setMeasured] = useState(false);
  // The bar's place when the drawer opened, so the drawer's brand row lands
  // on the bar's own brand whatever the scroll, the gutter or the direction.
  const [drawerOffset, setDrawerOffset] = useState<React.CSSProperties>({});
  const [tinted, setTinted] = useState(false);
  const [drawerOpenState, setDrawerOpenState] = useState(defaultDrawerOpen);
  const drawerOpen = drawerOpenProp ?? drawerOpenState;
  const setDrawerOpen = useCallback(
    (next: boolean) => {
      lockedGutter.current = next ? window.innerWidth - document.documentElement.clientWidth : 0;
      if (drawerOpenProp === undefined) setDrawerOpenState(next);
      onDrawerOpenChange?.(next);
    },
    [drawerOpenProp, onDrawerOpenChange],
  );

  const setRef = (node: HTMLElement | null) => {
    headerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  // The fold: the room the full row needs against the room the bar has.
  // Folded pills stay in the DOM, hidden and out of flow, so they keep
  // their width for the next measurement; so do whichever of `actions` and
  // `condensedActions` is not showing. The row is measured with each set,
  // so the actions condense before the pills fold, and state changes only
  // when an answer flips, never per resize frame.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
      const navStart = navRef.current ? parseFloat(getComputedStyle(navRef.current).marginInlineStart) || 0 : 0;
      const rowWidth = (actionsEl: HTMLElement | null) => {
        const parts = [brandRef.current, navRef.current, wideRef.current, actionsEl];
        const widths = parts.map((el) => (el ? el.scrollWidth : 0));
        const present = widths.filter((w) => w > 0).length;
        return widths.reduce((sum, w) => sum + w, 0) + navStart + gap * Math.max(present - 1, 0);
      };
      const room = bar.clientWidth - lockedGutter.current;
      const full = rowWidth(actionsRef.current);
      const tight = condensedActionsRef.current ? rowWidth(condensedActionsRef.current) : full;
      setCondensed(condensedActionsRef.current != null && full > room);
      setFolded(tight > room);
      setMeasured(true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [
      bar,
      brandRef.current,
      navRef.current,
      wideRef.current,
      actionsRef.current,
      condensedActionsRef.current,
    ].forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections, actions, condensedActions, wideActions, brand]);

  // The tint over the sticky blur follows the page's scroll past `tintAfter`.
  useEffect(() => {
    if (!sticky) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setTinted(window.scrollY > tintAfter);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sticky, tintAfter]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // As the drawer opens, measure where the bar and its menu button sit, so
  // the drawer's brand row lands on the bar's brand and its close button on
  // the menu button it replaces, whatever the scroll, the gutter or the
  // reading direction. Measured on open, not live: a scroll event mid-open
  // (iOS fires them as the scroll lock engages) must not move the X.
  const placeDrawer = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    const rtl = isRtl(bar);
    const start = (rect: DOMRect) => (rtl ? document.documentElement.clientWidth - rect.right : rect.left);
    const barRect = bar.getBoundingClientRect();
    const offsets: Record<string, string> = {
      '--ds-site-header-height': `${bar.offsetHeight}px`,
      '--ds-site-header-drawer-top': `${Math.max(barRect.top, 0)}px`,
      '--ds-site-header-drawer-start': `${start(barRect)}px`,
    };
    const button = menuButtonRef.current?.getBoundingClientRect();
    if (button && button.width > 0) {
      offsets['--ds-site-header-close-top'] = `${button.top}px`;
      offsets['--ds-site-header-close-start'] = `${start(button)}px`;
    }
    setDrawerOffset(offsets as React.CSSProperties);
  }, []);

  // Once before the first frame, so the drawer never paints unplaced.
  useLayoutEffect(() => {
    if (!drawerOpen) {
      // A host that closes a controlled drawer itself never calls setDrawerOpen.
      lockedGutter.current = 0;
      return;
    }
    placeDrawer();
  }, [drawerOpen, placeDrawer]);

  // And once more after the drawer's scroll lock engages (a child's effect,
  // so it has run by the time this one does): taking the scrollbar away
  // widens the page and moves the menu button by the scrollbar's width,
  // which the first measurement could not see. The close button fades in
  // only once the panel has slid home, so the correction never shows.
  useEffect(() => {
    if (drawerOpen) placeDrawer();
  }, [drawerOpen, placeDrawer]);

  const openSection = useCallback((id: string) => {
    clearTimeout(closeTimer.current);
    setOpenId(id);
    setShownId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), MOTION_HOVER_HIDE_DELAY_MS);
  }, []);

  const closePanel = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpenId(null);
  }, []);

  const triggerFor = (id: string) =>
    navRef.current?.querySelector<HTMLElement>(`[data-section="${CSS.escape(id)}"]`) ?? null;

  // The open panel is a light-dismiss layer: an outside press or Escape
  // closes it through the shared stack, and Escape hands focus back to the
  // pill that opened it.
  useLayer({
    open: openId != null && !folded,
    onDismiss: () => {
      const trigger = openId ? triggerFor(openId) : null;
      const focusInPanel = panelRef.current?.contains(document.activeElement) ?? false;
      closePanel();
      if (focusInPanel && trigger) {
        returningFocus.current = true;
        trigger.focus();
        returningFocus.current = false;
      }
    },
    dismissOnOutsidePress: true,
    getElements: () => [navRef.current, panelRef.current],
  });

  // A fold closes any open panel; the drawer takes over.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (folded) setOpenId(null);
    // Only a measured unfold closes the drawer: on mount `folded` is false
    // until the first measurement, and a drawer opened from the start
    // (`defaultDrawerOpen`, or a controlled `drawerOpen`) must survive that.
    else if (measured && drawerOpen) setDrawerOpen(false);
  }, [folded, measured, drawerOpen, setDrawerOpen]);

  const panelOpen = openId != null && sections.some((s) => s.id === openId && s.mega);
  const shown = sections.find((s) => s.id === shownId && s.mega) ?? null;

  const drawerItems: NavListItem[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: section.href,
    current: sectionIsCurrent(section, currentHref) || undefined,
    ...((section.drawerItems ?? section.mega?.items ?? []).length > 0
      ? { items: (section.drawerItems ?? section.mega?.items ?? []).map(({ href, label }) => ({ href, label })) }
      : {}),
  }));
  const currentSectionId = sections.find((s) => sectionIsCurrent(s, currentHref))?.id;

  const classes = [
    baseClass,
    sticky && `${baseClass}--sticky`,
    condensed && `${baseClass}--condensed`,
    folded && `${baseClass}--folded`,
    !measured && initialFold !== 'never' && `${baseClass}--prefold-${initialFold}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header {...rest} ref={setRef} className={classes}>
      {sticky && <ProgressiveBlur className={`${baseClass}__blur`} tinted={tinted} />}

      <div ref={barRef} className={`${baseClass}__bar`}>
        {brand && (
          <div ref={brandRef} className={`${baseClass}__brand`}>
            {brand}
          </div>
        )}

        <nav ref={navRef} aria-label={navLabel} className={`${baseClass}__nav`} inert={folded}>
          {sections.map((section) => {
            const current = sectionIsCurrent(section, currentHref);
            const open = openId === section.id;
            const pillClass = [
              `${baseClass}__pill`,
              open && `${baseClass}__pill--open`,
              current && `${baseClass}__pill--current`,
            ]
              .filter(Boolean)
              .join(' ');

            if (!section.mega) {
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  data-section={section.id}
                  className={pillClass}
                  aria-current={current ? 'page' : undefined}
                  onMouseEnter={scheduleClose}
                  onClick={closePanel}
                >
                  {section.label}
                </Link>
              );
            }

            return (
              <div
                key={section.id}
                className={`${baseClass}__section`}
                onMouseEnter={() => openSection(section.id)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={section.href}
                  data-section={section.id}
                  className={pillClass}
                  aria-current={current ? 'page' : undefined}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onFocus={() => {
                    if (!returningFocus.current) openSection(section.id);
                  }}
                  onClick={closePanel}
                  onKeyDown={(event: React.KeyboardEvent<HTMLAnchorElement>) => {
                    // ArrowDown steps into the open panel, so its links are
                    // one key away rather than past every pill and action.
                    if (event.key !== 'ArrowDown') return;
                    event.preventDefault();
                    openSection(section.id);
                    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a')?.focus());
                  }}
                >
                  <span>{section.label}</span>
                  <span
                    className={`material-symbols-rounded ${baseClass}__caret`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        <div className={`${baseClass}__end`}>
          {actions && (
            <div ref={actionsRef} className={`${baseClass}__actions`} inert={condensed}>
              {actions}
            </div>
          )}
          {condensedActions && (
            <div
              ref={condensedActionsRef}
              className={`${baseClass}__actions ${baseClass}__actions--condensed`}
              inert={!condensed}
            >
              {condensedActions}
            </div>
          )}
          {wideActions && (
            <div ref={wideRef} className={`${baseClass}__wide-actions`} inert={folded}>
              {wideActions}
            </div>
          )}
          <CircularButton
            ref={menuButtonRef}
            className={[`${baseClass}__menu-button`, drawerOpen && `${baseClass}__menu-button--hidden`]
              .filter(Boolean)
              .join(' ')}
            icon="menu"
            size="compact"
            variant="secondary"
            tone="neutral"
            ariaLabel={drawerOpenLabel}
            tooltip={false}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
            onClick={() => setDrawerOpen(true)}
          />
        </div>

        <div
          className={`${baseClass}__panel`}
          onMouseEnter={() => openId && openSection(openId)}
          onMouseLeave={scheduleClose}
        >
          <MegaMenu
            ref={panelRef}
            id={panelId}
            open={panelOpen && !folded}
            items={shown?.mega?.items ?? []}
            showcase={shown?.mega?.showcase}
            currentHref={currentHref}
            linkComponent={Link}
            onNavigate={closePanel}
          />
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerTitle}
        closeLabel={drawerCloseLabel}
        side="start"
        size="sm"
        footer={drawerFooter}
        className={`${baseClass}__drawer`}
        style={drawerOffset}
        heading={
          brand && (
            <div
              className={`${baseClass}__drawer-brand`}
              onClick={(event) => {
                // The brand usually links home: following it closes the drawer.
                if ((event.target as HTMLElement).closest('a')) setDrawerOpen(false);
              }}
            >
              {brand}
            </div>
          )
        }
      >
        <NavList
          key={drawerOpen ? 'open' : 'closed'}
          items={drawerItems}
          currentHref={currentHref}
          defaultExpandedIds={currentSectionId ? [currentSectionId] : []}
          linkComponent={Link}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Drawer>
    </header>
  );
}
