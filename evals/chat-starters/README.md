# Starter-chip eval

The eval for the merchant sales assistant's generated welcome chips: the
questions `/api/merchant-chat/starters` writes when a reader highlights
something or ticks rows. It runs every kind of focus the page can send (a
KPI figure, a table cell of each kind of column, one record, a set, a
passage with no single source) through the real route, because what is
under test is the prompt, the focus rebuilt from the ledger and the chip
parser together.

## How to run it

```bash
# 1. Start the dev server with the guardrails open (a run is the cases times
#    three repeats, more than the per-IP burst limit allows). From an agent
#    session, start the `website-eval` entry in .claude/launch.json.
npm run dev:eval -w website

# 2. From the repo root, with ANTHROPIC_API_KEY exported for the rubric's grader.
npm run eval:starters
```

Results land in `runs/` (gitignored, like the chat eval's).

## What it holds the chips to

The house rule is that a chip is **neutral and broad**: it asks, and never
reads a judgement, a direction or a size into the thing before the answer
has. "How has this changed?" passes; "What drove this revenue jump?" and
"Is this growth unusually large?" fail.

- `assert-starters.mjs` is the mechanical half: a full row of three, each
  within the chip budget and ending in a question mark, no word from its
  judging or directional lists, no value or id, a set never asked about as
  one record, and no two chips opening the same way.
- The `llm-rubric` is the half a word list cannot see: a question that leans
  without a banned word, or reads awkwardly.

A chip that fails is a prompt problem first: fix the rule in the route's
system prompt, then rerun. Add a word to a list only when the prompt already
says not to use it and a run shows the model using it anyway.
