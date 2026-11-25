import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Input } from '../Input/Input';
import { DrillMenu, type DrillMenuEntry } from './DrillMenu';

/* A fictional product's site menu: its sections at the default row size,
   as the site header's and the app sidebar's drawers draw them, a group
   that drills into links off-site, and settings that drill into choices. */
const siteMenu = (mode: string, setMode: (value: string) => void): DrillMenuEntry[] => [
  {
    type: 'section',
    items: [
      {
        label: 'Guides',
        href: '#guides',
        id: 'guides',
        items: [
          { label: 'Getting started', href: '#getting-started', icon: 'rocket_launch' },
          { label: 'Theming', href: '#theming', icon: 'palette' },
          {
            label: 'Recipes',
            id: 'recipes',
            icon: 'menu_book',
            items: [
              { label: 'Forms', href: '#forms' },
              { label: 'Tables', href: '#tables' },
            ],
          },
        ],
      },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#changelog' },
    ],
  },
  {
    type: 'section',
    items: [
      {
        label: 'Resources',
        value: 'Source, package',
        id: 'resources',
        items: [
          { label: 'Source', description: 'Code and issues', href: 'https://example.com/source', icon: 'code', external: true },
          { label: 'Package', description: 'Install it', href: 'https://example.com/package', icon: 'inventory_2', external: true },
        ],
      },
    ],
  },
  {
    type: 'section',
    label: 'Appearance',
    items: [
      {
        label: 'Mode',
        icon: 'contrast',
        value: mode,
        id: 'mode',
        items: ['System', 'Light', 'Dark'].map((option) => ({
          label: option,
          selected: option === mode,
          onClick: () => setMode(option),
        })),
      },
    ],
  },
];

function SiteMenu(props: Partial<React.ComponentProps<typeof DrillMenu>>) {
  const [mode, setMode] = useState('System');
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <DrillMenu items={siteMenu(mode, setMode)} currentHref="#theming" {...props} />
    </div>
  );
}

const meta = {
  title: 'Components/DrillMenu',
  component: DrillMenu,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: [], onNavigate: fn(), onPathChange: fn() },
} satisfies Meta<typeof DrillMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** With no `defaultPath`, the stack opens on the level that holds the current page, so a reader deep in a section reopens the menu where they are. */
export const Default: Story = {
  render: (args) => <SiteMenu onNavigate={args.onNavigate} onPathChange={args.onPathChange} />,
  play: async ({ canvas, userEvent, args }) => {
    // It opens on Guides, which holds the current page, with that page marked
    // and the overview row linking the level's page.
    await expect(canvas.getByRole('heading', { name: 'Guides' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Theming' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Guides overview' })).toHaveAttribute('href', '#guides');
    // Stepping out returns focus to the row it came from.
    await userEvent.click(canvas.getByRole('button', { name: 'Back to Menu' }));
    await expect(args.onPathChange).toHaveBeenLastCalledWith([]);
    await waitFor(() => expect(canvas.getByRole('button', { name: /Guides/ })).toHaveFocus());
    // Drilling in moves focus to the new level's title.
    await userEvent.click(canvas.getByRole('button', { name: /Guides/ }));
    await expect(args.onPathChange).toHaveBeenLastCalledWith(['guides']);
    const title = await canvas.findByRole('heading', { name: 'Guides' });
    await waitFor(() => expect(title).toHaveFocus());
  },
};

/** `defaultPath={[]}` opens on the first level whatever the current page. */
export const FirstLevel: Story = {
  render: () => <SiteMenu defaultPath={[]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Guides/ })).toBeVisible();
  },
};

/** `variant="prominent"` sets a section's rows in the heading-3 face on a taller row, for a menu that wants its top level louder than the default rows the site header and the app sidebar use. */
export const ProminentSections: Story = {
  render: () => (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <DrillMenu
        defaultPath={[]}
        items={[
          {
            type: 'section',
            variant: 'prominent',
            items: [
              { label: 'Guides', href: '#guides' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Blog', href: '#blog' },
            ],
          },
        ]}
      />
    </div>
  ),
};

/** A setting drills into its choices: the chosen one carries the mark and its value shows on the row above. */
export const Choices: Story = {
  render: () => <SiteMenu defaultPath={['mode']} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Dark' }));
    await expect(canvas.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Back to Menu' }));
    await expect(canvas.getByRole('button', { name: /Mode/ })).toHaveTextContent('Dark');
  },
};

/** Rows with a second line, an icon and an outward arrow, for links that leave the site. */
export const Descriptions: Story = {
  render: () => <SiteMenu defaultPath={['resources']} />,
};

/** Three levels deep, opened on the deepest: each back row names the level it returns to. */
export const Nested: Story = {
  render: () => <SiteMenu defaultPath={['guides', 'recipes']} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Back to Guides' })).toBeVisible();
  },
};

/** A host that owns the path, such as one that reopens the menu where the reader left it. */
export const Controlled: Story = {
  render: function Render() {
    const [path, setPath] = useState<string[]>([]);
    return (
      <div>
        <p>Path: {path.length ? path.join(' / ') : 'first level'}</p>
        <SiteMenu path={path} onPathChange={setPath} />
      </div>
    );
  },
};

/** A header above the first level, such as a search field; it leaves with the first level. */
export const WithHeader: Story = {
  render: () => (
    <SiteMenu
      header={<Input type="search" iconLeft="search" placeholder="Search" aria-label="Search" />}
    />
  ),
};
