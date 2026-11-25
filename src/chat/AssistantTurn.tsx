'use client';

import { createContext, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentStatus } from '../components/AgentStatus/AgentStatus';
import type { CodeBlockProps } from '../components/CodeBlock/CodeBlock';
import { MarkdownCode, MarkdownScrollTable, type MarkdownCodeProps } from '../markdown/mappers';
import { ChatMessage } from '../components/ChatMessage/ChatMessage';
import { Prose } from '../components/Prose/Prose';
import type { PromptSuggestionsProps } from '../components/PromptSuggestions/PromptSuggestions';
import type { QuestionCardLabels } from '../components/QuestionCard/QuestionCard';
import { Reasoning } from '../components/Reasoning/Reasoning';
import { TurnIdContext } from './awaiting';
import { useChatWidget } from './context';
import { DOCK_QUERY } from './queries';
import { FollowupSuggestions } from './FollowupSuggestions';
import { ResponseActions } from './ResponseActions';
import { turnCards } from './artifacts';
import { TurnCard } from './TurnContent';
import { TurnQuestion } from './TurnQuestion';
import type { ChatTurn, LiveResponse } from './types';

/** The words an assistant turn's parts write, set from ChatWidget's label props. Every key left out keeps the part's English. */
export interface AssistantTurnLabels {
  /** The fenced-code CodeBlocks in a reply; `codeLabel` is given the fence's language. */
  codeBlock?: Pick<CodeBlockProps, 'copyLabel' | 'copyText' | 'copiedLabel'> & {
    codeLabel?: (language: string | undefined) => string;
  };
  /** The reasoning disclosure's summary once thinking is over, given the seconds it took when known. */
  reasoning?: (durationSeconds: number | undefined) => string;
  /** The status line while a card in the reply waits on the reader's Confirm. Defaults to "Waiting for approval". */
  awaitingApproval?: string;
  /** The question card a reply ends in. */
  questionCard?: Partial<QuestionCardLabels>;
  /** The follow-up row's hidden "(chosen)" text. */
  promptSuggestions?: Pick<PromptSuggestionsProps, 'chosenLabel'>;
}

/* The line's English, used for every label the host leaves out. */
const DEFAULT_REASONING_LABEL = (durationSeconds: number | undefined) =>
  durationSeconds !== undefined ? `Thought for ${durationSeconds}s` : 'Thought process';
const DEFAULT_AWAITING_APPROVAL_LABEL = 'Waiting for approval';

/* The code blocks are drawn by react-markdown through a module-level
   components map, so their labels arrive by context rather than props. */
const CodeBlockLabelsContext = createContext<AssistantTurnLabels['codeBlock']>(undefined);

/**
 * Internal links navigate through the host's link renderer, so a panel
 * mounted from a root layout survives the trip and the conversation keeps
 * going beside the new page. When the panel covers the page (fullscreen
 * view, or any viewport below the dock threshold), navigating behind it
 * would be invisible, so following a link closes the chat first.
 */
function MarkdownLink({ href, children }: React.ComponentPropsWithoutRef<'a'>) {
  const { view, setOpen, renderLink, isInternalHref } = useChatWidget();
  if (!href || !isInternalHref(href)) return <>{children}</>;
  return (
    <>
      {renderLink({
        href,
        children,
        onNavigate: () => {
          if (view === 'full' || !window.matchMedia(DOCK_QUERY).matches) setOpen(false);
        },
      })}
    </>
  );
}

/* Fenced code and tables are drawn by the shared markdown mappers
   (rift-ds/markdown), so a reply's code is one click from the clipboard and
   a wide table is reachable from the keyboard, the same way any other
   rendered markdown in the system is. The code block's labels arrive by
   context, since react-markdown calls a module-level components map. */
function MarkdownPre(props: MarkdownCodeProps) {
  const labels = useContext(CodeBlockLabelsContext);
  return <MarkdownCode {...props} labels={labels} />;
}

const markdownComponents = {
  a: MarkdownLink,
  pre: MarkdownPre,
  table: MarkdownScrollTable,
};

/* One component for the assistant turn in both states. The live turn and
   its committed form share an id (and so a key), so React reconciles the
   finished response in place: separate components remounted the whole
   subtree at commit, which read as a flicker after the response rendered. */
