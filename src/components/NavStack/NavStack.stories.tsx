import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { Input } from '../Input/Input';
import { NavStack, type NavStackEntry } from './NavStack';

/* A fictional product's site menu: prominent sections, a group that
   drills into links off-site, and settings that drill into choices. */
const siteMenu = (mode: string, setMode: (value: string) => void): NavStackEntry[] => [
  {
    type: 'section',
    variant: 'prominent',
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
          onSelect: () => setMode(option),
        })),
      },
    ],
  },
];

function SiteMenu(props: Partial<React.ComponentProps<typeof NavStack>>) {
  const [mode, setMode] = useState('System');
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <NavStack items={siteMenu(mode, setMode)} currentHref="#theming" {...props} />
    </div>
  );
}

const meta = {
  title: 'Components/NavStack',
  component: NavStack,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: [], onNavigate: fn(), onPathChange: fn() },
} satisfies Meta<typeof NavStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <SiteMenu onNavigate={args.onNavigate} onPathChange={args.onPathChange} />,
  play: async ({ canvas, userEvent, args }) => {
    // Drilling in moves focus to the new level's title.
    await userEvent.click(canvas.getByRole('button', { name: /Guides/ }));
    await expect(args.onPathChange).toHaveBeenLastCalledWith(['guides']);
    const title = await canvas.findByRole('heading', { name: 'Guides' });
    await waitFor(() => expect(title).toHaveFocus());
    // The current page is marked, and the overview row links the level's page.
    await expect(canvas.getByRole('link', { name: 'Theming' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: 'Guides overview' })).toHaveAttribute('href', '#guides');
    // Stepping out returns focus to the row it came from.
    await userEvent.click(canvas.getByRole('button', { name: 'Back to Menu' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: /Guides/ })).toHaveFocus());
  },
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
      header={<Input type="search" iconLeft="search" placeholder="Search" ariaLabel="Search" />}
    />
  ),
};
