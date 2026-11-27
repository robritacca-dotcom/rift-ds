"use client";

import React, { useState } from "react";
import { NotificationCenter, NotificationItem } from "rift-ds/components/NotificationCenter/NotificationCenter";

/**
 * The notifications behind the AppToolbar demos on the app toolbar and app
 * layout pages: a small inbox whose rows open and become read (they stay
 * in the list, unbolded), All and Unread tabs, Mark all read, the empty
 * state once Unread has nothing in it, a See all footer, and the count the
 * bell's badge shows. Demo state
 * only; it lasts the visit.
 */
const INBOX = [
  { id: "payment", icon: "payments", title: "Payment received", time: "2m", text: "Northwind Supply paid invoice 1042." },
  { id: "card", icon: "credit_card_off", title: "Card frozen", time: "1h", text: "The card ending in 7781 is frozen until you unfreeze it." },
  { id: "statement", icon: "description", title: "Statement ready", time: "Mon", text: "Your October statement is ready to download." },
];

export function useDemoNotifications({ seeAllHref }: { seeAllHref?: string } = {}) {
  const [unread, setUnread] = useState<string[]>(["payment", "card"]);
  const [tab, setTab] = useState("all");
  const [cleared, setCleared] = useState(false);
  const inbox = cleared ? [] : INBOX;
  const items = tab === "unread" ? inbox.filter((item) => unread.includes(item.id)) : inbox;
  const panel = (
    <NotificationCenter
      unreadCount={unread.length}
      onMarkAllRead={() => setUnread([])}
      onClearAll={() => {
        setCleared(true);
        setUnread([]);
      }}
      menuItems={[
        { label: "Notification settings", icon: "settings", onClick: () => {} },
        { label: "Open notifications", icon: "open_in_new", onClick: () => {} },
      ]}
      tabs={[
        { label: "All", value: "all" },
        { label: "Unread", value: "unread", count: unread.length },
      ]}
      value={tab}
      onValueChange={setTab}
      onSeeAll={seeAllHref ? undefined : () => {}}
      seeAllHref={seeAllHref}
      emptyStateLabels={{ title: "You’re all caught up", description: "New notifications will show up here." }}
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
  return {
    action: {
      id: "notifications",
      icon: "notifications",
      label: "Notifications",
      badge: unread.length > 0 ? unread.length : undefined,
      panel,
    },
  };
}
