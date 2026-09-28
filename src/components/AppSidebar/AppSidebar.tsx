'use client';

import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';
import { Avatar } from '../Avatar/Avatar';
import { SidebarPanel } from '../SidebarPanel/SidebarPanel';
import type { SidebarPanelItem } from '../SidebarPanel/SidebarPanel';
import './AppSidebar.css';
import '../../fonts/material-symbols.css';

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
  /** Trailing count pill, e.g. unread items */
  badge?: string | number;
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
  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */
  icon: string | React.ReactNode;
  /** Display label (shown when expanded) */
  label: string;
  /** Click handler — also fires on a link item, so a consumer can route client-side */
  onClick?: () => void;
  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */
  href?: string;
  /** Trailing count pill, e.g. unread items; hidden while the rail is collapsed */
  badge?: string | number;
  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav="panel"` */
  children?: AppSidebarSubItem[];
}

export interface AppSidebarSection {
  /** Optional category label above the group */
  category?: string;
  /** Nav items in this section */
  items: AppSidebarItem[];
}

export interface AppSidebarProfile {
  /** User display name */
  name: string;
  /** User email */
  email: string;
  /** Avatar image URL */
  avatarUrl?: string;
}

export interface AppSidebarProps {
  /** Navigation sections */
  sections: AppSidebarSection[];
  /** Profile data for the bottom section */
  profile?: AppSidebarProfile;
  /** Key of the currently active item */
  activeKey?: string;
  /** Key of the currently active sub-item */
  activeSubKey?: string;
  /** Key of the currently active third-level item, listed in the side panel */
  activeTertiaryKey?: string;
  /**
   * Where an item's sub-items show. `accordion` (the default) opens them under
   * the row, and a sub-item's own children open in a side panel as level 3.
   * `panel` skips the accordion: a top-level item opens its sub-items straight
   * into the side panel, with their children as the panel's accordion, and the
   * collapsed rail shows each label under its icon. On small screens both
   * modes drill in inside the drawer instead.
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
  /** Callback when profile more button clicked */
  onProfileMore?: () => void;
  /**
   * Floats the rail off the viewport edges as a glass card: inset with
   * rounded corners, the translucent glass fill over a backdrop blur, and
   * the floating shadow. The inset defaults to 20px and is overridable via
   * the --ds-sidebar-float-inset custom property.
   */
  floating?: boolean;
  /** Rendered under the logo row, above the nav; fades out while collapsed */
  topSlot?: React.ReactNode;
  /** Rendered above the profile block; fades out while collapsed */
  footerSlot?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
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
 * A third level opens in a `SidebarPanel` beside the rail (see `subNav`).
 */
export const AppSidebar = ({
  sections,
  profile,
  activeKey,
  activeSubKey,
  activeTertiaryKey,
  subNav = 'accordion',
  defaultPanelOpen = true,
  panelOpen: controlledPanelOpen,
  onPanelOpenChange,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  onProfileMore,
  floating = false,
  topSlot,
  footerSlot,
  className = '',
  logo,
  logoText = 'Rift',
  showMobileTrigger = true,
}: AppSidebarProps) => {
  const baseClass = 'ds-app-sidebar';

  /* Expand / collapse */
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;
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
     Deliberately entry-only: the visitor can re-expand by hand. */
  useEffect(() => {
    const band = window.matchMedia('(min-width: 769px) and (max-width: 959px)');
    const onChange = () => {
      if (band.matches) {
        setInternalExpanded(false);
        onExpandedChangeRef.current?.(false);
      }
    };
    onChange();
    band.addEventListener('change', onChange);
    return () => band.removeEventListener('change', onChange);
  }, []);

  /* Mobile drawer: below the breakpoint the rail is hidden and the
     trigger opens it as a modal overlay, on the shared behavior layer
     like every other overlay (dismissal stack, focus trap, scroll
     lock). The trigger is CSS-gated to the mobile media query, so the
     overlay can only ever activate there; crossing back up while open
     closes it, or the scroll lock would outlive the drawer. */
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerId = useId();
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useLayer({ open: mobileOpen, onDismiss: closeMobile });
  useFocusScope(drawerRef, { active: mobileOpen });
  useScrollLock(mobileOpen);
  useEffect(() => {
    if (!mobileOpen) return;
    const query = window.matchMedia('(min-width: 769px)');
    const onChange = () => {
      if (query.matches) setMobileOpen(false);
    };
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mobileOpen]);

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
  let panelSource: { label: string; parentLabel?: string; items: SidebarPanelItem[] } | undefined;
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

  /* In the drawer the panel's level is a second screen: a row with
     children drills in, the back row returns. Opening the drawer lands on
     the screen holding the current page. */
  const [drilled, setDrilled] = useState(false);
  const focusAfterDrill = useRef<'in' | 'out' | null>(null);
  const openMobile = useCallback(() => {
    setDrilled(Boolean(panelSource));
    setMobileOpen(true);
  }, [panelSource]);
  useEffect(() => {
    const target = focusAfterDrill.current;
    focusAfterDrill.current = null;
    if (!target || !drawerRef.current) return;
    const selector =
      target === 'in' ? '.ds-sidebar-panel__back' : '[data-panel-source="true"]';
    drawerRef.current.querySelector<HTMLElement>(selector)?.focus();
  }, [drilled]);

  /** A row with children that feeds the panel was pressed. */
  const selectPanelSource = useCallback(
    (key: string) => {
      if (mobileOpen) {
        setPanelSourceKey(key);
        focusAfterDrill.current = 'in';
        setDrilled(true);
        return;
      }
      if (key === panelSourceKey && isPanelOpen) {
        setPanelOpen(false);
      } else {
        setPanelSourceKey(key);
        setPanelOpen(true);
      }
    },
    [mobileOpen, panelSourceKey, isPanelOpen, setPanelOpen],
  );

  const classes = [
    baseClass,
    // The drawer always shows the expanded layout: an icon rail inside
    // a modal overlay would be all cost and no labels.
    isExpanded || mobileOpen ? `${baseClass}--expanded` : '',
    floating ? `${baseClass}--floating` : '',
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
          className={`${baseClass}__mobile-trigger`}
          aria-label="Open navigation"
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
        <div className={`${baseClass}__scrim`} onClick={closeMobile} aria-hidden="true" />
      )}
    <nav ref={drawerRef} id={drawerId} className={classes} aria-label="App navigation">
      {/* ---- TOP ---- */}
      <div className={`${baseClass}__top`}>
        {/* Logo */}
        <div className={`${baseClass}__logo`}>
          <div
            className={`${baseClass}__logo-inner`}
            onClick={!isExpanded ? toggleExpanded : undefined}
            role={!isExpanded ? 'button' : undefined}
            tabIndex={!isExpanded ? 0 : undefined}
            aria-label={!isExpanded ? 'Expand sidebar' : undefined}
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
          <button
            className={`${baseClass}__toggle`}
            onClick={mobileOpen ? closeMobile : toggleExpanded}
            aria-label={
              mobileOpen
                ? 'Close navigation'
                : isExpanded
                  ? 'Collapse sidebar'
                  : 'Expand sidebar'
            }
          >
            <span className="material-symbols-rounded">
              {mobileOpen ? 'close' : isExpanded ? 'left_panel_close' : 'left_panel_open'}
            </span>
          </button>
        </div>

        {/* Consumer slot under the logo row */}
        {topSlot && <div className={`${baseClass}__top-slot`}>{topSlot}</div>}

        {/* Drawer drill-in: the panel's level as a second screen */}
        {mobileOpen && drilled && panelSource ? (
          <SidebarPanel
            key={panelSourceKey}
            className={`${baseClass}__drill`}
            items={panelSource.items}
            title={panelSource.label}
            activeKey={activeTertiaryKey ?? activeSubKey}
            onBack={() => {
              focusAfterDrill.current = 'out';
              setDrilled(false);
            }}
            backLabel={panelSource.parentLabel ?? 'Menu'}
          />
        ) : (
        <div className={`${baseClass}__sections`}>
        {/* Nav sections */}
        {sections.map((section, si) => (
          <div key={si} className={`${baseClass}__nav`}>
            {section.category && (
              <div className={`${baseClass}__category`}>{section.category}</div>
            )}

            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openKeys.has(item.key);
              /* Panel mode: the row feeding a visible panel carries the
                 selection, so the rail shows which section is open. */
              const feedsPanel = isPanelMode && hasChildren;
              const isSource = feedsPanel && item.key === panelSourceKey;
              const isActive =
                isPanelMode && panelVisible ? isSource : activeKey === item.key;

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
                    <span
                      className={`${baseClass}__btn-icon${typeof item.icon === 'string' ? ' material-symbols-rounded' : ''}`}
                    >
                      {item.icon}
                    </span>
                    <span className={`${baseClass}__btn-label`}>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className={`${baseClass}__btn-badge`}>{item.badge}</span>
                  )}
                  {/* Accordion rows turn the chevron down when open; a row
                      feeding the panel points it at the panel and holds. */}
                  {hasChildren && (
                    <span
                      className={[
                        `${baseClass}__btn-chevron material-symbols-rounded`,
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
                  {isLink ? (
                    <a
                      className={itemClasses}
                      href={item.href}
                      onClick={() => item.onClick?.()}
                      aria-current={isActive ? 'page' : undefined}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {itemContent}
                    </a>
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
                      aria-current={activeKey === item.key ? 'page' : undefined}
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
                              <span className={`${baseClass}__btn-badge`}>{sub.badge}</span>
                            )}
                            {subHasChildren && (
                              <span
                                className={`${baseClass}__sub-chevron material-symbols-rounded`}
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
                                aria-current={activeSubKey === sub.key ? 'page' : undefined}
                                data-panel-source={subIsSource ? 'true' : undefined}
                              >
                                {subLabel}
                              </button>
                            ) : sub.href ? (
                              <a
                                className={subClasses}
                                href={sub.href}
                                onClick={sub.onClick}
                                aria-current={subActive ? 'page' : undefined}
                              >
                                {subLabel}
                              </a>
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
        ))}
        </div>
        )}
      </div>

      {/* ---- BOTTOM — consumer slot + profile ---- */}
      <div className={`${baseClass}__bottom`}>
        {footerSlot && (
          <div className={`${baseClass}__footer-slot`}>{footerSlot}</div>
        )}
        {profile && (
        <div className={`${baseClass}__profile`}>
          <div className={`${baseClass}__profile-left`}>
            {/* Avatar owns the fallback ladder: the picture when there is
                one, the person's initials when there is not, and the generic
                glyph when there is neither. The hand-rolled box this replaced
                drew an empty disc for every profile with no avatarUrl. */}
            <Avatar
              className={`${baseClass}__avatar`}
              size="md"
              name={profile.name}
              src={profile.avatarUrl}
            />
            <div className={`${baseClass}__profile-info`}>
              <span className={`${baseClass}__profile-name`}>{profile.name}</span>
              <span className={`${baseClass}__profile-email`}>{profile.email}</span>
            </div>
          </div>
          <button
            className={`${baseClass}__profile-more`}
            onClick={onProfileMore}
            aria-label="Profile options"
          >
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
        </div>
        )}
      </div>
    </nav>
      {/* The side panel, fixed beside the rail. Kept mounted while it has a
          source so it can slide; inert while hidden. CSS keeps it off small
          screens, where the drawer's drill-in shows the same level. */}
      {panelSource && !mobileOpen && (
        <SidebarPanel
          key={panelSourceKey}
          id={panelId}
          className={[
            `${baseClass}__panel`,
            panelVisible ? `${baseClass}__panel--visible` : '',
            isExpanded ? `${baseClass}__panel--beside-expanded` : '',
            isPanelMode ? `${baseClass}__panel--panel-mode` : '',
            floating ? `${baseClass}__panel--floating` : '',
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
};
