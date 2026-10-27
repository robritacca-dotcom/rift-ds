import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { DatePicker } from './DatePicker';
import { DEFAULT_LOCALE } from '../../behaviors/locale';

/** The default day name, as the component builds it, so the test reads like a screen reader would.
    Written in the component's default locale, never the browser's, or the test fails on any
    machine whose browser is not American English. */
const dayName = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d).toLocaleDateString(DEFAULT_LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    min: { control: 'text' },
    max: { control: 'text' },
  },
  args: {
    onDateSelect: fn(),
    size: 'default',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSelected: Story = {
  args: {
    value: '2026-02-16',
  },
};

export const WithMinMax: Story = {
  args: {
    value: '2026-02-16',
    min: '2026-02-01',
    max: '2026-02-28',
  },
};

export const Disabled: Story = {
  args: {
    value: '2026-02-16',
    disabled: true,
  },
};

// Compact
export const CompactDefault: Story = {
  args: {
    size: 'compact',
  },
};

export const CompactWithSelected: Story = {
  args: {
    size: 'compact',
    value: '2026-02-16',
  },
};

export const CompactDisabled: Story = {
  args: {
    size: 'compact',
    value: '2026-02-16',
    disabled: true,
  },
};

/**
 * Keyboard selection, month navigation and the date-grid keyboard model.
 * The month arrows answer Enter and update the heading, the grid's name and
 * the live region together. The days are one tab stop (the selected day,
 * else today, else the month's first enabled day); arrows move a day or a
 * week, Home and End go to the ends of the week, Page Up and Page Down move
 * a month (a year with Shift), and a move past the month in view turns the
 * page with focus on the new day. A move that would leave `min`/`max` is
 * held at the bound, so focus never lands on a disabled day. A focused day
 * answers Enter and Space with its `YYYY-MM-DD` value.
 */
export const KeyboardSelection: Story = {
  args: {
    value: '2026-02-16',
    min: '2026-01-10',
    max: '2026-03-20',
  },
  render: function KeyboardSelectionStory(args) {
    const [value, setValue] = useState(args.value);
    return (
      <DatePicker
        {...args}
        value={value}
        onDateSelect={(next) => {
          args.onDateSelect?.(next);
          setValue(next);
        }}
      />
    );
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const live = canvasElement.querySelector('[aria-live="polite"]');
    const day = (y: number, m: number, d: number, selected = false) =>
      canvas.getByRole('button', { name: `${dayName(y, m, d)}${selected ? ', selected' : ''}` });
    const expectFocusOn = (y: number, m: number, d: number, selected = false) =>
      waitFor(() => expect(day(y, m, d, selected)).toHaveFocus());
    const tabStops = () =>
      canvasElement.querySelectorAll('[role="gridcell"] button[tabindex="0"]');

    await expect(canvas.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('columnheader')[0]).toHaveAccessibleName('Sunday');
    await expect(day(2026, 2, 16, true)).toBeInTheDocument();
    // One tab stop in the grid, on the selected day.
    await expect(tabStops()).toHaveLength(1);
    await expect(day(2026, 2, 16, true)).toHaveAttribute('tabindex', '0');

    // Tab lands on the previous-month arrow first; Enter steps back a month.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Previous month' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('grid', { name: 'January 2026' })).toBeInTheDocument();
    await expect(live).toHaveTextContent('January 2026');
    await expect(day(2026, 1, 9)).toBeDisabled();

    // Next-month arrow, twice, lands on March.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Next month' })).toHaveFocus();
    await userEvent.keyboard('{Enter}{Enter}');
    await expect(canvas.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
    await expect(live).toHaveTextContent('March 2026');
    await expect(day(2026, 3, 21)).toBeDisabled();

    // Neither the selection nor today is in March, so Tab enters the grid on
    // the month's first enabled day.
    await userEvent.tab();
    await expectFocusOn(2026, 3, 1);

    // Arrows move a day and a week; Home and End go to the ends of the week.
    await userEvent.keyboard('{ArrowRight}');
    await expectFocusOn(2026, 3, 2);
    await userEvent.keyboard('{ArrowDown}');
    await expectFocusOn(2026, 3, 9);
    await userEvent.keyboard('{ArrowLeft}');
    await expectFocusOn(2026, 3, 8);
    await userEvent.keyboard('{End}');
    await expectFocusOn(2026, 3, 14);
    await userEvent.keyboard('{Home}');
    await expectFocusOn(2026, 3, 8);
    await userEvent.keyboard('{ArrowUp}');
    await expectFocusOn(2026, 3, 1);
    await expect(tabStops()).toHaveLength(1);

    // A week up from the 1st crosses into February: the page turns and
    // focus stays on the new day.
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    await expect(live).toHaveTextContent('February 2026');
    await expectFocusOn(2026, 2, 22);

    // Page Down moves a month, held at max: 22 March becomes 20 March.
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
    await expectFocusOn(2026, 3, 20);
    // Past max, an arrow stays put rather than landing on a disabled day.
    await userEvent.keyboard('{ArrowRight}');
    await expectFocusOn(2026, 3, 20);

    // Page Up moves a month back; Shift+Page Up a year, held at min.
    await userEvent.keyboard('{PageUp}');
    await expect(canvas.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    await expectFocusOn(2026, 2, 20);
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    await expect(canvas.getByRole('grid', { name: 'January 2026' })).toBeInTheDocument();
    await expectFocusOn(2026, 1, 10);

    // A focused day answers Enter, and the selection moves to it.
    await userEvent.keyboard('{Enter}');
    await expect(args.onDateSelect).toHaveBeenLastCalledWith('2026-01-10');
    await expectFocusOn(2026, 1, 10, true);

    // Space selects too.
    await userEvent.keyboard('{ArrowRight}');
    await expectFocusOn(2026, 1, 11);
    await userEvent.keyboard(' ');
    await expect(args.onDateSelect).toHaveBeenLastCalledWith('2026-01-11');
    await expect(args.onDateSelect).toHaveBeenCalledTimes(2);
    await expect(tabStops()).toHaveLength(1);
  },
};
