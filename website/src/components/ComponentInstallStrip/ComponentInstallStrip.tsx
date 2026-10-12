import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { componentPages, isWidgetSlug } from "@/data/component-pages";
import { chatWidget } from "rift-ds/chat";
import { SITE_URL } from "@/config/brand.generated";
import styles from "./ComponentInstallStrip.module.css";

/**
 * The per-component install strip, closing every component page at the
 * content column's full width:
 * the import line for the npm package and the component's personal
 * shadcn CLI command, both copyable. Everything derives from the
 * registry and the brand module — pages pass only their slug, and
 * validate-website-surfaces holds every component page to rendering
 * one, so the strip can neither drift nor go missing.
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

  const snippet = [
    `// From the npm package`,
    `import { ${component.name} } from '${importPath}';`,
    ``,
    `// Or as source you own, via the shadcn CLI`,
    `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`,
  ].join("\n");

  return (
    <div className={styles.strip}>
      <CodeBlock code={snippet} language="tsx" showCopy />
    </div>
  );
}
