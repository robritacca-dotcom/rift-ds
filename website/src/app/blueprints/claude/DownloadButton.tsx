"use client";

import { Button } from "rift-ds/components/Button/Button";

export default function DownloadButton() {
  return (
    <a href="/CLAUDE.md" download="CLAUDE.md">
      <Button label="Download" variant="tertiary" size="compact" iconLeft="download" />
    </a>
  );
}
