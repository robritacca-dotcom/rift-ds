'use client';

import React, { createContext, useContext } from 'react';
import { DEFAULT_LOCALE } from './locale';

const LocaleContext = createContext<string | null>(null);

export interface LocaleProviderProps {
  /**
   * The BCP 47 locale every rift-ds component under this provider formats
   * numbers, dates and calendars in, such as `de-DE`. Named like the
   * instance prop it stands in for.
   */
  locale: string;
  /** The part of the app it applies to, usually the whole app. */
  children?: React.ReactNode;
}

/**
 * Sets the locale for every client-rendered rift-ds component below it that
 * formats a number or a date, or lays out a calendar: grouping and decimal
 * marks, month and weekday names, the first day of the week, and the
 * 12- or 24-hour clock. A component's own `locale` prop wins over it. The
 * components that can render on the server cannot read a provider and take
 * the prop alone. Words stay props of their own: the locale formats, it
 * never translates.
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/**
 * The locale to format in: the component's own `locale` prop, else the
 * nearest LocaleProvider's, else `en-US`. Never the runtime's default, so
 * the server and the browser always agree.
 */
// The hook shares the provider's private context, so the two live in one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useLocale(override?: string): string {
  const provided = useContext(LocaleContext);
  return override ?? provided ?? DEFAULT_LOCALE;
}
