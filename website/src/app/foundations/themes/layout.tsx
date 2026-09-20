import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/themes",
  "Every shipped theme in one gallery: apply a complete look to this site live, open it in the playground, or copy the one-attribute setup into your own app."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
