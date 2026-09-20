'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MOTION_SCROLL_SETTLE_MS } from '../../tokens/motion';
import './ChatThread.css';
import '../../fonts/material-symbols.css';

/* Content within this many pixels of the fold counts as "nothing left to
   scroll to" — the scroll-to-bottom control hides inside it. */
const JUMP_THRESHOLD_PX = 24;

/** Props owned by ChatThread itself — everything else falls through to the root element. */
type ChatThreadOwnProps = {
  /**
   * Scroll a newly appended turn to the top of the viewport, pushing the
   * prior conversation upward. When a user turn and the agent's pending
   * turn are appended in the same update, the first new child is the one
   * anchored — the response streams in below it. Detection diffs the DOM
   * child count, so replacing turns in place (a future regenerate or
   * edit-last-turn) neither re-anchors nor resizes the spacer.
   */
  anchor?: boolean;
  /** Accessible name for the scrollable conversation region. */
  ariaLabel?: string;
  /** Accessible name for the scroll-to-bottom control. */
  jumpLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** The conversation, in order: ChatMessages, ChatMarkers. */
  children?: React.ReactNode;
};

export interface ChatThreadProps
  extends ChatThreadOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ChatThreadOwnProps> {}

/**
 * ChatThread is the scrollable conversation column: consistent gutters, a
 * pure-CSS fade at either end so content scrolling out passes through it,
 * and the send choreography — a newly appended turn floats to the top of
 * the viewport while the prior conversation is pushed upward, leaving the
 * response room to stream in below.
 *
 * A trailing spacer grows just enough that even a short newest exchange can
 * reach the top, so the anchor position never depends on how much has been
 * said. The scrollbar stays hidden until the thread is actually scrolling,
 * and rides the component's far edge — the content gutters live on an inner
 * wrapper, overridable via `--ds-chat-thread-padding-inline`.
 *
 * The smooth scroll respects reduced motion (the motion tokens' guard forces
 * instant scrolling). Forwards a ref to the scrollable root element.
 */
