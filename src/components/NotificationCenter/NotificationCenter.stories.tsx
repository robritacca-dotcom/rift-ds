import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationCenter, NotificationItem } from './NotificationCenter';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    unreadCount: { control: 'number' },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = (
  <>
    <NotificationItem
      title="Livia mentioned you"
      time="2m"
      unread
      media={<Avatar name="Livia Saris" size="sm" />}
      actions={
        <>
          <Button variant="secondary" size="compact" label="Reply" />
          <Button variant="tertiary" size="compact" label="View thread" />
        </>
      }
    >
      Can you review the new empty state before we ship the dashboard?
    </NotificationItem>
    <NotificationItem
      title="Workspace backup is ready"
      time="18m"
      unread
      media="cloud_done"
      actions={<Button variant="secondary" size="compact" label="Download" />}
    >
      The nightly backup finished and is ready to download.
    </NotificationItem>
    <NotificationItem
      title="You joined the design project"
      time="1h"
      media={<Avatar name="Maria Lubin" size="sm" />}
    >
      Maria added you as an editor, so every file is now open to you.
    </NotificationItem>
    <NotificationItem
      title="Preview deployment failed"
      time="Sat"
      media="error"
      actions={
        <>
          <Button variant="secondary" size="compact" label="Retry" />
          <Button variant="tertiary" size="compact" label="View logs" />
        </>
      }
    >
      The build stopped while validating the application routes.
    </NotificationItem>
  </>
);

export const Default: Story = {
  args: {
    unreadCount: 2,
    children: sampleItems,
  },
  render: (args) => (
    <div style={{ maxWidth: '420px' }}>
      <NotificationCenter {...args} onMarkAllRead={() => {}} />
    </div>
  ),
};

/* The tabs filter for real: the spec makes filtering the consumer's job
   ("swap the children when the tab changes"), so the story is that
   consumer — dead tabs in the showcase would demonstrate a non-behaviour.
   Counts derive from the data so they can never lie about the list. */
const filterableNotifications = [
  {
    kind: 'mentions',
    title: 'Livia mentioned you',
    time: '2m',
    unread: true,
    media: <Avatar name="Livia Saris" size="sm" />,
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Reply" />
        <Button variant="tertiary" size="compact" label="View thread" />
      </>
    ),
    body: 'Can you review the new empty state before we ship the dashboard?',
  },
  {
    kind: 'system',
    title: 'Workspace backup is ready',
    time: '18m',
    unread: true,
    media: 'cloud_done',
    actions: <Button variant="secondary" size="compact" label="Download" />,
    body: 'The nightly backup finished and is ready to download.',
  },
  {
    kind: 'mentions',
    title: 'You joined the design project',
    time: '1h',
    unread: false,
    media: <Avatar name="Maria Lubin" size="sm" />,
    actions: null,
    body: 'Maria added you as an editor, so every file is now open to you.',
  },
  {
    kind: 'system',
    title: 'Preview deployment failed',
    time: 'Sat',
    unread: false,
    media: 'error',
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Retry" />
        <Button variant="tertiary" size="compact" label="View logs" />
      </>
    ),
    body: 'The build stopped while validating the application routes.',
  },
];

const WithTabsDemo = () => {
  const [active, setActive] = useState('all');
  const visible = filterableNotifications.filter(
    (n) => active === 'all' || n.kind === active,
  );
  const countOf = (kind: string) =>
    filterableNotifications.filter((n) => n.kind === kind).length;
  return (
    <div style={{ maxWidth: '420px' }}>
      <NotificationCenter
        unreadCount={filterableNotifications.filter((n) => n.unread).length}
        tabs={[
          { label: 'All', value: 'all', count: filterableNotifications.length },
          { label: 'Mentions', value: 'mentions', count: countOf('mentions') },
          { label: 'System', value: 'system', count: countOf('system') },
        ]}
        activeTab={active}
        onTabChange={setActive}
        onMarkAllRead={() => {}}
      >
        {visible.map((n) => (
          <NotificationItem
            key={n.title}
            title={n.title}
            time={n.time}
            unread={n.unread}
            media={n.media}
            actions={n.actions}
          >
            {n.body}
          </NotificationItem>
        ))}
      </NotificationCenter>
    </div>
  );
};

export const WithTabs: Story = {
  args: {},
  render: () => <WithTabsDemo />,
};

export const Empty: Story = {
  args: {},
  render: (args) => (
    <div style={{ maxWidth: '420px' }}>
      <NotificationCenter {...args} />
    </div>
  ),
};

export const SingleItem: Story = {
  args: {
    children: (
      <NotificationItem title="Deployment finished" time="2m" unread media="rocket_launch">
        The site is live on production.
      </NotificationItem>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: '420px' }}>
      <NotificationCenter {...args} />
    </div>
  ),
};
