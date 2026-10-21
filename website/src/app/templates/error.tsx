"use client";

import RouteErrorFallback, {
  type RouteErrorFallbackProps,
} from "@/components/RouteErrorFallback/RouteErrorFallback";

/**
 * The templates' error boundary, shared by the index and every template
 * screen beneath it. The screens are chromeless full-viewport app shells,
 * so the card decides its ground from the route: a template screen gets
 * the dotted stage, the chrome-bearing index keeps the site header and
 * the ambient field.
 */
export default function TemplatesError(props: RouteErrorFallbackProps) {
  return <RouteErrorFallback {...props} />;
}
