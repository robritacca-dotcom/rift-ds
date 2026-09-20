# Chat eval

The answer-quality eval for the site chat. It runs the golden set through the
real route — persona, corpus, guardrails, all of it — never the raw Anthropic
API, because the thing under test is the system, not the model.

## How to run it

```bash
# 1. Start the dev server with the guardrails open (a full run is the golden
#    set times three repeats, more than enough to trip the per-IP rate
#    limiter; blanking the KV vars makes them fail open).
npm run dev:eval -w website

# 2. Run the eval from the repo root. --no-cache is deliberate: variance is
#    part of what this measures, and cached responses would fake stability.
npm run eval:chat

# 3. Compare runs in the local UI.
npx -y promptfoo@0.122.0 view
```

Results land in `runs/` (gitignored — transcripts are evidence, not source).
Copy `runs/latest.json` to a named file when a run is a baseline worth keeping.

## How to read it

**The transcripts are the grader.** With a golden set this small, a change in
the aggregate score is noise by construction; one flipped answer moves it a
few points. Read the answers seat by seat — `metadata.seat` is `recruiter`,
`designer`, `developer`, or `conduct` — and judge whether that visitor got
something they could act on, not just whether nothing was wrong. The
assertions are a regression tripwire (did the email vanish, did it invent a
path, did an em dash sneak in), not a measurement instrument.

Each question runs 3 times. Same question, different answers is normal; a
case that flickers pass/fail across repeats is telling you the answer is
borderline, which is worth reading, not averaging away.

## Where the rules are written down

`SPEC.md` in this directory maps every behavioural rule the chat is held to
(from the persona and content-design.md) to the check that enforces it, and
names the rules that have no tripwire yet. New golden-set cases cite the rule
ids they cover; a rule change and its spec row move in the same change.

## What the layers are

- **Layer 0 — coverage, free, in CI.** `scripts/validate-chat-coverage.mjs`
  proves every `metadata.requiredFacts` string is actually in the generated
  corpus, and every page route is either covered or deliberately excluded. A
  question the corpus cannot answer is a corpus bug, and it fails the build.
  The one sanctioned exception: cases marked `source: tools` are answered by
  the chat's lookup tools over the generated prop and token data, not the
  corpus, so they carry empty `requiredFacts` (SPEC.md's T4 owns this).
- **Layer 1 — this config.** Deterministic assertions through the real route.
- **Layer 2 — LLM judge. Not built.** Gated on real logged failures to grade.
  Do not add `llm-rubric` assertions before then.
- **Layer 3 — you, reading.** The conduct questions especially.

## Known limits, so nobody rediscovers them

- **No cost numbers.** The route does not emit token usage to the client, so
  promptfoo cannot compute cost here. Spend is visible in the Anthropic
  Console and in the route's server logs.
- **Do not trust promptfoo's latency numbers here.** Measured against this
  HTTP provider they report single-digit milliseconds for real model calls,
  so the `latency` assertion in the config is a tripwire for pathological
  hangs at best, not a measurement. The trustworthy numbers are the route's
  own exchange log (`latencyMs` and `firstTextMs` per exchange), and the
  browser for what a visitor actually feels.
- **The em-dash and exclamation-mark assertions police the persona's style
  rules.** The corpus itself (CLAUDE.md) contains em dashes, so a failure
  usually means the model quoted rather than wrote; read it before treating
  it as a regression.
- **The eval only ever scores the default model.** The config sends no
  `model` field, and the route resolves the model server-side through the
  day's budget tier — against `dev:eval` the guardrails fail open, so every
  run serves the tier-open default (Sonnet). The Haiku path a real visitor
  gets past the step-down threshold is never graded, and two runs are only
  comparable when the serving model matched — one more reason `dev:eval`,
  not a KV-backed server, is the only valid target.
- **The config hardcodes `http://localhost:3000`.** Both dev entries in
  `.claude/launch.json` carry `autoPort`, so a second server already holding
  3000 silently points the eval at the wrong app. Confirm which process owns
  port 3000 before trusting a run.

## The standing rule

Every failure found in the wild becomes a golden-set case **before** it is
fixed. Add the question, its `requiredFacts`, and the cheapest assertion that
would have caught it. That is what turns this file from a question list into
a regression suite.

The widget's thumbs are the queue for that rule. Every logged exchange
carries an id, and a visitor's verdict lands at `chat:feedback:<id>` in the
same Redis the exchange log uses (30-day TTL, matching the log). Joining
`chat:feedback:*` against the `chat:log:<day>` lists surfaces every disliked
answer verbatim: question, answer, and the page it was asked from — each one
a golden-set candidate.
