'use client';
/**
 * The documentation shell the docs block sits in: rift-ds's SiteLayout
 * holding a site header (search and colour mode), a long sidebar of pages,
 * the article with its breadcrumb, an on-this-page rail read from the
 * article's headings, and a sitemap footer. This file is yours: rename the
 * product, replace the navigation and the footer with your own, and wire
 * the search to your command palette.
 *
 * Three settings below lay it out, each independent of the others:
 * PAGE_WIDTH (the columns contained at 1440px or full width), HEADER_WIDTH
 * (the same for the header bar) and SIDEBAR_DOCK (the sidebar docked to the
 * window's edge, or beside the content in the page's row).
 *
 * Responsive by construction: below 1152px the on-this-page rail gives
 * way, and below 960px the sidebar leaves the page and the header's menu
 * carries its pages (each section's drawerItems), so there is one menu.
 */

import type { ReactNode } from 'react';
import { AnchorNav } from 'rift-ds/components/AnchorNav/AnchorNav';
import { BackToTop } from 'rift-ds/components/BackToTop/BackToTop';
import { Breadcrumb, type BreadcrumbItem } from 'rift-ds/components/Breadcrumb/Breadcrumb';
import { CommandPaletteTrigger } from 'rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger';
import { NavList, type NavListEntry } from 'rift-ds/components/NavList/NavList';
import { SiteFooter, type SiteFooterColumn } from 'rift-ds/components/SiteFooter/SiteFooter';
import { SiteHeader, type SiteHeaderSection } from 'rift-ds/components/SiteHeader/SiteHeader';
import { SiteLayout } from 'rift-ds/components/SiteLayout/SiteLayout';
import { ThemeToggle } from 'rift-ds/components/ThemeToggle/ThemeToggle';
import styles from './DocsShell.module.css';

/** How wide the page's columns run: centred at 1440px, or the full window. */
const PAGE_WIDTH: 'contained' | 'full' = 'full';

/** How wide the header bar runs, apart from the page: the same two values. */
const HEADER_WIDTH: 'contained' | 'full' = 'full';

/** Where the sidebar sits: docked to the window's start edge, or beside the content in the page's row. */
const SIDEBAR_DOCK: 'edge' | 'content' = 'edge';

/** The product's name, shown in the header and the footer. */
const PRODUCT_NAME = 'Acme';


/** Every page of the docs, in sections; a long list scrolls inside the sidebar. */
const COMPONENT_PAGES = [
  'Accordion', 'Alert', 'Avatar', 'Badge', 'Breadcrumb', 'Button', 'Calendar', 'Card', 'Checkbox', 'Code block',
  'Combobox', 'Dialog', 'Drawer', 'Dropdown menu', 'Field', 'Input', 'Menubar', 'Pagination', 'Popover', 'Select',
  'Slider', 'Switch', 'Table', 'Tabs', 'Toast', 'Tooltip',
];
const NAV: NavListEntry[] = [
  {
    type: 'section',
    label: 'Getting started',
    items: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Installation', href: '/guide' },
      {
        label: 'Theming',
        href: '#theming',
        items: [
          { label: 'Colours', href: '#theming-colours' },
          { label: 'Dark mode', href: '#theming-dark-mode' },
        ],
      },
      { label: 'CLI', href: '#cli', badge: 'New' },
    ],
  },
  {
    type: 'section',
    label: 'Components',
    items: COMPONENT_PAGES.map((label) => ({ label, href: `#${label.toLowerCase().replace(/ /g, '-')}` })),
  },
  {
    type: 'section',
    label: 'Guides',
    collapsible: true,
    items: [
      { label: 'Forms', href: '#guide-forms' },
      { label: 'Server rendering', href: '#guide-server-rendering' },
    ],
  },
];

/**
 * The header's top-level sections. Each lists its pages as drawerItems: on a
 * phone the sidebar leaves the page and the header's one menu carries them.
 */
const SECTIONS: SiteHeaderSection[] = [
  {
    id: 'docs',
    label: 'Docs',
    href: '/guide',
    drawerItems: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Installation', href: '/guide' },
      { label: 'Theming', href: '#theming' },
      { label: 'CLI', href: '#cli' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    href: '#components',
    drawerItems: COMPONENT_PAGES.map((label) => ({ label, href: `#${label.toLowerCase().replace(/ /g, '-')}` })),
  },
  { id: 'changelog', label: 'Changelog', href: '#changelog' },
];

/** The footer's sitemap. */
const FOOTER_COLUMNS: SiteFooterColumn[] = [
  { title: 'Docs', links: [{ label: 'Introduction', href: '#introduction' }, { label: 'Installation', href: '/guide' }] },
  { title: 'Components', links: [{ label: 'Button', href: '#button' }, { label: 'Table', href: '#table' }] },
  { title: 'Community', links: [{ label: 'Discussions', href: 'https://example.com/discussions', external: true }] },
];

export interface DocsShellProps {
  /** The href of this page, which the sidebar marks as current. */
  currentHref: string;
  /** The page's place in the docs, ending with the page itself. */
  breadcrumb: BreadcrumbItem[];
  /** The article: its h1, then its sections, each opened by an h2. */
  children: ReactNode;
}

export function DocsShell({ currentHref, breadcrumb, children }: DocsShellProps) {
  return (
    <SiteLayout
      width={PAGE_WIDTH}
      footerWidth={HEADER_WIDTH}
      sidebarDock={SIDEBAR_DOCK}
      mainId="docs-article"
      header={
        <SiteHeader
          brand={<span className={styles.brand}>{PRODUCT_NAME}</span>}
          sections={SECTIONS}
          currentHref="/guide"
          width={HEADER_WIDTH}
          foldBelow="tablet"
          actions={
            <>
              {/* Wire it to your command palette: CommandPalette from rift-ds,
                  opened from here and from Cmd+K. */}
              <CommandPaletteTrigger label="Search the docs" size="compact" />
              <ThemeToggle showLabels={false} size="compact" />
            </>
          }
          condensedActions={
            <>
              {/* The same two at their narrowest, for a phone: the bar uses
                  these before it folds. */}
              <CommandPaletteTrigger label="Search the docs" size="compact" iconOnly />
              <ThemeToggle size="compact" cycle />
            </>
          }
        />
      }
      sidebar={
        <NavList
          items={NAV}
          size="compact"
          scrollable
          currentHref={currentHref}
        />
      }
      aside={<AnchorNav fromHeadings={{ root: '#docs-article' }} />}
      footer={
        <SiteFooter
          brand={PRODUCT_NAME}
          description="Components and guides for building the Acme app."
          columns={FOOTER_COLUMNS}
          legal={`© ${new Date().getFullYear()} ${PRODUCT_NAME}.`}
        />
      }
    >
      <Breadcrumb items={breadcrumb} />
      <div className={styles.article}>{children}</div>
      <BackToTop focusTarget="docs-article" />
    </SiteLayout>
  );
}
