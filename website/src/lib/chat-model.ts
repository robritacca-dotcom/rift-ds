/**
 * The chat's models, in one place.
 *
 * CHAT_MODELS is the allowlist: the only models the route will ever call,
 * whatever a request body asks for. The client sends an entry's `value`, never
 * an id, so the wire contract survives a model id bump. Labels are authored
 * here rather than derived from the id, because dated ids ("-20251001") make
 * poor display names.
 *
 * Which entry serves a given exchange is the server's decision: the visitor's
 * pick is a request, and the route resolves it through the day's budget tier
 * (see guardrails.ts) before calling the model. The route reports its current
 * offer via a `models` event (default + locked values), which is what keeps
 * the picker honest — a clamped pick falls back to the default it will
 * actually get. A separate `model` event records what served each exchange;
 * nothing renders it today, but it is the transport contract's ground truth
 * for any host that wants a per-answer label.
 */

export interface ChatModelOption {
  /** Stable wire value: what the picker holds and the client sends. */
  value: string;
  /** The Anthropic model id the route calls. */
  id: string;
  /** Display name in the picker and the composer label. */
  label: string;
  /** One line under the name in the picker. */
  description: string;
  /**
   * Whether the model takes adaptive thinking and the effort dial. True for
   * every model on offer today; an entry older than the Claude 4.6 generation
   * rejects both with a 400, so the route must send it a plain request.
   */
  adaptiveThinking: boolean;
}

export const CHAT_MODELS: ChatModelOption[] = [
  {
    value: "haiku",
    id: "claude-haiku-5-5",
    label: "Haiku 5.5",
    description: "Fast answers, the everyday pick.",
    adaptiveThinking: true,
  },
  {
    value: "sonnet",
    id: "claude-sonnet-5",
    label: "Sonnet 5",
    description: "More depth for harder questions.",
    adaptiveThinking: true,
  },
];

/** What serves when the budget has headroom and the visitor has not chosen. */
export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0];

/**
 * What serves once the day's spend passes the step-down threshold — and the
 * only model on offer past the lock threshold (guardrails.ts owns both).
 * Today it is the default too, so the step-down changes nothing and the lock
 * is the only tier a visitor can notice; the two stay separate names so a
 * dearer default can come back without touching the route.
 */
export const BUDGET_CHAT_MODEL = CHAT_MODELS[0];

/** Resolves a client-sent wire value to its entry, or null for anything else. */
export function chatModelByValue(value: unknown): ChatModelOption | null {
  if (typeof value !== "string") return null;
  return CHAT_MODELS.find((option) => option.value === value) ?? null;
}

/**
 * The model that writes the follow-up suggestions under a finished answer.
 * A deliberately smaller one: the job is three short questions from a
 * question-and-answer pair it is handed, with no corpus to read and nothing
 * to reason about, and it runs once per exchange on top of the answer itself.
 * It is not in CHAT_MODELS on purpose: it is plumbing, never on offer in the
 * picker.
 */
export const FOLLOWUP_MODEL = "claude-haiku-5-5";
