'use client';

import Link from 'next/link';
import { LinkProvider } from 'rift-ds/behaviors/LinkProvider';

/**
 * The app's root for rift-ds: hands Next's Link to every rift-ds component
 * that renders a link, so they navigate through the router instead of
 * reloading the page. Wrap your root layout's body content in it.
 */
export function RiftRoot({ children }: { children: React.ReactNode }) {
  return <LinkProvider linkComponent={Link}>{children}</LinkProvider>;
}
