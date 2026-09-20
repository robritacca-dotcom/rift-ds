import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { ThreadTabs, type ThreadTab } from './ThreadTabs';

/* All data here is fictional: Skylark is a made-up product, atlas-* are
   made-up repos. */

const TABS: ThreadTab[] = [
  { id: 'onboarding', label: 'Rework the onboarding flow', icon: 'forum' },
  { id: 'search', label: 'Speed up the search index', icon: 'forum' },
  { id: 'billing', label: 'Untangle the billing webhooks', icon: 'forum' },
];

const meta = {
  title: 'Components/ThreadTabs',
  component: ThreadTabs,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    activeId: { control: 'text' },
    closeLabel: { control: 'text' },
    addLabel: { control: 'text' },
  },
  args: {
    tabs: TABS,
    activeId: 'search',
    onTabSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThreadTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The resting strip: pill tabs with a leading glyph, the active session
 *  filled the way ThreadPanel fills its active row. */
export const Default: Story = {};

/** With `onTabClose` every tab carries a close button — geometry-stable,
 *  fading in on hover or keyboard focus and standing revealed on the
 *  active tab. Delete on a focused tab closes it too. */
export const Closable: Story = {
  args: {
    onTabClose: fn(),
  },
};

/** The trailing new-tab action, rendered when `onAdd` is wired — the
 *  strip's own quiet "+", matching the panel's new-thread affordance. */
export const WithAdd: Story = {
  args: {
    onTabClose: fn(),
    onAdd: fn(),
  },
};

/** A tab with unseen activity leads its label with the small status dot,
 *  ThreadPanel's unread marker restated at tab scale. */
export const Unread: Story = {
  args: {
    tabs: [
      { ...TABS[0], unread: true },
      TABS[1],
      { ...TABS[2], unread: true },
    ],
  },
};

/** Labels dissolve under a trailing mask when they outgrow the tab's
 *  maximum width; the full text stays in the native tooltip. */
export const LongLabels: Story = {
  args: {
    tabs: [
      {
        id: 'long',
        label:
          'Investigate why the nightly import job quietly drops rows mid-file',
        icon: 'forum',
      },
      { id: 'short', label: 'Fix the favicon', icon: 'forum' },
    ],
    activeId: 'long',
  },
};

/** Selection and dismissal are the host's: clicking a tab fires
 *  `onTabSelect`, its close button fires `onTabClose`, the trailing "+"
 *  fires `onAdd`, and the controlled `activeId` carries `aria-current`. */
export const Selection: Story = {
  args: {
    onTabClose: fn(),
    onAdd: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Rework the onboarding flow' }),
    );
    await expect(args.onTabSelect).toHaveBeenCalledWith('onboarding');

    // The close button rests hidden; the active tab keeps its revealed.
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Close thread: Speed up the search index',
      }),
    );
    await expect(args.onTabClose).toHaveBeenCalledWith('search');

    await userEvent.click(canvas.getByRole('button', { name: 'New thread' }));
    await expect(args.onAdd).toHaveBeenCalled();

    const active = canvas.getByRole('button', {
      name: 'Speed up the search index',
    });
    await expect(active).toHaveAttribute('aria-current', 'true');

    // Rest the pointer off the tabs so hover styling stays out of snapshots.
    await userEvent.click(canvas.getByRole('list'));
  },
};

/** The live choreography: a stateful host opens and closes tabs, and the
 *  strip animates each change — a new tab glides open in place, a closed
 *  one folds away while its neighbours slide over. The play adds a tab
 *  through the "+", closes it, and waits for the exit to finish. */
const LifecycleHost = () => {
  const [tabs, setTabs] = useState<ThreadTab[]>(TABS.slice(0, 2));
  const [active, setActive] = useState('search');
  const [minted, setMinted] = useState(0);
  return (
    <ThreadTabs
      tabs={tabs}
      activeId={active}
      onTabSelect={setActive}
      onTabClose={(id) => {
        setTabs((current) => current.filter((tab) => tab.id !== id));
        setActive((current) => {
          if (current !== id) return current;
          const index = tabs.findIndex((tab) => tab.id === id);
          return (tabs[index + 1] ?? tabs[index - 1])?.id ?? '';
        });
      }}
      onAdd={() => {
        const id = `fresh-${minted}`;
        setMinted((n) => n + 1);
        setTabs((current) => [
          ...current,
          { id, label: 'New chat', icon: 'forum' },
        ]);
        setActive(id);
      }}
    />
  );
};

export const Lifecycle: Story = {
  render: () => <LifecycleHost />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'New thread' }));
    const fresh = await canvas.findByRole('button', { name: 'New chat' });
    await expect(fresh).toHaveAttribute('aria-current', 'true');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Close thread: New chat' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'New chat' }),
      ).not.toBeInTheDocument(),
    );

    // Rest the pointer off the tabs so hover styling stays out of snapshots.
    await userEvent.click(canvas.getByRole('list'));
  },
};
