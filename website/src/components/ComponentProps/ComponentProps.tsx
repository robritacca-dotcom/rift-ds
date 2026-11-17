import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PropsTable from "../PropsTable/PropsTable";
import { componentApi } from "@/data/component-api.generated";
import styles from "./ComponentProps.module.css";

/**
 * A component page's Props section: one table per exported component, read
 * from the generated prop reference, the same docgen pass behind the .md
 * contract, the JSON schema and the MCP get_component tool. A prop's allowed
 * values and default are text on the page here, so a reader that cannot open
 * the For agents dialog or Storybook still finds them.
 *
 * Server-only by weight: it imports the whole reference, so it is rendered
 * by ComponentPageLayout from each component page's layout.tsx and never
 * imported by a page.
 */
export default function ComponentProps({ slug }: { slug: string }) {
  const entry = componentApi.find((candidate) => candidate.slug === slug);
  if (!entry || entry.exports.length === 0) return null;
  const several = entry.exports.length > 1;

  return (
    <section className={styles.section} id="props">
      <SectionTitle title="Props" />
      <p className={styles.note}>
        Read from the same JSDoc that ships in the package&apos;s types. A required prop is marked
        with an asterisk.
      </p>
      {entry.exports.map((exported) => (
        <div key={exported.component} className={styles.block}>
          {several && <h3 className={styles.heading}>{exported.component}</h3>}
          <PropsTable exported={exported} />
        </div>
      ))}
    </section>
  );
}