export const ChatThread = React.forwardRef<HTMLDivElement, ChatThreadProps>(
  (
    {
      anchor = true,
      ariaLabel = 'Conversation',
      jumpLabel = 'Scroll to the latest message',
      className = '',
      children,
      onScroll,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-chat-thread';

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const spacerRef = useRef<HTMLDivElement | null>(null);
    const prevCount = useRef(0);
    /* Distinguishes a thread that mounted empty (first send floats up) from
       one that mounted with a restored transcript (renders in place). */
    const mounted = useRef(false);
    /* The scroll offset the newest turn is anchored at, kept reachable by
       the spacer for the whole exchange — not just at send time. */
    const anchorTop = useRef<number | null>(null);

    /* Size the trailing spacer so the anchor position stays scrollable, and
       so it holds no more room than that. The spacer is exactly the shortfall
       between the anchor and what the content can already reach, which makes
       the scroll range end precisely at the anchor: the pinned turn stays
       reachable, and nothing below it is reachable that should not be.

       Tracking the shortfall in both directions is what keeps the dead space
       honest. Sized once at send — when the response is still empty — the
       spacer would hold a viewport of room forever, long after a growing
       answer had filled that room itself, leaving a void under the last
       line. It shrinks to nothing as the answer grows, with no jump at the
       end, because the range it defines never moves.

       Growing it back is the direction that needs the clamp guard below:
       content shrinking mid-exchange (the reasoning row unmounting at the
       handoff) pulls the range under the anchor a frame before this can
       react. */
    const sizeSpacer = () => {
      const container = scrollRef.current;
      const content = contentRef.current;
      const spacer = spacerRef.current;
      const top = anchorTop.current;
      if (!container || !content || !spacer || top == null) return;
      const needed = Math.max(0, top + container.clientHeight - content.offsetHeight);
      if (Math.abs(needed - spacer.offsetHeight) > 1) spacer.style.height = `${needed}px`;
    };

    useEffect(() => {
      const container = scrollRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      /* Publish the measured scrollbar gutter so the CSS can subtract it
         from the content's right padding: the column stays perfectly
         symmetric and the scrollbar rides outside it, tucked to the far
         edge. Zero on overlay-scrollbar platforms. (offsetWidth minus
         clientWidth also counts borders — the root has none, and the CSS
         clamps at zero if a consumer ever adds one.) */
      const syncGutter = () => {
        const gutter = container.offsetWidth - container.clientWidth;
        container.style.setProperty('--ds-chat-thread-gutter', `${gutter}px`);
      };
      const observer = new ResizeObserver(() => {
        syncGutter();
        /* Growing the spacer restores the scroll RANGE, but never in time:
           the browser clamps the scroll POSITION during the same layout pass
           that shrank the content, and a ResizeObserver only runs afterwards.
           So the anchored turn sags by whatever height the content just gave
           up — most visibly when the reasoning disclosure unmounts at the
           thinking-to-streaming handoff, taking its row out from under a
           pinned turn.

           Put the position back as well. Only when the scroll was sitting at
           the very bottom of the range, which is the signature of a clamp: a
           reader who scrolled up on purpose is somewhere inside the range,
           and is left where they are. */
        const top = anchorTop.current;
        const wasClamped =
          top != null &&
          container.scrollTop < top &&
          container.scrollTop >= container.scrollHeight - container.clientHeight - 1;
        sizeSpacer();
        // Instant: this is undoing a jump, not performing one.
        if (top != null && wasClamped) container.scrollTo({ top, behavior: 'instant' });
        updateJump();
      });
      observer.observe(container);
      observer.observe(content);
      return () => observer.disconnect();
    }, []);

    const [scrolling, setScrolling] = useState(false);
    const settleTimer = useRef<number | undefined>(undefined);

    /* Whether there is any CONTENT left to scroll to — drives the
       scroll-to-bottom control's visibility. Measured against the content
       column, not the scroll range: the trailing spacer adds dead space
       below the last turn, and dead space is not something to scroll to. */
    const [canScrollDown, setCanScrollDown] = useState(false);
    const updateJump = () => {
      const container = scrollRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      const remaining = content.offsetHeight - container.scrollTop - container.clientHeight;
      const next = remaining > JUMP_THRESHOLD_PX;
      setCanScrollDown((prev) => (prev === next ? prev : next));
    };

    /** Keep the internal ref (used for anchoring) while honouring a forwarded one. */
    const setRef = (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    /* The send choreography. On append, size the trailing spacer so the
       first new turn can sit exactly at the top of the viewport, then let
       the CSS scroll-behavior carry the animation. Content that later
       streams in below the viewport never moves the scroll position, so
       the anchored turn stays put while the response grows.

       The effect runs after every render and diffs the *DOM* child count —
       React.Children.count would count conditional `{x && ...}` slots that
       render nothing, drifting the anchor index off the real children. It
       is a layout effect so the spacer and scroll are in place before the
       appended turn ever paints — an ordinary effect lets one frame paint
       un-anchored first, which reads as a jitter on send. */
    useLayoutEffect(() => {
      const container = scrollRef.current;
      const content = contentRef.current;
      const spacer = spacerRef.current;
      if (!container || !content || !spacer) return;

      const childCount = content.children.length;
      const previous = prevCount.current;
      const isFirstRun = !mounted.current;
      mounted.current = true;
      if (childCount === previous) return;
      prevCount.current = childCount;

      if (childCount < previous) {
        // Conversation reset — collapse the spacer and return to the top.
        anchorTop.current = null;
        spacer.style.height = '0px';
        container.scrollTo({ top: 0 });
        return;
      }
      if (isFirstRun) {
        /* Mounted with a restored transcript (the widget reopening on an
           existing conversation): open at the latest message, instantly —
           there is no send to choreograph. Re-establishing the anchor also
           restores the spacer's clamp protection for a still-live stream. */
        if (childCount > 0 && anchor) {
          const target = Math.max(0, content.offsetHeight - container.clientHeight);
          anchorTop.current = target;
          sizeSpacer();
          container.scrollTo({ top: target, behavior: 'instant' });
          updateJump();
        }
        return;
      }
      if (!anchor) return;

      const contentStyle = getComputedStyle(content);
      const paddingTop = parseFloat(contentStyle.paddingTop) || 0;

      if (previous === 0) {
        /* First send into an empty thread: there is no scroll distance yet,
           so the send choreography is a transform instead — the new turn
           starts at composer level and floats up to the anchor position.
           The transition lives in the CSS; reduced motion zeroes it. */
        const target = content.children[0] as HTMLElement | undefined;
        if (!target) return;
        anchorTop.current = 0;
        sizeSpacer();
        const paddingBottom = parseFloat(contentStyle.paddingBottom) || 0;
        const rise = Math.max(
          0,
          container.clientHeight - target.offsetHeight - paddingTop - paddingBottom,
        );
        content.style.transition = 'none';
        content.style.transform = `translateY(${rise}px)`;
        void content.offsetHeight; // flush, so the glide starts from the offset
        content.style.transition = '';
        content.style.transform = '';
        return;
      }

      const target = content.children[previous] as HTMLElement | undefined;
      if (!target) return;

      /* No intermediate zeroing: sizeSpacer measures the content directly,
         and collapsing the (still grown) spacer first would clamp the
         scroll position upward for the start of the glide — a flash of
         the earlier conversation before the new turn scrolls up. */
      const targetTop = target.offsetTop - paddingTop;
      anchorTop.current = targetTop;
      sizeSpacer();

      // No behavior option: the element's CSS scroll-behavior decides, so
      // the reduced-motion guard makes this instant without any JS branch.
      container.scrollTo({ top: targetTop });
    });

    /* Content streaming in below the fold changes what there is to scroll
       to without firing scroll or resize on the container itself. */
    useEffect(updateJump);

    /* The scrollbar shows only while scrolling is actually happening. */
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e);
      updateJump();
      setScrolling(true);
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(
        () => setScrolling(false),
        MOTION_SCROLL_SETTLE_MS,
      );
    };

    /* Smooth via the container's CSS scroll-behavior; instant under
       reduced motion. Targets the bottom of the content column, not the
       scroll range — past it lies only the spacer's dead space. */
    const jumpToBottom = () => {
      const container = scrollRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      container.scrollTo({ top: content.offsetHeight - container.clientHeight });
    };

    useEffect(() => () => window.clearTimeout(settleTimer.current), []);

    const classes = [baseClass, scrolling ? `${baseClass}--scrolling` : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={setRef}
        className={classes}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onScroll={handleScroll}
      >
        <div ref={contentRef} className={`${baseClass}__content`}>
          {children}
        </div>
        <div ref={spacerRef} className={`${baseClass}__spacer`} aria-hidden="true" />
        <div className={`${baseClass}__jump-slot`} aria-hidden={!canScrollDown}>
          <button
            type="button"
            className={`${baseClass}__jump${canScrollDown ? ` ${baseClass}__jump--visible` : ''}`}
            tabIndex={canScrollDown ? 0 : -1}
            aria-label={jumpLabel}
            onClick={jumpToBottom}
          >
            <span className={`${baseClass}__jump-icon material-symbols-rounded`} aria-hidden="true">
              arrow_downward
            </span>
          </button>
        </div>
      </div>
    );
  },
);

ChatThread.displayName = 'ChatThread';
