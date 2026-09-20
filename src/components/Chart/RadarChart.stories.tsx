import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadarChart } from './RadarChart';

const skillData = [
  { subject: 'Design', A: 120, B: 90 },
  { subject: 'Frontend', A: 98, B: 130 },
  { subject: 'Backend', A: 86, B: 100 },
  { subject: 'DevOps', A: 99, B: 85 },
  { subject: 'Testing', A: 85, B: 65 },
  { subject: 'Communication', A: 65, B: 120 },
];

const meta = {
  title: 'Components/RadarChart',
  component: RadarChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: skillData,
    categoryKey: 'subject',
    series: [
      { dataKey: 'A', label: 'Team Alpha' },
      { dataKey: 'B', label: 'Team Beta' },
    ],
    title: 'Team Skills',
    subtitle: 'Competency comparison across domains',
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSeries: Story = {
  args: {
    series: [{ dataKey: 'A', label: 'Team Alpha' }],
    title: 'Team Alpha Skills',
    subtitle: undefined,
  },
};

export const WithSummary: Story = {
  args: {
    summaryItems: [
      { label: 'Top Skill', value: 'Frontend' },
      { label: 'Avg Score', value: 92 },
    ],
  },
};
