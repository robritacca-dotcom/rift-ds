import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnchorNav } from '../AnchorNav/AnchorNav';
import { Heading } from '../Heading/Heading';
import { SideNav, type SideNavEntry } from '../SideNav/SideNav';
import { Prose } from '../Prose/Prose';
import { SiteFooter } from '../SiteFooter/SiteFooter';
import { SiteHeader } from '../SiteHeader/SiteHeader';
import { SiteLayout } from './SiteLayout';

const PAGES = ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Card', 'Checkbox', 'Dialog', 'Menubar', 'Table', 'Tabs', 'Tooltip'];
const NAV: SideNavEntry[] = [
  {
    type: 'section',
    label: 'Getting started',
    items: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Installation', href: '#installation' },
    ],
  },
  { type: 'section', label: 'Components', items: PAGES.map((label) => ({ label, href: `#${label.toLowerCase()}` })) },
];

const article = (
  <article id="site-layout-article">
    <Heading level={1} tier="display-2">
      Installation
    </Heading>
    {['Install the package', 'Set up the theme', 'Your first component'].map((title) => (
      <section key={title}>
        <Heading level={2} anchor>
          {title}
        </Heading>
        <Prose>
          <p>
            A paragraph of documentation, long enough to show the reading width of the column it sits in and how the
            page's width setting moves it.
          </p>
        </Prose>
      </section>
    ))}
  </article>
);

const meta = {
  title: 'Components/SiteLayout',
  component: SiteLayout,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'radio', options: ['contained', 'full'] },
    containedWidth: { control: 'radio', options: ['narrow', 'default', 'wide'] },
    headerWidth: { control: 'radio', options: ['contained', 'full'] },
    footerWidth: { control: 'radio', options: ['contained', 'full'] },
    sidebarDock: { control: 'radio', options: ['content', 'edge'] },
    asidePlacement: { control: 'radio', options: ['column', 'edge'] },
    readingWidth: { control: 'boolean' },
  },
  args: {
    width: 'contained',
    sidebarDock: 'content',
    asidePlacement: 'column',
    readingWidth: false,
    children: article,
  },
  render: (args) => (
    <SiteLayout
      {...args}
      header={<SiteHeader brand="Acme" sticky={false} sections={[{ id: 'docs', label: 'Docs', href: '#docs' }, { id: 'blog', label: 'Blog', href: '#blog' }]} currentHref="#docs" />}
      sidebar={<SideNav items={NAV} size="compact" scrollable currentHref="#installation" />}
      aside={
        <AnchorNav
          fromHeadings={{ root: '#site-layout-article' }}
          variant={args.asidePlacement === 'edge' ? 'floating' : undefined}
        />
      }
      footer={<SiteFooter brand="Acme" columns={[{ label: 'Docs', links: [{ label: 'Introduction', href: '#introduction' }] }]} legal="© 2026 Acme." />}
    />
  ),
} satisfies Meta<typeof SiteLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Contained: the header, the three columns and the footer centre together at the contained width. */
export const Default: Story = {};

/** The sidebar docked to the window's edge, the content still contained in the room after it. */
export const EdgeDocked: Story = {
  args: { sidebarDock: 'edge' },
};

/** Full width: every row runs edge to edge, the gutter aside. */
export const FullWidth: Story = {
  args: { width: 'full', sidebarDock: 'edge' },
};

/** The on-this-page rail pinned to the window's end edge as AnchorNav's floating minimap, the content keeping the column's room. */
export const FloatingAside: Story = {
  args: { sidebarDock: 'edge', asidePlacement: 'edge' },
  render: (args) => (
    <SiteLayout
      {...args}
      header={<SiteHeader brand="Acme" width="full" sticky={false} sections={[{ id: 'docs', label: 'Docs', href: '#docs' }]} currentHref="#docs" />}
      sidebar={<SideNav items={NAV} size="compact" scrollable currentHref="#installation" />}
      aside={<AnchorNav fromHeadings={{ root: '#site-layout-article' }} variant="floating" />}
    />
  ),
};

/** Docked to the edge, the header and the footer go full width with the sidebar, over a contained page: the frame moves as one. */
export const EdgeFrame: Story = {
  args: { width: 'contained', sidebarDock: 'edge' },
};

/** A reading measure: while the page is contained, the main column holds about 75 characters. */
export const ReadingWidth: Story = {
  args: { readingWidth: true, sidebarDock: 'edge', asidePlacement: 'edge' },
};

/** Room reserved at the end edge, as for a docked chat: the frame and the floating aside step in together. */
export const ReservedEnd: Story = {
  args: { sidebarDock: 'edge', asidePlacement: 'edge', style: { '--ds-site-layout-reserve-end': '320px' } as React.CSSProperties },
};

/** No sidebar and no aside: the frame holds the content alone, at either width. */
export const ContentOnly: Story = {
  args: { sidebar: undefined, aside: undefined, readingWidth: true },
  render: (args) => (
    <SiteLayout
      {...args}
      header={<SiteHeader brand="Acme" sticky={false} sections={[{ id: 'docs', label: 'Docs', href: '#docs' }]} currentHref="#docs" />}
      footer={<SiteFooter brand="Acme" legal="© 2026 Acme." />}
    />
  ),
};

/** The reverse mix: a full-width page under a contained header and footer, a contained row nested in a full one. */
export const FullPageContainedHeader: Story = {
  args: { width: 'full', headerWidth: 'contained', footerWidth: 'contained', sidebarDock: 'content' },
};

/** A level narrower: the contained width at its narrow step (1200px, a 1080px article beside the edge-docked sidebar); the header and the footer run full with the edge dock, the mega menu capped at the step. */
export const NarrowContained: Story = {
  args: { containedWidth: 'narrow', sidebarDock: 'edge' },
};
