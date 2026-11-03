import { skillGuideMetadata } from "@/data/skill-guides";

export const metadata = skillGuideMetadata("responsive-sweep");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
