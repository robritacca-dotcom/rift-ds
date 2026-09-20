import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Quantity',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 2,
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Guests',
    defaultValue: 2,
    min: 1,
    max: 8,
    helperText: 'Between 1 and 8 guests',
  },
};

export const WithStep: Story = {
  args: {
    label: 'Opacity',
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.1,
    helperText: 'Steps of 0.1',
  },
};

export const ErrorState: Story = {
  args: {
    defaultValue: 0,
    error: true,
    helperText: 'Enter a quantity of at least 1',
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    defaultValue: 1,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 3,
    disabled: true,
  },
};
