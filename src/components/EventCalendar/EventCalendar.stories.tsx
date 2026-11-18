import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EventCalendar, type EventCalendarEvent } from './EventCalendar';
import { Button } from '../Button/Button';

const events: EventCalendarEvent[] = [
  { id: 'e1', date: '2026-08-01', title: 'Brunch', time: '11:00', color: 'amber' },
  { id: 'e2', date: '2026-08-03', title: 'Stand-up', time: '11:30', color: 'cobalt' },
  { id: 'e3', date: '2026-08-03', title: '1:1 sync', time: '16:30', color: 'cobalt' },
  { id: 'e4', date: '2026-08-05', title: 'Gym', time: '07:00', color: 'mint' },
  { id: 'e5', date: '2026-08-08', title: 'Game night', time: '19:00', color: 'violet' },
  { id: 'e6', date: '2026-08-11', title: 'Holidays', color: 'gold' },
  { id: 'e7', date: '2026-08-11', title: 'Birthday dinner', time: '20:30', color: 'coral' },
  { id: 'e8', date: '2026-08-14', title: 'Retro', time: '15:00', color: 'cobalt' },
  { id: 'e9', date: '2026-08-17', title: 'Planning', time: '10:00', color: 'cobalt' },
  { id: 'e10', date: '2026-08-17', title: 'Haircut', time: '16:00' },
  { id: 'e11', date: '2026-08-20', title: 'Stand-up', time: '11:30', color: 'cobalt' },
  { id: 'e12', date: '2026-08-20', title: 'Team lunch', time: '13:00', color: 'amber' },
  { id: 'e13', date: '2026-08-20', title: 'Portfolio review', time: '14:30', color: 'violet' },
  { id: 'e14', date: '2026-08-20', title: '1:1 sync', time: '16:30', color: 'cobalt' },
  { id: 'e15', date: '2026-08-24', title: 'Dinner with friends', time: '19:15', color: 'coral' },
  { id: 'e16', date: '2026-08-27', title: 'Yoga', time: '07:30', color: 'mint' },
  { id: 'e17', date: '2026-08-29', title: 'Brunch', time: '11:00', color: 'amber' },
  { id: 'e18', date: '2026-08-31', title: 'Payday', color: 'gold' },
];

const meta = {
  title: 'Components/EventCalendar',
  component: EventCalendar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    maxEventsPerDay: { control: 'number' },
  },
  args: {
    events,
    defaultMonth: '2026-08',
  },
} satisfies Meta<typeof EventCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithOverflow: Story = {
  args: {
    maxEventsPerDay: 2,
    onDateClick: () => {},
  },
};

export const Interactive: Story = {
  args: {
    onEventClick: () => {},
    onDateClick: () => {},
  },
};

export const SelectedDay: Story = {
  args: {
    selectedDate: '2026-08-20',
    onDateClick: () => {},
    onEventClick: () => {},
  },
};

/** Today pinned to a fixed date, for a demo, a test or a time zone the device is not in: the today chip and the month shown first follow it. */
export const PinnedToday: Story = {
  args: {
    defaultMonth: undefined,
    today: '2026-08-14',
  },
  play: async ({ canvasElement }) => {
    const todayCell = canvasElement.querySelector('.ds-event-calendar__cell--today');
    await expect(todayCell).not.toBeNull();
    await expect(todayCell?.textContent).toContain('14');
  },
};

/** Events over several days, joined across them, and a legend saying what each colour means. */
export const SpansAndLegend: Story = {
  args: {
    events: [
      { id: 's1', date: '2026-08-10', endDate: '2026-08-14', title: 'Offsite', color: 'violet' },
      { id: 's2', date: '2026-08-19', endDate: '2026-08-25', title: 'Release freeze', color: 'coral' },
      { id: 's3', date: '2026-08-12', title: 'Design review', time: '10:00', color: 'cobalt' },
      { id: 's4', date: '2026-08-27', title: 'Launch', color: 'mint' },
    ],
    legend: [
      { color: 'violet', label: 'Offsites' },
      { color: 'coral', label: 'Freezes' },
      { color: 'cobalt', label: 'Reviews' },
      { color: 'mint', label: 'Milestones' },
    ],
    onEventClick: () => {},
  },
  play: async ({ canvasElement, canvas }) => {
    // A five-day event draws a pill on each of its days, its dot on the first.
    await expect(canvasElement.querySelectorAll('.ds-event-calendar__event--span.ds-event-calendar__event--violet')).toHaveLength(5);
    await expect(canvasElement.querySelectorAll('.ds-event-calendar__event.ds-event-calendar__event--violet:not(.ds-event-calendar__event--continued)')).toHaveLength(1);
    // Its name says the whole range, written by Intl in the calendar's locale.
    await expect(canvas.getAllByRole('button', { name: 'Offsite, August 10 – 14, 2026' })).toHaveLength(5);
    await expect(canvas.getByRole('list')).toHaveTextContent('Offsites');
  },
};

/** One week in tall cells, every event shown, stepping a week at a time; the heading is the week's range in the calendar's locale. */
export const WeekView: Story = {
  args: {
    view: 'week',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'August 16 – 22, 2026' })).toBeInTheDocument();
    // Every event on the busiest day shows, with no overflow row.
    await expect(canvas.queryByText(/more$/)).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Next week' }));
    await expect(canvas.getByRole('group', { name: 'August 23 – 29, 2026' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous week' }));
  },
};

/** With no `onDateClick`, a full day's "+N more" opens the day in place, and "Show less" folds it back. */
export const ExpandDay: Story = {
  args: { maxEventsPerDay: 2 },
  play: async ({ canvas, userEvent }) => {
    const more = canvas.getAllByRole('button', { name: /more events?,/ })[0];
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    const less = canvas.getByRole('button', { name: 'Show less' });
    await expect(less).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(less);
    await expect(canvas.queryByRole('button', { name: 'Show less' })).toBeNull();
  },
};

export const WithActions: Story = {
  args: {
    actions: <Button variant="secondary" size="compact" label="New event" iconLeft="add" />,
  },
};

export const EmptyMonth: Story = {
  args: {
    events: [],
    defaultMonth: '2026-09',
  },
};

/** At a small phone's width, with actions beside it, the month name stays whole. */
export const NarrowWithActions: Story = {
  args: {
    actions: <Button variant="secondary" size="compact" label="New event" iconLeft="add" />,
    defaultMonth: '2026-09',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const month = canvasElement.querySelector<HTMLElement>('.ds-event-calendar__month')!;
    await expect(month.scrollWidth).toBeLessThanOrEqual(month.clientWidth + 1);
  },
};
