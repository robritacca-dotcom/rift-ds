'use client';

import React from 'react';
import { Chip } from '../Chip/Chip';
import { Kbd } from '../Kbd/Kbd';
import { useShortcut, type Shortcut } from '../../behaviors/shortcuts';
import { MOTION_EXIT_SYNC_MS } from '../../tokens/motion';
import './PromptSuggestions.css';
import '../../behaviors/direction.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/* The keys a numbered list answers to, one per row, in order. */
const DIGITS: Shortcut[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** One tappable suggestion in the row. */
export interface PromptSuggestion {
  /** Stable identifier passed to `onValueChange`. */
  id: string;
  /** The suggestion text shown in the chip. */
  label: string;
  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */
  icon?: string | React.ReactNode;
  /** A quiet second line under the label, drawn by the `tiles`, `cards` and `list` layouts: what the tile leads to, the full question a card asks, or the rest of a row's line beside its label. The chip layouts have no room for it and leave it out. */
  description?: string;
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
   * the ragged right edge reads as an accident. `tiles` and `cards` leave
   * the chip behind for an empty-state home screen: `tiles` is an even row
   * of quiet blocks, each an icon over a label and its `description`;
   * `cards` gives each suggestion a tinted cover holding its icon, with the
   * label and description beneath. Both fold to fewer columns as their own
   * width narrows. `list` gathers them into one panel of full-width rows,
   * each a coloured dot (or its icon), the label and its description on one
   * line, for a short set of examples under a composer.
   */
  layout?: 'scroll' | 'wrap' | 'stack' | 'tiles' | 'cards' | 'list';
  /**
   * Number the `list` rows 1 to 9, each with its digit as a keycap at the
   * row's end, and let that digit pick the row from anywhere on the page
   * outside a text field. Other layouts ignore it, and rows past the ninth
   * carry no number. Two numbered lists on one page share the digits, and
   * the one mounted last answers them.
   */
  numbered?: boolean;
  /**
   * A short line over the suggestions, such as "Start from an example". It
   * names the list for assistive technology in place of `aria-label`. Set,
   * the title and the list are wrapped in a group, which becomes the root:
   * the ref, `className` and every other prop land on the group, so spacing
   * and placement apply to the whole set. Shadows the native `title`
   * attribute, which this element does not use as a tooltip.
   */
  title?: string;
  /** The digits' description in a keyboard-shortcuts help list, for a numbered list. Defaults to "Pick a suggestion". */
  shortcutLabel?: string;
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
  /**
   * The `id` of the suggestion already taken. Set, the row becomes the
   * record of that choice: the taken suggestion outlined solid in the
   * strongest ink, the rest faded behind a dashed line, and none of them
   * tappable any more. The same treatment QuestionCard gives a pick. For a row that stays
   * on screen after use, such as the follow-ups under an earlier answer.
   */
  value?: string;
  /** Visually hidden text read after the taken suggestion once `value` is set. Defaults to "(chosen)". */
  chosenLabel?: string;
  /**
   * Legacy accessible-name prop for the list. Defaults to "Suggested prompts"; a native `aria-label` wins when both are passed.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
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
      numbered = false,
      title,
      shortcutLabel = 'Pick a suggestion',
      wrap = false,
      pending = false,
      pendingCount = 3,
      entrance = true,
      size = 'default',
      value,
      chosenLabel = '(chosen)',
      ariaLabel = 'Suggested prompts',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-prompt-suggestions';
    const titleId = React.useId();

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
    const kept = value !== undefined;
    const choose = (id: string) => {
      /* The ref guards the same-tick double-tap the state cannot see yet. */
      if (kept || chosenId || chooseTimer.current) return;
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

    /* Tiles and cards are blocks rather than pills, so they draw their own
       button instead of composing Chip. Everything around the item — the
       list semantics, the pending and entrance beats, the tap
       acknowledgment — is the row's and stays shared. */
    const block =
      arrangement === 'tiles' ? 'tile' : arrangement === 'cards' ? 'card' : arrangement === 'list' ? 'row' : null;

    /* The list's numbers are keys as well as labels: a digit picks its row
       through the one shortcut listener, never inside a text field, so
       typing a number into the composer still types it. */
    const numberedRows = numbered && arrangement === 'list' && !pending && !kept;
    const numberedSuggestions = numberedRows ? suggestions.slice(0, DIGITS.length) : [];
    useShortcut(
      DIGITS.slice(0, numberedSuggestions.length),
      (event) => {
        const picked = numberedSuggestions[Number(event.key) - 1];
        if (picked) choose(picked.id);
      },
      { enabled: numberedSuggestions.length > 0, description: shortcutLabel },
    );
    const renderIcon = (icon: PromptSuggestion['icon']) =>
      typeof icon === 'string' ? (
        <span className={`${baseClass}__icon material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={`${baseClass}__icon`} aria-hidden="true">
          {icon}
        </span>
      );

    /* With a title the group is the root and takes the ref, the class and
       the rest; without one the list is. */
    const titled = Boolean(title);
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${arrangement}`,
      chosenId ? `${baseClass}--choosing` : '',
      kept ? `${baseClass}--kept` : '',
      entrance ? '' : `${baseClass}--still`,
      titled ? '' : className,
    ]
      .filter(Boolean)
      .join(' ');

    const list = (
      <div
        {...(titled ? {} : rest)}
        ref={titled ? undefined : ref}
        className={classes}
        role="list"
        /* A title names the list; without one, the label does. */
        aria-label={titled ? undefined : rest['aria-label'] ?? ariaLabel}
        aria-labelledby={titled ? titleId : rest['aria-labelledby']}
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
                {block ? (
                  /* The block's own shell, holding the label's bar. */
                  <span className={`${baseClass}__${block} ${baseClass}__${block}--pending`}>
                    {block === 'card' && <span className={`${baseClass}__cover`} />}
                    <span className={`${baseClass}__skeleton-bar`} />
                  </span>
                ) : (
                  <span className={`${baseClass}__skeleton`}>
                    <span className={`${baseClass}__skeleton-bar`} />
                  </span>
                )}
              </div>
            ))
          : suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                role="listitem"
                className={`${baseClass}__item${
                  chosenId === suggestion.id ? ` ${baseClass}__item--chosen` : ''
                }${value === suggestion.id ? ` ${baseClass}__item--kept` : ''}`}
                /* The pulse finishing is what ends the chosen state — no
                   second timer. The entrance animation also ends here, so
                   filter by name. */
                onAnimationEnd={(event) => {
                  if (event.animationName === 'ds-prompt-suggestions-choose') {
                    setChosenId(null);
                  }
                }}
              >
                {block ? (
                  <button
                    type="button"
                    className={`${baseClass}__${block}`}
                    /* The digit that picks the row, named on the control it
                       activates; the keycap drawing it is decoration. */
                    aria-keyshortcuts={numberedRows && index < DIGITS.length ? DIGITS[index] : undefined}
                    /* A kept row is a record, not a set of targets. */
                    disabled={kept}
                    onClick={() => choose(suggestion.id)}
                  >
                    {block === 'card' ? (
                      <span className={`${baseClass}__cover`}>
                        {suggestion.icon != null && renderIcon(suggestion.icon)}
                      </span>
                    ) : block === 'row' && suggestion.icon == null ? (
                      <span className={`${baseClass}__dot`} aria-hidden="true" />
                    ) : (
                      suggestion.icon != null && renderIcon(suggestion.icon)
                    )}
                    <span className={`${baseClass}__text`}>
                      <span className={`${baseClass}__label`}>{suggestion.label}</span>
                      {suggestion.description && (
                        <span className={`${baseClass}__description`}>
                          {suggestion.description}
                        </span>
                      )}
                    </span>
                    {value === suggestion.id && (
                      <span className="ds-visually-hidden"> {chosenLabel}</span>
                    )}
                    {numberedRows && index < DIGITS.length && (
                      <Kbd className={`${baseClass}__key`} size="compact" keys={DIGITS[index]} aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  <Chip
                    label={suggestion.label}
                    /* Without a click handler a chip renders as plain text,
                       which is what a record is. The outline says which was
                       taken; no mark is added, so the chip keeps its shape. */
                    icon={suggestion.icon}
                    size={chipSize}
                    onClick={kept ? undefined : () => choose(suggestion.id)}
                  />
                )}
                {!block && value === suggestion.id && (
                  <span className="ds-visually-hidden"> {chosenLabel}</span>
                )}
              </div>
            ))}
      </div>
    );

    if (!titled) return list;
    return (
      <div {...rest} ref={ref} className={[`${baseClass}-group`, className].filter(Boolean).join(' ')}>
        <div id={titleId} className={`${baseClass}-group__title`}>
          {title}
        </div>
        {list}
      </div>
    );
  },
);

PromptSuggestions.displayName = 'PromptSuggestions';
