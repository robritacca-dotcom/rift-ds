'use client';

import React, { useCallback, useId, useState } from 'react';
import { Spinner } from '../Spinner/Spinner';
import './AgentPlan.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';

export type AgentPlanStepStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface AgentPlanStep {
  /** What this step does, in one line. */
  label: string;
  /** Where the step has got to. Defaults to `pending`. */
  status?: AgentPlanStepStatus;
  /** Optional supporting line under the label, e.g. the file it touched. */
  detail?: string;
}

/** The glyph shown for a settled step; the active step gets a spinner instead. */
const STEP_ICONS: Record<Exclude<AgentPlanStepStatus, 'active'>, string> = {
  pending: 'circle',
  completed: 'check_circle',
  failed: 'error',
};

/** Announced to screen readers alongside each step's label. */
const STEP_STATUS_TEXT: Record<AgentPlanStepStatus, string> = {
  pending: 'Not started',
  active: 'In progress',
  completed: 'Completed',
  failed: 'Failed',
};

const defaultRemainingLabel = (remaining: number) =>
  `${remaining} step${remaining === 1 ? '' : 's'} left`;

/** Props owned by AgentPlan itself — everything else falls through to the root element. */
type AgentPlanOwnProps = {
  /** The plan, in order. Step status drives each row's indicator and colour. */
  steps: AgentPlanStep[];
  /**
   * Header text. Left unset, it is computed from the steps —
   * "3 steps left", or "All steps complete" once everything is done.
   * Note: this shadows the native `title` tooltip attribute, which AgentPlan does not expose.
   */
  title?: string;
  /**
   * The computed header while steps remain, given how many are left.
   * Defaults to "1 step left" or "N steps left". Ignored when `title` is set.
   */
  remainingLabel?: (remaining: number) => string;
  /**
   * The computed header once every step is complete. Defaults to
   * "All steps complete". Ignored when `title` is set.
   */
  completeLabel?: string;
  /**
   * Visually hidden text announcing each step's status after its label.
   * Merged over the English defaults (Not started, In progress, Completed, Failed).
   */
  statusLabels?: Partial<Record<AgentPlanStepStatus, string>>;
  /** Open state for controlled use. Pair with `onOpenChange`. */
  open?: boolean;
  /** Open state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fires whenever the step list opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentPlanProps
  extends AgentPlanOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AgentPlanOwnProps> {}

/**
 * AgentPlan shows the steps an agent intends to take and where it has got to:
 * a collapsible checklist with one row per step, a live progress readout in
 * the header, and completed work ticked off as the run advances.
 *
 * It complements the other agent primitives — AgentStatus says what is
 * happening right now, ToolCall records one action, AgentPlan holds the
 * whole task.
 */
export const AgentPlan = React.forwardRef<HTMLDivElement, AgentPlanProps>(
  (
    {
      steps,
      title,
      remainingLabel = defaultRemainingLabel,
      completeLabel = 'All steps complete',
      statusLabels,
      open,
      defaultOpen = true,
      onOpenChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-agent-plan';
    const id = useId();
    const panelId = `${id}-panel`;
    const triggerId = `${id}-trigger`;

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = isControlled ? open : uncontrolledOpen;

    const toggle = useCallback(() => {
      const next = !isOpen;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);

    const total = steps.length;
    const completed = steps.filter((step) => step.status === 'completed').length;
    const remaining = total - completed;
    const resolvedTitle =
      title ?? (total > 0 && remaining === 0 ? completeLabel : remainingLabel(remaining));
    const statusText = { ...STEP_STATUS_TEXT, ...statusLabels };

    const classes = [baseClass, isOpen ? `${baseClass}--open` : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <button
          type="button"
          id={triggerId}
          className={`${baseClass}__header`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className={`${baseClass}__title`}>{resolvedTitle}</span>
          {total > 0 && (
            <span className={`${baseClass}__count`}>
              {completed}/{total}
            </span>
          )}
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>

        <div
          className={`${baseClass}__panel`}
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
        >
          <div className={`${baseClass}__content`}>
            <ol className={`${baseClass}__steps`}>
              {steps.map((step, index) => {
                const status = step.status ?? 'pending';
                return (
                  <li
                    key={index}
                    className={`${baseClass}__step ${baseClass}__step--${status}`}
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    <span className={`${baseClass}__indicator`} aria-hidden="true">
                      {status === 'active' ? (
                        <Spinner size="sm" tone="inherit" />
                      ) : (
                        <span className="material-symbols-rounded">{STEP_ICONS[status]}</span>
                      )}
                    </span>
                    <span className={`${baseClass}__step-body`}>
                      <span className={`${baseClass}__label`}>{step.label}</span>
                      {step.detail && (
                        <span className={`${baseClass}__detail`}>{step.detail}</span>
                      )}
                    </span>
                    <span className="ds-visually-hidden">{statusText[status]}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  },
);

AgentPlan.displayName = 'AgentPlan';
