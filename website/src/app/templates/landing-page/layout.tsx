import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/landing-page",
  "A product landing page from the design system alone: a hero with a live checkout, a bento of products, the figures and a closing call to action."
);

export default function LandingPageTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
