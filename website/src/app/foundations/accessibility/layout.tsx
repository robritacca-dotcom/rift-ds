import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/accessibility",
  "What the build enforces about accessibility, and the keyboard and focus contract every component inherits."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
