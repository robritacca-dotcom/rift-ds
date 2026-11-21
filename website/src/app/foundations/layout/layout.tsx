import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/layout",
  "The breakpoints, the site frame, the three app shell modes and the stacking layers every overlay sits on."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
