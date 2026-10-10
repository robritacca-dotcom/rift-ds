import React from 'react';
import './Widget.css';

/* ============================================
   Widget — the tile
   ============================================ */

/** Props owned by Widget itself — everything else falls through to the root `<section>`. */
type WidgetOwnProps = {
  /** The tile's heading. Also the section's accessible name, unless an `aria-label` is passed. Note: this shadows the native `title` tooltip attribute, which Widget does not expose. */
  title: string;
  /** A quiet figure after the title: how many rows the tile holds, how many are open. */
  count?: number;
  /** Trailing header slot, opposite the title — a compact button, a link, a period label. */
  action?: React.ReactNode;
  /** Heading element for the title, so the tile takes its place in the page's outline. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** The tile's body: WidgetRows, WidgetGroups, a chart, a figure, anything. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface WidgetProps
  extends WidgetOwnProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof WidgetOwnProps> {}

/**
 * Widget — a titled tile for a dashboard or a home screen: a heading with an
 * optional count, then whatever the tile is about. The surface is the
 * system's translucent container behind a hairline, so a board of them sits
 * over an ambient background without going flat. Compose the body from
 * WidgetRow and WidgetGroup for lists, or pass a chart or a figure.
 *
 * Purely presentational: safe to render from a Server Component.
 */
export const Widget = React.forwardRef<HTMLElement, WidgetProps>(
  ({ title, count, action, titleAs: Title = 'h3', children, className = '', ...rest }, ref) => {
    const baseClass = 'ds-widget';

    return (
      <section
        aria-label={title}
        {...rest}
        ref={ref}
        className={[baseClass, className].filter(Boolean).join(' ')}
      >
        <header className={`${baseClass}__header`}>
          <Title className={`${baseClass}__title`}>
            {title}
            {count !== undefined && <span className={`${baseClass}__count`}>{count}</span>}
          </Title>
          {action && <span className={`${baseClass}__action`}>{action}</span>}
        </header>
        <div className={`${baseClass}__body`}>{children}</div>
      </section>
    );
  },
);

Widget.displayName = 'Widget';

/* ============================================
   WidgetGroup — a labelled run of rows
   ============================================ */

/** Props owned by WidgetGroup itself — everything else falls through to the root `<div>`. */
type WidgetGroupOwnProps = {
  /** The run's quiet label, e.g. "Waiting on you". */
  label: string;
  /** The rows in this run. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface WidgetGroupProps
  extends WidgetGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof WidgetGroupOwnProps> {}

/** WidgetGroup — splits a Widget's rows into labelled runs. */
export const WidgetGroup = React.forwardRef<HTMLDivElement, WidgetGroupProps>(
  ({ label, children, className = '', ...rest }, ref) => {
    const baseClass = 'ds-widget-group';

    return (
      <div
        role="group"
        aria-label={label}
        {...rest}
        ref={ref}
        className={[baseClass, className].filter(Boolean).join(' ')}
      >
        <span className={`${baseClass}__label`} aria-hidden="true">
          {label}
        </span>
        {children}
      </div>
    );
  },
);

WidgetGroup.displayName = 'WidgetGroup';

/* ============================================
   WidgetRow — one line of a tile
   ============================================ */

/** Props owned by WidgetRow itself — everything else falls through to the root element. */
type WidgetRowOwnProps = {
  /** The row's main line. Note: this shadows the native `title` tooltip attribute, which WidgetRow does not expose. */
  title: string;
  /** A quiet second line under the title: who, where, or how much. */
  description?: string;
  /** Leading mark — a StatusDot, a PixelAvatar, an Avatar, a Spinner, an icon. Decorative unless the element names itself. */
  leading?: React.ReactNode;
  /** Trailing fact in the caption face: a date, an amount, a state. */
  meta?: React.ReactNode;
  /** Renders the row as a link to this URL. */
  href?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface WidgetRowProps
  extends WidgetRowOwnProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof WidgetRowOwnProps> {}

/**
 * WidgetRow — one line inside a Widget: a leading mark, a title over an
 * optional description, and a trailing fact. It is a link when given an
 * `href`, a button when given an `onClick`, and a plain row otherwise, so a
 * list only offers a target where there is somewhere to go.
 */
export const WidgetRow = React.forwardRef<HTMLElement, WidgetRowProps>(
  ({ title, description, leading, meta, href, className = '', onClick, ...rest }, ref) => {
    const baseClass = 'ds-widget-row';
    const interactive = Boolean(href || onClick);

    const classes = [baseClass, interactive ? `${baseClass}--interactive` : '', className]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {leading && <span className={`${baseClass}__leading`}>{leading}</span>}
        <span className={`${baseClass}__main`}>
          <span className={`${baseClass}__title`}>{title}</span>
          {description && <span className={`${baseClass}__description`}>{description}</span>}
        </span>
        {meta !== undefined && meta !== null && (
          <span className={`${baseClass}__meta`}>{meta}</span>
        )}
      </>
    );

    if (href) {
      return (
        <a
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
        >
          {content}
        </a>
      );
    }

    if (onClick) {
      return (
        <button
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        >
          {content}
        </button>
      );
    }

    return (
      <div {...rest} ref={ref as React.Ref<HTMLDivElement>} className={classes}>
        {content}
      </div>
    );
  },
);

WidgetRow.displayName = 'WidgetRow';

/* ============================================
   WidgetGrid — a board of tiles
   ============================================ */

/** Props owned by WidgetGrid itself — everything else falls through to the root `<div>`. */
type WidgetGridOwnProps = {
  /** The most columns the board runs to. It folds to fewer as its own width narrows. */
  columns?: 1 | 2 | 3;
  /** The Widgets on the board, in reading order: they fill the first column, then the next. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface WidgetGridProps
  extends WidgetGridOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof WidgetGridOwnProps> {}

/**
 * WidgetGrid — lays Widgets out as a board. Tiles of different heights pack
 * into columns with no holes beside the tall ones, and the board folds to
 * fewer columns as it narrows, with no breakpoint to configure.
 */
export const WidgetGrid = React.forwardRef<HTMLDivElement, WidgetGridProps>(
  ({ columns = 2, children, className = '', ...rest }, ref) => {
    const baseClass = 'ds-widget-grid';

    return (
      <div
        {...rest}
        ref={ref}
        className={[baseClass, `${baseClass}--columns-${columns}`, className]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    );
  },
);

WidgetGrid.displayName = 'WidgetGrid';
