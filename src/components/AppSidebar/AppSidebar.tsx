'use client';

import React, { useState, useCallback } from 'react';
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
  /** Material Symbols icon name */
  icon: string;
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
  /** Logo element — defaults to built-in robr0 logo */
  logo?: React.ReactNode;
  /** Text shown next to logo when expanded */
  logoText?: string;
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0309 14.98C18.6612 14.8653 19.2184 14.6623 19.7208 14.3712C20.214 14.08 20.6343 13.7358 20.9814 13.3211C21.3285 12.9063 21.5934 12.4387 21.776 11.9269C21.9587 11.4062 22.05 10.8592 22.05 10.2856C22.05 9.22672 21.8034 8.35314 21.3011 7.67368C20.8078 6.99423 20.1775 6.45596 19.4103 6.05889C18.6429 5.6618 17.7935 5.37943 16.8618 5.22942C15.9301 5.07059 15.0258 5 14.158 5L0 5C0 5 1.7355 8.8561 6.49444 8.8561C11.2534 8.8561 14.5417 8.8561 14.5417 8.8561C15.3638 8.8561 16.0123 8.99729 16.4691 9.28849C16.9257 9.57968 17.1541 10.0121 17.1541 10.5856C17.1541 11.1062 16.8983 11.5122 16.3959 11.8033C15.8936 12.1033 15.2725 12.2445 14.5417 12.2445C14.5417 12.2445 7.84631 12.2445 4.28395 12.2445C0.876885 12.2445 1.18745 15.5535 1.18745 15.5535L1.18745 19.8244C1.18745 19.8244 5.93725 19.8068 5.93725 15.9065H13.2263C16.9714 21.2627 23 19.8244 23 19.8244L18.0309 14.98Z"
        fill="url(#sidebar_paint0)"
      />
      <path
        opacity="0.4"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 8.69492C12.0901 8.69492 14.6165 8.70339 14.6165 8.70339C16.5233 8.76271 16.9046 9.10173 17 9.5C17 6.11865 13.0434 5 11.0795 5C9.11546 5 8 5 8 5V8.69492Z"
        fill="url(#sidebar_paint1)"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2646 5.38135C14.2646 5.38135 13.2763 5 12.3696 5C10.5018 5 9.44108 5 9.44108 5L1 5C1 5 2.72267 6.89831 7.44641 6.89831L13.4213 6.90678C17.3472 6.90678 17.9094 9.61018 18 10C18 7.5678 16.0507 6.04237 14.2646 5.38135Z"
        fill="url(#sidebar_paint2)"
      />
      <path
        opacity="0.4"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 12.5C11.9827 12.5 10.372 12.5 9 12.5C6.30269 12.5 6 15.5 6 15.5H13V12.5Z"
        fill="url(#sidebar_paint3)"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 13C4.69445 13 5.42838 13 4.39805 13C1.76576 13 2.0057 15.6193 2.0057 15.6193L2.0057 19C2.0057 19 3.57237 17.7218 3.57237 16.206C3.57237 14.6904 3.95346 13 6 13Z"
        fill="url(#sidebar_paint4)"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.947 15C17.947 15 17.4185 15.1645 16 15C18.392 20.0731 23 19.9999 23 19.9999L17.947 15Z"
        fill="url(#sidebar_paint5)"
      />
      <defs>
        <linearGradient id="sidebar_paint0" x1="3.83825" y1="15.8618" x2="13.4908" y2="5.78849" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
        <linearGradient id="sidebar_paint1" x1="9.8045" y1="7.5" x2="16.6666" y2="7.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
        <linearGradient id="sidebar_paint2" x1="0.874018" y1="7.27631" x2="9.44862" y2="8.80891" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
        <linearGradient id="sidebar_paint3" x1="14.3715" y1="14" x2="7.79961" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
        <linearGradient id="sidebar_paint4" x1="4" y1="18.7627" x2="4" y2="15.6662" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
        <linearGradient id="sidebar_paint5" x1="21.5356" y1="19.143" x2="19.9551" y2="16.6911" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2980B9" />
          <stop offset="0.5484" stopColor="#2980B9" />
          <stop offset="1" stopColor="#34495E" />
        </linearGradient>
      </defs>
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
  logoText = 'robr0',
}: AppSidebarProps) => {
  const baseClass = 'ds-app-sidebar';

  /* Expand / collapse */
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const toggleExpanded = useCallback(() => {
    const next = !isExpanded;
    setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, onExpandedChange]);

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
    isExpanded ? `${baseClass}--expanded` : '',
    floating ? `${baseClass}--floating` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classes} aria-label="App navigation">
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
                    <span className={`${baseClass}__btn-icon material-symbols-rounded`}>
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
            <div className={`${baseClass}__avatar`}>
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt={profile.name} />
              )}
            </div>
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
  );
};
