import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
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
    tone: {
      control: 'select',
      options: ['default', 'neutral'],
    },
    fullWidth: { control: 'boolean' },
  },
  args: {
    onValueChange: fn(),
    size: 'default',
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    segments: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
    defaultValue: 'week',
  },
};

export const WithIcons: Story = {
  args: {
    segments: [
      { label: 'Grid', value: 'grid', icon: 'grid_view' },
      { label: 'List', value: 'list', icon: 'view_list' },
      { label: 'Board', value: 'board', icon: 'view_column' },
    ],
    defaultValue: 'grid',
  },
};

export const IconsOnly: Story = {
  args: {
    segments: [
      { label: 'Grid', value: 'grid', icon: 'grid_view' },
      { label: 'List', value: 'list', icon: 'view_list' },
      { label: 'Board', value: 'board', icon: 'view_column' },
    ],
    defaultValue: 'grid',
    showLabels: false,
  },
};

export const Neutral: Story = {
  args: {
    segments: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
    defaultValue: 'week',
    tone: 'neutral',
  },
};

export const TwoOptions: Story = {
  args: {
    segments: [
      { label: 'Light', value: 'light', icon: 'light_mode' },
      { label: 'Dark', value: 'dark', icon: 'dark_mode' },
    ],
    defaultValue: 'dark',
  },
};

export const WithDisabled: Story = {
  args: {
    segments: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true },
    ],
    defaultValue: 'pro',
  },
};

export const FullWidth: Story = {
  args: {
    segments: [
      { label: 'Overview', value: 'overview' },
      { label: 'Analytics', value: 'analytics' },
      { label: 'Reports', value: 'reports' },
    ],
    defaultValue: 'overview',
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

// Compact
export const CompactDefault: Story = {
  args: {
    size: 'compact',
    segments: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
    ],
    defaultValue: 'all',
  },
};

export const CompactWithIcons: Story = {
  args: {
    size: 'compact',
    segments: [
      { label: 'Code', value: 'code', icon: 'code' },
      { label: 'Preview', value: 'preview', icon: 'visibility' },
      { label: 'Split', value: 'split', icon: 'vertical_split' },
    ],
    defaultValue: 'code',
  },
};

export const CompactFullWidth: Story = {
  args: {
    size: 'compact',
    fullWidth: true,
    segments: [
      { label: 'Design', value: 'design' },
      { label: 'Code', value: 'code' },
      { label: 'Docs', value: 'docs' },
    ],
    defaultValue: 'design',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
};

/** Controlled: the parent owns the selection through `value` and `onValueChange`. */
export const Controlled: Story = {
  args: {
    segments: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
  },
  render: function ControlledSegmentedControl(args) {
    const [value, setValue] = useState('month');
    return (
      <SegmentedControl
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
 * Keyboard selection, uncontrolled: `defaultValue` seeds the active segment
 * and its single tab stop, arrows move the selection (and focus) across the
 * enabled segments, skipping a disabled one and wrapping at the ends, and
 * Home and End jump to the first and last enabled segments.
 */
export const KeyboardNavigation: Story = {
  args: {
    'aria-label': 'Range',
    segments: [
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

    // Wraps from the last segment to the first, and back.
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
  },
};
