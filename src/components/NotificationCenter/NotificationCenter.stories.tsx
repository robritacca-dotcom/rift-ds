import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
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
        value={active}
        onValueChange={setActive}
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

const INBOX = [
  { id: 'payment', icon: 'payments', title: 'Payment received', time: '2m', text: 'Northwind Supply paid invoice 1042.' },
  { id: 'card', icon: 'credit_card_off', title: 'Card frozen', time: '1h', text: 'The card ending in 7781 is frozen until you unfreeze it.' },
  { id: 'statement', icon: 'description', title: 'Statement ready', time: 'Mon', text: 'Your October statement is ready to download.' },
];

function InteractiveInbox() {
  const [unread, setUnread] = useState<string[]>(['payment', 'card']);
  const [tab, setTab] = useState('all');
  const [cleared, setCleared] = useState(false);
  const inbox = cleared ? [] : INBOX;
  const items = tab === 'unread' ? inbox.filter((item) => unread.includes(item.id)) : inbox;
  return (
    <NotificationCenter
      unreadCount={unread.length}
      onMarkAllRead={() => setUnread([])}
      onClearAll={() => {
        setCleared(true);
        setUnread([]);
      }}
      menuItems={[
        { label: 'Notification settings', icon: 'settings', onClick: () => {} },
        { label: 'Open notifications', icon: 'open_in_new', onClick: () => {} },
      ]}
      tabs={[
        { label: 'All', value: 'all' },
        { label: 'Unread', value: 'unread', count: unread.length },
      ]}
      value={tab}
      onValueChange={setTab}
      onSeeAll={() => {}}
      emptyStateLabels={{ title: 'You’re all caught up', description: 'New notifications will show up here.' }}
    >
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          media={item.icon}
          title={item.title}
          time={item.time}
          unread={unread.includes(item.id)}
          onSelect={() => setUnread((ids) => ids.filter((id) => id !== item.id))}
        >
          {item.text}
        </NotificationItem>
      ))}
    </NotificationCenter>
  );
}

/**
 * An inbox whose rows open, on CommandPalette's rhythm: opening a row reads
 * it, so it unbolds and loses its dot but stays in the list; the header's
 * options menu holds Mark all as read, the host's items and Clear all; the
 * Unread tab shows the empty state once nothing is unread, and the inbox
 * once it is cleared; See all sits in the footer.
 */
export const Interactive: Story = {
  render: () => <InteractiveInbox />,
  play: async ({ canvas, canvasElement }) => {
    const rows = () => canvasElement.querySelectorAll('.ds-notification-item').length;
    const unreadRows = () => canvasElement.querySelectorAll('.ds-notification-item--unread').length;
    await expect(rows()).toBe(3);
    await expect(unreadRows()).toBe(2);
    // The whole row is the open control: what sits under its description is the row's button.
    const text = canvasElement.querySelector('.ds-notification-item__text')!;
    const box = text.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    await expect(hit).toHaveClass('ds-notification-item__open');
    // Opening a row reads it and keeps it.
    await userEvent.click(canvas.getByRole('button', { name: 'Payment received' }));
    await waitFor(() => expect(unreadRows()).toBe(1));
    await expect(rows()).toBe(3);
    // Mark all as read lives in the header's options menu.
    await userEvent.click(canvas.getByRole('button', { name: 'Notification options' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: /Mark all as read/ }));
    await waitFor(() => expect(unreadRows()).toBe(0));
    await expect(rows()).toBe(3);
    // The Unread tab is empty now.
    await userEvent.click(canvas.getByRole('tab', { name: /Unread/ }));
    await waitFor(() => expect(canvas.getByText('You’re all caught up')).toBeVisible());
    await userEvent.click(canvas.getByRole('tab', { name: /All/ }));
    // Clear all empties the inbox itself.
    await userEvent.click(canvas.getByRole('button', { name: 'Notification options' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: /Clear all/ }));
    await waitFor(() => expect(rows()).toBe(0));
    await expect(canvas.getByText('You’re all caught up')).toBeVisible();
  },
};
