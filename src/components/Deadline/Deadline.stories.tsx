import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Deadline } from './Deadline';
import { Text } from '../Text/Text';

/** Every story measures from one fixed moment, so the words never drift. */
const NOW = '2026-11-06T17:00:00Z';
const HOUR = 3_600_000;
const from = (hours: number) => new Date(Date.parse(NOW) + hours * HOUR).toISOString();

const meta = {
  title: 'Components/Deadline',
  component: Deadline,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    display: { control: 'inline-radio', options: ['relative', 'absolute', 'both'] },
    variant: { control: 'inline-radio', options: ['badge', 'text'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: { date: from(5 * 24), now: NOW },
} satisfies Meta<typeof Deadline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five days out: neutral. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Due in 5 days')).toBeInTheDocument();
  },
};

/** The three statuses and a passed deadline, at the default thresholds of three days and one. */
export const Statuses: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--gap-200)', flexWrap: 'wrap' }}>
      <Deadline {...args} date={from(5 * 24)} />
      <Deadline {...args} date={from(2 * 24)} />
      <Deadline {...args} date={from(5)} />
      <Deadline {...args} date={from(-26)} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Due in 2 days').closest('.ds-deadline')).toHaveClass('ds-deadline--warning');
    await expect(canvas.getByText('Due in 5 hours').closest('.ds-deadline')).toHaveClass('ds-deadline--error');
    await expect(canvas.getByText('Overdue')).toBeInTheDocument();
  },
};

/** A submission cutoff, with the time in the organiser's zone. */
export const CutoffInAZone: Story = {
  args: { date: '2026-11-08T00:00:00Z', timeZone: 'America/Los_Angeles', display: 'both', prefixLabel: 'Closes' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Closes tomorrow · Nov 7, 4:00 PM PST')).toBeInTheDocument();
  },
};

/** A trial's end as a date. */
export const TrialExpiry: Story = {
  args: { date: from(10 * 24), display: 'absolute', prefixLabel: 'Expires', timeZone: 'UTC' },
};

/** A ticket's service level, which turns hours rather than days ahead. */
export const TicketServiceLevel: Story = {
  args: { date: from(3), prefixLabel: 'Respond', thresholds: { warning: 4 * HOUR, critical: HOUR } },
};

/** Inline in a sentence or a cell, in the status text colour alone. */
export const InlineText: Story = {
  render: (args) => (
    <Text>
      Invoice INV-2041 is <Deadline {...args} variant="text" date={from(30)} prefixLabel="due" />.
    </Text>
  ),
};

/** In German. */
export const German: Story = {
  args: { locale: 'de-DE', prefixLabel: 'Fällig', date: from(2 * 24) },
};

export const Compact: Story = {
  args: { size: 'compact' },
};
