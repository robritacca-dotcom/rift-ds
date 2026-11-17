import ComponentProps from "./ComponentProps";
import { ComponentPropsProvider } from "./ComponentPropsSlot";

/**
 * The body of every component page's layout.tsx. It renders the page's Props
 * section on the server and hands it down through ComponentPropsProvider, so
 * the client page shows it (through ComponentInstallStrip) without the prop
 * reference entering its bundle. scripts/validate-page-titles.mjs holds
 * every component layout to rendering one with its own slug.
 */
export default function ComponentPageLayout({
  slug,
  children,
}: {
  /** The component page's slug, as its registry entry carries it. */
  slug: string;
  children: React.ReactNode;
}) {
  return <ComponentPropsProvider section={<ComponentProps slug={slug} />}>{children}</ComponentPropsProvider>;
}
