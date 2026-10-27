import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/chat",
  "How to add the AI chat: one command for the full install, the chat panel over your own endpoint, or the headless engine under your own UI."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
