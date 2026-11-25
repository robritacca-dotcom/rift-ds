import type { NavStackEntry, NavStackItem, NavStackSection } from './NavStack';

/**
 * The walks NavStack takes over its tree, apart from the component so a
 * host can read the same answers: which row is which, which rows hold the
 * current page, and where the stack opens.
 */

export const isSection = (entry: NavStackEntry): entry is NavStackSection =>
  (entry as NavStackSection).type === 'section';

/** A row's id in a path: its `id`, else its `href`, else its label. */
export const idOf = (item: NavStackItem) => item.id ?? item.href ?? item.label;

/** The rows a level lists, sections opened up. */
export const rowsOf = (entries: NavStackEntry[]) =>
  entries.flatMap((entry) => (isSection(entry) ? entry.items : [entry]));

/** Whether a row is the current page, or holds it somewhere below. */
export function holdsCurrent(item: NavStackItem, currentHref?: string): boolean {
  if (item.current) return true;
  if (currentHref && item.href === currentHref) return true;
  return (item.items ?? []).some((entry) =>
    isSection(entry) ? entry.items.some((child) => holdsCurrent(child, currentHref)) : holdsCurrent(entry, currentHref),
  );
}

/**
 * The path to the deepest level that holds the current page: each row on
 * the way drills in and holds it (it is `current`, its `href` is
 * `currentHref`, or a row below it is). NavStack opens there when it is
 * given no `defaultPath`; a host that shows something only on the first
 * level reads the same path to know where the stack will open.
 */
export function navStackPathTo(items: NavStackEntry[], currentHref?: string): string[] {
  const path: string[] = [];
  let entries = items;
  for (;;) {
    const next = rowsOf(entries).find((row) => row.items?.length && holdsCurrent(row, currentHref));
    if (!next) return path;
    path.push(idOf(next));
    entries = next.items!;
  }
}
