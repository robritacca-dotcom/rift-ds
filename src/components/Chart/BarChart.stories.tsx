import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from './BarChart';

/* ============================================
   Sample data — 3 months of page views
   ============================================ */
function generatePageViews() {
  const data: { label: string; value: number }[] = [];
  const start = new Date(2024, 3, 1); // Apr 1
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const value = Math.round(80 + Math.random() * 300);
    data.push({ label, value });
  }
  return data;
}

const pageViewData = generatePageViews();

const meta = {
  title: 'Components/BarChart',
  component: BarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    barColor: { control: 'color' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: pageViewData,
    xKey: 'label',
    yKey: 'value',
    dataLabel: 'Page Views',
    title: 'Bar Chart - Interactive',
    subtitle: 'Showing total visitors for the last 3 months',
    summaryItems: [
      { label: 'Desktop', value: 24828 },
      { label: 'Mobile', value: 25010 },
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
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    data: [
      { label: 'Jan', value: 186 },
      { label: 'Feb', value: 305 },
      { label: 'Mar', value: 237 },
      { label: 'Apr', value: 73 },
      { label: 'May', value: 209 },
      { label: 'Jun', value: 214 },
    ],
    title: 'Monthly Revenue',
    subtitle: undefined,
    summaryItems: undefined,
    dataLabel: 'Revenue',
    height: 300,
  },
};

export const CustomColor: Story = {
  args: {
    data: [
      { label: 'React', value: 420 },
      { label: 'Vue', value: 310 },
      { label: 'Angular', value: 180 },
      { label: 'Svelte', value: 250 },
      { label: 'Solid', value: 140 },
    ],
    title: 'Framework Popularity',
    subtitle: 'GitHub stars (thousands)',
    summaryItems: undefined,
    dataLabel: 'Stars',
    barColor: '#06D6A0',
    height: 300,
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <BarChart
        data={pageViewData}
        title="Full Featured"
        subtitle="With summary stats and tooltip"
        dataLabel="Page Views"
        summaryItems={[
          { label: 'Desktop', value: 24828 },
          { label: 'Mobile', value: 25010 },
        ]}
      />
      <BarChart
        data={[
          { label: 'Mon', value: 120 },
          { label: 'Tue', value: 180 },
          { label: 'Wed', value: 95 },
          { label: 'Thu', value: 240 },
          { label: 'Fri', value: 310 },
        ]}
        title="Compact"
        dataLabel="Orders"
        height={250}
      />
      <BarChart
        data={[
          { label: 'Q1', value: 450 },
          { label: 'Q2', value: 620 },
          { label: 'Q3', value: 380 },
          { label: 'Q4', value: 710 },
        ]}
        title="Custom Colour"
        subtitle="Quarterly performance"
        dataLabel="Revenue"
        barColor="#9E47EF"
        height={250}
      />
    </div>
  ),
};
