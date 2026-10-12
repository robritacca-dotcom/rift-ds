'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOTION_EXIT_SYNC_MS } from '../tokens/motion';
import {
  ChatWidgetContext,
  createFeedbackPoster,
  isInternalPath,
  type ChatCardRenderers,
  type ChatLinkRenderer,
  type ChatView,
  type ChatWidgetContextValue,
  type FeedbackSink,
} from './context';
import {
  DEFAULT_FALLBACK_FOLLOWUPS,
  createFollowupsFetcher,
  followupTarget,
  pickFallbackFollowups,
  type FollowupsSource,
} from './followups';
import type { ChatPlacement, ChatSide } from './placement';
import { useThreads, type ThreadsOptions } from './threads';
import { createFetchTransport } from './transport';
import type { ChatFeedbackVerdict, ChatTransport } from './types';
import { DEFAULT_PLACEHOLDER_COPY, useChat, type ChatPlaceholderCopy } from './useChat';

const defaultRenderLink: ChatLinkRenderer = ({ href, children, onNavigate }) => (
  <a href={href} onClick={onNavigate}>
    {children}
  </a>
);

export interface ChatProviderProps {
  /**
   * Where the conversation goes. Defaults to the fetch transport against
   * `endpoint`, carrying the visitor's model pick. A script from
   * `scriptChat()` runs the widget with no backend at all.
   */
  transport?: ChatTransport;
  /** The endpoint the default transport posts to. */
  endpoint?: string;
  /** The seat the panel opens in. */
  defaultPlacement?: ChatPlacement;
  /**
   * Where follow-up questions come from after an answer commits: a source
   * function, an endpoint for the built-in fetcher, or `false` for none.
   * Defaults to the fetcher against `/api/chat/followups`.
   */
  followups?: FollowupsSource | string | false;
  /** The written questions offered when the source returns none. */
  fallbackFollowups?: readonly string[];
  /**
   * Where a thumbs verdict goes: a sink function, an endpoint for the
   * built-in poster, or `false` to hide the thumbs. Defaults to the poster
   * against `/api/chat/feedback`. Thumbs only ever show on a turn the
   * server logged (one with an exchange id).
   */
  feedback?: FeedbackSink | string | false;
  /** Draws `card` events by kind. */
  renderers?: ChatCardRenderers;
  /** Renders a same-site link in an answer. The default is a plain anchor; a Next.js host passes its Link. */
  renderLink?: ChatLinkRenderer;
  /** Which hrefs in an answer become links. Everything else renders as text. */
  isInternalHref?: (href: string) => boolean;
  /** Seeds the thread lifecycle behind the `threads` and `tabs` slots. */
  threads?: ThreadsOptions;
  /** Replacement copy for the hook's placeholder replies. */
  placeholders?: Partial<ChatPlaceholderCopy>;
  children: ReactNode;
}

/**
 * The chat's whole client state. Mount it once, high in the tree: a root
 * layout never remounts on client-side navigation, so the transcript, a
 * stream in flight, the half-typed draft and the open state survive
 * clicking between pages for free. A hard reload starts clean by design:
 * no storage, no persistence.
 */
