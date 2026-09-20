import './Instructions.css';
import '../../fonts/material-symbols.css';

export interface InstructionStep {
  /** Step label/title */
  label: string;
  /** Optional step description */
  description?: string;
  /** Optional custom icon — defaults to step number */
  icon?: string;
}

export interface InstructionsProps {
  /** Instructions title */
  title?: string;
  /** Array of instruction steps */
  steps: InstructionStep[];
  /** Component size */
  size?: 'default' | 'compact';
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Whether to show step numbers instead of icons */
  numbered?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Instructions component for step-by-step guidance.
 * Displays an ordered list of steps with optional icons,
 * descriptions, and connecting lines.
 */
export const Instructions = ({
  title,
  steps,
  size = 'default',
  direction = 'vertical',
  numbered = true,
  className = '',
}: InstructionsProps) => {
  const baseClass = 'ds-instructions';
  const sizeClass = `${baseClass}--${size}`;
  const dirClass = `${baseClass}--${direction}`;

  const classes = [baseClass, sizeClass, dirClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {title && <h3 className={`${baseClass}__title`}>{title}</h3>}

      <ol className={`${baseClass}__list`}>
        {steps.map((step, idx) => (
          <li key={idx} className={`${baseClass}__step`}>
            <div className={`${baseClass}__indicator`}>
              <div className={`${baseClass}__badge`}>
                {step.icon ? (
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {step.icon}
                  </span>
                ) : numbered ? (
                  <span className={`${baseClass}__number`}>{idx + 1}</span>
                ) : (
                  <span className={`${baseClass}__dot`} />
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`${baseClass}__connector`} />
              )}
            </div>

            <div className={`${baseClass}__content`}>
              <p className={`${baseClass}__label`}>{step.label}</p>
              {step.description && (
                <p className={`${baseClass}__description`}>{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
