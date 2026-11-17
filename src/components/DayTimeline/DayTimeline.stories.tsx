import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { DayTimeline } from './DayTimeline';

const meta = {
  title: 'Components/DayTimeline',
  component: DayTimeline,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    label: 'Bookings, Tuesday',
    startHour: 7,
    endHour: 20,
    now: '13:20',
    rows: [
      { id: 'a', label: 'Room A', bars: [{ id: 'a1', start: '08:00', end: '12:00', label: 'Workshop', color: 'violet' }, { id: 'a2', start: '13:00', end: '17:30', label: 'Training', color: 'violet' }] },
      { id: 'b', label: 'Room B', bars: [{ id: 'b1', start: '09:30', end: '10:30', label: 'Stand-up', color: 'cobalt' }, { id: 'b2', start: '14:00', end: '15:00', color: 'cobalt' }] },
      { id: 'c', label: 'Studio', bars: [{ id: 'c1', start: '10:00', end: '18:00', label: 'Recording', color: 'mint' }] },
      { id: 'd', label: 'Lab', bars: [] },
    ],
  },
} satisfies Meta<typeof DayTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row per room, a bar per booking, on an axis of hours with a line at the time now. Each bar is named with its row and its times. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Bookings, Tuesday' })).toBeInTheDocument();
    await expect(canvas.getByText(/^Room A, Workshop, 8:00/)).toBeInTheDocument();
  },
};

/** Bars that open something when pressed. */
export const Clickable: Story = {
  args: { onBarClick: fn() },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Studio, Recording/ }));
    await expect(args.onBarClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }), expect.objectContaining({ id: 'c' }));
  },
};

/** In another locale: the hours are written the reader's way. */
export const Localised: Story = {
  args: { locale: 'de-DE' },
};
