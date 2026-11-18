'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { Heading } from '../Heading/Heading';
import { Stepper } from '../Stepper/Stepper';
import './Wizard.css';

/** One step of a wizard. */
export interface WizardStep {
  /** A stable id for the step. */
  id: string;
  /** The step's name, in the stepper and as the heading of its content. */
  label: string;
  /** A line under the label in the stepper. */
  description?: string;
  /** What the step asks for. */
  content: React.ReactNode;
}

/** Props owned by Wizard itself; everything else falls through to the root `<section>`. */
type WizardOwnProps = {
  /** The steps, in order. */
  steps: WizardStep[];
  /** The index of the step shown, for a controlled wizard. Leave it undefined to let the wizard keep its own, seeded from `defaultStep`. */
  step?: number;
  /** The step shown on first render when the wizard is uncontrolled. Defaults to 0. */
  defaultStep?: number;
  /** Fires with the index of the step the reader moves to, by Back, Continue or a completed step in the stepper. */
  onStepChange?: (step: number) => void;
  /** Called when the reader presses the last step's finish button. */
  onFinish?: () => void;
  /** Whether the reader can move on from the step shown: false holds Continue and Finish, while the step's own fields say what is missing. Defaults to true. */
  canAdvance?: boolean;
  /** A running figure at the start of the footer, kept in view as the steps change: a total, a count of what is chosen. */
  summary?: React.ReactNode;
  /** Lets the reader go back to a completed step from the stepper. Defaults to true. */
  allowStepClick?: boolean;
  /** The back button's text. Defaults to "Back". */
  backLabel?: string;
  /** The next button's text. Defaults to "Continue". */
  nextLabel?: string;
  /** The last step's button text. Defaults to "Finish". */
  finishLabel?: string;
  /** The BCP 47 locale the stepper's step numbers are written in. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** The step heading's place in the outline. Defaults to 2, a section of a page. */
  headingLevel?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
};

export interface WizardProps extends WizardOwnProps, Omit<React.ComponentPropsWithRef<'section'>, keyof WizardOwnProps | 'children'> {}

/**
 * A task in steps: the Stepper above, the step shown under its own heading,
 * and a footer with Back and Continue (Finish on the last step) and a running
 * summary. Moving to a step moves focus to its heading, so a screen reader
 * hears where it landed. The step's own fields own their validation; the
 * host holds Continue with `canAdvance` until they pass.
 */
export function Wizard({
  steps,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onFinish,
  canAdvance = true,
  summary,
  allowStepClick = true,
  backLabel = 'Back',
  nextLabel = 'Continue',
  finishLabel = 'Finish',
  locale,
  headingLevel = 2,
  className = '',
  ref,
  ...rest
}: WizardProps) {
  const [internal, setInternal] = useState(defaultStep);
  const current = Math.min(Math.max(stepProp ?? internal, 0), Math.max(steps.length - 1, 0));
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);

  const go = (next: number) => {
    if (next < 0 || next >= steps.length || next === current) return;
    moved.current = true;
    if (stepProp === undefined) setInternal(next);
    onStepChange?.(next);
  };

  // Focus follows the reader to the step they moved to, never on first render.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus();
  }, [current]);

  const isLast = current === steps.length - 1;
  const shown = steps[current];
  const hasSummary = summary != null && summary !== false && summary !== '';
  const classes = ['ds-wizard', className].filter(Boolean).join(' ');

  return (
    <section aria-label={shown?.label} {...rest} ref={ref} className={classes}>
      <Stepper
        steps={steps.map(({ label, description }) => ({ label, description }))}
        activeStep={current}
        onStepClick={allowStepClick ? (index) => index < current && go(index) : undefined}
        locale={locale}
        className="ds-wizard__stepper"
      />
      {shown && (
        <div className="ds-wizard__body">
          <Heading ref={headingRef} level={headingLevel} tier="heading-3" tabIndex={-1} className="ds-wizard__title">
            {shown.label}
          </Heading>
          <div className="ds-wizard__content">{shown.content}</div>
        </div>
      )}
      <div className="ds-wizard__footer">
        {hasSummary && <div className="ds-wizard__summary">{summary}</div>}
        <div className="ds-wizard__actions">
          {current > 0 && <Button label={backLabel} variant="secondary" onClick={() => go(current - 1)} />}
          {isLast ? (
            <Button label={finishLabel} disabled={!canAdvance} onClick={() => onFinish?.()} />
          ) : (
            <Button label={nextLabel} disabled={!canAdvance} onClick={() => go(current + 1)} />
          )}
        </div>
      </div>
    </section>
  );
}
