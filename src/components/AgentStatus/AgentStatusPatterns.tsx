/**
 * AgentStatus's vocabulary, kept out of the component file so that module
 * exports only a component (react-refresh) — and exported rather than kept
 * private so a consumer building a pattern picker, and this repo's own docs
 * gallery, can iterate the list instead of restating it.
 *
 * `.tsx` despite holding no JSX: the barrel generator and the
 * `./components/*` export subpath both address `.tsx`, so that extension is
 * what makes this reachable as `@robr0/design-system/components/AgentStatus/AgentStatusPatterns`.
 */

/**
 * The dot-matrix animations. Each pattern is a named choreography over the
 * same 4x3 grid, so switching pattern never changes the indicator's footprint.
 */
export const agentStatusPatterns = [
  'braille',
  'orbit',
  'breathe',
  'snake',
  'fill-sweep',
  'pulse',
  'columns',
  'checkerboard',
  'scan',
  'rain',
  'cascade',
  'sparkle',
  'wave-rows',
  'helix',
  'diagonal-swipe',
] as const;

export type AgentStatusPattern = (typeof agentStatusPatterns)[number];

export type AgentStatusState =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'waiting'
  | 'done'
  | 'error';
