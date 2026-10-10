import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/chat-home",
  "An assistant whose first screen is a home page: the greeting and composer up top, and a board of live tiles running on below, beside a history rail of projects and threads."
);

export default function ChatHomeTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
