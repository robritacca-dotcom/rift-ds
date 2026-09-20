'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { CircularButton } from '../CircularButton/CircularButton';
import '../../fonts/material-symbols.css';
import './Composer.css';

/** Props owned by Composer itself — everything else falls through to the <textarea>. */
type ComposerOwnProps = {
  /** Current value for controlled use. Pair with `onValueChange`. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: string) => void;
  /**
   * Fires with the current value on Enter (without Shift) and on the send
   * button — never while `streaming`, and never when the trimmed value is
   * empty. Composer does not clear the value: the consumer owns it and clears
   * it after a successful submit. Shadows the native `onSubmit` attribute,
   * which never fires on a textarea anyway.
   */
  onSubmit?: (value: string) => void;
  /**
   * A response is streaming: the send button becomes a stop button, submit
   * is blocked, and Enter is inert. On a glowing composer (`aiGlow`) the
   * gradient ring also stays lit and keeps turning while this is true.
   */
  streaming?: boolean;
  /** Fires when the stop button is pressed while `streaming`. */
  onStop?: () => void;
  /** Growth cap in text rows before the textarea scrolls internally. */
  maxRows?: number;
  /**
   * While focused, the shell wears AiButton's slowly rotating gradient ring
   * and glow in place of the plain selected border — the system's "a model
   * answers here" signal, for composers whose messages are answered by one.
   * While `streaming`, the ring stays lit and turning whether or not the
   * field holds focus. Off by default.
   */
  aiGlow?: boolean;
  /**
   * Contextual note rendered as a full-width, non-interactive chip at the
   * very top of the shell, above any attachments — the "what the model is
   * looking at" line a chat host pins over the message ("Looking at
   * “Page name”"). One line: a note too long for the shell truncates with
   * an ellipsis. Composer owns the chip's chrome; the caller passes the
   * text.
   */
  context?: React.ReactNode;
  /**
   * Material Symbol name rendered at the left of the context chip
   * (`visibility`, `article`…). Decorative and hidden from assistive
   * technology — the chip's text carries the meaning. None by default,
   * matching the ai set's icon-free-unless-asked convention.
   */
  contextIcon?: string;
  /**
   * Attachment row rendered above the textarea (DocumentChips). Fully
   * controlled by the caller — Composer never owns the list.
   */
  attachments?: React.ReactNode;
  /** Leading actions on the left of the action bar (attach button, model picker). */
  actions?: React.ReactNode;
  /**
   * Trailing actions on the right of the action bar, just before the send
   * button (dictation, voice mode).
   */
  trailingActions?: React.ReactNode;
  /** Accessible label for the send button. */
  sendLabel?: string;
  /** Accessible label for the stop button. */
  stopLabel?: string;
  /** Additional CSS classes — applied to the shell, not the <textarea>. */
  className?: string;
};

export interface ComposerProps
  extends ComposerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'textarea'>, keyof ComposerOwnProps> {}

/**
 * Composer is the chat input shell: an optional context note ("Looking at
 * “Page name”"), an attachments row, an auto-growing textarea, a leading
 * actions slot, and a trailing send button — the one sanctioned
 * primary-action teal in the chat set, because sending a message is a
 * genuine primary CTA. While `streaming`, send becomes stop and Enter
 * is inert.
 *
 * The textarea grows with its content up to `maxRows`, then scrolls
 * internally. Where the browser supports `field-sizing: content` the sizing
 * is fully native; elsewhere a measurement effect keeps the height in step.
 * Either way the text zone glides between the two heights rather than
 * snapping — 75ms, short enough to soften the step without reading as an
 * animation. The action bar's buttons never move relative to the bar.
 *
 * Forwards a ref to the underlying `<textarea>` and spreads unrecognised
 * props onto it; `className` lands on the shell.
 */
export const Composer = React.forwardRef<HTMLTextAreaElement, ComposerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onSubmit,
      streaming = false,
      onStop,
      maxRows = 8,
      aiGlow = false,
      context,
      contextIcon,
      attachments,
      actions,
      trailingActions,
      sendLabel = 'Send message',
      stopLabel = 'Stop generating',
      className = '',
      onChange,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-composer';
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
    const currentValue = isControlled ? value : uncontrolledValue;

    const disabled = Boolean(rest.disabled);
    const canSend = !disabled && currentValue.trim() !== '';

    /** Keep the internal ref (used for auto-grow) while honouring a forwarded one. */
    const setTextareaRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useLayoutEffect(() => {
      const node = textareaRef.current;
      if (!node) return;
      // Native sizing takes over where supported — see the @supports block in the CSS.
      if (typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content')) return;
      node.style.height = 'auto';
      node.style.height = `${node.scrollHeight}px`;
    }, [currentValue]);

    /* The text zone animates between heights (see the transition in the CSS),
       which needs the measured height as a number rather than `auto`. A
       ResizeObserver publishes it on every cause at once: a wrapped or deleted
       line, a clear after send, and a rewrap when the shell changes width. */
    useLayoutEffect(() => {
      const node = textareaRef.current;
      const content = contentRef.current;
      if (!node || !content) return;
      const observer = new ResizeObserver(() => {
        content.style.setProperty('--ds-composer-text-height', `${node.offsetHeight}px`);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const submit = () => {
      if (streaming || !canSend) return;
      onSubmit?.(currentValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setUncontrolledValue(e.target.value);
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Inert while streaming or trimmed-empty — submit() guards both.
        submit();
      }
    };

    /* The whole shell is the input affordance: clicking anywhere that is not
       a control focuses the textarea, so the click target is the visible
       shape rather than the text line inside it. */
    const handleShellClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, textarea, input, select, [role="button"]')) return;
      textareaRef.current?.focus();
    };

    const classes = [
      baseClass,
      aiGlow ? `${baseClass}--ai-glow` : '',
      streaming ? `${baseClass}--streaming` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // The textarea needs an accessible name; default one in when the caller
    // provides neither aria-label nor aria-labelledby.
    const ariaLabel =
      rest['aria-label'] ?? (rest['aria-labelledby'] !== undefined ? undefined : 'Message');

    return (
      <div
        className={classes}
        style={{ '--ds-composer-max-rows': maxRows } as React.CSSProperties}
        onClick={handleShellClick}
      >
        {context && (
          <div className={`${baseClass}__context`}>
            {contextIcon && (
              <span className={`${baseClass}__context-icon`} aria-hidden="true">
                <span className="material-symbols-rounded">{contextIcon}</span>
              </span>
            )}
            <span className={`${baseClass}__context-text`}>{context}</span>
          </div>
        )}

        {attachments && <div className={`${baseClass}__attachments`}>{attachments}</div>}

        <div className={`${baseClass}__content`} ref={contentRef}>
          <textarea
            {...rest}
            ref={setTextareaRef}
            className={`${baseClass}__textarea`}
            rows={1}
            value={currentValue}
            aria-label={ariaLabel}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={`${baseClass}__footer`}>
          {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
          <div className={`${baseClass}__trailing`}>
            {trailingActions}
            {streaming ? (
              <CircularButton
                icon="stop"
                variant="primary"
                ariaLabel={stopLabel}
                disabled={disabled}
                onClick={onStop}
              />
            ) : (
              <CircularButton
                icon="arrow_upward"
                variant="primary"
                ariaLabel={sendLabel}
                disabled={!canSend}
                onClick={submit}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

Composer.displayName = 'Composer';
