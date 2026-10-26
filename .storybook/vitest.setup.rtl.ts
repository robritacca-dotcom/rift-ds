import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// The right-to-left pass: the same annotations as vitest.setup.ts, with the
// direction toolbar's global set to rtl, so every story renders (and is
// checked by axe) with dir="rtl" on <html>. Stories with a play function are
// left to the left-to-right pass (vite.config.ts excludes them here): their
// assertions name the keys and sides of an English page.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, { initialGlobals: { direction: 'rtl' } }]);
