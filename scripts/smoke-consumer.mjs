#!/usr/bin/env node
/**
 * Pre-publish consumer smoke test. Packs dist/ into a tarball, scaffolds
 * minimal Vite + React + TypeScript apps in a temp directory, installs the
 * tarball, and runs `tsc` + `vite build`. Three scenarios, for the package's
 * kinds of consumer:
 *
 *   1. The plain consumer: no optional peer installed. The main barrel, a
 *      deep import and the tokens stylesheet must build with none of
 *      recharts, react-markdown, remark-gfm, the Anthropic SDK or the Upstash
 *      packages present (the regression this suite exists to catch: an
 *      optional peer that leaks into the main barrel breaks everyone).
 *
 *   2. The chat consumer: every optional peer installed, the packed bin's
 *      `init chat`, `init app` and `init block` (every block) run against a
 *      scaffolded app-router layout, and the result type-checked and built. This is the proof behind "one command
 *      wires the whole chat": the templates the bin writes must import
 *      subpaths the tarball resolves, the route files must type-check
 *      against the shipped server types, and the mount must bundle.
 *
 *   3. The actions consumer: the same, with `init chat --actions` in a fresh
 *      project (the bin never overwrites, so it cannot share scenario 2's),
 *      so the propose-and-confirm route, mount and proposal cards are held
 *      to the tarball too.
 *
 * Neither chat scenario is a Next app, so the Next modules the templates
 * import are declared for tsc and aliased to small stubs for Vite.
 *
 *   4. The Next consumer: a real Next app (the website's Next version, no
 *      optional peer), `init app` and every `init block` written in by the
 *      packed bin, the root layout the bin prints, then `next build`. The
 *      Vite scenarios bundle only what their entry imports, so a block page
 *      that imports a name the tarball's JavaScript lacks type-checks there
 *      and still passes; a production Next build compiles every page, the
 *      way a consumer's does. Skip it with --skip-next on a machine without
 *      network access (next/font fetches the base face at build time).
 *
 * Run by the release workflow before `npm publish`, and runnable locally
 * after `npm run build:lib`.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIN_NAME, PACKAGE_NAME } from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(repoRoot, 'dist');
const distPkg = JSON.parse(readFileSync(join(distDir, 'package.json'), 'utf8'));

/* The optional peers, from the manifest that ships: whatever is marked
   optional is what scenario 1 must build without and scenario 2 installs. */
const OPTIONAL_PEERS = Object.entries(distPkg.peerDependenciesMeta ?? {})
  .filter(([, meta]) => meta?.optional)
  .map(([name]) => name);

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });

const TSCONFIG = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    noEmit: true,
    skipLibCheck: true,
  },
  include: ['src', 'app', 'components'],
};

const VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`;

/* The chat scenarios bundle a mount that reads the route through Next's
   usePathname; this consumer has no Next, so Vite resolves it to a stub. */
const CHAT_VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { 'next/navigation': fileURLToPath(new URL('./src/next-navigation.ts', import.meta.url)) } },
});
`;

const NEXT_NAVIGATION_STUB = `export function usePathname(): string {
  return '/';
}
`;

/* What the templates need from Next and the platform, declared for tsc. */
const CHAT_ENV_D_TS =
  `declare const process: { env: Record<string, string | undefined> };\n` +
  // The app scaffold's root wrapper imports Next's Link; this Vite consumer
  // has no Next, so its shape is declared for the type-check alone.
  `declare module 'next/link' {\n  const Link: import('react').ComponentType<\n    import('react').ComponentPropsWithRef<'a'> & { href: string }\n  >;\n  export default Link;\n}\n` +
  // The chat mount reads the route for its page context.
  `declare module 'next/navigation' {\n  export function usePathname(): string;\n}\n` +
  // The blocks style themselves with CSS modules, which Next types for
  // an app; this consumer declares them the same way.
  `declare module '*.module.css' {\n  const classes: Record<string, string>;\n  export default classes;\n}\n` +
  // And the app scaffold's font loads through next/font, declared at the
  // shape its call returns.
  `declare module 'next/font/google' {\n  export function Nunito_Sans(options: Record<string, unknown>): { className: string; variable: string };\n}\n`;

