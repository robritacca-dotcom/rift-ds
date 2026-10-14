'use client';

import { useSyncExternalStore } from 'react';

/* Above this the panel docks and the page slides over (the host's body
   inset reads the same attribute the launcher sets); below it the panel
   overlays behind a scrim. Lives in its own module so consumers deep in the
   widget tree (the markdown link renderer, which closes an overlaying panel
   on navigation) can read it without importing the launcher and its
   component graph. Also used by hosts that auto-open the panel, which must
   only do so when it docks beside the page rather than covering it. */
export const DOCK_QUERY = '(min-width: 1440px)';

/* Below this the panel has no card form to return to: it fills the viewport
   whatever the view says, so the launcher opens it as a takeover and hides
   the expand toggle rather than offering a switch between a state and itself.
   The width is mirrored by the panel's phone rule in ChatWidget.css, which is
   what covers the first render, before this query has been read. */
export const TAKEOVER_QUERY = '(max-width: 719px)';

/** The widget's own width thresholds for seating its rails inline. */
export const THREADS_RAIL_MIN_WIDTH = 720;
/** The trailing seat's threshold, one number for both of its tenants: at
    this width and up the agent pane and the artifact panel sit beside the
    conversation, below it each rises as a bottom sheet. */
export const ASIDE_RAIL_MIN_WIDTH = 760;
/** Below this the inline threads rail yields its room to a trailing panel
    seated inline, and goes back behind the header's hamburger. */
export const ASIDE_WITH_THREADS_MIN_WIDTH = 1040;
/** The floor either column keeps while an artifact is dragged wider or
    narrower: the conversation never loses more than this, nor the panel. */
export const ARTIFACT_MIN_COLUMN_WIDTH = 320;

const subscribeTakeover = (onChange: () => void) => {
  const media = window.matchMedia(TAKEOVER_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const readTakeover = () => window.matchMedia(TAKEOVER_QUERY).matches;

/** Whether the viewport is a phone width (TAKEOVER_QUERY), false on the
    server and for the first client render. Shared by the launcher and any
    host stage, which both hand the widget its phone layout. */
export function useTakeoverViewport(): boolean {
  return useSyncExternalStore(subscribeTakeover, readTakeover, () => false);
}
