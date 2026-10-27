import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/sign-in",
  "A product sign-in screen from the design system alone: identity providers and an email form on the left, an ambient panel filling the right half."
);

export default function SignInTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
