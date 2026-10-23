---
name: component-consistency-audit
description: Library-wide audit of how components treat the same thing. Finds controls, marks and surfaces drawn more than one way, components that redraw a shared primitive instead of composing it, and surface families that split on fill, hover, radius, selected or disabled, then fixes the defects for approval. Use when asked to audit consistency, check whether components look and feel alike, find redrawn controls or duplicated primitives, or review surface treatments across the library.
icon: difference
displayDescription: "Sweeps every component for the same thing done more than one way: a checkbox, radio, switch or chosen mark drawn by hand instead of the shared indicator, a visually-hidden recipe or close button copied rather than composed, and a surface family (option rows, cards, overlay rows, navigation rows) whose members split on fill, border, radius, hover, selected or disabled. Runs the shared-primitives validator for the mechanical half, builds the family tables fresh from the stylesheets for the rest, and lands the fixes on a local branch for approval."
invoke: ["audit component consistency","consistency audit","are the components consistent","find redrawn controls","check the surface families"]
---

# component-consistency-audit

The library's answer to drift between components. Every validator in the build holds one component to the system; this audit holds the components to each other: the same role gets the same treatment, and the small things every component needs are drawn once and composed everywhere else.

It exists because the drift it looks for is invisible from inside any one component. On 2026-10-23 four controls on the playground looked wrong next to each other, and the sweep that followed found the same pattern across the library: three components drawing their own checkbox or radio, a switch copied by hand, a "chosen" check styled seven times in three colours, twenty-one stylesheets each carrying the visually-hidden recipe, three self-drawn close buttons, and seven surface families each split on fill, hover, radius or selected colour. Every one of those had passed every build check.

## When invoked

Use this skill when asked to audit or check consistency across components — phrases like "audit component consistency", "consistency audit", "are the components consistent", "find redrawn controls", "check the surface families", "why do these look different".

It also runs **scoped** inside other flows: `new-component` runs it on a new component and its family before registering, and `design-qa`'s sweep mode borrows its family tables for the lineup. Scoped, report only findings about the components in scope and their family.

## Scope

Accept any of:

- **`all`** (the default when nothing is named) → every component under `src/components/` plus the chat widget's modules in `src/chat/`.
- **A family** → a registry `category`, a shared folder, or a pattern family named in words ("the option rows", "everything with a chosen mark", "the overlay list rows"). The family is judged against itself.
- **A component** → that component plus its family, judged against the family.

## Ground rules — why this audit does not go stale

- The checks below are principles. **Facts come fresh each run**: the component list is `src/components/registry.json` read now, the one drawing of each primitive is `design.md`'s Components intro ("Shared primitives, never redrawn" and "Surfaces by family") read now, and the family tables are built from the stylesheets now. Never judge against a remembered lineup or a list written here.
- Every component name in this skill's examples is fictional by design. A factual claim about a real component inside an example rots silently.
- The validator is the floor, not the audit. `node scripts/validate-shared-primitives.mjs` fails a second drawing of the things it can recognise; what it cannot judge (a legal token in the wrong family, a hover that disagrees with its siblings, a radius chosen per component) is this skill's work.

## Instructions

### 1. Run the mechanical half

`node scripts/validate-shared-primitives.mjs`. A failure is a finding already located; fix it first. Read its doc block for what it covers and its `SANCTIONED` table for the deliberate departures, so a departure the owner has already recorded is not re-raised.

### 2. Inventory the controls and marks

For every component in scope, find each place it shows a choice state and classify the drawing:

