import type { Meta, StoryObj } from '@storybook/react-vite';
import { StackedBarChart } from './StackedBarChart';

/* ============================================
   Sample data — monthly traffic by device
   ============================================ */
const trafficData = [
  { label: 'Jan', desktop: 186, mobile: 80, tablet: 24 },
  { label: 'Feb', desktop: 305, mobile: 200, tablet: 38 },
  { label: 'Mar', desktop: 237, mobile: 120, tablet: 30 },
  { label: 'Apr', desktop: 73, mobile: 190, tablet: 18 },
  { label: 'May', desktop: 209, mobile: 130, tablet: 26 },
  { label: 'Jun', desktop: 214, mobile: 140, tablet: 22 },
];

const trafficSeries = [
  { dataKey: 'desktop', label: 'Desktop' },
  { dataKey: 'mobile', label: 'Mobile' },
  { dataKey: 'tablet', label: 'Tablet' },
];

const meta = {
  title: 'Components/StackedBarChart',
  component: StackedBarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: trafficData,
    xKey: 'label',
    series: trafficSeries,
    title: 'Stacked Bar Chart',
    subtitle: 'Visitors by device, last 6 months',
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StackedBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoSeries: Story = {
  args: {
    series: [
      { dataKey: 'desktop', label: 'Desktop' },
      { dataKey: 'mobile', label: 'Mobile' },
    ],
    title: 'Desktop vs Mobile',
    subtitle: undefined,
    height: 300,
  },
};

export const WithSummary: Story = {
  args: {
    summaryItems: [
      { label: 'Desktop', value: 1224 },
      { label: 'Mobile', value: 860 },
      { label: 'Tablet', value: 158 },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    series: [
      { dataKey: 'desktop', label: 'Desktop', color: '#118AB2' },
      { dataKey: 'mobile', label: 'Mobile', color: '#06D6A0' },
      { dataKey: 'tablet', label: 'Tablet', color: '#FFD166' },
    ],
    title: 'Custom Series Colours',
  },
};
