import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatMessage } from './ChatMessage';
import { Avatar } from '../Avatar/Avatar';

const meta = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['user', 'assistant'],
    },
    author: { control: 'text' },
    timestamp: { control: 'text' },
    showAvatar: { control: 'boolean' },
    grouped: { control: 'boolean' },
    bubble: { control: 'boolean' },
    tail: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    pending: { control: 'boolean' },
    pendingLabel: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    children: 'Can you pull the spacing scale into a table?',
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    children: 'Can you pull the spacing scale into a table?',
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    children:
      'Here is the spacing scale as a table. Each step doubles roughly every two sizes, so the gaps stay proportional as layouts grow.',
  },
};

/** A stacked exchange: a question, an answer, and a grouped follow-up run. */
export const Conversation: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
        maxWidth: '560px',
      }}
    >
      <ChatMessage
        role="user"
        author="Mara Voss"
        timestamp="2:41 PM"
        avatar={<Avatar name="Mara Voss" size="sm" />}
      >
        What does the review queue look like this week?
      </ChatMessage>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="2:41 PM"
        avatar={<Avatar name="A I" size="sm" />}
      >
        Four items are waiting: two copy reviews, one token rename, and the
        navigation audit. The audit is the oldest, opened nine days ago.
      </ChatMessage>
      <ChatMessage
        role="user"
        author="Mara Voss"
        timestamp="2:43 PM"
        avatar={<Avatar name="Mara Voss" size="sm" />}
      >
        Start with the audit then.
      </ChatMessage>
      <ChatMessage role="user" grouped avatar={<Avatar name="Mara Voss" size="sm" />}>
        And flag anything blocked on me.
      </ChatMessage>
    </div>
  ),
};

export const WithTail: Story = {
  args: {
    role: 'user',
    tail: true,
    children: 'The squared corner points at the speaker.',
  },
};

/** A three-message run: the gutter keeps every row aligned while only the first shows its avatar. */
export const Grouped: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
        maxWidth: '560px',
      }}
    >
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="9:02 AM"
        avatar={<Avatar name="A I" size="sm" />}
      >
        The export finished overnight.
      </ChatMessage>
      <ChatMessage role="assistant" grouped avatar={<Avatar name="A I" size="sm" />}>
        All 214 records validated cleanly.
      </ChatMessage>
      <ChatMessage role="assistant" grouped avatar={<Avatar name="A I" size="sm" />}>
        The summary file is in the shared folder.
      </ChatMessage>
    </div>
  ),
};

export const Compact: Story = {
  args: {
    role: 'user',
    size: 'compact',
    children: 'Compact drops a size step for dense transcripts.',
  },
};

export const Pending: Story = {
  args: {
    role: 'assistant',
    pending: true,
    author: 'Assistant',
    children: undefined,
  },
};

/**
 * Actions reveal on hover or keyboard focus; the footer is always present.
 * The buttons stay in the tab order while hidden, so Tab reaches them
 * directly and the first focus reveals the row.
 */
export const WithActionsAndFooter: Story = {
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="4:18 PM"
        actions={
          <>
            <button type="button">Copy</button>
            <button type="button">Retry</button>
          </>
        }
        footer={<span>Edited 4:20 PM</span>}
      >
        The three sources agree on the launch window: the second week of the
        quarter, pending the accessibility pass.
      </ChatMessage>
    </div>
  ),
};

/** `showActions` pins the row on for surfaces where the actions are part of the response, not an affordance to discover. */
export const AlwaysVisibleActions: Story = {
  render: () => (
    <div style={{ maxWidth: '560px' }}>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="4:18 PM"
        showActions
        actions={
          <>
            <button type="button">Copy</button>
            <button type="button">Retry</button>
          </>
        }
      >
        With showActions the row needs no hover to find: it is on screen the
        moment the response commits.
      </ChatMessage>
    </div>
  ),
};

/** The surface is a default, not a rule: an assistant turn can take a bubble and a user turn can go plain. */
export const BubbleOverride: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
        maxWidth: '560px',
      }}
    >
      <ChatMessage role="assistant" bubble>
        An assistant turn in a received bubble, for classic messenger layouts.
      </ChatMessage>
      <ChatMessage role="user" bubble={false}>
        A user turn as plain right-aligned text, no surface at all.
      </ChatMessage>
    </div>
  ),
};
