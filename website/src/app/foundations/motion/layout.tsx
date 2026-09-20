import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/motion",
  "The motion token scale: durations and easing curves for every transition and animation, plus the reduced-motion contract."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
