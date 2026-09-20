import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { componentMetadata } from "@robr0/design-system/components/registry";
import { SITE_URL } from "@/config/brand.generated";
import styles from "./ComponentInstallStrip.module.css";

/**
 * The per-component install strip, under every component page's header:
 * the import line for the npm package and the component's personal
 * shadcn CLI command, both copyable. Everything derives from the
 * registry and the brand module — pages pass only their slug, and
 * validate-website-surfaces holds every component page to rendering
 * one, so the strip can neither drift nor go missing.
 */
export default function ComponentInstallStrip({ slug }: { slug: string }) {
  const component = componentMetadata.find((c) => c.slug === slug);
  if (!component) return null;

  const importPath = component.recharts
    ? "@robr0/design-system/charts"
    : `@robr0/design-system/components/${component.name}/${component.name}`;

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
