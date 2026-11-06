import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ActionCard, type ActionCardStatus } from './ActionCard';

/* All content here is fictional set dressing. */

const meta = {
  title: 'Components/ActionCard',
  component: ActionCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Archive projects: 12 projects',
    detail: 'Left as they are: 3 already archived',
    icon: 'inventory_2',
    receipt: '12 projects archived',
    onConfirm: fn(),
    onDismiss: fn(),
    onUndo: fn(),
  },
  argTypes: {
    status: { control: 'select', options: ['proposed', 'confirmed', 'dismissed', 'undone'] },
  },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Proposed: what the change does and what it leaves alone, waiting on the reader. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Confirm' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

/** A change that takes something away draws Confirm in the destructive `tone`. */
export const Destructive: Story = {
  args: { title: 'Delete drafts: 4 drafts', detail: undefined, icon: 'delete', tone: 'destructive' },
};

/** Confirmed: the record of what happened, announced as a status, with Undo while it can be reversed. */
export const Confirmed: Story = {
  args: { status: 'confirmed' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('12 projects archived');
  },
};

/** With `facts`: the proposal lists what the change will do over Confirm, as a readout would, so the reader confirms with the numbers in front of them. */
export const WithFacts: Story = {
  args: {
    detail: undefined,
    facts: [
      { label: 'Status', value: 'Active 9 · Paused 3 → Archived 12' },
      { label: 'Owners', value: '5' },
      { label: 'Left alone', value: '3 already archived' },
    ],
  },
};

/** Confirmed with `facts`: the record keeps them under the receipt, so the card the reader confirmed becomes the readout of what it did. */
export const ConfirmedWithFacts: Story = {
  args: {
    ...WithFacts.args,
    status: 'confirmed',
    facts: [
      { label: 'Status', value: 'Active 9 · Paused 3 → Archived 12' },
      { label: 'Owners', value: '5' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('12 projects archived');
    await expect(within(canvasElement).getByText('Owners')).toBeVisible();
  },
};

/** Dismissed: nothing changed, and the card says so. */
export const Dismissed: Story = {
  args: { status: 'dismissed' },
};

/** Undone: reversed after it was made. */
export const Undone: Story = {
  args: { status: 'undone' },
};

/** The host owns the status: Confirm makes the change, then Undo reverses it. */
export const Lifecycle: Story = {
  render: function Render(args) {
    const [status, setStatus] = useState<ActionCardStatus>('proposed');
    return (
      <ActionCard
        {...args}
        status={status}
        onConfirm={() => setStatus('confirmed')}
        onDismiss={() => setStatus('dismissed')}
        onUndo={() => setStatus('undone')}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('12 projects archived');
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Undone');
  },
};

/** Every word on the card, localised through its props: here in Spanish. */
export const LocalisedCopy: Story = {
  args: {
    title: 'Archivar proyectos: 12 proyectos',
    detail: 'Sin cambios: 3 ya archivados',
    confirmLabel: 'Confirmar',
    dismissLabel: 'Descartar',
  },
};
