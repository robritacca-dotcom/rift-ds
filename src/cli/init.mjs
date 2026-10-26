#!/usr/bin/env node
/**
 * The package's one bin: `npx rift-ds init`, `npx rift-ds init app`,
 * `npx rift-ds init chat` and `npx rift-ds init block`.
 *
 * `init` fetches the generated agent skills from the live site into the
 * project's .claude/skills/ folder, one folder per skill, then prints the
 * MCP connect line. Which skills exist and which files each holds comes
 * from the site's /skill/manifest.json, never from a list in this file:
 * the skills regenerate with every site deploy while the package moves
 * only on a release, so a bundled list (or a bundled copy of the files)
 * would always be the staler one. Re-running overwrites what is there;
 * that is the refresh story.
 *
 * `init chat` scaffolds the chat widget into a Next.js app router project:
 * the three route files under app/api/chat/, the guardrails module beside
 * them, the mount component and its model list under components/chat/, and
 * an .env.chat.example at the project root. These templates ride inside
 * the package (dist/bin/templates/chat/, copied from src/cli/templates/chat/
 * by build-package.mjs) rather than being fetched, because they import the
 * installed version's own subpaths and must match it. It never overwrites:
 * a file that exists is skipped and listed, so re-running is safe.
 *
 * `init app` sets a Next.js app router project up for the library the same
 * way, from dist/bin/templates/app/: a root wrapper that hands Next's Link
 * to every link-rendering component, a component that renders the
 * colour-mode script before first paint, and the base theme's face through
 * next/font, all under components/rift/. It never edits the root layout
 * (every app already has one): it prints the whole layout to use instead,
 * importing tokens.css, base.css and the font, rendering the script and
 * wrapping the body, and points at init block for a first page.
 *
 * `init block <name>` copies one block, a whole starting page, from
 * dist/bin/templates/blocks/: the files its registry.json entry lists,
 * held at their target paths so the relative imports between them resolve
 * as they do there. Blocks share files (the app shell), and the
 * never-overwrite rule means a shared file is written by whichever block
 * comes first. With no name it lists the blocks.
 *
 * The manifest is data from the network that decides where this command
 * writes, so every name and path in it is checked before anything touches
 * the disk: a skill name is one kebab-case folder, a file is a plain
 * relative path, and nothing may climb out of the target folder.
 *
 * A bin and never an exports subpath: nothing imports it, and build-package.mjs
 * ships it as dist/bin/<BIN_NAME>.mjs.
 *
 * Zero dependencies by design: global fetch plus node:fs, so npx never
 * installs anything beyond the package itself. SITE_ORIGIN, SKILL_NAME,
 * MCP_SERVER_NAME and PACKAGE_NAME are stamped by build-package.mjs from
 * scripts/brand.mjs (the one home for brand facts), and CHAT_SLUG from
 * the chat registry, the widget page's slug; running this file
 * straight from source fails fast rather than guessing a domain.
 * SKILL_NAME is the library skill, kept only for --out without --skill,
 * which has always meant that one.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = '__SITE_URL__';
const SKILL_NAME = '__SKILL_NAME__';
const MCP_SERVER_NAME = '__MCP_SERVER_NAME__';
const PACKAGE_NAME = '__PACKAGE_NAME__';
const CHAT_SLUG = '__CHAT_SLUG__';
const MANIFEST_URL = `${SITE_ORIGIN}/skill/manifest.json`;
const DEFAULT_DIR = join('.claude', 'skills');
const TEMPLATES_ROOT = join(dirname(fileURLToPath(import.meta.url)), 'templates');
const TEMPLATES_DIR = join(TEMPLATES_ROOT, 'chat');
const APP_TEMPLATES_DIR = join(TEMPLATES_ROOT, 'app');
const BLOCKS_DIR = join(TEMPLATES_ROOT, 'blocks');

/* What `init chat` needs installed beside the package. The optional peers
   each chat subpath imports; the demo's recharts is only for the scripted
   preview and goes when the demo import does. */
const CHAT_PEERS = [
  'react-markdown',
  'remark-gfm',
  '@anthropic-ai/sdk',
  '@upstash/ratelimit',
  '@upstash/redis',
  'recharts',
];

