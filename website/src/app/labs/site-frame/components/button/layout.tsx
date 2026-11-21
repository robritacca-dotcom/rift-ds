import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";

/** The Button page's Props section, rendered on the server as on the real page. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="button">{children}</ComponentPageLayout>;
}
