'use client';

import { useEffect, useRef } from 'react';
import {
  QuestionCard,
  QuestionSummary,
  type QuestionCardLabels,
} from '../components/QuestionCard/QuestionCard';
import { useChatWidget } from './context';
import { isBlockingQuestion } from './questions';
import type { ChatReply, ChatTurn } from './types';

/**
 * The questions an assistant turn asks, drawn under its prose. Live only
 * while the turn is the newest and nothing is streaming: once the
 * conversation moves on without an answer the card stays as it was offered,
 * inert, so the transcript still shows what was asked.
 */
export function TurnQuestion({
  turn,
  labels,
}: {
  turn: ChatTurn;
  /** The card's words, merged over QuestionCard's English defaults. */
  labels?: Partial<QuestionCardLabels>;
}) {
  const { turns, live, answerQuestion, skipQuestion } = useChatWidget();
  const set = turn.question;
  const newest = turns[turns.length - 1]?.id === turn.id;
  const blocking = newest && isBlockingQuestion(turn, live !== null);
  const ref = useRef<HTMLDivElement>(null);

  /* A set holds the composer, so focus goes where the input now is: the
     first option. Only on arrival, never on a later render. */
  useEffect(() => {
    if (!blocking) return;
    ref.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!set) return null;
  return (
    <QuestionCard
      ref={ref}
      className="ds-chat-widget__question"
      labels={labels}
      questions={set.questions}
      values={turn.answers}
      disabled={turn.answers === undefined && (!newest || live !== null)}
      onValuesChange={(answers) => answerQuestion(turn.id, answers)}
      onSkip={blocking ? () => skipQuestion(turn.id) : undefined}
    />
  );
}

/**
 * A user turn that answered a set of questions: each question over its
 * answers. One question, with one pick or several, stays the ordinary
 * bubble, its picks joined with commas.
 */
export function ReplyBody({
  reply,
  text,
  missingLabel,
}: {
  reply?: ChatReply;
  text: string;
  /** What stands in for a question left without an answer. Defaults to QuestionSummary's "No answer". */
  missingLabel?: string;
}) {
  /* One question, however many picks, reads as its answers in a line: the
     plain text the model receives, commas and all. */
  if (!reply || reply.items.length === 1) return <>{text}</>;
  /* The same summary QuestionCard folds a set to, frameless inside the
     bubble: the question and the reply read as one pattern. */
  return <QuestionSummary variant="plain" items={reply.items} missingLabel={missingLabel} />;
}
