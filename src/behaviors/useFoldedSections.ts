'use client';

import { useCallback, useState } from 'react';

/**
 * The fold state of a nav's titled sections, for a nav whose sections can
 * fold under their headings (AppSidebar's and ThreadPanel's
 * `collapsibleSections`). Sections open by default, so the state is the
 * list of folded ids: controlled through `collapsed`, or kept here from
 * `defaultCollapsed`, with `onChange` told the whole new list either way.
 * SideNav folds its sections its own way (per section, closed by default),
 * so it keeps its own expanded list.
 */
export function useFoldedSections({
  collapsed,
  defaultCollapsed,
  onChange,
}: {
  collapsed?: string[];
  defaultCollapsed?: string[];
  onChange?: (collapsed: string[]) => void;
}) {
  const [own, setOwn] = useState<string[]>(() => defaultCollapsed ?? []);
  const current = collapsed ?? own;
  const toggle = useCallback(
    (id: string) => {
      const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
      if (collapsed === undefined) setOwn(next);
      onChange?.(next);
    },
    [current, collapsed, onChange],
  );
  const isFolded = (id: string) => current.includes(id);
  return { isFolded, toggle };
}
