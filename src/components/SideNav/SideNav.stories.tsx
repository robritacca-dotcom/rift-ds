import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SideNav, type SideNavEntry } from './SideNav';

const flatItems = [
  { label: 'Overview', href: '#overview' },
  { label: 'Getting started', href: '#getting-started' },
  { label: 'Guides', href: '#guides' },
  { label: 'Changelog', href: '#changelog' },
];

const nestedItems = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Guides',
    href: '#guides',
    id: 'guides',
    items: [
      { label: 'Theming', href: '#theming' },
      { label: 'Migration', href: '#migration' },
    ],
  },
  {
    label: 'Reference',
    href: '#reference',
    id: 'reference',
    items: [
      { label: 'Tokens', href: '#tokens' },
      { label: 'Utilities', href: '#utilities' },
    ],
  },
];

const threeLevelItems = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Library',
    href: '#library',
    id: 'library',
    items: [
      {
        label: 'Primitives',
        href: '#primitives',
        id: 'primitives',
        items: [
          { label: 'Colour', href: '#colour' },
          { label: 'Spacing', href: '#spacing' },
        ],
      },
      { label: 'Patterns', href: '#patterns' },
    ],
  },
];

const meta = {
  title: 'Components/SideNav',
  component: SideNav,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    currentHref: { control: 'text' },
  },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rows with a leading icon, for a short menu where a picture helps a reader find the row. */
export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Overview', href: '#overview', icon: 'home' },
      { label: 'Guides', href: '#guides', icon: 'menu_book' },
      { label: 'Reference', href: '#reference', icon: 'code', badge: 'New' },
      { label: 'Settings', href: '#settings', icon: 'settings' },
    ],
    currentHref: '#guides',
  },
};

export const Default: Story = {
  args: {
    items: flatItems,
  },
};

export const Nested: Story = {
  args: {
    items: nestedItems,
    defaultExpandedIds: ['guides'],
  },
};

export const ThreeLevels: Story = {
  args: {
    items: threeLevelItems,
    defaultExpandedIds: ['library'],
    multiple: true,
  },
};

export const CurrentPage: Story = {
  args: {
    items: flatItems,
    currentHref: '#guides',
  },
};

export const Controlled: Story = {
  args: {
    items: nestedItems,
  },
  render: function ControlledStory(args) {
    const [expandedIds, setExpandedIds] = useState<string[]>(['guides']);
    return <SideNav {...args} expandedIds={expandedIds} onExpandedChange={setExpandedIds} />;
  },
};

export const MultipleOpen: Story = {
  args: {
    items: nestedItems,
    multiple: true,
    defaultExpandedIds: ['guides', 'reference'],
  },
};

export const StaticGroup: Story = {
  args: {
    items: [
      { label: 'Overview', href: '#overview' },
      {
        label: 'Foundations',
        href: '#foundations',
        collapsible: false,
        items: [
          { label: 'Colour', href: '#colour' },
          { label: 'Typography', href: '#typography' },
        ],
      },
    ],
  },
};

/**
 * The expansion contract from the keyboard: the chevron toggle is its own
 * tab stop beside the link, Enter and Space flip it, `aria-expanded` and the
 * toggle's name follow the state, single-open collapses the other section,
 * and a collapsed sublist is inert, so its links cannot take focus.
 */
export const KeyboardExpansion: Story = {
  args: {
    items: nestedItems,
    defaultExpandedIds: ['guides'],
    onExpandedChange: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    const collapseGuides = canvas.getByRole('button', { name: 'Collapse Guides' });
    const expandReference = canvas.getByRole('button', { name: 'Expand Reference' });
    await expect(collapseGuides).toHaveAttribute('aria-expanded', 'true');
    await expect(expandReference).toHaveAttribute('aria-expanded', 'false');

    // Collapsed: Tokens sits in an inert panel and refuses focus.
    const tokens = canvas.getByRole('link', { name: 'Tokens' });
    tokens.focus();
    await expect(tokens).not.toHaveFocus();

    // Tab order: Overview, Guides, its toggle, then the open section's links.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Guides' })).toHaveFocus();
    await userEvent.tab();
    await expect(collapseGuides).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Theming' })).toHaveFocus();

    // Enter on Reference's toggle opens it and, single-open, closes Guides.
    expandReference.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(['reference']);
    await expect(expandReference).toHaveAttribute('aria-expanded', 'true');
    await expect(expandReference).toHaveAccessibleName('Collapse Reference');
    await expect(expandReference).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Expand Guides' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    const theming = canvas.getByRole('link', { name: 'Theming' });
    theming.focus();
    await expect(theming).not.toHaveFocus();
    tokens.focus();
    await expect(tokens).toHaveFocus();

    // Space on the same toggle collapses it again.
    expandReference.focus();
    await userEvent.keyboard(' ');
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith([]);
    await expect(expandReference).toHaveAttribute('aria-expanded', 'false');
    tokens.focus();
    await expect(tokens).not.toHaveFocus();
  },
};

