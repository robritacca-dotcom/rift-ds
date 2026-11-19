import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DecisionRow, type DecisionRowStatus } from './DecisionRow';
import { Avatar } from '../Avatar/Avatar';
import { Widget } from '../Widget/Widget';

const meta = {
  title: 'Components/DecisionRow',
  component: DecisionRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'Room booking for Thursday',
    description: 'Board room, 2 to 4pm, 8 people',
    meta: '2h ago',
    onAccept: fn(),
    onDecline: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Widget title="Waiting on you">
          <Story />
        </Widget>
      </div>
    ),
  ],
} satisfies Meta<typeof DecisionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pending: two buttons in the host's words. Accept settles the row to its mark and fires `onAccept`. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }));
    await expect(args.onAccept).toHaveBeenCalled();
    await expect(canvasElement.querySelector('.ds-badge')).toHaveTextContent('Accepted');
    await expect(canvas.getByRole('status')).toHaveTextContent('Accepted: Room booking for Thursday');
    /* With no Undo, focus lands on the row rather than on nothing. */
    await expect(canvasElement.querySelector('.ds-decision-row')).toHaveFocus();
  },
};

/** The host's own words: any yes and no a queue asks, here Keep and Discard, with the settled marks to match. */
export const OwnWords: Story = {
  args: {
    title: 'Draft reply to the supplier',
    description: 'Written by the assistant',
    acceptLabel: 'Keep',
    declineLabel: 'Discard',
    acceptedLabel: 'Kept',
    declinedLabel: 'Discarded',
  },
};

/** A yes that takes something away takes `tone="destructive"` on its accept button. */
export const Destructive: Story = {
  args: {
    title: 'Remove Sam from the workspace',
    description: 'Requested by an admin',
    acceptLabel: 'Remove',
    declineLabel: 'Keep',
    acceptedLabel: 'Removed',
    declinedLabel: 'Kept',
    tone: 'destructive',
  },
};

/** Settled, with Undo while the host can reverse it. Undo returns the row to pending and focus to its first button. */
export const WithUndo: Story = {
  args: { defaultStatus: 'declined', onUndo: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onUndo).toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: 'Accept' })).toHaveFocus();
  },
};

/** A queue: several rows in one Widget, with a leading avatar, each decided on its own. The host owns the statuses. */
export const Queue: Story = {
  render: () => {
    const items = [
      { id: 'a', name: 'Priya Natarajan', what: 'Access to the design files', when: '10m ago' },
      { id: 'b', name: 'Tom Okafor', what: 'A second monitor', when: 'Yesterday' },
      { id: 'c', name: 'Lena Fischer', what: 'Edit rights on the roadmap', when: 'Mon' },
    ];
    const [statuses, setStatuses] = useState<Record<string, DecisionRowStatus>>({ b: 'accepted' });
    return (
      <>
        {items.map((item) => (
          <DecisionRow
            key={item.id}
            title={item.name}
            description={item.what}
            meta={item.when}
            leading={<Avatar name={item.name} size="sm" />}
            status={statuses[item.id] ?? 'pending'}
            onStatusChange={(status) => setStatuses((current) => ({ ...current, [item.id]: status }))}
            onUndo={() => {}}
            acceptLabel="Approve"
            declineLabel="Deny"
            acceptedLabel="Approved"
            declinedLabel="Denied"
          />
        ))}
      </>
    );
  },
};

/** At a phone's width the decision wraps under the title instead of running off the edge. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  args: { title: 'Priya Natarajan', description: 'Access to the design files', acceptLabel: 'Approve', declineLabel: 'Deny' },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.ds-decision-row')!.getBoundingClientRect();
    for (const button of canvasElement.querySelectorAll('.ds-decision-row button')) {
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(row.right + 0.5);
    }
    const title = canvasElement.querySelector('.ds-widget-row__title')!.getBoundingClientRect();
    await expect(title.width).toBeGreaterThan(100);
  },
};
