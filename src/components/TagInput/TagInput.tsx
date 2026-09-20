'use client';

import React, { useRef, useState } from 'react';
import { Field } from '../Field/Field';
import './TagInput.css';
import '../../fonts/material-symbols.css';

/**
 * Props owned by TagInput itself — everything else falls through to the inner
 * <input>. The native `value`/`defaultValue` are excluded from the interface:
 * the draft text is component-managed, and the committed entries live in
 * `values`/`defaultValues` instead.
 */
type TagInputOwnProps = {
  /** Field label text */
  label?: string;
  /** Committed tags (controlled) — pair with `onValuesChange` */
  values?: string[];
  /** Initial tags when uncontrolled */
  defaultValues?: string[];
  /**
   * Convenience callback receiving the full tag array whenever a tag is added
   * or removed. The native `onChange` still fires for draft-text edits, which
   * keeps the standard React event signature for form libraries.
   */
  onValuesChange?: (values: string[]) => void;
  /** Maximum number of tags — at the limit the input stops accepting new ones */
  maxTags?: number;
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below the control */
  helperText?: string;
  /** Additional CSS classes — applied to the wrapper, not the <input> */
  className?: string;
};

export interface TagInputProps
  extends TagInputOwnProps,
    Omit<
      React.ComponentPropsWithoutRef<'input'>,
      keyof TagInputOwnProps | 'type' | 'value' | 'defaultValue'
    > {}

/**
 * Multi-value text input holding committed entries as removable tags.
 *
 * Enter or comma commits the trimmed draft as a tag (duplicates and empty
 * drafts are ignored), Backspace on an empty draft removes the last tag, and
 * each tag carries its own labelled remove button. Forwards a ref to the inner
 * `<input>` and spreads unrecognised props onto it.
 */
export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      label,
      values,
      defaultValues,
      onValuesChange,
      maxTags,
      size = 'default',
      error = false,
      helperText,
      className = '',
      placeholder = '',
      disabled = false,
      required = false,
      onChange,
      onKeyDown,
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-taginput';

    const isControlled = values !== undefined;
    const [internalValues, setInternalValues] = useState<string[]>(defaultValues ?? []);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const tags = isControlled ? values : internalValues;
    const atLimit = maxTags !== undefined && tags.length >= maxTags;

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const updateValues = (next: string[]) => {
      if (!isControlled) setInternalValues(next);
      onValuesChange?.(next);
    };

    const commitDraft = () => {
      const tag = draft.trim();
      if (!tag || atLimit) return;
      if (!tags.includes(tag)) updateValues([...tags, tag]);
      setDraft('');
    };

    const removeTag = (index: number) => {
      if (disabled) return;
      updateValues(tags.filter((_, i) => i !== index));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      setDraft(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'Enter' && draft.trim() !== '') {
        e.preventDefault();
        commitDraft();
      } else if (e.key === ',') {
        e.preventDefault();
        commitDraft();
      } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    };

    // Clicking anywhere on the shell focuses the input — except on a remove
    // button, whose own focus must not be stolen back.
    const handleShellClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if ((e.target as HTMLElement).closest(`.${baseClass}__remove`)) return;
      inputRef.current?.focus();
    };

    // Keep the historical id derivation — Field only generates one as a
    // fallback, so an explicit id/name/label still wins.
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const describedBy = helperText ? `${inputId}-helper` : rest['aria-describedby'];

    return (
      <Field
        className={classes}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        id={inputId}
      >
        <div className={`${baseClass}__shell`} onClick={handleShellClick}>
          {tags.map((tag, index) => (
            <span key={tag} className={`${baseClass}__tag`}>
              <span className={`${baseClass}__tag-label`}>{tag}</span>
              <button
                type="button"
                className={`${baseClass}__remove`}
                onClick={() => removeTag(index)}
                disabled={disabled}
                aria-label={`Remove ${tag}`}
              >
                <span className="material-symbols-rounded" aria-hidden="true">
                  close
                </span>
              </button>
            </span>
          ))}
          <input
            {...rest}
            ref={setRef}
            className={`${baseClass}__input`}
            type="text"
            id={inputId}
            name={name}
            value={draft}
            placeholder={atLimit ? '' : placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={error}
            aria-describedby={describedBy}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </Field>
    );
  },
);

TagInput.displayName = 'TagInput';
