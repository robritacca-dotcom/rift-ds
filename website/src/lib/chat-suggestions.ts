/**
 * The chip budget for chat suggestions, in one place.
 *
 * Every suggestion the chat offers renders as a Chip inside PromptSuggestions,
 * whether it is a conversation starter on the welcome screen or a follow-up
 * question under an answer. A chip never wraps — that is what makes it a pill
 * rather than a paragraph — so a label longer than the column runs past the
 * edge of the docked panel and reads as broken.
 *
 * The narrowest place a suggestion is shown is a phone, where the panel drops
 * its card chrome and fills the viewport: a 375px screen leaves the message
 * column 362px, and this is the label length that fits it. The docked panel on
 * a desktop is wider and has room to spare. Measured, not guessed — 44
 * characters renders at 376px and runs past the edge of a small phone, which
 * is what this number is set below.
 *
 * Every producer of a suggestion checks against it, and
 * `scripts/validate-chat-starters.mjs` fails the build on a written one that
 * exceeds it, so the limit cannot be broken by copy alone.
 */
export const SUGGESTION_MAX_CHARS = 40;

/** Whether a suggestion label is one the chip row can actually show. */
export function fitsChip(label: string): boolean {
  const trimmed = label.trim();
  return trimmed !== "" && trimmed.length <= SUGGESTION_MAX_CHARS;
}
