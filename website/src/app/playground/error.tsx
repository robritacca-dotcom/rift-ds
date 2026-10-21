"use client";

import RouteErrorFallback, {
  type RouteErrorFallbackProps,
} from "@/components/RouteErrorFallback/RouteErrorFallback";

/**
 * The playground's error boundary. The stage is where a continuous pointer
 * gesture (a card grip, the dock's widen grip, a floating card's move)
 * meets a re-animating chart, and a React error #185 from exactly that
 * blanked the whole site on 2026-10-20 (the resize block in
 * views/ChatView.tsx owns the record). The gesture rule is the fix; this
 * boundary is the cap on the next one: the recovery card on the dotted
 * canvas instead of an unmounted root.
 */
export default function PlaygroundError(props: RouteErrorFallbackProps) {
  return <RouteErrorFallback {...props} surface="stage" />;
}
