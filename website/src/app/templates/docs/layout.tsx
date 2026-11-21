import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/docs",
  "A documentation site from the design system alone: a long sidebar of pages, highlighted code, live examples, a props table and an on-this-page rail."
);

export default function DocsTemplateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
