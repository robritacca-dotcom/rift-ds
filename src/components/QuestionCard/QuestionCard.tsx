'use client';

import React from 'react';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';
import './QuestionCard.css';
import '../../fonts/material-symbols.css';

/** One answer a question offers. */
export interface QuestionCardOption {
  /** Stable identifier reported in the answer's `values`. */
  value: string;
  /** The answer as the person would say it, e.g. "Next.js". One line. */
  label: string;
  /** A quiet second line under the label: what choosing it means. */
  description?: string;
}

/** One question the card asks. */
export interface QuestionCardQuestion {
  /** Stable identifier reported in the answer's `questionId`. */
  id: string;
  /** The question in a few words, e.g. "Which framework?". Shown as the step's heading in a set, and the options' accessible name always. */
  prompt: string;
  /** `single` takes one option, `multi` any number of them. */
  mode?: 'single' | 'multi';
  /** The answers on offer, in order. */
  options: QuestionCardOption[];
  /** Offer a last "Something else" row that opens a text field, for an answer the options do not hold. */
  other?: boolean;
  /** `multi` only: the fewest options that make an answer. Defaults to 1. */
  min?: number;
  /** `multi` only: the most options that can be picked. Defaults to all of them. */
  max?: number;
}

/** What the person answered to one question. */
export interface QuestionCardAnswer {
  /** The `id` of the question answered. */
  questionId: string;
  /** The `value` of every option picked, in the options' order. */
  values: string[];
  /** The text written in the "Something else" field, when it was used. */
  other?: string;
}

/** Every word the card draws itself, for a host writing in another voice or language. */
export interface QuestionCardLabels {
  /** The last row's label when `other` is set. */
  other: string;
  /** The placeholder of the field that row opens. */
  otherPlaceholder: string;
  /** The button that sends the answers. */
  submit: string;
  /** The button that moves to the next question in a set. */
  next: string;
  /** The button that moves back a question in a set. */
  back: string;
  /** The button that declines to answer, shown when `onSkip` is passed. */
  skip: string;
  /** The line an answered-by-skipping card shows. */
  skipped: string;
  /** The line a card shows when the moment to answer passed. */
  unanswered: string;
  /** The step count beside a set's heading. */
  step: (current: number, total: number) => string;
  /** The line above a one-answer question's options. */
  chooseOne: string;
  /** The line above a several-answer question's options, from its `min` and `max`. */
  chooseMany: (min: number, max: number, total: number) => string;
}


/** Props owned by QuestionCard itself — everything else falls through to the root element. */
type QuestionCardOwnProps = {
  /** The questions, asked one at a time when there is more than one. */
  questions: QuestionCardQuestion[];
  /**
   * The answers already given. When set, the card renders its answered
   * state and stops taking input: the options stay where they were, the
   * picked ones marked and the rest dimmed, so the record of the choice
   * stays in place. An empty array records a skip.
   */
  values?: QuestionCardAnswer[];
  /** Fires with every question's answer once the last one is given. */
  onValuesChange?: (answers: QuestionCardAnswer[]) => void;
  /** Fires when the person declines to answer. Its presence is what shows the Skip button. */
  onSkip?: () => void;
  /** The moment to answer has passed: the options stay on screen, dimmed and inert, under a line saying so. */
  disabled?: boolean;
  /** Replacement copy for the words the card draws itself. */
  labels?: Partial<QuestionCardLabels>;
  /** Additional CSS classes */
  className?: string;
};

export interface QuestionCardProps
  extends QuestionCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof QuestionCardOwnProps> {}

type Draft = { values: string[]; other: string; otherOpen: boolean };
const EMPTY_DRAFT: Draft = { values: [], other: '', otherOpen: false };

/** Whether a draft is a complete answer to its question. */
function isAnswered(question: QuestionCardQuestion, draft: Draft): boolean {
  const written = draft.otherOpen && draft.other.trim() !== '' ? 1 : 0;
  const count = draft.values.length + written;
  if (question.mode === 'multi') return count >= Math.max(1, question.min ?? 1);
  return count === 1;
}

