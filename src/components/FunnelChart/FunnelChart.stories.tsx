import type { Meta, StoryObj } from '@storybook/react-vite';
import { FunnelChart } from './FunnelChart';

const conversionFunnel = [
  { label: 'Visits', value: 96400, displayValue: '96.4K' },
  { label: 'Sign-ups', value: 38600, displayValue: '38.6K' },
  { label: 'Trials', value: 14100, displayValue: '14.1K' },
  { label: 'Customers', value: 5200, displayValue: '5.2K' },
];

const meta = {
  title: 'Components/FunnelChart',
  component: FunnelChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: 'number' },
    showLabels: { control: 'boolean' },
  },
  args: {
    data: conversionFunnel,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FunnelChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: {
    title: 'Acquisition funnel',
    subtitle: 'Visits through to paying customers',
  },
};

export const Bare: Story = {
  args: {
    bare: true,
  },
};

// For when a LegendTile row under the chart already carries the stage names.
export const WithoutLabels: Story = {
  args: {
    showLabels: false,
  },
};

export const ThreeStages: Story = {
  args: {
    data: [
      { label: 'Leads', value: 12400, displayValue: '12.4K' },
      { label: 'Qualified', value: 6100, displayValue: '6.1K' },
      { label: 'Won', value: 2300, displayValue: '2.3K' },
    ],
  },
};

// The late stages are slivers of the first — the taper tells the drop-off
// story, and the tooltip carries each stage's true percentage.
export const SteepDropoff: Story = {
  args: {
    data: [
      { label: 'Impressions', value: 480000, displayValue: '480K' },
      { label: 'Clicks', value: 21600, displayValue: '21.6K' },
      { label: 'Installs', value: 4300, displayValue: '4.3K' },
      { label: 'Purchases', value: 610, displayValue: '610' },
    ],
  },
};
