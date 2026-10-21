import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    fullWidth: { control: 'boolean' },
  },
  args: {
    onValueChange: fn(),
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
    defaultValue: 'overview',
  },
};

export const WithIcons: Story = {
  args: {
    tabs: [
      { label: 'Design', value: 'design', icon: 'palette' },
      { label: 'Code', value: 'code', icon: 'code' },
      { label: 'Accessibility', value: 'a11y', icon: 'accessibility' },
    ],
    defaultValue: 'design',
  },
};

/** `icon` also takes a custom element — any icon set works when the SVG draws with `currentColor`. */
export const WithCustomIconNodes: Story = {
  args: {
    tabs: [
      {
        label: 'Design',
        value: 'design',
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          </svg>
        ),
      },
      {
        label: 'Code',
        value: 'code',
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        ),
      },
    ],
    defaultValue: 'design',
  },
};

export const Compact: Story = {
  args: {
    tabs: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
    ],
    defaultValue: 'all',
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
    defaultValue: 'details',
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
    defaultValue: 'published',
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
    defaultValue: 'button',
  },
};

export const IconsOnly: Story = {
  args: {
    tabs: [
      { label: 'Grid', value: 'grid', icon: 'grid_view' },
      { label: 'List', value: 'list', icon: 'view_list' },
      { label: 'Board', value: 'board', icon: 'view_kanban' },
    ],
    defaultValue: 'grid',
    'aria-label': 'View mode',
  },
};

/** Controlled: the parent owns the selection through `value` and `onValueChange`. */
export const Controlled: Story = {
  args: {
    tabs: [
      { label: 'Overview', value: 'overview' },
      { label: 'Tokens', value: 'tokens' },
      { label: 'Usage', value: 'usage' },
    ],
  },
  render: function ControlledTabs(args) {
    const [value, setValue] = useState('tokens');
    return (
      <Tabs
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange?.(next);
        }}
      />
    );
  },
};

/**
 * Keyboard selection, uncontrolled: `defaultValue` seeds the selected tab
 * and its single tab stop, arrows move the selection (and focus) across the
 * enabled tabs, skipping a disabled one and wrapping at the ends, and
 * Home and End jump to the first and last enabled tabs.
 */
export const KeyboardNavigation: Story = {
  args: {
    'aria-label': 'Range',
    tabs: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month', disabled: true },
      { label: 'Year', value: 'year' },
    ],
    defaultValue: 'week',
  },
  play: async ({ canvas, userEvent, args }) => {
    const tab = (name: string) => canvas.getByRole('tab', { name });
    await expect(canvas.getByRole('tablist', { name: 'Range' })).toBeInTheDocument();
    await expect(tab('Week')).toHaveAttribute('aria-selected', 'true');
    await expect(tab('Week')).toHaveAttribute('tabindex', '0');
    await expect(tab('Day')).toHaveAttribute('tabindex', '-1');

    await userEvent.tab();
    await expect(tab('Week')).toHaveFocus();

    // Month is disabled, so ArrowRight goes straight to Year.
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Year')).toHaveAttribute('aria-selected', 'true');
    await expect(tab('Year')).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('year');
    await expect(tab('Week')).toHaveAttribute('aria-selected', 'false');

    // Wraps from the last tab to the first, and back.
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Day')).toHaveFocus();
    await expect(tab('Day')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tab('Year')).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(tab('Day')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(tab('Year')).toHaveAttribute('aria-selected', 'true');
    await expect(tab('Year')).toHaveFocus();

    await expect(args.onValueChange).not.toHaveBeenCalledWith('month');
    await expect(tab('Month')).toHaveAttribute('aria-selected', 'false');

    // A disabled tab stays focusable for discovery (aria-disabled) but a
    // click never selects it.
    await expect(tab('Month')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(tab('Month'));
    await expect(tab('Month')).toHaveAttribute('aria-selected', 'false');
    await expect(tab('Year')).toHaveAttribute('aria-selected', 'true');
  },
};