export function ChatProvider({
  transport,
  endpoint = '/api/chat',
  defaultPlacement = 'right',
  followups = '/api/chat/followups',
  fallbackFollowups = DEFAULT_FALLBACK_FOLLOWUPS,
  feedback = '/api/chat/feedback',
  renderers,
  renderLink = defaultRenderLink,
  isInternalHref = isInternalPath,
  threads: threadsOptions,
  placeholders,
  children,
}: ChatProviderProps) {
  /* The visitor's explicit model pick. Null means "follow the server's
     default", which is a different fact from having picked the model that
     happens to be the default: a budget tier can move the default under a
     visitor who never chose, but never under one who did. The default
     transport closes over the current value, so a pick re-creates it and
     rides on the next send; a stream already in flight keeps the model it
     started on. */
  const [chosenModel, setChosenModel] = useState<string | null>(null);

  const fallbackTransport = useMemo(
    () => createFetchTransport(endpoint, { getModel: () => chosenModel }),
    [endpoint, chosenModel]
  );
  const placeholderCopy = useMemo(
    () => ({ ...DEFAULT_PLACEHOLDER_COPY, ...placeholders }),
    [placeholders]
  );
  const chat = useChat(transport ?? fallbackTransport, placeholderCopy);
  const threads = useThreads(chat, threadsOptions);

  /* Follow-up chips for the answer that just landed. Fired here rather than
     from the turn's own component so it happens once per answer, whether or
     not anything is rendering it: the panel can be closed, or the turn
     scrolled far above the fold, and the chips are still there when the
     visitor arrives. Turn ids are minted in sequence and never reused, so
     the set of ids already asked about is all the bookkeeping this needs. */
  const followupsSource = useMemo<FollowupsSource | null>(() => {
    if (followups === false) return null;
    return typeof followups === 'string' ? createFollowupsFetcher(followups) : followups;
  }, [followups]);
  const { setTurnFollowups } = chat;
  const target = useMemo(() => followupTarget(chat.turns), [chat.turns]);
  const askedRef = useRef<Set<string>>(new Set());
  const [freshFollowupsId, setFreshFollowupsId] = useState<string | null>(null);

  useEffect(() => {
    if (!target || askedRef.current.has(target.id)) return;
    askedRef.current.add(target.id);
    const offer = (suggestions: string[]) => {
      // An empty result substitutes the written fallbacks: the pending row
      // promised chips, and a shimmer that resolves to nothing reads as broken.
      const offered =
        suggestions.length > 0
          ? suggestions
          : pickFallbackFollowups(fallbackFollowups, target.id, target.question);
      setTurnFollowups(target.id, offered);
      setFreshFollowupsId(target.id);
    };
    if (!followupsSource) {
      offer([]);
      return;
    }
    // A write to a turn that has since been cleared by a new chat is a
    // no-op, so there is nothing here to abort or guard.
    void followupsSource(target.question, target.answer, AbortSignal.timeout(10_000))
      .catch(() => [] as string[])
      .then(offer);
  }, [target, setTurnFollowups, followupsSource, fallbackFollowups]);

  const feedbackSink = useMemo<FeedbackSink | null>(() => {
    if (feedback === false) return null;
    return typeof feedback === 'string' ? createFeedbackPoster(feedback) : feedback;
  }, [feedback]);
  const { setTurnFeedback } = chat;
  const submitFeedback = useMemo(
    () =>
      feedbackSink
        ? (turnId: string, exchangeId: string, verdict: ChatFeedbackVerdict) => {
            // Optimistic on purpose: the verdict is the visitor's fact, so it
            // shows immediately; a write the network loses is worth less than
            // a spinner.
            setTurnFeedback(turnId, verdict);
            void feedbackSink(exchangeId, verdict).catch(() => {});
          }
        : null,
    [feedbackSink, setTurnFeedback]
  );

  /* The starters' staged-reveal memory, provider-lifetime by design. */
  const [starterRevealKey, setStarterRevealKey] = useState<string | null>(null);

  /* The starter pools' draw. Provider-lifetime, so client-side navigation
     and re-renders never reshuffle chips the visitor is reading; a hard
     reload rolls it fresh. The starters only render inside the open panel,
     which the server never renders, so the random initialiser cannot reach
     the server HTML. */
  const [starterSeed, setStarterSeed] = useState<number>(() => Math.random());

  /* New chat re-rolls the draw and forgets the staged reveal, so the welcome
     screen replays its short generation beat over a different set. */
  const { reset: resetChat } = chat;
  const reset = useCallback(() => {
    resetChat();
    setStarterSeed(Math.random());
    setStarterRevealKey(null);
  }, [resetChat]);

  const [open, setOpenState] = useState(false);
  /* The panel's presence, one beat behind `open` on the way out: closing
     holds the node on screen for MOTION_EXIT_SYNC_MS so the exit animation
     plays before the unmount. Reopening mid-exit cancels the timer. */
  const [panelPhase, setPanelPhase] = useState<'open' | 'closing' | 'closed'>('closed');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );
  const setOpen = useCallback((next: boolean) => {
    if (next) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setPanelPhase('open');
      setOpenState(true);
      return;
    }
    /* Closing also forgets which follow-ups were "fresh": everything the
       next open shows has been seen. */
    setFreshFollowupsId(null);
    setOpenState(false);
    setPanelPhase((phase) => (phase === 'open' ? 'closing' : phase));
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setPanelPhase('closed');
    }, MOTION_EXIT_SYNC_MS);
  }, []);
  const [view, setView] = useState<ChatView>('panel');
  /* Two facts rather than one: floating must not forget the dock edge, or
     the way back (and the overlay below the dock threshold) has no side. */
  const [side, setSide] = useState<ChatSide>(
    defaultPlacement === 'floating' ? 'right' : defaultPlacement
  );
  const [floating, setFloating] = useState(defaultPlacement === 'floating');
  const placement: ChatPlacement = floating ? 'floating' : side;
  const setPlacement = useCallback((next: ChatPlacement) => {
    if (next === 'floating') {
      setFloating(true);
      return;
    }
    setFloating(false);
    setSide(next);
  }, []);
  const [draft, setDraft] = useState('');
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const toggleOpen = useCallback(() => setOpen(!open), [open, setOpen]);

  const renderersValue = useMemo(() => renderers ?? {}, [renderers]);

  const value = useMemo<ChatWidgetContextValue>(
    () => ({
      ...chat,
      reset,
      chosenModel,
      setChosenModel,
      open,
      setOpen,
      toggleOpen,
      panelPhase,
      starterRevealKey,
      setStarterRevealKey,
      starterSeed,
      freshFollowupsId,
      view,
      setView,
      placement,
      setPlacement,
      side,
      floating,
      draft,
      setDraft,
      returnFocusRef,
      threads,
      renderers: renderersValue,
      renderLink,
      isInternalHref,
      submitFeedback,
    }),
    [
      chat,
      reset,
      chosenModel,
      open,
      setOpen,
      toggleOpen,
      panelPhase,
      starterRevealKey,
      starterSeed,
      freshFollowupsId,
      view,
      placement,
      setPlacement,
      side,
      floating,
      draft,
      threads,
      renderersValue,
      renderLink,
      isInternalHref,
      submitFeedback,
    ]
  );

  return <ChatWidgetContext.Provider value={value}>{children}</ChatWidgetContext.Provider>;
}
