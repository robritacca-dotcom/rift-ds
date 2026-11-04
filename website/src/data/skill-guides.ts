import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

/**
 * Skills that have a walkthrough page of their own beneath /skills, keyed by
 * skill slug. The /skills card links here, the sitemap reads the hrefs, and
 * each walkthrough's layout takes its metadata from its entry, so a new
 * walkthrough is one entry here plus its page folder.
 */
export interface SkillGuide {
  href: string;
  /** The page title, in metadata and the browser tab. */
  title: string;
  /** One sentence for metadata and social previews. */
  description: string;
}

export const SKILL_GUIDE_LINK_LABEL = "How it works";

export const SKILL_GUIDES: Record<string, SkillGuide> = {
  "new-component": {
    href: "/skills/new-component",
    title: "How new-component works",
    description:
      "The new-component skill step by step, then one real component traced from its folder to Storybook, the site and npm.",
  },
  "new-token": {
    href: "/skills/new-token",
    title: "How new-token works",
    description:
      "The new-token skill step by step, then the action colour traced from its primitive to Button, the foundations page and the generated files.",
  },
  "new-preset": {
    href: "/skills/new-preset",
    title: "How new-preset works",
    description:
      "The new-preset skill step by step, then the forest preset traced from its entry in presets.ts to every place a theme is picked.",
  },
  "new-validator": {
    href: "/skills/new-validator",
    title: "How new-validator works",
    description:
      "The new-validator skill step by step, then a hex code traced from the one file allowed to hold it to the build a stray one stops.",
  },
  "design-qa": {
    href: "/skills/design-qa",
    title: "How design-qa works",
    description:
      "The design-qa skill step by step, then one visual QA pass over Button traced from its stories in both themes to the report.",
  },
  "responsive-sweep": {
    href: "/skills/responsive-sweep",
    title: "How responsive-sweep works",
    description:
      "The responsive-sweep skill step by step, then one sweep traced from the built site through each verdict to where its findings land.",
  },
  "drift-audit": {
    href: "/skills/drift-audit",
    title: "How drift-audit works",
    description:
      "The drift-audit skill step by step, then one renamed route traced through every skill, doc and page that describes the repo.",
  },
  "super-ship": {
    href: "/skills/super-ship",
    title: "How super-ship works",
    description:
      "The super-ship skill step by step, one structural change traced through the audits, fixes and sweep to the live site, then every check the ship runs.",
  },
  "chat-quality": {
    href: "/skills/chat-quality",
    title: "How chat-quality works",
    description:
      "The loop that turns thumbs verdicts on the site chat into golden-set cases, runs the eval once, and leaves the fixes on a branch for approval.",
  },
};

export const SKILL_GUIDE_HREFS = Object.values(SKILL_GUIDES).map((g) => g.href);

/** Metadata for a walkthrough page, resolved from its entry above. */
export function skillGuideMetadata(slug: string): Metadata {
  const guide = SKILL_GUIDES[slug];
  if (!guide) {
    throw new Error(`skillGuideMetadata: no walkthrough registered for "${slug}" in skill-guides.ts.`);
  }
  return {
    alternates: { canonical: guide.href },
    title: guide.title,
    description: guide.description,
    openGraph: pageOpenGraph(guide.title, guide.description, guide.href),
  };
}
