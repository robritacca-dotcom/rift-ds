'use client';

import { deferComponent } from '../behaviors/deferComponent';
import type { ChatWidgetProps } from './ChatWidget';

/* A closed panel costs nothing: the widget, and the markdown renderer it
   brings, load when the panel first opens. They are preloaded as soon as
   the page is interactive and again from the opener's hover and focus, so
   the panel does not open empty (src/behaviors/deferComponent.ts owns the
   pattern). ChatLauncher renders the component; its stylesheet stays a
   static import there: it is small, and the panel's own frame is drawn
   from it before the widget arrives. */
export const DeferredChatWidget = deferComponent<ChatWidgetProps>(() =>
  import('./ChatWidget').then((module) => module.ChatWidget)
);

/**
 * Start loading the chat widget's code now. The launcher's own button calls
 * it on hover and focus; a host that opens the chat from a control of its
 * own (`fab={false}`) calls it from that control's `onPointerEnter` and
 * `onFocus`, so its press finds the code already there. Safe to call any
 * number of times.
 */
export const preloadChatWidget: () => void = DeferredChatWidget.preload;
