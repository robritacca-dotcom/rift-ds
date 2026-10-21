'use client';

import React, { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM, { flushSync } from 'react-dom';
import './BentoTile.css';
import { CircularButton } from '../CircularButton/CircularButton';
import { ShaderField, type ShaderBlob, type ShaderParams } from '../ShaderField/ShaderField';
import { BentoTileArt } from './BentoTileArt';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';

/** Props owned by BentoTile itself; everything else falls through to the tile. */
type BentoTileOwnProps = {
  /**
   * The tile's heading, also the overlay's title.
   * Note: this shadows the native `title` tooltip attribute, which BentoTile does not expose.
   */
  title: React.ReactNode;
  /** A line under the heading. */
  description?: React.ReactNode;
  /** The heading level the title renders at, to fit the page's outline. Never `1`: a tile is never the page's top heading. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * What sits behind the content: the container surface with a shader pair
   * over it (a wash of light in the bottom-left corner with a line texture
   * laid over it, the default), the plain surface, or nothing.
   */
  background?: 'solid' | 'shader' | 'transparent';
  /**
   * Which of the six shader pairs the tile wears: pair N is ambient colour N
   * with texture N. Unset, tiles rotate through the set by their position
   * among their siblings, so a grid of shader tiles comes out told apart.
   */
  highlight?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Where the content sits in the space under the heading. Content that does not fit fades out at the edge it overflows. */
  align?: 'start' | 'center' | 'end';
  /** The tile's content. Inert while the tile is expandable, since the whole tile is then the control. */
  children?: React.ReactNode;
  /** What the overlay shows under the title. Passing it makes the tile expandable. */
  expandedContent?: React.ReactNode;
  /** Whether the overlay is open (controlled). */
  open?: boolean;
  /** Whether the overlay starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the overlay opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the expand control. Defaults to "Open" and the title, when the title is a string. */
  expandLabel?: string;
  /** Accessible name of the overlay's close control. */
  closeLabel?: string;
  /** Additional CSS classes on the tile. */
  className?: string;
};

export interface BentoTileProps
  extends BentoTileOwnProps,
    Omit<React.ComponentPropsWithoutRef<'article'>, keyof BentoTileOwnProps> {}

/**
 * The default composition: a pool of light in the bottom-left corner, led by
 * the tile's highlight with its two neighbours under it. The three colours
 * are tile-local properties BentoTile.css sets from the ambient tokens, the
 * colours the site's background field wears, so the wash follows the theme
 * and each tile in a set takes its own highlight.
 */
const DEFAULT_BLOBS: readonly ShaderBlob[] = [
  { token: '--_h1', size: 1.2, cx: -0.55, cy: 0.7, period: 20, phase: 0, weight: 3.2 },
  { token: '--_h2', size: 0.8, cx: -0.05, cy: 0.85, period: 17, phase: 1, weight: 1.8 },
  { token: '--_h3', size: 0.7, cx: -0.7, cy: 0.15, period: 22, phase: 0.6, weight: 1.6 },
];

/** Quiet defaults: no crop, no pointer reaction, a little grain. */
const DEFAULT_PARAMS: Partial<ShaderParams> = { crop: 0, react: 0, intensity: 0.9, streak: 0.15, warp: 0.18, grain: 0.05, speed: 1.2 };

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => {
    finished: Promise<void>;
    ready?: Promise<void>;
    updateCallbackDone?: Promise<void>;
  };
};

/** The class on the root while a tile morphs, scoping the transition rules in BentoTile.css. */
const MORPHING = 'ds-bento-tile-morphing';

/**
 * Runs a state change inside a view transition when the browser and the
 * visitor allow one, flagging the root for the length of it so the morph
 * rules apply to this transition alone.
 */
function morph(update: () => void): Promise<void> {
  const doc = document as ViewTransitionDoc;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || still) {
    update();
    return Promise.resolve();
  }
  const root = document.documentElement;
  root.classList.add(MORPHING);
  const transition = doc.startViewTransition(() => flushSync(update));
  // A transition skipped by a newer one (a fast reopen) rejects `ready` with
  // an AbortError, and nothing else observes it: left alone it surfaces as an
  // unhandled rejection in the host page. The state change still applied.
  transition.ready?.catch(() => {});
  transition.updateCallbackDone?.catch(() => {});
  return transition.finished.catch(() => {}).finally(() => root.classList.remove(MORPHING));
}

/**
 * Tracks which edges of a box its content overflows, so the tile can fade
 * those edges instead of cutting the content off hard.
 */
