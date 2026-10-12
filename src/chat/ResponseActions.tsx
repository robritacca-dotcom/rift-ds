'use client';

import { useEffect, useRef, useState } from 'react';
import { MOTION_FEEDBACK_RESET_MS } from '../tokens/motion';
import { useChatWidget } from './context';
import type { ChatTurn } from './types';

/**
 * The row under a committed assistant turn: copy, and, when the server
 * logged the exchange and the provider has somewhere to send a verdict,
 * thumbs up and down. A scripted transport never sends an exchange id, so
 * it shows copy alone: the thumbs would have nothing to rate.
 *
 * Deliberately not the library's MessageActions component: its items API
 * swaps an icon by name, which cannot crossfade, and this row's copied-tick
 * (status colour, scale-and-fade swap) and filled chosen thumb both need
 * styling per element that the items shape does not carry.
 *
 * Copy takes the turn's raw markdown, not the rendered text: it pastes back
 * into anything that reads markdown, and plain readers still get the words.
 */
export function ResponseActions({ turn }: { turn: ChatTurn }) {
  const { submitFeedback } = useChatWidget();
  const [copied, setCopied] = useState(false);
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (revertTimer.current !== null) clearTimeout(revertTimer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(turn.text);
    } catch {
      // Clipboard denied: nothing was copied, so the button must not say it was.
      return;
    }
    setCopied(true);
    if (revertTimer.current !== null) clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
  };

  const vote = (verdict: 'up' | 'down') => {
    if (!turn.exchangeId || !submitFeedback || turn.feedback === verdict) return;
    submitFeedback(turn.id, turn.exchangeId, verdict);
  };

  const iconClass = (hidden: boolean, tick = false) =>
    [
      'ds-chat-widget__action-icon',
      tick ? 'ds-chat-widget__action-icon--tick' : '',
      hidden ? 'ds-chat-widget__action-icon--hidden' : '',
      'material-symbols-rounded',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <>
      <button
        type="button"
        className="ds-chat-widget__action"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy response'}
      >
        {/* Both icons occupy the same cell; the swap is a crossfade-and-scale
            between them, not a text change, which is what makes it animatable. */}
        <span className={iconClass(copied)} aria-hidden="true">
          content_copy
        </span>
        <span className={iconClass(!copied, true)} aria-hidden="true">
          check
        </span>
      </button>

      {turn.exchangeId && submitFeedback && (
        <>
          <button
            type="button"
            className="ds-chat-widget__action"
            onClick={() => vote('up')}
            aria-label="Good response"
            aria-pressed={turn.feedback === 'up'}
          >
            <span className={iconClass(false)} aria-hidden="true">
              thumb_up
            </span>
          </button>
          <button
            type="button"
            className="ds-chat-widget__action"
            onClick={() => vote('down')}
            aria-label="Bad response"
            aria-pressed={turn.feedback === 'down'}
          >
            <span className={iconClass(false)} aria-hidden="true">
              thumb_down
            </span>
          </button>
        </>
      )}

      {/* The visual state change is silent to a screen reader; this is not. */}
      <span className="ds-chat-widget__sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  );
}
