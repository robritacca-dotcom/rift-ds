"use client";

import RouteErrorFallback, {
  type RouteErrorFallbackProps,
} from "@/components/RouteErrorFallback/RouteErrorFallback";

/**
 * The root error boundary: a runtime error inside any page's segment shows
 * the recovery card in place of the page, while the root layout (and the
 * chat, palette, footer and background it mounts) stays up. It wraps the
 * routes below the root layout, not the layout itself, so a throw inside
 * the layout-mounted chrome is outside its reach; that is global-error's
 * job, which this site does not define. The immersive segments carry their
 * own boundary so recovery stays scoped to the stage; this one is the
 * backstop for every other route.
 */
export default function RootError(props: RouteErrorFallbackProps) {
  return <RouteErrorFallback {...props} />;
}
