import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusDot } from './StatusDot';

const meta = {
  title: 'Components/StatusDot',
  component: StatusDot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    pulse: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'positive',
    label: 'Operational',
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <StatusDot variant="info" label="Syncing" />
      <StatusDot variant="positive" label="Operational" />
      <StatusDot variant="warning" label="Degraded" />
      <StatusDot variant="error" label="Down" />
      <StatusDot variant="neutral" label="Offline" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <StatusDot variant="positive" size="sm" label="Small" />
      <StatusDot variant="positive" size="md" label="Medium" />
      <StatusDot variant="positive" size="lg" label="Large" />
    </div>
  ),
};

export const Pulse: Story = {
  args: {
    variant: 'error',
    pulse: true,
    label: 'Recording',
  },
};

export const PulseVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <StatusDot variant="info" pulse label="Deploying" />
      <StatusDot variant="positive" pulse label="Live" />
      <StatusDot variant="error" pulse label="Recording" />
    </div>
  ),
};

export const BareDots: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <StatusDot variant="positive" aria-label="Online" />
      <StatusDot variant="warning" aria-label="Away" />
      <StatusDot variant="neutral" aria-label="Offline" />
    </div>
  ),
};
