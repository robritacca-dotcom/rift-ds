// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([globalIgnores(['dist', 'storybook-static', 'website', '.claude']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {
    // Components destructure deprecated/no-op props purely to stop them being
    // forwarded to a DOM node that would reject them. Prefixing with `_` marks
    // the discard as deliberate.
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
  },
}, {
  files: ['**/*.mjs', 'eslint.config.js'],
  extends: [js.configs.recommended],
  languageOptions: {
    globals: globals.node,
  },
  rules: {
    // generate-site-corpus.mjs documents the corpus-facts() directive inside
    // a block comment, using a zero-width space so the example's `*/` cannot
    // close the enclosing comment. That character is deliberate, so the
    // irregular-whitespace check skips comments; code stays covered.
    'no-irregular-whitespace': ['error', { skipComments: true }],
  },
}, ...storybook.configs["flat/recommended"]])
