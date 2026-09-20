import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    activeTab: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    fullWidth: { control: 'boolean' },
  },
  args: {
    onTabChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { label: 'Overview', value: 'overview' },
      { label: 'Tokens', value: 'tokens' },
      { label: 'Usage', value: 'usage' },
    ],
    activeTab: 'overview',
  },
};

export const WithIcons: Story = {
  args: {
    tabs: [
      { label: 'Design', value: 'design', icon: 'palette' },
      { label: 'Code', value: 'code', icon: 'code' },
      { label: 'Accessibility', value: 'a11y', icon: 'accessibility' },
    ],
    activeTab: 'design',
  },
};

export const Compact: Story = {
  args: {
    tabs: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
    ],
    activeTab: 'all',
    size: 'compact',
  },
};

export const FullWidth: Story = {
  args: {
    tabs: [
      { label: 'Details', value: 'details' },
      { label: 'Reviews', value: 'reviews' },
      { label: 'Related', value: 'related' },
    ],
    activeTab: 'details',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { label: 'Published', value: 'published' },
      { label: 'Drafts', value: 'drafts' },
      { label: 'Scheduled', value: 'scheduled', disabled: true },
    ],
    activeTab: 'published',
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { label: 'Button', value: 'button' },
      { label: 'Input', value: 'input' },
      { label: 'Dropdown', value: 'dropdown' },
      { label: 'Checkbox', value: 'checkbox' },
      { label: 'Radio', value: 'radio' },
      { label: 'Tabs', value: 'tabs' },
    ],
    activeTab: 'button',
  },
};

export const IconsOnly: Story = {
  args: {
    tabs: [
      { label: 'Grid', value: 'grid', icon: 'grid_view' },
      { label: 'List', value: 'list', icon: 'view_list' },
      { label: 'Board', value: 'board', icon: 'view_kanban' },
    ],
    activeTab: 'grid',
    ariaLabel: 'View mode',
  },
};
