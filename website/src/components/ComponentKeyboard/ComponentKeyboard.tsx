import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { keyboardFor } from "rift-ds/components/registry";
import { componentPages } from "@/data/component-pages";
import styles from "./ComponentKeyboard.module.css";

/**
 * The tested keys of a component that follows a WAI-ARIA pattern, printed
 * from the keyboard contract (`pattern` in the component registry, or
 * `partPatterns` where only a part of it follows one, and the rows the
 * library's keyboard contract story presses against it): one table per
 * pattern. Where the registry says the component owns keys of its own, or
 * leaves them to the platform (`keys`), it prints that sentence. A component
 * with nothing to focus says so in a sentence, the one its markdown contract
 * carries (scripts/generate-component-md.mjs), so "no keys" is stated and
 * never left to be inferred from a missing section.
 *
 * ComponentInstallStrip mounts it, so every component page gets the
 * section the moment its registry entry names a pattern, with no page
 * work, and a page can never print a key no test presses. A page's own
 * hand-written Keyboard section stays for the keys that belong to that
 * component alone.
 */

/** "ArrowRight" reads "Arrow Right"; the rest are already words. */
const keyName = (key: string) => key.replace(/^Arrow(?=[A-Z])/, "Arrow ");

const columns = [
  { key: "key", header: "Key", width: "28%", rowHeader: true },
  { key: "does", header: "What it does" },
];

export default function ComponentKeyboard({ slug }: { slug: string }) {
  const component = componentPages.find((c) => c.slug === slug);
  const patterns = component ? keyboardFor(component.name) : [];
  // Keys no pattern covers: the component's own, or the platform's.
  const keys = component?.keys;
  if (!component) return null;

  if (patterns.length === 0 && !keys?.note) {
    // The chat widget carries no keyboard class of its own; its parts do.
    if (keys?.by !== "none") return null;
    return (
      <section className={styles.section} id="tested-keys">
        <SectionTitle title="Keys" />
        <p className={styles.note}>Nothing here takes focus, so there are no keys. A test holds that.</p>
      </section>
    );
  }

  if (patterns.length === 0) {
    return (
      <section className={styles.section} id="tested-keys">
        <SectionTitle title="Keys" />
        <p className={styles.note}>
          {keys?.note}{" "}
          {keys?.by === "platform"
            ? "Those keys belong to the platform, so no test of this library presses them."
            : `${keys?.see ? `${keys.see}’s stories` : "The component’s own stories"} test these keys.`}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section} id="tested-keys">
      <SectionTitle title="Tested keys" />
      <p className={styles.note}>
        An automated test presses every row below, in a left-to-right and a right-to-left
        layout.
      </p>
      {patterns.map((pattern) => (
        <div key={pattern.id} className={styles.pattern}>
          <p className={styles.note}>
            {pattern.part ? `The ${pattern.part} follows the ` : `${component.label} follows the `}
            <a href={pattern.apg} target="_blank" rel="noopener noreferrer">
              WAI-ARIA {pattern.label.toLowerCase()} pattern
            </a>
            .
          </p>
          <Table
            columns={columns}
            rows={pattern.rows.map((row) => ({
              id: row.id,
              cells: {
                key:
                  row.keys.length > 0 ? (
                    <span className={styles.keys}>
                      {row.keys.map((key) => (
                        <Kbd key={key} size="compact">
                          {keyName(key)}
                        </Kbd>
                      ))}
                    </span>
                  ) : (
                    row.when
                  ),
                does: row.inline
                  ? `${row.text} The opposite arrow in a right-to-left layout.`
                  : row.text,
              },
            }))}
            caption={`Keys the ${pattern.part ?? component.label} is tested against`}
            captionHidden
            bordered
          />
        </div>
      ))}
      {keys?.note && (
        <p className={styles.note}>
          {keys.note}{" "}
          {keys.by === "platform"
            ? "Those keys belong to the platform, so no test of this library presses them."
            : `${keys?.see ? `${keys.see}’s stories` : "The component’s own stories"} test these keys.`}
        </p>
      )}
    </section>
  );
}
