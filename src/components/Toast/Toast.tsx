'use client';

import { useState, useEffect, useRef, useContext, useCallback, useSyncExternalStore, createContext, type ReactNode } from 'react';
import { MOTION_AUTO_DISMISS_MS, MOTION_EXIT_SYNC_MS } from '../../tokens/motion';

const emptySubscribe = () => () => {};
import ReactDOM from 'react-dom';
import './Toast.css';
import '../../fonts/material-symbols.css';

/* ============================================
   TYPES
   ============================================ */

export interface ToastData {
  /** Unique ID (auto-generated if not provided) */
  id?: string;
  /** Toast title text */
  title?: string;
  /** Toast description / body text */
  description?: string;
  /** Toast variant determines colour and icon */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean;
  /** Custom icon override — Material Symbol name */
  icon?: string;
}

export interface ToastProviderProps {
  /** Children that can access the toast context */
  children: ReactNode;
  /** Position of the toast stack */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

export interface ToastContextValue {
  /** Add a toast */
  toast: (data: ToastData) => string;
  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
}

/* ============================================
   CONTEXT
   ============================================ */

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access the toast API.
 * Must be used within a ToastProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components -- useToast is part of the Toast public API and lives with its provider
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/* ============================================
   DEFAULTS
   ============================================ */

const defaultIcons: Record<string, string> = {
  info: 'info',
  positive: 'check_circle',
  warning: 'warning',
  error: 'error',
  neutral: 'info',
};

let toastCounter = 0;

/* ============================================
   INDIVIDUAL TOAST
   ============================================ */

interface ToastItemProps extends Required<Pick<ToastData, 'variant'>> {
  id: string;
  title?: string;
  description?: string;
  dismissible: boolean;
  icon?: string;
  duration: number;
  onDismiss: (id: string) => void;
}

const ToastItem = ({
  id,
  title,
  description,
  variant,
  dismissible,
  icon,
  duration,
  onDismiss,
}: ToastItemProps) => {
  const [exiting, setExiting] = useState(false);
  const [pauseTimer, setPauseTimer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const remainingRef = useRef(duration);
  // Set when the auto-dismiss timer starts; 0 until then
  const startTimeRef = useRef(0);

  const baseClass = 'ds-toast';

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), MOTION_EXIT_SYNC_MS);
  }, [id, onDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0 || pauseTimer) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(handleDismiss, remainingRef.current);

    return () => {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startTimeRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    };
  }, [duration, pauseTimer, handleDismiss]);

  const iconName = icon || defaultIcons[variant];

  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    exiting ? `${baseClass}--exiting` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      // The container is the polite live region, so a non-critical toast
      // carries no live semantics of its own — a second region here would
      // double-announce. Error and warning toasts take role="alert", whose
      // implicit assertive announcement is the one interruption we want.
      role={variant === 'error' || variant === 'warning' ? 'alert' : undefined}
      onMouseEnter={() => setPauseTimer(true)}
      onMouseLeave={() => setPauseTimer(false)}
      onFocus={() => setPauseTimer(true)}
      onBlur={() => setPauseTimer(false)}
    >
      <span
        className={`${baseClass}__icon material-symbols-rounded`}
        aria-hidden="true"
      >
        {iconName}
      </span>

      <div className={`${baseClass}__content`}>
        {title && <p className={`${baseClass}__title`}>{title}</p>}
        {description && (
          <p className={`${baseClass}__description`}>{description}</p>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          className={`${baseClass}__dismiss`}
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>
      )}

      {duration > 0 && (
        <div
          className={`${baseClass}__progress`}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: pauseTimer ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  );
};

/* ============================================
   TOAST PROVIDER
   ============================================ */

interface InternalToast extends ToastData {
  id: string;
}

/**
 * ToastProvider wraps your application and provides the
 * toast context. Renders a fixed container that stacks
 * toast notifications.
 */
export const ToastProvider = ({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  // SSR guard — only render portal on the client
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const toast = useCallback(
    (data: ToastData): string => {
      const id = data.id || `toast-${++toastCounter}`;
      const newToast: InternalToast = {
        ...data,
        id,
        variant: data.variant || 'info',
        duration: data.duration ?? MOTION_AUTO_DISMISS_MS,
        dismissible: data.dismissible ?? true,
      };

      setToasts((prev) => {
        const next = [...prev, newToast];
        if (next.length > maxToasts) {
          return next.slice(next.length - maxToasts);
        }
        return next;
      });

      return id;
    },
    [maxToasts]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const baseClass = 'ds-toast-container';

  const containerClasses = [baseClass, `${baseClass}--${position}`].join(' ');

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      {mounted &&
        ReactDOM.createPortal(
          <div
            className={containerClasses}
            role="region"
            aria-label="Notifications"
            // The live region lives on this always-mounted container, not on
            // the toasts themselves: a region that enters the DOM together
            // with its text is not reliably announced.
            aria-live="polite"
          >
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                id={t.id}
                title={t.title}
                description={t.description}
                variant={t.variant || 'info'}
                dismissible={t.dismissible ?? true}
                icon={t.icon}
                duration={t.duration ?? MOTION_AUTO_DISMISS_MS}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

/* ============================================
   STANDALONE TOAST (for Storybook previews)
   ============================================ */

export interface ToastProps {
  /** Toast title text */
  title?: string;
  /** Toast description / body text */
  description?: string;
  /** Toast variant */
  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean;
  /** Custom icon override — Material Symbol name */
  icon?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standalone Toast component for static display.
 * For dynamic toast notifications, use ToastProvider + useToast.
 */
export const Toast = ({
  title,
  description,
  variant = 'info',
  dismissible = true,
  icon,
  className = '',
}: ToastProps) => {
  const baseClass = 'ds-toast';
  const iconName = icon || defaultIcons[variant];

  const classes = [baseClass, `${baseClass}--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status">
      <span
        className={`${baseClass}__icon material-symbols-rounded`}
        aria-hidden="true"
      >
        {iconName}
      </span>

      <div className={`${baseClass}__content`}>
        {title && <p className={`${baseClass}__title`}>{title}</p>}
        {description && (
          <p className={`${baseClass}__description`}>{description}</p>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          className={`${baseClass}__dismiss`}
          onClick={() => {}}
          aria-label="Dismiss notification"
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  );
};
