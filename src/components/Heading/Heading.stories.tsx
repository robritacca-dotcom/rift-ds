import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Heading } from './Heading';

const TIERS = [
  'mega-1',
  'mega-2',
  'display-1',
  'display-2',
  'sub-display',
  'heading-1',
  'heading-2',
  'heading-3',
  'title-body',
] as const;

const meta = {
  title: 'Components/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    tier: { control: 'select', options: TIERS },
    tone: { control: 'inline-radio', options: ['default', 'neutral'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  args: { children: 'Quarterly statements', level: 2 },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every tier, from the largest; each is an `h2` so only the look changes. */
export const Tiers: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)' }}>
      {TIERS.map((tier) => (
        <Heading key={tier} {...args} tier={tier}>
          {tier}
        </Heading>
      ))}
    </div>
  ),
};

/** The outline and the look chosen apart: a page's `h1` as a display line, and an `h2` in the small title tier. */
export const LevelApartFromTier: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)' }}>
      <Heading level={1} tier="display-2">
        Get paid faster
      </Heading>
      <Heading level={2} tier="title-body">
        Invoice INV-2041
      </Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Get paid faster' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 2, name: 'Invoice INV-2041' })).toBeInTheDocument();
  },
};

/** A quieter title for a section inside a settings page. */
export const Neutral: Story = {
  args: { level: 3, tier: 'heading-3', tone: 'neutral', children: 'Notification settings' },
};

/** A card title that keeps to one line, and a marketing line balanced across two. */
export const Wrapping: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-500)', maxInlineSize: '320px' }}>
      <Heading level={3} tier="title-body" truncate>
        Northwind supply agreement, renewal draft for review
      </Heading>
      <Heading level={2} tier="heading-1" balance>
        Every payment, invoice and payout in one place
      </Heading>
    </div>
  ),
};

export const Centred: Story = {
  args: { tier: 'heading-1', align: 'center', children: 'Welcome aboard' },
};