function useOverflow(ref: React.RefObject<HTMLElement | null>) {
  const [overflow, setOverflow] = useState({ x: false, y: false });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const y = el.scrollHeight > el.clientHeight + 1;
      const x = el.scrollWidth > el.clientWidth + 1;
      setOverflow((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    // Content that grows inside a child (a streaming answer) resizes the child.
    const mo = new MutationObserver(() => {
      for (const child of Array.from(el.children)) ro.observe(child);
      measure();
    });
    mo.observe(el, { childList: true });
    measure();
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref]);
  return overflow;
}

/**
 * BentoTile — a feature tile for a bento grid: a heading over a content area
 * with a safe inset, on a solid, shader or transparent background, that can
 * open into a full overlay. A shader background comes as a pair, a corner
 * wash with a line texture over it, and tiles rotate through six pairs.
 *
 * Content is laid out in flow below the heading, never beneath it or the
 * expand control, and content
 * that does not fit fades out at the edge it overflows. When `expandedContent`
 * is passed, the whole tile opens the overlay, morphing into it through a view
 * transition where the browser has one. The expand button is the accessible
 * handle, and the content goes inert, since a control inside a control
 * cannot be reached.
 *
 * The overlay renders through a portal into `document.body`; the forwarded ref
 * and any unrecognised props target the tile.
 */
export const BentoTile = React.forwardRef<HTMLElement, BentoTileProps>(
  (
    {
      title,
      description,
      headingLevel = 3,
      background = 'shader',
      highlight,
      align = 'center',
      children,
      expandedContent,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      expandLabel,
      closeLabel = 'Close',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const base = 'ds-bento-tile';
    const expandable = expandedContent !== undefined;
    const controlled = openProp !== undefined;
    const [openState, setOpenState] = useState(defaultOpen);
    const open = expandable && (controlled ? openProp : openState);

    /* The tile wears its view-transition name only while it is the morph's
       old or new side: one element per name per frame. `linked` holds from
       the start of an open until the end of the close. */
    const [linked, setLinked] = useState(open);
    const [backdrop, setBackdrop] = useState<'in' | 'out' | null>(open ? 'in' : null);
    /** Hovered or focused: the expand control steps up to the primary variant. */
    const [awake, setAwake] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const overflow = useOverflow(bodyRef);

    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const panelName = `ds-bento-${uid}`;
    const toggleName = `ds-bento-${uid}-toggle`;
    const titleId = `${panelName}-title`;

    /* A controlled parent can close the overlay without going through
       closeOverlay; release the shared name and fade the backdrop then too.
       Adjusted during render, React's pattern for state that follows a prop.
       `closing` marks the tile's own close, which releases the name only once
       its morph has finished. */
    const [closing, setClosing] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
      setPrevOpen(open);
      if (!open && !closing) {
        setLinked(false);
        setBackdrop((b) => (b === 'in' ? 'out' : b));
      }
    }

    const setOpen = useCallback(
      (next: boolean) => {
        if (!controlled) setOpenState(next);
        onOpenChange?.(next);
      },
      [controlled, onOpenChange],
    );

    const openOverlay = useCallback(() => {
      /* The overlay covers the tile, and a pointer that stays still under it
         never reports leaving, so the handle would keep its awake look after
         the close. Rest it here; focus returning to the handle wakes it
         again, in step with the border's own :has(:focus-visible). */
      setAwake(false);
      flushSync(() => setLinked(true));
      void morph(() => {
        setOpen(true);
        setBackdrop('in');
      });
    }, [setOpen]);

    const closeOverlay = useCallback(() => {
      flushSync(() => setClosing(true));
      void morph(() => {
        setOpen(false);
        setBackdrop('out');
      }).then(() => {
        setClosing(false);
        setLinked(false);
        triggerRef.current?.focus({ preventScroll: true });
      });
    }, [setOpen]);


    const Heading = `h${headingLevel}` as 'h3';
    const named = linked && !open;
    const label =
      expandLabel ?? (typeof title === 'string' ? `Open ${title}` : 'Open');

    const classes = [
      base,
      `${base}--${background}`,
      `${base}--align-${align}`,
      expandable ? `${base}--expandable` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const blobs = DEFAULT_BLOBS;
    // Before the field resolves, and wherever WebGL is missing, the same
    // tokens paint a plain gradient underneath it.
    const fallback = `linear-gradient(135deg, ${blobs
      .slice(0, 4)
      .map((b) => `var(${b.token})`)
      .join(', ')})`;

    return (
      <>
        <article
          {...rest}
          ref={ref}
          className={classes}
          data-linked={linked || undefined}
          data-highlight={highlight}
          onPointerEnter={(e) => {
            setAwake(true);
            rest.onPointerEnter?.(e);
          }}
          onPointerLeave={(e) => {
            setAwake(false);
            rest.onPointerLeave?.(e);
          }}
          style={{ ...rest.style, viewTransitionName: named ? panelName : undefined } as React.CSSProperties}
        >
          <div className={`${base}__surface`} aria-hidden="true">
            {background === 'shader' && (
              <div className={`${base}__shader`}>
                <div className={`${base}__shader-fallback`} style={{ background: fallback }} />
                {/* Keyed on the highlight: the field reads its colours when it
                    starts, so a new highlight needs a fresh field. */}
                <ShaderField
                  key={highlight ?? 'auto'}
                  className={`${base}__shader-field`}
                  blobs={blobs}
                  params={DEFAULT_PARAMS}
                />
              </div>
            )}
            {background === 'shader' && <BentoTileArt />}
          </div>

          <div className={`${base}__header`}>
            <Heading className={`${base}__title`}>{title}</Heading>
            {description && <p className={`${base}__description`}>{description}</p>}
          </div>

          <div
            ref={bodyRef}
            className={`${base}__body`}
            data-overflow-x={overflow.x || undefined}
            data-overflow-y={overflow.y || undefined}
            inert={expandable || undefined}
          >
            <div className={`${base}__content`}>{children}</div>
          </div>

          {expandable && (
            <>
              {/* The whole tile opens the overlay; the button is the accessible handle. */}
              <span className={`${base}__hit`} onClick={openOverlay} aria-hidden="true" />
              <CircularButton
                ref={triggerRef}
                icon="open_in_full"
                variant={awake ? 'primary' : 'secondary'}
                size="compact"
                ariaLabel={label}
                tooltip={false}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={`${base}__toggle`}
                onClick={openOverlay}
                onFocus={() => setAwake(true)}
                onBlur={() => setAwake(false)}
                style={{ viewTransitionName: named ? toggleName : undefined } as React.CSSProperties}
              />
            </>
          )}
        </article>

        {backdrop && <BentoTileBackdrop state={backdrop} onGone={() => setBackdrop(null)} />}
        {open && (
          <BentoTileOverlay
            title={title}
            titleId={titleId}
            panelName={panelName}
            toggleName={toggleName}
            closeLabel={closeLabel}
            onClose={closeOverlay}
          >
            {expandedContent}
          </BentoTileOverlay>
        )}
      </>
    );
  },
);

BentoTile.displayName = 'BentoTile';

/**
 * The frosted layer behind the panel. Deliberately not a named part of the
 * view transition: a named element is captured as a flat snapshot, and a
 * snapshot cannot sample what lies behind it, so a backdrop-filter blur would
 * render as plain tint for the whole morph and snap to blurred after it. Left
 * in the root, it renders live, so the blur is real throughout, and it fades
 * with CSS of its own. On close it stays mounted for its fade, then reports
 * gone.
 */
function BentoTileBackdrop({ state, onGone }: { state: 'in' | 'out'; onGone: () => void }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return ReactDOM.createPortal(
    <div
      className="ds-bento-tile-backdrop"
      data-state={state}
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (state === 'out' && e.target === e.currentTarget) onGone();
      }}
    />,
    document.body,
  );
}

