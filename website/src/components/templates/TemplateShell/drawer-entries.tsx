"use client";

import type { DrillMenuEntry, DrillMenuItem } from "rift-ds/components/DrillMenu/DrillMenu";
import type { EntitySwitcherItem } from "rift-ds/components/EntitySwitcher/EntitySwitcher";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import styles from "./TemplateShell.module.css";

/** An entity's mark in a row's icon slot: its logo, its icon, or its initials on its fill, as the switcher draws it. */
function mark(item: EntitySwitcherItem) {
  if (item.icon && !item.logo) return item.icon;
  return (
    <Avatar
      className={styles.drawerMark}
      size="sm"
      shape="square"
      name={item.name}
      src={item.logo}
      fill={item.fill}
    />
  );
}

/** The path of names to the chosen entity, for the row's value. */
function find(items: EntitySwitcherItem[], value?: string): EntitySwitcherItem | undefined {
  for (const item of items) {
    if (item.id === value) return item;
    const below = find(item.children ?? [], value);
    if (below) return below;
  }
  return undefined;
}

/**
 * The EntitySwitcher as the phone drawer's first row: the chosen entity
 * named, with its mark, drilling into the tree. An entity with children
 * is a level of its own that opens with the entity itself as a choice (the
 * switcher's "all of" pick) above the ones under it; a leaf is a choice.
 * The chosen one carries the mark, and a pick keeps the drawer open on its
 * level, so the reader sees which one is now chosen.
 */
export function entitySwitcherEntries({
  items,
  value,
  onPick,
  label,
}: {
  items: EntitySwitcherItem[];
  value?: string;
  onPick: (id: string, item: EntitySwitcherItem) => void;
  label: string;
}): DrillMenuEntry[] {
  const choice = (item: EntitySwitcherItem, asAll = false): DrillMenuItem => ({
    id: asAll ? `${item.id}#self` : item.id,
    label: item.name,
    description: item.description,
    icon: mark(item),
    selected: item.id === value,
    onClick: () => onPick(item.id, item),
  });
  const row = (item: EntitySwitcherItem): DrillMenuItem =>
    item.children?.length
      ? {
          id: item.id,
          label: item.name,
          description: item.description,
          icon: mark(item),
          items: [{ type: "section", items: [choice(item, true)] }, { type: "section", items: item.children.map(row) }],
        }
      : choice(item);

  const chosen = find(items, value) ?? items[0];
  return [
    {
      type: "section",
      id: "entity",
      items: [
        {
          id: "entity",
          label: chosen?.name ?? label,
          title: label,
          description: chosen?.description,
          icon: chosen && mark(chosen),
          items: items.map(row),
        },
      ],
    },
  ];
}
