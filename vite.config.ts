/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  // Pre-bundle deps the story tests import at runtime — without this, Vite
  // discovers them mid-run, re-optimizes, and reloads (hanging the suite).
  optimizeDeps: {
    include: ['react-dom/client'],
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }, {
      // Every story again, right to left: dir="rtl" on <html>, render and
      // axe only. A story with a play function asserts an English page's
      // keys and sides, so it runs in the pass above; the right-to-left
      // behaviour itself is asserted in src/stories/Direction.stories.tsx,
      // which sets its own direction and so runs in the pass above too.
      extends: true,
      plugins: [
      storybookTest({
        configDir: path.join(dirname, '.storybook'),
        tags: { exclude: ['play-fn'] }
      })],
      test: {
        name: 'storybook-rtl',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.rtl.ts']
      }
    }]
  }
});