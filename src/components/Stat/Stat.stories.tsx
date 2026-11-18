import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stat } from './Stat';
import { Panel } from '../Panel/Panel';
import { Sparkline } from '../Sparkline/Sparkline';

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
      options: ['stacked', 'inline', 'auto'],
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

// The same stat at two widths: inline in the wide tile, the delta under
// the label in the narrow one (a two-up KPI grid on a phone).
export const AutoDelta: Story = {
  args: {
    value: '$24,380',
    label: 'Ad spend',
    delta: '+8.4%',
    trend: 'up',
    deltaPlacement: 'auto',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <div style={{ width: '320px' }}>
        <Stat {...args} />
      </div>
      <div style={{ width: '160px' }}>
        <Stat {...args} />
      </div>
    </div>
  ),
};

export const Large: Story = {
  args: {
    value: '95%+',
    label: 'Reduction in modelling effort',
    size: 'large',
  },
};

/** A KPI tile: an icon and the period on top, the figures, then the metric's recent history. The tile's surface is a bordered Panel. */
export const KpiTile: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '760px' }}>
      <Panel bordered>
        <Stat icon="shopping_bag" caption="Last 30 days" value="1,284" label="Orders" trend="up" delta="+12% vs prior period">
          <Sparkline data={[8, 9, 7, 11, 12, 10, 14, 13, 16]} tone="positive" />
        </Stat>
      </Panel>
      <Panel bordered>
        <Stat icon="schedule" caption="Last 30 days" value="2.4 days" label="Average lead time" trend="down" delta="-0.3 days">
          <Sparkline data={[3.1, 2.9, 3, 2.8, 2.6, 2.7, 2.5, 2.4]} tone="neutral" />
        </Stat>
      </Panel>
    </div>
  ),
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
