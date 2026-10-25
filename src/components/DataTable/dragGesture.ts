/**
 * One pointer drag, the way every grip in DataTable runs (resize, column
 * move, row move): the pointer is captured on the element pressed, so the
 * move and release events come to it without a document listener; moves
 * are coalesced to one per animation frame and handed to `onFrame`, which
 * writes the DOM directly; React state is committed once, by `onEnd`, when
 * the pointer lets go. That is the site's gesture rule (CLAUDE.md, the
 * Gestures row): a drag that set state on every move re-rendered the whole
 * table per frame. A press that never travels `threshold` pixels is not a
 * drag, so a click on the same element still clicks.
 */

export interface DragHandlers {
  /** Pixels the pointer must travel before the press becomes a drag. */
  threshold?: number;
  /** The drag has begun (the threshold was crossed). */
  onStart?: () => void;
  /** One frame of movement, with the offset from the press. Write the DOM here, never state. */
  onFrame: (dx: number, dy: number, event: PointerEvent) => void;
  /** The pointer let go after a drag, after one last `onFrame` at the release point. Commit state here, once. */
  onEnd: (dx: number, dy: number, event: PointerEvent) => void;
  /** The drag was cancelled (pointercancel, or the capture was lost). Restore the DOM. */
  onCancel?: () => void;
}

export function startDrag(event: React.PointerEvent<HTMLElement>, handlers: DragHandlers): void {
  if (event.button !== 0) return;
  const target = event.currentTarget;
  const originX = event.clientX;
  const originY = event.clientY;
  const threshold = handlers.threshold ?? 4;
  let dragging = false;
  let frame = 0;
  let last: PointerEvent | null = null;

  try {
    target.setPointerCapture(event.pointerId);
  } catch {
    return;
  }

  const flush = () => {
    frame = 0;
    if (last) handlers.onFrame(last.clientX - originX, last.clientY - originY, last);
  };

  const cleanup = () => {
    cancelAnimationFrame(frame);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', up);
    target.removeEventListener('pointercancel', cancel);
    target.removeEventListener('lostpointercapture', cancel);
  };

  function move(ev: PointerEvent) {
    if (!dragging) {
      if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < threshold) return;
      dragging = true;
      handlers.onStart?.();
    }
    last = ev;
    if (!frame) frame = requestAnimationFrame(flush);
  }

  function up(ev: PointerEvent) {
    cleanup();
    // A quick flick can release before any move crossed the threshold or
    // any frame ran: judge it by where it let go, and run its last frame
    // here, so the handlers always end on the final position.
    if (!dragging) {
      if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < threshold) return;
      dragging = true;
      handlers.onStart?.();
    }
    handlers.onFrame(ev.clientX - originX, ev.clientY - originY, ev);
    // A drag that ends on the pressed element must not also click it.
    const swallow = (click: Event) => {
      click.stopPropagation();
      click.preventDefault();
    };
    target.addEventListener('click', swallow, { capture: true, once: true });
    requestAnimationFrame(() => target.removeEventListener('click', swallow, { capture: true }));
    handlers.onEnd(ev.clientX - originX, ev.clientY - originY, ev);
  }

  function cancel() {
    cleanup();
    if (dragging) handlers.onCancel?.();
  }

  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', up);
  target.addEventListener('pointercancel', cancel);
  // A normal release removes these listeners first, so a capture lost
  // while they are still attached (the element left the DOM, another
  // capture took over) is always a cancel.
  target.addEventListener('lostpointercapture', cancel);
}
