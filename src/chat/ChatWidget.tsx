'use client';

import {
  useEffect,
  useId,
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
import { Composer } from '../components/Composer/Composer';
import { DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
import { MentionText, type MentionSource } from '../components/Mention/Mention';
import { ModelPicker } from '../components/ModelPicker/ModelPicker';
import { PromptSuggestions } from '../components/PromptSuggestions/PromptSuggestions';
import { MOTION_SCROLL_SETTLE_MS, MOTION_SUGGESTIONS_THINK_MS } from '../tokens/motion';
import { AssistantTurn } from './AssistantTurn';
import { ChatAgentPane } from './ChatAgentPane';
import { ChatTabs } from './ChatTabs';
import { ChatThreads, type ChatThreadsProps } from './ChatThreads';
import { useChatWidget } from './context';
import { readGreeting, serverGreeting, subscribeClock } from './greeting';
import { CHAT_PLACEMENTS, chatPlacement } from './placement';
import { ASIDE_RAIL_MIN_WIDTH, THREADS_RAIL_MIN_WIDTH } from './queries';
import { fitsChip } from './suggestions';
import { TurnCard } from './TurnContent';
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

/** A rail slot: the widget's own panel, or a render prop for a custom one. */
export type RailSlot = boolean | ((ctx: { overlay: boolean; close: () => void }) => ReactNode);

/** What the built-in agent pane shows. */
export interface ChatAgentOptions {
  /** The agent's portrait block. Defaults to the widget's title with a "Connected" status. */
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
  /** The composer's placeholder text. */
  placeholder?: string;
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
  placeholder = 'Ask anything',
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
  } = useChatWidget();

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
  const focusComposer = () => composerRef.current?.focus();
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
            profile={agent.profile ?? { name: title, status: 'Connected' }}
            tabs={agent.tabs}
            overlay={ctx.overlay}
          />
        )
      : undefined);
  const tabsNode = tabs === true ? <ChatTabs /> : tabs || null;

  const hasRails = Boolean(renderThreads || renderAside);
  const [threadsOpen, setThreadsOpen] = useState(false);
  /* One piece of state for the agent panel, resting closed: it is the same
     panel in either seat, and it only ever opens because someone asked. The
     seat decides how it is drawn, never whether it is up. */
  const [asideOpen, setAsideOpen] = useState(Boolean(agent?.defaultOpen));
  const railsHostRef = useRef<HTMLDivElement | null>(null);
  const [threadsWide, setThreadsWide] = useState(false);
  const [asideWide, setAsideWide] = useState(false);
  /* Only the crossing matters, not every measurement. */
  const wasAsideWideRef = useRef(false);
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
      /* Growing into rail territory retires the sheet, so it cannot pop
         back open on a later trip below the breakpoint. */
      if (wide) setThreadsOpen(false);
      /* Leaving rail territory closes the agent panel rather than handing
         it to the other seat; growing back in does not reopen it. The panel
         opens on a click and nothing else. */
      if (wasAsideWideRef.current && !asideRoom) setAsideOpen(false);
      wasAsideWideRef.current = asideRoom;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [hasRails]);
  const closeThreads = () => setThreadsOpen(false);

  /* One panel, two seats. `asideShown` is what the visitor can actually see,
     so it drives the toggle, the header button and the Escape order alike. */
  const asideId = useId();
  const asideShown = Boolean(renderAside) && asideOpen;
  const closeAside = () => setAsideOpen(false);
  const toggleAside = () => setAsideOpen((current) => !current);

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

  /* The widget's own controls. They live in the chat header normally, and
     move to the card's right edge while the agent rail is seated inline:
     every one of them acts on the whole widget, so a cluster stranded
     mid-card above the conversation column reads as the column's chrome
     instead. The buttons self-label with tooltips, opening downward because
     the header hugs the panel's clipped top edge. */
  const headerActions = (
    <>
      {/* With the inline threads rail showing, its own new-thread row is the
          one New chat: a second pen in the header would be the same action
          twice. */}
      {!(renderThreads && threadsWide) && (
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
          icon="smart_toy"
          variant="tertiary"
          className={asideShown ? 'ds-chat-widget__agent-toggle--on' : undefined}
          ariaLabel={asideShown ? 'Hide the agent panel' : 'Show the agent panel'}
          tooltipPosition="bottom"
          aria-expanded={asideShown}
          aria-controls={asideShown ? asideId : undefined}
          onClick={toggleAside}
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
      /* The header's controls have moved out to the card's edge, so the row
         has to be told to keep the height they were giving it. */
      data-lifted-actions={(asideShown && asideWide) || undefined}
      /* Escape steps out of the takeover first; the host's own Escape
         handling (closing the panel) takes over once back in panel view. */
      onKeyDown={(e: React.KeyboardEvent) => {
        /* A rail sheet is the topmost layer, so Escape settles it before
           the takeover or the host panel hear anything: one layer per press. */
        if (e.key === 'Escape' && (threadsOpen || (asideShown && !asideWide))) {
          e.stopPropagation();
          if (threadsOpen) closeThreads();
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
              {renderThreads && !threadsWide && (
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
            asideShown && asideWide ? undefined : headerActions
          }
        />

        {tabsNode && <div className="ds-chat-widget__tabs-row">{tabsNode}</div>}

        <div className="ds-chat-widget__body">
          <ChatThread className="ds-chat-widget__thread">
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
                    {mentions && turn.text ? (
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
            placeholder={placeholder}
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
    <div ref={railsHostRef} className="ds-chat-widget__rails">
      {renderThreads && threadsWide && (
        <div className="ds-chat-widget__threads-rail">
          {renderThreads({ overlay: false, close: closeThreads })}
        </div>
      )}
      {chatColumn}
      {/* The widget's controls at the widget's edge, floating over the
          rail's top inset, which is empty by construction. Ahead of the rail
          in the DOM as well as above it on screen, so the keyboard reaches
          the card's own controls before the panel's contents. */}
      {asideShown && asideWide && (
        <div className="ds-chat-widget__rail-actions">{headerActions}</div>
      )}
      {renderAside && asideWide && asideOpen && (
        <div className="ds-chat-widget__aside-rail" id={asideId}>
          {renderAside({ overlay: false, close: closeAside })}
        </div>
      )}
      {renderThreads && !threadsWide && (
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
            asideOpen ? 'ds-chat-widget__aside-overlay--open' : ''
          }`}
        >
          <button
            type="button"
            className="ds-chat-widget__rail-scrim"
            aria-label="Close the agent panel"
            tabIndex={asideOpen ? 0 : -1}
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
