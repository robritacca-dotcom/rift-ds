import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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

/**
 * The listbox keyboard pattern on the trigger: Enter opens the list on the
 * selected time, arrows move the active option (`aria-activedescendant`)
 * and clamp at the ends, Home and End jump, Enter selects and closes, and
 * Escape closes without changing the value. Focus stays on the trigger.
 */
export const KeyboardSelection: Story = {
  args: {
    label: 'Meeting time',
    minTime: '09:00',
    maxTime: '11:00',
    stepMinutes: 30,
    defaultValue: '10:00',
  },
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Meeting time' });
    const activeOption = () =>
      document.getElementById(trigger.getAttribute('aria-activedescendant') ?? '');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveTextContent('10:00 AM');

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const listbox = await canvas.findByRole('listbox', { name: 'Meeting time' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('option')).toHaveLength(5);
    await expect(activeOption()).toHaveTextContent('10:00 AM');
    await expect(canvas.getByRole('option', { name: /10:00 AM/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.keyboard('{ArrowDown}');
    await expect(activeOption()).toHaveTextContent('10:30 AM');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(activeOption()).toHaveTextContent('11:00 AM');
    await userEvent.keyboard('{Home}');
    await expect(activeOption()).toHaveTextContent('9:00 AM');
    await userEvent.keyboard('{ArrowUp}');
    await expect(activeOption()).toHaveTextContent('9:00 AM');
    await userEvent.keyboard('{End}{ArrowUp}');
    await expect(activeOption()).toHaveTextContent('10:30 AM');

    await userEvent.keyboard('{Enter}');
    await expect(listbox).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-activedescendant');
    await expect(trigger).toHaveTextContent('10:30 AM');
    await expect(trigger).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith('10:30');

    // ArrowDown also opens; Escape closes and keeps the value.
    await userEvent.keyboard('{ArrowDown}');
    await canvas.findByRole('listbox', { name: 'Meeting time' });
    await expect(activeOption()).toHaveTextContent('10:30 AM');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(trigger).toHaveTextContent('10:30 AM');
    await expect(trigger).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);

    // Ends open, so the story's axe pass audits the expanded trigger and its
    // aria-activedescendant (which a plain button role is not allowed).
    await userEvent.keyboard('{ArrowUp}');
    await canvas.findByRole('listbox', { name: 'Meeting time' });
  },
};
