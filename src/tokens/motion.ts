/**
 * JS-driven motion timings — the TypeScript side of the motion tokens.
 * CSS transitions read the `--motion-*` custom properties; these constants
 * are the single home for timings that live in JavaScript timers, where a
 * CSS variable cannot reach. Components use them as defaults, so a single
 * instance can still be tuned through its component's own props.
 *
 * Most are schedule timings (when something starts, stops, or is taken
 * away), which the reduced-motion guard in tokens-motion.css deliberately
 * leaves alone. Constants that pace an animation (the streaming reveal's
 * rate floor and drain window, and the summary panel's reveal budget) are
 * the exception: their component checks the preference itself in JS,
 * because the CSS guard cannot see a JavaScript timer.
 */

/** Delay before a hover-triggered overlay appears, filtering pass-through hovers. */
export const MOTION_HOVER_SHOW_DELAY_MS = 300;

/** Grace period before a hover-triggered overlay or submenu closes, forgiving a wobbly pointer path. */
export const MOTION_HOVER_HIDE_DELAY_MS = 150;

/** How long a transient notification stays before dismissing itself. */
export const MOTION_AUTO_DISMISS_MS = 5000;

/** How long an exiting element's unmount waits for its CSS exit animation — mirrors --motion-duration-base. */
export const MOTION_EXIT_SYNC_MS = 200;

/** Interval between automatic slide advances. */
export const MOTION_AUTOPLAY_INTERVAL_MS = 5000;

/** How long momentary confirmation feedback (a copied state) holds before resetting. */
export const MOTION_FEEDBACK_RESET_MS = 2000;

/** How long after the last scroll event a scroll surface is considered settled. */
export const MOTION_SCROLL_SETTLE_MS = 600;

/** Slowest the streaming reveal ever runs, in characters per second — the pace a thin trickle of deltas types at. An animation pace, not a schedule timing: the reveal is skipped under reduced motion. */
export const MOTION_STREAM_FLOOR_CPS = 70;

/** However much streamed text is waiting, the reveal has it fully on screen within this long — the rate rises with the backlog, so a dumped paragraph catches up in a beat. */
export const MOTION_STREAM_DRAIN_MS = 250;

/** The retired interval-based reveal step. @deprecated The reveal is frame-driven now — pace it with MOTION_STREAM_FLOOR_CPS and MOTION_STREAM_DRAIN_MS. */
export const MOTION_STREAM_CHAR_INTERVAL_MS = 15;

/** The count-up tween's full budget: however far the number travels, AnimatedNumber has it settled within this. An animation pace, not a schedule timing: the tween is skipped under reduced motion. */
export const MOTION_COUNT_UP_MS = 800;

/** Grace period before a hover-summoned surface hides once the pointer has left it — long enough to cross the gap between a launcher and its panel without the panel dying under a mouse that is heading for it. */
export const MOTION_HOVER_EXIT_GRACE_MS = 600;

/** How long AiButton's summary panel "thinks" (skeleton lines) before its pre-written text reveals. */
export const MOTION_SUMMARY_THINK_MS = 900;

/** The summary panel's full type-out budget: however long the text, the reveal has it on screen within this. A deliberately slower pace than MOTION_STREAM_DRAIN_MS — this reveal is the content arriving, not a stream catching up. */
export const MOTION_SUMMARY_REVEAL_MS = 1600;

/** How long a suggestion row stages its "generation" (PromptSuggestions' pending shimmer) before a pre-written set reveals — the summary panel's think beat, shorter because it replays every time the set swaps rather than once per mount. A schedule timing, so the reduced-motion guard leaves it alone; the shimmer itself stills through the tokenized duration. */
export const MOTION_SUGGESTIONS_THINK_MS = 600;
