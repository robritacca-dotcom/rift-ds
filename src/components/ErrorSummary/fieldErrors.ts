/**
 * Server field errors into the shapes ErrorSummary and Field take. No React,
 * so a route handler or a form action can call it too.
 */

/** One error ErrorSummary lists: the id of the control it belongs to, and what is wrong. */
export type ErrorSummaryError<Message = string> = {
  /** The id of the control the error belongs to; the summary's link focuses it. */
  id: string;
  /** What is wrong, in words that say how to fix it. */
  message: Message;
};

/** Options for {@link fieldErrorsFrom}. */
export type FieldErrorsFromOptions = {
  /** The control id for a field name, when the two differ (`email` named, `signup-email` its id). Defaults to the name itself. */
  idFor?: (name: string) => string;
  /** The order the summary lists fields in, usually the form's own order. Fields not named come after, in the record's order. */
  order?: readonly string[];
};

/** What {@link fieldErrorsFrom} returns: the summary's list, and one message per field for its `errorText`. */
export type FieldErrors = {
  /** Every message, one entry each, for ErrorSummary's `errors`. */
  errors: ErrorSummaryError[];
  /** One message per field name (several joined by a space), for each Field's or Input's `errorText`. */
  errorText: Record<string, string>;
};

/**
 * Turn the common server shape, `{ fieldName: message | message[] }`, into
 * ErrorSummary's `errors` and a per-field `errorText` map. Empty messages
 * and empty lists are dropped, so a record with nothing wrong gives empty
 * results.
 *
 * ```ts
 * const { errors, errorText } = fieldErrorsFrom(response.fieldErrors, { order: ['name', 'email'] });
 * ```
 */
export function fieldErrorsFrom(
  record: Readonly<Record<string, string | readonly string[] | null | undefined>> | null | undefined,
  options: FieldErrorsFromOptions = {},
): FieldErrors {
  const { idFor = (name) => name, order = [] } = options;
  const names = Object.keys(record ?? {});
  const ranked = [...order.filter((name) => names.includes(name)), ...names.filter((name) => !order.includes(name))];
  const errors: ErrorSummaryError[] = [];
  const errorText: Record<string, string> = {};
  for (const name of ranked) {
    const raw = record?.[name];
    const messages = (Array.isArray(raw) ? raw : [raw]).filter((m): m is string => typeof m === 'string' && m.trim() !== '');
    if (messages.length === 0) continue;
    const id = idFor(name);
    for (const message of messages) errors.push({ id, message });
    errorText[name] = messages.join(' ');
  }
  return { errors, errorText };
}
