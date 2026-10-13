'use client';

/**
 * The chat, mounted once. Render <ChatMount /> at the end of your root
 * layout's body, after the page content, so the panel sits last in the tab
 * order and survives client-side navigation.
 *
 * Two modes, switched by NEXT_PUBLIC_CHAT_DEMO in .env.local:
 *   - demo: a scripted conversation plays back in the browser. No model, no
 *     route, no key. Use it to see the widget working and to show it round.
 *   - live: the widget posts to /api/chat, which this scaffold also
 *     wrote. Set ANTHROPIC_API_KEY and CHAT_ENABLED=true there.
 *
 * The demo imports rift-ds/chat/demo, which needs the optional `recharts`
 * peer for its chart cards. Once you are live for good, delete the demo
 * import and the peer with it.
 */
import { ChatLauncher, ChatProvider } from 'rift-ds/chat';
import { DEMO_RENDERERS, DEMO_STARTERS, createDemoTransport } from 'rift-ds/chat/demo';
import 'rift-ds/chat/chat.css';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from './models';

const DEMO = process.env.NEXT_PUBLIC_CHAT_DEMO === 'true';

/** What the widget says about itself. Edit freely. */
const WIDGET = {
  title: 'Assistant',
  tagline: 'How can I help you today?',
  starters: DEMO
    ? DEMO_STARTERS
    : [
        { id: 'start', label: 'How do I get started?' },
        { id: 'pricing', label: 'What do the plans include?' },
        { id: 'help', label: 'Where can I read more?' },
      ],
  models: CHAT_MODELS,
  defaultModel: DEFAULT_CHAT_MODEL,
  disclaimer: 'Answers may be wrong.',
};

export function ChatMount() {
  return (
    <ChatProvider
      transport={DEMO ? createDemoTransport() : undefined}
      renderers={DEMO ? DEMO_RENDERERS : undefined}
      followups={DEMO ? false : '/api/chat/followups'}
      feedback={DEMO ? false : '/api/chat/feedback'}
    >
      <ChatLauncher label={`Ask ${WIDGET.title}`} widget={WIDGET} />
    </ChatProvider>
  );
}
