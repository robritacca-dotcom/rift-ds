import type { ComponentPropsWithoutRef } from "react";
import styles from "./MarkdownTable.module.css";

/**
 * A markdown table as the blueprints pages draw it: an outlined scroll
 * wrapper around the native table, so a wide table scrolls inside its frame
 * rather than past the column. The colours are the library's
 * --color-table-* family, the one every table reads, so a docs table and a
 * product table are drawn alike. Pass it as react-markdown's `table`
 * component.
 */
export function MarkdownTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className={styles.wrapper}>
      <table {...props} />
    </div>
  );
}
