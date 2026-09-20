import Image from "next/image";
import { ButtonGroup } from "@robr0/design-system/components/ButtonGroup/ButtonGroup";
import type { ButtonProps } from "@robr0/design-system/components/Button/Button";
import type { SidebarLink } from "./Sidebar";
import styles from "./Sidebar.module.css";

interface SidebarLinksProps {
  links: SidebarLink[];
  /** Accessible label for the link group */
  ariaLabel?: string;
}

/**
 * The sidebar's link list, shared by both the flat and grouped
 * variants. Maps links onto a vertical tertiary ButtonGroup.
 */
export default function SidebarLinks({ links, ariaLabel = "Components" }: SidebarLinksProps) {
  const buttons: ButtonProps[] = links.map((link) => ({
    label: link.label,
    href: link.disabled ? undefined : link.href,
    state: link.disabled
      ? ("disabled" as const)
      : link.active
        ? ("active" as const)
        : ("default" as const),
    ariaCurrent: link.active,
    variant: "tertiary" as const,
    iconLeft: link.logo ? (
      <Image
        src={link.logo}
        alt=""
        width={18}
        height={18}
        className={styles.itemLogo}
      />
    ) : undefined,
  }));

  return (
    <ButtonGroup orientation="vertical" buttons={buttons} ariaLabel={ariaLabel} />
  );
}
