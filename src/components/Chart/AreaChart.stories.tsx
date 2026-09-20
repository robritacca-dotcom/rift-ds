import type { Meta, StoryObj } from '@storybook/react-vite';
import { AreaChart } from './AreaChart';

const monthlyData = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const meta = {
  title: 'Components/AreaChart',
  component: AreaChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    stacked: { control: 'boolean' },
  },
  args: {
    data: monthlyData,
    xKey: 'month',
    series: [
      { dataKey: 'desktop', label: 'Desktop' },
      { dataKey: 'mobile', label: 'Mobile' },
    ],
    title: 'Visitors Over Time',
    subtitle: 'January - June 2024',
    stacked: false,
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Stacked: Story = {
  args: {
    stacked: true,
    title: 'Stacked Area',
    subtitle: 'Combined visitor volume',
  },
};

export const SingleSeries: Story = {
  args: {
    series: [{ dataKey: 'desktop', label: 'Desktop' }],
    title: 'Desktop Traffic',
    subtitle: undefined,
  },
};

export const WithSummary: Story = {
  args: {
    summaryItems: [
      { label: 'Total', value: '2,450' },
      { label: 'Avg', value: 408 },
    ],
  },
};
