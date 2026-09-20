import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';
import { Stat } from '../Stat/Stat';

const trendUp = [4, 6, 5, 8, 7, 10, 9, 12, 14, 13, 16];
const trendDown = [16, 14, 15, 12, 13, 10, 11, 8, 7, 8, 5];
const wobble = [8, 10, 7, 11, 9, 12, 8, 10, 11, 9, 12];

const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'area'],
    },
    tone: {
      control: 'select',
      options: ['accent', 'positive', 'negative', 'neutral'],
    },
    showDot: { control: 'boolean' },
    strokeWidth: { control: 'number' },
    width: { control: 'number' },
    height: { control: 'number' },
    label: { control: 'text' },
  },
  args: {
    data: wobble,
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Area: Story = {
  args: {
    data: trendUp,
    variant: 'area',
  },
};

export const Positive: Story = {
  args: {
    data: trendUp,
    tone: 'positive',
    label: 'Trending up',
  },
};

export const Negative: Story = {
  args: {
    data: trendDown,
    tone: 'negative',
    label: 'Trending down',
  },
};

// The intended use: a quiet trend beside a Stat's headline number.
export const InsideStat: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Stat value="3.8M" label="Monthly sessions" delta="+12%" trend="up" />
        <Sparkline data={trendUp} tone="positive" label="Sessions, trending up" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Stat value="1,204" label="Weekly signups" delta="-8%" trend="down" />
        <Sparkline data={trendDown} tone="negative" label="Signups, trending down" />
      </div>
    </div>
  ),
};

// All-equal values render a horizontal midline, never a NaN path.
export const FlatData: Story = {
  args: {
    data: [5, 5, 5, 5, 5, 5, 5, 5],
    tone: 'neutral',
  },
};
