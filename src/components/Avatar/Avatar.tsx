'use client';

import React, { useState } from 'react';
import './Avatar.css';
import '../../fonts/material-symbols.css';

/** Props owned by Avatar itself — everything else falls through to the root span. */
type AvatarOwnProps = {
  /** Image source URL */
  src?: string;
  /** Alt text for the image, also the avatar's accessible name. A passed `aria-label` takes precedence. */
  alt?: string;
  /** User's name — used for initials fallback */
  name?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Online status indicator */
  status?: 'online' | 'away' | 'offline' | 'busy';
  /** Accessible name for the status dot. Defaults to the `status` value itself (e.g. "online"). */
  statusLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AvatarProps
  extends AvatarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof AvatarOwnProps | 'children'> {}

/**
 * Avatar component for user profile images.
 * Falls back to initials derived from the name prop,
 * or a person icon when neither image nor name is provided.
 * Forwards a ref to the root span and spreads native attributes onto it.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      status,
      statusLabel,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [imgError, setImgError] = useState(false);

    const baseClass = 'ds-avatar';
    const sizeClass = `${baseClass}--${size}`;

    const classes = [baseClass, sizeClass, className].filter(Boolean).join(' ');

    const getInitials = (fullName: string): string => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const showImage = src && !imgError;
    const showInitials = !showImage && name;
    const showIcon = !showImage && !name;

    const label = alt || name || 'User avatar';

    return (
      <span aria-label={label} {...rest} ref={ref} className={classes} role="img">
        {showImage && (
          <img
            className={`${baseClass}__image`}
            src={src}
            alt={alt || name || ''}
            onError={() => setImgError(true)}
          />
        )}

        {showInitials && (
          <span className={`${baseClass}__initials`} aria-hidden="true">
            {getInitials(name!)}
          </span>
        )}

        {showIcon && (
          <span
            className={`${baseClass}__icon material-symbols-rounded`}
            aria-hidden="true"
          >
            person
          </span>
        )}

        {status && (
          <span
            className={`${baseClass}__status ${baseClass}__status--${status}`}
            // A bare <span> has no role, and aria-label is prohibited on roles
            // that provide no semantics. role="img" is what this dot actually is.
            role="img"
            aria-label={statusLabel ?? status}
          />
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';
