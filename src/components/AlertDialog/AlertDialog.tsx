'use client';

import React, { useCallback, useRef, useId } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '../Button/Button';
import './AlertDialog.css';
import '../../fonts/material-symbols.css';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';

type AlertDialogOwnProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog requests to close */
  onOpenChange: (open: boolean) => void;
  /**
   * Dialog title, rendered as the heading that names the dialog. Replaces the
   * native `title` tooltip attribute.
   */
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
  /**
   * Colour of the dialog's icon, title and confirm action: `destructive`
   * for dangerous or irreversible actions.
   */
  tone?: 'default' | 'destructive';
  /**
   * Legacy name for `tone`, from before colour moved onto its own prop.
   *
   * @deprecated Use `tone` instead.
   */
  variant?: 'default' | 'destructive';
  /** Additional CSS classes on the overlay container (the ref and native attributes go on the panel) */
  className?: string;
};

export interface AlertDialogProps
  extends AlertDialogOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AlertDialogOwnProps | 'children' | 'role'> {}

/**
 * AlertDialog component for important confirmations.
 * Renders a modal overlay with title, description,
 * and confirm / cancel actions. Traps focus and
 * supports ESC key dismissal.
 */
export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone,
  variant,
  className = '',
  ...rest
}, ref) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // The focus scope needs the panel, and so does the consumer's ref.
  const setPanelRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
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
  const layer = useLayer({ open, onDismiss: handleCancel });
  useFocusScope(panelRef, {
    active: open,
    initialFocus: () =>
      panelRef.current?.querySelector<HTMLElement>(`.${baseClass}__actions button:first-child`) ??
      null,
  });
  useScrollLock(open);

  // `variant` is the deprecated spelling of `tone`; `tone` wins when both are set.
  const resolvedTone = tone ?? variant ?? 'default';
  const toneClass = resolvedTone !== 'default' ? `${baseClass}--${resolvedTone}` : '';
  const openClass = open ? `${baseClass}--open` : '';

  const containerClasses = [baseClass, toneClass, openClass, className]
    .filter(Boolean)
    .join(' ');

  const dialog = (
    <div className={containerClasses}>
      {/* A press that began while a menu was open above the dialog was the
          menu's press: it closed the menu, and must not also cancel. */}
      <div
        className={`${baseClass}__backdrop`}
        onClick={() => {
          if (layer.ownsPress()) handleCancel();
        }}
      />

      <div
        {...rest}
        className={`${baseClass}__panel`}
        ref={setPanelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : rest['aria-describedby']}
        tabIndex={-1}
      >
        <div className={`${baseClass}__header`}>
          <span
            className={`${baseClass}__icon material-symbols-rounded`}
            aria-hidden="true"
          >
            {resolvedTone === 'destructive' ? 'warning' : 'info'}
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
            variant="tertiary"
            onClick={handleCancel}
          />
          <Button
            label={confirmLabel}
            variant={resolvedTone === 'destructive' ? 'secondary' : 'primary'}
            tone={resolvedTone}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return ReactDOM.createPortal(dialog, document.body);
});

AlertDialog.displayName = 'AlertDialog';
