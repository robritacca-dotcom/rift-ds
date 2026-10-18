import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitButton } from './SplitButton';

const saveItems = [
  { label: 'Save as draft', icon: 'draft' },
  { label: 'Save as template', icon: 'dashboard_customize' },
  { type: 'separator' as const },
  { label: 'Discard changes', icon: 'delete', destructive: true },
];

const meta = {
  title: 'Components/SplitButton',
  component: SplitButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    tone: {
      control: 'select',
      options: ['default', 'neutral', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    align: {
      control: 'select',
      options: ['start', 'end'],
    },
  },
  args: {
    label: 'Save',
    items: saveItems,
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Export',
    items: [
      { label: 'Export as CSV', icon: 'csv' },
      { label: 'Export as JSON', icon: 'data_object' },
      { label: 'Export as PDF', icon: 'picture_as_pdf' },
    ],
  },
};

export const Neutral: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    label: 'Duplicate',
    items: [
      { label: 'Duplicate with children', icon: 'account_tree' },
      { label: 'Duplicate as template', icon: 'content_copy' },
    ],
  },
};

export const SecondaryNeutral: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    label: 'Share',
    items: [
      { label: 'Copy link', icon: 'link' },
      { label: 'Share by email', icon: 'mail' },
    ],
  },
};

export const PrimaryDestructive: Story = {
  args: {
    variant: 'primary',
    tone: 'destructive',
    label: 'Delete',
    items: [
      { label: 'Delete and archive', icon: 'archive' },
      { label: 'Delete permanently', icon: 'delete_forever' },
    ],
  },
};

export const Destructive: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    label: 'Delete',
    items: [
      { label: 'Delete and archive', icon: 'archive' },
      { label: 'Delete permanently', icon: 'delete_forever' },
    ],
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
  },
};

export const WithIcon: Story = {
  args: {
    iconLeft: 'save',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
