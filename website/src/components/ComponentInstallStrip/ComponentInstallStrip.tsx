"use client";

import InstallSnippet from "./InstallSnippet";
import { useComponentProps } from "../ComponentProps/ComponentPropsSlot";
import Link from "next/link";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { alternativesFor } from "rift-ds/components/registry";
import ComponentKeyboard from "../ComponentKeyboard/ComponentKeyboard";
import { componentPages, isWidgetSlug } from "@/data/component-pages";
import { chatWidget } from "rift-ds/chat";
import { SITE_URL } from "@/config/brand.generated";
import componentSizes from "@/data/component-sizes.json";
import styles from "./ComponentInstallStrip.module.css";

/**
 * The per-component install strip, closing every component page at the
 * content column's full width:
 * the import line for the npm package and the component's personal
 * shadcn CLI command, both copyable. Everything derives from the
 * registry and the brand module — pages pass only their slug, and
 * validate-website-surfaces holds every component page to rendering
 * one, so the strip can neither drift nor go missing.
 *
 * Under the snippet it prints what the import costs, from
 * website/src/data/component-sizes.json.
 *
 * It also carries the page's Props section (rendered on the server by
 * ComponentPageLayout and read from ComponentPropsSlot) and its keys
 * (ComponentKeyboard) above it, so both reach every component page the same
 * way.
 *
 * Above both it prints the component's alternatives: the look-alikes its
 * registry entry names, each with the condition that picks it, so the
 * sentence that tells two similar components apart is on both pages.
 *
 * It closes with plain links to the component's generated contract, the
 * markdown and the JSON schema. The For agents dialog shows the same two
 * files, but only after a click and a fetch; a crawler or an agent reading
 * the served HTML follows these.
 */
export default function ComponentInstallStrip({ slug }: { slug: string }) {
  const propsSection = useComponentProps();
  const component = componentPages.find((c) => c.slug === slug);
  if (!component) return null;

  // The chat widget lives in its own subpath (src/chat/registry.json names it);
  // every library component is a deep path under components/, or the charts
  // barrel when it needs recharts.
  const importPath = isWidgetSlug(slug)
    ? `rift-ds${Object.keys(chatWidget.subpaths)[0].slice(1)}`
    : component.recharts
      ? "rift-ds/charts"
      : `rift-ds/components/${component.name}/${component.name}`;

  // What the import costs, as scripts/validate-size-budget.mjs measured it
  // from the built package. The chat widget has no figure here.
  const size = (componentSizes.sizes as Record<string, number>)[component.name];

  const alternatives = alternativesFor(component.name);

  const snippet = [
    `// From the npm package`,
    `import { ${component.name} } from '${importPath}';`,
    ``,
    `// Or as source you own, via the shadcn CLI`,
    `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`,
  ].join("\n");

  return (
    <>
      {alternatives.length > 0 && (
        <section className={styles.alternatives} id="alternatives">
          <SectionTitle title="Alternatives" />
          <ul className={styles.alternativeList}>
            {alternatives.map((alt) => (
              <li key={alt.name}>
                Use <Link href={`/components/${alt.slug}`}>{alt.label}</Link> instead when {alt.when}.
              </li>
            ))}
          </ul>
        </section>
      )}
      {propsSection}
      <ComponentKeyboard slug={slug} />
      <div className={styles.strip}>
        <InstallSnippet code={snippet} slug={slug} />
        {size !== undefined && (
          <p className={styles.size}>
            {(size / 1000).toFixed(1)} kB gzipped, with everything it imports. Peer dependencies
            are not counted.
          </p>
        )}
        <p className={styles.size}>
          For agents: the props, their allowed values and defaults, and the tested keys, as{" "}
          <a href={`/components/${slug}.md`}>markdown</a> or as a{" "}
          <a href={`/schema/components/${slug}.json`}>JSON schema</a>.
        </p>
      </div>
    </>
  );
}
