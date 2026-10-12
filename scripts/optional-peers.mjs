/**
 * The optional peer dependencies, in one place. A module that imports one
 * may never land in the main barrel: recharts modules go to charts.ts, and
 * the rest belong to the chat widget's own subpaths (src/chat). Read by
 * generate-library-barrel.mjs (which fails a registered component that
 * imports one), validate-chat-widget.mjs (which walks the main barrel's
 * closure to prove none is reached, and holds the widget registry's `peers`
 * to the subpaths' actual imports), and mirrored by the externals list in
 * vite.lib.config.ts and the optional flags in package.json.
 */
export const OPTIONAL_PEER_PACKAGES = [
  'recharts',
  'react-markdown',
  'remark-gfm',
  '@anthropic-ai/sdk',
  '@upstash/ratelimit',
  '@upstash/redis',
];
