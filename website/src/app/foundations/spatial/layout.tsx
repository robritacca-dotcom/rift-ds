import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/spatial",
  "Spacing tokens for padding, gap, radius, and border: consistent spatial relationships across all components."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
