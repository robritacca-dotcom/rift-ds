import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact', value: 30 },
};

export const Disabled: Story = {
  args: { disabled: true, value: 60 },
};

export const CustomRange: Story = {
  args: { min: 0, max: 10, step: 1, value: 7 },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <Slider value={75} />
      <Slider value={40} size="compact" />
      <Slider value={60} disabled />
    </div>
  ),
};
