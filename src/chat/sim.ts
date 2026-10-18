import type { ReactNode } from 'react';
import { STARTER_COUNT } from './starters';
import { fitsChip } from './suggestions';
import type { ChatCard, ChatEvent, ChatQuestionSet, ChatTransport, ChatTransportMessage } from './types';

/* ============================================
   The scripted transport.

   A conversation written in advance and played back through the same event
   stream a real backend produces: scripted status steps at a steady beat, a
   handoff pause, then the reply revealed word by word, then any rich
   content and the follow-up chips. The widget cannot tell the difference,
   which is the point: a consumer mounts the widget, sees it working, and
   shows it round before there is a model, a route or a key anywhere.

   Routing is by the visitor's words. A chip sends its label as the message,
   so a scripted prompt matches exactly (normalised); typed free text falls
   back to a rotation of fallback replies; a turn with files and no matching
   prompt gets a reply about the files. Every path ends in `done`.

   `scriptChat()` below is the authoring API; `createSimTransport` is the
   player underneath it.
   ============================================ */

/** One status beat shown while the scripted reply "thinks". */
export interface ScriptStep {
  /** The AgentStatus label. */
  status: string;
  /** The reasoning trace point that collects under it. */
  point?: string;
}

/** What a scripted assistant says back, and what rides with it. */
export interface ScriptedReply {
  /** The status beats before the text, one per `statusMs`. */
  steps?: ScriptStep[];
  /** The reply, as markdown. */
  text: string;
  /** Rich content the provider's renderers draw with the turn. */
  card?: ChatCard;
  /** Rich content as a React node, for a script that lives beside its components. */
  content?: ReactNode;
  /** The chips offered under the reply. Each should be a scripted prompt so no path dead-ends. */
  followups?: string[];
  /**
   * Questions the reply asks, drawn as a QuestionCard in place of the chips.
   * The `text` should ask them in words too, as a live model's reply would.
   */
  question?: ChatQuestionSet;
  /**
   * The reply to whatever the visitor answers to `question`: one reply for
   * every answer, or a function of the answer as the message it was sent
   * as. A scripted prompt that matches the answer exactly still wins.
   */
  answered?: ScriptedReply | ((answer: string) => ScriptedReply);
}

/** A prompt the visitor can send, and the reply it routes to. */
export interface ScriptNode extends ScriptedReply {
  /** The exact chip text that routes here; matching forgives case and punctuation. */
  prompt: string;
}

/** A whole scripted conversation, the input to `createSimTransport`. */
export interface ChatScript {
  nodes: ScriptNode[];
  /** Replies for free text that matches no prompt, rotated per exchange. */
  fallbacks: ScriptedReply[];
  /** The reply to a turn that carried files and matched no prompt. */
  filesReply?: (names: string[]) => ScriptedReply;
}

/** The beats the player keeps. Schedule timings, not animation: reduced motion leaves them be. */
export interface SimTiming {
  /** Milliseconds per status step. */
  statusMs: number;
  /** The pause between the last step and the first word. */
  handoffMs: number;
  /** Milliseconds per word of the reply. */
  streamMs: number;
}

export const DEFAULT_SIM_TIMING: SimTiming = {
  statusMs: 1600,
  handoffMs: 350,
  streamMs: 30,
};

/** Chip labels route by text, so matching forgives case and punctuation. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

class SimAbortError extends Error {
  constructor() {
    super('Scripted response aborted');
    this.name = 'AbortError';
  }
}

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new SimAbortError());
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new SimAbortError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

/** The reply to a turn that carried files and matched no scripted prompt. */
export function defaultFilesReply(names: string[]): ScriptedReply {
  const shown = names.slice(0, 3).join(', ');
  const rest = names.length > 3 ? ` and ${names.length - 3} more` : '';
  const one = names.length === 1;
  return {
    steps: [
      {
        status: one ? 'Looking at the file' : 'Looking at the files',
        point: `${names.length} attached; note what each one is before answering.`,
      },
    ],
    text:
      `Got ${one ? 'it' : 'them'}: ${shown}${rest}. This chat is scripted, so ` +
      `${one ? 'the file' : 'the files'} stayed in your browser and nothing was ` +
      'uploaded or read. A live assistant would answer from the contents here.',
  };
}

/** What a script with no fallbacks says to free text. */
export const DEFAULT_FALLBACK_REPLY: ScriptedReply = {
  steps: [{ status: 'Reading the question', point: 'Nothing scripted matches this one.' }],
  text:
    'This chat is a scripted preview, so it only has answers written for the ' +
    'suggestions it offers. Pick one of them to see the conversation play out.',
};

/**
 * Plays a `ChatScript` as a transport.
 *
 * `followups` on a reply default to the first few scripted prompts that fit
 * a chip, so a script never ends on a reply with nowhere to go.
 */