function toAnswer(question: QuestionCardQuestion, draft: Draft): QuestionCardAnswer {
  const other = draft.otherOpen ? draft.other.trim() : '';
  /* Values in the options' order, whatever order they were tapped in, so
     the answer reads the way the question was laid out. */
  const values = question.options
    .map((option) => option.value)
    .filter((value) => draft.values.includes(value));
  return other ? { questionId: question.id, values, other } : { questionId: question.id, values };
}

/**
 * QuestionCard is how an agent asks the person something with answers it
 * can list: one question or a short set, each taking one option or several,
 * with an optional "Something else" for the answer the list missed.
 *
 * A single question with one answer is a tap: the option is the answer. A
 * question that takes several, and every question in a set, collects its
 * picks until the person sends them; a set steps through its questions one
 * at a time, with a count beside the heading and a way back.
 *
 * Answered, the card stays in the transcript as the record of the choice:
 * the picked options marked, the rest dimmed and inert. A set folds to a
 * short list of each question and its answer.
 *
 * Fully controlled: the card never stores the answer itself — `onValuesChange`
 * reports it and `values` renders it.
 */
export const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  (
    {
      questions,
      values: value,
      onValuesChange,
      onSkip,
      disabled = false,
      labels: labelsProp,
      className = '',
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-question-card';
    const labels = { ...DEFAULT_QUESTION_CARD_LABELS, ...labelsProp };
    const answered = value !== undefined;
    const live = !answered && !disabled;
    const isSet = questions.length > 1;
    const idBase = React.useId();

    const [step, setStepState] = React.useState(0);
    /* Moving between questions moves focus to the new question's first
       option: the button pressed to get there may be disabled on arrival
       (Next waits for an answer), and focus dropped to the page would
       strand a keyboard user outside the card. */
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const stepMovedRef = React.useRef(false);
    const setStep = (next: number) => {
      stepMovedRef.current = true;
      setStepState(next);
    };
    React.useEffect(() => {
      if (!stepMovedRef.current) return;
      stepMovedRef.current = false;
      rootRef.current?.querySelector<HTMLElement>('.ds-question-card__options button:not(:disabled)')?.focus();
    }, [step]);
    const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});
    const otherInputRef = React.useRef<HTMLInputElement>(null);
    /* Focus moves into the "Something else" field when it opens, and only
       then: the card never takes focus on its own. */
    const focusOtherRef = React.useRef(false);
    React.useEffect(() => {
      if (!focusOtherRef.current) return;
      focusOtherRef.current = false;
      otherInputRef.current?.focus();
    });

    const current = questions[Math.min(step, questions.length - 1)];
    const draftFor = (question: QuestionCardQuestion) => drafts[question.id] ?? EMPTY_DRAFT;
    const writeDraft = (question: QuestionCardQuestion, next: Draft) =>
      setDrafts((prev) => ({ ...prev, [question.id]: next }));

    const submit = (nextDrafts: Record<string, Draft>) => {
      onValuesChange?.(questions.map((question) => toAnswer(question, nextDrafts[question.id] ?? EMPTY_DRAFT)));
    };

    /** Move on from the current question with this draft: the next step, or the answer. */
    const advance = (draft: Draft) => {
      const nextDrafts = { ...drafts, [current.id]: draft };
      setDrafts(nextDrafts);
      if (step < questions.length - 1) setStep(step + 1);
      else submit(nextDrafts);
    };

    const pick = (option: QuestionCardOption) => {
      if (!live) return;
      const draft = draftFor(current);
      if (current.mode === 'multi') {
        const on = draft.values.includes(option.value);
        const cap = current.max ?? current.options.length;
        if (!on && draft.values.length >= cap) return;
        writeDraft(current, {
          ...draft,
          values: on
            ? draft.values.filter((existing) => existing !== option.value)
            : [...draft.values, option.value],
        });
        return;
      }
      /* One answer: the tap is the answer. In a set it also moves on, except
         at the last question, which waits for Send so a slip there can still
         be taken back before everything goes. */
      const next: Draft = { values: [option.value], other: '', otherOpen: false };
      if (!isSet) {
        writeDraft(current, next);
        submit({ ...drafts, [current.id]: next });
      } else if (step < questions.length - 1) {
        advance(next);
      } else {
        writeDraft(current, next);
      }
    };

    const openOther = () => {
      if (!live) return;
      const draft = draftFor(current);
      if (draft.otherOpen) {
        // Multi: the row toggles like any other option.
        if (current.mode === 'multi') writeDraft(current, { ...draft, otherOpen: false, other: '' });
        return;
      }
      writeDraft(current, {
        ...draft,
        // One answer: writing your own replaces any option picked.
        values: current.mode === 'multi' ? draft.values : [],
        otherOpen: true,
      });
      focusOtherRef.current = true;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !live) return;
      if (event.target instanceof HTMLInputElement) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      /* The digits pick by position: the quickest way through a set. */
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0) return;
      const option = current.options[index];
      if (option) {
        event.preventDefault();
        pick(option);
      } else if (index === current.options.length && current.other) {
        event.preventDefault();
        openOther();
      }
    };

    const classes = [
      baseClass,
      isSet ? `${baseClass}--set` : '',
      answered ? `${baseClass}--answered` : '',
      disabled && !answered ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    /* ---------- Answered or expired ---------- */

    if (!live) {
      const skipped = answered && value.length === 0;
      const note = skipped ? labels.skipped : !answered ? labels.unanswered : null;

      /* A set folds to its questions and their answers: the steps are gone,
         and the record reads as a short list. */
      /* A set's record is a short list of every question it asked, whether
         it was answered, skipped or passed by: showing only the first would
         read as if one question had been asked. */
      if (isSet) {
        return (
          <div {...rest} ref={setRootRef} className={classes}>
            <QuestionSummary
              items={questions.map((question) => {
                const answer = value?.find((entry) => entry.questionId === question.id);
                return {
                  prompt: question.prompt,
                  answers: [
                    ...question.options
                      .filter((option) => answer?.values.includes(option.value))
                      .map((option) => option.label),
                    ...(answer?.other ? [answer.other] : []),
                  ],
                };
              })}
              missingLabel={answered ? labels.skipped : labels.unanswered}
            />
          </div>
        );
      }

      /* One question: the options stay as they were offered, the picked ones
         marked, "Something else" included, so the record shows everything
         that was on offer. */
      const shown = questions[0];
      const answer = answered ? value.find((entry) => entry.questionId === shown.id) : undefined;
      return (
        <div {...rest} ref={setRootRef} className={classes}>
          {isSet && <p className={`${baseClass}__prompt`}>{shown.prompt}</p>}
          <ul className={`${baseClass}__options`} aria-label={shown.prompt}>
            {shown.options.map((option) => {
              const chosen = !!answer?.values.includes(option.value);
              return (
                <li
                  key={option.value}
                  className={`${baseClass}__option ${baseClass}__option--static${
                    chosen ? ` ${baseClass}__option--chosen` : ''
                  }`}
                >
                  <OptionText base={baseClass} option={option} />
                  <Mark base={baseClass} chosen={chosen} multi={shown.mode === 'multi'} />
                  {chosen && <span className={`${baseClass}__sr-only`}> (chosen)</span>}
                </li>
              );
            })}
            {shown.other &&
              (answer?.other ? (
                <li className={`${baseClass}__option ${baseClass}__option--static ${baseClass}__option--chosen`}>
                  <OptionText base={baseClass} option={{ value: '', label: answer.other }} />
                  <Mark base={baseClass} chosen multi={shown.mode === 'multi'} />
                  <span className={`${baseClass}__sr-only`}> (chosen)</span>
                </li>
              ) : (
                <li className={`${baseClass}__option ${baseClass}__option--static ${baseClass}__option--other`}>
                  <OptionText base={baseClass} option={{ value: '', label: labels.other }} />
                  <Mark base={baseClass} chosen={false} multi={shown.mode === 'multi'} />
                </li>
              ))}
          </ul>
          {note && <p className={`${baseClass}__note`}>{note}</p>}
        </div>
      );
    }

    /* ---------- Taking an answer ---------- */

    const draft = draftFor(current);
    const multi = current.mode === 'multi';
    const promptId = `${idBase}-prompt`;
    const hintId = `${idBase}-hint`;
    /* What kind of question it is, in words, above the options: the marks
       say it too, but a line of text says it before anything is scanned. */
    const choices = current.options.length + (current.other ? 1 : 0);
    const hint = multi
      ? labels.chooseMany(Math.max(1, current.min ?? 1), current.max ?? choices, choices)
      : labels.chooseOne;
    const complete = isAnswered(current, draft);
    const lastStep = step === questions.length - 1;
    /* A footer only when there is something to press: a set always has one;
       a lone question needs one to send several picks, or to skip. */
    const showSubmit = isSet || multi;
    const showFooter = showSubmit || !!onSkip;
    const atCap = multi && draft.values.length >= (current.max ?? current.options.length);

    const submitDraft = () => {
      if (!complete) return;
      advance(draft);
    };

    return (
      <div
        {...rest}
        ref={setRootRef}
        className={classes}
        role="group"
        aria-labelledby={promptId}
        aria-describedby={hintId}
        onKeyDown={handleKeyDown}
      >
        {isSet ? (
          <div className={`${baseClass}__header`}>
            <p className={`${baseClass}__prompt`} id={promptId}>
              {current.prompt}
            </p>
            <span className={`${baseClass}__step`}>
              {labels.step(step + 1, questions.length)}
            </span>
          </div>
        ) : (
          <span className={`${baseClass}__sr-only`} id={promptId}>
            {current.prompt}
          </span>
        )}

        <p className={`${baseClass}__hint`} id={hintId}>
          {hint}
        </p>

        {/* Keyed by step, so moving through a set replays the options'
            entrance rather than swapping text in place. */}
        <ul key={current.id} className={`${baseClass}__options`} aria-labelledby={promptId}>
          {current.options.map((option) => {
            const on = draft.values.includes(option.value);
            return (
              <li key={option.value} className={`${baseClass}__item`}>
                <button
                  type="button"
                  className={`${baseClass}__option${on ? ` ${baseClass}__option--chosen` : ''}`}
                  /* Several answers make each option a toggle; one answer
                     in a set marks the pick until it is sent. A lone
                     question's options are plain buttons: the tap sends. */
                  aria-pressed={multi || isSet ? on : undefined}
                  disabled={multi && !on && atCap}
                  onClick={() => pick(option)}
                >
                  <OptionText base={baseClass} option={option} />
                  <Mark base={baseClass} chosen={on} multi={multi} />
                </button>
              </li>
            );
          })}
          {current.other && (
            <li className={`${baseClass}__item`}>
              {draft.otherOpen ? (
                <form
                  className={`${baseClass}__option ${baseClass}__other${
                    showSubmit ? '' : ` ${baseClass}__other--send`
                  }${draft.other.trim() ? ` ${baseClass}__option--chosen` : ''}`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitDraft();
                  }}
                >
                  <input
                    ref={otherInputRef}
                    className={`${baseClass}__other-input`}
                    type="text"
                    value={draft.other}
                    placeholder={labels.otherPlaceholder}
                    aria-label={labels.other}
                    maxLength={200}
                    onChange={(event) => writeDraft(current, { ...draft, other: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape' && !draft.other) {
                        event.stopPropagation();
                        writeDraft(current, { ...draft, otherOpen: false });
                      }
                    }}
                  />
                  {/* The same trailing mark as the options: on while there is
                      an answer written, off again once it is cleared. A lone
                      question sends from its own button instead. */}
                  {showSubmit && <Mark base={baseClass} chosen={draft.other.trim() !== ''} multi={multi} />}
                  {!showSubmit && (
                    <CircularButton
                      icon="arrow_upward"
                      size="compact"
                      ariaLabel={labels.submit}
                      disabled={!draft.other.trim()}
                      onClick={submitDraft}
                    />
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  className={`${baseClass}__option ${baseClass}__option--other`}
                  onClick={openOther}
                >
                  <OptionText base={baseClass} option={{ value: '', label: labels.other }} />
                  <span className={`${baseClass}__mark material-symbols-rounded`} aria-hidden="true">
                    edit
                  </span>
                </button>
              )}
            </li>
          )}
        </ul>

        {showFooter && (
          <div className={`${baseClass}__footer`}>
            {isSet && step > 0 && (
              <Button
                variant="tertiary"
                size="compact"
                label={labels.back}
                onClick={() => setStep(step - 1)}
              />
            )}
            <span className={`${baseClass}__spacer`} />
            {onSkip && (
              <Button variant="tertiary" size="compact" label={labels.skip} onClick={onSkip} />
            )}
            {showSubmit && (
              <Button
                variant={lastStep ? 'primary' : 'secondary'}
                size="compact"
                label={lastStep ? labels.submit : labels.next}
                disabled={!complete}
                onClick={submitDraft}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

QuestionCard.displayName = 'QuestionCard';

/** One question in a summary, and what was answered to it. */
export interface QuestionSummaryItem {
  /** The question, as it was asked. */
  prompt: string;
  /** Every answer given, as the person would say each one. Empty when none was. */
  answers: string[];
}

/** Props owned by QuestionSummary itself — everything else falls through to the root element. */
type QuestionSummaryOwnProps = {
  /** The questions and their answers, in the order they were asked. */
  items: QuestionSummaryItem[];
  /** What stands in the answer's place for a question left without one. */
  missingLabel?: string;
  /**
   * `card` draws the summary in its own hairline frame, as a set's record
   * under the reply that asked it. `plain` drops the frame, for a surface
   * that brings its own, such as the message bubble that sent the answers.
   */
  variant?: 'card' | 'plain';
  /** Additional CSS classes */
  className?: string;
};

export interface QuestionSummaryProps
  extends QuestionSummaryOwnProps,
    Omit<React.ComponentPropsWithoutRef<'dl'>, keyof QuestionSummaryOwnProps> {}

/**
 * QuestionSummary is the record of a set of questions: each prompt, quiet,
 * over what was answered to it. QuestionCard folds to one once a set is
 * answered, skipped or passed by, and a chat draws the same summary as the
 * message that sent the answers, so the question and the reply to it read
 * as one pattern on both sides of the conversation.
 */
export const QuestionSummary = React.forwardRef<HTMLDListElement, QuestionSummaryProps>(
  ({ items, missingLabel = 'No answer', variant = 'card', className = '', ...rest }, ref) => {
    const baseClass = 'ds-question-summary';
    const classes = [baseClass, `${baseClass}--${variant}`, className].filter(Boolean).join(' ');
    return (
      <dl {...rest} ref={ref} className={classes}>
        {items.map((item, index) => {
          const missing = item.answers.length === 0;
          return (
            <div key={`${index}-${item.prompt}`} className={`${baseClass}__row`}>
              <dt className={`${baseClass}__prompt`}>{item.prompt}</dt>
              <dd className={`${baseClass}__answer${missing ? ` ${baseClass}__answer--missing` : ''}`}>
                {missing ? missingLabel : item.answers.join(', ')}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  },
);

QuestionSummary.displayName = 'QuestionSummary';

/* Below the component, so the props parser names the file after it. */
const DEFAULT_QUESTION_CARD_LABELS: QuestionCardLabels = {
  other: 'Something else',
  otherPlaceholder: 'Type your answer',
  submit: 'Send',
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  skipped: 'Skipped',
  unanswered: 'Not answered',
  step: (current, total) => `${current} of ${total}`,
  chooseOne: 'Choose one',
  chooseMany: (min, max, total) =>
    min === max
      ? `Choose ${min}`
      : min > 1 && max < total
        ? `Choose ${min} to ${max}`
        : min > 1
          ? `Choose at least ${min}`
          : max < total
            ? `Choose up to ${max}`
            : 'Choose one or more',
};

function OptionText({ base, option }: { base: string; option: QuestionCardOption }) {
  return (
    <span className={`${base}__text`}>
      <span className={`${base}__label`}>{option.label}</span>
      {option.description && <span className={`${base}__description`}>{option.description}</span>}
    </span>
  );
}

/* The trailing mark says what kind of question it is before anything is
   touched: a radio for one answer, a square checkbox for several. Every
   row carries it, picked or not, the way a form control would. */
function Mark({ base, chosen, multi }: { base: string; chosen: boolean; multi: boolean }) {
  const icon = multi
    ? chosen
      ? 'check_box'
      : 'check_box_outline_blank'
    : chosen
      ? 'radio_button_checked'
      : 'radio_button_unchecked';
  return (
    <span
      className={`${base}__mark material-symbols-rounded${chosen ? ' icon-filled' : ''}`}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
