import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/schemas",
  "The component contracts and the design tokens as JSON a tool can check: one schema per component, the meta-schema they validate against, and the tokens resolved per theme and in the DTCG format."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
