import '../src/tokens/tokens.css';
import '../src/fonts/material-symbols.css';
import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

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
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;