'use client';

import { useCallback, useRef, useId } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '../Button/Button';
import './AlertDialog.css';
import '../../fonts/material-symbols.css';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';

export interface AlertDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog requests to close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description / body text */
  description?: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Callback when confirm is clicked */
  onConfirm?: () => void;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Destructive variant for dangerous actions */
  variant?: 'default' | 'destructive';
  /** Additional CSS classes */
  className?: string;
}

/**
 * AlertDialog component for important confirmations.
 * Renders a modal overlay with title, description,
 * and confirm / cancel actions. Traps focus and
 * supports ESC key dismissal.
 */
export const AlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  className = '',
}: AlertDialogProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const baseClass = 'ds-alert-dialog';

  // SSR guard — only render portal on the client
  const mounted = useMounted();

  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  // Shared overlay behaviors (src/behaviors/) — see Dialog. Escape cancels;
  // initial focus lands on the cancel button, so the safe action is one
  // keypress away from the destructive one.
  useLayer({ open, onDismiss: handleCancel });
  useFocusScope(panelRef, {
    active: open,
    initialFocus: () =>
      panelRef.current?.querySelector<HTMLElement>(`.${baseClass}__actions button:first-child`) ??
      null,
  });
  useScrollLock(open);

  const variantClass = variant !== 'default' ? `${baseClass}--${variant}` : '';
  const openClass = open ? `${baseClass}--open` : '';

  const containerClasses = [baseClass, variantClass, openClass, className]
    .filter(Boolean)
    .join(' ');

  const dialog = (
    <div className={containerClasses}>
      <div className={`${baseClass}__backdrop`} onClick={handleCancel} />

      <div
        className={`${baseClass}__panel`}
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <div className={`${baseClass}__header`}>
          <span
            className={`${baseClass}__icon material-symbols-rounded`}
            aria-hidden="true"
          >
            {variant === 'destructive' ? 'warning' : 'info'}
          </span>
          <h2 className={`${baseClass}__title`} id={titleId}>
            {title}
          </h2>
        </div>

        {description && (
          <p className={`${baseClass}__description`} id={descId}>
            {description}
          </p>
        )}

        <div className={`${baseClass}__actions`}>
          <Button
            label={cancelLabel}
            priority="tertiary"
            onClick={handleCancel}
          />
          <Button
            label={confirmLabel}
            priority={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return ReactDOM.createPortal(dialog, document.body);
};
