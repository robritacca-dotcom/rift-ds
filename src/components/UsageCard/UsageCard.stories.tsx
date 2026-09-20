import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsageCard } from './UsageCard';

const meta = {
  title: 'Components/UsageCard',
  component: UsageCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof UsageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Usage',
    subtitle: 'Plan limits and the current session',
    items: [
      {
        label: 'Context window',
        value: 126000,
        max: 200000,
        valueText: '126k / 200k tokens',
      },
      {
        label: 'Weekly limit',
        value: 38,
        resetLabel: 'Resets Tuesday, 3:00 pm',
      },
      {
        label: 'Session limit',
        value: 12,
        resetLabel: 'Resets in 2 h 40 min',
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <UsageCard {...args} />
    </div>
  ),
};

export const NearLimits: Story = {
  args: {
    title: 'Usage',
    items: [
      { label: 'Context window', value: 182000, max: 200000, valueText: '182k / 200k tokens' },
      { label: 'Weekly limit', value: 97, resetLabel: 'Resets Tuesday, 3:00 pm' },
      { label: 'Session limit', value: 84, resetLabel: 'Resets in 25 min' },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <UsageCard {...args} />
    </div>
  ),
};

export const CustomReadouts: Story = {
  args: {
    title: 'Budgets',
    subtitle: 'Custom readouts and a pinned status',
    items: [
      { label: 'Monthly spend', value: 41, valueText: '$8.20 of $20.00' },
      { label: 'Stored files', value: 3, max: 50, valueText: '3 of 50 files' },
      { label: 'Archived quota', value: 100, valueText: 'Frozen', variant: 'neutral' },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <UsageCard {...args} />
    </div>
  ),
};

export const Bare: Story = {
  args: {
    title: 'Usage',
    bare: true,
    items: [
      { label: 'Context window', value: 64, resetLabel: 'Compacts automatically when full' },
      { label: 'Weekly limit', value: 22, resetLabel: 'Resets Tuesday, 3:00 pm' },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <UsageCard {...args} />
    </div>
  ),
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        label: 'Context window',
        value: 126000,
        max: 200000,
        valueText: '126k / 200k tokens',
      },
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <UsageCard {...args} />
    </div>
  ),
};
