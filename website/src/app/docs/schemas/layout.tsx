import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/schemas",
  "Component contracts and design tokens as JSON a tool can check: a schema per component, the meta-schema behind them, and tokens per theme and as DTCG."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
