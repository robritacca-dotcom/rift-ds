'use client';

import { useState } from 'react';
import './Avatar.css';
import '../../fonts/material-symbols.css';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** User's name — used for initials fallback */
  name?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Online status indicator */
  status?: 'online' | 'away' | 'offline' | 'busy';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Avatar component for user profile images.
 * Falls back to initials derived from the name prop,
 * or a person icon when neither image nor name is provided.
 */
export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) => {
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
    <span className={classes} role="img" aria-label={label}>
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
          aria-label={status}
        />
      )}
    </span>
  );
};