type OverlayProps = {
  title: React.ReactNode;
  titleId: string;
  panelName: string;
  toggleName: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** The open tile: a dialog panel the tile morphs into. */
function BentoTileOverlay({ title, titleId, panelName, toggleName, closeLabel, onClose, children }: OverlayProps) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Shared overlay behaviors (src/behaviors/). The scroll lock cancels input
  // rather than pinning the body: pinning hides the page scrollbar, and on a
  // classic-scrollbar platform the page then shifts sideways under the morph.
  const layer = useLayer({ open: true, dismissOnEscape: true, onDismiss: onClose });
  useFocusScope(panelRef, { active: mounted, initialFocus: () => closeRef.current });
  useScrollLock(true, { strategy: 'cancel-events', allowWithin: scrollerRef });

  if (!mounted) return null;
  return ReactDOM.createPortal(
    <div className="ds-bento-tile-overlay">
      <div
        ref={scrollerRef}
        className="ds-bento-tile-overlay__scroller"
        onClick={(e) => e.target === e.currentTarget && layer.ownsPress() && onClose()}
      >
        <div
          ref={panelRef}
          className="ds-bento-tile-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{ viewTransitionName: panelName } as React.CSSProperties}
        >
          <CircularButton
            ref={closeRef}
            icon="close_fullscreen"
            variant="secondary"
            size="compact"
            ariaLabel={closeLabel}
            tooltip={false}
            className="ds-bento-tile-overlay__close"
            onClick={onClose}
            style={{ viewTransitionName: toggleName } as React.CSSProperties}
          />
          <h2 id={titleId} className="ds-bento-tile-overlay__title">
            {title}
          </h2>
          <div className="ds-bento-tile-overlay__body">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
