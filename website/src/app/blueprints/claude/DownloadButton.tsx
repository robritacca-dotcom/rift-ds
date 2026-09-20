"use client";

import { Button } from "@robr0/design-system/components/Button/Button";

export default function DownloadButton() {
  return (
    <a href="/CLAUDE.md" download="CLAUDE.md">
      <Button label="Download" variant="tertiary" size="compact" iconLeft="download" />
    </a>
  );
}
