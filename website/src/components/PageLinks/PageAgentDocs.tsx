"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";
import styles from "./PageAgentDocs.module.css";

type DocTab = "markdown" | "schema";

const PANEL_ID = "page-agent-docs-panel";

const DOC_TABS: { value: DocTab; label: string; panelId: string }[] = [
  { value: "markdown", label: "Markdown", panelId: PANEL_ID },
  { value: "schema", label: "Schema", panelId: PANEL_ID },
];

/**
 * The "For agents" action on component docs pages: one button, one dialog,
 * and a tab for each generated contract, ready to copy. Markdown is
 * /components/<slug>.md (scripts/generate-component-md.mjs) and the schema is
 * /schema/components/<slug>.json (scripts/generate-component-schema.mjs),
 * its props, allowed values and defaults as data.
 *
 * Rendered unconditionally by PageLinks and self-gated: it only appears on
 * /components/<slug> routes, where both files are guaranteed to exist. A file
 * is fetched the first time its tab shows, so a page view costs nothing. If a
 * fetch fails the tab links the file instead.
 */
export default function PageAgentDocs() {
  const pathname = usePathname();
  const slug = pathname?.match(/^\/components\/([a-z0-9-]+)$/)?.[1];
  if (!slug) return null;
  // Keyed by component: PageLinks stays mounted through client navigation, and
  // what was fetched for one component must never show on the next.
  return <AgentDocs key={slug} slug={slug} />;
}

function AgentDocs({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DocTab>("markdown");
  const [files, setFiles] = useState<Partial<Record<DocTab, string | null>>>({});

  const urls: Record<DocTab, string> = {
    markdown: `/components/${slug}.md`,
    schema: `/schema/components/${slug}.json`,
  };
  const url = urls[tab];
  const loaded = files[tab] !== undefined;

  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
        return response.text();
      })
      .then(
        (text) => !cancelled && setFiles((current) => ({ ...current, [tab]: text })),
        () => !cancelled && setFiles((current) => ({ ...current, [tab]: null })),
      );
    return () => {
      cancelled = true;
    };
  }, [open, loaded, url, tab]);

  const selectTab = (next: string) => {
    setTab(next as DocTab);
    if (next === "schema") trackEvent(SITE_EVENTS.openComponentSchema, { component: slug });
  };

  const text = files[tab];

  return (
    <>
      <Button
        label="For agents"
        variant="tertiary"
        size="compact"
        iconLeft="data_object"
        onClick={() => setOpen(true)}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="For agents"
        description="This component's contract, generated from the same JSDoc that ships in the package."
        size="lg"
      >
        <div className={styles.body}>
          <Tabs tabs={DOC_TABS} value={tab} onValueChange={selectTab} aria-label="Contract format" />
          <div id={PANEL_ID} role="tabpanel" aria-label={tab === "markdown" ? "Markdown" : "Schema"} className={styles.panel}>
            {text === null ? (
              <p className={styles.note}>
                This file did not load. <a href={url}>Open it directly</a>.
              </p>
            ) : (
              <CodeBlock
                key={tab}
                code={text ?? ""}
                language={tab === "markdown" ? "markdown" : "json"}
                filename={url.split("/").pop()}
                maxHeight={420}
                showCopy={text !== undefined}
                onCopied={
                  tab === "markdown"
                    ? () => trackEvent(SITE_EVENTS.copyComponentMarkdown, { component: slug })
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
