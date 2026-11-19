/**
 * A chat's context as a small, declared shape, shared by the page that writes
 * it and the route that reads it.
 *
 * The default context is the page path alone, because the context lands in a
 * system block and anything the browser sends is untrusted. A host whose
 * state lives in the browser (the tab that is open, the record in view, the
 * filter a table holds) needs to say more than a path, and the safe way to
 * say more is to say only things that cannot carry an instruction: ids that
 * match a pattern, words from a fixed list, numbers in a range, flags.
 *
 * `defineContext` takes that shape once. The page builds its context with
 * `write` (handed to `getContext`), and the route passes `sanitise` as the
 * handler's `sanitiseContext`. Whatever arrives, `sanitise` keeps only the
 * fields the shape names and only the values each one allows, drops the
 * rest without rejecting the request, and returns the kept fields as a JSON
 * string, or null when nothing survives. `read` parses that string back for
 * a tool. No dependencies, so a page and its route can both import it.
 */

/** What one field of a context may hold. */
export type ContextField =
  /** A same-site path: lowercase slug segments only. */
  | { kind: 'path' }
  /** One word from a fixed list. */
  | { kind: 'oneOf'; values: readonly string[] }
  /** One id matching `pattern`. */
  | { kind: 'id'; pattern: RegExp }
  /** Ids matching `pattern`, at most `max` of them (default 50). */
  | { kind: 'ids'; pattern: RegExp; max?: number }
  /** A finite number between `min` and `max`. */
  | { kind: 'number'; min?: number; max?: number }
  /** True or false. */
  | { kind: 'flag' };

export type ContextShape = Record<string, ContextField>;

type FieldValue<F extends ContextField> = F extends { kind: 'ids' }
  ? string[]
  : F extends { kind: 'number' }
    ? number
    : F extends { kind: 'flag' }
      ? boolean
      : string;

/** The values a shape allows, every field optional. */
export type ContextValues<S extends ContextShape> = { [K in keyof S]?: FieldValue<S[K]> };

export interface ContextSchema<S extends ContextShape> {
  /** The shape, as given. */
  shape: S;
  /** The context string for these values, or null when there are none. What a page returns from `getContext`. */
  write: (values: ContextValues<S>) => string | null;
  /** The handler's `sanitiseContext`: only the fields and values the shape allows, as a JSON string, or null. */
  sanitise: (raw: unknown) => string | null;
  /** The sanitised string parsed back into values, for a tool or a system block. */
  read: (context: string | null) => ContextValues<S>;
}

const MAX_CONTEXT_CHARS = 4000;
const MAX_ID_CHARS = 128;
const PATH = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+){0,7})?$/;

const isId = (pattern: RegExp, value: unknown): value is string =>
  typeof value === 'string' && value.length <= MAX_ID_CHARS && new RegExp(`^(?:${pattern.source})$`, pattern.flags.replace('g', '')).test(value);

function cleanField(field: ContextField, value: unknown): unknown {
  switch (field.kind) {
    case 'path':
      return typeof value === 'string' && value.length <= 128 && PATH.test(value) ? value : undefined;
    case 'oneOf':
      return typeof value === 'string' && field.values.includes(value) ? value : undefined;
    case 'id':
      return isId(field.pattern, value) ? value : undefined;
    case 'ids': {
      if (!Array.isArray(value)) return undefined;
      const kept = [...new Set(value.filter((item) => isId(field.pattern, item)))].slice(0, field.max ?? 50);
      return kept.length ? kept : undefined;
    }
    case 'number':
      return typeof value === 'number' &&
        Number.isFinite(value) &&
        (field.min === undefined || value >= field.min) &&
        (field.max === undefined || value <= field.max)
        ? value
        : undefined;
    case 'flag':
      return typeof value === 'boolean' ? value : undefined;
  }
}

function clean<S extends ContextShape>(shape: S, values: unknown): ContextValues<S> {
  const kept: Record<string, unknown> = {};
  if (typeof values !== 'object' || values === null || Array.isArray(values)) return kept as ContextValues<S>;
  for (const [key, field] of Object.entries(shape)) {
    const value = cleanField(field, (values as Record<string, unknown>)[key]);
    if (value !== undefined) kept[key] = value;
  }
  return kept as ContextValues<S>;
}

const encode = (values: Record<string, unknown>) => (Object.keys(values).length ? JSON.stringify(values) : null);

/** Declares a context shape once, for the page that writes it and the route that sanitises it. */
export function defineContext<S extends ContextShape>(shape: S): ContextSchema<S> {
  return {
    shape,
    write: (values) => encode(clean(shape, values)),
    sanitise: (raw) => {
      if (typeof raw !== 'string' || raw.length > MAX_CONTEXT_CHARS) return null;
      try {
        return encode(clean(shape, JSON.parse(raw)));
      } catch {
        return null;
      }
    },
    read: (context) => {
      if (!context) return {};
      try {
        return clean(shape, JSON.parse(context));
      } catch {
        return {};
      }
    },
  };
}
