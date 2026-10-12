import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/chat/install",
  "Add the chat to a Next.js app with one command: the routes, the limits, the mount and the env it writes, and the one change that takes it live."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
