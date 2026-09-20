import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/elevation",
  "The two shadow tokens in the system (--shadow-floating and --shadow-modal) and the colour ramp that carries depth everywhere else."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
