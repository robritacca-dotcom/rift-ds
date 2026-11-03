import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("new-validator");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
