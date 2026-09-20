import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScatterChart } from './ScatterChart';

function generateCluster(cx: number, cy: number, count: number, spread: number) {
  return Array.from({ length: count }, () => ({
    x: Math.round(cx + (Math.random() - 0.5) * spread),
    y: Math.round(cy + (Math.random() - 0.5) * spread),
  }));
}

const meta = {
  title: 'Components/ScatterChart',
  component: ScatterChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    datasets: [
      { name: 'Group A', data: generateCluster(60, 200, 20, 80) },
      { name: 'Group B', data: generateCluster(180, 120, 20, 80) },
    ],
    xKey: 'x',
    yKey: 'y',
    xLabel: 'Height (cm)',
    yLabel: 'Weight (kg)',
    title: 'Height vs Weight',
    subtitle: 'Sample population clusters',
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleDataset: Story = {
  args: {
    datasets: [
      { name: 'Sales', data: generateCluster(120, 150, 30, 120) },
    ],
    xLabel: 'Ad Spend ($)',
    yLabel: 'Revenue ($K)',
    title: 'Ad Spend vs Revenue',
    subtitle: undefined,
  },
};

export const WithSummary: Story = {
  args: {
    summaryItems: [
      { label: 'Correlation', value: '0.82' },
      { label: 'Points', value: 40 },
    ],
  },
};
