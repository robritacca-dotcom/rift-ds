'use client';

/**
 * The notifications block's inbox: the page header's actions, the filters
 * and the list share one record of what is read and what is left, so they
 * hold here together. Swap INBOX for your notifications, `read` for your
 * server's read state, and the `onSelect` of each row for where it should
 * take the reader.
 */

import { useState } from 'react';
import { Button } from 'rift-ds/components/Button/Button';
import { Dropdown } from 'rift-ds/components/Dropdown/Dropdown';
import { EmptyState } from 'rift-ds/components/EmptyState/EmptyState';
import { NotificationItem } from 'rift-ds/components/NotificationCenter/NotificationCenter';
import { Tabs } from 'rift-ds/components/Tabs/Tabs';
import { AppShell } from '../../components/blocks/AppShell';
import styles from './page.module.css';

type Category = 'payments' | 'cards' | 'team' | 'approvals';

interface Notification {
  id: string;
  /** Which day group the row sits under. */
  group: 'Today' | 'This week' | 'Earlier';
  category: Category;
  icon: string;
  title: string;
  text: string;
  /** When it happened, already written for the reader. */
  time: string;
}

const INBOX: Notification[] = [
  { id: 'n1', group: 'Today', category: 'payments', icon: 'payments', title: 'Payment received', text: 'Northwind Supply paid invoice 1042 for $4,180.00.', time: '2m' },
  { id: 'n2', group: 'Today', category: 'approvals', icon: 'approval', title: 'Approval needed', text: 'Jordan Reyes asked to spend $1,632.42 from the Software budget.', time: '1h' },
  { id: 'n3', group: 'Today', category: 'cards', icon: 'credit_card_off', title: 'Card frozen', text: 'The card ending in 7781 is frozen until you unfreeze it.', time: '3h' },
  { id: 'n4', group: 'This week', category: 'team', icon: 'person_add', title: 'Invite accepted', text: 'Sam Patel joined Acme as an admin.', time: 'Tue' },
  { id: 'n5', group: 'This week', category: 'payments', icon: 'schedule', title: 'Payment scheduled', text: '$5,000.00 to Bright Studio goes out on Friday.', time: 'Mon' },
  { id: 'n6', group: 'This week', category: 'approvals', icon: 'receipt_long', title: 'Receipt missing', text: 'Add a receipt for $375.87 at Harbor Bistro.', time: 'Mon' },
  { id: 'n7', group: 'Earlier', category: 'cards', icon: 'credit_card', title: 'New card requested', text: 'Lee Chen asked for a card with a $5,000 limit.', time: 'Nov 18' },
  { id: 'n8', group: 'Earlier', category: 'team', icon: 'shield_person', title: 'Two admins required', text: 'Sensitive changes now need a second admin to approve.', time: 'Nov 14' },
  { id: 'n9', group: 'Earlier', category: 'payments', icon: 'description', title: 'Statement ready', text: 'Your October statement is ready to download.', time: 'Nov 1' },
];

const GROUPS = ['Today', 'This week', 'Earlier'] as const;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'payments', label: 'Payments' },
  { value: 'cards', label: 'Cards' },
  { value: 'team', label: 'Team' },
  { value: 'approvals', label: 'Approvals' },
];

export function Inbox() {
  const [items, setItems] = useState(INBOX);
  const [unread, setUnread] = useState<string[]>(['n1', 'n2', 'n3', 'n4']);
  const [show, setShow] = useState('all');
  const [category, setCategory] = useState('all');

  const read = (id: string) => setUnread((ids) => ids.filter((other) => other !== id));
  const dismiss = (id: string) => {
    setItems((list) => list.filter((item) => item.id !== id));
    read(id);
  };

  const shown = items.filter(
    (item) =>
      (show === 'all' || unread.includes(item.id)) && (category === 'all' || item.category === category),
  );

  return (
    <AppShell
      activeKey="inbox"
      breadcrumb={[{ label: 'Acme', href: '#' }, { label: 'Notifications' }]}
      title="Notifications"
      actions={
        <>
          <Button
            label="Mark all as read"
            variant="secondary"
            iconLeft="done_all"
            disabled={unread.length === 0}
            onClick={() => setUnread([])}
          />
          <Button
            label="Clear all"
            variant="tertiary"
            tone="destructive"
            disabled={items.length === 0}
            onClick={() => {
              setItems([]);
              setUnread([]);
            }}
          />
        </>
      }
    >
      <div className={styles.column}>
        <div className={styles.filters}>
          <Tabs
            aria-label="Show"
            tabs={[
              { value: 'all', label: 'All', panelId: 'notifications-list' },
              { value: 'unread', label: 'Unread', count: unread.length, panelId: 'notifications-list' },
            ]}
            value={show}
            onValueChange={setShow}
          />
          <Dropdown
            className={styles.category}
            aria-label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onValueChange={setCategory}
          />
        </div>

        <div id="notifications-list" role="tabpanel" aria-label={show === 'all' ? 'All' : 'Unread'} className={styles.groups}>
        {shown.length === 0 ? (
          <EmptyState
            icon="notifications"
            title={items.length === 0 ? 'No notifications' : 'You’re all caught up'}
            description={
              items.length === 0
                ? 'New notifications will collect here as they arrive.'
                : 'Nothing here matches these filters.'
            }
          />
        ) : (
          GROUPS.map((group) => {
            const rows = shown.filter((item) => item.group === group);
            if (rows.length === 0) return null;
            return (
              <section key={group} className={styles.group} aria-labelledby={`group-${group}`}>
                <h2 id={`group-${group}`} className={styles.groupLabel}>
                  {group}
                </h2>
                <div className={styles.list}>
                  {rows.map((item) => (
                    <NotificationItem
                      key={item.id}
                      media={item.icon}
                      title={item.title}
                      time={item.time}
                      unread={unread.includes(item.id)}
                      onSelect={() => read(item.id)}
                      onDismiss={() => dismiss(item.id)}
                    >
                      {item.text}
                    </NotificationItem>
                  ))}
                </div>
              </section>
            );
          })
        )}
        </div>
      </div>
    </AppShell>
  );
}
