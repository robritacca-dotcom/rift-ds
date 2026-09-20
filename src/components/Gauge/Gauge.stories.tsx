import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gauge } from './Gauge';

const meta = {
  title: 'Components/Gauge',
  component: Gauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    tone: {
      control: 'select',
      options: ['accent', 'positive', 'warning', 'error', 'neutral'],
    },
  },
  args: {
    value: 64,
    label: 'CPU usage',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: {
    value: 82,
    label: 'Memory',
    title: 'Cluster memory',
    subtitle: 'Rolling five-minute average',
    thresholds: [
      { value: 70, tone: 'warning' },
      { value: 90, tone: 'error' },
    ],
  },
};

export const Bare: Story = {
  args: {
    bare: true,
    value: 78,
    label: 'CPU',
    thresholds: [
      { value: 70, tone: 'warning' },
      { value: 90, tone: 'error' },
    ],
  },
};

export const Formatted: Story = {
  args: {
    value: 7.4,
    min: 0,
    max: 10,
    label: 'Quality score',
    tone: 'positive',
    formatValue: (value) => value.toFixed(1),
  },
};

export const Large: Story = {
  args: {
    value: 91,
    size: 180,
    strokeWidth: 16,
    label: 'Capacity',
    title: 'Storage',
    thresholds: [
      { value: 70, tone: 'warning' },
      { value: 90, tone: 'error' },
    ],
  },
};

export const DialOnly: Story = {
  args: {
    bare: true,
    value: 55,
    showValue: false,
    label: undefined,
    'aria-label': 'Progress',
  },
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '640px' }}>
      <Gauge bare value={64} tone="accent" size={96} label="Accent" />
      <Gauge bare value={64} tone="positive" size={96} label="Positive" />
      <Gauge bare value={64} tone="warning" size={96} label="Warning" />
      <Gauge bare value={64} tone="error" size={96} label="Error" />
      <Gauge bare value={64} tone="neutral" size={96} label="Neutral" />
    </div>
  ),
};
