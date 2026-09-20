"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CHROMELESS_ROUTES } from "@/config/chromeless";

/**
 * Pathname gate for the footer. A thin client wrapper so SiteFooter
 * itself stays server-rendered: the root layout mounts
 * `<SiteFooterMount><SiteFooter /></SiteFooterMount>`.
 */
export function SiteFooterMount({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (CHROMELESS_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
