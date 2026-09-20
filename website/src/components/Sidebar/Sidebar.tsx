import { Button } from "@robr0/design-system/components/Button/Button";
import SidebarLinks from "./SidebarLinks";
import SidebarGroups from "./SidebarGroups";
import styles from "./Sidebar.module.css";

export interface SidebarLink {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Optional logo path (e.g. "/logos/Intuit.svg") rendered to the left of the label */
  logo?: string;
}

export interface SidebarLinkGroup {
  id: string;
  /** Group header text; the header toggles the group open and closed */
  label: string;
  links: SidebarLink[];
}

interface SidebarProps {
  links: SidebarLink[];
  /**
   * Grouped mode: titled link groups rendered below the pinned first link.
   * When set, `links` only supplies that pinned entry (`links[0]`).
   */
  groups?: SidebarLinkGroup[];
}

export default function Sidebar({ links, groups }: SidebarProps) {
  const [pinned] = links;

  return (
    <aside className={styles.sidebar} aria-label="Component navigation">
      {groups ? (
        <>
          {pinned && (
            <div className={styles.pinnedHome}>
              <Button
                label={pinned.label}
                href={pinned.disabled ? undefined : pinned.href}
                state={pinned.active ? "active" : "default"}
                ariaCurrent={pinned.active}
                variant="tertiary"
              />
            </div>
          )}
          <SidebarGroups groups={groups} />
        </>
      ) : (
        <SidebarLinks links={links} />
      )}
    </aside>
  );
}
