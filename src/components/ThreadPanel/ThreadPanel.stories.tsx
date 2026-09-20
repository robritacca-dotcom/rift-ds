import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ThreadPanel } from './ThreadPanel';

/* All data here is fictional: Skylark is a made-up product, atlas-* are
   made-up repos. */

const GROUPS = [
  {
    label: 'atlas-app',
    threads: [
      { id: 'onboarding', title: 'Rework the onboarding flow' },
      { id: 'search', title: 'Speed up the search index' },
      { id: 'billing', title: 'Untangle the billing webhooks' },
      { id: 'flags', title: 'Retire the stale feature flags' },
    ],
  },
  {
    label: 'atlas-docs',
    threads: [
      { id: 'quickstart', title: 'Rewrite the quickstart guide' },
      { id: 'api-ref', title: 'Generate the API reference' },
      { id: 'broken-links', title: 'Fix the broken changelog links' },
    ],
  },
];

const CONTROLS = [
  { id: 'runs', icon: 'play_circle', label: 'Runs' },
  { id: 'automations', icon: 'schedule', label: 'Automations' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

const PROJECTS = [
  { id: 'atlas-app', label: 'Atlas app', icon: 'folder', meta: '1m' },
  { id: 'atlas-docs', label: 'Atlas docs', icon: 'folder', meta: '2d' },
];

const meta = {
  title: 'Components/ThreadPanel',
  component: ThreadPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    activeThreadId: { control: 'text' },
    logoText: { control: 'text' },
    newThreadLabel: { control: 'text' },
    moreLabel: { control: 'text' },
  },
  args: {
    groups: GROUPS,
    onThreadSelect: fn(),
    onNewThread: fn(),
    onControlSelect: fn(),
    onShowMore: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, height: 560, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThreadPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full anatomy: brand, new-thread action with its shortcut hint,
 *  standing controls, grouped history with an active row, and the footer
 *  profile. */
export const Default: Story = {
  args: {
    logoText: 'Skylark',
    activeThreadId: 'search',
    newThreadLabel: 'New thread',
    newThreadShortcut: ['Ctrl', 'N'],
    controls: CONTROLS,
    moreLabel: 'Show 12 more',
    profile: { name: 'Robin Vale', meta: 'Team' },
    onExpandedChange: fn(),
  },
};

/** Collapsed to the icon rail: the toggle, the new-thread and control
 *  icons, and the avatar; the history hides and every hidden label moves
 *  into its row's accessible name and tooltip. The host owns the state and
 *  the band's width. */
export const Collapsed: Story = {
  args: {
    logoText: 'Skylark',
    expanded: false,
    onExpandedChange: fn(),
    activeThreadId: 'search',
    newThreadLabel: 'New thread',
    controls: CONTROLS,
    profile: { name: 'Robin Vale', meta: 'Team' },
  },
};

/** Nothing but the history: every other section is optional and simply
 *  absent when its props are. */
export const ThreadsOnly: Story = {
  args: {
    activeThreadId: 'quickstart',
  },
};

/** Threads carrying `meta` timestamps at the trailing edge. */
export const WithMeta: Story = {
  args: {
    logoText: 'Skylark',
    activeThreadId: 'onboarding',
    groups: [
      {
        label: 'atlas-app',
        threads: [
          { id: 'onboarding', title: 'Rework the onboarding flow', meta: 'now' },
          { id: 'search', title: 'Speed up the search index', meta: '2h' },
          { id: 'billing', title: 'Untangle the billing webhooks', meta: '1d' },
          { id: 'flags', title: 'Retire the stale feature flags', meta: '3d' },
        ],
      },
    ],
  },
};

/** The full detail anatomy on thread rows: an unread dot leads the title,
 *  a `description` takes a quiet second line under the same trailing fade,
 *  and the trailing cluster holds a session glyph beside the meta. */
export const Details: Story = {
  args: {
    logoText: 'Skylark',
    activeThreadId: 'search',
    groups: [
      {
        label: 'Today',
        threads: [
          {
            id: 'onboarding',
            title: 'Rework the onboarding flow',
            description: 'atlas-app · main',
            unread: true,
            icon: 'cloud',
            meta: '32m',
          },
          {
            id: 'search',
            title: 'Speed up the search index',
            description: 'atlas-app · perf/search-index',
            icon: 'cloud',
            meta: '1h',
          },
          {
            id: 'billing',
            title: 'Untangle the billing webhooks',
            description: 'atlas-app · fix/webhook-retries',
            unread: true,
            meta: '3h',
          },
        ],
      },
      {
        label: 'Yesterday',
        threads: [
          {
            id: 'quickstart',
            title: 'Rewrite the quickstart guide',
            description: 'atlas-docs · main',
            meta: '15h',
          },
        ],
      },
    ],
  },
};

/** Pinned threads: `pinned` marks a row with the pin glyph, and the host
 *  keeps pinned threads in their own leading group — pin and unpin travel
 *  through the row menu like every other thread action. */
export const Pinned: Story = {
  args: {
    activeThreadId: 'billing',
    groups: [
      {
        label: 'Pinned',
        threads: [
          { id: 'billing', title: 'Untangle the billing webhooks', pinned: true },
          { id: 'quickstart', title: 'Rewrite the quickstart guide', pinned: true },
        ],
      },
      {
        label: 'atlas-app',
        threads: [
          { id: 'onboarding', title: 'Rework the onboarding flow' },
          { id: 'search', title: 'Speed up the search index' },
          { id: 'flags', title: 'Retire the stale feature flags' },
        ],
      },
    ],
    threadActions: [
      { id: 'pin', label: 'Pin', icon: 'keep' },
      { id: 'rename', label: 'Rename', icon: 'edit' },
      { id: 'delete', label: 'Delete', icon: 'delete', destructive: true },
    ],
    onThreadAction: fn(),
  },
};

/** The projects section: rows under their own overline header between the
 *  standing controls and the history, with a quiet new-project button. The
 *  active project renders filled and carries `aria-current`. */
export const Projects: Story = {
  args: {
    logoText: 'Skylark',
    activeThreadId: 'search',
    newThreadLabel: 'New thread',
    projects: PROJECTS,
    activeProjectId: 'atlas-app',
    onProjectSelect: fn(),
    onProjectCreate: fn(),
    profile: { name: 'Robin Vale', meta: 'Team' },
  },
  play: async ({ args, canvas, userEvent }) => {
    // A project row's accessible name carries its meta caption too.
    await userEvent.click(canvas.getByRole('button', { name: /Atlas docs/ }));
    await expect(args.onProjectSelect).toHaveBeenCalledWith('atlas-docs');

    await userEvent.click(canvas.getByRole('button', { name: 'New project' }));
    await expect(args.onProjectCreate).toHaveBeenCalled();

    const active = canvas.getByRole('button', { name: /Atlas app/ });
    await expect(active).toHaveAttribute('aria-current', 'true');

    // Rest the pointer off the rows so hover styling stays out of snapshots.
    await userEvent.click(canvas.getByRole('navigation'));
  },
};

/** Rows as real links: with an `href` each thread renders as an anchor and
 *  the active row announces `aria-current="page"`. */
export const AsLinks: Story = {
  args: {
    activeThreadId: 'search',
    groups: [
      {
        label: 'atlas-app',
        threads: [
          { id: 'onboarding', title: 'Rework the onboarding flow', href: '#onboarding' },
          { id: 'search', title: 'Speed up the search index', href: '#search' },
          { id: 'billing', title: 'Untangle the billing webhooks', href: '#billing' },
        ],
      },
    ],
    newThreadLabel: 'New thread',
    newThreadHref: '#new',
  },
};

/** Every row can carry an overflow menu — the library's DropdownMenu at
 *  compact size behind a trailing trigger revealed only on hover or
 *  keyboard focus, and held while its menu is open. `threadActions` is
 *  the shared set, a thread's own `actions` overrides it, and the
 *  destructive flag styles delete-like rows. */
export const ThreadMenu: Story = {
  args: {
    activeThreadId: 'search',
    threadActions: [
      { id: 'rename', label: 'Rename', icon: 'edit' },
      { id: 'delete', label: 'Delete', icon: 'delete', destructive: true },
    ],
    onThreadAction: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    // The trigger rests hidden; keyboard focus reveals it (the hover
    // reveal is CSS the synthetic pointer cannot exercise).
    const trigger = canvas.getByRole('button', {
      name: 'Thread options: Speed up the search index',
    });
    trigger.focus();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Delete' }));
    await expect(args.onThreadAction).toHaveBeenCalledWith('search', 'delete');

    // Rest the pointer off the rows so hover styling stays out of snapshots.
    await userEvent.click(canvas.getByRole('navigation'));
  },
};

/** The naming state: a `pending` thread holds its title's place with a
 *  shimmer bar while the host generates a name; the given title (here
 *  "New chat") stays as the row's accessible name and tooltip, and the
 *  row shows no menu until the name lands. */
export const Naming: Story = {
  args: {
    activeThreadId: 'fresh',
    groups: [
      {
        label: 'atlas-app',
        threads: [
          { id: 'fresh', title: 'New chat', pending: true },
          ...GROUPS[0].threads,
        ],
      },
    ],
    threadActions: [{ id: 'delete', label: 'Delete', destructive: true }],
    onThreadAction: fn(),
  },
};

/** Inline rename, controlled like everything else: `renamingThreadId`
 *  swaps that row to a prefilled, selected text field. Enter commits the
 *  trimmed value through `onThreadRename`; Escape, an empty value, or an
 *  unchanged title fire `onRenameCancel` instead. */
export const Renaming: Story = {
  args: {
    activeThreadId: 'search',
    renamingThreadId: 'search',
    onThreadRename: fn(),
    onRenameCancel: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Rename thread' });
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Ship the search rewrite{enter}');
    await expect(args.onThreadRename).toHaveBeenCalledWith(
      'search',
      'Ship the search rewrite',
    );
  },
};

/** Long titles fade out under a trailing mask rather than clipping to an
 *  ellipsis; the full text stays available in the native tooltip. */
export const LongTitles: Story = {
  args: {
    activeThreadId: 'long-2',
    groups: [
      {
        label: 'atlas-app',
        threads: [
          {
            id: 'long-1',
            title:
              'Investigate why the nightly import job quietly drops rows when the upstream feed stalls mid-file',
          },
          {
            id: 'long-2',
            title:
              'Draft the migration plan for moving every workspace onto the new permission model without downtime',
          },
          { id: 'short', title: 'Fix the favicon' },
        ],
      },
    ],
  },
};

/** Selection is the host's: clicking a row fires `onThreadSelect` with the
 *  row's id, and the controlled `activeThreadId` carries `aria-current`. */
export const Selection: Story = {
  args: {
    activeThreadId: 'billing',
    newThreadLabel: 'New thread',
    controls: CONTROLS,
    moreLabel: 'Show 12 more',
    onExpandedChange: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Collapse the panel' }),
    );
    await expect(args.onExpandedChange).toHaveBeenCalledWith(false);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Speed up the search index' }),
    );
    await expect(args.onThreadSelect).toHaveBeenCalledWith('search');

    await userEvent.click(canvas.getByRole('button', { name: 'New thread' }));
    await expect(args.onNewThread).toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Automations' }));
    await expect(args.onControlSelect).toHaveBeenCalledWith('automations');

    await userEvent.click(canvas.getByRole('button', { name: 'Show 12 more' }));
    await expect(args.onShowMore).toHaveBeenCalled();

    const active = canvas.getByRole('button', {
      name: 'Untangle the billing webhooks',
    });
    await expect(active).toHaveAttribute('aria-current', 'true');

    // Rest the pointer off the rows so hover styling stays out of snapshots.
    await userEvent.click(canvas.getByRole('navigation'));
  },
};
