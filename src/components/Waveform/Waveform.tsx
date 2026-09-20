import React from 'react';
import './Waveform.css';

/** Props owned by Waveform itself — everything else falls through to the root span. */
type WaveformOwnProps = {
  /**
   * What the audio channel is doing: `idle` parks the bars low and still,
   * `listening` runs a gentle half-height wave, `speaking` runs the full one.
   * Ignored while `levels` drives the bars.
   */
  state?: 'idle' | 'listening' | 'speaking';
  /** How many bars the wave has. */
  bars?: number;
  /**
   * Live amplitudes from a real audio analyser, one 0–1 value per bar.
   * Providing them switches the component to controlled mode: the CSS wave
   * stops and each bar tracks its level, easing between updates.
   */
  levels?: number[];
  /** Bar height scale — `default` sits on the md icon size, `compact` on sm. */
  size?: 'default' | 'compact';
  /**
   * What a screen reader hears the indicator say. Defaults per state
   * ("Listening", "Speaking", "Microphone idle").
   */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface WaveformProps
  extends WaveformOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof WaveformOwnProps> {}

const DEFAULT_LABELS: Record<NonNullable<WaveformOwnProps['state']>, string> = {
  idle: 'Microphone idle',
  listening: 'Listening',
  speaking: 'Speaking',
};

/**
 * Waveform — the voice indicator: a row of bars that dance while audio is
 * happening. The animated states are pure CSS choreography on the shared
 * twelve-slot cycle (the same loop AgentStatus's dot patterns run on), so
 * every audio indicator in a surface moves to one rhythm; `levels` hands the
 * bars to a real analyser instead. Deliberately monochrome like the agent
 * working states — colour is reserved for meaning, and a consumer can tint
 * the whole wave through `--ds-waveform-color`.
 *
 * Purely presentational: safe to render from a Server Component. The bars
 * are decoration to a screen reader; the state announces as text through a
 * visually hidden live label.
 */
export const Waveform = React.forwardRef<HTMLSpanElement, WaveformProps>(
  (
    { state = 'idle', bars = 5, levels, size = 'default', label, className = '', ...rest },
    ref,
  ) => {
    const baseClass = 'ds-waveform';
    const controlled = Array.isArray(levels);
    const count = controlled ? levels.length : Math.max(bars, 1);

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      controlled ? `${baseClass}--levels` : `${baseClass}--${state}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span {...rest} ref={ref} className={classes} role="status">
        {Array.from({ length: count }, (_, i) => {
          // Centre-weighted resting contour: outer bars reach lower peaks, so
          // the wave reads as one shape rather than a bar chart.
          const amp = 0.35 + 0.65 * Math.sin((Math.PI * (i + 1)) / (count + 1));
          // Adjacent bars sit two slots apart on the twelve-slot cycle, so the
          // peak travels along the row instead of the bars bouncing in unison.
          const step = (i * 2) % 12;
          const level = controlled ? Math.min(Math.max(levels[i], 0.08), 1) : undefined;
          return (
            <span
              key={i}
              className={`${baseClass}__bar`}
              aria-hidden="true"
              style={
                {
                  '--ds-waveform-amp': amp,
                  '--ds-waveform-step': step,
                  ...(level !== undefined && { '--ds-waveform-level': level }),
                } as React.CSSProperties
              }
            />
          );
        })}
        <span className={`${baseClass}__sr`}>{label ?? DEFAULT_LABELS[state]}</span>
      </span>
    );
  },
);

Waveform.displayName = 'Waveform';
