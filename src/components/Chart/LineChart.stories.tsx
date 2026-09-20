import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from './LineChart';

const monthlyData = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const meta = {
  title: 'Components/LineChart',
  component: LineChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: monthlyData,
    xKey: 'month',
    series: [
      { dataKey: 'desktop', label: 'Desktop' },
      { dataKey: 'mobile', label: 'Mobile' },
    ],
    title: 'Visitors by Device',
    subtitle: 'January - June 2024',
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
