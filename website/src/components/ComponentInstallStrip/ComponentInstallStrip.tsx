import InstallSnippet from "./InstallSnippet";
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
 * It also carries the page's tested keys above it (ComponentKeyboard,
 * which renders nothing for a component with nothing to focus), so that section reaches every component page the same way.
 */
export default function ComponentInstallStrip({ slug }: { slug: string }) {
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

  const snippet = [
    `// From the npm package`,
    `import { ${component.name} } from '${importPath}';`,
    ``,
    `// Or as source you own, via the shadcn CLI`,
    `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`,
  ].join("\n");

  return (
    <>
      <ComponentKeyboard slug={slug} />
      <div className={styles.strip}>
        <InstallSnippet code={snippet} slug={slug} />
        {size !== undefined && (
          <p className={styles.size}>
            {(size / 1000).toFixed(1)} kB gzipped, with everything it imports. Peer dependencies
            are not counted.
          </p>
        )}
      </div>
    </>
  );
}
