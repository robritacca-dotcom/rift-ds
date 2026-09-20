import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppSidebar } from './AppSidebar';

const sampleSections = [
  {
    category: 'Main',
    items: [
      { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
      { key: 'analytics', icon: 'analytics', label: 'Analytics' },
      { key: 'projects', icon: 'folder', label: 'Projects' },
      { key: 'tasks', icon: 'task_alt', label: 'Tasks' },
      { key: 'calendar', icon: 'calendar_today', label: 'Calendar' },
    ],
  },
  {
    category: 'Design',
    items: [
      {
        key: 'components',
        icon: 'widgets',
        label: 'Components',
        children: [
          { key: 'buttons', label: 'Buttons' },
          { key: 'inputs', label: 'Inputs' },
          { key: 'cards', label: 'Cards' },
        ],
      },
      {
        key: 'foundations',
        icon: 'palette',
        label: 'Foundations',
        children: [
          { key: 'colours', label: 'Colours' },
          { key: 'typography', label: 'Typography' },
          { key: 'spacing', label: 'Spacing' },
        ],
      },
      { key: 'icons', icon: 'emoji_symbols', label: 'Icons' },
    ],
  },
  {
    items: [
      { key: 'settings', icon: 'settings', label: 'Settings' },
      { key: 'help', icon: 'help', label: 'Help & Support' },
    ],
  },
];

const sampleProfile = {
  name: 'Jordan Reyes',
  email: 'jordan@example.com',
};

const meta = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultExpanded: { control: 'boolean' },
    activeKey: { control: 'text' },
    activeSubKey: { control: 'text' },
    logoText: { control: 'text' },
  },
  args: {
    sections: sampleSections,
    profile: sampleProfile,
    activeKey: 'dashboard',
    logoText: 'Northlight',
    defaultExpanded: true,
  },
  decorators: [
    (Story, ctx) => {
      const expanded = (ctx.args as { defaultExpanded?: boolean }).defaultExpanded ?? false;
      return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0E0E0E' }}>
          <Story />
          <div style={{
            marginLeft: expanded ? 280 : 64,
            padding: 40,
            flex: 1,
            transition: 'margin-left 0.25s ease',
            color: '#F1F1F1',
          }}>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Page Content</h1>
            <p style={{ color: '#6D6D6D' }}>
              {expanded
                ? 'Content area beside the sidebar.'
                : 'Collapsed sidebar — hover over icons to see tooltips.'}
            </p>
          </div>
        </div>
      );
    },
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    defaultExpanded: false,
  },
};

/** The glass-card treatment: inset from the viewport edges with rounded
    corners, the translucent glass fill over a backdrop blur, and the
    floating shadow. */
export const Floating: Story = {
  args: {
    defaultExpanded: true,
    floating: true,
  },
};

/** Count pills on nav rows, hidden while the rail is collapsed. */
export const WithBadges: Story = {
  args: {
    defaultExpanded: true,
    sections: [
      {
        items: [
          { key: 'home', icon: 'home', label: 'Home', badge: 152 },
          { key: 'campaigns', icon: 'campaign', label: 'Campaigns' },
          { key: 'inbox', icon: 'inbox', label: 'Inbox', badge: 91 },
          { key: 'archive', icon: 'archive', label: 'Archive', badge: '9+' },
        ],
      },
    ],
  },
};

/** Consumer slots: a search field under the logo row and custom content
    above the profile block, both fading out while collapsed. */
export const WithSlots: Story = {
  args: {
    defaultExpanded: true,
    topSlot: (
      <input
        type="search"
        placeholder="Quick search"
        aria-label="Quick search"
        style={{ width: '100%' }}
      />
    ),
    footerSlot: <span>Workspace switcher</span>,
  },
};

export const WithActiveAccordion: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'components',
    activeSubKey: 'buttons',
  },
};

/** Items with an `href` render as real links (with `aria-current` on the
    active one), so middle-click and copy-link work; accordion rows stay
    buttons, and their sub-items can be links too. */
export const WithLinks: Story = {
  args: {
    defaultExpanded: true,
    activeKey: 'dashboard',
    sections: [
      {
        category: 'Main',
        items: [
          { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: '#dashboard' },
          { key: 'analytics', icon: 'analytics', label: 'Analytics', href: '#analytics' },
          { key: 'projects', icon: 'folder', label: 'Projects', href: '#projects' },
        ],
      },
      {
        category: 'Design',
        items: [
          {
            key: 'components',
            icon: 'widgets',
            label: 'Components',
            children: [
              { key: 'buttons', label: 'Buttons', href: '#buttons' },
              { key: 'inputs', label: 'Inputs', href: '#inputs' },
            ],
          },
        ],
      },
    ],
  },
};