const CHAT_MAIN = `import { createRoot } from 'react-dom/client';
import '${PACKAGE_NAME}/tokens/tokens.css';
import { ChatMount } from '../components/chat/ChatMount';
import { scriptChat, type ChatEvent } from '${PACKAGE_NAME}/chat';

// The scripted transport is the no-key path; one exchange proves the type.
const transport = scriptChat().user('Hello').assistant('Hi there.').transport();
void transport;
const kinds: ChatEvent['type'][] = ['status', 'delta', 'done'];
void kinds;

createRoot(document.getElementById('root')!).render(<ChatMount />);
`;

const INDEX_HTML =`<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`;

function scaffold(app, tarball, { peers }) {
  mkdirSync(join(app, 'src'), { recursive: true });
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'ds-smoke-consumer',
        private: true,
        type: 'module',
        dependencies: {
          [PACKAGE_NAME]: `file:../${tarball}`,
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          ...Object.fromEntries(peers.map((name) => [name, distPkg.peerDependencies[name]])),
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^5.0.0',
          typescript: '^5.9.0',
          vite: '^7.0.0',
        },
      },
      null,
      2
    )
  );
  writeFileSync(join(app, 'tsconfig.json'), JSON.stringify(TSCONFIG, null, 2));
  writeFileSync(join(app, 'vite.config.ts'), VITE_CONFIG);
  writeFileSync(join(app, 'index.html'), INDEX_HTML);
}

/* A chat consumer: every optional peer, an app-router shape for the bin to
   find (the templates land under app/ and components/ beside it), and the
   Next declarations and stubs. */
function scaffoldChat(app, tarball) {
  scaffold(app, tarball, { peers: OPTIONAL_PEERS });
  writeFileSync(join(app, 'vite.config.ts'), CHAT_VITE_CONFIG);
  mkdirSync(join(app, 'app'), { recursive: true });
  writeFileSync(join(app, 'app', 'layout.tsx'), `export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }\n`);
  writeFileSync(join(app, 'src', 'env.d.ts'), CHAT_ENV_D_TS);
  writeFileSync(join(app, 'src', 'next-navigation.ts'), NEXT_NAVIGATION_STUB);
  run('npm install --no-fund --no-audit', app);
}

/* The Next consumer's root layout: the one `init app` prints. */
const NEXT_LAYOUT = `import '${PACKAGE_NAME}/tokens/tokens.css';
import '${PACKAGE_NAME}/tokens/base.css';
import '../components/rift/font.css';
import { riftFont } from '../components/rift/font';
import { ColorModeScript } from '../components/rift/ColorModeScript';
import { RiftRoot } from '../components/rift/RiftRoot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={riftFont.variable} suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <RiftRoot>{children}</RiftRoot>
      </body>
    </html>
  );
}
`;

const websitePkg = JSON.parse(readFileSync(join(repoRoot, 'website', 'package.json'), 'utf8'));
const skipNext = process.argv.includes('--skip-next');

const work = mkdtempSync(join(tmpdir(), 'ds-smoke-'));
console.log(`▸ Smoke test workspace: ${work}`);

