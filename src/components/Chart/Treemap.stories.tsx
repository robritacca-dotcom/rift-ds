import type { Meta, StoryObj } from '@storybook/react-vite';
import { Treemap } from './Treemap';

const diskUsageData = [
  { name: 'Documents', size: 4200 },
  { name: 'Photos', size: 3800 },
  { name: 'Videos', size: 7200 },
  { name: 'Music', size: 1500 },
  { name: 'Apps', size: 2800 },
  { name: 'System', size: 1200 },
  { name: 'Downloads', size: 2100 },
  { name: 'Other', size: 900 },
];

const meta = {
  title: 'Components/Treemap',
  component: Treemap,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    height: { control: { type: 'range', min: 200, max: 600 } },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: {
    data: diskUsageData,
    title: 'Disk Usage',
    subtitle: 'Storage breakdown by category (MB)',
    height: 350,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Treemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSummary: Story = {
  args: {
    summaryItems: [
      { label: 'Total', value: '23.7 GB' },
      { label: 'Free', value: '12.3 GB' },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { name: 'Revenue', size: 8500, color: '#06D6A0' },
      { name: 'Costs', size: 5200, color: '#EF476F' },
      { name: 'Marketing', size: 3100, color: '#FFD166' },
      { name: 'R&D', size: 4000, color: '#118AB2' },
      { name: 'Operations', size: 2200, color: '#9E47EF' },
    ],
    title: 'Budget Allocation',
    subtitle: 'Annual spending by department ($K)',
  },
};
