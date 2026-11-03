import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("new-token");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
