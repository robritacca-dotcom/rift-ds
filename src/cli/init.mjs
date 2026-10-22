#!/usr/bin/env node
/**
 * The package's one bin: `npx rift-ds init` and `npx rift-ds init chat`.
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
 * The manifest is data from the network that decides where this command
 * writes, so every name and path in it is checked before anything touches
 * the disk: a skill name is one kebab-case folder, a file is a plain
 * relative path, and nothing may climb out of the target folder.
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
const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'templates', 'chat');

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
       npx ${PACKAGE_NAME} init chat [--app <dir>] [--dry-run]

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

init chat
  Scaffolds the chat widget into a Next.js app router project: the chat,
  follow-ups and feedback routes under app/api/chat/, the guardrails beside
  them, the mount and its model list under components/chat/, and an
  .env.chat.example. Existing files are never overwritten.

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

/** Every template file, as a path relative to the templates folder (forward slashes). */
function templateFiles(dir = TEMPLATES_DIR) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...templateFiles(full));
    else out.push(relative(TEMPLATES_DIR, full).split('\\').join('/'));
  }
  return out.sort();
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

function initChat({ app, dryRun }) {
  if (!existsSync(TEMPLATES_DIR)) {
    fail('this copy carries no chat templates: run the published bin (npx ' + PACKAGE_NAME + ' init chat).');
  }
  const appDir = app ?? ['app', join('src', 'app')].map((d) => resolve(d)).find((d) => existsSync(d));
  if (!appDir) {
    fail('no app/ or src/app/ folder found. Run this inside a Next.js app router project, or pass --app <dir>.');
  }

  const files = templateFiles();
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
      writeFileSync(dest, readFileSync(join(TEMPLATES_DIR, ...file.split('/'))));
    }
    written.push(dest);
    console.log(`${dryRun ? '○' : '▸'} ${relative(process.cwd(), dest)}`);
  }
  for (const dest of skipped) {
    console.log(`· ${relative(process.cwd(), dest)} exists, left as it is`);
  }

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
  console.log(
    `  4. Your layout's viewport should set interactiveWidget: "resizes-content", so the phone takeover ends above the keyboard.`
  );
  console.log(`\nHow to add it, the protocol and the server options: ${SITE_ORIGIN}/docs/chat`);
  console.log(`Every prop: ${SITE_ORIGIN}/components/${CHAT_SLUG}`);
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

if (args[1] === 'chat') {
  const appFlag = option('--app', 'a directory');
  initChat({ app: appFlag ? resolve(appFlag) : undefined, dryRun: args.includes('--dry-run') });
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
