"use client";

import type { ReactNode } from "react";
import { useSiteChat } from "@/components/SiteChat/ChatContext";

/**
 * Inline text link that opens the site chat panel, using the FAB's open
 * pattern (SiteChatMount): record the launcher in returnFocusRef so closing
 * the panel restores focus here. Opening an already-open panel is a no-op.
 */
export function OpenChatLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { setOpen, returnFocusRef } = useSiteChat();
  return (
    <button
      type="button"
      className={className}
      aria-controls="site-chat-panel"
      onClick={(event) => {
        returnFocusRef.current = event.currentTarget;
        setOpen(true);
      }}
    >
      {children}
    </button>
  );
}
