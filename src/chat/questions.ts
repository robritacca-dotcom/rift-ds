import { SUGGESTION_MAX_CHARS, fitsChip } from './suggestions';
import type { ChatQuestion, ChatQuestionAnswer, ChatQuestionSet, ChatReply, ChatTurn } from './types';

/* ============================================
   Questions the agent asks.

   A follow-up chip is the visitor's voice, guessed after the fact by a
   small model: something they might ask next. A question is the agent's
   voice, asked by the model that wrote the answer, because the answer
   stopped there for want of it. So a question rides in the reply itself
   (the `question` event), and a turn that carries one is never asked about
   for follow-ups: one reply affordance per turn.

   Every question the widget renders passes through `sanitizeQuestionSet`
   here, on the server as it leaves the model and in the browser as it
   arrives, the same double check the chips get. Anything malformed is
   dropped, never repaired: the reply text still asks the question in
   words, so a dropped set leaves a conversation that reads correctly.
   ============================================ */

/** Questions in one set. A longer interview belongs in a form, not a chat turn. */
export const MAX_QUESTIONS = 4;
/** Options in one question, before "Something else". */
export const MAX_QUESTION_OPTIONS = 5;
/** Options in one question at the least: one option is not a choice. */
export const MIN_QUESTION_OPTIONS = 2;
/** A question's own heading: a few words, one line in a docked panel. */
export const QUESTION_PROMPT_MAX_CHARS = 60;
/** An option's second line. */
export const OPTION_DESCRIPTION_MAX_CHARS = 80;

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const slug = (text: string, index: number) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || `option-${index + 1}`;

function sanitizeQuestion(input: unknown, index: number): ChatQuestion | null {
  if (typeof input !== 'object' || input === null) return null;
  const raw = input as Record<string, unknown>;

  const prompt = str(raw.prompt);
  if (!prompt || prompt.length > QUESTION_PROMPT_MAX_CHARS) return null;
  const mode = raw.mode === 'multi' ? 'multi' : 'single';
  if (!Array.isArray(raw.options)) return null;

  /* An option label is held to the chip budget: one line on a phone, the
     same rule every suggestion obeys. A label that will not fit makes the
     whole question unusable rather than shorter, because the option that
     would be dropped may be the right answer. */
  const options: ChatQuestion['options'] = [];
  const seen = new Set<string>();
  for (const [optionIndex, entry] of raw.options.entries()) {
    if (typeof entry !== 'object' || entry === null) return null;
    const option = entry as Record<string, unknown>;
    const label = str(option.label);
    if (!fitsChip(label)) return null;
    const value = str(option.value) || slug(label, optionIndex);
    if (seen.has(value) || seen.has(label.toLowerCase())) return null;
    seen.add(value);
    seen.add(label.toLowerCase());
    const description = str(option.description);
    options.push(
      description && description.length <= OPTION_DESCRIPTION_MAX_CHARS
        ? { value, label, description }
        : { value, label }
    );
  }
  if (options.length < MIN_QUESTION_OPTIONS || options.length > MAX_QUESTION_OPTIONS) return null;

  const question: ChatQuestion = {
    id: str(raw.id) || `q${index + 1}`,
    prompt,
    mode,
    options,
  };
  if (raw.other === true) question.other = true;
  if (mode === 'multi') {
    const available = options.length + (question.other ? 1 : 0);
    const min = typeof raw.min === 'number' ? Math.floor(raw.min) : 1;
    const max = typeof raw.max === 'number' ? Math.floor(raw.max) : available;
    if (min < 1 || max < min || max > available) return null;
    if (min !== 1) question.min = min;
    if (max !== available) question.max = max;
  }
  return question;
}

/**
 * The question set the widget may render, or null. Questions that are
 * malformed or over budget are dropped one by one; a set left with none,
 * or with more than `MAX_QUESTIONS`, is dropped whole.
 */
export function sanitizeQuestionSet(input: unknown, fallbackId = 'questions'): ChatQuestionSet | null {
  if (typeof input !== 'object' || input === null) return null;
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.questions) || raw.questions.length > MAX_QUESTIONS) return null;
  const questions = raw.questions
    .map((question, index) => sanitizeQuestion(question, index))
    .filter((question): question is ChatQuestion => question !== null);
  if (questions.length === 0) return null;
  /* Ids key the answers, so a repeat would make two questions one. */
  if (new Set(questions.map((question) => question.id)).size !== questions.length) return null;
  return { id: str(raw.id) || fallbackId, questions };
}

/**
 * Whether a turn's questions hold the composer: a set of more than one,
 * still open, on the newest turn. One question never does: typing instead
 * of tapping is a fine answer to it, and leaves the card marked unanswered.
 */
export function isBlockingQuestion(turn: ChatTurn | undefined, live: boolean): boolean {
  return (
    !live &&
    turn?.role === 'assistant' &&
    !!turn.question &&
    turn.question.questions.length > 1 &&
    turn.answers === undefined
  );
}


/** What each answered question reads as: its prompt and the labels picked. */
export function describeAnswers(set: ChatQuestionSet, answers: ChatQuestionAnswer[]): ChatReply {
  return {
    items: set.questions.map((question) => {
      const answer = answers.find((entry) => entry.questionId === question.id);
      const labels = question.options
        .filter((option) => answer?.values.includes(option.value))
        .map((option) => option.label);
      if (answer?.other) labels.push(answer.other);
      return { prompt: question.prompt, answers: labels };
    }),
  };
}

/**
 * The answers as the plain message the model reads. One question reads as
 * the answer alone ("Vite", "Components, Tokens"), because the model's own
 * reply just asked it; a set names each question so the answers cannot be
 * paired with the wrong one.
 */
export function serializeReply(reply: ChatReply): string {
  const answered = (labels: string[]) => (labels.length > 0 ? labels.join(', ') : '(no answer)');
  if (reply.items.length === 1) return answered(reply.items[0].answers);
  return reply.items.map((item) => `${item.prompt} ${answered(item.answers)}`).join('\n');
}

/**
 * The `ask_user` tool's input schema, for `createChatHandler`. Exported so
 * a host running its own loop asks for the same shape the widget renders.
 */
export const ASK_USER_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      minItems: 1,
      maxItems: MAX_QUESTIONS,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'A short stable key for the question, e.g. "framework".' },
          prompt: {
            type: 'string',
            description: `The question in a few words, at most ${QUESTION_PROMPT_MAX_CHARS} characters, e.g. "Which framework?".`,
          },
          mode: {
            type: 'string',
            enum: ['single', 'multi'],
            description: 'single when exactly one answer fits; multi when several can be true at once.',
          },
          options: {
            type: 'array',
            minItems: MIN_QUESTION_OPTIONS,
            maxItems: MAX_QUESTION_OPTIONS,
            items: {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                  description: `The answer as the person would say it, at most ${SUGGESTION_MAX_CHARS} characters.`,
                },
                description: {
                  type: 'string',
                  description: `Optional: what choosing it means, at most ${OPTION_DESCRIPTION_MAX_CHARS} characters.`,
                },
              },
              required: ['label'],
            },
          },
          other: {
            type: 'boolean',
            description: 'Offer a free-text "Something else" when the options may not cover every answer.',
          },
          min: { type: 'integer', description: 'multi only: the fewest picks that make an answer.' },
          max: { type: 'integer', description: 'multi only: the most picks allowed.' },
        },
        required: ['prompt', 'options'],
      },
    },
  },
  required: ['questions'],
} as const;
