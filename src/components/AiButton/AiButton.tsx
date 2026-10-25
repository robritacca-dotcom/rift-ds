'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLayer } from '../../behaviors/useLayer';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { AgentStatusMark } from '../AgentStatus/AgentStatus';
import type { AgentStatusState } from '../AgentStatus/AgentStatusPatterns';
import { PromptSuggestions, type PromptSuggestion } from '../PromptSuggestions/PromptSuggestions';
import { Skeleton } from '../Skeleton/Skeleton';
import { StreamingText } from '../StreamingText/StreamingText';
import {
  MOTION_HOVER_SHOW_DELAY_MS,
  MOTION_HOVER_EXIT_GRACE_MS,
  MOTION_SUMMARY_THINK_MS,
  MOTION_SUMMARY_REVEAL_MS,
  MOTION_FEEDBACK_RESET_MS,
} from '../../tokens/motion';
import '../../behaviors/visually-hidden.css';
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

/** What a screen reader hears for each status; `idle` says nothing. */
const DEFAULT_STATUS_LABELS: Record<AgentStatusState, string> = {
  idle: '',
  thinking: 'Thinking',
  working: 'Working',
  waiting: 'Waiting for you',
  done: 'Done',
  error: 'Failed',
};

/** The statuses drawn as a glyph rather than the working mark. */
const STATUS_GLYPHS: Partial<Record<AgentStatusState, string>> = {
  waiting: 'front_hand',
  done: 'check_circle',
  error: 'error',
};

