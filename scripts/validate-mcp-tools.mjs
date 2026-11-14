#!/usr/bin/env node
/**
 * validate-mcp-tools.mjs
 *
 * Holds every stated MCP tool count to the tools the route actually
 * registers. The registrations live in one place — the `server.registerTool`
 * calls in website/src/app/api/mcp/route.ts — but the roster is restated as
 * data in website/src/lib/mcp-tools.ts (which the landing page and the
 * get-started page render), and its count is restated in prose on a surface
 * that cannot import it: the overview page (COUNTED_SURFACES below). A tool
 * added or removed without those sentences fails here instead of shipping
 * as a lie.
 *
 * The check is deliberately narrow: any "<number> tools" phrase in a listed
 * file must equal the registered count. Surfaces that describe the tools by
 * capability without a number (llms.txt) have nothing to drift and are not
 * checked.
 *
 * It also holds every tool argument to a description. An agent choosing an
 * argument reads nothing else about it, so one without a description is a
 * guess. Two declarations are read from their syntax trees: each property of
 * an `inputSchema: z.object({...})` in the MCP route must end in a
 * `.describe()` with text, and each property of an `input_schema` in the
 * site chat's route (the same tools, offered to the chat model) must carry a
 * `description` with text.
 */
import { join } from 'node:path';
import ts from 'typescript';
import { read, readRel, repoRoot } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const routePath = join(repoRoot, 'website/src/app/api/mcp/route.ts');
const route = read(routePath);

