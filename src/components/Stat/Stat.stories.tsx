import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stat } from './Stat';

const meta = {
  title: 'Components/Stat',
  component: Stat,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    delta: { control: 'text' },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
    },
    deltaPlacement: {
      control: 'select',
      options: ['stacked', 'inline'],
    },
    size: {
      control: 'select',
      options: ['default', 'large'],
    },
  },
  args: {
    value: '~900%',
    label: 'Successful generations',
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '3.8M',
    label: 'Monthly customer interactions',
  },
};

export const WithTrendUp: Story = {
  args: {
    value: '~900%',
    label: 'Successful generations',
    delta: 'after clash visualisation',
    trend: 'up',
  },
};

export const WithTrendDown: Story = {
  args: {
    value: '42%',
    label: 'Time to outcome',
    delta: 'faster than baseline',
    trend: 'down',
  },
};

export const InlineDelta: Story = {
  args: {
    value: '$24,380',
    label: 'Ad spend',
    delta: '+8.4%',
    trend: 'up',
    deltaPlacement: 'inline',
  },
};

export const Large: Story = {
  args: {
    value: '95%+',
    label: 'Reduction in modelling effort',
    size: 'large',
  },
};

// A metrics band as used on case-study pages
export const MetricsBand: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
      <Stat value="~900%" label="Successful generations" trend="up" delta="clash visualisation" />
      <Stat value="~400%" label="Solution analysis" trend="up" delta="same release" />
      <Stat value="42%" label="Faster outcomes" />
      <Stat value="95%+" label="Modelling effort reduced" />
    </div>
  ),
};
