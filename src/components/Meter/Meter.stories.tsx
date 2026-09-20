import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';

const meta = {
  title: 'Components/Meter',
  component: Meter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Storage used',
    value: 64,
    showValue: true,
  },
};

export const CustomRange: Story = {
  args: {
    label: 'Context window',
    value: 128000,
    max: 200000,
    valueText: '128k of 200k tokens',
    showValue: true,
  },
};

export const NearCapacity: Story = {
  args: {
    label: 'Storage used',
    value: 92,
    variant: 'warning',
    showValue: true,
  },
};

export const Full: Story = {
  args: {
    label: 'Storage used',
    value: 100,
    variant: 'error',
    showValue: true,
  },
};

export const Positive: Story = {
  args: {
    label: 'Password strength',
    value: 80,
    variant: 'positive',
    valueText: 'Strong',
    showValue: true,
  },
};

export const Compact: Story = {
  args: {
    label: 'Battery',
    value: 45,
    size: 'compact',
    variant: 'neutral',
  },
};

export const BarOnly: Story = {
  args: {
    value: 30,
    'aria-label': 'Disk usage',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <Meter label="Info" value={60} showValue />
      <Meter label="Positive" value={80} variant="positive" showValue />
      <Meter label="Warning" value={90} variant="warning" showValue />
      <Meter label="Error" value={100} variant="error" showValue />
      <Meter label="Neutral" value={40} variant="neutral" showValue />
    </div>
  ),
};