- **A form control's indicator** (a box, a circle, a track, a tick inside one): must be `CheckboxIndicator`, `RadioIndicator` or `SwitchIndicator`, rendered by the host, with the host's root carrying the role, the state and the `ds-control-host` class. A glyph, an SVG, a `<div>` with a border radius, or the indicator's class names written by hand are all findings.
- **A chosen mark** (the trailing check on a selected list or menu row): must be `ChosenMark`, rendered only on the selected row. A per-component check span, a different colour or size, or a leading check standing in for a checkbox on a multi-select row are findings.
- **A mutually exclusive set of pills**: must be `SegmentedControl` (or the Inspector family's panel-scale one). A hand-built `role="radiogroup"` of buttons is a finding.
- **A status or decorative icon that merely looks like a control** (a completed step's check, a plan item's circle): leave it, and say so in the report, so the next run does not re-examine it.

Grep is enough to locate the candidates: `aria-checked`, `aria-selected`, `role="switch"`, `role="checkbox"`, `role="radio"`, the Material ligatures `check`, `check_box*`, `radio_button_*`, and selectors ending in `__check`, `__indicator`, `__dot`, `__thumb`, `__track`. The audit is the reading, not the grep.

### 3. Build the surface family tables

For every stylesheet in scope, record the root or row rule that is a bordered or filled surface: background token, border token, radius token, hover background, selected or active background, and the disabled rule. Group the rows into families by role, not by name, and for each family state the dominant treatment and list the outliers. The families the library has today, and the convention each one holds, are in `design.md`'s "Surfaces by family"; a new family is a new paragraph there, not a private rule in one stylesheet. The shape of the table:

| Family | Fill | Border | Radius | Hover | Selected | Disabled |
|---|---|---|---|---|---|---|
| (one row per family, the convention) | | | | | | |

Flag:

- A member whose resting fill is `none` or `transparent` while its siblings are filled, or the reverse.
- A family using more than one radius step for the same role.
- A hover, selected or current treatment that differs from the family's (a current navigation row on the hover token, so hover and current read the same, is the classic case).
- A disabled state that is not `opacity: 0.4` with `cursor: not-allowed`, or is missing where the component takes `disabled`.
- A raw value where the family uses a token (`1px` for `--border-025`).

A deliberate departure needs a sentence in the component's `design.md` spec saying so; one without is a finding whichever way it resolves.

### 4. Check the micro-primitives

The things every component needs and must not redraw. For each, the one home is named in `design.md`'s Components intro; confirm every use composes it:

- Visually hidden text → `ds-visually-hidden` from `src/behaviors/visually-hidden.css`.
- A header's close button → a compact tertiary `CircularButton`.
- The check and minus glyphs → `CheckIcon` and `MinusIcon`, exported beside Checkbox.
- A focus ring on a control → the 2px action ring on the indicator; a host that is itself the target rings its own edge.
- A label-and-description text column, a helper line, a disabled treatment → the same tokens and the same structure as the nearest sibling (Checkbox and RadioButton are the pair to line up).

A second copy with no reason beside it is a finding. A copy with a reason that still holds is recorded in the validator's `SANCTIONED` table, if the validator can see it, or in the component's spec, if it cannot.

### 5. Line up the pixels

For every family with a finding, render the members side by side in both themes (the `design-qa` skill's Evidence section owns the method) and confirm the finding in pixels before writing it: a token difference that renders identically in both themes is still drift, but it is a Cleanup, not a Defect.

### 6. Judge and fix

Every finding names the primitive or the family rule it breaks, and each is classified:

- **Defect** — a redrawn primitive, or a member outside its family's convention with no recorded reason. One right answer: compose the primitive, or take the family's tokens. *Fix it.*
- **Cleanup** — a duplicate that renders the same today (a copied recipe, a raw value equal to the token). *Fix it.*
- **Direction** — the family itself has no convention yet, or two defensible ones. *Recommend one, write it into `design.md`'s "Surfaces by family" only once the owner picks, and do not restyle members until then.*

Fixes land at the source and obey every library rule (`new-component`'s CSS section is the reference). A new primitive is exported beside the control that owns it (the docgen rule: below the component, every prop documented), its states keyed on its own modifier classes, and its consumers moved onto it in the same change. Then: update the touched components' `design.md` specs, extend the validator's `SANCTIONED` table for any departure that survives, run `npm run validate-registry` and `npm run test`, and leave the work on a local branch for approval. **Never push, merge or deploy** from this skill.

## Report

```
## Component consistency audit: [scope]

**Verdict:** [clean | N defects fixed, M cleanups fixed, K decisions open]

### Redrawn primitives
- [component]: [what it drew] → [what it composes now]

### Surface families
| Family | Convention | Outliers found | Resolution |

### Micro-primitives
- [what was copied, where] → [the one home it now uses]

### Open decisions
- [the family or treatment with no convention] — recommendation: [one option and why]

### Checked and clean
[Which components, families and themes were actually reviewed, so "clean" has a defined coverage.]
```

## Guardrails

- A clean pass is a valid outcome. State the coverage and stop.
- The action colour's roles are design.md's colour-role list, and `scripts/validate-action-colour.mjs`'s `SANCTIONED` table records who may use it; a chosen mark in the action colour is sanctioned there, and a menu row's fill is not. Do not move a use between the two without the owner.
- Contrast is settled: read the comment beside the `color-contrast` override in `.storybook/preview.ts` before raising anything about it.
- A deliberate departure the owner recorded (a sentence in a spec, a row in a sanction table) is not a finding. Re-raise it only with the owner's say-so.
