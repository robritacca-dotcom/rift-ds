import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { EventCalendar, type EventCalendarEvent } from './EventCalendar';
import React from 'react';
import { Button } from '../Button/Button';
import { List, ListItem } from '../List/List';

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
    const week = canvas.getByRole('group', { name: 'August 16 – 22, 2026' });
    // Plain spaces only: ICU's thin spaces differ between Node and browsers and would break hydration.
    await expect(week.getAttribute('aria-label')).not.toMatch(/[\u00A0\u2009\u202F]/);
    // Every event on the busiest day shows, with no overflow row.
    await expect(canvas.queryByText(/more$/)).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Next week' }));
    await expect(canvas.getByRole('group', { name: 'August 23 – 29, 2026' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous week' }));
  },
};

/** Times sort by the clock, whatever form they are written in: "8:50" before "12:50", "11:00 AM" before "1:40 PM". */
export const ClockOrder: Story = {
  args: {
    view: 'day',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
    events: [
      { id: 'c1', date: '2026-08-20', title: 'Lunch duty', time: '12:50', color: 'amber' },
      { id: 'c2', date: '2026-08-20', title: 'Maths', time: '8:50', color: 'cobalt' },
      { id: 'c3', date: '2026-08-20', title: 'Science', time: '1:40 PM', color: 'mint' },
      { id: 'c4', date: '2026-08-20', title: 'Assembly', time: '11:00 AM', color: 'violet' },
    ],
  },
  play: async ({ canvas }) => {
    const titles = ['Maths', 'Assembly', 'Lunch duty', 'Science'].map((title) => canvas.getByText(title));
    for (let i = 1; i < titles.length; i++) {
      await expect(titles[i - 1].compareDocumentPosition(titles[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
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

/** One day, the week view's cell alone: every event, stepping a day at a time, headed with the full date. */
export const DayView: Story = {
  args: {
    view: 'day',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'Thursday, August 20, 2026' })).toBeInTheDocument();
    await expect(canvas.getByText('Portfolio review')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next day' }));
    await expect(canvas.getByRole('group', { name: 'Friday, August 21, 2026' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous day' }));
  },
};

const timetable: EventCalendarEvent[] = [
  { id: 't1', date: '2026-08-20', title: 'Registration', start: '08:30', end: '08:50', color: 'neutral' },
  { id: 't2', date: '2026-08-20', title: 'Maths', start: '08:50', end: '09:50', color: 'cobalt' },
  { id: 't3', date: '2026-08-20', title: 'English', start: '09:50', end: '10:50', color: 'violet' },
  { id: 't4', date: '2026-08-20', title: 'Break', start: '10:50', end: '11:10', color: 'amber' },
  { id: 't5', date: '2026-08-20', title: 'Science', start: '11:10', end: '12:10', color: 'mint' },
  { id: 't6', date: '2026-08-20', title: 'Sports day', color: 'gold' },
  { id: 't7', date: '2026-08-21', title: 'Art', start: '13:40', end: '14:40', color: 'coral' },
];

/** `start` and `end` are 24-hour data; the calendar writes them in its locale and names each event with its range. */
export const StartAndEnd: Story = {
  args: {
    view: 'week',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
    events: timetable,
    onEventClick: () => {},
  },
  play: async ({ canvas }) => {
    const maths = canvas.getByRole('button', { name: /^Maths, / });
    await expect(maths).toHaveAccessibleName('Maths, 8:50 – 9:50 AM, Thursday, August 20, 2026');
    // Plain spaces only, so a server render and the browser agree.
    await expect(maths.getAttribute('aria-label')).not.toMatch(/[\u00A0\u2009\u202F]/);
    await expect(canvas.getByRole('button', { name: /^Art, / })).toHaveAccessibleName('Art, 1:40 – 2:40 PM, Friday, August 21, 2026');
  },
};

/** The same times in a 24-hour locale. */
export const StartAndEndGerman: Story = {
  args: { ...StartAndEnd.args, locale: 'de-DE' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /^Maths, / }).getAttribute('aria-label')).toMatch(/^Maths, 08:50–09:50 Uhr, Donnerstag/);
  },
};

/** The day view is a schedule: start over end, a bar in the event's accent, the title, and on today a now marker between the events. */
export const DaySchedule: Story = {
  args: {
    view: 'day',
    defaultMonth: undefined,
    today: '2026-08-20',
    now: '10:15',
    events: timetable,
    onEventClick: () => {},
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const list = canvas.getByRole('list');
    const items = Array.from(list.children).map((item) => item.textContent);
    // The untimed event leads, then the clock; the marker sits inside English, before Break.
    await expect(items).toEqual([
      'All daySports day',
      '8:30 AM8:50 AMRegistration',
      '8:50 AM9:50 AMMaths',
      '9:50 AM10:50 AMEnglish',
      'Now',
      '10:50 AM11:10 AMBreak',
      '11:10 AM12:10 PMScience',
    ]);
    await expect(canvas.getByRole('button', { name: 'Science, 11:10 AM – 12:10 PM, Thursday, August 20, 2026' })).toBeInTheDocument();
    // Another day is not today, so it has no marker.
    await userEvent.click(canvas.getByRole('button', { name: 'Next day' }));
    await expect(canvasElement.querySelector('.ds-event-calendar__now')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Next day' }));
    await expect(canvas.getByText('No events')).toBeInTheDocument();
  },
};

/** `bare` drops the calendar's own surface, for a Panel or Widget that draws one. */
export const Bare: Story = {
  args: { bare: true },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, border: '1px solid var(--color-bg-container-border)', borderRadius: 'var(--radius-300)' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const calendar = canvasElement.querySelector<HTMLElement>('.ds-event-calendar')!;
    await expect(calendar).toHaveClass('ds-event-calendar--bare');
    await expect(getComputedStyle(calendar).borderTopStyle).toBe('none');
    await expect(getComputedStyle(calendar).paddingTop).toBe('0px');
  },
};

/** `weekLabel` and `dayLabel` write the week and day headings, twins of `monthLabel`. */
export const CustomHeadings: Story = {
  args: {
    view: 'week',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
    weekLabel: (start: Date, end: Date) => `Week of ${start.getDate()} to ${end.getDate()}`,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Week of 16 to 22' })).toBeInTheDocument();
  },
};

export const CustomDayHeading: Story = {
  args: {
    view: 'day',
    selectedDate: '2026-08-20',
    defaultMonth: undefined,
    today: '2026-08-20',
    dayLabel: (date: Date) => `Day ${date.getDate()}`,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Day 20' })).toBeInTheDocument();
  },
};

/** `legendToggles` makes each legend entry a Chip that shows or hides its colour's events, in every view. */
export const LegendToggles: Story = {
  args: {
    legendToggles: true,
    legend: [
      { color: 'cobalt', label: 'Meetings' },
      { color: 'amber', label: 'Meals' },
      { color: 'mint', label: 'Exercise' },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByText('Stand-up')).toHaveLength(2);
    const meetings = canvas.getByRole('button', { name: 'Meetings' });
    await expect(meetings).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(meetings);
    await expect(meetings).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.queryByText('Stand-up')).toBeNull();
    await userEvent.click(meetings);
  },
};

/** `renderSelectedDay` draws the host's panel for the chosen day under the grid, handed the day and its events. */
export const SelectedDayPanel: Story = {
  render: function Render(args) {
    const [day, setDay] = React.useState('2026-08-20');
    return (
      <EventCalendar
        {...args}
        selectedDate={day}
        onDateClick={setDay}
        renderSelectedDay={(date, dayEvents) => (
          <List variant="plain" spacing="compact">
            {dayEvents.length === 0 ? (
              <ListItem>Nothing on {date}.</ListItem>
            ) : (
              dayEvents.map((event) => (
                <ListItem key={event.id}>
                  {event.time ? `${event.time} ` : ''}
                  {event.title}
                </ListItem>
              ))
            )}
          </List>
        )}
      />
    );
  },
};
