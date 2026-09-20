import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppLayout } from './AppLayout';

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
  title: 'Components/AppLayout',
  component: AppLayout,
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
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          This is the AppLayout template with a collapsible sidebar and centred content area.
          Click the collapse button in the sidebar to toggle between expanded and collapsed states.
        </p>
      </div>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    defaultExpanded: false,
    children: (
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-tertiary)', maxWidth: 640 }}>
          Sidebar starts collapsed. Click the sidebar to expand it.
        </p>
      </div>
    ),
  },
};
