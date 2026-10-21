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
    defaultValue: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact', defaultValue: 30 },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 60 },
};

export const CustomRange: Story = {
  args: { min: 0, max: 10, step: 1, defaultValue: 7 },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <Slider defaultValue={75} />
      <Slider defaultValue={40} size="compact" />
      <Slider defaultValue={60} disabled />
    </div>
  ),
};

export const Labelled: Story = {
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Slider {...args} />
    </div>
  ),
  args: {
    label: 'Volume',
    helperText: 'Applies to alerts and previews.',
    defaultValue: 65,
  },
};

export const WithValue: Story = {
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Slider {...args} />
    </div>
  ),
  args: {
    label: 'Opacity',
    showValue: true,
    defaultValue: 80,
  },
};

export const ErrorState: Story = {
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Slider {...args} />
    </div>
  ),
  args: {
    label: 'Budget cap',
    helperText: 'The cap must be above the committed spend.',
    error: true,
    defaultValue: 10,
  },
};
