import type { ChatModelOption } from 'rift-ds/chat';

/**
 * The models your chat offers. The widget's picker shows `label` and
 * `description`; the client sends `value`; the server calls `id`. Shared by
 * the route and the mount so the two can never disagree. Edit freely.
 */
export const CHAT_MODELS: ChatModelOption[] = [
  {
    value: 'haiku',
    id: 'claude-haiku-5-5',
    label: 'Haiku 5.5',
    description: 'Fast answers, the everyday pick.',
    adaptiveThinking: true,
  },
  {
    value: 'sonnet',
    id: 'claude-sonnet-5-5',
    label: 'Sonnet 5.5',
    description: 'More depth for harder questions.',
    adaptiveThinking: true,
  },
];

/** What serves when the visitor has not chosen. */
export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].value;

/** The model that writes the three follow-up questions under an answer. */
export const FOLLOWUP_MODEL = 'claude-haiku-5-5';
