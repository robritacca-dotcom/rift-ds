import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/blocks",
  "Whole starting pages for a new app, with the layout and spacing already set: an app shell, a dashboard and a sign-in, each added with one command."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
