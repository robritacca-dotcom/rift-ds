/**
 * rift-ds/format: the pure formatting and arithmetic helpers the components
 * share, published so an app's own code follows the same rules. No React,
 * no browser API and no runtime dependency, so a server, a route handler
 * and a client control can all import it.
 *
 * Money is a decimal string, added and multiplied on integers (money.ts);
 * dates read against now or in a named zone come from relative.ts. Plain
 * numbers and calendar conventions stay with the locale helpers the
 * components already read (src/behaviors/locale.ts).
 */

export {
  addDecimal,
  compareDecimal,
  currencyFractionDigits,
  formatMoney,
  fromMinorUnits,
  multiplyDecimal,
  parseDecimal,
  subtractDecimal,
  sumDecimal,
  toMinorUnits,
} from './money';
export type {
  DecimalRounding,
  DecimalString,
  FormatMoneyOptions,
  MinorUnitScale,
  MultiplyDecimalOptions,
  ParseDecimalOptions,
} from './money';
export { formatInTimeZone, formatRelative, toDate } from './relative';
export type { DateInput, FormatInTimeZoneOptions, FormatRelativeOptions } from './relative';
