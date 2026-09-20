"use client";

import { useState } from "react";
import SidebarLinks from "./SidebarLinks";
import type { SidebarLinkGroup } from "./Sidebar";
import styles from "./Sidebar.module.css";

interface SidebarGroupsProps {
  groups: SidebarLinkGroup[];
}

/**
 * The grouped variant of the sidebar's link list: one accordion per group.
 * The group holding the current page starts open; the rest stay collapsed
 * until toggled.
 */
export default function SidebarGroups({ groups }: SidebarGroupsProps) {
  const activeGroupId = groups.find((group) =>
    group.links.some((link) => link.active)
  )?.id;

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(activeGroupId ? [activeGroupId] : [])
  );

  // Client-side navigation can move the active link to a collapsed group;
  // adjust during render (the React-endorsed pattern) rather than in an effect.
  const [prevActiveGroupId, setPrevActiveGroupId] = useState(activeGroupId);
  if (activeGroupId !== prevActiveGroupId) {
    setPrevActiveGroupId(activeGroupId);
    if (activeGroupId && !openIds.has(activeGroupId)) {
      setOpenIds(new Set(openIds).add(activeGroupId));
    }
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={styles.groups}>
      {groups.map((group) => {
        const open = openIds.has(group.id);
        return (
          <div key={group.id} className={styles.group}>
            <button
              type="button"
              className={styles.groupHeader}
              aria-expanded={open}
              aria-controls={`sidebar-group-${group.id}`}
              onClick={() => toggle(group.id)}
            >
              <span>{group.label}</span>
              <span
                className={`material-symbols-rounded ${styles.groupChevron} ${open ? styles.groupChevronOpen : ""}`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>
            {open && (
              <div id={`sidebar-group-${group.id}`} className={styles.groupList}>
                <SidebarLinks links={group.links} ariaLabel={group.label} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
