/**
 * The mechanical rules every row of starter chips is held to, for any focus.
 * The words below are the neutral-and-broad rule made checkable: a chip asks,
 * and never reads a judgement, a direction or a size into the thing before the
 * answer has. A case's `grain` var adds the grain rule: a set of records is
 * asked about as a set, one record as one. A cell case's `offTopic` var holds
 * the words for the other columns, comma-separated, and `measurable` says
 * whether the focus is a number, the only kind of thing that "measures" (promptfoo expands an array
 * var into one test per item), which its chips must not drift to.
 */
import { readFileSync } from 'node:fs';

/* The chip budget, read from its one home rather than restated. */
const MAX_CHARS = Number(
  readFileSync(new URL('../../src/chat/suggestions.ts', import.meta.url), 'utf8').match(/SUGGESTION_MAX_CHARS = (\d+)/)[1],
);
/* A chip writes a month or weekday short (validate-chat-starters.mjs holds the written ones to it). */
const LONG_DATE_NAME = /\b(January|February|March|April|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/;
const WANTED = 3;

/* Words that judge or read the value. */
const JUDGING = [
  'unusual', 'unusually', 'surprising', 'surprisingly', 'high', 'higher', 'low', 'lower', 'large', 'larger',
  'small', 'smaller', 'big', 'huge', 'tiny', 'strong', 'weak', 'good', 'bad', 'healthy', 'worrying',
  'concerning', 'alarming', 'impressive', 'poor', 'notable', 'normal', 'abnormal', 'outlier', 'suspicious',
  'risky', 'problem', 'issue', 'wrong',
];
/* Words that read a direction or a size of change into it. */
const DIRECTIONAL = [
  'jump', 'jumped', 'spike', 'spiked', 'surge', 'surged', 'rise', 'rose', 'rising', 'growth', 'grew', 'grow',
  'drop', 'dropped', 'dip', 'dipped', 'fall', 'fell', 'falling', 'decline', 'declined', 'gain', 'gained',
  'boost', 'slump', 'negative', 'positive',
];

const words = (chip) => chip.toLowerCase().match(/[a-z']+/g) ?? [];

export default function assertStarters(output, context) {
  const chips = String(output ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  const problems = [];
  if (chips.length < WANTED) problems.push(`${chips.length} of ${WANTED} chips (the rest fell back or were dropped)`);
  for (const chip of chips) {
    if (chip.length > MAX_CHARS) problems.push(`over ${MAX_CHARS} characters: "${chip}"`);
    if (!chip.endsWith('?')) problems.push(`not a question: "${chip}"`);
    if (LONG_DATE_NAME.test(chip)) problems.push(`spells out a date name: "${chip}"`);
    const found = words(chip).filter((word) => JUDGING.includes(word) || DIRECTIONAL.includes(word));
    if (found.length) problems.push(`characterises (${found.join(', ')}): "${chip}"`);
    if (/ORD-\d+|\d/.test(chip)) problems.push(`names a value or id: "${chip}"`);
  }
  const grain = context.vars.grain;
  if (grain === 'set' && chips.some((chip) => /\bthis (order|record)\b/i.test(chip))) problems.push('a set asked about as one record');
  if (grain === 'one' && chips.some((chip) => /\bthese\b/i.test(chip))) problems.push('one record asked about as a set');
  /* Only a number measures: a name, a status, a date or a record is asked what it means or is. */
  if (context.vars.measurable === 'no') {
    for (const chip of chips) if (/\bmeasures?\b/i.test(chip)) problems.push(`asks what a non-measure measures: "${chip}"`);
  }
  /* A cell's chips stay on its column: naming another column is its row's background leaking in. */
  const offTopic = String(context.vars.offTopic ?? '').split(',').filter(Boolean);
  for (const chip of chips) {
    const drifted = words(chip).filter((word) => offTopic.includes(word));
    if (drifted.length) problems.push(`off its column (${drifted.join(', ')}): "${chip}"`);
  }
  const openings = chips.map((chip) => words(chip).slice(0, 3).join(' '));
  if (new Set(openings).size < openings.length) problems.push('two chips open the same way');
  return {
    pass: problems.length === 0,
    score: problems.length === 0 ? 1 : 0,
    reason: problems.length ? problems.join('; ') : `${chips.length} neutral chips`,
  };
}
