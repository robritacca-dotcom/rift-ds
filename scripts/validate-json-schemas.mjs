#!/usr/bin/env node
/**
 * validate-json-schemas.mjs
 *
 * Proves the published JSON Schemas against the data that declares them.
 * A hand-written meta-schema is only a claim until something checks real
 * documents against it; this script is that check, on every build:
 *
 *   1. Every generated document in BINDINGS validates against its
 *      meta-schema, compiled strictly (an unknown keyword or format in the
 *      meta-schema fails the build too), and declares that meta-schema's
 *      URL as its `$schema`.
 *   2. The vocabulary the component meta-schema holds as data stays in
 *      step with the validator that owns the per-component rule: the tone
 *      list in component.schema.json must equal COLOUR_TONES plus every
 *      SANCTIONED_TONES set in validate-prop-vocabulary.mjs, read from that
 *      script's source so neither can drift from the other.
 *
 * The component schemas, their index and the token values file are the
 * bindings today; a new published schema is one more row. Belongs in the
 * validate-registry chain, after every generator that writes a document
 * here: it reads disk, never regenerates (validate-generated-files.mjs does).
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createAjv, schemaErrors } from './json-schema.mjs';
import { SITE_URL } from './brand.mjs';
import { display, read, readJson, repoRoot } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const schemaDir = join(repoRoot, 'website', 'public', 'schema');

/**
 * One row per published meta-schema: the schema file, the documents it
 * governs (a folder of them, or one file), and the `$schema` URL each must
 * declare. `optional` rows are skipped while their document does not exist
 * yet, so a generator can land in a later change than this validator.
 */
const BINDINGS = [
  {
    schema: join(schemaDir, 'component.schema.json'),
    folder: join(schemaDir, 'components'),
    declares: `${SITE_URL}/schema/component.schema.json`,
  },
  {
    schema: join(schemaDir, 'components-index.schema.json'),
    file: join(schemaDir, 'components.json'),
    declares: `${SITE_URL}/schema/components-index.schema.json`,
  },
  {
    schema: join(schemaDir, 'token-values.schema.json'),
    file: join(repoRoot, 'src', 'tokens', 'values.json'),
    declares: `${SITE_URL}/schema/token-values.schema.json`,
    optional: true,
  },
];

const errors = [];
const ajv = createAjv();
let documents = 0;

for (const binding of BINDINGS) {
  const targets = binding.folder
    ? existsSync(binding.folder)
      ? readdirSync(binding.folder).filter((n) => n.endsWith('.json')).sort().map((n) => join(binding.folder, n))
      : []
    : existsSync(binding.file)
      ? [binding.file]
      : [];
  if (targets.length === 0) {
    if (!binding.optional) {
      errors.push(`${display(binding.folder ?? binding.file)} has no documents to check against ${display(binding.schema)}.`);
    }
    continue;
  }
  if (!existsSync(binding.schema)) {
    errors.push(`${display(binding.schema)} is missing; the documents under ${display(binding.folder ?? binding.file)} declare it.`);
    continue;
  }
  let schema;
  try {
    schema = readJson(binding.schema);
  } catch (error) {
    errors.push(`${display(binding.schema)} is not valid JSON: ${error.message}`);
    continue;
  }
  for (const target of targets) {
    documents += 1;
    let data;
    try {
      data = readJson(target);
    } catch (error) {
      errors.push(`${display(target)} is not valid JSON: ${error.message}`);
      continue;
    }
    if (data.$schema !== binding.declares) {
      errors.push(
        `${display(target)} declares "$schema": ${JSON.stringify(data.$schema)}; expected ${binding.declares}.`
      );
    }
    try {
      errors.push(...schemaErrors(ajv, schema, data, display(target)));
    } catch (error) {
      errors.push(`${display(binding.schema)} does not compile: ${error.message}`);
      break;
    }
  }
}

/* ---- The tone vocabulary, held in both directions ---- */

const vocabularySource = read(join(repoRoot, 'scripts', 'validate-prop-vocabulary.mjs'));
const toneSet = new Set();
const houseMatch = vocabularySource.match(/const COLOUR_TONES = new Set\(\[([^\]]*)\]\)/);
if (!houseMatch) {
  errors.push('Could not read COLOUR_TONES from scripts/validate-prop-vocabulary.mjs.');
} else {
  for (const m of houseMatch[1].matchAll(/'([a-z-]+)'/g)) toneSet.add(m[1]);
}
const sanctionedBlock = vocabularySource.match(/const SANCTIONED_TONES = \{([\s\S]*?)\n\};/);
if (!sanctionedBlock) {
  errors.push('Could not read SANCTIONED_TONES from scripts/validate-prop-vocabulary.mjs.');
} else {
  for (const m of sanctionedBlock[1].matchAll(/values:\s*\[([^\]]*)\]/g)) {
    for (const v of m[1].matchAll(/'([a-z-]+)'/g)) toneSet.add(v[1]);
  }
}

const metaPath = join(schemaDir, 'component.schema.json');
if (existsSync(metaPath) && toneSet.size > 0) {
  const meta = readJson(metaPath);
  const toneRule = (meta.$defs?.prop?.allOf ?? []).find(
    (rule) => rule.if?.properties?.name?.const === 'tone'
  );
  const listed = toneRule?.then?.properties?.values?.items?.enum;
  if (!Array.isArray(listed)) {
    errors.push(`${display(metaPath)} has no tone rule (if name == tone, then values.items.enum).`);
  } else {
    const expected = [...toneSet].sort();
    const actual = [...listed].sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      errors.push(
        `${display(metaPath)}'s tone list is ${actual.join(', ')}; ` +
          `COLOUR_TONES plus SANCTIONED_TONES in scripts/validate-prop-vocabulary.mjs give ${expected.join(', ')}. ` +
          `Change both in the same edit.`
      );
    }
  }
}

finish(
  '✗ JSON Schema validation failed:',
  errors,
  `✓ JSON schemas hold — ${documents} documents validate against ${BINDINGS.length} published schemas, and the tone vocabulary matches validate-prop-vocabulary.mjs.`
);