const registered = [...route.matchAll(/server\.registerTool\(\s*["']([a-z_]+)["']/g)].map(
  (match) => match[1]
);

const errors = [];
if (registered.length === 0) {
  errors.push(
    'no server.registerTool calls found in website/src/app/api/mcp/route.ts — ' +
      'if the registration moved, update this script.'
  );
}

// The landing page and the get-started page render the roster from the
// MCP_TOOLS array in website/src/lib/mcp-tools.ts. Hold it to the
// registrations in both directions, and require an example prompt per
// entry: a new tool cannot ship without one.
const rosterPath = join(repoRoot, 'website/src/lib/mcp-tools.ts');
const roster = read(rosterPath);
const toolsArray = roster.match(/const MCP_TOOLS[^=]*=\s*\[([\s\S]*?)\];/);
if (!toolsArray) {
  errors.push(
    'the MCP_TOOLS array is missing from website/src/lib/mcp-tools.ts — ' +
      'the landing and get-started pages need it; if it was renamed, update this script.'
  );
} else {
  const entries = [...toolsArray[1].matchAll(/\{[\s\S]*?\}/g)].map((m) => m[0]);
  const listed = entries
    .map((entry) => entry.match(/name:\s*["']([a-z_]+)["']/)?.[1])
    .filter(Boolean);
  for (const name of registered) {
    if (!listed.includes(name)) {
      errors.push(`the MCP_TOOLS roster is missing registered tool "${name}".`);
    }
  }
  for (const name of listed) {
    if (!registered.includes(name)) {
      errors.push(`the MCP_TOOLS roster lists "${name}", which the route never registers.`);
    }
  }
  for (const entry of entries) {
    const name = entry.match(/name:\s*["']([a-z_]+)["']/)?.[1] ?? '(unnamed)';
    const prompt = entry.match(/prompt:\s*["'](.*?)["']/)?.[1];
    if (!prompt || prompt.trim().length === 0) {
      errors.push(`MCP_TOOLS entry "${name}" has no example prompt — every tool ships with one.`);
    }
  }
}

/** Files whose prose states the tool count. Add a file here when a new surface does. */
/* The README stopped counting the tools in the 2026-09-20 adoption
   rewrite (it names what they serve instead — genre convention keeps
   counts off the README); /overview still states the number, so the
   count stays validator-held where it appears. */
const COUNTED_SURFACES = ['website/src/app/overview/page.tsx'];

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

for (const file of COUNTED_SURFACES) {
  const content = readRel(file);
  const claims = [...content.matchAll(/\b([A-Za-z]+|\d+)\s+(?:deterministic\s+)?tools\b/gi)];
  let counted = 0;
  for (const claim of claims) {
    const word = claim[1].toLowerCase();
    const stated = /^\d+$/.test(word) ? Number(word) : NUMBER_WORDS[word];
    if (stated === undefined) continue; // "build tools", "its tools" — not a count
    counted += 1;
    if (stated !== registered.length) {
      errors.push(
        `${file} says "${claim[0]}" but the MCP route registers ` +
          `${registered.length} (${registered.join(', ')}). Update the sentence.`
      );
    }
  }
  if (counted === 0) {
    errors.push(
      `${file} no longer states the MCP tool count — remove it from ` +
        `COUNTED_SURFACES in scripts/validate-mcp-tools.mjs, or restore the sentence.`
    );
  }
}

/* ---- Every tool argument has a description ---- */

const parse = (path, text) => ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
const nameOf = (property) =>
  ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : property.name.getText();
const visit = (node, fn) => {
  fn(node);
  ts.forEachChild(node, (child) => visit(child, fn));
};
const hasText = (node) =>
  node !== undefined && (ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) && node.getText().length > 2;

/** True when a zod chain (`z.string().optional().describe("…")`) calls describe with text. */
const describes = (expression) => {
  let found = false;
  visit(expression, (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'describe' &&
      hasText(node.arguments[0])
    ) {
      found = true;
    }
  });
  return found;
};

let describedArguments = 0;

visit(parse(routePath, route), (node) => {
  if (!ts.isPropertyAssignment(node) || nameOf(node) !== 'inputSchema') return;
  const shape = ts.isCallExpression(node.initializer) ? node.initializer.arguments[0] : undefined;
  if (!shape || !ts.isObjectLiteralExpression(shape)) {
    errors.push(
      'an inputSchema in website/src/app/api/mcp/route.ts is not a z.object({...}) literal, so its ' +
        'arguments cannot be read; write it inline, or teach scripts/validate-mcp-tools.mjs the new shape.'
    );
    return;
  }
  for (const property of shape.properties) {
    if (!ts.isPropertyAssignment(property) || !describes(property.initializer)) {
      errors.push(
        `the MCP argument "${property.name?.getText() ?? property.getText()}" in website/src/app/api/mcp/route.ts ` +
          'has no description; end its zod chain in .describe("...").'
      );
    } else {
      describedArguments += 1;
    }
  }
});

const chatRoutePath = join(repoRoot, 'website/src/app/api/chat/route.ts');
visit(parse(chatRoutePath, read(chatRoutePath)), (node) => {
  if (!ts.isPropertyAssignment(node) || nameOf(node) !== 'input_schema') return;
  const schema = node.initializer;
  const properties =
    ts.isObjectLiteralExpression(schema) &&
    schema.properties.find((p) => ts.isPropertyAssignment(p) && nameOf(p) === 'properties');
  if (!properties) return; // a tool that takes no arguments
  if (!ts.isObjectLiteralExpression(properties.initializer)) {
    errors.push(
      'an input_schema in website/src/app/api/chat/route.ts does not write its properties inline, so its ' +
        'arguments cannot be read; write them inline, or teach scripts/validate-mcp-tools.mjs the new shape.'
    );
    return;
  }
  for (const property of properties.initializer.properties) {
    const description =
      ts.isPropertyAssignment(property) &&
      ts.isObjectLiteralExpression(property.initializer) &&
      property.initializer.properties.find((p) => ts.isPropertyAssignment(p) && nameOf(p) === 'description');
    if (!description || !hasText(description.initializer)) {
      errors.push(
        `the chat tool argument "${property.name?.getText() ?? property.getText()}" in website/src/app/api/chat/route.ts ` +
          'has no description; add a description with text.'
      );
    } else {
      describedArguments += 1;
    }
  }
});

if (describedArguments === 0) {
  errors.push(
    'no tool arguments were found in the MCP route or the chat route; if the declarations moved, ' +
      'update scripts/validate-mcp-tools.mjs.'
  );
}

finish(
  '✗ MCP tool count validation failed:',
  errors,
  `✓ MCP tool count in sync — ${registered.length} tools registered ` +
    `(${registered.join(', ')}), every stated count matches, and all ${describedArguments} tool arguments are described.`
);
