"use client";

import RouteErrorFallback, {
  type RouteErrorFallbackProps,
} from "@/components/RouteErrorFallback/RouteErrorFallback";

/**
 * The graph instrument's error boundary: a throw inside the tracing
 * surface shows the recovery card on the same dotted canvas, scoped to
 * this segment, instead of unmounting the root.
 */
export default function GraphError(props: RouteErrorFallbackProps) {
  return <RouteErrorFallback {...props} surface="stage" />;
}
