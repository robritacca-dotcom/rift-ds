import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    dismissible: { control: 'boolean' },
    icon: { control: 'text' },
  },
  args: {
    onDismiss: fn(),
    size: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variants
export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    description: 'This is an informational message with helpful context.',
  },
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    title: 'Success',
    description: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    description: 'This action may have unintended consequences.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Note',
    description: 'This is a general purpose notification.',
  },
};

// With dismiss
export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Dismissible alert',
    description: 'Click the close button to dismiss this alert.',
    dismissible: true,
  },
};

// Title only
export const TitleOnly: Story = {
  args: {
    variant: 'positive',
    title: 'Changes saved',
  },
};

// Description only
export const DescriptionOnly: Story = {
  args: {
    variant: 'warning',
    description: 'Your session will expire in 5 minutes.',
  },
};

// Custom icon
export const CustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'New feature',
    description: 'Dark mode is now available in settings.',
    icon: 'dark_mode',
  },
};

// Compact variants
export const CompactInfo: Story = {
  args: {
    variant: 'info',
    size: 'compact',
    title: 'Information',
    description: 'Compact informational message.',
  },
};

export const CompactPositive: Story = {
  args: {
    variant: 'positive',
    size: 'compact',
    title: 'Saved',
  },
};

export const CompactError: Story = {
  args: {
    variant: 'error',
    size: 'compact',
    title: 'Error',
    description: 'Something went wrong.',
    dismissible: true,
  },
};
