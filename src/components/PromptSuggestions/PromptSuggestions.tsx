'use client';

import React from 'react';
import { Chip } from '../Chip/Chip';
import { MOTION_EXIT_SYNC_MS } from '../../tokens/motion';
import './PromptSuggestions.css';

/** One tappable suggestion in the row. */
export interface PromptSuggestion {
  /** Stable identifier passed to `onValueChange`. */
  id: string;
  /** The suggestion text shown in the chip. */
  label: string;
  /** Optional leading Material Symbol name. */
  icon?: string;
}

/** Props owned by PromptSuggestions itself — everything else falls through to the root element. */
type PromptSuggestionsOwnProps = {
  /** The suggestions to render, in order. */
  suggestions: PromptSuggestion[];
  /** Fires with the tapped suggestion's `id`, one acknowledgment beat after the tap — the chosen chip pulses and its siblings dim first, so the choice is seen even when selection unmounts the row. */
  onValueChange?: (id: string) => void;
  /**
   * How the suggestions are arranged. `scroll` is one line that scrolls
   * sideways behind edge fades. `wrap` runs them across as many lines as
   * they need, for empty-state hero placements. `stack` gives each one its
   * own line, for narrow columns where a wrapped row breaks unevenly and
   * the ragged right edge reads as an accident.
   */
  layout?: 'scroll' | 'wrap' | 'stack';
  /**
   * Legacy alias for `layout="wrap"`; ignored when `layout` is set.
   * @deprecated Use `layout` instead, which also covers `stack`.
   */
  wrap?: boolean;
  /**
   * The suggestions are still being generated: shimmer placeholder pills
   * hold their place, matching the current size's chip geometry so nothing
   * shifts when the real chips land. While pending the given `suggestions`
   * are not rendered, the placeholders are hidden from assistive technology,
   * and the row reports `aria-busy` instead.
   */
  pending?: boolean;
  /** How many placeholder pills the pending state holds space with. */
  pendingCount?: number;
  /**
   * Play the staggered pop-in when the items mount. On by default; a host
   * re-showing a set that has already landed (reopening a panel over the
   * same suggestions) turns it off, so the chips stand where they were
   * instead of arriving twice.
   */
  entrance?: boolean;
  /**
   * Row scale. `default` sits at the body-paragraph scale, so a suggestion
   * reads at the same weight as the messages it will become; `compact` is
   * the quieter row for placements alongside a live conversation.
   */
  size?: 'default' | 'compact';
  /** Accessible name for the list. */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface PromptSuggestionsProps
  extends PromptSuggestionsOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof PromptSuggestionsOwnProps> {}

/**
 * PromptSuggestions is a horizontal row of tappable prompts for starting or
 * steering a conversation. Each suggestion renders as a clickable Chip, so
 * one component owns the pill look; the row scrolls horizontally with pure
 * CSS edge fades — no scroll listeners, no measurement — or wraps for
 * empty-state hero placements.
 */
export const PromptSuggestions = React.forwardRef<HTMLDivElement, PromptSuggestionsProps>(
  (
    {
      suggestions,
      onValueChange,
      layout,
      wrap = false,
      pending = false,
      pendingCount = 3,
      entrance = true,
      size = 'default',
      ariaLabel = 'Suggested prompts',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-prompt-suggestions';

    /* The tap acknowledgment: the chosen chip gives one small spring pulse
       while its siblings dim, and `onValueChange` fires one beat later —
       so a host that unmounts the row on selection (a chat sending the
       suggestion) still lets the choice be seen. One choice at a time:
       taps are ignored while a beat is in flight, which also guards a
       double-tap firing twice. The chosen state clears when the pulse
       finishes, so a row that persists (follow-ups under an old answer)
       returns to normal and stays tappable. */
    const [chosenId, setChosenId] = React.useState<string | null>(null);
    const chooseTimer = React.useRef<number | null>(null);
    React.useEffect(
      () => () => {
        if (chooseTimer.current) window.clearTimeout(chooseTimer.current);
      },
      [],
    );
    const choose = (id: string) => {
      /* The ref guards the same-tick double-tap the state cannot see yet. */
      if (chosenId || chooseTimer.current) return;
      setChosenId(id);
      chooseTimer.current = window.setTimeout(() => {
        chooseTimer.current = null;
        onValueChange?.(id);
      }, MOTION_EXIT_SYNC_MS);
    };

    // `layout` wins outright, so a caller migrating off `wrap` never has to
    // remove it in the same edit to get the arrangement they asked for.
    const arrangement = layout ?? (wrap ? 'wrap' : 'scroll');

    /* The row sits one step above Chip's own scale: a conversation starter is
       something to tap, not metadata about something else. Chip still owns
       the pill look — the row only picks which of its sizes to ask for. */
    const chipSize = size === 'compact' ? 'default' : 'large';

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${arrangement}`,
      chosenId ? `${baseClass}--choosing` : '',
      entrance ? '' : `${baseClass}--still`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="list"
        aria-label={ariaLabel}
        /* aria-busy is load-bearing while pending: the placeholders are
           aria-hidden, and a busy list is exempt from the required-children
           rule that an otherwise empty role="list" would fail. */
        aria-busy={pending || undefined}
        data-pending={pending || undefined}
      >
        {pending
          ? Array.from({ length: pendingCount }, (_, index) => (
              <div key={index} aria-hidden="true" className={`${baseClass}__item`}>
                {/* The chip's shell with a text-height shimmer bar where the
                    label will be: the label generating, not the pill. */}
                <span className={`${baseClass}__skeleton`}>
                  <span className={`${baseClass}__skeleton-bar`} />
                </span>
              </div>
            ))
          : suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                role="listitem"
                className={`${baseClass}__item${
                  chosenId === suggestion.id ? ` ${baseClass}__item--chosen` : ''
                }`}
                /* The pulse finishing is what ends the chosen state — no
                   second timer. The entrance animation also ends here, so
                   filter by name. */
                onAnimationEnd={(event) => {
                  if (event.animationName === 'ds-prompt-suggestions-choose') {
                    setChosenId(null);
                  }
                }}
              >
                <Chip
                  label={suggestion.label}
                  icon={suggestion.icon}
                  size={chipSize}
                  onClick={() => choose(suggestion.id)}
                />
              </div>
            ))}
      </div>
    );
  },
);

PromptSuggestions.displayName = 'PromptSuggestions';
