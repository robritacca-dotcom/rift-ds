"use client";

import { usePathname } from "next/navigation";
import { Button } from "rift-ds/components/Button/Button";

/**
 * The "Token files" action on a foundations page, the counterpart of For
 * agents on a component page. Rendered by PageLinks and self-gated the same
 * way: it appears on /foundations and the pages under it, and links the
 * token index (/schema/tokens/index.json, which lists every theme's DTCG
 * files and names the guide on /docs/schemas), so a page that shows tokens
 * as swatches is one plain link from the same tokens as data. The index is
 * a file, not a page, so the link is a plain anchor.
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
      href="/schema/tokens/index.json"
      linkComponent="a"
    />
  );
}