try {
  run(`npm pack --pack-destination "${work}"`, distDir);
  const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack produced no tarball');

  /* ---- 1. The plain consumer: no optional peers ------------------------- */
  const plain = join(work, 'plain');
  scaffold(plain, tarball, { peers: [] });
  writeFileSync(
    join(plain, 'src', 'main.tsx'),
    `import { createRoot } from 'react-dom/client';
import '${PACKAGE_NAME}/tokens/tokens.css';
import { Button, Badge, COMPONENT_COUNT } from '${PACKAGE_NAME}';
import { Alert } from '${PACKAGE_NAME}/components/Alert/Alert';
import { THEME_IDS, tokenValue } from '${PACKAGE_NAME}/tokens/values';

createRoot(document.getElementById('root')!).render(
  <main>
    <Button label={\`\${COMPONENT_COUNT} components\`} variant="primary" />
    <Badge label={tokenValue('--color-action-primary-bg', THEME_IDS[0], 'light') ?? 'smoke'} variant="positive" />
    <Alert variant="info" title="Deep import" description="works" />
  </main>
);
`
  );
  run('npm install --no-fund --no-audit', plain);
  run('npx tsc -p tsconfig.json', plain);
  run('npx vite build', plain);
  console.log(
    `✓ Plain consumer: tarball installs, type-checks and builds with none of the optional peers (${OPTIONAL_PEERS.join(', ')}).`
  );

  /* ---- 2. The chat consumer: every peer, plus `init chat` --------------- */
  const chat = join(work, 'chat');
  scaffoldChat(chat, tarball);
  // The packed bin, exactly as npx would run it, writing into the scaffold.
  run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init chat`, chat);
  // And the app scaffold, written into the same project: its root wrapper and
  // colour-mode script land under components/rift/, which the tsconfig
  // includes, so tsc checks them below beside the chat's files.
  run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init app`, chat);
  // And every block, read from the registry the bin ships, so a new block is
  // checked by existing. Their pages land under app/ and the shared shell
  // under components/blocks/, both inside the tsconfig.
  const { blocks } = JSON.parse(
    readFileSync(join(chat, 'node_modules', PACKAGE_NAME, 'bin', 'templates', 'blocks', 'registry.json'), 'utf8')
  );
  for (const block of blocks) {
    run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init block ${block.name}`, chat);
  }
  // Next's route segment exports and process.env are plain TypeScript; the
  // handlers behind them are the package's. tsc covers the whole scaffold,
  // vite bundles the client half.
  writeFileSync(join(chat, 'src', 'main.tsx'), CHAT_MAIN);
  run('npx tsc -p tsconfig.json', chat);
  run('npx vite build', chat);
  console.log(
    `✓ Chat consumer: \`${BIN_NAME} init chat\`, \`${BIN_NAME} init app\` and \`${BIN_NAME} init block\` (${blocks.length} blocks) scaffold against the tarball; the routes, the mount, the root wrapper, the colour-mode script and every block type-check, and the chat builds.`
  );

  /* ---- 3. The actions consumer: `init chat --actions` ----------------- */
  const actions = join(work, 'actions');
  scaffoldChat(actions, tarball);
  run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init chat --actions`, actions);
  writeFileSync(join(actions, 'src', 'main.tsx'), CHAT_MAIN);
  run('npx tsc -p tsconfig.json', actions);
  run('npx vite build', actions);
  console.log(
    `✓ Actions consumer: \`${BIN_NAME} init chat --actions\` scaffolds against the tarball; the propose-and-confirm route, the mount and the proposal cards type-check, and the chat builds.`
  );

  /* ---- 4. The Next consumer: every block, through `next build` -------- */
  if (skipNext) {
    console.log('▸ Next consumer skipped (--skip-next).');
  } else {
    const next = join(work, 'next');
    mkdirSync(join(next, 'app'), { recursive: true });
    writeFileSync(
      join(next, 'package.json'),
      JSON.stringify(
        {
          name: 'ds-smoke-next',
          private: true,
          scripts: { build: 'next build' },
          dependencies: {
            [PACKAGE_NAME]: `file:../${tarball}`,
            next: websitePkg.dependencies.next,
            react: websitePkg.dependencies.react,
            'react-dom': websitePkg.dependencies['react-dom'],
          },
          devDependencies: {
            '@types/node': '^22.0.0',
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            typescript: '^5.9.0',
          },
        },
        null,
        2
      )
    );
    writeFileSync(
      join(next, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            ...TSCONFIG.compilerOptions,
            allowJs: true,
            esModuleInterop: true,
            isolatedModules: true,
            resolveJsonModule: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules'],
        },
        null,
        2
      )
    );
    writeFileSync(join(next, 'app', 'layout.tsx'), NEXT_LAYOUT);
    writeFileSync(join(next, 'app', 'page.tsx'), `export default function Home() { return <main>Smoke</main>; }\n`);
    run('npm install --no-fund --no-audit', next);
    run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init app`, next);
    const { blocks } = JSON.parse(
      readFileSync(join(next, 'node_modules', PACKAGE_NAME, 'bin', 'templates', 'blocks', 'registry.json'), 'utf8')
    );
    for (const block of blocks) {
      run(`node node_modules/${PACKAGE_NAME}/bin/${BIN_NAME}.mjs init block ${block.name}`, next);
    }
    run('npx next build', next);
    console.log(
      `✓ Next consumer: \`${BIN_NAME} init app\` and every \`${BIN_NAME} init block\` (${blocks.length} blocks) scaffold into a Next app that builds for production against the tarball.`
    );
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
