'use client';

/**
 * The chat, mounted once, with the propose-and-confirm flow wired in.
 * Render <ChatMount /> at the end of your root layout's body, after the page
 * content, so the panel sits last in the tab order and survives client-side
 * navigation. It posts to /api/chat: set ANTHROPIC_API_KEY and
 * CHAT_ENABLED=true in .env.local.
 *
 * Each request carries the page's path and, once, the confirmation a card's
 * Confirm marked (confirmation.ts), which the route rebuilds as untrusted
 * input. The cards are drawn by ACTION_RENDERERS.
 */
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ChatLauncher, ChatProvider } from 'rift-ds/chat';
import 'rift-ds/chat/chat.css';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from './models';
import { confirmation } from './confirmation';
import { ACTION_RENDERERS } from './renderers';

/** What the widget says about itself. Edit freely. */
const WIDGET = {
  title: 'Assistant',
  tagline: 'What should change?',
  /* Each starter is one chip, and a chip never wraps: a label longer than 30
     characters (SUGGESTION_MAX_CHARS) is dropped, with a warning in
     development. Write a month or weekday short ("Oct", "Mon"). */
  starters: [
    { id: 'open', label: 'What is still open?' },
    { id: 'done', label: 'Mark the open items done' },
    { id: 'tidy', label: 'Archive what is done' },
  ],
  models: CHAT_MODELS,
  defaultModel: DEFAULT_CHAT_MODEL,
  disclaimer: 'Answers may be wrong. Changes wait for your Confirm.',
};

export function ChatMount() {
  const pathname = usePathname();
  /* The note over the composer says what the chat is looking at. */
  const context = { label: pathname === '/' ? 'Home' : pathname };
  /* Read at each send, so the mark is taken by the one request it belongs
     to. A stable function: a new one would make a new transport. */
  const getContext = useCallback(
    () => JSON.stringify({ path: window.location.pathname, confirmation: confirmation.take() }),
    []
  );

  return (
    <ChatProvider getContext={getContext} renderers={ACTION_RENDERERS} followups="/api/chat/followups" feedback="/api/chat/feedback">
      <ChatLauncher label={`Ask ${WIDGET.title}`} widget={{ ...WIDGET, context }} />
    </ChatProvider>
  );
}
