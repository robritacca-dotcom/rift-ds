import '../src/tokens/tokens.css';
import '../src/tokens/presets/presets.css';
import '../src/fonts/material-symbols.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import {
  DEFAULT_THEME_LABEL,
  THEME_PRESETS,
  THEME_SELECTOR_ORDER,
} from '../website/src/lib/theme/presets';

/**
 * The theme-preset toolbar mirrors the site's switcher: the same ids in
 * the same order, applied the same way (data-brand on <html>, which the
 * generated preset stylesheets key on). "default" is the base token
 * files with no attribute — the Tide row. Smoke (mono) is the default
 * here because it is the served site's default look too.
 */
const withBrand: Decorator = (Story, context) => {
  const brand = context.globals.brand;
  if (brand && brand !== 'default') {
    document.documentElement.setAttribute('data-brand', String(brand));
  } else {
    document.documentElement.removeAttribute('data-brand');
  }
  return Story();
};

const preview: Preview = {
  parameters: {
    // Chromatic snapshots every story in both themes. `theme` is the global
    // registered by withThemeByDataAttribute below, so each mode renders the
    // same way the toolbar toggle does. Ignored by every other tool.
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    backgrounds: {
      disable: true, // Disable Storybook's built-in backgrounds
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      // 'error' since 2026-07-27: all 49 known violations fixed, so an a11y
      // regression now fails CI rather than being reported and ignored.
      test: 'error',
      config: {
        // The gate is WCAG 2.1 AA minus the contrast criteria, and this
        // comment is the authoritative record of why.
        //
        // The rule stays off because the action colour is a token: anyone
        // building on this system resolves it from their own palette and gets
        // their own answer, so a ratio computed against the shipped teal
        // proves nothing about a consumer's build. (As of the 2026-08-20
        // accessible teal split, the shipped pairs the rule used to fail —
        // primary CTA label, teal-as-text on white, tertiary-on-tertiary —
        // all clear AA; the audit trail lives in that change.) Keeping it off
        // is still a settled decision of Rob's: do not re-enable this rule or
        // redesign the action colour without asking him first.
        //
        // Everything else in AA is enforced, and a contrast failure appearing
        // in CI means someone turned this back on.
        rules: [{ id: 'color-contrast', enabled: false }]
      }
    }
  },

  decorators: [
    withBrand,
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],

  globalTypes: {
    brand: {
      description: 'Theme preset (the site switcher, in Storybook)',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: THEME_SELECTOR_ORDER.filter((id) => id !== 'custom').map((id) => ({
          value: id,
          title: id === 'default' ? DEFAULT_THEME_LABEL : (THEME_PRESETS[id]?.label ?? id),
        })),
      },
    },
  },

  // Smoke is the served site's default look, so it is Storybook's too.
  initialGlobals: {
    brand: 'mono',
  },
};

export default preview;