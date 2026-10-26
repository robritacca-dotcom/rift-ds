/**
 * The chip budget for chat suggestions, in one place.
 *
 * Every suggestion the chat offers renders as a Chip inside PromptSuggestions,
 * whether it is a conversation starter on the welcome screen or a follow-up
 * question under an answer. A chip never wraps, which is what makes it a pill
 * rather than a paragraph, so a label longer than the column runs past the
 * edge of a docked panel and reads as broken.
 *
 * The narrowest place a suggestion is shown is a phone, where the panel drops
 * its card chrome and fills the viewport: a 375px screen leaves the message
 * column 362px, and this is the label length that fits it. A docked panel on
 * a desktop is wider and has room to spare. Measured, not guessed: 44
 * characters renders at 376px and runs past the edge of a small phone, which
 * is what this number is set below.
 *
 * Every producer of a suggestion checks against it. A suggestion that will
 * not fit is dropped, never truncated: half a question is not a question.
 *
 * The FAB summary panel's chips render through the same row, so they share
 * the budget too. It lives in the package rather than the site so every
 * consumer's chat holds the same line. The enforcement points: the
 * follow-ups model is told the number in its prompt (server.ts), the
 * follow-ups route drops a long one rather than clipping it, and the
 * options of a question the agent asks are held to it as well (the
 * `ask_user` input schema tells the model the number, and
 * `sanitizeQuestionSet` in questions.ts drops a question whose option
 * outruns it). Written copy is a build check: validate-chat-starters.mjs
 * holds the starters, follow-ups and the demo script's question options,
 * and validate-page-summaries.mjs the summary panel's chips.
 */
export const SUGGESTION_MAX_CHARS = 40;

/** Whether a suggestion label is one the chip row can actually show. */
export function fitsChip(label: string): boolean {
  const trimmed = label.trim();
  return trimmed !== '' && trimmed.length <= SUGGESTION_MAX_CHARS;
}
