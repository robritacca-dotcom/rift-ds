import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'radio',
      options: ['plain', 'bordered'],
    },
    size: {
      control: 'radio',
      options: ['default', 'compact'],
    },
  },
  args: {
    icon: 'inbox',
    title: 'No messages yet',
    description: 'When someone sends you a message, it will show up here.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    icon: 'folder_open',
    title: 'No projects',
    description: 'Create your first project to start organising work.',
    action: <Button label="New project" variant="primary" iconLeft="add" />,
  },
};

export const WithTwoActions: Story = {
  args: {
    icon: 'group_add',
    title: 'No teammates yet',
    description: 'Invite people to collaborate, or import them from your directory.',
    action: (
      <>
        <Button label="Invite people" variant="primary" />
        <Button label="Import" variant="secondary" />
      </>
    ),
  },
};

export const NoResults: Story = {
  args: {
    icon: 'search_off',
    title: 'No results for “quarterly”',
    description: 'Check the spelling, or try a broader search term.',
    action: <Button label="Clear search" variant="secondary" />,
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    icon: 'table_rows',
    title: 'This table is empty',
    description: 'Rows you add will appear here.',
    action: <Button label="Add row" variant="primary" iconLeft="add" />,
  },
};

export const ErrorRecovery: Story = {
  args: {
    icon: 'cloud_off',
    title: 'Could not load your data',
    description: 'Something went wrong on our end. Try again in a moment.',
    action: <Button label="Retry" variant="primary" iconLeft="refresh" />,
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    variant: 'bordered',
    icon: 'notifications_off',
    title: 'Nothing to catch up on',
    description: 'New notifications will land here.',
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    title: 'Nothing here yet',
    description: 'The icon is optional — text alone works for dense layouts.',
  },
};

export const TitleOnly: Story = {
  args: {
    icon: 'inbox',
    title: 'No messages yet',
    description: undefined,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <EmptyState
        icon="inbox"
        title="Plain, default size"
        description="Sits directly on the page background."
      />
      <EmptyState
        variant="bordered"
        icon="table_rows"
        title="Bordered, default size"
        description="Dashed container for use inside a card or table."
      />
      <EmptyState
        variant="bordered"
        size="compact"
        icon="notifications_off"
        title="Bordered, compact"
        description="For dense panels and sidebars."
      />
    </div>
  ),
};
