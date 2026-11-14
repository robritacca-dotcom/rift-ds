#!/usr/bin/env node
/**
 * validate-agent-skill.mjs
 *
 * Holds the consumer agent skills (website/public/skill/: one folder per
 * row of AGENT_SKILLS in scripts/brand.mjs, plus manifest.json) to their
 * source. Five checks:
 *
 *   1. (Freshness, in both directions, is
 *      scripts/validate-generated-files.mjs's check. The checks below read
 *      what the generator builds.)
 *   2. The manifest matches the table: manifest.json names exactly the AGENT_SKILLS rows in order, and lists
 *      exactly the files each skill's builder emits. The init bin
 *      installs whatever the manifest says, so a manifest that disagreed
 *      with the folders would install a broken skill for every consumer.
 *   3. Installable shape: every skill has a SKILL.md whose frontmatter
 *      `name` is its folder name (an agent loads a skill by that name),
 *      and every path is a plain relative one the init bin will accept.
 *   4. Content screens: the leak patterns the component-api validator
 *      applies (the skills are served publicly and copied into
 *      consumers' repos), and the em dash content-design.md bans, which
 *      validate-shipped-prose.mjs cannot see here because agent-facing
 *      markdown is outside its scope.
 *   5. Advertised, and derived: the surfaces that tell people the skills
 *      exist (llms.txt, the get-started page, the MCP setup text) must
 *      read the list from the manifest accessor rather than restate it.
 *      A surface that maps over the manifest advertises every skill's
 *      SKILL.md by construction, so the check is on the derivation: the
 *      accessor imports the manifest, each surface uses the accessor's
 *      list, and none of them spells a /skill/<name>/ path by hand, which
 *      is how the list drifted apart from the generator before.
 *
 *   6. The agent starter (website/public/<AGENT_STARTER_FILE>) and its
 *      module for the website (agent-starter.generated.ts): the file passes the same content screens, and each
 *      surface that offers it uses the accessor: get-started shows the
 *      full text in a copy frame (AGENT_STARTER), and llms.txt links the
 *      raw file (AGENT_STARTER_URL). None spells the file's URL by hand.
 *      The README, a third surface that cannot import, must carry the URL
 *      the accessor builds.
 *
 * Runs in the validate-registry chain: every input is source or generated
 * data, never build output.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MANIFEST_FILE,
  assembleAgentSkill,
  assembleAgentStarter,
  assembleSkillManifest,
} from './generate-agent-skill.mjs';
import { AGENT_SKILLS, AGENT_STARTER_FILE, SITE_URL } from './brand.mjs';
import { read, repoRoot } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';
import { leaksIn } from './lib/screens.mjs';


const errors = [];

// 1. What the generator builds. Whether the disk matches it, in both
// directions, is validate-generated-files.mjs's check; the checks below
// read the build.
const files = assembleAgentSkill();
const manifestContent = assembleSkillManifest(files);
const wanted = new Map([
  ...files.map((file) => [`${file.skill}/${file.path}`, file.content]),
  [MANIFEST_FILE, manifestContent],
]);
const starter = assembleAgentStarter();

// 2. The manifest matches the table.
const manifest = JSON.parse(manifestContent);
const tableNames = AGENT_SKILLS.map((skill) => skill.name);
const manifestNames = manifest.skills.map((skill) => skill.name);
if (manifestNames.join() !== tableNames.join()) {
  errors.push(
    `manifest.json lists [${manifestNames.join(', ')}] but AGENT_SKILLS in scripts/brand.mjs ` +
      `lists [${tableNames.join(', ')}] — the manifest must name every row, in order.`
  );
}
if (new Set(tableNames).size !== tableNames.length) {
  errors.push(`AGENT_SKILLS in scripts/brand.mjs repeats a skill name — every row needs its own folder.`);
}
for (const skill of manifest.skills) {
  const built = files.filter((file) => file.skill === skill.name).map((file) => file.path);
  if (skill.files.join() !== built.join()) {
    errors.push(
      `manifest.json lists [${skill.files.join(', ')}] for ${skill.name} but its builder emits ` +
        `[${built.join(', ')}] — the init bin would install the wrong set.`
    );
  }
  if (typeof skill.summary !== 'string' || !/\.$/.test(skill.summary)) {
    errors.push(`manifest.json: ${skill.name} needs a one-line summary ending in a full stop (SUMMARIES in the generator).`);
  }
}

// 3. Installable shape. The name and path rules mirror the ones the init
// bin enforces before it writes anything (src/cli/init.mjs).
for (const name of tableNames) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    errors.push(`AGENT_SKILLS: "${name}" is not a kebab-case folder name — the init bin would refuse it.`);
  }
  const skillMd = files.find((file) => file.skill === name && file.path === 'SKILL.md');
  if (!skillMd) {
    errors.push(`${name} has no SKILL.md — an agent cannot load a skill folder without one.`);
  } else if (skillMd.content.match(/^---\nname: (.+)\n/)?.[1] !== name) {
    errors.push(`skill/${name}/SKILL.md: the frontmatter name must be "${name}", the folder it installs into.`);
  }
}
for (const file of files) {
  const segments = file.path.split('/');
  if (segments.some((segment) => !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment))) {
    errors.push(`skill/${file.skill}/${file.path}: not a plain relative path — the init bin would refuse it.`);
  }
}

// 4. Content screens. The leak list is validate-component-api.mjs's; the
// email ban is hard because nothing here can sanction an address.
const EM_DASH = { what: 'em dash (content-design.md bans it in shipped copy)', shown: JSON.stringify('\u2014') };
for (const [path, content] of [...wanted, [`../${AGENT_STARTER_FILE}`, starter]]) {
  const emDashes = [...content.matchAll(/\u2014/g)].map(() => EM_DASH);
  for (const hit of [...leaksIn(content), ...emDashes]) {
    errors.push(
      `skill/${path} contains a ${hit.what} (${hit.shown}) — ` +
        `it is copied into consumers' repos; remove it at the source.`
    );
  }
}

// 5. Advertised, and derived.
const ACCESSOR = 'website/src/data/agent-skills.ts';
const ACCESSOR_IMPORT = '@/data/agent-skills';
const advertisers = [
  'website/src/app/llms.txt/route.ts',
  'website/src/app/docs/get-started/page.tsx',
  'website/src/app/api/mcp/route.ts',
];
const accessorPath = join(repoRoot, ...ACCESSOR.split('/'));
if (!existsSync(accessorPath)) {
  errors.push(`${ACCESSOR} is missing — it is the website's one reader of skill/${MANIFEST_FILE}.`);
} else if (!/from\s+["'][^"']*public\/skill\/manifest\.json["']/.test(read(accessorPath))) {
  errors.push(`${ACCESSOR} no longer imports public/skill/${MANIFEST_FILE} — the skill list must come from the manifest.`);
}
for (const file of advertisers) {
  const content = read(join(repoRoot, ...file.split('/')));
  const imported = new RegExp(
    `import\\s*\\{[^}]*\\bAGENT_SKILLS\\b[^}]*\\}\\s*from\\s*["']${ACCESSOR_IMPORT}["']`
  ).test(content);
  const used = (content.match(/\bAGENT_SKILLS\b/g) ?? []).length > 1;
  if (!imported || !used) {
    errors.push(
      `${file} no longer builds its skill list from AGENT_SKILLS in ${ACCESSOR_IMPORT} — every skill's ` +
        `SKILL.md must stay advertised where agents and readers look, derived from the manifest.`
    );
  }
  for (const name of tableNames) {
    if (content.includes(`/skill/${name}/`) || content.includes('/skill/${SKILL_NAME}/')) {
      errors.push(
        `${file} spells a /skill/<name>/ path by hand (${name}) — build it with skillFileUrl() ` +
          `from ${ACCESSOR_IMPORT} so the file list has one home.`
      );
      break;
    }
  }
}

// 6. The starter is shown on get-started, and offered, derived.
// Each surface, the accessor name it must use, and what that name does there.
const starterOffers = [
  ['website/src/app/docs/get-started/page.tsx', 'AGENT_STARTER', 'shows the full text in a copy frame'],
  ['website/src/app/llms.txt/route.ts', 'AGENT_STARTER_URL', 'links the raw file'],
];
for (const [file, name, what] of starterOffers) {
  const content = read(join(repoRoot, ...file.split('/')));
  const imported = new RegExp(
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']${ACCESSOR_IMPORT}["']`
  ).test(content);
  if (!imported || (content.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length < 2) {
    errors.push(`${file} no longer uses ${name} from ${ACCESSOR_IMPORT}: it ${what}.`);
  }
  if (content.includes(`/${AGENT_STARTER_FILE}`)) {
    errors.push(`${file} spells /${AGENT_STARTER_FILE} by hand — use AGENT_STARTER_URL from ${ACCESSOR_IMPORT}.`);
  }
}
// The README offers it too and ships in the npm tarball, but it is
// markdown and cannot import the accessor, so it is held to the URL the
// accessor would build: a renamed file cannot leave it pointing at a 404.
const starterUrl = `${SITE_URL}/${AGENT_STARTER_FILE}`;
if (!read(join(repoRoot, 'README.md')).includes(starterUrl)) {
  errors.push(`README.md no longer offers the agent starter at ${starterUrl}: its "Set up your agent" section links and curls that URL.`);
}

finish(
  '✗ Agent skill validation failed:',
  errors,
  `✓ Agent skills sound — ${tableNames.length} skills, ${wanted.size} files, ` +
    `the manifest matches the table, ${advertisers.length} surfaces derive their list from it, ` +
    `and the agent starter is offered on ${starterOffers.length + 1} surfaces.`
);
