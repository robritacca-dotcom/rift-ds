import React from 'react';
import './ActionReadout.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** One line of a readout: what it measures and its value, already written in the reader's locale. */
export interface ActionReadoutFact {
  /** What it measures: "Refunded". */
  label: string;
  /** Its value: "$101,137 across 52 orders". */
  value: React.ReactNode;
}

/** Props owned by ActionReadout itself — everything else falls through to the root `<div>`. */
type ActionReadoutOwnProps = {
  /** What was done, with how much: "69 orders cancelled". */
  headline: React.ReactNode;
  /** What it did, a line each: the status it moved, the money it touched, who it reached. */
  facts: ActionReadoutFact[];
  /** A leading mark beside the headline: a Material Symbol name, or your own element. */
  icon?: string | React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface ActionReadoutProps
  extends ActionReadoutOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof ActionReadoutOwnProps> {}

const baseClass = 'ds-action-readout';

/**
 * What a confirmed change did, as the opening of the reply its confirmation
 * gets: a headline over a list of facts, worked out by the host from the
 * records as they were just before the change, so it is exact without a model.
 * The facts are a description list, so each label is read with its value.
 */
export function ActionReadout({ ref, headline, facts, icon, className = '', ...rest }: ActionReadoutProps) {
  return (
    <div {...rest} ref={ref} className={[baseClass, className].filter(Boolean).join(' ')}>
      <span className={`${baseClass}__headline`}>
        {icon && (
          <span className={`${baseClass}__icon`} aria-hidden="true">
            {typeof icon === 'string' ? <span className={`material-symbols-rounded ${mirrorClass(icon)}`}>{icon}</span> : icon}
          </span>
        )}
        {headline}
      </span>
      <dl className={`${baseClass}__facts`}>
        {facts.map((fact) => (
          <React.Fragment key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
