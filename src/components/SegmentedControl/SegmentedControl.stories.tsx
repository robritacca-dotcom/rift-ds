import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    activeSegment: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    variant: {
      control: 'select',
      options: ['primary', 'neutral'],
    },
    fullWidth: { control: 'boolean' },
  },
  args: {
    onSegmentChange: fn(),
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
    activeSegment: 'week',
  },
};

export const WithIcons: Story = {
  args: {
    segments: [
      { label: 'Grid', value: 'grid', icon: 'grid_view' },
      { label: 'List', value: 'list', icon: 'view_list' },
      { label: 'Board', value: 'board', icon: 'view_column' },
    ],
    activeSegment: 'grid',
  },
};

export const Neutral: Story = {
  args: {
    segments: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
    ],
    activeSegment: 'week',
    variant: 'neutral',
  },
};

export const TwoOptions: Story = {
  args: {
    segments: [
      { label: 'Light', value: 'light', icon: 'light_mode' },
      { label: 'Dark', value: 'dark', icon: 'dark_mode' },
    ],
    activeSegment: 'dark',
  },
};

export const WithDisabled: Story = {
  args: {
    segments: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true },
    ],
    activeSegment: 'pro',
  },
};

export const FullWidth: Story = {
  args: {
    segments: [
      { label: 'Overview', value: 'overview' },
      { label: 'Analytics', value: 'analytics' },
      { label: 'Reports', value: 'reports' },
    ],
    activeSegment: 'overview',
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
    activeSegment: 'all',
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
    activeSegment: 'code',
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
    activeSegment: 'design',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
};
