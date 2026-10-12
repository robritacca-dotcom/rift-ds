import { Table } from "rift-ds/components/Table/Table";
import type { ComponentExportApi } from "@/data/component-api.generated";
import styles from "./PropsTable.module.css";

/**
 * One exported component's documented props, as the library Table. The
 * rows come from the generated component API, the same docgen pass that
 * fills Storybook's props tables, the shipped .d.ts, the .md contract pages
 * and the MCP get_component tool, so a table here can never say something
 * the package does not.
 */
export default function PropsTable({ exported }: { exported: ComponentExportApi }) {
  if (exported.props.length === 0) {
    return <p className={styles.empty}>No own props; native attributes pass through.</p>;
  }
  return (
    <Table
      bordered
      size="compact"
      caption={`${exported.component} props`}
      captionHidden
      columns={[
        { key: "name", header: "Prop", width: "22%" },
        { key: "type", header: "Type", width: "30%" },
        { key: "default", header: "Default", width: "12%" },
        { key: "description", header: "Description" },
      ]}
      rows={exported.props.map((prop) => ({
        id: prop.name,
        cells: {
          name: (
            <code className={styles.name}>
              {prop.name}
              {prop.required ? <span className={styles.required}>*</span> : null}
            </code>
          ),
          type: <code className={styles.type}>{prop.type}</code>,
          default: prop.defaultValue != null ? <code className={styles.type}>{prop.defaultValue}</code> : "",
          description: prop.deprecated ? (
            <>
              {prop.description} <em>Deprecated: {prop.deprecated}</em>
            </>
          ) : (
            prop.description
          ),
        },
      }))}
    />
  );
}
