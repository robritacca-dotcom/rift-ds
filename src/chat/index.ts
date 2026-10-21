/**
 * rift-ds/chat: the composed chat widget and the engine under it.
 *
 * The widget: ChatProvider (the state), ChatWidget (the surface), ChatLauncher
 * (the floating button and the docked / overlay / floating / takeover panel).
 * The engine, importable on its own under your own markup: useChat, the
 * transports, useThreads, and the event contract. The server half lives in
 * rift-ds/chat/server; a scripted conversation for previews in
 * rift-ds/chat/demo.
 *
 * Hand-written, unlike the component barrels: the registry generator never
 * reaches src/chat, and this file is the one place the widget's public
 * surface is declared (src/chat/registry.json names the same exports for the
 * documentation, and validate-chat-widget.mjs holds the two together).
 */
export { ChatProvider, type ChatProviderProps } from './ChatProvider';
export { ChatWidget, type ChatWidgetProps, type ChatAgentOptions, type RailSlot } from './ChatWidget';
export { ChatLauncher, CHAT_PANEL_ID, type ChatLauncherProps } from './ChatLauncher';
export { ChatThreads, type ChatThreadsProps } from './ChatThreads';
export { ChatTabs, type ChatTabsProps } from './ChatTabs';
export { ChatAgentPane, type ChatAgentPaneProps } from './ChatAgentPane';
export { ChatArtifactPane, type ChatArtifactPaneProps } from './ChatArtifactPane';
export { ChatArtifactCard, type ChatArtifactCardProps } from './ChatArtifactCard';
export {
  useChatWidget,
  isInternalPath,
  createFeedbackPoster,
  type ChatView,
  type ChatArtifactRenderers,
  type ChatCardRenderers,
  type ChatLinkRenderer,
  type ChatWidgetContextValue,
  type FeedbackSink,
} from './context';
export {
  DOCK_QUERY,
  TAKEOVER_QUERY,
  THREADS_RAIL_MIN_WIDTH,
  ASIDE_RAIL_MIN_WIDTH,
  ARTIFACT_MIN_COLUMN_WIDTH,
  ASIDE_WITH_THREADS_MIN_WIDTH,
  useTakeoverViewport,
} from './queries';
export {
  useChat,
  DEFAULT_PLACEHOLDER_COPY,
  type ChatState,
  type ChatPlaceholderCopy,
} from './useChat';
export { useThreads, THREAD_NAMING_DELAY_MS, type ThreadsLabels, type ThreadsOptions, type ThreadsState } from './threads';
export {
  createFetchTransport,
  DEFAULT_FETCH_COPY,
  FIRST_BYTE_TIMEOUT_MS,
  MAX_TRANSPORT_TURNS,
  type FetchTransportOptions,
  type FetchTransportCopy,
} from './transport';
export {
  scriptChat,
  createSimTransport,
  defaultFilesReply,
  DEFAULT_FALLBACK_REPLY,
  DEFAULT_SIM_TIMING,
  type ChatScript,
  type ChatScriptBuilder,
  type ScriptNode,
  type ScriptStep,
  type ScriptedReply,
  type SimTiming,
} from './sim';
export {
  createFollowupsFetcher,
  followupTarget,
  pickFallbackFollowups,
  DEFAULT_FALLBACK_FOLLOWUPS,
  MAX_FOLLOWUPS,
  FOLLOWUPS_TIMEOUT_MS,
  type FollowupsSource,
} from './followups';
export { SUGGESTION_MAX_CHARS, fitsChip } from './suggestions';
export {
  sanitizeQuestionSet,
  describeAnswers,
  serializeReply,
  isBlockingQuestion,
  ASK_USER_INPUT_SCHEMA,
  MAX_QUESTIONS,
  MAX_QUESTION_OPTIONS,
  MIN_QUESTION_OPTIONS,
  QUESTION_PROMPT_MAX_CHARS,
  OPTION_DESCRIPTION_MAX_CHARS,
} from './questions';
export {
  STARTER_COUNT,
  pickStarters,
  namedStarter,
  hashString,
  mulberry32,
} from './starters';
export {
  greetingFor,
  readGreeting,
  serverGreeting,
  subscribeClock,
  DEFAULT_GREETING_COPY,
  type GreetingCopy,
} from './greeting';
export {
  CHAT_PLACEMENTS,
  chatPlacement,
  DOCK_MIN_WIDTH,
  DOCK_MAX_WIDTH,
  FLOAT_MAX_SCALE,
  FLOAT_EDGE_GAP,
  dockWidthFromDrag,
  isFloatDragStart,
  clampFloatPosition,
  type ChatPlacement,
  type ChatSide,
} from './placement';
export { artifactCard, cardArtifact } from './artifacts';
export {
  ARTIFACT_CARD_KIND,
  CHAT_EVENT_KINDS,
  type ChatArtifact,
  type ChatCard,
  type ChatEvent,
  type ChatQuestion,
  type ChatQuestionAnswer,
  type ChatQuestionSet,
  type ChatReply,
  type ChatTransport,
  type ChatTransportMessage,
  type ChatTurn,
  type ChatModelOption,
  type ChatFeedbackVerdict,
  type LivePhase,
  type LiveResponse,
  type Starter,
} from './types';
export { chatWidget, chatWidgetRegistry, WIDGET_COUNT, type ChatWidgetMeta } from './registry';