/** The statuses that spin the ring and hold the summary panel shut. */
const BUSY_STATUSES: readonly AgentStatusState[] = ['thinking', 'working'];

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
  /**
   * What the agent behind the button is doing, in AgentStatus's vocabulary.
   * The label never changes; the icon carries the state. `thinking` and
   * `working` show AgentStatusMark and spin the ring faster, `waiting` shows
   * a raised hand in the warning colour with the ring at rest, and `done` and
   * `error` turn the button to their status colours with a check or an
   * error glyph, then return to the resting look after a beat. The button stays clickable throughout, unlike Button's
   * `loading`, so a click can open the conversation to watch the work.
   */
  status?: AgentStatusState;
  /** What a screen reader hears when the status changes, given the status. Defaults to English per status; `idle` says nothing. */
  statusLabel?: (status: AgentStatusState) => string;
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
   * What the agent needs from the person while `status` is `waiting`: any
   * content, drawn in a glass panel at the button. An InterruptCard approval
   * is the usual filling; a question, a form or a preview work the same way.
   * It opens each time the status becomes `waiting` and stays open without
   * hover. Escape or a click on the button folds it back into the button,
   * where the raised hand keeps showing, and another click opens it again.
   * While it is open the summary panel never opens.
   */
  request?: React.ReactNode;
  /** Whether the request panel is open, for a host that owns it (say, to keep it shut while the chat shows the request). Leave undefined to let the button manage it. */
  requestOpen?: boolean;
  /** Whether the request panel starts open, when the button manages it. Each later move into `waiting` opens it again. */
  defaultRequestOpen?: boolean;
  /** Fires when the request panel opens or closes, including when a move into `waiting` opens it. */
  onRequestOpenChange?: (open: boolean) => void;
  /** Which side of the button the request panel opens on. */
  requestPlacement?: 'top' | 'bottom';
  /** Accessible name of the request panel. */
  requestRegionLabel?: string;
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
  /** Accessible name of the summary panel, given the summary's title. Defaults to "Summary: " followed by the title. */
  summaryRegionLabel?: (title: string) => string;
  /** Accessible name of the summary panel's dismiss button. */
  dismissLabel?: string;
  /** Accessible name of the summary panel's group of prompt chips. */
  suggestionsLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component the link renders with, such as Next.js's `Link`, so it
   * navigates through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
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
      status,
      statusLabel = (s: AgentStatusState) => DEFAULT_STATUS_LABELS[s],
      href,
      target,
      rel,
      summary,
      summaryPlacement = 'top',
      request,
      requestOpen,
      defaultRequestOpen = true,
      onRequestOpenChange,
      requestPlacement = 'top',
      requestRegionLabel = 'Waiting for you',
      onClick,
      summaryPinned = false,
      onSummaryDismiss,
      onSummarySuggestion,
      summaryRegionLabel = (title: string) => `Summary: ${title}`,
      dismissLabel = 'Dismiss summary',
      suggestionsLabel = 'Suggested prompts',
      className = '',
      linkComponent,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-ai-button';
    const Link = useLinkComponent(linkComponent);

    const [hoverOpen, setHoverOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [phase, setPhase] = useState<'skeleton' | 'typing' | 'cached'>('skeleton');
    const generated = useRef(false);
    const showTimer = useRef<number | null>(null);
    const hideTimer = useRef<number | null>(null);

    const isBusy = status !== undefined && BUSY_STATUSES.includes(status);

    /* The request panel: the controlled/uncontrolled pair, reopened by every
       move into waiting so a new request is never missed. */
    const hostRef = useRef<HTMLDivElement>(null);
    const requestId = useId();
    const [ownRequestOpen, setOwnRequestOpen] = useState(defaultRequestOpen);
    const isRequestOpen = requestOpen ?? ownRequestOpen;
    const setRequestOpen = useCallback(
      (next: boolean) => {
        if (requestOpen === undefined) setOwnRequestOpen(next);
        onRequestOpenChange?.(next);
      },
      [requestOpen, onRequestOpenChange],
    );
    const lastStatus = useRef(status);
    useEffect(() => {
      const entered = status === 'waiting' && lastStatus.current !== 'waiting';
      lastStatus.current = status;
      if (entered && request) setRequestOpen(true);
    }, [status, request, setRequestOpen]);
    const hasRequest = Boolean(request) && status === 'waiting' && !disabled;
    const requestShown = hasRequest && isRequestOpen;
    useLayer({
      open: requestShown,
      onDismiss: () => setRequestOpen(false),
      getElements: () => [hostRef.current],
    });

    const panelOpen =
      Boolean(summary) &&
      !disabled &&
      !isBusy &&
      !requestShown &&
      !dismissed &&
      (summaryPinned || hoverOpen);

    /* The host's handler runs first; a click it does not prevent folds or
       opens a waiting request. */
    const handleClick = (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && hasRequest) setRequestOpen(!isRequestOpen);
    };
    const requestAria = hasRequest
      ? { 'aria-expanded': requestShown, 'aria-controls': requestId }
      : {};

    /* Done and error are moments, not resting states: their glyph shows for
       a beat, then the resting icon returns while the host's status stays. */
    const isTerminal = status === 'done' || status === 'error';
    const [settled, setSettled] = useState(false);
    useEffect(() => {
      setSettled(false);
      if (!isTerminal) return;
      const t = window.setTimeout(() => setSettled(true), MOTION_FEEDBACK_RESET_MS);
      return () => window.clearTimeout(t);
    }, [status, isTerminal]);
    const shownStatus: AgentStatusState =
      status === undefined || (isTerminal && settled) ? 'idle' : status;

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
      isBusy && `${baseClass}--busy`,
      (shownStatus === 'done' || shownStatus === 'error') && `${baseClass}--${shownStatus}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconClass = `${baseClass}__icon`;
    const restingIcon =
      typeof icon === 'string' ? (
        <span className={`${iconClass}-glyph material-symbols-rounded`}>{icon}</span>
      ) : (
        icon
      );
    const shownIcon =
      shownStatus === 'idle' ? (
        restingIcon
      ) : shownStatus in STATUS_GLYPHS ? (
        <span
          className={`${iconClass}-glyph ${iconClass}-glyph--${shownStatus} material-symbols-rounded`}
        >
          {STATUS_GLYPHS[shownStatus]}
        </span>
      ) : (
        <AgentStatusMark state={shownStatus} />
      );

    /* The icon slot is a fixed --icon-size box, so every state's icon takes
       exactly the room the resting one did. Keyed on the shown state, the
       new icon fades in over the old one's place. */
    const content = (
      <>
        {(icon || status !== undefined) && (
          <span className={iconClass} aria-hidden="true">
            <span
              key={shownStatus}
              className={`${iconClass}-swap${status !== undefined ? ` ${iconClass}-swap--animated` : ''}`}
            >
              {shownStatus === 'idle' && !icon ? null : shownIcon}
            </span>
          </span>
        )}
        <span className={`${baseClass}__text`}>{label}</span>
      </>
    );

    const control =
      href && !disabled ? (
        <Link
          {...(rest as React.ComponentPropsWithoutRef<'a'>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          rel={rel}
          aria-busy={isBusy || undefined}
          onClick={handleClick}
          {...requestAria}
        >
          {content}
        </Link>
      ) : (
        <button
          {...rest}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          disabled={disabled}
          aria-busy={isBusy || undefined}
          onClick={handleClick}
          {...requestAria}
        >
          {content}
        </button>
      );

    /* A polite region beside the control, never inside it: text inside the
       button would join its accessible name. Mounted whenever the host
       reports a status, so it exists before the first change it announces. */
    const announcer =
      status !== undefined ? (
        <span className="ds-visually-hidden" role="status">
          {statusLabel(status)}
        </span>
      ) : null;

    /* Mounted whenever a request exists, shown by its --open class, so it
       eases out the way the summary does; visibility keeps the folded panel
       out of the accessibility tree and the tab order. */
    const requestPanel = request ? (
      <aside
        id={requestId}
        className={[
          `${baseClass}__request`,
          `${baseClass}__request--${requestPlacement}`,
          requestShown && `${baseClass}__request--open`,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={requestRegionLabel}
      >
        {request}
      </aside>
    ) : null;

    if (!summary && !request)
      return announcer ? (
        <>
          {control}
          {announcer}
        </>
      ) : (
        control
      );

    const panelClass = `${baseClass}__summary`;

    return (
      <div
        ref={hostRef}
        className={[
          `${baseClass}-host`,
          `${baseClass}-host--${summaryPlacement}`,
          panelOpen && `${baseClass}-host--open`,
          requestShown && `${baseClass}-host--request-open`,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={summary ? hostEnter : undefined}
        onMouseLeave={summary ? hostLeave : undefined}
      >
        {control}
        {announcer}
        {requestPanel}
        {/* Mounted whenever a summary exists, shown by the host's --open
            class, so closing can ease out the way HoverCard does —
            visibility keeps the hidden panel out of the accessibility tree
            and the tab order. */}
        {summary && (
        <aside className={panelClass} aria-label={summaryRegionLabel(summary.title)}>
            <button
              type="button"
              className={`${panelClass}-dismiss`}
              aria-label={dismissLabel}
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
                  ariaLabel={suggestionsLabel}
                  suggestions={summary.suggestions}
                  onValueChange={onSummarySuggestion}
                />
              </span>
            )}
          </aside>
        )}
      </div>
    );
  },
);

AiButton.displayName = 'AiButton';
