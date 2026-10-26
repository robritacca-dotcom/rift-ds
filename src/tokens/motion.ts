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

/** How long ScatterChart's points sweep in — mirrors --motion-duration-deliberate. The other charts ride recharts' own default pacing and report when the entrance has ended; Scatter is the one recharts item with no end callback, so its wrapper sets the duration itself and drops the entrance flag on a timer of the same length. An animation pace recharts' 'auto' guard already skips under reduced motion. */
export const MOTION_CHART_ENTRANCE_MS = 400;

/** Grace period before a hover-summoned surface hides once the pointer has left it — long enough to cross the gap between a launcher and its panel without the panel dying under a mouse that is heading for it. */
export const MOTION_HOVER_EXIT_GRACE_MS = 600;

/** How long AiButton's summary panel "thinks" (skeleton lines) before its pre-written text reveals. */
export const MOTION_SUMMARY_THINK_MS = 900;

/** The summary panel's full type-out budget: however long the text, the reveal has it on screen within this. A deliberately slower pace than MOTION_STREAM_DRAIN_MS — this reveal is the content arriving, not a stream catching up. */
export const MOTION_SUMMARY_REVEAL_MS = 1600;

/** How long a suggestion row stages its "generation" (PromptSuggestions' pending shimmer) before a pre-written set reveals — the summary panel's think beat, shorter because it replays every time the set swaps rather than once per mount. A schedule timing, so the reduced-motion guard leaves it alone; the shimmer itself stills through the tokenized duration. */
export const MOTION_SUGGESTIONS_THINK_MS = 600;

/** The shipped period of one full turn for an auto-rotating surface — mirrors --motion-duration-orbit. Not a timer: Globe reads the live token and divides this by it, so its `autoRotate` speed means exactly what it says at the shipped tempo and scales with a theme's motion. */
export const MOTION_ORBIT_REFERENCE_MS = 120000;

/** How often Globe's spin re-reads the orbit token, so a live retheme of --motion-duration-orbit lands mid-spin. A polling schedule, not an animation pace. */
export const MOTION_TOKEN_REREAD_MS = 250;

/** How long ShaderField waits for its renderer to resolve before falling back, so an unresolved field can never be terminal (a context lost before the first frame and never restored). Generous next to a healthy start, which lands within a frame of mount. A schedule timing. */
export const MOTION_RENDERER_WATCHDOG_MS = 1500;

/** ShaderField's colour crossfade when the theme changes — mirrors --motion-duration-slow. An animation pace: the field honours reduced motion in JS. */
export const MOTION_SHADER_COLOR_FADE_MS = 300;

/** How long the scripted demo's staged retry "runs" before it lands. A schedule timing. */
export const MOTION_DEMO_RETRY_RUN_MS = 1400;

/** How long a new thread's name shimmer runs after its first message before the name arrives, paced like a fast title-generation call. A schedule timing. */
export const MOTION_THREAD_NAMING_DELAY_MS = 1600;

/** How long ShaderField waits for the browser to restore a lost WebGL context on its own before forcing a restore. A schedule timing. */
export const MOTION_CONTEXT_RESTORE_WAIT_MS = 700;

/** How long a table waits after the last keystroke or range step before it announces the new result or selection count, so typing a search or sweeping Shift+Down speaks once. A schedule timing. */
export const MOTION_ANNOUNCE_DEBOUNCE_MS = 500;
