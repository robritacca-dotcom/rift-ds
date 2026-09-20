import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DateInput } from './DateInput';

const meta = {
  title: 'Components/DateInput',
  component: DateInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    size: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Start date',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Birthday',
    value: '1990-06-15',
  },
};

export const Required: Story = {
  args: {
    label: 'Due date',
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Event date',
    helperText: 'Select a date within the next 30 days',
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Booking date',
    min: '2026-01-01',
    max: '2026-12-31',
    helperText: 'Must be within 2026',
  },
};

export const Error: Story = {
  args: {
    label: 'Start date',
    value: '2020-01-01',
    error: true,
    helperText: 'Date must be in the future',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked date',
    value: '2026-03-15',
    disabled: true,
  },
};

// Compact
export const CompactDefault: Story = {
  args: {
    label: 'Date',
    size: 'compact',
  },
};

export const CompactWithValue: Story = {
  args: {
    label: 'Date',
    size: 'compact',
    value: '2026-06-15',
  },
};

export const CompactError: Story = {
  args: {
    label: 'Date',
    size: 'compact',
    error: true,
    helperText: 'Invalid date',
    value: '2020-01-01',
  },
};
