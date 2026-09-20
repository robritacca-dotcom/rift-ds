'use client';

import React, { useRef, useState, useId } from 'react';
import { Field } from '../Field/Field';
import './FileInput.css';
import '../../fonts/material-symbols.css';

export interface FileInputFile {
  /** Stable identifier */
  id: string;
  /** File name shown in the list */
  name: string;
  /** Size in bytes — rendered human-readable */
  size?: number;
  /** Upload progress 0–100. Omit for files that are already stored. */
  progress?: number;
  /** Per-file error message — replaces the size line */
  error?: string;
}

/** Props owned by FileInput itself — everything else falls through to the native <input type="file">. */
type FileInputOwnProps = {
  /** Field label above the dropzone */
  label?: string;
  /** Instructional copy inside the dropzone */
  placeholder?: string;
  /** Files to list under the dropzone */
  files?: FileInputFile[];
  /** Component size (not the native character-width `size` attribute) */
  size?: 'default' | 'compact';
  /** Error state — shows error styling and message */
  error?: boolean;
  /** Helper or error message displayed below the field */
  helperText?: string;
  /** Called with the newly selected files */
  onFilesSelected?: (files: File[]) => void;
  /** Called with the id of a file whose remove button was pressed */
  onFileRemove?: (id: string) => void;
  /** Additional CSS classes — applied to the wrapper, not the <input> */
  className?: string;
  /**
   * Legacy accessible-name prop.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
};

export interface FileInputProps
  extends FileInputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof FileInputOwnProps | 'type'> {}

/** Render a byte count as a short human-readable string. */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  // Whole numbers for bytes, one decimal above that
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
};

/**
 * FileInput component — a click-or-drop zone paired with a list of the
 * chosen files. The list is fully controlled: pass `files` and handle
 * `onFilesSelected` / `onFileRemove` so upload progress and per-file
 * errors stay owned by the host app.
 *
 * Forwards a ref to the underlying `<input type="file">` — useful for
 * programmatically opening the picker or clearing the selection — and spreads
 * unrecognised props onto it.
 */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      placeholder = 'Drag and drop, or click to browse',
      accept,
      multiple = false,
      files = [],
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      onFilesSelected,
      onFileRemove,
      onChange,
      className = '',
      ariaLabel,
      name,
      id,
      ...rest
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const inputId = id || name || generatedId;
    const baseClass = 'ds-file-input';

    /** Keep the internal ref (used to open the picker) while honouring a forwarded one. */
    const setInputRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const emitFiles = (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      onFilesSelected?.(Array.from(fileList));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      emitFiles(e.target.files);
      // Reset so selecting the same file twice still fires a change
      e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      emitFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      // Ignore bubbling from children so the highlight does not flicker
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragging(false);
    };

    const openPicker = () => {
      if (!disabled) inputRef.current?.click();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    };

    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      isDragging ? `${baseClass}--dragging` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

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
        <div
          className={`${baseClass}__dropzone`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel || rest['aria-label'] || placeholder}
          aria-describedby={helperText ? `${inputId}-helper` : undefined}
          // Was missing: FileInput exposed an `error` prop it never reflected.
          aria-invalid={error || undefined}
          aria-disabled={disabled || undefined}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <span
            className={`${baseClass}__dropzone-icon material-symbols-rounded`}
            aria-hidden="true"
          >
            upload_file
          </span>
          <span className={`${baseClass}__dropzone-text`}>{placeholder}</span>
          {accept && <span className={`${baseClass}__dropzone-hint`}>Accepts {accept}</span>}

        </div>

        {/* Kept OUTSIDE the dropzone: an <input> inside a role="button"
            container is a nested interactive control. It is visually hidden
            either way, and the dropzone opens it programmatically. */}
        <input
          {...rest}
          ref={setInputRef}
          id={inputId}
          name={name}
          type="file"
          className={`${baseClass}__native`}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          required={required}
          tabIndex={-1}
          // The native input is the real form control, so it needs its own
          // name — Field's <label htmlFor> covers the labelled case, this
          // covers the label-less one.
          aria-label={label ? undefined : ariaLabel || rest['aria-label'] || placeholder}
          onChange={handleChange}
        />

        {files.length > 0 && (
          <ul className={`${baseClass}__list`}>
            {files.map((file) => (
              <li
                key={file.id}
                className={[`${baseClass}__file`, file.error ? `${baseClass}__file--error` : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={`${baseClass}__file-icon material-symbols-rounded`}
                  aria-hidden="true"
                >
                  {file.error ? 'error' : 'description'}
                </span>

                <span className={`${baseClass}__file-details`}>
                  <span className={`${baseClass}__file-name`}>{file.name}</span>

                  {file.error ? (
                    <span className={`${baseClass}__file-error`}>{file.error}</span>
                  ) : (
                    file.size !== undefined && (
                      <span className={`${baseClass}__file-size`}>{formatBytes(file.size)}</span>
                    )
                  )}

                  {file.error === undefined && file.progress !== undefined && (
                    <span
                      className={`${baseClass}__progress`}
                      role="progressbar"
                      aria-valuenow={file.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Uploading ${file.name}`}
                    >
                      <span
                        className={`${baseClass}__progress-fill`}
                        style={{ width: `${Math.min(100, Math.max(0, file.progress))}%` }}
                      />
                    </span>
                  )}
                </span>

                {onFileRemove && (
                  <button
                    type="button"
                    className={`${baseClass}__file-remove`}
                    onClick={() => onFileRemove(file.id)}
                    disabled={disabled}
                    aria-label={`Remove ${file.name}`}
                  >
                    <span className="material-symbols-rounded" aria-hidden="true">
                      close
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

      </Field>
    );
  },
);

FileInput.displayName = 'FileInput';
