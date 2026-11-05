"use client";

import { useCallback, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import {
  ChatProvider,
  type ChatArtifactRenderers,
  type ChatCardRenderers,
  type ChatPlacement,
  type ChatTransport,
  type ThreadsOptions,
} from "rift-ds/chat";
import { FALLBACK_FOLLOWUPS } from "@/lib/chat-followups";
import { SiteFocusProvider, siteContextString, useSiteFocus } from "./siteFocus";

/**
 * The site's configuration of the package's ChatProvider: the three routes
 * under /api/chat and the written follow-up fallbacks. Answer links need no
 * renderer here: the package's default reads the LinkProvider the root
 * layout mounts (SiteLinkProvider), so the same-site paths an answer links
 * to go through Next's Link, a docked panel survives the trip, and the
 * conversation keeps going beside the new page.
 *
 * Mounted once in the root layout. The root layout never remounts on
 * client-side navigation, so the transcript, a stream in flight, the draft
 * and the open state survive clicking between pages for free. A hard reload
 * starts clean by design: no storage, no persistence. The staged chats (the
 * playground and the chat home template) mount their own with a
 * scripted transport.
 *
 * The live chat follows what the visitor highlights on the page
 * (SiteFocusProvider in ./siteFocus), sent with each question beside the
 * path; a staged chat, with its own transport, follows nothing.
 */
export function SiteChatProvider({
  transport,
  defaultPlacement = "right",
  renderers,
  artifactRenderers,
  threads,
  children,
}: {
  /** Injectable for a staged chat (a scripted transport); defaults to the live route. */
  transport?: ChatTransport;
  /** The seat the panel opens in. The site docks right; the playground's stage card is a floating one. */
  defaultPlacement?: ChatPlacement;
  /** Draws a scripted transport's cards; the live route sends none. */
  renderers?: ChatCardRenderers;
  /** Draws a scripted transport's live artifacts; the live route sends none. */
  artifactRenderers?: ChatArtifactRenderers;
  /** Seeds the thread lifecycle a staged chat's rail shows. */
  threads?: ThreadsOptions;
  children: ReactNode;
}) {
  const provider = (
    <FocusedChatProvider
      transport={transport}
      endpoint="/api/chat"
      followups="/api/chat/followups"
      feedback="/api/chat/feedback"
      fallbackFollowups={FALLBACK_FOLLOWUPS}
      renderers={renderers}
      artifactRenderers={artifactRenderers}
      threads={threads}
      defaultPlacement={defaultPlacement}
    >
      {children}
    </FocusedChatProvider>
  );
  return transport ? provider : <SiteFocusProvider>{provider}</SiteFocusProvider>;
}

/* The package's provider, sending the page and the highlight as the request's context. */
function FocusedChatProvider(props: ComponentProps<typeof ChatProvider>) {
  const { focus } = useSiteFocus();
  const latest = useRef(focus);
  useEffect(() => {
    latest.current = focus;
  }, [focus]);
  const getContext = useCallback(() => siteContextString(window.location.pathname, latest.current), []);
  return <ChatProvider {...props} getContext={getContext} />;
}
