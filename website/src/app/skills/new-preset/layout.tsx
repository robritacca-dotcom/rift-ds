import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("new-preset");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
