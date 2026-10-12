import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/chat/overview",
  "What the chat does, shown live: replies that arrive as they are written, charts and cards inside a reply, the three screens it fits, past chats, suggestions and input."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
