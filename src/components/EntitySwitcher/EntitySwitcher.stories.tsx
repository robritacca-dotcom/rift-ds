import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EntitySwitcher, type EntitySwitcherItem } from './EntitySwitcher';
import { AppSidebar } from '../AppSidebar/AppSidebar';

/* Inline SVG logos so stories don't depend on network images. */
const logo = (fill: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${fill}"/><text x="32" y="42" font-family="sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">${letter}</text></svg>`,
  )}`;

const InlineMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2 22 20H2Z" />
  </svg>
);

/** Company, business unit, department, advertiser: four levels. */
const nested: EntitySwitcherItem[] = [
  {
    id: 'northwind',
    name: 'Northwind Group',
    description: 'Holding company',
    children: [
      {
        id: 'consumer',
        name: 'Consumer',
        description: 'Business unit',
        children: [
          {
            id: 'growth',
            name: 'Growth marketing',
            description: 'Department',
            children: [
              { id: 'larkspur', name: 'Larkspur Coffee', description: 'Advertiser' },
              { id: 'tidewater', name: 'Tidewater Cycles', description: 'Advertiser' },
            ],
          },
          { id: 'brand', name: 'Brand', description: 'Department' },
          { id: 'lifecycle', name: 'Lifecycle', description: 'Department' },
        ],
      },
      { id: 'enterprise', name: 'Enterprise', description: 'Business unit' },
      { id: 'labs', name: 'Labs', description: 'Business unit', disabled: true },
    ],
  },
  { id: 'halcyon', name: 'Halcyon Studio', description: 'Agency client' },
];

/** Every kind of mark: a logo image, a Material Symbol, an inline element, initials. */
const marks: EntitySwitcherItem[] = [
  { id: 'acme', name: 'Acme Outfitters', description: 'Logo image', logo: logo('#3D5AFE', 'A') },
  { id: 'harbor', name: 'Harbor Health', description: 'Material Symbol', icon: 'local_hospital' },
  { id: 'peak', name: 'Peak Analytics', description: 'Inline SVG', icon: <InlineMark /> },
  { id: 'quill', name: 'Quill & Co', description: 'Initials' },
];

const meta = {
  title: 'Components/EntitySwitcher',
  component: EntitySwitcher,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 256 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    collapsed: { control: 'boolean' },
    searchThreshold: { control: 'number' },
  },
  args: {
    items: nested,
    defaultValue: 'growth',
    switcherLabel: 'Switch workspace',
  },
} satisfies Meta<typeof EntitySwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A nested tree: rows with children drill in, each level led by its parent. */
export const Default: Story = {};

/** A flat list, one per mark kind: whatever the data carries draws the tile. */
export const Marks: Story = {
  args: { items: marks, defaultValue: 'acme' },
};

/** One entity: still says which one you are in. */
export const Single: Story = {
  args: { items: [{ id: 'solo', name: 'Quill & Co', description: 'Team space' }], defaultValue: 'solo' },
};

/** Past the threshold, a search across every level, each result with its path. */
export const Searchable: Story = {
  args: { searchThreshold: 4 },
};

/** Truncated, never wrapped. */
export const LongNames: Story = {
  args: {
    items: [
      {
        id: 'long',
        name: 'International Consumer Growth Marketing and Partnerships',
        description: 'Department of Revenue Operations, Europe, Middle East and Africa',
      },
    ],
    defaultValue: 'long',
  },
};

/** The mark alone, for a collapsed rail; the panel opens beside it. */
export const Collapsed: Story = {
  args: { collapsed: true },
};

/** Under AppSidebar's brand row, following the rail as it collapses. */
export const InSidebar: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 480 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <AppSidebar
      sections={[
        {
          items: [
            { key: 'home', icon: 'home', label: 'Home' },
            { key: 'campaigns', icon: 'campaign', label: 'Campaigns' },
          ],
        },
      ]}
      activeKey="campaigns"
      subNav="panel"
      persistentTopSlot
      topSlot={<EntitySwitcher {...args} />}
    />
  ),
};

/** Opens on the selection's level, climbs out, drills in, picks a leaf. */
export const Navigates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Switch workspace: Growth marketing/ });
    await userEvent.click(trigger);
    const back = await canvas.findByRole('menuitem', { name: /Back to Consumer/ });
    await userEvent.click(back);
    await userEvent.click(await canvas.findByRole('menuitem', { name: /Growth marketing/ }));
    await userEvent.click(await canvas.findByRole('menuitemradio', { name: /Tidewater Cycles/ }));
    await expect(canvas.getByRole('button', { name: /Switch workspace: Tidewater Cycles/ })).toBeVisible();
  },
};