export function createSimTransport(
  script: ChatScript,
  timing: Partial<SimTiming> = {}
): ChatTransport {
  const beats = { ...DEFAULT_SIM_TIMING, ...timing };
  const byPrompt = new Map(script.nodes.map((node) => [normalize(node.prompt), node]));
  const fallbacks = script.fallbacks.length > 0 ? script.fallbacks : [DEFAULT_FALLBACK_REPLY];
  const filesReply = script.filesReply ?? defaultFilesReply;
  /* Every reply that asks a question, by its text. The history the hook
     sends carries the asking reply word for word, so the answer's reply is
     found from the conversation itself, with no state kept here that a
     new chat would have to clear. */
  const asking = new Map<string, ScriptedReply>();
  const collect = (reply: ScriptedReply) => {
    if (!reply.question || asking.has(normalize(reply.text))) return;
    asking.set(normalize(reply.text), reply);
    if (reply.answered && typeof reply.answered !== 'function') collect(reply.answered);
  };
  for (const reply of [...script.nodes, ...script.fallbacks]) collect(reply);
  const defaultFollowups = script.nodes
    .map((node) => node.prompt)
    .filter(fitsChip)
    .slice(0, STARTER_COUNT);
  let exchangeCount = 0;

  return async function* simTransport(
    messages: ChatTransportMessage[],
    signal: AbortSignal
  ): AsyncGenerator<ChatEvent> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const prompted = lastUser ? byPrompt.get(normalize(lastUser.content)) : undefined;
    /* An answer to a scripted question routes to the reply written for it. */
    const previous = messages[messages.length - 2];
    const asked =
      !prompted && previous?.role === 'assistant' ? asking.get(normalize(previous.content)) : undefined;
    const answered =
      asked?.answered && lastUser
        ? typeof asked.answered === 'function'
          ? asked.answered(lastUser.content)
          : asked.answered
        : undefined;
    if (answered) collect(answered);
    const node: ScriptedReply | undefined = prompted ?? answered;

    /* Files with no scripted prompt behind them get an answer about the
       files, built from their names. Nothing was read: the bytes never left
       the visitor's browser, and the reply says so. */
    const attached = !node ? (lastUser?.attachments ?? []) : [];
    const reply: ScriptedReply =
      node ??
      (attached.length > 0
        ? filesReply(attached.map((file) => file.name))
        : fallbacks[exchangeCount % fallbacks.length]);
    if (!node && attached.length === 0) exchangeCount += 1;

    for (const step of reply.steps ?? []) {
      yield { type: 'status', label: step.status, point: step.point };
      await delay(beats.statusMs, signal);
    }

    await delay(beats.handoffMs, signal);

    const words = reply.text.split(' ');
    for (let i = 0; i < words.length; i += 1) {
      yield { type: 'delta', text: i === 0 ? words[i] : ` ${words[i]}` };
      await delay(beats.streamMs, signal);
    }

    if (reply.content) yield { type: 'content', node: reply.content };
    if (reply.card) yield { type: 'card', card: reply.card };

    /* Before `done`, like the event contract asks: the hook carries them
       into the turn when it commits, so the chips are there with the copy
       row rather than a beat behind it. */
    if (reply.question) {
      // A reply that asks ends in the question, not in chips beside it.
      yield { type: 'question', set: reply.question };
    } else {
      const followups = (reply.followups ?? defaultFollowups).filter(fitsChip);
      if (followups.length > 0) yield { type: 'followups', items: followups };
    }
    yield { type: 'done' };
  };
}

/* ============================================
   scriptChat(): the authoring API.

     const transport = scriptChat()
       .user('How do I get started?')
       .assistant('Create a workspace, then invite your team.', {
         steps: [{ status: 'Reading the first-run flow' }],
         followups: ['What do the plans include?'],
       })
       .user('What do the plans include?')
       .assistant('Every plan includes unlimited projects.')
       .transport();

   Each `.user()` names a prompt and the `.assistant()` that follows answers
   it. A reply's `followups` should name other prompts in the script, so the
   chips always lead somewhere; left out, they default to the script's first
   prompts. `.fallback()` adds a reply for typed text that matches nothing.
   ============================================ */

export interface ChatScriptBuilder {
  /** The next prompt the visitor can send. Must be followed by `.assistant()`. */
  user(prompt: string): ChatScriptBuilder;
  /** The reply to the last `.user()` prompt. */
  assistant(text: string, options?: Omit<ScriptedReply, 'text'>): ChatScriptBuilder;
  /** A reply for typed text that matches no prompt. Several rotate per exchange. */
  fallback(text: string, options?: Omit<ScriptedReply, 'text'>): ChatScriptBuilder;
  /** The reply to a turn that carried files and matched no prompt. */
  onFiles(reply: (names: string[]) => ScriptedReply): ChatScriptBuilder;
  /** The finished script, for `createSimTransport` or inspection. */
  build(): ChatScript;
  /** The finished script as a transport, ready for `ChatProvider`. */
  transport(timing?: Partial<SimTiming>): ChatTransport;
}

export function scriptChat(): ChatScriptBuilder {
  const nodes: ScriptNode[] = [];
  const fallbacks: ScriptedReply[] = [];
  let filesReply: ChatScript['filesReply'];
  let pendingPrompt: string | null = null;

  const builder: ChatScriptBuilder = {
    user(prompt) {
      if (pendingPrompt !== null) {
        throw new Error(`scriptChat: "${pendingPrompt}" has no .assistant() reply.`);
      }
      pendingPrompt = prompt;
      return builder;
    },
    assistant(text, options = {}) {
      if (pendingPrompt === null) {
        throw new Error('scriptChat: .assistant() needs a .user() prompt before it.');
      }
      nodes.push({ prompt: pendingPrompt, text, ...options });
      pendingPrompt = null;
      return builder;
    },
    fallback(text, options = {}) {
      fallbacks.push({ text, ...options });
      return builder;
    },
    onFiles(reply) {
      filesReply = reply;
      return builder;
    },
    build() {
      if (pendingPrompt !== null) {
        throw new Error(`scriptChat: "${pendingPrompt}" has no .assistant() reply.`);
      }
      return { nodes: [...nodes], fallbacks: [...fallbacks], filesReply };
    },
    transport(timing) {
      return createSimTransport(builder.build(), timing);
    },
  };
  return builder;
}
