'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ChatPlacement, ChatSide } from './placement';
import type { ThreadsState } from './threads';
import type { ChatFeedbackVerdict } from './types';
import type { ChatState } from './useChat';

/** Panel is the docked rail; full is the viewport takeover. */
export type ChatView = 'panel' | 'full';

/**
 * Draws a `card` event's data as a React node. Keyed by the card's `kind`;
 * a kind with no renderer draws nothing.
 */
export type ChatCardRenderers = Record<string, (data: unknown) => ReactNode>;

/** How the widget renders a link the model wrote. */
export type ChatLinkRenderer = (props: {
  href: string;
  children: ReactNode;
  /** Call on navigation: closes the panel when it covers the page. */
  onNavigate: () => void;
}) => ReactNode;

/** Sends a thumbs verdict somewhere. */
export type FeedbackSink = (exchangeId: string, verdict: ChatFeedbackVerdict) => Promise<void>;

export interface ChatWidgetContextValue extends ChatState {
  /** The visitor's explicit model pick (a wire value), null while following the server's default. */
  chosenModel: string | null;
  /** Records an explicit pick; it rides on every send until changed or cleared by a lock. */
  setChosenModel: (value: string | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  /** Where the panel is in its lifecycle: `closing` is the exit beat after a close, during which the launcher keeps the panel rendered so its exit animation is seen. Everything behavioural keys on `open`; only presence reads this. */
  panelPhase: 'open' | 'closing' | 'closed';
  /** Which starters key has played its staged reveal, so a reopen shows the set standing rather than generating again. */
  starterRevealKey: string | null;
  setStarterRevealKey: (key: string | null) => void;
  /** The draw for the starter pools: rolled once per load and again by reset(). */
  starterSeed: number;
  /** The turn whose follow-ups landed most recently in this open session, or null. Its row plays the entrance. */
  freshFollowupsId: string | null;
  view: ChatView;
  setView: (view: ChatView) => void;
  /** The panel's seat: a dock edge or floating. Provider-lifetime, so a reload returns to the host's default. */
  placement: ChatPlacement;
  setPlacement: (placement: ChatPlacement) => void;
  /** The dock edge, remembered while floating, so the card has an edge to return to and to overlay from. */
  side: ChatSide;
  /** Popped out of the dock: a non-modal card the visitor moves and sizes. */
  floating: boolean;
  draft: string;
  setDraft: (draft: string) => void;
  /** The element to restore focus to when the panel closes. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  /** The thread lifecycle behind the built-in threads and tabs. */
  threads: ThreadsState;
  renderers: ChatCardRenderers;
  renderLink: ChatLinkRenderer;
  isInternalHref: (href: string) => boolean;
  /** Record and send a thumbs verdict; null when feedback is off. */
  submitFeedback: ((turnId: string, exchangeId: string, verdict: ChatFeedbackVerdict) => void) | null;
}

export const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null);

/** The chat's state and actions, for anything rendered inside `ChatProvider`. */
export function useChatWidget(): ChatWidgetContextValue {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error('useChatWidget must be used inside a ChatProvider');
  }
  return context;
}

/* Model output is untrusted, so an href becomes a link only when it is a
   same-site path: lowercase slug segments, optionally rooted at "/".
   Anything else (external hosts, protocols, fragments) renders as plain
   text. A hallucinated-but-clean path is inert: it lands on the host's 404. */
const INTERNAL_PATH = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+){0,3})?$/;
export const isInternalPath = (href: string) => INTERNAL_PATH.test(href);

/** A sink that posts a verdict to an endpoint speaking the feedback protocol (`createFeedbackHandler`). */
export function createFeedbackPoster(endpoint = '/api/chat/feedback'): FeedbackSink {
  return async (id, verdict) => {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, verdict }),
    });
  };
}
