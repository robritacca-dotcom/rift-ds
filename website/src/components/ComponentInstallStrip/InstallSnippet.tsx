"use client";

import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * The install strip's copyable block, split out so the copy can be counted:
 * the strip is a server component, and a callback cannot cross that
 * boundary, so the one client piece is the block that takes it.
 */
export default function InstallSnippet({ code, slug }: { code: string; slug: string }) {
  return (
    <CodeBlock
      code={code}
      language="tsx"
      showCopy
      onCopied={() => trackEvent(SITE_EVENTS.copyInstall, { snippet: "component", component: slug })}
    />
  );
}
