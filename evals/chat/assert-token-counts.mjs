/**
 * The token-count staleness tripwire, the sibling of assert-component-count.
 * The token-count golden-set case must never hardcode "232" and "105" in its
 * asserts — the numbers move every time a token lands, and a literal breaks
 * silently until the next eval run. This reads the generated token registry
 * (the same source the chat's get_design_tokens tool serves) and requires
 * the answer to state the current total and the current colour count.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const registry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'tokens', 'registry.json'), 'utf8')
);
const total = Object.values(registry.categories).reduce(
  (sum, names) => sum + names.length,
  0
);
const colour = registry.categories.colour.length;

export default function assertTokenCounts(output) {
  const text = String(output);
  const missing = [];
  if (!text.includes(String(total))) missing.push(`the total (${total})`);
  if (!text.includes(String(colour))) missing.push(`the colour count (${colour})`);
  if (missing.length > 0) {
    return {
      pass: false,
      score: 0,
      reason: `answer does not state ${missing.join(' or ')} from the token registry`,
    };
  }
  return { pass: true, score: 1, reason: `states the registry's counts (${total} total, ${colour} colour)` };
}
