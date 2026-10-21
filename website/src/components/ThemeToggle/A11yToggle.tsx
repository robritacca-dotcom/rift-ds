"use client";

import { useSyncExternalStore } from "react";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { applyAaaMode, readAaaMode, subscribeAaaMode } from "@/lib/a11y-mode";

/* The AAA mode's switch, beside the light and dark control: one pressed
   button rather than a second segmented control, because the mode is on or
   off over whichever theme is showing (src/lib/a11y-mode.ts owns the
   attribute). Pressed, it fills with the action colour, the on state of a
   control. */
export default function A11yToggle({ className }: { className?: string }) {
  // The server always renders off; the pre-paint script may already have
  // set the attribute, and the store picks it up after hydration.
  const on = useSyncExternalStore(subscribeAaaMode, readAaaMode, () => false);

  return (
    <CircularButton
      className={className}
      icon="contrast"
      variant={on ? "primary" : "tertiary"}
      ariaLabel="AAA contrast"
      aria-pressed={on}
      tooltip={on ? "AAA contrast on" : "AAA contrast"}
      tooltipPosition="bottom"
      onClick={() => applyAaaMode(!on)}
    />
  );
}
