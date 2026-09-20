import React from "react";
import type { AnchorNavItem } from "@robr0/design-system/components/AnchorNav/AnchorNav";

/* Shared by the three blueprint pages: extractSections reads the h2 list out
   of the raw markdown for the AnchorNav rail, and createAnchoredH2 gives
   ReactMarkdown an h2 renderer that assigns the matching ids. Both derive
   ids through the same slugger, so a link and its target cannot disagree. */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "-");
}

/* Stateful per document: repeated heading text gets a -1, -2 suffix, so the
   extractor and the renderer must each run a fresh slugger over the same
   headings in the same order. */
function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

export function extractSections(markdown: string): AnchorNavItem[] {
  const slug = createSlugger();
  const items: AnchorNavItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    /* Inline markdown syntax never reaches the rendered heading text, so it
       must not reach the slug either */
    const label = match[1].replace(/[`*]/g, "");
    items.push({ id: slug(label), label });
  }
  return items;
}

function textOf(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (React.isValidElement(child)) {
        return textOf((child.props as { children?: React.ReactNode }).children);
      }
      return "";
    })
    .join("");
}

export function createAnchoredH2() {
  const slug = createSlugger();
  return function AnchoredH2({
    node: _node,
    children,
    ...rest
  }: React.ComponentPropsWithoutRef<"h2"> & { node?: unknown }) {
    void _node;
    return (
      <h2 id={slug(textOf(children))} {...rest}>
        {children}
      </h2>
    );
  };
}