export function AssistantTurn({
  turn,
  live,
  labels,
}: {
  turn?: ChatTurn;
  live?: LiveResponse;
  labels?: AssistantTurnLabels;
}) {
  const thinking = live?.phase === 'thinking';
  const tracePoints = live ? live.tracePoints : (turn?.tracePoints ?? []);
  const durationSeconds = live ? live.durationSeconds : turn?.durationSeconds;
  const text = live ? live.text : (turn?.text ?? '');
  /* A reply's rich content and card draw as soon as the transport sends
     them, so a tool's result shows while the prose still streams. */
  const content = live ? live.content : turn?.content;
  const source = live ?? turn;
  const allCards = source ? turnCards(source) : [];
  /* A lead card is the host's opening, drawn first under the status line.
     So nothing above it moves, the line stays one row for the whole reply:
     the trace opens only when the reader asks, and the line stays on as the
     summary once the thinking is over, trace or none. */
  const leadCards = allCards.filter((card) => card.lead);
  const cards = allCards.filter((card) => !card.lead);
  const led = leadCards.length > 0;
  /* Every reply that had a thinking phase keeps the line: live while it
     thinks, then the tick and how long it took, trace or none, so the line
     is a fixed part of a reply rather than something that comes and goes.
     A turn the host seeded never thought, has no duration, and gets none. */
  const showReasoning =
    thinking || tracePoints.length > 0 || led || durationSeconds !== undefined;

  /* Whether this turn's follow-up questions are still being generated: the
     request fires when a backend answer commits (see ChatProvider) and lands
     as the `followups` field (an empty array when there was nothing to
     offer), so "eligible but unset" is the in-flight window. Shown only
     while this is the newest turn and nothing new is streaming: once the
     visitor has moved on, a late resolution just appears, and a shimmer
     under an old answer would pull the eye backwards. */
  const { turns, live: liveTurn, freshFollowupsId, awaiting: awaitingCards } = useChatWidget();
  /* Whether a card in this reply waits on the reader (a proposed change with
     Confirm still to press), read from the provider's one record so the line
     and the chat's opener always agree. */
  const turnId = (live ?? turn)?.id ?? null;
  let awaiting = false;
  for (const id of awaitingCards.values()) if (id === turnId) awaiting = true;
  const followupsPending =
    !!turn &&
    turn.text !== '' &&
    !!turn.exchangeId &&
    !turn.followups &&
    !turn.question &&
    !liveTurn &&
    turns[turns.length - 1]?.id === turn.id;

  return (
    <ChatMessage
      role="assistant"
      /* Only a committed turn gets the row: while streaming there is nothing
         final to copy or judge, and an empty turn has nothing to act on.
         Pinned visible: in a chat panel the actions are part of the response,
         not a hover affordance to discover. */
      showActions
      actions={turn && turn.text !== '' ? <ResponseActions turn={turn} /> : undefined}
      /* Where the conversation could go next, under the actions row. They
         arrive a beat after the answer commits, and the row shimmers in their
         place while they are generated. */
      footer={
        turn?.followups?.length ? (
          <FollowupSuggestions
            turnId={turn.id}
            suggestions={turn.followups}
            chosen={turn.followupChosen}
            /* Only the row whose suggestions just landed pops its chips in;
               a row remounted by closing and reopening the panel shows them
               standing: they already arrived once. */
            entrance={turn.id === freshFollowupsId}
            chosenLabel={labels?.promptSuggestions?.chosenLabel}
          />
        ) : followupsPending && turn ? (
          <FollowupSuggestions turnId={turn.id} suggestions={[]} pending />
        ) : undefined
      }
    >
      <TurnIdContext.Provider value={turnId}>
      <div className="ds-chat-widget__response">
        {/* The line stays for the whole reply. Until a trace point arrives
            there is nothing behind it, so it renders as a plain status: no
            chevron, nothing to open. */}
        {showReasoning && (
          <Reasoning
            /* Under a lead card the trace is never streaming, so it never
               opens by itself: it opens only on the reader's toggle, while
               the live AgentStatus below keeps the line moving. */
            streaming={thinking && !led}
            summaryOnly={tracePoints.length === 0}
            duration={durationSeconds}
            /* One AgentStatus owns the line for the whole reply, so the
               moment the thinking ends its matrix draws the tick (the cross
               when the reply failed) and its
               label glides from the last step to the summary, and both
               stay: the tick is the line's mark from then on. While a card
               in the reply waits on Confirm, the line is the prompt and
               says so instead, and settles to the tick once it is answered. */
            summary={
              thinking && live ? (
                <AgentStatus state="working" label={live.statusLabel} />
              ) : awaiting ? (
                <AgentStatus state="waiting" label={labels?.awaitingApproval ?? DEFAULT_AWAITING_APPROVAL_LABEL} />
              ) : (
                <AgentStatus
                  state={source?.outcome === 'failed' ? 'error' : 'done'}
                  className="ds-chat-widget__thought"
                  label={(labels?.reasoning ?? DEFAULT_REASONING_LABEL)(durationSeconds)}
                />
              )
            }
          >
            {tracePoints.length > 0 && (
              <ul>
                {tracePoints.map((point, index) => (
                  <li key={`${index}-${point.slice(0, 24)}`}>{point}</li>
                ))}
              </ul>
            )}
          </Reasoning>
        )}
        {/* Rich content (a tool call, a card) sits where an agent's
            structured output belongs: after the reasoning, before the prose
            that reads off what it shows. */}
        {leadCards.map((card, index) => (
          <TurnCard key={`lead-${index}`} card={card} />
        ))}
        {content}
        {cards.map((card, index) => (
          <TurnCard key={index} card={card} />
        ))}
        {text !== '' && (
          <CodeBlockLabelsContext.Provider value={labels?.codeBlock}>
          <Prose>
            {/* gfm: a real model emits tables and strikethrough, which plain
                CommonMark renders as literal pipes and tildes. */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {text}
            </ReactMarkdown>
          </Prose>
          </CodeBlockLabelsContext.Provider>
        )}
        {/* The answers to what the prose just asked sit straight under it,
            above the actions row: they are part of the reply. */}
        {turn?.question && <TurnQuestion turn={turn} labels={labels?.questionCard} />}
      </div>
      </TurnIdContext.Provider>
    </ChatMessage>
  );
}
