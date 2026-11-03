import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("design-qa");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
