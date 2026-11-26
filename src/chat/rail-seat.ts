'use client';

import { createContext, useContext } from 'react';
import type { AppSidebarLayout } from '../components/AppSidebar/AppSidebar';

/**
 * Where ChatWidget seats its built-in history rail, handed to ChatThreads
 * privately so the public props never carry the wiring. The widget
 * measures its own room (THREADS_RAIL_MIN_WIDTH and the give-way to an
 * inline trailing panel, in queries.ts) and says which form the rail takes:
 * the rail beside the conversation, or AppSidebar's drawer over the widget,
 * opened from the header's menu button. Outside a widget there is no seat,
 * and ChatThreads draws the rail form.
 */
export interface RailSeat {
  /** The form the widget's room allows. */
  form: 'rail' | 'drawer';
  /** Whether the drawer form is open. */
  drawerOpen: boolean;
  /** Opens or closes the drawer form; the rail's own closes come through here. */
  setDrawerOpen: (open: boolean) => void;
  /** The widget's shell mode, which the rail draws itself in. */
  layout?: AppSidebarLayout;
  /** The rail's id, which the header's menu button controls. */
  id: string;
}

export const RailSeatContext = createContext<RailSeat | null>(null);

/** The seat the widget gave the rail, or null outside a widget. */
export const useRailSeat = () => useContext(RailSeatContext);
