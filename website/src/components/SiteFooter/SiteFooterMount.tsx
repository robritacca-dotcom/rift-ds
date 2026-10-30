"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isChromeless } from "@/config/chromeless";

/**
 * Pathname gate for the footer. A thin client wrapper so SiteFooter
 * itself stays server-rendered: the root layout mounts
 * `<SiteFooterMount><SiteFooter /></SiteFooterMount>`.
 */
export function SiteFooterMount({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isChromeless(pathname)) return null;
  return <>{children}</>;
}
