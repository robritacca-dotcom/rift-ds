import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComboChart } from './ComboChart';

/* ============================================
   Sample data: 12 months of ad spend ($K) + ROAS
   ============================================ */
const spendRoasData = [
  { label: 'Jan', spend: 42, roas: 2.8 },
  { label: 'Feb', spend: 46, roas: 2.9 },
  { label: 'Mar', spend: 51, roas: 3.1 },
  { label: 'Apr', spend: 48, roas: 3.0 },
  { label: 'May', spend: 55, roas: 3.3 },
  { label: 'Jun', spend: 61, roas: 3.4 },
  { label: 'Jul', spend: 58, roas: 3.6 },
  { label: 'Aug', spend: 64, roas: 3.7 },
  { label: 'Sep', spend: 70, roas: 3.9 },
  { label: 'Oct', spend: 74, roas: 4.0 },
  { label: 'Nov', spend: 82, roas: 4.1 },
  { label: 'Dec', spend: 88, roas: 4.2 },
];

const meta = {
  title: 'Components/ComboChart',
  component: ComboChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    barColor: { control: 'color' },
    lineColor: { control: 'color' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: spendRoasData,
    xKey: 'label',
    barKey: 'spend',
    barLabel: 'Spend ($K)',
    lineKey: 'roas',
    lineLabel: 'ROAS',
    secondaryAxis: true,
    title: 'Combo Chart - Interactive',
    subtitle: 'Monthly ad spend against return on ad spend',
    summaryItems: [
      { label: 'Total spend', value: '$739K' },
      { label: 'Avg ROAS', value: '3.5x' },
    ],
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComboChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SharedAxis: Story = {
  args: {
    data: [
      { label: 'Q1', actual: 450, target: 500 },
      { label: 'Q2', actual: 620, target: 560 },
      { label: 'Q3', actual: 580, target: 620 },
      { label: 'Q4', actual: 710, target: 680 },
    ],
    barKey: 'actual',
    barLabel: 'Actual revenue',
    lineKey: 'target',
    lineLabel: 'Target',
    secondaryAxis: false,
    title: 'Revenue vs target',
    subtitle: 'Both series in $K, sharing the left axis',
    summaryItems: undefined,
    height: 300,
  },
};
