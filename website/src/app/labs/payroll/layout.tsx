import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: payroll console",
  description:
    "A lightweight payroll product with the chat docked as a side rail, to exercise the agent panel at product scale.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsPayrollLayout({ children }: { children: ReactNode }) {
  return children;
}
