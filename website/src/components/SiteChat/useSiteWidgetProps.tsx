"use client";

import { usePathname } from "next/navigation";
import { useChatWidget, type ChatWidgetProps } from "rift-ds/chat";
import { getNavLabel } from "@/config/navigation";
import { getPageSummary } from "@/data/page-summaries";
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from "@/lib/chat-model";
import { ASSISTANT_NAME } from "@/config/brand.generated";
import { focusIcon, focusLabel, focusNote, useSiteFocus } from "./siteFocus";
import { startersForPath } from "./starters";
import styles from "./SiteChatMount.module.css";

/**
 * What the site tells the package's ChatWidget about itself: the assistant's
 * name and mark, the welcome copy, the route-aware starters (drawn with the
 * provider's seed, keyed by the pathname so a page's set reveals once), the
 * composer's context note naming the page the visitor is reading, or what
 * they highlighted on it with a way back to the page, the composer's
 * placeholder inviting a highlight until there is one, the model
 * allowlist, and the disclaimer with its link to /privacy, which carries the
 * AI-use and 30-day logging disclosure.
 *
 * One hook, so every host of the live site chat (the launcher's panel, the
 * glass chat lab) describes the same assistant. Must run inside the
 * SiteChatProvider, for the seed.
 *
 * The live chat stays text-only on purpose: it never turns on
 * `fileAttachments` or passes `mentions`, which only the playground's and
 * the chat home's simulated chats do, and the fetch transport sends role
 * and text alone, so nothing about a file can reach /api/chat.
 */
export function useSiteWidgetProps(): Pick<
  ChatWidgetProps,
  | "title"
  | "logo"
  | "tagline"
  | "starters"
  | "startersKey"
  | "context"
  | "contextClearLabel"
  | "placeholder"
  | "models"
  | "defaultModel"
  | "disclaimer"
> {
  const pathname = usePathname();
  const { starterSeed } = useChatWidget();
  const label = pathname ? getNavLabel(pathname) : null;
  /* The composer's context chip names the page the visitor is reading,
     resolved through the page-summaries data first (it covers every static
     route and the components) with the nav label as the fallback. A route
     neither knows (the labs) shows no chip. */
  const { focus, clear } = useSiteFocus();
  const contextLabel = pathname ? (getPageSummary(pathname)?.title ?? label ?? undefined) : undefined;

  return {
    title: ASSISTANT_NAME,
    logo: "/logos/mark.svg",
    /* The last pair is tied: "AI" alone on a line is a widow at the docked
       panel's width. */
    tagline: "Ask about the system, the tokens, design, or AI",
    starters: startersForPath(pathname, label, starterSeed),
    startersKey: pathname ?? "",
    context: focus
      ? { label: focusLabel(focus), note: focusNote(focus), icon: focusIcon(focus), onClear: clear, sent: true }
      : contextLabel
        ? { label: contextLabel }
        : null,
    contextClearLabel: "Back to the whole page",
    /* The one line every visitor reads before typing, so it is where they learn a highlight is a question's subject. One line at a 320px phone. */
    placeholder: focus ? "Ask about it" : "Ask, or highlight the page first",
    models: CHAT_MODELS,
    defaultModel: DEFAULT_CHAT_MODEL.value,
    disclaimer: (
      <>
        Answers may be wrong.{" "}
        <a className={styles.disclaimerLink} href="/privacy">
          How we use AI and your data
        </a>
      </>
    ),
  };
}