const USAGE = `Usage: npx ${PACKAGE_NAME} init [--skill <name>] [--dir <dir>]
       npx ${PACKAGE_NAME} init app [--app <dir>] [--dry-run]
       npx ${PACKAGE_NAME} init chat [--app <dir>] [--dry-run]
       npx ${PACKAGE_NAME} init block [<name>] [--app <dir>] [--dry-run]

init
  Fetches the agent skills for this package from ${SITE_ORIGIN} into
  ${DEFAULT_DIR}/, one folder per skill, so a skill-capable coding agent
  carries the library's install, theming and catalogue rules into every
  session. Re-run any time to refresh; the files regenerate with every
  site deploy.

  --skill <name>  Install one skill instead of all of them
  --dir <dir>     Folder that receives one folder per skill (default: ${DEFAULT_DIR})
  --out <dir>     Deprecated: write one skill's files straight into <dir>
                  (${SKILL_NAME} unless --skill names another). Use --dir.

init app
  Sets a Next.js app router project up for the library, under
  components/rift/: a root wrapper that routes every link through Next's
  Link, a component that applies the stored colour mode before first paint,
  and the base theme's font. Prints the root layout to use; it never edits
  the layout itself.
  Existing files are never overwritten.

  --app <dir>     The app router folder (default: app/ or src/app/, whichever exists)
  --dry-run       Print what would be written and write nothing

init chat
  Scaffolds the chat widget into a Next.js app router project: the chat,
  follow-ups and feedback routes under app/api/chat/, the guardrails beside
  them, the mount and its model list under components/chat/, and an
  .env.chat.example. Existing files are never overwritten.

  --app <dir>     The app router folder (default: app/ or src/app/, whichever exists)
  --dry-run       Print what would be written and write nothing

init block [<name>]
  Copies a block into a Next.js app router project: a whole starting page
  (an app shell, a dashboard, a sign-in) built from the library, its page
  under app/ and any shared parts under components/blocks/. The files are
  yours from then on. With no name, lists the blocks. Run init app first.
  Existing files are never overwritten.

  --app <dir>     The app router folder (default: app/ or src/app/, whichever exists)
  --dry-run       Print what would be written and write nothing

  --help          Show this message

The list of skills is at ${MANIFEST_URL}`;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function get(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    fail(`could not reach ${url} (${error?.message ?? error}). Check your network and retry.`);
  }
  if (!response.ok) {
    fail(`${url} answered ${response.status}. The site may be mid-deploy; retry in a minute.`);
  }
  return response.text();
}

/** The manifest's skills, with every name and path checked before use. */
async function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(await get(MANIFEST_URL));
  } catch {
    fail(`${MANIFEST_URL} is not valid JSON. The site may be mid-deploy; retry in a minute.`);
  }
  const skills = manifest?.skills;
  if (!Array.isArray(skills) || skills.length === 0) {
    fail(`${MANIFEST_URL} lists no skills. Update the package (npm install ${PACKAGE_NAME}@latest) and retry.`);
  }
  const segment = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
  for (const skill of skills) {
    const filesOk =
      Array.isArray(skill?.files) &&
      skill.files.length > 0 &&
      skill.files.every(
        (file) => typeof file === 'string' && file.split('/').every((part) => segment.test(part))
      );
    if (typeof skill?.name !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(skill.name) || !filesOk) {
      fail(`${MANIFEST_URL} holds an entry this command will not write to disk. Nothing was installed.`);
    }
  }
  return skills;
}

async function init({ only, dir, out }) {
  const skills = await readManifest();
  const wanted = only ?? (out ? SKILL_NAME : null);
  const selected = wanted ? skills.filter((skill) => skill.name === wanted) : skills;
  if (selected.length === 0) {
    fail(`no skill named "${wanted}". Available: ${skills.map((skill) => skill.name).join(', ')}.`);
  }
  for (const skill of selected) {
    const target = out ?? join(dir, skill.name);
    for (const file of skill.files) {
      const text = await get(`${SITE_ORIGIN}/skill/${skill.name}/${file}`);
      const path = join(target, ...file.split('/'));
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, text);
      console.log(`▸ ${path}`);
    }
  }
  const names = selected.map((skill) => skill.name).join(', ');
  console.log(
    selected.length === 1
      ? `✓ Agent skill installed: ${names}. Skill-capable agents load it automatically.`
      : `✓ ${selected.length} agent skills installed: ${names}. Skill-capable agents load them automatically.`
  );
  if (out) {
    console.log(`\n--out is deprecated. Use --dir to choose the folder that holds the skill folders.`);
  }
  console.log(`\nFor on-demand lookups too, connect the MCP endpoint:`);
  console.log(`  claude mcp add --transport http ${MCP_SERVER_NAME} ${SITE_ORIGIN}/api/mcp`);
}

/** Every template file under `base`, as a path relative to it (forward slashes). */
function templateFiles(base = TEMPLATES_DIR, dir = base) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...templateFiles(base, full));
    else out.push(relative(base, full).split('\\').join('/'));
  }
  return out.sort();
}

/** The app router folder: the one passed, else app/ or src/app/, whichever exists. */
function findAppDir(app) {
  const appDir = app ?? ['app', join('src', 'app')].map((d) => resolve(d)).find((d) => existsSync(d));
  if (!appDir) {
    fail('no app/ or src/app/ folder found. Run this inside a Next.js app router project, or pass --app <dir>.');
  }
  return appDir;
}

