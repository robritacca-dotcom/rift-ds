"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "rift-ds/components/Button/Button";
import { figmaUrlForPath } from "@/data/figma-nodes";

interface PageFigmaLinkProps {
  /** The Figma mark, drawn by PageLinks beside its other logos. */
  icon: ReactNode;
}

/**
 * The Figma action on a docs page, beside Storybook. Rendered by PageLinks
 * and self-gated like PageAgentDocs: it reads the route and links the frame
 * figma-nodes.json maps it to, so no page passes a URL; a route the kit has
 * no frame for links the Figma community page.
 */
export default function PageFigmaLink({ icon }: PageFigmaLinkProps) {
  const href = figmaUrlForPath(usePathname());
  return (
    <Button
      label="Figma"
      variant="tertiary"
      size="compact"
      iconLeft={icon}
      iconRight="open_in_new"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    />
  );
}
