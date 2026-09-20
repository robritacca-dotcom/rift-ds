import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TimePicker } from './TimePicker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    minTime: { control: 'text' },
    maxTime: { control: 'text' },
    stepMinutes: { control: 'number' },
    hourFormat: { control: 'radio', options: ['12', '24'] },
    size: { control: 'radio', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
  },
  args: {
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px', minHeight: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Start time',
    placeholder: 'Select time',
  },
};

export const TwentyFourHour: Story = {
  args: {
    label: 'Departure',
    hourFormat: '24',
    defaultValue: '14:30',
  },
};

export const FifteenMinuteSteps: Story = {
  args: {
    label: 'Reminder',
    stepMinutes: 15,
    defaultValue: '08:45',
  },
};

export const BusinessHours: Story = {
  args: {
    label: 'Meeting time',
    minTime: '09:00',
    maxTime: '17:00',
    defaultValue: '10:00',
    helperText: 'Weekdays, 9 to 5',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Start time',
    error: true,
    helperText: 'Please select a time',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Start time',
    defaultValue: '09:30',
    disabled: true,
  },
};
