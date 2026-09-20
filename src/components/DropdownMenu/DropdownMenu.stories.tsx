import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu, type DropdownMenuEntry } from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    align: { control: 'radio', options: ['start', 'end'] },
    size: { control: 'radio', options: ['default', 'compact'] },
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

/* ============================================
   TRIGGER BUTTON (reused across stories)
   ============================================ */

const TriggerButton = ({ label = 'Open menu' }: { label?: string }) => (
  <button
    style={{
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid var(--color-bg-container-border)',
      background: 'var(--color-bg-page-primary)',
      color: 'var(--color-text-primary)',
      cursor: 'pointer',
      fontFamily: 'var(--font-paragraph-family)',
      fontSize: 'var(--font-paragraph-size)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }}
  >
    {label}
    <span
      className="material-symbols-rounded"
      style={{ fontSize: '20px' }}
    >
      expand_more
    </span>
  </button>
);

/* ============================================
   DEFAULT
   ============================================ */

const defaultItems: DropdownMenuEntry[] = [
  { label: 'New file', icon: 'note_add', onClick: () => console.log('New file') },
  { label: 'Open', icon: 'folder_open', onClick: () => console.log('Open') },
  { label: 'Save', icon: 'save', onClick: () => console.log('Save') },
  { type: 'separator' },
  { label: 'Delete', icon: 'delete', destructive: true, onClick: () => console.log('Delete') },
];

export const Default: Story = {
  args: {
    trigger: <TriggerButton />,
    items: defaultItems,
  },
};

/* ============================================
   WITH GROUPS
   ============================================ */

const groupedItems: DropdownMenuEntry[] = [
  {
    type: 'group',
    label: 'My Account',
    items: [
      { label: 'Profile', icon: 'person', shortcut: '⇧ ⌘ P', onClick: () => {} },
      { label: 'Billing', icon: 'credit_card', shortcut: '⌘ B', onClick: () => {} },
      { label: 'Settings', icon: 'settings', shortcut: '⌘ S', onClick: () => {} },
    ],
  },
  { type: 'separator' },
  {
    type: 'group',
    label: 'Team',
    items: [
      { label: 'Invite users', icon: 'person_add', onClick: () => {} },
      { label: 'New Team', icon: 'group_add', shortcut: '⌘ T', onClick: () => {} },
    ],
  },
  { type: 'separator' },
  { label: 'GitHub', icon: 'code', onClick: () => {} },
  { label: 'Support', icon: 'help', onClick: () => {} },
  { label: 'API', icon: 'terminal', disabled: true },
  { type: 'separator' },
  { label: 'Log out', icon: 'logout', shortcut: '⇧ ⌘ Q', destructive: true, onClick: () => {} },
];

export const WithGroups: Story = {
  args: {
    trigger: <TriggerButton label="My account" />,
    items: groupedItems,
  },
};

/* ============================================
   WITH SUB-MENU
   ============================================ */

const subMenuItems: DropdownMenuEntry[] = [
  { label: 'Back', icon: 'arrow_back', shortcut: '⌘ [', onClick: () => {} },
  { label: 'Forward', icon: 'arrow_forward', shortcut: '⌘ ]', disabled: true },
  { type: 'separator' },
  {
    label: 'Invite users',
    icon: 'person_add',
    children: [
      { label: 'Email', icon: 'mail', onClick: () => {} },
      { label: 'Message', icon: 'chat', onClick: () => {} },
      { type: 'separator' },
      {
        label: 'More…',
        icon: 'more_horiz',
        children: [
          { label: 'Slack', onClick: () => {} },
          { label: 'Discord', onClick: () => {} },
          { label: 'Teams', onClick: () => {} },
        ],
      },
    ],
  },
  { type: 'separator' },
  { label: 'New team', icon: 'group_add', onClick: () => {} },
];

export const WithSubMenu: Story = {
  args: {
    trigger: <TriggerButton label="Actions" />,
    items: subMenuItems,
  },
};

/* ============================================
   WITH SHORTCUTS
   ============================================ */

const shortcutItems: DropdownMenuEntry[] = [
  { label: 'Undo', shortcut: '⌘ Z', onClick: () => {} },
  { label: 'Redo', shortcut: '⇧ ⌘ Z', onClick: () => {} },
  { type: 'separator' },
  { label: 'Cut', shortcut: '⌘ X', onClick: () => {} },
  { label: 'Copy', shortcut: '⌘ C', onClick: () => {} },
  { label: 'Paste', shortcut: '⌘ V', onClick: () => {} },
  { type: 'separator' },
  { label: 'Select all', shortcut: '⌘ A', onClick: () => {} },
];

export const WithShortcuts: Story = {
  args: {
    trigger: <TriggerButton label="Edit" />,
    items: shortcutItems,
  },
};

/* ============================================
   COMPACT
   ============================================ */

export const Compact: Story = {
  args: {
    trigger: <TriggerButton label="Compact" />,
    items: defaultItems,
    size: 'compact',
  },
};

/* ============================================
   ALIGN END
   ============================================ */

export const AlignEnd: Story = {
  args: {
    trigger: <TriggerButton label="End-aligned" />,
    items: defaultItems,
    align: 'end',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

/* ============================================
   ALL FEATURES
   ============================================ */

const allFeaturesItems: DropdownMenuEntry[] = [
  {
    type: 'group',
    label: 'My Account',
    items: [
      { label: 'Profile', icon: 'person', shortcut: '⇧ ⌘ P', onClick: () => {} },
      { label: 'Billing', icon: 'credit_card', shortcut: '⌘ B', onClick: () => {} },
      { label: 'Settings', icon: 'settings', shortcut: '⌘ S', onClick: () => {} },
    ],
  },
  { type: 'separator' },
  {
    type: 'group',
    label: 'Team',
    items: [
      {
        label: 'Invite users',
        icon: 'person_add',
        children: [
          { label: 'Email', icon: 'mail', onClick: () => {} },
          { label: 'Message', icon: 'chat', onClick: () => {} },
          { type: 'separator' },
          {
            label: 'More…',
            icon: 'more_horiz',
            children: [
              { label: 'Slack', onClick: () => {} },
              { label: 'Discord', onClick: () => {} },
              { label: 'Teams', onClick: () => {} },
            ],
          },
        ],
      },
      { label: 'New Team', icon: 'group_add', shortcut: '⌘ T', onClick: () => {} },
    ],
  },
  { type: 'separator' },
  { label: 'GitHub', icon: 'code', onClick: () => {} },
  { label: 'Support', icon: 'help', onClick: () => {} },
  { label: 'API', icon: 'terminal', disabled: true },
  { type: 'separator' },
  { label: 'Log out', icon: 'logout', shortcut: '⇧ ⌘ Q', destructive: true, onClick: () => {} },
];

export const AllFeatures: Story = {
  args: {
    trigger: <TriggerButton label="My account" />,
    items: allFeaturesItems,
  },
};
