"use client";

import Link from "next/link";
import { LinkProvider } from "rift-ds/behaviors/LinkProvider";

/**
 * Hands Next's Link to every client-rendered rift-ds component on the site,
 * the way a consumer's app is told to: their links, and the chat's answer
 * links, navigate through the router instead of reloading the page. Mounted
 * once in the root layout. A client module of its own because the layout is
 * a Server Component, and the link component is set where the provider
 * renders. ClientNav still catches the plain anchors in page prose.
 */
export function SiteLinkProvider({ children }: { children: React.ReactNode }) {
  return <LinkProvider linkComponent={Link}>{children}</LinkProvider>;
}
