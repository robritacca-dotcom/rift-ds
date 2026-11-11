import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../Button/Button';
import { MegaMenu, type MegaMenuItem, type MegaMenuShowcase } from './MegaMenu';

const ITEMS: MegaMenuItem[] = [
  { href: '#/guides', label: 'Guides', description: 'Step-by-step walkthroughs from install to first release.', icon: 'menu_book' },
  { href: '#/recipes', label: 'Recipes', description: 'Short answers to the questions that come up every week.', icon: 'restaurant' },
  { href: '#/api', label: 'API reference', description: 'Every endpoint, parameter and error, generated from source.', icon: 'data_object' },
  { href: '#/changelog', label: 'Changelog', description: 'What changed in each version and how to move to it.', icon: 'history' },
  { href: '#/examples', label: 'Examples', description: 'Small complete apps to copy from.', icon: 'deployed_code' },
  { href: '#/community', label: 'Community', description: 'Forums, office hours and the people answering in them.', icon: 'forum' },
];

/** A token-drawn cover: rows of bars, the kind of vector a showcase card carries. */
function Cover() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 150" preserveAspectRatio="xMinYMin slice">
      <rect width="200" height="150" fill="var(--color-bg-container-secondary)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x="24"
          y={20 + i * 18}
          width={60 + ((i * 37) % 100)}
          height="8"
          rx="4"
          fill="var(--color-text-tertiary)"
          opacity={0.6 - i * 0.08}
        />
      ))}
    </svg>
  );
}

const SHOWCASE: MegaMenuShowcase = {
  href: '#/start',
  overline: 'New here',
  label: 'Start with the tour',
  description: 'Ten minutes from an empty folder to a deployed app.',
  cover: <Cover />,
};

const meta = {
  title: 'Components/MegaMenu',
  component: MegaMenu,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    items: ITEMS,
    showcase: SHOWCASE,
  },
  argTypes: {
    open: { control: 'boolean' },
  },
} satisfies Meta<typeof MegaMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The link grid beside a featured card. */
export const Default: Story = {};

/** No showcase: the grid takes the whole panel and wraps into a third column. */
export const WithoutShowcase: Story = {
  args: { showcase: undefined },
};

/* Thirteen rows: more than three columns of four can hold beside a showcase. */
const LONG_ITEMS: MegaMenuItem[] = Array.from({ length: 13 }, (_, i) => ({
  ...ITEMS[i % ITEMS.length],
  href: `${ITEMS[i % ITEMS.length].href}-${i}`,
}));

/**
 * A long menu: every column deepens before another opens, so thirteen rows
 * beside a showcase sit in three columns of five, five and three rather
 * than leaving a fourth column holding one row.
 */
export const LongMenu: Story = {
  args: { items: LONG_ITEMS },
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('.ds-mega-menu__item')];
    const columns = new Set(rows.map((row) => Math.round(row.getBoundingClientRect().left)));
    await expect(rows).toHaveLength(13);
    await expect(columns.size).toBe(3);
  },
};

/** The page being viewed is marked on its row, one step past the hover wash. */
export const CurrentPage: Story = {
  args: { currentHref: '#/api' },
};

/**
 * Hosted: the panel is controlled by design, so the host owns the trigger
 * and the state. SiteHeader is the full reference host.
 */
export const Hosted: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--gap-300)', justifyItems: 'start' }}>
        <Button
          variant="secondary"
          aria-expanded={open}
          aria-controls="mega-menu-hosted"
          onClick={() => setOpen((o) => !o)}
        >
          Resources
        </Button>
        <MegaMenu {...args} id="mega-menu-hosted" open={open} onNavigate={() => setOpen(false)} />
      </div>
    );
  },
};
