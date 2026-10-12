'use client';

import { ThreadTabs } from '../components/ThreadTabs/ThreadTabs';
import { useChatWidget } from './context';

/**
 * The built-in open-sessions strip: a ThreadTabs over the provider's
 * thread lifecycle. Tabs hold thread ids; selecting one moves the rail's
 * selection, the trailing plus is the same New chat as everywhere else, and
 * closing the last tab lands back on the greeting. Renders nothing while no
 * session is open: a bare plus over the greeting would be the header's pen
 * restated.
 */
export interface ChatTabsProps {
  /** Accessible name for the tab strip. */
  ariaLabel?: string;
}

export function ChatTabs({ ariaLabel = 'Open chats' }: ChatTabsProps) {
  const { threads } = useChatWidget();
  if (threads.tabs.length === 0) return null;
  return (
    <ThreadTabs
      tabs={threads.tabs}
      activeId={threads.activeThreadId || undefined}
      onTabSelect={threads.select}
      onTabClose={threads.closeTab}
      onAdd={threads.startNew}
      addLabel={threads.newThreadLabel}
      closeLabel="Close chat"
      ariaLabel={ariaLabel}
    />
  );
}
