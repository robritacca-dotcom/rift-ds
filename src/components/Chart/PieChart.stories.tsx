import type { Meta, StoryObj } from '@storybook/react-vite';
import { PieChart } from './PieChart';

const browserData = [
  { name: 'Chrome', value: 275 },
  { name: 'Safari', value: 200 },
  { name: 'Firefox', value: 187 },
  { name: 'Edge', value: 173 },
  { name: 'Other', value: 90 },
];

const meta = {
  title: 'Components/PieChart',
  component: PieChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    innerRadius: { control: { type: 'range', min: 0, max: 120 } },
    outerRadius: { control: { type: 'range', min: 60, max: 180 } },
    showLegend: { control: 'boolean' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: browserData,
    title: 'Browser Share',
    subtitle: 'Visitor distribution by browser',
    height: 380,
    innerRadius: 0,
    outerRadius: 140,
    showLegend: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Donut: Story = {
  args: {
    innerRadius: 80,
    title: 'Browser Share — Donut',
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { name: 'Completed', value: 72, color: '#06D6A0' },
      { name: 'In Progress', value: 18, color: '#FFD166' },
      { name: 'Failed', value: 10, color: '#EF476F' },
    ],
    title: 'Task Status',
    subtitle: undefined,
    innerRadius: 70,
  },
};
