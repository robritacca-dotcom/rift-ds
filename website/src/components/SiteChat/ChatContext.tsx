"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MOTION_EXIT_SYNC_MS } from "@robr0/design-system/tokens/motion";
import { useChat, type ChatTransport } from "@/hooks/useChat";
import { fallbackFollowups, fetchFollowups, followupTarget } from "@/lib/chat-followups";
import { createFetchTransport } from "@/lib/chat-transport";

/** Panel is the docked rail; full is the viewport takeover. */
export type ChatView = "panel" | "full";

/* Above this the panel docks and the page slides over (the body inset in
   globals.css); below it the panel overlays behind a scrim. Chosen so the
   pages that already run sidebar + content + right rail keep a readable
   main column — see the build plan's geometry notes. Lives here rather than
   in SiteChatMount so consumers deeper in the widget tree (the markdown
   link renderer, which closes an overlaying panel on navigation) can read
   it without importing the mount and its component graph. Also used by
   pages that auto-open the panel (the playground), which must only do so
   when the panel docks beside the page rather than covering it. */
export const DOCK_QUERY = "(min-width: 1440px)";

/* Below this the panel has no card form to return to: it fills the viewport
   whatever the view says, so the site opens it as a takeover and hides the
   expand toggle rather than offering a switch between a state and itself.
   The width is mirrored by the .panel rule in SiteChat.module.css — the CSS
   is what covers the first render, before this query has been read. */
export const TAKEOVER_QUERY = "(max-width: 719px)";

