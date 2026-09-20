import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['default', 'compact'] },
    showLabel: { control: 'boolean' },
  },
  args: {
    value: 60,
    size: 'default',
    showLabel: false,
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { showLabel: true, value: 72 },
};

export const Compact: Story = {
  args: { size: 'compact', value: 45 },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <ProgressBar value={80} showLabel />
      <ProgressBar value={100} showLabel />
      <ProgressBar value={45} showLabel />
      <ProgressBar value={20} size="compact" />
    </div>
  ),
};
