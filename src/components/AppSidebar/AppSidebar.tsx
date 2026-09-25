'use client';

import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';
import { Avatar } from '../Avatar/Avatar';
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
  /** Renders the sub-item as a real link to this URL instead of a button */
  href?: string;
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
  /** Sub-items — turns this into an accordion */
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
 */
export const AppSidebar = ({
  sections,
  profile,
  activeKey,
  activeSubKey,
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

  /* Accordion open keys */
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

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

  const classes = [
    baseClass,
    // The drawer always shows the expanded layout: an icon rail inside
    // a modal overlay would be all cost and no labels.
    isExpanded || mobileOpen ? `${baseClass}--expanded` : '',
    floating ? `${baseClass}--floating` : '',
    mobileOpen ? `${baseClass}--mobile-open` : '',
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
          onClick={() => setMobileOpen(true)}
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
          <button
            className={`${baseClass}__toggle`}
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="material-symbols-rounded">
              {isExpanded ? 'left_panel_close' : 'left_panel_open'}
            </span>
          </button>
        </div>

        {/* Consumer slot under the logo row */}
        {topSlot && <div className={`${baseClass}__top-slot`}>{topSlot}</div>}

        {/* Nav sections */}
        {sections.map((section, si) => (
          <div key={si} className={`${baseClass}__nav`}>
            {section.category && (
              <div className={`${baseClass}__category`}>{section.category}</div>
            )}

            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openKeys.has(item.key);
              const isActive = activeKey === item.key;

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
                  {hasChildren && (
                    <span
                      className={[
                        `${baseClass}__btn-chevron material-symbols-rounded`,
                        isOpen ? `${baseClass}__btn-chevron--open` : '',
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
                        if (hasChildren && isExpanded) {
                          toggleAccordion(item.key);
                        }
                        item.onClick?.();
                      }}
                      aria-expanded={hasChildren ? isOpen : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {itemContent}
                    </button>
                  )}

                  {/* Sub-items */}
                  {hasChildren && (
                    <div
                      className={[
                        `${baseClass}__sub-items`,
                        isOpen && isExpanded ? `${baseClass}__sub-items--open` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {item.children!.map((sub) => {
                        const subActive = activeSubKey === sub.key;
                        const subClasses = [
                          `${baseClass}__sub-btn`,
                          subActive ? `${baseClass}__sub-btn--active` : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        const subLabel = (
                          <span className={`${baseClass}__sub-label`}>{sub.label}</span>
                        );
                        return (
                          <div key={sub.key} className={`${baseClass}__sub-item`}>
                            <div className={`${baseClass}__sub-line`} />
                            {sub.href ? (
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
    </>
  );
};
