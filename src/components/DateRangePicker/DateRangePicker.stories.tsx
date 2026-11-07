import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { DateRangePicker } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    months: { control: 'inline-radio', options: [1, 2] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    defaultValue: { start: '2026-11-03', end: '2026-11-12' },
    onValueChange: fn(),
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two months side by side, the chosen span banded between its ends. */
export const Default: Story = {};

/** One month, for a narrow panel. */
export const SingleMonth: Story = {
  args: { months: 1 },
};

/** A report filter with presets above the calendar. */
export const WithPresets: Story = {
  args: {
    defaultValue: { start: '2026-10-01', end: '2026-10-31' },
    presets: [
      { label: 'Last 7 days', range: { start: '2026-10-30', end: '2026-11-05' } },
      { label: 'October', range: { start: '2026-10-01', end: '2026-10-31' } },
      { label: 'Q3', range: { start: '2026-07-01', end: '2026-09-30' } },
    ],
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Last 7 days' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ start: '2026-10-30', end: '2026-11-05' });
    await expect(canvas.getByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true');
  },
};

/** A booking: weekends unavailable, at least two nights, no more than fourteen, and no span across a weekend. */
export const Booking: Story = {
  args: {
    defaultValue: { start: null, end: null },
    min: '2026-11-02',
    minLength: 2,
    maxLength: 14,
    isDateDisabled: (date: string) => {
      const day = new Date(`${date}T00:00:00`).getDay();
      return day === 0 || day === 6;
    },
  },
};

/** A billing period kept inside the current year. */
export const BillingPeriod: Story = {
  args: { min: '2026-01-01', max: '2026-12-31', defaultValue: { start: '2026-11-01', end: '2026-11-30' } },
};

/** Keyboard: Enter sets the start, the arrows move, Enter sets the end. Each day says where it sits in the range. */
export const Keyboard: Story = {
  args: { defaultValue: { start: null, end: null }, months: 1, min: '2026-11-01', max: '2026-11-30' },
  play: async ({ canvas, args }) => {
    const first = canvas.getByRole('button', { name: 'Sunday, November 1, 2026' });
    first.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ start: '2026-11-01', end: null });
    await expect(canvas.getByRole('button', { name: 'Sunday, November 1, 2026, start of range' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ start: '2026-11-01', end: '2026-11-09' });
    await expect(canvas.getByRole('button', { name: 'Thursday, November 5, 2026, in range' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Monday, November 9, 2026, end of range' })).toBeInTheDocument();
  },
};

/** German: Monday first, German month and day names. */
export const German: Story = {
  args: { locale: 'de-DE' },
};

/** The form receives the start and the end through two hidden inputs. */
export const InAForm: Story = {
  args: { name: 'period' },
  play: async ({ canvasElement }) => {
    const start = canvasElement.querySelector<HTMLInputElement>('input[name="period[start]"]');
    const end = canvasElement.querySelector<HTMLInputElement>('input[name="period[end]"]');
    await expect(start?.value).toBe('2026-11-03');
    await expect(end?.value).toBe('2026-11-12');
  },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
