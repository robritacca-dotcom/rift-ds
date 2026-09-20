import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox, CheckboxGroup } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    label: 'Accept terms',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Accept terms',
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all',
    indeterminate: true,
    checked: false,
  },
};

export const DisabledUnchecked: Story = {
  args: {
    label: 'Disabled option',
    checked: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    checked: true,
    disabled: true,
  },
};

export const NoLabel: Story = {
  args: {
    checked: true,
    ariaLabel: 'Standalone checkbox',
  },
};

// ============================================
// Checkbox Group Stories
// ============================================

type GroupStory = StoryObj<typeof CheckboxGroup>;

export const GroupVertical: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Notifications',
    items: [
      { label: 'Email', value: 'email' },
      { label: 'Push notifications', value: 'push' },
      { label: 'SMS', value: 'sms' },
      { label: 'In-app', value: 'in-app' },
    ],
    values: ['email', 'push'],
    direction: 'vertical',
  },
};

export const GroupHorizontal: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Categories',
    items: [
      { label: 'Design', value: 'design' },
      { label: 'Development', value: 'dev' },
      { label: 'Marketing', value: 'marketing' },
    ],
    values: ['design'],
    direction: 'horizontal',
  },
};

export const GroupWithDisabled: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Features',
    items: [
      { label: 'Dark mode', value: 'dark' },
      { label: 'Notifications', value: 'notif', disabled: true },
      { label: 'Analytics', value: 'analytics' },
      { label: 'Beta features', value: 'beta', disabled: true },
    ],
    values: ['dark', 'analytics'],
    direction: 'vertical',
  },
};

export const GroupCompact: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Filters',
    items: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Archived', value: 'archived' },
    ],
    values: ['active'],
    size: 'compact',
    direction: 'horizontal',
  },
};