const subscribeTakeover = (onChange: () => void) => {
  const media = window.matchMedia(TAKEOVER_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readTakeover = () => window.matchMedia(TAKEOVER_QUERY).matches;

/** Whether the viewport is a phone width (TAKEOVER_QUERY), false on the
    server and for the first client render. Shared by the site mount and
    the playground's stage, which both hand the widget its phone layout. */
export function useTakeoverViewport(): boolean {
  return useSyncExternalStore(subscribeTakeover, readTakeover, () => false);
}

interface SiteChatContextValue {
  turns: ReturnType<typeof useChat>["turns"];
  live: ReturnType<typeof useChat>["live"];
  streaming: boolean;
  /** Display label of the model last reported by the server, null before the first exchange. */
  modelLabel: string | null;
  /** The server's current model offer (default + locked values), null before the first exchange. */
  modelPolicy: ReturnType<typeof useChat>["modelPolicy"];
  /** The visitor's explicit model pick (a CHAT_MODELS wire value), null while following the server's default. */
  chosenModel: string | null;
  /** Records an explicit pick; it rides on every send until changed or cleared by a lock. */
  setChosenModel: (value: string | null) => void;
  send: ReturnType<typeof useChat>["send"];
  stop: () => void;
  reset: () => void;
  /** Appends a committed turn without a transport round trip — the playground's event director. */
  injectTurn: ReturnType<typeof useChat>["injectTurn"];
  setTurnFeedback: ReturnType<typeof useChat>["setTurnFeedback"];
  setTurnFollowups: ReturnType<typeof useChat>["setTurnFollowups"];
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  /** Where the panel is in its lifecycle: `closing` is the exit beat after a close, during which the mount keeps the panel rendered so its exit animation is seen. Everything behavioral (modal state, layout attributes, focus) keys on `open`; only presence reads this. */
  panelPhase: "open" | "closing" | "closed";
  /** Which page's conversation starters have played their staged reveal — lives here so closing the panel does not forget it, and a reopen on the same page shows the set standing rather than generating again. */
  starterRevealKey: string | null;
  setStarterRevealKey: (key: string | null) => void;
  /** The draw for the starter pools: rolled once per page load and again by reset(), never in between — so a page's chips hold still until a refresh or a new chat. */
  starterSeed: number;
  /** The turn whose follow-ups landed most recently in this open session, or null. Its row plays the entrance; rows remounted by a reopen do not, because closing clears it. */
  freshFollowupsId: string | null;
  view: ChatView;
  setView: (view: ChatView) => void;
  draft: string;
  setDraft: (draft: string) => void;
  /** The element to restore focus to when the panel closes. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
}

const SiteChatContext = createContext<SiteChatContextValue | null>(null);

/**
 * The chat's whole client state, mounted once in the root layout. The root
 * layout never remounts on client-side navigation, so everything here — the
 * transcript, a stream in flight, the half-typed draft, open state — survives
 * clicking between pages for free. useChat's unmount-abort never fires on
 * navigation because the provider outlives every page.
 *
 * A hard reload starts clean by design: no storage, no persistence.
 */
export function SiteChatProvider({
  transport,
  children,
}: {
  /** Injectable for the bench (sim transport); defaults to the live route. */
  transport?: ChatTransport;
  children: ReactNode;
}) {
  /* The visitor's explicit model pick. Null means "follow the server's
     default", which is a different fact from having picked the model that
     happens to be the default: the budget tier can move the default under a
     visitor who never chose, but never under one who did. The transport
     closes over the current value, so a pick re-creates it and rides on the
     next send; a stream already in flight keeps the model it started on. */
  const [chosenModel, setChosenModel] = useState<string | null>(null);

  const fallbackTransport = useMemo(
    () => createFetchTransport("/api/chat", () => chosenModel),
    [chosenModel]
  );
  const chat = useChat(transport ?? fallbackTransport);

  /* Follow-up chips for the answer that just landed. Fired here rather than
     from the turn's own component so it happens once per answer, whether or
     not anything is rendering it — the panel can be closed, or the turn
     scrolled far above the fold, and the chips are still there when the
     visitor arrives. Turn ids are minted in sequence and never reused, so
     the set of ids already asked about is all the bookkeeping this needs: it
     survives the state changes that a request-in-flight would otherwise be
     re-fired by (a thumbs verdict, the next question being asked). */
  const { setTurnFollowups } = chat;
  const target = useMemo(() => followupTarget(chat.turns), [chat.turns]);
  const askedRef = useRef<Set<string>>(new Set());

  /* The turn whose follow-ups just landed: its row plays the chips'
     entrance. Cleared when the panel closes, so a reopen remounts every
     row with its suggestions standing still — they already arrived once. */
  const [freshFollowupsId, setFreshFollowupsId] = useState<string | null>(null);

  useEffect(() => {
    if (!target || askedRef.current.has(target.id)) return;
    askedRef.current.add(target.id);
    // Never rejects, and a write to a turn that has since been cleared by a
    // new chat is a no-op — so there is nothing here to abort or guard.
    // An empty result substitutes the written fallbacks: the pending row
    // promised chips, and a shimmer that resolves to nothing reads as broken.
    void fetchFollowups(target.question, target.answer).then((suggestions) => {
      const offered =
        suggestions.length > 0 ? suggestions : fallbackFollowups(target.id, target.question);
      setTurnFollowups(target.id, offered);
      setFreshFollowupsId(target.id);
    });
  }, [target, setTurnFollowups]);

  /* The starters' staged-reveal memory — provider-lifetime by design, see
     the context field's doc. */
  const [starterRevealKey, setStarterRevealKey] = useState<string | null>(null);

  /* The starter pools' draw. Provider-lifetime, so client-side navigation
     and re-renders never reshuffle chips the visitor is reading; a hard
     reload rolls it fresh because the provider starts clean by design. The
     starters only render inside the open panel, which the server never
     renders, so the random initializer cannot reach the server HTML. */
  const [starterSeed, setStarterSeed] = useState<number>(() => Math.random());

  /* "New chat" re-rolls the draw and forgets the staged reveal, so the
     welcome screen replays its short generation beat over a different set —
     the same pre-written pools, no model involved. */
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
  const [panelPhase, setPanelPhase] = useState<"open" | "closing" | "closed">("closed");
  const closeTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    []
  );
  /* Closing also forgets which follow-ups were "fresh": everything the next
     open shows has been seen. */
  const setOpen = useCallback((next: boolean) => {
    if (next) {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setPanelPhase("open");
      setOpenState(true);
      return;
    }
    setFreshFollowupsId(null);
    setOpenState(false);
    setPanelPhase((phase) => (phase === "open" ? "closing" : phase));
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setPanelPhase("closed");
    }, MOTION_EXIT_SYNC_MS);
  }, []);
  const [view, setView] = useState<ChatView>("panel");
  const [draft, setDraft] = useState("");
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const toggleOpen = useCallback(() => setOpen(!open), [open, setOpen]);

  const value = useMemo<SiteChatContextValue>(
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
      draft,
      setDraft,
      returnFocusRef,
    }),
    [
      chat,
      reset,
      chosenModel,
      setChosenModel,
      open,
      setOpen,
      toggleOpen,
      panelPhase,
      starterRevealKey,
      starterSeed,
      freshFollowupsId,
      view,
      draft,
    ]
  );

  return <SiteChatContext.Provider value={value}>{children}</SiteChatContext.Provider>;
}

export function useSiteChat(): SiteChatContextValue {
  const context = useContext(SiteChatContext);
  if (!context) {
    throw new Error("useSiteChat must be used inside a SiteChatProvider");
  }
  return context;
}
