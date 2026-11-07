'use client';

import React, { useEffect, useId, useRef } from 'react';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatNumber } from '../../behaviors/locale';
import type { ErrorSummaryError } from './fieldErrors';
import '../../fonts/material-symbols.css';
import './ErrorSummary.css';

/** Props owned by ErrorSummary itself; everything else falls through to the root `<section>`. */
type ErrorSummaryOwnProps = {
  /** The errors, in the form's order: each the id of the control it belongs to and what is wrong. The summary renders nothing while the list is empty. */
  errors: ErrorSummaryError<React.ReactNode>[];
  /** The heading, in place of the one `titleLabel` writes. Note: this replaces the native `title` attribute, which ErrorSummary does not expose. */
  title?: React.ReactNode;
  /** The heading for a given number of errors, already written in the locale. Defaults to "There is a problem" for one and "There are <count> problems" for more. */
  titleLabel?: (count: string, total: number) => string;
  /** A line under the heading, before the list. */
  description?: React.ReactNode;
  /** Move focus to the summary when the list goes from empty to holding errors (on a submit), so a screen reader reads it and a keyboard user starts from it. Defaults to true. */
  focusOnMount?: boolean;
  /** The heading's level, so the summary takes its place in the page's outline. Defaults to 2. */
  headingLevel?: 2 | 3 | 4;
  /** Called with a control's id after its link moves focus to it. */
  onErrorClick?: (id: string) => void;
  /** The BCP 47 locale the count is written in. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes. */
  className?: string;
};

export interface ErrorSummaryProps
  extends ErrorSummaryOwnProps,
    Omit<React.ComponentPropsWithRef<'section'>, keyof ErrorSummaryOwnProps | 'children'> {}

const DEFAULT_TITLE_LABEL = (count: string, total: number) =>
  total === 1 ? 'There is a problem' : `There are ${count} problems`;

/**
 * Every error on a form in one place, at the top of it: a heading that says
 * how many, and a link per error that moves focus to the control and scrolls
 * it into view. Takes the focus when errors first appear, so the reader
 * starts from what needs fixing.
 */
export function ErrorSummary({
  errors,
  title,
  titleLabel = DEFAULT_TITLE_LABEL,
  description,
  focusOnMount = true,
  headingLevel = 2,
  onErrorClick,
  locale: localeProp,
  className = '',
  ref,
  ...rest
}: ErrorSummaryProps) {
  const locale = useLocale(localeProp);
  const headingId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const hadErrors = useRef(false);
  const count = errors.length;

  useEffect(() => {
    const has = count > 0;
    if (has && !hadErrors.current && focusOnMount) rootRef.current?.focus();
    hadErrors.current = has;
  }, [count, focusOnMount]);

  if (count === 0) return null;

  const setRef = (node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  /* Bring the control into view with its label above it, then focus it
     without a second scroll, so the reader sees the question as well as the
     box. The label is the field's own, when the control sits in one. */
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const frame = target.closest('.ds-field') ?? target;
    frame.scrollIntoView({ block: 'center' });
    target.focus({ preventScroll: true });
    onErrorClick?.(id);
  };

  const Heading = `h${headingLevel}` as const;
  const heading = title ?? titleLabel(formatNumber(count, locale), count);

  return (
    <section
      {...rest}
      ref={setRef}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={['ds-error-summary', className].filter(Boolean).join(' ')}
    >
      <span className="ds-error-summary__icon material-symbols-rounded" aria-hidden="true">
        error
      </span>
      <div className="ds-error-summary__content">
        <Heading className="ds-error-summary__title" id={headingId}>
          {heading}
        </Heading>
        {description != null && description !== false && <p className="ds-error-summary__description">{description}</p>}
        <ul className="ds-error-summary__list">
          {errors.map((error, index) => (
            <li key={`${error.id}-${index}`} className="ds-error-summary__item">
              {/* A same-page jump the component handles itself, so a raw anchor
                  rather than linkComponent (sanctioned in the contract validator). */}
              <a className="ds-error-summary__link" href={`#${error.id}`} onClick={(event) => goTo(event, error.id)}>
                {error.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// fieldErrorsFrom is a plain function beside the component, not a component,
// so the Fast Refresh rule that wants a component module to export only
// components does not apply to it.
// eslint-disable-next-line react-refresh/only-export-components
export { fieldErrorsFrom } from './fieldErrors';
export type { ErrorSummaryError, FieldErrors, FieldErrorsFromOptions } from './fieldErrors';
