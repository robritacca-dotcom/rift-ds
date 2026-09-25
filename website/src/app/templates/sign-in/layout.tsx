import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/sign-in",
  "A product sign-in screen built from the design system alone: the identity providers and the email form on the left, an ambient panel holding the right half of the split."
);

export default function SignInTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
