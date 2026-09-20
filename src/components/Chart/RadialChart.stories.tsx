import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadialChart } from './RadialChart';

const progressData = [
  { name: 'Design', value: 86 },
  { name: 'Development', value: 65 },
  { name: 'Testing', value: 42 },
];

const meta = {
  title: 'Components/RadialChart',
  component: RadialChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    maxValue: { control: { type: 'range', min: 50, max: 200 } },
    innerRadius: { control: { type: 'range', min: 20, max: 100 } },
    outerRadius: { control: { type: 'range', min: 60, max: 180 } },
    showLegend: { control: 'boolean' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: progressData,
    maxValue: 100,
    title: 'Sprint Progress',
    subtitle: 'Completion by phase',
    height: 380,
    innerRadius: 40,
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
} satisfies Meta<typeof RadialChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomColors: Story = {
  args: {
    data: [
      { name: 'Revenue', value: 78, color: '#06D6A0' },
      { name: 'Users', value: 92, color: '#118AB2' },
      { name: 'Retention', value: 55, color: '#FFD166' },
    ],
    title: 'KPI Overview',
    subtitle: 'Q2 2024 targets',
  },
};

export const HighValues: Story = {
  args: {
    data: [
      { name: 'Sales', value: 1250 },
      { name: 'Returns', value: 340 },
    ],
    maxValue: 1500,
    title: 'Monthly Sales',
    subtitle: undefined,
  },
};
