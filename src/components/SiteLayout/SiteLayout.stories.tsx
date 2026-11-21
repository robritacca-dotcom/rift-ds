import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnchorNav } from '../AnchorNav/AnchorNav';
import { Heading } from '../Heading/Heading';
import { NavList, type NavListEntry } from '../NavList/NavList';
import { Prose } from '../Prose/Prose';
import { SiteFooter } from '../SiteFooter/SiteFooter';
import { SiteHeader } from '../SiteHeader/SiteHeader';
import { SiteLayout } from './SiteLayout';

const PAGES = ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Card', 'Checkbox', 'Dialog', 'Menubar', 'Table', 'Tabs', 'Tooltip'];
const NAV: NavListEntry[] = [
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
    sidebarDock: { control: 'radio', options: ['content', 'edge'] },
  },
  args: {
    width: 'contained',
    sidebarDock: 'content',
    children: article,
  },
  render: (args) => (
    <SiteLayout
      {...args}
      header={<SiteHeader brand="Acme" width={args.width} sticky={false} sections={[{ id: 'docs', label: 'Docs', href: '#docs' }, { id: 'blog', label: 'Blog', href: '#blog' }]} currentHref="#docs" />}
      sidebar={<NavList items={NAV} size="compact" scrollable currentHref="#installation" />}
      aside={<AnchorNav fromHeadings={{ root: '#site-layout-article' }} />}
      footer={<SiteFooter brand="Acme" columns={[{ title: 'Docs', links: [{ label: 'Introduction', href: '#introduction' }] }]} legal="© 2026 Acme." />}
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
      sidebar={<NavList items={NAV} size="compact" scrollable currentHref="#installation" />}
      aside={<AnchorNav fromHeadings={{ root: '#site-layout-article' }} variant="floating" />}
    />
  ),
};
