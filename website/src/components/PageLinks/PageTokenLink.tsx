"use client";

import { usePathname } from "next/navigation";
import { Button } from "rift-ds/components/Button/Button";

/**
 * The "Token files" action on a foundations page, the counterpart of For
 * agents on a component page. Rendered by PageLinks and self-gated the same
 * way: it appears on /foundations and the pages under it, and links the
 * section of /docs/schemas that lists every token file, theme by theme, so
 * a page that shows tokens as swatches is one plain link from the same
 * tokens as data.
 */
export default function PageTokenLink() {
  const pathname = usePathname();
  if (!pathname?.startsWith("/foundations")) return null;
  return (
    <Button
      label="Token files"
      variant="tertiary"
      size="compact"
      iconLeft="data_object"
      href="/docs/schemas#design-tokens"
    />
  );
}
