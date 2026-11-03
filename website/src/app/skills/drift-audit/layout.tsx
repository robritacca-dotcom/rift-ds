import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("drift-audit");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