const PAGES = [
  'Accordion', 'Alert', 'Alert dialog', 'Avatar', 'Badge', 'Breadcrumb', 'Button', 'Calendar', 'Card', 'Carousel',
  'Checkbox', 'Code block', 'Combobox', 'Command', 'Context menu', 'Data table', 'Date picker', 'Dialog', 'Drawer',
  'Dropdown menu', 'Empty state', 'Field', 'Hover card', 'Input', 'Kbd', 'Label', 'Menubar', 'Pagination', 'Popover',
  'Progress', 'Radio group', 'Select', 'Separator', 'Sheet', 'Skeleton', 'Slider', 'Switch', 'Table', 'Tabs',
  'Textarea', 'Toast', 'Toggle', 'Tooltip',
];
const slug = (label: string) => label.toLowerCase().replace(/ /g, '-');

/** A documentation sidebar: titled sections, a long run of pages, a nested branch and badges. */
const DOCS_NAV: SideNavEntry[] = [
  {
    type: 'section',
    label: 'Getting started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
      {
        label: 'Theming',
        href: '/docs/theming',
        items: [
          { label: 'Colours', href: '/docs/theming/colours' },
          { label: 'Typography', href: '/docs/theming/typography' },
          { label: 'Dark mode', href: '/docs/theming/dark-mode' },
        ],
      },
      { label: 'CLI', href: '/docs/cli', badge: 'New' },
      { label: 'Changelog', href: '/docs/changelog' },
    ],
  },
  {
    type: 'section',
    label: 'Components',
    items: PAGES.map((label) => ({
      label,
      href: `/docs/components/${slug(label)}`,
      badge: label === 'Menubar' ? 'New' : undefined,
    })),
  },
  {
    type: 'section',
    label: 'Guides',
    collapsible: true,
    items: [
      { label: 'Forms', href: '/docs/guides/forms' },
      { label: 'Server rendering', href: '/docs/guides/server-rendering' },
      { label: 'Accessibility', href: '/docs/guides/accessibility' },
    ],
  },
];

/**
 * A long documentation sidebar: compact rows, sections, its own scroll that
 * stops at its ends, and the current page brought into view on load.
 */
export const DocsSidebar: Story = {
  args: {
    items: DOCS_NAV,
    size: 'compact',
    scrollable: true,
    currentHref: '/docs/components/menubar',
  },
  render: (args) => (
    <nav aria-label="Documentation" style={{ height: 480, width: 260, display: 'flex', flexDirection: 'column' }}>
      <SideNav {...args} />
    </nav>
  ),
};

/** The branch that holds the current page opens itself. */
export const OpensToCurrentPage: Story = {
  args: {
    items: DOCS_NAV.slice(0, 1),
    size: 'compact',
    currentHref: '/docs/theming/dark-mode',
  },
  play: async ({ canvasElement }) => {
    const current = canvasElement.querySelector('[aria-current="page"]');
    await expect(current).toHaveTextContent('Dark mode');
    await expect(current?.closest('[inert]')).toBeNull();
  },
};

/**
 * One open at a time means among siblings only: opening a row closes the
 * other open row beside it, never the open rows of another section.
 */
export const OneOpenAmongSiblings: Story = {
  args: {
    items: [
      {
        type: 'section',
        label: 'Guides',
        items: [
          { label: 'Forms', href: '#forms', items: [{ label: 'Validation', href: '#validation' }] },
          { label: 'Tables', href: '#tables', items: [{ label: 'Sorting', href: '#sorting' }] },
        ],
      },
      {
        type: 'section',
        label: 'Recipes',
        items: [{ label: 'Checkout', href: '#checkout', items: [{ label: 'Payment', href: '#payment' }] }],
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Forms' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Checkout' }));
    // A row in another section: Forms stays open.
    await expect(canvas.getByRole('button', { name: 'Collapse Forms' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Expand Tables' }));
    // A sibling: Forms closes, Checkout in the other section stays open.
    await expect(canvas.getByRole('button', { name: 'Expand Forms' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Collapse Checkout' })).toBeInTheDocument();
  },
};