/**
 * Writes every template under `base` (or only `files`, paths relative to
 * it) that does not exist yet; returns what was written and skipped.
 */
function scaffold(base, appDir, dryRun, files = templateFiles(base)) {
  const written = [];
  const skipped = [];
  for (const file of files) {
    const dest = destinationFor(file, appDir);
    if (existsSync(dest)) {
      skipped.push(dest);
      continue;
    }
    if (!dryRun) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, readFileSync(join(base, ...file.split('/'))));
    }
    written.push(dest);
    console.log(`${dryRun ? '○' : '▸'} ${relative(process.cwd(), dest)}`);
  }
  for (const dest of skipped) {
    console.log(`· ${relative(process.cwd(), dest)} exists, left as it is`);
  }
  return { written, skipped };
}

function initApp({ app, dryRun }) {
  if (!existsSync(APP_TEMPLATES_DIR)) {
    fail('this copy carries no app templates: run the published bin (npx ' + PACKAGE_NAME + ' init app).');
  }
  const appDir = findAppDir(app);
  const { written, skipped } = scaffold(APP_TEMPLATES_DIR, appDir, dryRun);
  console.log(
    dryRun
      ? `\n✓ Dry run: ${written.length} files would be written, ${skipped.length} left alone.`
      : `\n✓ App set up: ${written.length} files written, ${skipped.length} left alone.`
  );
  const rift = relative(appDir, join(dirname(appDir), 'components', 'rift')).split('\\').join('/');
  const layoutFile = relative(process.cwd(), join(appDir, 'layout.tsx'));
  console.log(`\nNext, make your root layout (${layoutFile}) this, keeping any metadata you have:\n`);
  for (const line of [
    `import '${PACKAGE_NAME}/tokens/tokens.css';`,
    `import '${PACKAGE_NAME}/tokens/base.css';`,
    `import '${rift}/font.css';`,
    `import { riftFont } from '${rift}/font';`,
    `import { ColorModeScript } from '${rift}/ColorModeScript';`,
    `import { RiftRoot } from '${rift}/RiftRoot';`,
    ``,
    `export default function RootLayout({ children }: { children: React.ReactNode }) {`,
    `  return (`,
    `    <html lang="en" className={riftFont.variable} suppressHydrationWarning>`,
    `      <head>`,
    `        <ColorModeScript />`,
    `      </head>`,
    `      <body>`,
    `        <RiftRoot>{children}</RiftRoot>`,
    `      </body>`,
    `    </html>`,
    `  );`,
    `}`,
  ]) {
    console.log(`  ${line}`);
  }
  console.log(`\nIf the layout imports a globals.css from create-next-app, drop that import (or empty the file):`);
  console.log(`its body colours and font would cover the library's.`);
  console.log(`\nThen add a first page: npx ${PACKAGE_NAME} init block dashboard (no name lists them).`);
  console.log(`Setup and theming: ${SITE_ORIGIN}/docs/get-started`);
}

/**
 * Where a template lands. `app/**` goes into the app router folder,
 * `components/**` beside it (src/components when the app is src/app), and
 * the env example at the project root.
 */
function destinationFor(file, appDir) {
  if (file.startsWith('app/')) return join(appDir, ...file.slice('app/'.length).split('/'));
  if (file.startsWith('components/')) return join(dirname(appDir), ...file.split('/'));
  return join(process.cwd(), ...file.split('/'));
}

/**
 * Whether the project's .gitignore would hide the scaffolded env example:
 * a `.env*`-style rule with no `!.env.chat.example` exception after it.
 * create-next-app writes `.env*`, so a fresh app's example never reaches
 * a commit unless the scaffold says so.
 */
function ignoresEnvExample() {
  const gitignore = resolve('.gitignore');
  if (!existsSync(gitignore)) return false;
  let ignored = false;
  for (const raw of readFileSync(gitignore, 'utf8').split('\n')) {
    const line = raw.trim();
    if (line === '.env*' || line === '.env.*' || line === '.env.chat.example') ignored = true;
    if (line === '!.env.chat.example' || line === '!.env*.example' || line === '!.env.*.example') ignored = false;
  }
  return ignored;
}

