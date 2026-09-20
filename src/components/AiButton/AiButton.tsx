'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PromptSuggestions, type PromptSuggestion } from '../PromptSuggestions/PromptSuggestions';
import { Skeleton } from '../Skeleton/Skeleton';
import { StreamingText } from '../StreamingText/StreamingText';
import {
  MOTION_HOVER_SHOW_DELAY_MS,
  MOTION_HOVER_EXIT_GRACE_MS,
  MOTION_SUMMARY_THINK_MS,
  MOTION_SUMMARY_REVEAL_MS,
} from '../../tokens/motion';
import './AiButton.css';
import '../../fonts/material-symbols.css';

/** The content of AiButton's summary panel. */
export interface AiButtonSummary {
  /** Overline label above the title. */
  overline?: string;
  /** Title line — usually the page or subject being summarized. */
  title: string;
  /** Small caption beside the overline, e.g. a reading time. */
  caption?: string;
  /** The pre-written summary the panel reveals. */
  text: string;
  /** Prompt chips under the summary; a tap reports through `onSummarySuggestion`. */
  suggestions?: PromptSuggestion[];
}

/** Props owned by AiButton itself — everything else falls through to the DOM node. */
type AiButtonOwnProps = {
  /** Button text content */
  label?: string;
  /** Leading icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Button size */
  size?: 'default' | 'compact';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional href — renders as <a> instead of <button> */
  href?: string;
  /** Optional target attribute for links */
  target?: string;
  /** Optional rel attribute for links */
  rel?: string;
  /**
   * A TLDR panel the button can summon: overline, title, a pre-written
   * summary revealed through a skeleton beat and a typed stream (once per
   * mount — later openings show it instantly, as if cached), and optional
   * prompt chips. Hovering the button opens it after the standard hover
   * delay; the pointer keeps it alive anywhere over the button or panel,
   * and it hides a grace period after leaving both. Omit for the plain
   * button.
   */
  summary?: AiButtonSummary;
  /** Which side of the button the summary panel opens on. */
  summaryPlacement?: 'top' | 'bottom';
  /**
   * Holds the summary panel open regardless of hover — for callers that
   * reveal it on their own signal (scroll depth, dwell). Hover mechanics
   * still run when it flips back off.
   */
  summaryPinned?: boolean;
  /** Fires when the panel's dismiss button is pressed. The panel closes itself either way; hovering away and back re-summons it. */
  onSummaryDismiss?: () => void;
  /** Fires with the tapped summary suggestion's `id`. */
  onSummarySuggestion?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface AiButtonProps
  extends AiButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof AiButtonOwnProps | 'type'> {}

/**
 * The AI entry point. Icon and label on a solid field pushed past the page
 * floor (`--color-ai-button-bg` — bright white in light, true black in dark),
 * ringed by the AI gradient (`--color-ai-gradient-*`) rotating slowly, with a
 * soft glow of the same gradient haloing the edge. The treatment is the design system's signal
 * for "a model answers here": ordinary actions keep the flat action teal,
 * and this ring is reserved for AI surfaces so neither affordance dilutes
 * the other.
 *
 * With `summary`, the button can also summon a TLDR panel — a glass card
 * that opens above (or below) it on hover or when pinned, fakes a one-time
 * generation beat (skeleton, then a typed reveal), and offers prompt chips.
 * The panel and button share one hover zone, and the gradient sweeps once
 * around the panel's border as it opens.
 *
 * Renders a `<button>`, or an `<a>` when `href` is supplied. Forwards a ref
 * to whichever element it renders, and spreads unrecognised props onto it.
 * The rotation pauses under `prefers-reduced-motion`; the ring and glow stay.
 */
export const AiButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, AiButtonProps>(
  (
    {
      label = 'Ask AI',
      icon = 'auto_awesome',
      size = 'default',
      disabled,
      href,
      target,
      rel,
      summary,
      summaryPlacement = 'top',
      summaryPinned = false,
      onSummaryDismiss,
      onSummarySuggestion,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-ai-button';

    const [hoverOpen, setHoverOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [phase, setPhase] = useState<'skeleton' | 'typing' | 'cached'>('skeleton');
    const generated = useRef(false);
    const showTimer = useRef<number | null>(null);
    const hideTimer = useRef<number | null>(null);

    const panelOpen =
      Boolean(summary) && !disabled && !dismissed && (summaryPinned || hoverOpen);

    /* The fake generation runs once per mount; every later opening shows
       the text instantly, as if cached. */
    useEffect(() => {
      if (!panelOpen) return;
      if (generated.current) {
        setPhase('cached');
        return;
      }
      setPhase('skeleton');
      const t = window.setTimeout(() => {
        generated.current = true;
        setPhase('typing');
      }, MOTION_SUMMARY_THINK_MS);
      return () => window.clearTimeout(t);
    }, [panelOpen]);

    useEffect(
      () => () => {
        if (showTimer.current) window.clearTimeout(showTimer.current);
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
      },
      [],
    );

    /* One hover zone: the host wraps the button and the panel, so pointer
       travel between them never leaves it. Entering cancels a pending hide;
       leaving hides after the exit grace. */
    const hostEnter = () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (!hoverOpen && !showTimer.current) {
        showTimer.current = window.setTimeout(() => {
          showTimer.current = null;
          setHoverOpen(true);
        }, MOTION_HOVER_SHOW_DELAY_MS);
      }
    };
    const hostLeave = () => {
      /* Leaving re-arms a dismissed panel: the X closes it for this visit,
         the next hover summons it fresh. */
      setDismissed(false);
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      if (hoverOpen && !hideTimer.current) {
        hideTimer.current = window.setTimeout(() => {
          hideTimer.current = null;
          setHoverOpen(false);
        }, MOTION_HOVER_EXIT_GRACE_MS);
      }
    };

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      disabled && `${baseClass}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {icon &&
          (typeof icon === 'string' ? (
            <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
              {icon}
            </span>
          ) : (
            <span className={`${baseClass}__icon`} aria-hidden="true">
              {icon}
            </span>
          ))}
        <span className={`${baseClass}__text`}>{label}</span>
      </>
    );

    const control =
      href && !disabled ? (
        <a
          {...(rest as React.ComponentPropsWithoutRef<'a'>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          rel={rel}
        >
          {content}
        </a>
      ) : (
        <button
          {...rest}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          disabled={disabled}
        >
          {content}
        </button>
      );

    if (!summary) return control;

    const panelClass = `${baseClass}__summary`;

    return (
      <div
        className={[
          `${baseClass}-host`,
          `${baseClass}-host--${summaryPlacement}`,
          panelOpen && `${baseClass}-host--open`,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={hostEnter}
        onMouseLeave={hostLeave}
      >
        {control}
        {/* Mounted whenever a summary exists, shown by the host's --open
            class, so closing can ease out the way HoverCard does —
            visibility keeps the hidden panel out of the accessibility tree
            and the tab order. */}
        <aside className={panelClass} aria-label={`Summary: ${summary.title}`}>
            <button
              type="button"
              className={`${panelClass}-dismiss`}
              aria-label="Dismiss summary"
              onClick={() => {
                setDismissed(true);
                setHoverOpen(false);
                onSummaryDismiss?.();
              }}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                close
              </span>
            </button>

            <span className={`${panelClass}-meta`}>
              <span className={`${panelClass}-overline`}>{summary.overline ?? 'AI summary'}</span>
              {summary.caption && (
                <span className={`${panelClass}-caption`}>{summary.caption}</span>
              )}
            </span>

            <span className={`${panelClass}-title`}>{summary.title}</span>

            <span className={`${panelClass}-text`}>
              {phase === 'skeleton' ? (
                <Skeleton variant="text" lines={3} />
              ) : phase === 'typing' ? (
                /* An invisible ghost of the finished text sizes the
                   container, so the type-out never jumps the panel and a
                   short summary leaves no reserved space behind it. */
                <>
                  <span className={`${panelClass}-text-ghost`} aria-hidden="true">
                    {summary.text}
                  </span>
                  <span className={`${panelClass}-text-reveal`}>
                    <StreamingText
                      text={summary.text}
                      streaming={false}
                      cursor
                      drainMs={MOTION_SUMMARY_REVEAL_MS}
                      onRevealComplete={() => setPhase('cached')}
                    />
                  </span>
                </>
              ) : (
                summary.text
              )}
            </span>

            {/* The chips arrive under the finished summary, the way the
                chat's follow-ups do — showing them while the panel still
                "thinks" would give the staging away. */}
            {summary.suggestions && summary.suggestions.length > 0 && phase === 'cached' && (
              <span className={`${panelClass}-actions`}>
                <PromptSuggestions
                  layout="stack"
                  size="compact"
                  ariaLabel="Suggested prompts"
                  suggestions={summary.suggestions}
                  onValueChange={onSummarySuggestion}
                />
              </span>
            )}
          </aside>
      </div>
    );
  },
);

AiButton.displayName = 'AiButton';
