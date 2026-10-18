'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { AgentRailProfile, AgentRailTab } from '../components/AgentRail/AgentRail';
import { AttachmentDropZone } from '../components/Attachment/AttachmentDropZone';
import { AttachmentGroup } from '../components/Attachment/AttachmentGroup';
import { useAttachments } from '../components/Attachment/useAttachments';
import { ChatHeader } from '../components/ChatHeader/ChatHeader';
import { ChatMessage } from '../components/ChatMessage/ChatMessage';
import { ChatThread } from '../components/ChatThread/ChatThread';
import { CircularButton } from '../components/CircularButton/CircularButton';
import { PixelAvatar } from '../components/PixelAvatar/PixelAvatar';
import { Composer } from '../components/Composer/Composer';
import { DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
import { MentionText, type MentionSource } from '../components/Mention/Mention';
import { ModelPicker } from '../components/ModelPicker/ModelPicker';
import { PromptSuggestions } from '../components/PromptSuggestions/PromptSuggestions';
import { MOTION_SCROLL_SETTLE_MS, MOTION_SUGGESTIONS_THINK_MS } from '../tokens/motion';
import { AssistantTurn } from './AssistantTurn';
import { cardArtifact } from './artifacts';
import { ChatAgentPane } from './ChatAgentPane';
import { ChatArtifactPane } from './ChatArtifactPane';
import { ChatTabs } from './ChatTabs';
import { ChatThreads, type ChatThreadsProps } from './ChatThreads';
import { ArtifactSeatContext, useChatWidget } from './context';
import { readGreeting, serverGreeting, subscribeClock } from './greeting';
import { CHAT_PLACEMENTS, chatPlacement } from './placement';
import {
  ARTIFACT_MIN_COLUMN_WIDTH,
  ASIDE_RAIL_MIN_WIDTH,
  ASIDE_WITH_THREADS_MIN_WIDTH,
  THREADS_RAIL_MIN_WIDTH,
} from './queries';
import { fitsChip } from './suggestions';
import { TurnCard } from './TurnContent';
import { isBlockingQuestion } from './questions';
import { ReplyBody } from './TurnQuestion';
import type { ChatModelOption, Starter } from './types';
import './ChatWidget.css';

/* Limits on what a visitor may queue where attachments are on. They bound
   what the browser holds in memory; nothing is uploaded, so they are not a
   server contract. */
const DEFAULT_MAX_ATTACHMENTS = 10;
const DEFAULT_MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;
/* A paste this long is a document, not a sentence: it becomes a tile. */
const LONG_PASTE_CHARS = 1200;

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 * 1024
    ? `${Math.round(bytes / (1024 * 1024 * 1024))} GB`
    : `${Math.round(bytes / (1024 * 1024))} MB`;

/**
 * The agent's mark on a profile that brings none of its own: a PixelAvatar
 * seeded by the widget's title, the same mark the header toggle wears, so
 * the control and the pane it opens read as one character. A host's own
 * `avatar` or `avatarSrc` is left alone.
 */
const withAgentMark = (profile: AgentRailProfile, title: string): AgentRailProfile =>
  profile.avatar || profile.avatarSrc
    ? profile
    : { ...profile, avatar: <PixelAvatar name={title} size="lg" label={title} /> };

/** A rail slot: the widget's own panel, or a render prop for a custom one. */
export type RailSlot = boolean | ((ctx: { overlay: boolean; close: () => void }) => ReactNode);

/** What the built-in agent pane shows. */
export interface ChatAgentOptions {
  /** The agent's portrait block. Defaults to the widget's title with a "Connected" status. A profile with neither `avatar` nor `avatarSrc` wears a PixelAvatar seeded by the widget's title, the mark the header toggle wears. */
  profile?: AgentRailProfile;
  /** The panes, in display order. */
  tabs: AgentRailTab[];
  /** Open the pane at mount, where the panel is wide enough to seat it inline. Off by default: the header button opens it. */
  defaultOpen?: boolean;
}

/** Props owned by ChatWidget itself. */
export interface ChatWidgetProps {
  /** Show the expand toggle. A host whose stage is always a takeover hides it. */
  fullscreenEnabled?: boolean;
  /** Show the header's close button. A host that seats the chat as the page
      itself rather than as a panel over one has nothing to close back to,
      so it turns this off. */
  closeEnabled?: boolean;
  /** Show the header's Chat position menu (dock right, dock left, floating). Off by default: a host turns it on only when it implements the seats the menu offers, as ChatLauncher does. */
  placementEnabled?: boolean;
  /** Narrow insets for phone-width hosts. */
  compact?: boolean;
  /** The host is a phone viewport, where the soft keyboard will claim the
      lower half of the screen the moment the composer is focused. The
      welcome screen stacks instead of centring the composer: greeting in
      the middle of the empty thread, starters directly above the composer,
      composer pinned to the bottom from the first paint. */
  phone?: boolean;
  /** The header brand name. */
  title?: string;
  /**
   * Which way the conversation reads. `top-down` (the default) floats each
   * new turn to the top of the thread and streams the answer in below it.
   * `bottom-up` is the classic message thread: turns stack from the bottom,
   * the newest just above the composer, and the view follows the answer.
   */
  flow?: 'top-down' | 'bottom-up';
  /** The composer's placeholder text. */
  placeholder?: string;
  /** The composer's placeholder while a set of questions holds it: the answer goes in the card, or the card is skipped. */
  questionsPlaceholder?: string;
  /** Show the conversation starters on the welcome screen. */
  showStarters?: boolean;
  /** The header mark's image src; null (the default) shows the name alone. */
  logo?: string | null;
  /** The welcome screen's line under the greeting. */
  tagline?: string;
  /** The conversation starters: a few pre-written questions. Each must fit the chip budget (SUGGESTION_MAX_CHARS); one that does not is dropped rather than clipped. */
  starters?: Starter[];
  /** Keys the starters' staged reveal: a new key replays the generation beat, the same key shows the set standing. A host whose starters follow the page passes the pathname. */
  startersKey?: string;
  /** Replaces the composer's leading actions (the model picker). */
  composerActions?: ReactNode;
  /** The models the picker offers. The pick rides on each send as a wire value; the server resolves it. Omit for no picker. */
  models?: ChatModelOption[];
  /** The picker's selection before the server has reported its default. Defaults to the first model. */
  defaultModel?: string;
  /** The one line a locked model shows in place of its description. */
  lockedModelDescription?: string;
  /** Let the visitor attach files: an attach button, paste, drop anywhere
      on the chat, and long pastes folded into a tile. Files are read in the
      browser for previews; what reaches the transport is names and kinds. */
  fileAttachments?: boolean;
  /** Most files the visitor may queue on one message. */
  maxAttachments?: number;
  /** Largest file the visitor may queue, in bytes. */
  maxAttachmentBytes?: number;
  /** What the visitor can reference while typing: one source per trigger
      character, drawn as tags in the composer and in the sent bubble. */
  mentions?: MentionSource[];
  /** A session-history rail. `true` seats the built-in ChatThreads over the
      provider's thread lifecycle; a render prop seats your own. Wide hosts
      seat it as an inline left rail, narrow ones summon it from a header
      hamburger as a slide-over sheet behind a scrim. */
  threads?: RailSlot;
  /** Props for the built-in threads rail when `threads` is `true`. */
  threadsProps?: Omit<ChatThreadsProps, 'overlay' | 'close'>;
  /** An open-sessions tab strip as its own row under the header. `true` seats the built-in ChatTabs; a node seats your own. */
  tabs?: boolean | ReactNode;
  /** A companion rail on the trailing edge, the mirror of `threads`: a render prop for your own pane, seated inline on a wide host and raised as a bottom sheet from a header button on a narrow one. For the built-in pane pass `agent` instead. */
  aside?: (ctx: { overlay: boolean; close: () => void }) => ReactNode;
  /** The built-in agent pane: who the agent is and what it has been doing. Seated like `aside`. */
  agent?: ChatAgentOptions;
  /** Seat the artifact panel: a reply that carries an artifact draws a tile in the thread, and the tile (or the header's artifact button) opens the artifact beside the conversation on a wide host and as a bottom sheet on a narrow one. The trailing seat holds one panel at a time, so an open artifact stands in for the agent pane. Off, none of it exists: no header button, no tile, no panel. */
  artifacts?: boolean;
  /** The composer's context note, naming what the chat is looking at. Omit for none. */
  contextLabel?: string | null;
  /** A widget slot on the welcome screen, under the composer and its
      starters. It takes any content and keeps its natural height, so the
      composer rides up by half of it instead of holding dead centre: the
      empty chat reads as a home page rather than a blank prompt. It leaves
      with the first message, like the rest of the welcome dressing. */
  widgets?: ReactNode;
  /** How the widget slot takes its room. `fit` keeps the welcome screen to
      one viewport: the widgets hold their height and the composer rides up
      to make room. `scroll` turns the welcome screen into a page: the
      greeting and composer take the opening of the viewport, the widgets
      run on below the fold, and the whole welcome scrolls as one. */
  widgetsLayout?: 'fit' | 'scroll';
  /** How wide the widget slot runs. `column` holds it to the composer's
      bounding box; `wide` lets it run past them, for a dashboard. */
  widgetsWidth?: 'column' | 'wide';
  /** The quiet line pinned to the widget's floor: what the chat is and where its policy lives. */
  disclaimer?: ReactNode;
}

/**
 * The composed chat: header, thread, composer, starters, disclaimer, and the
 * optional rails, filling whatever container hosts it (ChatLauncher's panel,
 * a stage card, a whole page). It reads all of its state from ChatProvider,
 * so the conversation is the same object wherever it shows.
 */
export function ChatWidget({
  fullscreenEnabled = true,
  closeEnabled = true,
  placementEnabled = false,
  compact = false,
  phone = false,
  title = 'Assistant',
  flow = 'top-down',
  placeholder = 'Ask anything',
  questionsPlaceholder = 'Answer the questions above, or skip them',
  showStarters = true,
  logo = null,
  tagline = 'How can I help you today?',
  starters: startersInput,
  startersKey = '',
  composerActions,
  models,
  defaultModel,
  lockedModelDescription = 'Paused for today to stay in budget.',
  fileAttachments = false,
  maxAttachments = DEFAULT_MAX_ATTACHMENTS,
  maxAttachmentBytes = DEFAULT_MAX_ATTACHMENT_BYTES,
  mentions,
  threads,
  threadsProps,
  tabs,
  aside,
  agent,
  artifacts = false,
  contextLabel,
  widgets,
  widgetsLayout = 'fit',
  widgetsWidth = 'column',
  disclaimer = 'Answers may be wrong.',
}: ChatWidgetProps) {
  const {
    turns,
    live,
    streaming,
    modelPolicy,
    chosenModel,
    setChosenModel,
    send,
    stop,
    reset,
    open,
    setOpen,
    view,
    setView,
    placement,
    setPlacement,
    draft,
    setDraft,
    starterSeed,
    starterRevealKey,
    setStarterRevealKey,
    artifact,
    openArtifact,
    closeArtifact,
  } = useChatWidget();

  /* A set of questions on the newest turn holds the composer until it is
     answered or skipped: the answers belong in the card. */
  const questionsOpen = isBlockingQuestion(turns[turns.length - 1], live !== null);
  /* The set held focus in its card; once it is answered or skipped the card
     becomes a record with nothing left to press, so focus would fall to the
     page. Hand it back to the composer, which has just come back on. */
  const questionsWereOpen = useRef(questionsOpen);
  useEffect(() => {
    if (questionsWereOpen.current && !questionsOpen) {
      composerRef.current?.focus({ preventScroll: true });
    }
    questionsWereOpen.current = questionsOpen;
  }, [questionsOpen]);

  /* The picker shows the visitor's pick, or the server's current default
     when they have not made one, which is how a budget step-down moves the
     label without a click. Locked entries stay listed but greyed, with the
     reason where their description was; a pick the server has since locked
     counts as no pick (the server clamps it anyway), so the label falls back
     to the default rather than naming a model that will not serve. */
  const lockedValues = modelPolicy?.locked ?? [];
  const pick = chosenModel && !lockedValues.includes(chosenModel) ? chosenModel : null;
  const pickerValue = pick ?? modelPolicy?.default ?? defaultModel ?? models?.[0]?.value;
  const pickerModels = (models ?? []).map((option) => ({
    value: option.value,
    label: option.label,
    description: lockedValues.includes(option.value)
      ? lockedModelDescription
      : option.description,
    disabled: lockedValues.includes(option.value),
  }));

  const greeting = useSyncExternalStore(subscribeClock, readGreeting, serverGreeting);

  /* Filtered, not truncated: a chip is a question the visitor is about to
     ask, and half a question is not one. */
  const starters = (startersInput ?? []).filter((starter) => fitsChip(starter.label));
  // Unused seed on this side: the host draws from its pools with it.
  void starterSeed;

  /* The text field is ready to type into whenever a conversation can start:
     on open, on new chat, and again after every send. The host restores
     focus to its own trigger when the chat closes. */
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  /* preventScroll: a panel opening, or a click on its dead space, must not drag the page to the composer. The panel is fixed on the hosts that open it; an example seated in a page would scroll the page otherwise. */
  const focusComposer = () => composerRef.current?.focus({ preventScroll: true });
  useEffect(() => {
    if (open) focusComposer();
  }, [open]);

  /* The files queued on the next message. Sending hands them to the turn,
     which keeps their previews alive for as long as the thread shows it. */
  const queue = useAttachments({ maxCount: maxAttachments, maxSize: maxAttachmentBytes });
  const attachHint = `Up to ${formatBytes(maxAttachmentBytes)} each · ${maxAttachments} files max`;

  const handleSubmit = (value: string) => {
    // send() reports acceptance; an ignored submit keeps the draft and the queue.
    if (fileAttachments && queue.items.length > 0) {
      const ready = queue.items.filter((item) => item.status === 'ready');
      if (send(value, { attachments: ready })) {
        // Ownership of the previews moved to the turn; empty without revoking.
        queue.take();
        setDraft('');
      }
    } else if (send(value)) setDraft('');
    focusComposer();
  };

  const isFull = view === 'full';
  const isEmpty = turns.length === 0 && !live;

  /* The starters stage a short "generation" the first time the welcome
     screen shows a set: shimmer placeholders for a beat, then the chips
     popping in. The shimmer is theatre (the labels are pre-written) but it
     is the same beat the follow-ups play for real. A set that has already
     revealed shows instantly and standing still on the next open, as if
     cached. The reveal memory lives in the provider, so closing the panel
     (which unmounts this component) does not replay the show; `stagedKey`
     is mount-local, so only a set that actually staged here plays the chips'
     entrance. */
  const [stagedKey, setStagedKey] = useState<string | null>(null);
  const startersThinking = open && isEmpty && starterRevealKey !== startersKey;
  const startersEntrance = startersThinking || stagedKey === startersKey;
  useEffect(() => {
    if (!(open && isEmpty && starterRevealKey !== startersKey)) return;
    const timer = setTimeout(() => {
      setStagedKey(startersKey);
      setStarterRevealKey(startersKey);
    }, MOTION_SUGGESTIONS_THINK_MS);
    return () => clearTimeout(timer);
  }, [open, isEmpty, starterRevealKey, setStarterRevealKey, startersKey]);

  /* ---------- the side rails (only when the host asks for one) ----------
     The widget measures its own width, so each mode follows the actual
     container: a docked panel and a thin card get the header button and a
     sheet, the takeover and wide cards the inline rail. The two rails have
     their own thresholds because they cost different amounts of room. */
  const renderThreads =
    threads === true
      ? (ctx: { overlay: boolean; close: () => void }) => (
          <ChatThreads {...threadsProps} logoText={threadsProps?.logoText ?? title} {...ctx} />
        )
      : threads || undefined;
  const renderAside =
    aside ??
    (agent
      ? (ctx: { overlay: boolean; close: () => void }) => (
          <ChatAgentPane
            profile={withAgentMark(agent.profile ?? { name: title, status: 'Connected' }, title)}
            tabs={agent.tabs}
            overlay={ctx.overlay}
            onClose={ctx.close}
          />
        )
      : undefined);
  const tabsNode = tabs === true ? <ChatTabs /> : tabs || null;

  const hasRails = Boolean(renderThreads || renderAside || artifacts);
  const [threadsOpen, setThreadsOpen] = useState(false);
  /* One piece of state for the agent panel, resting closed: it is the same
     panel in either seat, and it only ever opens because someone asked. The
     seat decides how it is drawn, never whether it is up. */
  const [asideOpen, setAsideOpen] = useState(Boolean(agent?.defaultOpen));
  const railsHostRef = useRef<HTMLDivElement | null>(null);
  const [threadsWide, setThreadsWide] = useState(false);
  const [asideWide, setAsideWide] = useState(false);
  /* The trailing seat is one seat with one set of rules, whichever panel
     holds it: `asideWide` is room to sit beside the conversation at all,
     `asideRoomy` room to do it without the threads rail giving up its own. */
  const [asideRoomy, setAsideRoomy] = useState(false);
  /* The artifact panel's own two pieces of state, declared here because the
     measuring effect below closes the trailing seat when it loses its room. */
  const [artifactEmptyOpen, setArtifactEmptyOpen] = useState(false);
  const [artifactExpandedWanted, setArtifactExpanded] = useState(false);
  /* Only the crossing matters, not every measurement. It starts as if the
     seat had been wide, so a widget that mounts narrow counts as having
     left rail territory: a panel held over from a wider life (the provider
     keeps the artifact across a remount) does not come back as a sheet
     nobody asked for, and `defaultOpen` stays an inline-only promise. */
  const wasAsideWideRef = useRef(true);
  useEffect(() => {
    if (!hasRails) return;
    const host = railsHostRef.current;
    if (!host) return;
    const measure = () => {
      const width = host.clientWidth;
      const wide = width >= THREADS_RAIL_MIN_WIDTH;
      const asideRoom = width >= ASIDE_RAIL_MIN_WIDTH;
      setThreadsWide(wide);
      setAsideWide(asideRoom);
      setAsideRoomy(width >= ASIDE_WITH_THREADS_MIN_WIDTH);
      /* Growing into rail territory retires the sheet, so it cannot pop
         back open on a later trip below the breakpoint. */
      if (wide) setThreadsOpen(false);
      /* Leaving rail territory closes whichever panel holds the trailing
         seat rather than handing it to the sheet; growing back in does not
         reopen it. A panel opens because someone asked, and a sheet nobody
         asked for covers the conversation. */
      if (wasAsideWideRef.current && !asideRoom) {
        setAsideOpen(false);
        setArtifactEmptyOpen(false);
        setArtifactExpanded(false);
        closeArtifact();
      }
      wasAsideWideRef.current = asideRoom;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [hasRails, closeArtifact]);
  const closeThreads = () => setThreadsOpen(false);

  /* ---------- the artifact panel ----------
     The trailing seat holds one panel at a time: an artifact on stage
     stands in for the agent pane, which returns when the artifact closes if
     it was up. The panel is drawn from the artifact the provider holds; the
     last one is kept through the exit, so a closing panel does not empty
     before it has gone. */
  const artifactId = useId();
  /* The panel can be up with nothing on stage: the header button opens it
     before the conversation has made anything, onto an empty state. */
  const artifactShown = artifacts && (artifact !== null || artifactEmptyOpen);
  const [heldArtifact, setHeldArtifact] = useState(artifact);
  if (artifactShown && artifact !== heldArtifact) setHeldArtifact(artifact);
  const artifactInline = artifactShown && asideWide;
  const artifactExpanded = artifactInline && artifactExpandedWanted;
  const closeArtifactPanel = () => {
    setArtifactExpanded(false);
    setArtifactEmptyOpen(false);
    closeArtifact();
  };
  /* Drag-to-size, inline seat only: the card's leading edge is a grip. The
     panel's trailing edge is fixed, so its width grows as the pointer moves
     toward the conversation, which keeps a floor of its own. During the drag
     the pointer writes the variable straight onto the row, so the transcript
     does not re-render per frame; the commit on release makes React agree.
     A mouse affordance, like the dock's widen grip: the panel is fully
     usable at its resting share without it. */
  const [artifactWidth, setArtifactWidth] = useState<number | null>(null);
  const [artifactResizing, setArtifactResizing] = useState(false);
  const artifactRailRef = useRef<HTMLDivElement | null>(null);
  const artifactDragRef = useRef<{ startX: number; width: number; max: number; next: number } | null>(null);
  const beginArtifactResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || artifactDragRef.current) return;
    const rail = artifactRailRef.current;
    const column = railsHostRef.current?.querySelector<HTMLElement>(':scope > .ds-chat-widget');
    if (!rail || !column) return;
    const width = rail.getBoundingClientRect().width;
    const spare = column.getBoundingClientRect().width - ARTIFACT_MIN_COLUMN_WIDTH;
    artifactDragRef.current = { startX: e.clientX, width, max: width + Math.max(0, spare), next: width };
    e.currentTarget.setPointerCapture(e.pointerId);
    setArtifactResizing(true);
  };
  const moveArtifactResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = artifactDragRef.current;
    if (!drag) return;
    const grown = drag.width - (e.clientX - drag.startX);
    drag.next = Math.round(Math.min(drag.max, Math.max(ARTIFACT_MIN_COLUMN_WIDTH, grown)));
    railsHostRef.current?.style.setProperty('--ds-chat-artifact-width', `${drag.next}px`);
  };
  const endArtifactResize = () => {
    const drag = artifactDragRef.current;
    if (!drag) return;
    artifactDragRef.current = null;
    setArtifactWidth(drag.next);
    setArtifactResizing(false);
  };

  /* The header button reopens the conversation's newest artifact. */
  const latestArtifact = useMemo(() => {
    for (let index = turns.length - 1; index >= 0; index -= 1) {
      const found = cardArtifact(turns[index].card);
      if (found) return found;
    }
    return null;
  }, [turns]);
  /* An artifact that arrives while the visitor is watching opens itself,
     where there is room to seat it beside the conversation. In the sheet's
     territory it waits for its tile: a sheet nobody asked for covers the
     answer that announced it. Turns already in the thread at mount are not
     arrivals. */
  const seenArtifactTurns = useRef<Set<string> | null>(null);
  const asideWideRef = useRef(asideWide);
  useEffect(() => {
    asideWideRef.current = asideWide;
  }, [asideWide]);
  useEffect(() => {
    if (!artifacts) return;
    const carrying = turns.filter((turn) => cardArtifact(turn.card));
    if (seenArtifactTurns.current === null) {
      seenArtifactTurns.current = new Set(carrying.map((turn) => turn.id));
      return;
    }
    for (const turn of carrying) {
      if (seenArtifactTurns.current.has(turn.id)) continue;
      seenArtifactTurns.current.add(turn.id);
      const arrived = cardArtifact(turn.card);
      if (arrived && asideWideRef.current) openArtifact(arrived);
    }
  }, [artifacts, turns, openArtifact]);

  /* The inline threads rail yields to a trailing panel that needs its room,
     the agent pane and the artifact alike: under the roomy threshold, or
     whenever the artifact is expanded, the history goes back behind the
     header's hamburger. */
  const trailingUp = artifactInline || (Boolean(renderAside) && asideOpen && asideWide);
  const threadsInline = threadsWide && !(trailingUp && (!asideRoomy || artifactExpanded));

  /* The inline rail glides to its pane's own width, which only the pane
     knows: measured here and handed to the stylesheet as a variable, written
     straight onto the node so a pane that resizes does not re-render the
     transcript. A pane with no width of its own measures nothing and the
     rail falls back to its content's width, unanimated. */
  const asideRailRef = useRef<HTMLDivElement | null>(null);
  const asideMounted = Boolean(renderAside) && asideWide;
  useEffect(() => {
    if (!asideMounted) return;
    const rail = asideRailRef.current;
    const card = rail?.firstElementChild as HTMLElement | null;
    const pane = card?.firstElementChild as HTMLElement | null;
    if (!rail || !card || !pane) return;
    const measure = () => {
      const width = pane.offsetWidth + (card.offsetWidth - card.clientWidth);
      if (pane.offsetWidth > 0) rail.style.setProperty('--ds-chat-aside-width', `${width}px`);
      else rail.style.removeProperty('--ds-chat-aside-width');
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [asideMounted]);

  /* One panel, two seats. `asideShown` is what the visitor can actually see,
     so it drives the toggle, the header button and the Escape order alike. */
  const asideId = useId();
  const asideShown = Boolean(renderAside) && asideOpen && !artifactShown;
  const closeAside = () => setAsideOpen(false);
  const toggleAside = () => {
    /* Asking for the agent while an artifact holds the seat swaps them. */
    if (artifactShown) {
      closeArtifactPanel();
      setAsideOpen(true);
      return;
    }
    setAsideOpen((current) => !current);
  };

  /* The starters sit in one of two places: under the centred composer on
     the desktop welcome, directly above the bottom-pinned one on a phone.
     Rendered where they show, not reordered with CSS, so the tab order
     follows the visual order in both layouts. */
  const startersNode = isEmpty && showStarters && starters.length > 0 && (
    <div className="ds-chat-widget__starters">
      <PromptSuggestions
        layout="stack"
        ariaLabel="Conversation starters"
        pending={startersThinking}
        entrance={startersEntrance}
        suggestions={starters}
        onValueChange={(id) => {
          const starter = starters.find((s) => s.id === id);
          if (starter && send(starter.label)) focusComposer();
        }}
      />
    </div>
  );

  const widgetsNode = isEmpty && widgets && (
    <div className="ds-chat-widget__widgets">{widgets}</div>
  );

  /* The widget's own controls. Every one of them acts on the whole widget,
     so where a trailing panel can seat inline they live at the card's own
     top trailing corner (see `actionsFloat` below): a cluster stranded
     mid-card above the conversation column reads as the column's chrome
     instead. On a narrower widget they sit in the chat header. The buttons
     self-label with tooltips, opening downward because the header hugs the
     panel's clipped top edge. */
  /* A panel seated inline on the trailing edge, whichever tenant it is. */
  const trailingInline = (asideShown && asideWide) || artifactInline;
  /* Wherever the widget is wide enough to seat a trailing panel inline, its
     controls have one home for good: the card's own top trailing corner,
     over the header row with no panel up and over the panel's top inset with
     one. They used to move between the chat header and that corner as a
     panel opened and closed, which remounted every button and, on the way
     out, landed them on a column that was still narrow. One home means
     nothing moves and nothing remounts. The header keeps a spacer of the
     cluster's size while no panel is up, so the title still stops short of
     the controls. */
  const actionsFloat = (Boolean(renderAside) || artifacts) && asideWide;
  /* With the inline threads rail offered, its own new-thread row is the one
     New chat. Keyed on the rail having room, not on whether an open artifact
     has borrowed it: the cluster should not gain a button because a panel
     opened. */
  const showNewChat = !(renderThreads && threadsWide);
  const actionCount =
    Number(showNewChat) +
    Number(Boolean(renderAside)) +
    Number(artifacts) +
    Number(placementEnabled) +
    Number(fullscreenEnabled) +
    Number(closeEnabled);
  const headerActions = (
    <>
      {showNewChat && (
        <CircularButton
          icon="edit_square"
          variant="tertiary"
          ariaLabel="New chat"
          tooltipPosition="bottom"
          onClick={() => {
            reset();
            setDraft('');
            focusComposer();
          }}
        />
      )}
      {/* The agent toggle holds its seat whether the panel is up or not, and
          says which. A control that vanishes when it is on is a control
          nobody learns. */}
      {renderAside && (
        <CircularButton
          /* The agent's own mark, the same seed the pane's portrait uses, so
             the toggle and the panel it opens read as one character. */
          icon={<PixelAvatar name={title} size="sm" />}
          variant="tertiary"
          className={asideShown ? 'ds-chat-widget__agent-toggle--on' : undefined}
          ariaLabel={asideShown ? 'Hide the agent panel' : 'Show the agent panel'}
          tooltipPosition="bottom"
          aria-expanded={asideShown}
          aria-controls={asideShown ? asideId : undefined}
          onClick={toggleAside}
        />
      )}
      {/* The artifact toggle, the agent toggle's sibling, and like it the
          one control both ways: it opens the panel on the conversation's
          newest artifact (or, before there is one, on the empty state) and
          closes whatever is up. */}
      {artifacts && (
        <CircularButton
          icon={artifactShown ? 'right_panel_close' : 'right_panel_open'}
          variant="tertiary"
          className={artifactShown ? 'ds-chat-widget__agent-toggle--on' : undefined}
          ariaLabel={artifactShown ? 'Hide the artifact panel' : 'Show the artifact panel'}
          tooltipPosition="bottom"
          aria-expanded={artifactShown}
          aria-controls={artifactShown ? artifactId : undefined}
          onClick={() => {
            if (artifactShown) closeArtifactPanel();
            else if (latestArtifact) openArtifact(latestArtifact);
            else setArtifactEmptyOpen(true);
          }}
        />
      )}
      {/* Placement: one menu naming every seat, the current one checked.
          Full screen has no placement, so the button goes inert there but
          keeps its seat. */}
      {placementEnabled && (
        <span
          className="ds-chat-widget__placement-menu"
          onKeyDown={(event) => {
            /* The menu closes on Escape without consuming it, and the panel
               closes the whole chat on the same key. One press, one layer. */
            if (
              event.key === 'Escape' &&
              event.currentTarget.querySelector('[aria-expanded="true"]')
            ) {
              event.stopPropagation();
            }
          }}
        >
          <DropdownMenu
            align="end"
            trigger={
              <CircularButton
                icon={chatPlacement(placement).icon}
                variant="tertiary"
                ariaLabel="Chat position"
                tooltipPosition="bottom"
                disabled={isFull}
              />
            }
            items={[
              {
                type: 'group',
                label: 'Chat position',
                items: CHAT_PLACEMENTS.map(({ id, label, icon }) => ({
                  label,
                  icon,
                  selected: placement === id,
                  onClick: () => setPlacement(id),
                })),
              },
            ]}
          />
        </span>
      )}
      {fullscreenEnabled && (
        <CircularButton
          icon={isFull ? 'close_fullscreen' : 'open_in_full'}
          variant="tertiary"
          ariaLabel={isFull ? 'Exit full screen' : 'Enter full screen'}
          tooltipPosition="bottom"
          onClick={() => setView(isFull ? 'panel' : 'full')}
        />
      )}
      {closeEnabled && (
        <CircularButton
          icon="close"
          variant="tertiary"
          ariaLabel="Close chat"
          tooltipPosition="bottom"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );

  /* With attachments on, the whole chat column is the drop target, so a
     file dragged anywhere over the conversation lands. The zone renders the
     same root div and passes everything through. */
  const ChatRoot: React.ElementType = fileAttachments ? AttachmentDropZone : 'div';
  const dropProps = fileAttachments ? { onFilesSelected: queue.add, hint: attachHint } : {};

  /* When the welcome screen scrolls as a page, the root is the scroll
     container and takes the thread's treatment: its scrollbar shows only
     while scrolling is actually happening, and settles away after. */
  const [rootScrolling, setRootScrolling] = useState(false);
  const rootSettleTimer = useRef<number | undefined>(undefined);
  const handleRootScroll = () => {
    if (widgetsLayout !== 'scroll') return;
    setRootScrolling(true);
    window.clearTimeout(rootSettleTimer.current);
    rootSettleTimer.current = window.setTimeout(() => setRootScrolling(false), MOTION_SCROLL_SETTLE_MS);
  };
  useEffect(() => () => window.clearTimeout(rootSettleTimer.current), []);

  const chatColumn = (
    <ChatRoot
      {...dropProps}
      className={`ds-chat-widget ${renderThreads ? 'ds-chat-widget--with-threads' : ''}`}
      data-compact={compact || undefined}
      data-phone={phone || undefined}
      data-widgets={widgetsNode ? widgetsLayout : undefined}
      data-widgets-wide={widgetsNode && widgetsWidth === 'wide' ? '' : undefined}
      data-scrolling={(widgetsNode && widgetsLayout === 'scroll' && rootScrolling) || undefined}
      onScroll={handleRootScroll}
      /* With a trailing panel up the header carries neither the controls
         nor their spacer, so the row has to be told to keep the height they
         were giving it. */
      data-lifted-actions={trailingInline || undefined}
      /* Escape steps out of the takeover first; the host's own Escape
         handling (closing the panel) takes over once back in panel view. */
      onKeyDown={(e: React.KeyboardEvent) => {
        /* A rail sheet is the topmost layer, so Escape settles it before
           the takeover or the host panel hear anything: one layer per press. */
        if (
          e.key === 'Escape' &&
          (threadsOpen || (asideShown && !asideWide) || (artifactShown && !asideWide))
        ) {
          e.stopPropagation();
          if (threadsOpen) closeThreads();
          else if (artifactShown) closeArtifactPanel();
          else closeAside();
          return;
        }
        if (e.key === 'Escape' && isFull) {
          e.stopPropagation();
          setView('panel');
        }
      }}
      /* On the welcome screen the whole panel is an invitation to type, so a
         click on its dead space lands focus in the composer, unless it hit a
         real control, or the visitor was selecting the greeting text. */
      onClick={(e: React.MouseEvent) => {
        if (!isEmpty) return;
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input, textarea, [role='button']")) return;
        if (window.getSelection()?.toString()) return;
        focusComposer();
      }}
    >
      <div className="ds-chat-widget__top">
        <ChatHeader
          title={
            <span className="ds-chat-widget__brand">
              {renderThreads && !threadsInline && (
                <CircularButton
                  icon="menu"
                  variant="tertiary"
                  ariaLabel="Open the chat history"
                  tooltipPosition="bottom"
                  onClick={() => setThreadsOpen(true)}
                />
              )}
              {logo && <img src={logo} alt="" width={20} height={20} />}
              <span className="ds-chat-widget__brand-name">{title}</span>
            </span>
          }
          actions={
            /* With the agent rail seated inline the cluster moves to the
               widget's own right edge (see headerActions). */
            !actionsFloat ? (
              headerActions
            ) : trailingInline ? undefined : (
              <span
                className="ds-chat-widget__actions-spacer"
                style={{ '--ds-chat-action-count': actionCount } as React.CSSProperties}
                aria-hidden="true"
              />
            )
          }
        />

        {tabsNode && <div className="ds-chat-widget__tabs-row">{tabsNode}</div>}

        <div className="ds-chat-widget__body">
          <ArtifactSeatContext.Provider value={artifacts}>
          <ChatThread className="ds-chat-widget__thread" flow={flow}>
            {/* One array, so the live turn and its committed form match by
                key: split expressions are separate children slots and React
                would remount across them. */}
            {[
              ...turns.map((turn) =>
                turn.bare ? (
                  /* Conversation furniture (a day marker): the injected
                     content stands alone in the thread, no message chrome. */
                  <div key={turn.id}>{turn.content}</div>
                ) : turn.role === 'user' ? (
                  /* Files ride above the bubble on the sender's side; a turn
                     of files alone draws no bubble. */
                  <ChatMessage
                    key={turn.id}
                    role="user"
                    attachments={
                      turn.attachments ? (
                        <AttachmentGroup align="end" items={turn.attachments} />
                      ) : (
                        <>
                          {turn.content}
                          {turn.card && <TurnCard card={turn.card} />}
                        </>
                      )
                    }
                  >
                    {turn.reply ? (
                      <ReplyBody reply={turn.reply} text={turn.text} />
                    ) : mentions && turn.text ? (
                      <MentionText text={turn.text} sources={mentions} />
                    ) : (
                      turn.text
                    )}
                  </ChatMessage>
                ) : (
                  <AssistantTurn key={turn.id} turn={turn} />
                )
              ),
              ...(live ? [<AssistantTurn key={live.id} live={live} />] : []),
            ]}
          </ChatThread>
          </ArtifactSeatContext.Provider>

          {/* Welcome greeting: an overlay on the empty thread, sitting just
              above the centred composer; centred in the empty thread on a
              phone, where the composer is pinned to the bottom. */}
          {isEmpty && (
            <div className="ds-chat-widget__welcome">
              <div className="ds-chat-widget__greeting">
                {/* Nameless by design: the widget cannot know who it is
                    greeting, only when. */}
                <p className="ds-chat-widget__hello">{greeting}</p>
                <p className="ds-chat-widget__ask">{tagline}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phone welcome: the starters lead the composer, so the chips sit
          between the greeting and the input rather than between the input
          and the keyboard. */}
      {phone && startersNode}
      {phone && widgetsLayout === 'fit' && widgetsNode}

      <footer className="ds-chat-widget__footer">
        <div className="ds-chat-widget__composer">
          <Composer
            ref={composerRef}
            placeholder={questionsOpen ? questionsPlaceholder : placeholder}
            disabled={questionsOpen}
            sendLabel="Send"
            aiGlow
            value={draft}
            onValueChange={setDraft}
            onSubmit={handleSubmit}
            streaming={streaming}
            onStop={stop}
            context={contextLabel ? <>Looking at “{contextLabel}”</> : undefined}
            contextIcon="description"
            contextPlacement="above"
            mentions={mentions}
            {...(fileAttachments
              ? {
                  files: queue.items,
                  onFilesSelected: queue.add,
                  onFileRemove: queue.remove,
                  pasteThreshold: LONG_PASTE_CHARS,
                  onPasteAsAttachment: (text: string) => queue.addText(text),
                }
              : {})}
            actions={
              /* A host can slot its own leading actions. The default is the
                 model picker over the host's model list: the pick rides on
                 the next send, the server clamps it to the day's budget, and
                 the selection follows the server's default until the visitor
                 chooses. */
              composerActions ??
              (pickerModels.length > 0 ? (
                <ModelPicker
                  models={pickerModels}
                  value={pickerValue}
                  onValueChange={setChosenModel}
                  placement="top"
                  aria-label="Choose a model"
                />
              ) : undefined)
            }
          />
        </div>
      </footer>

      {/* The bottom region: starters at its top, disclaimer pinned to its
          bottom in every state. Grown while the chat is empty (centring the
          composer), collapsing on the first utterance. */}
      <div
        className={`ds-chat-widget__bottom ${isEmpty ? 'ds-chat-widget__bottom--welcome' : ''} ${
          widgetsNode ? 'ds-chat-widget__bottom--widgets' : ''
        }`}
      >
        {!phone && startersNode}
        {(!phone || widgetsLayout === 'scroll') && widgetsNode}
        {disclaimer && (
          <div className="ds-chat-widget__disclaimer-row">
            <p className="ds-chat-widget__disclaimer">{disclaimer}</p>
          </div>
        )}
      </div>
    </ChatRoot>
  );

  if (!hasRails) return chatColumn;

  /* With a rail on either edge, the widget becomes a row: the history (or,
     narrow, the hamburger-summoned sheet) leading, the agent rail (or,
     narrow, the bottom sheet the header button raises) trailing, the
     conversation between them. */
  return (
    <div
      ref={railsHostRef}
      className="ds-chat-widget__rails"
      data-artifact-expanded={artifactExpanded || undefined}
      data-artifact-sized={artifactWidth !== null || artifactResizing || undefined}
      data-artifact-resizing={artifactResizing || undefined}
      style={
        artifactWidth !== null
          ? ({ '--ds-chat-artifact-width': `${artifactWidth}px` } as React.CSSProperties)
          : undefined
      }
      onKeyDown={(event) => {
        /* Expanded, the conversation is off stage and cannot hear the key:
           Escape steps the artifact back beside it. */
        if (event.key === 'Escape' && artifactExpanded) {
          event.stopPropagation();
          setArtifactExpanded(false);
        }
      }}
    >
      {renderThreads && threadsInline && (
        <div className="ds-chat-widget__threads-rail">
          {renderThreads({ overlay: false, close: closeThreads })}
        </div>
      )}
      {chatColumn}
      {/* The widget's controls at the widget's edge, floating over the
          rail's top inset, which is empty by construction. Ahead of the rail
          in the DOM as well as above it on screen, so the keyboard reaches
          the card's own controls before the panel's contents. */}
      {actionsFloat && (
        <div className="ds-chat-widget__rail-actions">{headerActions}</div>
      )}
      {/* The inline pane stays mounted while the widget is wide enough to
          seat it, so opening and closing can glide (ChatWidget.css owns the
          choreography); closed, it is inert and hidden from assistive
          technology, the same contract as the sheet below. */}
      {renderAside && asideWide && (
        <div
          ref={asideRailRef}
          className={`ds-chat-widget__aside-rail ${asideShown ? 'ds-chat-widget__aside-rail--open' : ''}`}
          id={asideId}
          inert={!asideShown || undefined}
        >
          <div className="ds-chat-widget__aside-rail-inner">{renderAside({ overlay: false, close: closeAside })}</div>
        </div>
      )}
      {/* The artifact's inline seat: mounted while the widget is wide enough
          to hold it, so opening and closing can glide; closed, it is inert
          and out of the accessibility tree, the aside rail's contract. */}
      {/* The size grip: a zero-width seat on the card's leading edge, its
          grab zone straddling the border. Not offered expanded, where there
          is no conversation to trade room with. */}
      {artifactInline && !artifactExpanded && (
        <div
          className={`ds-chat-widget__artifact-grip ${artifactResizing ? 'ds-chat-widget__artifact-grip--resizing' : ''}`}
          aria-hidden="true"
          onPointerDown={beginArtifactResize}
          onPointerMove={moveArtifactResize}
          onPointerUp={endArtifactResize}
          onPointerCancel={endArtifactResize}
        />
      )}
      {artifacts && asideWide && (
        <div
          ref={artifactRailRef}
          className={`ds-chat-widget__artifact-rail ${artifactShown ? 'ds-chat-widget__artifact-rail--open' : ''}`}
          id={artifactId}
          inert={!artifactShown || undefined}
        >
          <div className="ds-chat-widget__artifact-rail-inner">
            <ChatArtifactPane
              artifact={heldArtifact}
              expanded={artifactExpanded}
              onExpandedChange={setArtifactExpanded}
              onClose={closeArtifactPanel}
            />
          </div>
        </div>
      )}
      {artifacts && !asideWide && (
        <div
          className={`ds-chat-widget__aside-overlay ${
            artifactShown ? 'ds-chat-widget__aside-overlay--open' : ''
          }`}
        >
          <button
            type="button"
            className="ds-chat-widget__rail-scrim"
            aria-label="Close the artifact panel"
            tabIndex={artifactShown ? 0 : -1}
            onClick={closeArtifactPanel}
          />
          <div
            className="ds-chat-widget__aside-sheet ds-chat-widget__aside-sheet--artifact"
            id={artifactId}
          >
            <span className="ds-chat-widget__aside-grabber" aria-hidden="true" />
            <div className="ds-chat-widget__aside-sheet-body">
              <ChatArtifactPane artifact={heldArtifact} onClose={closeArtifactPanel} />
            </div>
          </div>
        </div>
      )}
      {renderThreads && !threadsInline && (
        <div
          className={`ds-chat-widget__threads-overlay ${
            threadsOpen ? 'ds-chat-widget__threads-overlay--open' : ''
          }`}
        >
          <button
            type="button"
            className="ds-chat-widget__rail-scrim"
            aria-label="Close the chat history"
            tabIndex={threadsOpen ? 0 : -1}
            onClick={closeThreads}
          />
          <div className="ds-chat-widget__threads-sheet">
            {renderThreads({ overlay: true, close: closeThreads })}
          </div>
        </div>
      )}
      {renderAside && !asideWide && (
        <div
          className={`ds-chat-widget__aside-overlay ${
            asideShown ? 'ds-chat-widget__aside-overlay--open' : ''
          }`}
        >
          <button
            type="button"
            className="ds-chat-widget__rail-scrim"
            aria-label="Close the agent panel"
            tabIndex={asideShown ? 0 : -1}
            onClick={closeAside}
          />
          <div className="ds-chat-widget__aside-sheet" id={asideId}>
            {/* The grabber is the mark that says "sheet", not a handle:
                dragging is the scrim's and the Escape key's job here. */}
            <span className="ds-chat-widget__aside-grabber" aria-hidden="true" />
            <div className="ds-chat-widget__aside-sheet-body">
              {renderAside({ overlay: true, close: closeAside })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
