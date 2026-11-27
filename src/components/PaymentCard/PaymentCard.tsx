import React from 'react';
import { DEFAULT_LOCALE } from '../../behaviors/locale';
import '../../fonts/material-symbols.css';
import '../../behaviors/visually-hidden.css';
import './PaymentCard.css';

/** A card's expiry: the month (1 to 12) and the full year. */
export type PaymentCardExpiry = { month: number; year: number };

/** What the default accessible name is written from. */
export type PaymentCardLabelParts = {
  /** The brand, when `brand` is text; otherwise undefined. */
  brand?: string;
  /** The holder's name. */
  holderName: string;
  /** The last four digits. */
  last4: string;
  /** The tier, when `label` is given. */
  label?: string;
};

/** Props owned by PaymentCard itself — everything else falls through to the face. */
type PaymentCardOwnProps = {
  /**
   * The issuer's wordmark or logo, at the top start of the face. Text, or a
   * node such as an `<img>` with its own alt text. When it is text it also
   * opens the card's accessible name.
   */
  brand: React.ReactNode;
  /** The name printed on the card, at the bottom start. */
  holderName: string;
  /** The last four digits of the card number, drawn as `•• 5555`. */
  last4: string;
  /** When the card expires, written in `locale` as a two-digit month and year. */
  expiry?: PaymentCardExpiry;
  /** The card network's mark at the bottom end, such as a logo `<img>` with its alt text. */
  network?: React.ReactNode;
  /** A tier or kind printed at the top end, such as "Plus" or "Virtual". */
  label?: string;
  /**
   * The face's colour: `default` is the solid inverse face a card reads as
   * in a wallet, `neutral` a quieter face on the container ramp.
   * @default 'default'
   */
  tone?: 'default' | 'neutral';
  /** Draws the card frozen: the face dimmed under a lock and the frozen label. */
  frozen?: boolean;
  /**
   * The face's width step; the height follows from the card's aspect ratio.
   * @default 'default'
   */
  size?: 'default' | 'compact';
  /**
   * The BCP 47 locale the expiry is written in, such as `ar-EG`. Defaults to
   * `en-US`. This component can render from a Server Component, so it takes
   * the prop alone and reads no LocaleProvider.
   */
  locale?: string;
  /** Read before the last four digits, out of sight. Default "ending in". */
  endingInLabel?: string;
  /** Read before the expiry, out of sight. Default "Expires". */
  expiresLabel?: string;
  /** Shown over a frozen face. Default "Frozen". */
  frozenLabel?: string;
  /**
   * The card's accessible name, written from its parts. Default: the brand
   * when it is text, then "card ending in 5555, Jordan Reyes".
   */
  cardLabel?: (parts: PaymentCardLabelParts) => string;
  /** Additional CSS classes on the face */
  className?: string;
};

export interface PaymentCardProps
  extends PaymentCardOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof PaymentCardOwnProps> {}

const defaultCardLabel = ({ brand, holderName, last4 }: PaymentCardLabelParts) =>
  `${brand ? `${brand} card` : 'Card'} ending in ${last4}, ${holderName}`;

/**
 * PaymentCard — the face of a payment card, at a card's fixed aspect ratio:
 * the brand and a tier along the top, the last four digits, the holder and
 * expiry with the network's mark along the bottom.
 *
 * Presentational: it renders from a Server Component. The ref and any
 * unrecognised props reach the face, a named group.
 */
export function PaymentCard({
  brand,
  holderName,
  last4,
  expiry,
  network,
  label,
  tone = 'default',
  frozen = false,
  size = 'default',
  locale = DEFAULT_LOCALE,
  endingInLabel = 'ending in',
  expiresLabel = 'Expires',
  frozenLabel = 'Frozen',
  cardLabel = defaultCardLabel,
  className = '',
  ref,
  ...rest
}: PaymentCardProps) {
  const baseClass = 'ds-payment-card';
  const classes = [
    baseClass,
    tone !== 'default' ? `${baseClass}--${tone}` : '',
    size !== 'default' ? `${baseClass}--${size}` : '',
    frozen ? `${baseClass}--frozen` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const name = cardLabel({
    brand: typeof brand === 'string' ? brand : undefined,
    holderName,
    last4,
    label,
  });

  // Two digits each, in the locale's own digits and separator, as a card
  // prints it. Midday on the first, so no time zone moves the month.
  const expiryText = expiry
    ? new Intl.DateTimeFormat(locale, { month: '2-digit', year: '2-digit', timeZone: 'UTC' }).format(
        new Date(Date.UTC(expiry.year, expiry.month - 1, 1, 12)),
      )
    : null;

  return (
    <div role="group" aria-label={name} {...rest} ref={ref} className={classes}>
      <div className={`${baseClass}__face`}>
        <div className={`${baseClass}__top`}>
          <div className={`${baseClass}__brand`}>{brand}</div>
          {label ? <span className={`${baseClass}__label`}>{label}</span> : null}
        </div>
        <div className={`${baseClass}__number`}>
          <span className="ds-visually-hidden">{endingInLabel} </span>
          <span aria-hidden="true">•• </span>
          {last4}
        </div>
        <div className={`${baseClass}__bottom`}>
          <div className={`${baseClass}__holder`}>
            <span className={`${baseClass}__name`}>{holderName}</span>
            {expiryText ? (
              <span className={`${baseClass}__expiry`}>
                <span className="ds-visually-hidden">{expiresLabel} </span>
                {expiryText}
              </span>
            ) : null}
          </div>
          {network ? <div className={`${baseClass}__network`}>{network}</div> : null}
        </div>
      </div>
      {frozen ? (
        <div className={`${baseClass}__frozen`}>
          <span className={`${baseClass}__lock material-symbols-rounded`} aria-hidden="true">
            lock
          </span>
          <span>{frozenLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
