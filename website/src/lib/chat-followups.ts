/**
 * The site's written follow-up fallbacks, offered under an answer when the
 * generated set comes back empty: a slow upstream call, a guardrail pause,
 * or five candidates that all ran past the chip budget all land here.
 * Generic by design, so any of them makes sense under any answer; the pick
 * rotates by turn (the provider's `pickFallbackFollowups` does the drawing).
 *
 * Written copy on the chip row, so `scripts/validate-chat-starters.mjs`
 * holds every label to the budget (SUGGESTION_MAX_CHARS in rift-ds/chat).
 * The machinery lives in the package; this file holds the site's words.
 */
export const FALLBACK_FOLLOWUPS = [
  "How does this design system work?",
  "How do I install the package?",
  "How do the theme presets work?",
  "What can the MCP endpoint do?",
  "Why is the action colour reserved?",
  "How is the site kept accurate?",
];
