/**
 * The shell the marketing blocks sit in: rift-ds's SiteHeader over the page
 * and a SiteFooter under it, sharing one page width. `Band` is the
 * full-width strip every section of a marketing page is: a surface running
 * edge to edge with its content held to one centred width. This file is
 * yours: rename the product, replace the sections and the footer's columns
 * with your own.
 *
 * A page is a stack of bands. Alternate `surface` between `page` and
 * `raised` to separate one section from the next with no rule between
 * them, and pass `width="narrow"` for a band of reading copy (a FAQ, a
 * closing line).
 */

import type { ReactNode } from 'react';
import { Button } from 'rift-ds/components/Button/Button';
import { SiteFooter, type SiteFooterColumn } from 'rift-ds/components/SiteFooter/SiteFooter';
import { SiteHeader, type SiteHeaderSection } from 'rift-ds/components/SiteHeader/SiteHeader';
import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';
import styles from './MarketingShell.module.css';

/** The product's name, shown in the header and the footer. */
const PRODUCT_NAME = 'Acme';

/**
 * How wide the page's column runs: `narrow` (1200px), `default` (1440px)
 * or `wide` (1680px). The header, every band and the footer read it, so
 * they share one pair of edges.
 */
const PAGE_WIDTH: 'narrow' | 'default' | 'wide' = 'narrow';

/**
 * The header's sections. Point each `href` at the route it opens in your
 * app (the placeholders are fragments, so the block works before those
 * routes exist), and give one a `mega` menu when it has pages of its own.
 */
const SECTIONS: SiteHeaderSection[] = [
  { id: 'product', label: 'Product', href: '#product' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'docs', label: 'Docs', href: '#docs' },
];

/** The footer's sitemap. */
const FOOTER_COLUMNS: SiteFooterColumn[] = [
  {
    label: 'Product',
    links: [
      { label: 'Overview', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

export interface MarketingShellProps {
  /** The path of the page being shown, which marks its section in the header. */
  currentHref?: string;
  /** The page: a stack of bands. */
  children: ReactNode;
}

export function MarketingShell({ currentHref, children }: MarketingShellProps) {
  return (
    <div className={styles.shell} data-ds-width="contained" data-ds-contained={PAGE_WIDTH}>
      <SiteHeader
        brand={<span className={styles.brand}>{PRODUCT_NAME}</span>}
        sections={SECTIONS}
        currentHref={currentHref}
        width="contained"
        actions={<ThemeToggle size="compact" cycle />}
        wideActions={
          <>
            <Button variant="tertiary" label="Sign in" href="#" />
            <Button variant="primary" label="Get started" href="#" />
          </>
        }
        drawerFooter={
          <>
            <Button variant="secondary" tone="neutral" label="Sign in" href="#" />
            <Button variant="primary" label="Get started" href="#" />
          </>
        }
      />
      <main className={styles.main}>{children}</main>
      {/* The footer sits in the same column as the bands. */}
      <div className={`${styles.inner} ${styles.footer}`}>
        <SiteFooter
          brand={<span className={styles.brand}>{PRODUCT_NAME}</span>}
          description="The one place your team plans, ships and learns."
          columns={FOOTER_COLUMNS}
          legal={`© ${PRODUCT_NAME}, Inc.`}
        />
      </div>
    </div>
  );
}

export interface BandProps {
  /** The strip's fill: the page's own, or the raised surface that sets a section apart. */
  surface?: 'page' | 'raised';
  /** How wide the content runs: the page's width, or a reading measure. */
  width?: 'default' | 'narrow';
  /** How much room the strip gives above and below its content. */
  spacing?: 'default' | 'large';
  /** An id on the section, for a link to it. */
  id?: string;
  /** Names the section for assistive technology when it has no heading of its own. */
  'aria-label'?: string;
  children: ReactNode;
}

export function Band({ surface = 'page', width = 'default', spacing = 'default', id, children, ...rest }: BandProps) {
  const classes = [
    styles.band,
    surface === 'raised' ? styles.bandRaised : '',
    spacing === 'large' ? styles.bandLarge : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section id={id} className={classes} aria-label={rest['aria-label']}>
      <div className={width === 'narrow' ? `${styles.inner} ${styles.innerNarrow}` : styles.inner}>{children}</div>
    </section>
  );
}
