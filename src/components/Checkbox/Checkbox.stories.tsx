import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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
    onCheckedChange: fn(),
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

/** No `checked`: the checkbox keeps its own state, starting from `defaultChecked`. */
export const Uncontrolled: Story = {
  args: {
    label: 'Remember me',
    defaultChecked: false,
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Remember me' });
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  },
};

export const NoLabel: Story = {
  args: {
    checked: true,
    'aria-label': 'Standalone checkbox',
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

/** No `values`: the group keeps its own selection, starting from `defaultValues`. */
export const GroupUncontrolled: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Toppings',
    items: [
      { label: 'Cheese', value: 'cheese' },
      { label: 'Olives', value: 'olives' },
      { label: 'Basil', value: 'basil' },
    ],
    defaultValues: ['cheese'],
    direction: 'vertical',
  },
  play: async ({ canvas, userEvent }) => {
    const olives = canvas.getByRole('checkbox', { name: 'Olives' });
    await userEvent.click(olives);
    await expect(olives).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('checkbox', { name: 'Cheese' })).toHaveAttribute('aria-checked', 'true');
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

export const WithHelperText: Story = {
  args: {
    label: 'Email me product updates',
    helperText: 'At most one message a month.',
    checked: true,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Accept the terms',
    helperText: 'You must accept the terms to continue.',
    error: true,
    checked: false,
  },
};

export const GroupWithHelper: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Notification channels',
    helperText: 'Pick at least one channel.',
    required: true,
    items: [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
      { label: 'Push', value: 'push' },
    ],
    values: ['email'],
    direction: 'vertical',
  },
};

export const GroupError: GroupStory = {
  render: (args) => <CheckboxGroup {...args} />,
  args: {
    label: 'Notification channels',
    helperText: 'Pick at least one channel.',
    required: true,
    error: true,
    items: [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
      { label: 'Push', value: 'push' },
    ],
    values: [],
    direction: 'vertical',
  },
};
