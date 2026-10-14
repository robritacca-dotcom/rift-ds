import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/layout",
  "The breakpoints layouts switch at, the values the page shell is built from, and the stacking layers every overlay sits on."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
