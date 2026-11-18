import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/blocks",
  "Whole starting pages for a new app, such as an app shell, a dashboard or a settings page, with the layout and spacing already set, each added with one command."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