function initChat({ app, dryRun }) {
  if (!existsSync(TEMPLATES_DIR)) {
    fail('this copy carries no chat templates: run the published bin (npx ' + PACKAGE_NAME + ' init chat).');
  }
  const appDir = findAppDir(app);
  const { written, skipped } = scaffold(TEMPLATES_DIR, appDir, dryRun);

  console.log(
    dryRun
      ? `\n✓ Dry run: ${written.length} files would be written, ${skipped.length} left alone.`
      : `\n✓ Chat scaffolded: ${written.length} files written, ${skipped.length} left alone.`
  );
  console.log(`\nNext:`);
  console.log(`  1. Install the peers the chat imports:\n       npm install ${CHAT_PEERS.join(' ')}`);
  console.log(
    `  2. Render <ChatMount /> at the end of your root layout's body, after the page content:\n` +
      `       import { ChatMount } from '${relative(appDir, join(dirname(appDir), 'components', 'chat', 'ChatMount')).split('\\').join('/')}';`
  );
  console.log(
    `  3. Copy .env.chat.example into .env.local. With NEXT_PUBLIC_CHAT_DEMO=true the widget plays a scripted\n` +
      `     conversation and needs no key; set ANTHROPIC_API_KEY and CHAT_ENABLED=true to go live.`
  );
  if (ignoresEnvExample()) {
    console.log(
      `     Your .gitignore ignores .env* (create-next-app's default), so git will not see the example.\n` +
        `     Commit it on purpose with: git add -f .env.chat.example`
    );
  }
  console.log(
    `  4. Your layout's viewport should set interactiveWidget: "resizes-content", so the phone takeover ends above the keyboard.`
  );
  console.log(`\nHow to add it, the protocol and the server options: ${SITE_ORIGIN}/docs/chat`);
  console.log(`Every prop: ${SITE_ORIGIN}/components/${CHAT_SLUG}`);
}

function initBlock({ name, app, dryRun }) {
  const registryFile = join(BLOCKS_DIR, 'registry.json');
  if (!existsSync(registryFile)) {
    fail('this copy carries no blocks: run the published bin (npx ' + PACKAGE_NAME + ' init block).');
  }
  const { blocks } = JSON.parse(readFileSync(registryFile, 'utf8'));
  if (!name) {
    console.log('Blocks:\n');
    for (const block of blocks) console.log(`  ${block.name.padEnd(12)} ${block.description}`);
    console.log(`\nAdd one with: npx ${PACKAGE_NAME} init block <name>`);
    console.log(`See them: ${SITE_ORIGIN}/docs/blocks`);
    return;
  }
  const block = blocks.find((b) => b.name === name);
  if (!block) {
    fail(`no block named "${name}". The blocks: ${blocks.map((b) => b.name).join(', ')}.`);
  }
  const appDir = findAppDir(app);
  const { written, skipped } = scaffold(BLOCKS_DIR, appDir, dryRun, block.files);
  console.log(
    dryRun
      ? `\n✓ Dry run: ${written.length} files would be written, ${skipped.length} left alone.`
      : `\n✓ ${block.label} block added: ${written.length} files written, ${skipped.length} left alone.`
  );
  console.log(`\nNext:`);
  console.log(`  1. If you have not, run npx ${PACKAGE_NAME} init app and make your root layout the one it prints,`);
  console.log(`     so the tokens, the base sheet, the font and the colour mode are in place.`);
  console.log(`  2. Open ${block.route} in your dev server. The files are yours: rename, restyle and grow them.`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(USAGE);
  process.exit(args.length === 0 ? 1 : 0);
}
if (args[0] !== 'init') {
  fail(`unknown command "${args[0]}"\n\n${USAGE}`);
}
if (SITE_ORIGIN.startsWith('__')) {
  fail(`this copy was not built: run the published bin (npx ${PACKAGE_NAME} init).`);
}
/** The value after a flag, or undefined when the flag is absent. */
function option(flag, what) {
  const at = args.indexOf(flag);
  if (at === -1) return undefined;
  const value = args[at + 1];
  if (!value || value.startsWith('--')) fail(`${flag} needs ${what}`);
  return value;
}

if (args[1] === 'chat' || args[1] === 'app' || args[1] === 'block') {
  const appFlag = option('--app', 'a directory');
  const scaffoldArgs = { app: appFlag ? resolve(appFlag) : undefined, dryRun: args.includes('--dry-run') };
  if (args[1] === 'chat') initChat(scaffoldArgs);
  else if (args[1] === 'app') initApp(scaffoldArgs);
  else initBlock({ ...scaffoldArgs, name: args[2] && !args[2].startsWith('--') ? args[2] : undefined });
} else {
  if (args[1] && !args[1].startsWith('--')) fail(`unknown init target "${args[1]}"\n\n${USAGE}`);
  const only = option('--skill', 'a skill name');
  const dirFlag = option('--dir', 'a directory');
  const outFlag = option('--out', 'a directory');
  if (dirFlag && outFlag) fail('use --dir or --out, not both');
  await init({
    only,
    dir: dirFlag ? resolve(dirFlag) : DEFAULT_DIR,
    out: outFlag ? resolve(outFlag) : undefined,
  });
}
