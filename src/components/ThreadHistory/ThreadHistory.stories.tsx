import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { ThreadHistory } from './ThreadHistory';

/* All data here is fictional: atlas-* are made-up repos. */

const GROUPS = [
  {
    label: 'atlas-app',
    threads: [
      { id: 'onboarding', title: 'Rework the onboarding flow', meta: '2h' },
      { id: 'search', title: 'Speed up the search index', meta: '1d' },
      { id: 'billing', title: 'Untangle the billing webhooks', meta: '3d' },
    ],
  },
  {
    label: 'atlas-docs',
    threads: [
      { id: 'quickstart', title: 'Rewrite the quickstart guide', meta: '4d' },
      { id: 'broken-links', title: 'Fix the broken changelog links', meta: '1w' },
    ],
  },
];

const ACTIONS = [
  { id: 'rename', label: 'Rename', icon: 'edit' },
  { id: 'delete', label: 'Delete', icon: 'delete', destructive: true },
];

const meta = {
  title: 'Components/ThreadHistory',
  component: ThreadHistory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    groups: GROUPS,
    activeThreadId: 'search',
    onThreadSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 256 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThreadHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Labelled groups of thread rows, the active one filled. A row press
 *  reports the thread's id. */
export const Default: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Rewrite the quickstart guide/ }));
    await expect(args.onThreadSelect).toHaveBeenCalledWith('quickstart');
    await expect(canvas.getByRole('button', { name: /Speed up the search index/ })).toHaveAttribute('aria-current', 'true');
  },
};

/** The full row anatomy: a status dot on every row once any thread has
 *  one, a description line, a trailing glyph, the pin marker and the meta
 *  caption. Each state but idle is read aloud after the title. */
export const Details: Story = {
  args: {
    groups: [
      {
        label: 'Pinned',
        threads: [
          { id: 'plan', title: 'Plan the launch week', description: 'Waiting on the beta invite list', status: 'waiting', pinned: true, meta: '32m' },
        ],
      },
      {
        label: 'This week',
        threads: [
          { id: 'invoices', title: 'Import last year’s invoices', description: '212 of 340 matched', status: 'working', icon: 'cloud', meta: '2m' },
          { id: 'roles', title: 'Set up roles for the team', status: 'unread', meta: '5d' },
          { id: 'notify', title: 'Quiet the mention notifications', status: 'error', meta: '1w' },
          { id: 'naming', title: 'New chat', pending: true },
        ],
      },
    ],
    activeThreadId: undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Plan the launch week Needs input Pinned/ })).toBeInTheDocument();
  },
};

/** `threadActions` with `onThreadAction` put an overflow menu on every row:
 *  revealed on hover or focus, and always showing on a touch screen. */
export const ThreadMenu: Story = {
  args: {
    threadActions: ACTIONS,
    onThreadAction: fn(),
  },
  play: async ({ args, canvas, userEvent: user }) => {
    // The trigger rests hidden; keyboard focus reveals it (the hover reveal
    // is CSS the synthetic pointer cannot exercise).
    const trigger = canvas.getByRole('button', { name: 'Thread options: Speed up the search index' });
    trigger.focus();
    await user.click(trigger);
    await user.click(canvas.getByRole('menuitem', { name: 'Delete' }));
    await expect(args.onThreadAction).toHaveBeenCalledWith('search', 'delete');
    // Rest the pointer off the rows so hover styling stays out of snapshots.
    await user.click(canvas.getByRole('navigation'));
  },
};

/** `renamingThreadId` swaps a row to an inline field. Enter commits a new
 *  title; Escape cancels and hands focus back to the row. */
export const Renaming: Story = {
  args: {
    renamingThreadId: 'search',
    onThreadRename: fn(),
    onRenameCancel: fn(),
  },
  render: function Render(args) {
    const [renaming, setRenaming] = useState<string | undefined>(args.renamingThreadId);
    return (
      <ThreadHistory
        {...args}
        renamingThreadId={renaming}
        onThreadRename={(id, title) => {
          args.onThreadRename?.(id, title);
          setRenaming(undefined);
        }}
        onRenameCancel={() => {
          args.onRenameCancel?.();
          setRenaming(undefined);
        }}
      />
    );
  },
  play: async ({ args, canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Rename thread' });
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await expect(args.onRenameCancel).toHaveBeenCalled();
    await waitFor(() => expect(canvas.queryByRole('textbox')).not.toBeInTheDocument());
  },
};

/** Enter commits a rename: the host hears the thread and its new title. */
export const RenameCommit: Story = {
  args: Renaming.args,
  render: Renaming.render,
  play: async ({ args, canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Rename thread' });
    await waitFor(() => expect(field).toHaveFocus());
    await userEvent.clear(field);
    await userEvent.type(field, 'Faster search{Enter}');
    await expect(args.onThreadRename).toHaveBeenCalledWith('search', 'Faster search');
  },
};

/** `moreLabel` adds a quiet trailing row that reveals older threads. */
export const ShowMore: Story = {
  args: { moreLabel: 'Show 12 more', onShowMore: fn() },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show 12 more' }));
    await expect(args.onShowMore).toHaveBeenCalled();
  },
};

/** `collapsibleSections` folds each labelled group under its heading. The
 *  history is stateless, so the host keeps the folded list. */
export const CollapsibleSections: Story = {
  args: { collapsibleSections: true },
  render: function Render(args) {
    const [collapsed, setCollapsed] = useState<string[]>([]);
    return <ThreadHistory {...args} collapsedSections={collapsed} onCollapsedSectionsChange={setCollapsed} />;
  },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('button', { name: 'atlas-docs' });
    await expect(heading).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(heading);
    await expect(heading).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(heading.closest('.ds-thread-history__section-head')!.nextElementSibling).toHaveAttribute('inert'));
    // Rest open, as the snapshot expects.
    await userEvent.click(heading);
    await expect(heading).toHaveAttribute('aria-expanded', 'true');
  },
};
