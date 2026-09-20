import type { Meta, StoryObj } from '@storybook/react-vite';
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
