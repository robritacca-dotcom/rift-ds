"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFramed, siteFrameNavFor, siteFrameRailFor } from "@/config/site-frame";
import SiteFrame from "./SiteFrame";

/**
 * The root layout's gate for the site frame: every framed route (any route
 * with the site's chrome) renders its page inside SiteFrame, with the
 * route's sidebar and rail read from config/site-frame.ts; a chromeless
 * route renders its page alone. Mounted once around the root layout's
 * children, so the frame never remounts on navigation.
 */
export function SiteFrameMount({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (!isFramed(pathname)) return <>{children}</>;
  const nav = siteFrameNavFor(pathname);
  return (
    <SiteFrame nav={nav} currentHref={nav?.current ?? pathname} onThisPage={siteFrameRailFor(pathname)}>
      {children}
    </SiteFrame>
  );
}
