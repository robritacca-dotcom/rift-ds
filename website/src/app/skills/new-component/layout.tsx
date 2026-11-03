import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("new-component");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
