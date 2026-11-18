import React from 'react';
import { Grid } from '../Grid/Grid';
import { Heading } from '../Heading/Heading';
import './FormSection.css';

/** Props owned by FormSection itself; everything else falls through to the root `<section>`. */
type FormSectionOwnProps = {
  /**
   * The section's heading.
   * Note: this shadows the native `title` tooltip attribute, which FormSection does not expose.
   */
  title: string;
  /** A sentence on what the fields are for or what changing them does. */
  description?: React.ReactNode;
  /** The fields, laid out in `columns`. */
  children?: React.ReactNode;
  /** How many columns the fields run to; they fold to one as the section narrows. */
  columns?: 1 | 2 | 3;
  /** `stacked` puts the heading above the fields; `aside` sets it in a column beside them, the settings page's layout, stacking when the section is narrow. */
  layout?: 'stacked' | 'aside';
  /** The section's own controls, at the foot of the fields: a Save, a Cancel. */
  actions?: React.ReactNode;
  /** The heading's place in the outline. Defaults to 2, a section of a page. */
  headingLevel?: 2 | 3 | 4;
  /** Draws a rule above the section, for a column of sections. */
  divider?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface FormSectionProps
  extends FormSectionOwnProps,
    Omit<React.ComponentPropsWithRef<'section'>, keyof FormSectionOwnProps> {}

/**
 * One part of a form or a settings page: a heading and a sentence on what it
 * is for, its fields in a grid that folds by the room it has, and its own
 * actions at the foot. A column of them is a long form or a settings page.
 * Server-renderable.
 */
export function FormSection({
  title,
  description,
  children,
  columns = 1,
  layout = 'stacked',
  actions,
  headingLevel = 2,
  divider = false,
  className = '',
  ref,
  ...rest
}: FormSectionProps) {
  const hasDescription = description != null && description !== false && description !== '';
  const hasActions = actions != null && actions !== false;
  const classes = ['ds-form-section', `ds-form-section--${layout}`, divider ? 'ds-form-section--divider' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <section {...rest} ref={ref} className={classes}>
      <div className="ds-form-section__layout">
        <div className="ds-form-section__intro">
          <Heading level={headingLevel} tier="title-body" className="ds-form-section__title">
            {title}
          </Heading>
          {hasDescription && <p className="ds-form-section__description">{description}</p>}
        </div>
        <div className="ds-form-section__body">
          <Grid columns={columns} minColumnWidth="14rem" gap="400" align="start">
            {children}
          </Grid>
          {hasActions && <div className="ds-form-section__actions">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
