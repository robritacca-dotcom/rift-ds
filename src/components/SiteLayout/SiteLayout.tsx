'use client';

import React from 'react';
import { Link } from '../Link/Link';
import '../../behaviors/shell.css';
import './SiteLayout.css';

/** Props owned by SiteLayout itself. */
type SiteLayoutOwnProps = {
  /** The page's main content: the article, the page. */
  children: React.ReactNode;
  /**
   * The top bar, usually a SiteHeader. A SiteHeader given no `width` of its
   * own follows `headerWidth`, so the bar lines up with the page below it.
   */
  header?: React.ReactNode;
  /**
   * The navigation column, usually a scrollable NavList: the wide-screen
   * form of the site's sub-navigation. Sticks below the header; below
   * 960px it leaves the page, and the header's own menu carries the same
   * pages (give each SiteHeader section its `drawerItems`), so a reader has
   * one menu, never two.
   */
  sidebar?: React.ReactNode;
  /** The column after the content, usually an AnchorNav reading the page's headings. Gives way below 1152px in the `column` placement. */
  aside?: React.ReactNode;
  /**
   * Where the aside sits. `column` gives it a column of its own after the
   * content. `edge` pins it to the window's end edge, centred on the
   * height, and gives the content the room: the place for AnchorNav's
   * `floating` variant, a minimap that opens on hover or focus. Hidden
   * below 960px in either.
   */
  asidePlacement?: 'column' | 'edge';
  /** The bottom of the site, usually a SiteFooter. */
  footer?: React.ReactNode;
  /**
   * How wide the page runs, the shell recipe's width axis. `contained`
   * centres the columns at the contained width (1440px, or the nearest
   * `--ds-shell-contained-width`); `full` runs them edge to edge, the side
   * gutter aside.
   */
  width?: 'contained' | 'full';
  /**
   * How wide the header's bar runs, apart from the page, for a SiteHeader
   * that sets no `width` of its own. Defaults to `width`.
   * @default width
   */
  headerWidth?: 'contained' | 'full';
  /**
   * How wide the footer's row runs, apart from the page. Defaults to
   * `width`; set it to the header's width so the top and the bottom of the
   * site match.
   * @default width
   */
  footerWidth?: 'contained' | 'full';
  /**
   * Where the sidebar sits. `content` keeps it in the page's row, beside the
   * content, so a contained page centres all three columns together. `edge`
   * docks it to the window's start edge behind a hairline, and the content
   * and aside are laid out (and contained) in the room after it.
   */
  sidebarDock?: 'content' | 'edge';
  /**
   * Hold the main column to a reading width (about 75 characters of body
   * text, centred in its column) while the page is contained. A full-width page lets the content run the whole column.
   * `--ds-site-layout-reading-width` sets the measure.
   */
  readingWidth?: boolean;
  /** The id of the main region, the skip link's target. */
  mainId?: string;
  /** The skip link's text, the page's first stop. Pass an empty string for none. */
  skipLinkLabel?: string;
  /** Accessible name of the sidebar's navigation landmark. */
  sidebarLabel?: string;
  /** Accessible name of the aside's complementary landmark. */
  asideLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SiteLayoutProps
  extends SiteLayoutOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof SiteLayoutOwnProps> {}

/**
 * SiteLayout: the frame of a documentation or marketing site. A header, a
 * navigation sidebar, the main content, an aside and a footer, laid out by
 * independent choices: how wide the page runs (`width`), the header and
 * the footer each apart from it (`headerWidth`, `footerWidth`), where the
 * sidebar docks (`sidebarDock`) and where the aside sits
 * (`asidePlacement`); any combination holds. The sidebar sticks below the header and
 * scrolls on its own; below 1152px the aside gives way, and below 960px the
 * sidebar leaves the page to the header's own menu. A skip link comes first.
 */
export function SiteLayout({
  children,
  header,
  sidebar,
  aside,
  footer,
  width = 'contained',
  headerWidth,
  footerWidth,
  readingWidth = false,
  sidebarDock = 'content',
  asidePlacement = 'column',
  mainId = 'main',
  skipLinkLabel = 'Skip to content',
  sidebarLabel = 'Pages',
  asideLabel = 'On this page',
  className = '',
  ref,
  ...rest
}: SiteLayoutProps) {
  const baseClass = 'ds-site-layout';
  const classes = [
    baseClass,
    `${baseClass}--dock-${sidebarDock}`,
    sidebar ? `${baseClass}--with-sidebar` : '',
    aside && asidePlacement === 'column' ? `${baseClass}--with-aside` : '',
    aside && asidePlacement === 'edge' ? `${baseClass}--aside-edge` : '',
    readingWidth ? `${baseClass}--reading` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <main id={mainId} className={`${baseClass}__main`} tabIndex={-1}>
        {children}
      </main>
      {aside && (
        <aside className={`${baseClass}__aside`} aria-label={asideLabel}>
          {aside}
        </aside>
      )}
    </>
  );
  const sidebarColumn = sidebar && (
    <nav className={`${baseClass}__sidebar`} aria-label={sidebarLabel}>
      {sidebar}
    </nav>
  );

  return (
    <div {...rest} ref={ref} className={classes} data-ds-width={width}>
      {skipLinkLabel && (
        <Link variant="skip" href={`#${mainId}`}>
          {skipLinkLabel}
        </Link>
      )}
      {header && (
        <div className={`${baseClass}__header`} data-ds-width={headerWidth ?? width}>
          {header}
        </div>
      )}
      {sidebarDock === 'edge' ? (
        <div className={`${baseClass}__body`}>
          {sidebarColumn}
          <div className={`${baseClass}__row`}>{content}</div>
        </div>
      ) : (
        <div className={`${baseClass}__body`}>
          <div className={`${baseClass}__row`}>
            {sidebarColumn}
            {content}
          </div>
        </div>
      )}
      {footer && (
        <div className={`${baseClass}__footer`} data-ds-width={footerWidth ?? width}>
          <div className={`${baseClass}__footer-row`}>{footer}</div>
        </div>
      )}
    </div>
  );
}
