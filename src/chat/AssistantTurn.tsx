'use client';

import { createContext, useContext } from 'react';
import ReactMarkdown, { type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentStatus } from '../components/AgentStatus/AgentStatus';
import { CodeBlock, type CodeBlockProps } from '../components/CodeBlock/CodeBlock';
import { ChatMessage } from '../components/ChatMessage/ChatMessage';
import { Prose } from '../components/Prose/Prose';
import type { PromptSuggestionsProps } from '../components/PromptSuggestions/PromptSuggestions';
import type { QuestionCardLabels } from '../components/QuestionCard/QuestionCard';
import { Reasoning } from '../components/Reasoning/Reasoning';
import { useChatWidget } from './context';
import { DOCK_QUERY } from './queries';
import { FollowupSuggestions } from './FollowupSuggestions';
import { ResponseActions } from './ResponseActions';
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
  /** The question card a reply ends in. */
  questionCard?: Partial<QuestionCardLabels>;
  /** The follow-up row's hidden "(chosen)" text. */
  promptSuggestions?: Pick<PromptSuggestionsProps, 'chosenLabel'>;
}

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

/* A fenced block's hast: a `pre` holding one `code` element whose text is
   the code plus the trailing newline the markdown-to-hast step appends. */
type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};
const hastText = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(hastText).join('');

/* Fenced code renders as the library CodeBlock, so an install command or a
   snippet the answer hands over is one click from the clipboard. The language
   comes from the fence's info string (```bash), when the model wrote one. */
function MarkdownPre({ node, children, ...props }: React.ComponentPropsWithoutRef<'pre'> & ExtraProps) {
  const { codeLabel, ...labels } = useContext(CodeBlockLabelsContext) ?? {};
  const code = (node as HastNode | undefined)?.children?.find(
    (child) => child.type === 'element' && child.tagName === 'code'
  );
  if (!code) return <pre {...props}>{children}</pre>;
  const classes = code.properties?.className;
  const language = (Array.isArray(classes) ? classes : [])
    .map(String)
    .find((name) => name.startsWith('language-'))
    ?.slice('language-'.length);
  return (
    <CodeBlock
      {...labels}
      codeLabel={codeLabel?.(language)}
      code={hastText(code).replace(/\n$/, '')}
      language={language}
    />
  );
}

/* A markdown table has a natural minimum width that a docked panel cannot
   meet, and the browser resolves that by breaking headings one letter per
   line. Prose makes the table its own scroll container so it stays readable,
   which leaves one thing only the renderer can supply: a scrollable region
   has to be reachable without a mouse, and Prose styles markup it does not
   render, so it cannot put `tabIndex` on the element itself. Never swap this
   for `role="region"` on the table: that replaces the table semantics. */
const markdownComponents = {
  a: MarkdownLink,
  pre: MarkdownPre,
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <table tabIndex={0} {...props}>
      {children}
    </table>
  ),
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
  const card = live ? live.card : turn?.card;

  /* Whether this turn's follow-up questions are still being generated: the
     request fires when a backend answer commits (see ChatProvider) and lands
     as the `followups` field (an empty array when there was nothing to
     offer), so "eligible but unset" is the in-flight window. Shown only
     while this is the newest turn and nothing new is streaming: once the
     visitor has moved on, a late resolution just appears, and a shimmer
     under an old answer would pull the eye backwards. */
  const { turns, live: liveTurn, freshFollowupsId } = useChatWidget();
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
      <div className="ds-chat-widget__response">
        {/* While thinking the disclosure carries the live status; once
            streaming, it stays only if a trace actually accumulated: an
            empty collapsed panel is noise. Until a trace point arrives there
            is nothing behind the line either, so it renders as a plain
            status: no chevron, nothing to open. */}
        {(thinking || tracePoints.length > 0) && (
          <Reasoning
            streaming={thinking}
            summaryOnly={tracePoints.length === 0}
            duration={durationSeconds}
            /* Thinking, the AgentStatus below owns the line; the label is
               the text that takes over once it is done. */
            label={labels?.reasoning && !thinking ? labels.reasoning(durationSeconds) : undefined}
            summary={
              thinking && live ? (
                <AgentStatus state="working" label={live.statusLabel} />
              ) : undefined
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
        {content}
        {card && <TurnCard card={card} />}
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
    </ChatMessage>
  );
}
