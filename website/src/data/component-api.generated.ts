// AUTO-GENERATED — do not edit by hand.
// Source of truth: src/components/registry.json, src/chat/registry.json and
// the prop JSDoc in src/components and src/chat (via react-docgen-typescript
// — settings in scripts/component-docgen.mjs, shared with Storybook's props
// tables).
// Regenerate: node scripts/generate-component-api.mjs (runs via predev/prebuild).

/** One documented own prop, as it ships in the .d.ts and Storybook. */
export interface ComponentPropApi {
  name: string;
  /** The resolved TypeScript type, literal unions expanded. */
  type: string;
  required: boolean;
  /** The prop's JSDoc description — present on every own prop, build-enforced. */
  description: string;
  defaultValue?: string;
  /** Set when the prop carries an @deprecated tag; the replacement guidance. */
  deprecated?: string;
}

/** One exported component and its documented props. */
export interface ComponentExportApi {
  component: string;
  props: ComponentPropApi[];
  /** Set when the component itself carries an @deprecated tag; the replacement guidance. */
  deprecated?: string;
}

/** One public registry entry: a component, or the chat widget. */
export interface ComponentApiEntry {
  /** A library component, or the composed chat widget (src/chat/registry.json). */
  kind: 'component' | 'widget';
  name: string;
  label: string;
  slug: string;
  /** A component category id, or 'widget'. */
  category: string;
  description: string;
  /** Whether the module declares 'use client'. */
  client: boolean;
  /** Deep import subpath; the barrel named in `barrel` also re-exports it. */
  importPath: string;
  /** 'charts' modules need the optional recharts peer; 'main' modules never do; 'chat' is the widget's own subpath with its own peers. */
  barrel: 'main' | 'charts' | 'chat';
  /** Set when the registry-named component is deprecated; the replacement guidance. */
  deprecated?: string;
  exports: ComponentExportApi[];
}

/** The full prop API for every public component, in registry (alphabetical) order, then the chat widget. */
export const componentApi: readonly ComponentApiEntry[] = [
  {
    "kind": "component",
    "name": "Accordion",
    "label": "Accordion",
    "slug": "accordion",
    "category": "data-display",
    "description": "Collapsible content sections for organising related information.",
    "client": true,
    "importPath": "rift-ds/components/Accordion/Accordion",
    "barrel": "main",
    "exports": [
      {
        "component": "Accordion",
        "props": [
          {
            "name": "items",
            "type": "AccordionItem[]",
            "required": true,
            "description": "List of accordion items"
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Allow multiple items open at once",
            "defaultValue": "false"
          },
          {
            "name": "expanded",
            "type": "string[]",
            "required": false,
            "description": "IDs of the expanded items, for a controlled accordion. Leave it undefined\nto let the component keep its own open state, seeded from\n`defaultExpanded`."
          },
          {
            "name": "defaultExpanded",
            "type": "string[]",
            "required": false,
            "description": "IDs of initially expanded items when the accordion is uncontrolled",
            "defaultValue": "[]"
          },
          {
            "name": "onExpandedChange",
            "type": "((expanded: string[]) => void)",
            "required": false,
            "description": "Called with the IDs of the expanded items after the user opens or closes one"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AgentPlan",
    "label": "Agent plan",
    "slug": "agent-plan",
    "category": "ai",
    "description": "A collapsible checklist of an agent's task, with live step states and a progress readout.",
    "client": true,
    "importPath": "rift-ds/components/AgentPlan/AgentPlan",
    "barrel": "main",
    "exports": [
      {
        "component": "AgentPlan",
        "props": [
          {
            "name": "steps",
            "type": "AgentPlanStep[]",
            "required": true,
            "description": "The plan, in order. Step status drives each row's indicator and colour."
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Header text. Left unset, it is computed from the steps —\n\"3 steps left\", or \"All steps complete\" once everything is done.\nNote: this shadows the native `title` tooltip attribute, which AgentPlan does not expose."
          },
          {
            "name": "remainingLabel",
            "type": "((remaining: number) => string)",
            "required": false,
            "description": "The computed header while steps remain, given how many are left.\nDefaults to \"1 step left\" or \"N steps left\". Ignored when `title` is set.",
            "defaultValue": "(remaining: number) =>\n  `${remaining} step${remaining === 1 ? '' : 's'} left`"
          },
          {
            "name": "completeLabel",
            "type": "string",
            "required": false,
            "description": "The computed header once every step is complete. Defaults to\n\"All steps complete\". Ignored when `title` is set.",
            "defaultValue": "All steps complete"
          },
          {
            "name": "statusLabels",
            "type": "Partial<Record<AgentPlanStepStatus, string>>",
            "required": false,
            "description": "Visually hidden text announcing each step's status after its label.\nMerged over the English defaults (Not started, In progress, Completed, Failed)."
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Open state for controlled use. Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Open state for uncontrolled use.",
            "defaultValue": "true"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires whenever the step list opens or closes."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AgentRail",
    "label": "Agent rail",
    "slug": "agent-rail",
    "category": "ai",
    "description": "The companion rail of an agent product: the agent's portrait over tabbed panes for activity, approvals, automations, and personalization.",
    "client": false,
    "importPath": "rift-ds/components/AgentRail/AgentRail",
    "barrel": "main",
    "exports": [
      {
        "component": "AgentRail",
        "props": [
          {
            "name": "profile",
            "type": "AgentRailProfile",
            "required": false,
            "description": "The agent this rail belongs to, rendered as the header's portrait block."
          },
          {
            "name": "tabs",
            "type": "AgentRailTab[]",
            "required": true,
            "description": "The rail's tabs, in display order. Each carries its own pane."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Id of the tab on stage. The rail is fully controlled by design, so the\nhost owns the state: it holds no hooks and renders from a Server Component.\nFalls back to the first tab."
          },
          {
            "name": "onValueChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the chosen tab's id."
          },
          {
            "name": "activeTab",
            "type": "string",
            "required": false,
            "description": "Legacy name for `value`.",
            "deprecated": "Use `value` instead."
          },
          {
            "name": "onTabChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Legacy change callback; fires alongside `onValueChange`.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "tabsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the tab strip.",
            "defaultValue": "Agent views"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the rail.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "onCollapse",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the rail's collapse affordance is pressed. The button renders\nonly when this is given, pinned to the rail's top trailing corner. It is\na chevron rather than a cross on purpose: the host's own close control\nis usually a cross a few pixels away, and two of them side by side read\nas two ways to dismiss the same thing."
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the collapse affordance.",
            "defaultValue": "Collapse the agent panel"
          },
          {
            "name": "collapseVariant",
            "type": "\"chevron\" | \"close\"",
            "required": false,
            "description": "How the collapse affordance is drawn. `chevron` (the default) pins a chevron to the leading corner, clear of a host's own controls. `close` pins a cross to the trailing corner, for a rail that is its card's only way out or whose host wants the way out where a panel's close usually is.",
            "defaultValue": "chevron"
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "required": false,
            "description": "Rendered under the pane, outside its scroll — a sign-out row, a quiet hint."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AgentStatus",
    "label": "Agent status",
    "slug": "agent-status",
    "category": "ai",
    "description": "What an agent is doing right now, as a dot matrix and status line, a floating pill, a square mark for icon slots, or a ring around any element.",
    "client": true,
    "importPath": "rift-ds/components/AgentStatus/AgentStatus",
    "barrel": "main",
    "exports": [
      {
        "component": "AgentStatus",
        "props": [
          {
            "name": "state",
            "type": "AgentStatusState",
            "required": false,
            "description": "What the agent is doing. Drives the colour, the default label, and whether the matrix animates.",
            "defaultValue": "thinking"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Status text. Falls back to a default for the state. Ignored when `children` are given."
          },
          {
            "name": "pattern",
            "type": "\"braille\" | \"orbit\" | \"breathe\" | \"snake\" | \"fill-sweep\" | \"pulse\" | \"columns\" | \"checkerboard\" | \"scan\" | \"rain\" | \"cascade\" | \"sparkle\" | \"wave-rows\" | \"helix\" | \"diagonal-swipe\" | \"twinkle\"",
            "required": false,
            "description": "Which dot-matrix choreography to run. Defaults to `breathe` while `waiting`, a still pulse that reads as the person's turn (the same as AgentStatusMark), and `orbit` otherwise."
          },
          {
            "name": "shimmer",
            "type": "boolean",
            "required": false,
            "description": "Sweep a highlight across the label while the agent is active. Defaults to\non for `thinking`, `working` and `waiting`, off for the resting states."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\" | \"sm\" | \"md\"",
            "required": false,
            "description": "Indicator and text scale, paired with ChatMessage's sizes: `default`\nmatches default message text, `compact` matches compact message text.\n`sm` and `md` are legacy aliases for `compact` and `default`.",
            "defaultValue": "default"
          },
          {
            "name": "variant",
            "type": "\"inline\" | \"bar\" | \"pill\"",
            "required": false,
            "description": "`inline` sits in a line of content; `bar` is a full-width row for the\ntop of a panel; `pill` is a glass pill for a status that floats over\nthe page while a run goes on; once it ends the dots fill solid in the\nstatus colour, as in every variant. The pill does not position itself.",
            "defaultValue": "inline"
          },
          {
            "name": "action",
            "type": "ReactNode",
            "required": false,
            "description": "A trailing control after the status text, such as a link that opens the run. Meant for the `pill` and `bar` variants."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Status text, when it needs markup the `label` string cannot express."
          }
        ]
      },
      {
        "component": "AgentStatusMark",
        "props": [
          {
            "name": "state",
            "type": "AgentStatusState",
            "required": false,
            "description": "What the agent is doing. Drives the colour and whether the dots animate, as on AgentStatus.",
            "defaultValue": "working"
          },
          {
            "name": "pattern",
            "type": "\"braille\" | \"orbit\" | \"breathe\" | \"snake\" | \"fill-sweep\" | \"pulse\" | \"columns\" | \"checkerboard\" | \"scan\" | \"rain\" | \"cascade\" | \"sparkle\" | \"wave-rows\" | \"helix\" | \"diagonal-swipe\" | \"twinkle\"",
            "required": false,
            "description": "Which choreography to run: every AgentStatus pattern, redrawn for the square grid. Defaults to `breathe` while `waiting`, a still pulse that reads as the person's turn, and `orbit` otherwise."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AiButton",
    "label": "AI button",
    "slug": "ai-button",
    "category": "ai",
    "description": "The AI entry point: a turning gradient ring that reports the agent's status, with a hover-summoned summary and a panel for what the agent asks of you.",
    "client": true,
    "importPath": "rift-ds/components/AiButton/AiButton",
    "barrel": "main",
    "exports": [
      {
        "component": "AiButton",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Button text content",
            "defaultValue": "Ask AI"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — Material Symbol name (string) or custom element (ReactNode)",
            "defaultValue": "auto_awesome"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Button size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the button is disabled"
          },
          {
            "name": "status",
            "type": "AgentStatusState",
            "required": false,
            "description": "What the agent behind the button is doing, in AgentStatus's vocabulary.\nThe label never changes; the icon carries the state. `thinking` and\n`working` show AgentStatusMark and spin the ring faster, `waiting` shows\nthe mark breathing in the warning colour with the ring at rest, and `done` and\n`error` turn the button to their status colours with the mark filled\nsolid in the status colour, then return to the resting look after a\nbeat. The button stays clickable throughout, unlike Button's\n`loading`, so a click can open the conversation to watch the work."
          },
          {
            "name": "statusLabel",
            "type": "((status: AgentStatusState) => string)",
            "required": false,
            "description": "What a screen reader hears when the status changes, given the status. Defaults to English per status; `idle` says nothing.",
            "defaultValue": "(s: AgentStatusState) => DEFAULT_STATUS_LABELS[s]"
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Optional href — renders as <a> instead of <button>"
          },
          {
            "name": "target",
            "type": "string",
            "required": false,
            "description": "Optional target attribute for links"
          },
          {
            "name": "rel",
            "type": "string",
            "required": false,
            "description": "Optional rel attribute for links"
          },
          {
            "name": "summary",
            "type": "AiButtonSummary",
            "required": false,
            "description": "A TLDR panel the button can summon: overline, title, a pre-written\nsummary revealed through a skeleton beat and a typed stream (once per\nmount — later openings show it instantly, as if cached), and optional\nprompt chips. Hovering the button opens it after the standard hover\ndelay; the pointer keeps it alive anywhere over the button or panel,\nand it hides a grace period after leaving both. Omit for the plain\nbutton."
          },
          {
            "name": "summaryPlacement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the button the summary panel opens on.",
            "defaultValue": "top"
          },
          {
            "name": "request",
            "type": "ReactNode",
            "required": false,
            "description": "What the agent needs from the person while `status` is `waiting`: any\ncontent, drawn in a glass panel at the button. An InterruptCard approval\nis the usual filling; a question, a form or a preview work the same way.\nIt opens each time the status becomes `waiting` and stays open without\nhover. Escape or a click on the button folds it back into the button,\nwhere the waiting mark keeps showing, and another click opens it again.\nWhile it is open the summary panel never opens."
          },
          {
            "name": "requestOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the request panel is open, for a host that owns it (say, to keep it shut while the chat shows the request). Leave undefined to let the button manage it."
          },
          {
            "name": "defaultRequestOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the request panel starts open, when the button manages it. Each later move into `waiting` opens it again.",
            "defaultValue": "true"
          },
          {
            "name": "onRequestOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires when the request panel opens or closes, including when a move into `waiting` opens it."
          },
          {
            "name": "requestPlacement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the button the request panel opens on.",
            "defaultValue": "top"
          },
          {
            "name": "requestRegionLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the request panel.",
            "defaultValue": "Waiting for you"
          },
          {
            "name": "summaryPinned",
            "type": "boolean",
            "required": false,
            "description": "Holds the summary panel open regardless of hover — for callers that\nreveal it on their own signal (scroll depth, dwell). Hover mechanics\nstill run when it flips back off.",
            "defaultValue": "false"
          },
          {
            "name": "onSummaryDismiss",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the panel's dismiss button is pressed. The panel closes itself either way; hovering away and back re-summons it."
          },
          {
            "name": "onSummarySuggestion",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the tapped summary suggestion's `id`."
          },
          {
            "name": "summaryRegionLabel",
            "type": "((title: string) => string)",
            "required": false,
            "description": "Accessible name of the summary panel, given the summary's title. Defaults to \"Summary: \" followed by the title.",
            "defaultValue": "(title: string) => `Summary: ${title}`"
          },
          {
            "name": "dismissLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the summary panel's dismiss button.",
            "defaultValue": "Dismiss summary"
          },
          {
            "name": "suggestionsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the summary panel's group of prompt chips.",
            "defaultValue": "Suggested prompts"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component the link renders with, such as Next.js's `Link`, so it\nnavigates through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Alert",
    "label": "Alert",
    "slug": "alert",
    "category": "feedback",
    "description": "Contextual feedback with status variants, optional dismiss, and compact sizing.",
    "client": false,
    "importPath": "rift-ds/components/Alert/Alert",
    "barrel": "main",
    "exports": [
      {
        "component": "Alert",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Alert title text.\nNote: this shadows the native `title` tooltip attribute, which Alert does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Alert description / body text"
          },
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Alert variant determines colour and icon",
            "defaultValue": "info"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether the alert can be dismissed",
            "defaultValue": "false"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Custom icon override — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "onDismiss",
            "type": "(() => void)",
            "required": false,
            "description": "Callback when dismiss button is clicked"
          },
          {
            "name": "dismissLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the dismiss button",
            "defaultValue": "Dismiss alert"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AlertDialog",
    "label": "Alert dialog",
    "slug": "alert-dialog",
    "category": "overlays",
    "description": "Modal confirmation overlay with title, description, and confirm / cancel actions.",
    "client": true,
    "importPath": "rift-ds/components/AlertDialog/AlertDialog",
    "barrel": "main",
    "exports": [
      {
        "component": "AlertDialog",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the dialog is open"
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Callback when dialog requests to close"
          },
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Dialog title, rendered as the heading that names the dialog. Replaces the\nnative `title` tooltip attribute."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Dialog description / body text"
          },
          {
            "name": "confirmLabel",
            "type": "string",
            "required": false,
            "description": "Confirm button label",
            "defaultValue": "Confirm"
          },
          {
            "name": "cancelLabel",
            "type": "string",
            "required": false,
            "description": "Cancel button label",
            "defaultValue": "Cancel"
          },
          {
            "name": "onConfirm",
            "type": "(() => void)",
            "required": false,
            "description": "Callback when confirm is clicked"
          },
          {
            "name": "onCancel",
            "type": "(() => void)",
            "required": false,
            "description": "Callback when cancel is clicked"
          },
          {
            "name": "tone",
            "type": "\"default\" | \"destructive\"",
            "required": false,
            "description": "Colour of the dialog's icon, title and confirm action: `destructive`\nfor dangerous or irreversible actions."
          },
          {
            "name": "variant",
            "type": "\"default\" | \"destructive\"",
            "required": false,
            "description": "Legacy name for `tone`, from before colour moved onto its own prop.",
            "deprecated": "Use `tone` instead."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the overlay container (the ref and native attributes go on the panel)",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AnchorNav",
    "label": "Anchor nav",
    "slug": "anchor-nav",
    "category": "navigation",
    "description": "An on-page list of anchor links that tracks the reader's position and jumps between sections.",
    "client": true,
    "importPath": "rift-ds/components/AnchorNav/AnchorNav",
    "barrel": "main",
    "exports": [
      {
        "component": "AnchorNav",
        "props": [
          {
            "name": "items",
            "type": "AnchorNavItem[]",
            "required": true,
            "description": "The on-page sections to list, in document order"
          },
          {
            "name": "variant",
            "type": "\"list\" | \"floating\"",
            "required": false,
            "description": "Visual form: `list` renders the inline \"On this page\" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width",
            "defaultValue": "list"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Header text above the list; pass an empty string to render no header.\nNote: this shadows the native `title` tooltip attribute, which AnchorNav does not expose.",
            "defaultValue": "On this page"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon beside the header — Material Symbol name (string) or custom element (ReactNode); pass an empty string for none",
            "defaultValue": "toc"
          },
          {
            "name": "activeId",
            "type": "string",
            "required": false,
            "description": "Controlled active item id — set it to drive the highlight yourself and skip scroll tracking"
          },
          {
            "name": "onActiveChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires when the tracked (or clicked) active item changes"
          },
          {
            "name": "offset",
            "type": "number",
            "required": false,
            "description": "Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height",
            "defaultValue": "96"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AnimatedNumber",
    "label": "Animated number",
    "slug": "animated-number",
    "category": "data-display",
    "description": "A number that counts to its value: count-up on mount, eased tweens on change, tabular digits that never jitter.",
    "client": true,
    "importPath": "rift-ds/components/AnimatedNumber/AnimatedNumber",
    "barrel": "main",
    "exports": [
      {
        "component": "AnimatedNumber",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": true,
            "description": "The number to display. Changing it tweens the display from the previous value."
          },
          {
            "name": "decimals",
            "type": "number",
            "required": false,
            "description": "Decimal places shown throughout the tween and at rest. Ignored when `format` is set.",
            "defaultValue": "0"
          },
          {
            "name": "format",
            "type": "((value: number) => string)",
            "required": false,
            "description": "Formats the displayed number — currency, units, compact notation. Called\non every animation frame, so keep it pure and cheap."
          },
          {
            "name": "duration",
            "type": "number",
            "required": false,
            "description": "Tween length in ms. Defaults to the shared `MOTION_COUNT_UP_MS` constant;\nan animation pace, so the tween is skipped entirely under reduced motion.",
            "defaultValue": "800"
          },
          {
            "name": "animateOnMount",
            "type": "boolean",
            "required": false,
            "description": "Counts up from zero on first render. Turn off to arrive settled and animate only on later changes.",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AppLayout",
    "label": "App layout",
    "slug": "app-layout",
    "category": "layout",
    "description": "Full-page template pairing the collapsible App sidebar with a centred content area.",
    "client": true,
    "importPath": "rift-ds/components/AppLayout/AppLayout",
    "barrel": "main",
    "exports": [
      {
        "component": "AppLayout",
        "props": [
          {
            "name": "sections",
            "type": "AppSidebarSection[]",
            "required": true,
            "description": "Sidebar navigation sections"
          },
          {
            "name": "profile",
            "type": "AppSidebarProfile",
            "required": false,
            "description": "Sidebar profile"
          },
          {
            "name": "activeKey",
            "type": "string",
            "required": false,
            "description": "Active nav item key"
          },
          {
            "name": "activeSubKey",
            "type": "string",
            "required": false,
            "description": "Active sub-item key"
          },
          {
            "name": "activeTertiaryKey",
            "type": "string",
            "required": false,
            "description": "Active third-level item key, listed in the sidebar's side panel"
          },
          {
            "name": "subNav",
            "type": "\"accordion\" | \"panel\"",
            "required": false,
            "description": "Where sub-items show: the sidebar's accordion, or straight into its side panel (see AppSidebar)"
          },
          {
            "name": "defaultExpanded",
            "type": "boolean",
            "required": false,
            "description": "Whether sidebar starts expanded",
            "defaultValue": "true"
          },
          {
            "name": "logoText",
            "type": "string",
            "required": false,
            "description": "Logo text next to icon"
          },
          {
            "name": "logo",
            "type": "ReactNode",
            "required": false,
            "description": "Custom logo element"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "Page content — centred in the main area"
          },
          {
            "name": "theme",
            "type": "\"inherit\" | \"dark\"",
            "required": false,
            "description": "Colour scheme: 'dark' pins the layout to the dark theme (the historical\nbehaviour and the default); 'inherit' drops the pin so the layout\nfollows the surrounding data-theme like any other component.",
            "defaultValue": "dark"
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; passed on to the AppSidebar rail. Wins over a\nLinkProvider's; a plain `<a>` when neither is set."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on outer wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AppSidebar",
    "label": "App sidebar",
    "slug": "app-sidebar",
    "category": "layout",
    "description": "Collapsible navigation rail with accordion sub-items, a side panel for a third level, category headings, and a profile section.",
    "client": true,
    "importPath": "rift-ds/components/AppSidebar/AppSidebar",
    "barrel": "main",
    "exports": [
      {
        "component": "AppSidebar",
        "props": [
          {
            "name": "sections",
            "type": "AppSidebarSection[]",
            "required": true,
            "description": "Navigation sections"
          },
          {
            "name": "profile",
            "type": "AppSidebarProfile",
            "required": false,
            "description": "Profile data for the bottom section"
          },
          {
            "name": "activeKey",
            "type": "string",
            "required": false,
            "description": "Key of the currently active item"
          },
          {
            "name": "activeSubKey",
            "type": "string",
            "required": false,
            "description": "Key of the currently active sub-item"
          },
          {
            "name": "activeTertiaryKey",
            "type": "string",
            "required": false,
            "description": "Key of the currently active third-level item, listed in the side panel"
          },
          {
            "name": "subNav",
            "type": "\"accordion\" | \"panel\"",
            "required": false,
            "description": "Where an item's sub-items show. `accordion` (the default) opens them under\nthe row, and a sub-item's own children open in a side panel as level 3.\n`panel` skips the accordion: a top-level item opens its sub-items straight\ninto the side panel, with their children as the panel's accordion, and the\ncollapsed rail shows each label under its icon. On small screens both\nmodes drill in inside the drawer instead.",
            "defaultValue": "accordion"
          },
          {
            "name": "defaultPanelOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the side panel starts open when there is one to show",
            "defaultValue": "true"
          },
          {
            "name": "panelOpen",
            "type": "boolean",
            "required": false,
            "description": "Controlled open state of the side panel"
          },
          {
            "name": "onPanelOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Called when the side panel opens or collapses"
          },
          {
            "name": "defaultExpanded",
            "type": "boolean",
            "required": false,
            "description": "Whether sidebar starts expanded",
            "defaultValue": "false"
          },
          {
            "name": "expanded",
            "type": "boolean",
            "required": false,
            "description": "Controlled expanded state"
          },
          {
            "name": "onExpandedChange",
            "type": "((expanded: boolean) => void)",
            "required": false,
            "description": "Callback when expand/collapse changes"
          },
          {
            "name": "onProfileMore",
            "type": "(() => void)",
            "required": false,
            "description": "Callback when profile more button clicked"
          },
          {
            "name": "floating",
            "type": "boolean",
            "required": false,
            "description": "Floats the rail off the viewport edges as a glass card: inset with\nrounded corners, the translucent glass fill over a backdrop blur, and\nthe floating shadow. The inset defaults to 20px and is overridable via\nthe --ds-sidebar-float-inset custom property.",
            "defaultValue": "false"
          },
          {
            "name": "topSlot",
            "type": "ReactNode",
            "required": false,
            "description": "Rendered under the logo row, above the nav; fades out while collapsed"
          },
          {
            "name": "footerSlot",
            "type": "ReactNode",
            "required": false,
            "description": "Rendered above the profile block; fades out while collapsed"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          },
          {
            "name": "logo",
            "type": "ReactNode",
            "required": false,
            "description": "Logo element — defaults to the built-in brand mark"
          },
          {
            "name": "logoText",
            "type": "string",
            "required": false,
            "description": "Text shown next to logo when expanded",
            "defaultValue": "Rift"
          },
          {
            "name": "showMobileTrigger",
            "type": "boolean",
            "required": false,
            "description": "Below the mobile breakpoint the rail hides and this fixed hamburger\nbutton opens it as an overlay drawer instead. Set false when the\nhost renders its own trigger in the page chrome.",
            "defaultValue": "true"
          },
          {
            "name": "openLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the mobile hamburger trigger that opens the drawer",
            "defaultValue": "Open navigation"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the toggle when it closes the mobile drawer",
            "defaultValue": "Close navigation"
          },
          {
            "name": "expandLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the toggle (and the collapsed logo) when it expands the rail",
            "defaultValue": "Expand sidebar"
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the toggle when it collapses the rail",
            "defaultValue": "Collapse sidebar"
          },
          {
            "name": "profileMoreLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the profile block's more button",
            "defaultValue": "Profile options"
          },
          {
            "name": "menuLabel",
            "type": "string",
            "required": false,
            "description": "Back-button text in the mobile drawer's drill-in when the open level\nhas no parent row to name (a top-level item opened with `subNav=\"panel\"`)",
            "defaultValue": "Menu"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AreaChart",
    "label": "Area chart",
    "slug": "area-chart",
    "category": "charts",
    "description": "Filled area chart for showing volume over time, with stacked and single-series variants.",
    "client": true,
    "importPath": "rift-ds/components/Chart/AreaChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "AreaChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "label"
          },
          {
            "name": "series",
            "type": "AreaSeriesConfig[]",
            "required": true,
            "description": "One or more area series to render"
          },
          {
            "name": "stacked",
            "type": "boolean",
            "required": false,
            "description": "Whether areas stack on top of each other",
            "defaultValue": "false"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "showLegend",
            "type": "boolean",
            "required": false,
            "description": "Show the legend under a multi-series chart",
            "defaultValue": "true"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ArtifactCard",
    "label": "Artifact card",
    "slug": "artifact-card",
    "category": "ai",
    "description": "The tile a chat leaves in the thread for something it made, a toggle that opens the artifact in its panel.",
    "client": false,
    "importPath": "rift-ds/components/ArtifactCard/ArtifactCard",
    "barrel": "main",
    "exports": [
      {
        "component": "ArtifactCard",
        "props": [
          {
            "name": "title",
            "type": "ReactNode",
            "required": true,
            "description": "The artifact's name. Collides with the native `title` tooltip attribute on purpose: the card shows its name, it does not hide it in a tooltip."
          },
          {
            "name": "meta",
            "type": "ReactNode",
            "required": false,
            "description": "A quiet line under the name: what kind of thing this is, or which version."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "The leading mark — Material Symbol name (string) or custom element (ReactNode).",
            "defaultValue": "draft"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether this card's artifact is on stage in its panel. The card holds the on-stage fill, announces itself pressed, and its trailing cue turns from open to close.",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ArtifactPanel",
    "label": "Artifact panel",
    "slug": "artifact-panel",
    "category": "ai",
    "description": "The panel a chat opens beside the conversation to preview what it made: live content, a sandboxed page or a site, with the source a switch away.",
    "client": true,
    "importPath": "rift-ds/components/ArtifactPanel/ArtifactPanel",
    "barrel": "main",
    "exports": [
      {
        "component": "ArtifactPanel",
        "props": [
          {
            "name": "title",
            "type": "ReactNode",
            "required": true,
            "description": "The artifact's name, shown in the header and used as the panel's accessible name. Collides with the native `title` tooltip attribute on purpose: a panel has a heading, not a tooltip."
          },
          {
            "name": "meta",
            "type": "ReactNode",
            "required": false,
            "description": "A quiet line beside the name: what kind of thing this is, or which version."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading mark in the header — Material Symbol name (string) or custom element (ReactNode)."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The preview, as live React content. Wins over `html` and `src`."
          },
          {
            "name": "html",
            "type": "string",
            "required": false,
            "description": "The preview, as a complete HTML document drawn in a sandboxed frame. Wins over `src`. A document that honours `prefers-color-scheme` follows the `color-scheme` of the page around the panel, so set that with your theme and the preview turns light or dark with it."
          },
          {
            "name": "src",
            "type": "string",
            "required": false,
            "description": "The preview, as a URL drawn in a sandboxed frame: a deployed page, a site."
          },
          {
            "name": "sandbox",
            "type": "string",
            "required": false,
            "description": "The frame's `sandbox` tokens for `html` and `src`. The default lets a document run its own scripts and forms in an origin of its own, with no reach into the host page; widen it only for a source you trust.",
            "defaultValue": "allow-scripts allow-forms"
          },
          {
            "name": "frameTitle",
            "type": "string",
            "required": false,
            "description": "Accessible name for the preview frame. Defaults to the title when that is a string."
          },
          {
            "name": "code",
            "type": "string",
            "required": false,
            "description": "The artifact's source. Given, the header offers a Code view beside the preview (or shows the code alone when there is no preview)."
          },
          {
            "name": "language",
            "type": "string",
            "required": false,
            "description": "The source's language, shown on the code view."
          },
          {
            "name": "view",
            "type": "ArtifactPanelView",
            "required": false,
            "description": "The view on stage, when the host owns the state."
          },
          {
            "name": "defaultView",
            "type": "ArtifactPanelView",
            "required": false,
            "description": "The view the panel opens on when it keeps its own state."
          },
          {
            "name": "onViewChange",
            "type": "((view: ArtifactPanelView) => void)",
            "required": false,
            "description": "Fires with the chosen view."
          },
          {
            "name": "expanded",
            "type": "boolean",
            "required": false,
            "description": "Whether the host is showing the panel at its expanded size. The panel never sizes itself: this only picks the toggle's icon and name.",
            "defaultValue": "false"
          },
          {
            "name": "onExpandedChange",
            "type": "((expanded: boolean) => void)",
            "required": false,
            "description": "Fires with the next state when the expand toggle is pressed. The toggle renders only when this is given."
          },
          {
            "name": "onClose",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the close button is pressed. The button renders only when this is given."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Extra header controls, seated ahead of the expand and close buttons: a download, a share, a version menu."
          },
          {
            "name": "previewLabel",
            "type": "string",
            "required": false,
            "description": "Label for the preview segment of the view switch.",
            "defaultValue": "Preview"
          },
          {
            "name": "codeLabel",
            "type": "string",
            "required": false,
            "description": "Label for the code segment of the view switch.",
            "defaultValue": "Code"
          },
          {
            "name": "viewLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the view switch.",
            "defaultValue": "Artifact view"
          },
          {
            "name": "expandLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the expand toggle while the panel is at its resting size.",
            "defaultValue": "Expand the artifact"
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the expand toggle while the panel is expanded.",
            "defaultValue": "Collapse the artifact"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the close button.",
            "defaultValue": "Close the artifact"
          },
          {
            "name": "codeBlockLabels",
            "type": "Pick<CodeBlockProps, \"codeLabel\" | \"copyLabel\" | \"copyText\" | \"copiedLabel\">",
            "required": false,
            "description": "The words the code view's CodeBlock writes, merged over its English defaults: the copy button's name and text (\"Copy code\", \"Copy\", \"Copied\") and the code region's name (\"Code: <language>\")."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AttachmentDropZone",
    "label": "Attachment drop zone",
    "slug": "attachment-drop-zone",
    "category": "ai",
    "description": "A wrapper that makes a whole surface a file drop target, with an outlined overlay while files hover over it.",
    "client": true,
    "importPath": "rift-ds/components/Attachment/AttachmentDropZone",
    "barrel": "main",
    "exports": [
      {
        "component": "AttachmentDropZone",
        "props": [
          {
            "name": "onFilesSelected",
            "type": "((files: File[]) => void)",
            "required": false,
            "description": "Fires with the files dropped anywhere on the zone."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Stops the zone reacting to drags; its children behave as if it were not there.",
            "defaultValue": "false"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon above the overlay's headline: a Material Symbol name, or any\ncustom element. Pass `null` for none.",
            "defaultValue": "upload_file"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Headline of the overlay shown while files are dragged over the zone.",
            "defaultValue": "Drop files to attach"
          },
          {
            "name": "hint",
            "type": "string",
            "required": false,
            "description": "Second line of the overlay: what may be dropped, e.g. accepted types and limits."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The surface that accepts drops: a chat panel, a thread and its composer."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AttachmentGroup",
    "label": "Attachment group",
    "slug": "attachment-group",
    "category": "ai",
    "description": "The files on a sent message: one picture at its own shape, or a grid of tiles that collapses behind a count.",
    "client": true,
    "importPath": "rift-ds/components/Attachment/AttachmentGroup",
    "barrel": "main",
    "exports": [
      {
        "component": "AttachmentGroup",
        "props": [
          {
            "name": "items",
            "type": "AttachmentItem[]",
            "required": true,
            "description": "The files on the message, in order."
          },
          {
            "name": "align",
            "type": "\"start\" | \"end\"",
            "required": false,
            "description": "Which edge the layout hugs: `end` for the sender's own turns.",
            "defaultValue": "start"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Most cells shown before the rest collapse. Over the limit, the last\ncell becomes a \"+N\" button standing for the hidden files.",
            "defaultValue": "4"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the overflow is expanded, for controlled use. Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the overflow starts expanded, for uncontrolled use.",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires when the overflow expands or collapses."
          },
          {
            "name": "viewer",
            "type": "boolean",
            "required": false,
            "description": "Open a pressed file in the built-in AttachmentViewer, which steps\nthrough the rest of the group. Turn it off to handle presses yourself\nthrough `onItemClick`.",
            "defaultValue": "true"
          },
          {
            "name": "onItemClick",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Fires when a file is pressed, whether or not the viewer opens."
          },
          {
            "name": "renderPreview",
            "type": "((item: AttachmentItem) => ReactNode)",
            "required": false,
            "description": "Passed to the viewer: draws a file it cannot, such as the pages of a PDF."
          },
          {
            "name": "onDownload",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Passed to the viewer: fires when Download is pressed, and renders the buttons."
          },
          {
            "name": "onRetry",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Passed to the viewer: fires when \"Try again\" is pressed on a file that failed to load."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Tile size, passed to every tile.",
            "defaultValue": "default"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible label for the list.",
            "defaultValue": "Attachments"
          },
          {
            "name": "showMoreLabel",
            "type": "((hidden: number) => string)",
            "required": false,
            "description": "Builds the accessible label of the \"+N\" button from the hidden count.",
            "defaultValue": "(hidden) => `Show ${hidden} more`"
          },
          {
            "name": "showLessLabel",
            "type": "string",
            "required": false,
            "description": "Text of the collapse button under an expanded group.",
            "defaultValue": "Show fewer"
          },
          {
            "name": "attachmentTileLabels",
            "type": "Pick<AttachmentTileProps, \"uploadingLabel\" | \"errorLabel\" | \"unavailableLabel\" | \"progressLabel\">",
            "required": false,
            "description": "The status lines and progress name every tile writes, merged over the tile's English defaults (\"Uploading…\", \"Upload failed\", \"Unavailable\")."
          },
          {
            "name": "attachmentViewerLabels",
            "type": "Pick<AttachmentViewerProps, \"closeLabel\" | \"downloadLabel\" | \"previousLabel\" | \"nextLabel\" | \"retryLabel\" | \"noPreviewLabel\" | \"failedLabel\" | \"failedDescription\" | \"formatPosition\">",
            "required": false,
            "description": "The words the built-in viewer writes, merged over its English defaults: its buttons (\"Download\", \"Close\", \"Previous file\", \"Next file\", \"Try again\"), its fallback headlines and the position text (\"2 of 5\")."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AttachmentTile",
    "label": "Attachment tile",
    "slug": "attachment-tile",
    "category": "ai",
    "description": "One file as a square: a picture, a coloured mark for well-known formats, or a neutral badge, with upload states.",
    "client": false,
    "importPath": "rift-ds/components/Attachment/AttachmentTile",
    "barrel": "main",
    "exports": [
      {
        "component": "AttachmentTile",
        "props": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "File name, extension included. Truncates in the middle so the extension stays visible."
          },
          {
            "name": "kind",
            "type": "FileKind",
            "required": false,
            "description": "What kind of file it is, which picks the type mark: a coloured lettered\nglyph for the well-known formats, a neutral extension badge for the\nrest. Derive it with `getFileKind`.",
            "defaultValue": "generic"
          },
          {
            "name": "typeLabel",
            "type": "string",
            "required": false,
            "description": "Short uppercase label on the type mark. Defaults from the kind and the extension."
          },
          {
            "name": "status",
            "type": "AttachmentStatus",
            "required": false,
            "description": "Where the file is in its life. Anything but `ready` shows the name with a status line.",
            "defaultValue": "ready"
          },
          {
            "name": "progress",
            "type": "number",
            "required": false,
            "description": "Upload progress, 0 to 100, reported to assistive technology while `uploading`."
          },
          {
            "name": "previewSrc",
            "type": "string",
            "required": false,
            "description": "Image that fills the tile while `ready`: an object URL for a picture, or\na first page the host rendered for a document. A non-image kind keeps\nits type mark over the corner."
          },
          {
            "name": "previewAlt",
            "type": "string",
            "required": false,
            "description": "Alt text for the preview. Defaults to the file name."
          },
          {
            "name": "previewMark",
            "type": "boolean",
            "required": false,
            "description": "Whether the type mark sits over the corner of a preview. Defaults to on\nfor a document's first page, which still has to say what format it is,\nand off for a picture, which is its own description. A sent message\nturns it on for pictures too."
          },
          {
            "name": "excerpt",
            "type": "string",
            "required": false,
            "description": "First lines of a pasted block, drawn as a faded excerpt filling the tile while `ready`."
          },
          {
            "name": "meta",
            "type": "string",
            "required": false,
            "description": "Secondary line under the name while `ready`, e.g. \"1.2 MB\". Callers keep their own formatting."
          },
          {
            "name": "error",
            "type": "string",
            "required": false,
            "description": "Why the file failed. Replaces `errorLabel` on the status line."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Tile size. Compact shrinks the square and drops the secondary line of a\nready file. Unrelated to any native `size` attribute: the root is a div.",
            "defaultValue": "default"
          },
          {
            "name": "onClick",
            "type": "MouseEventHandler<HTMLButtonElement>",
            "required": false,
            "description": "Click handler. Its presence makes the tile body a button."
          },
          {
            "name": "onRemove",
            "type": "(() => void)",
            "required": false,
            "description": "Remove handler. Its presence renders the corner remove button."
          },
          {
            "name": "uploadingLabel",
            "type": "string",
            "required": false,
            "description": "Status line while `uploading`.",
            "defaultValue": "Uploading…"
          },
          {
            "name": "errorLabel",
            "type": "string",
            "required": false,
            "description": "Status line while `error`, when no `error` message is given.",
            "defaultValue": "Upload failed"
          },
          {
            "name": "unavailableLabel",
            "type": "string",
            "required": false,
            "description": "Status line while `unavailable`.",
            "defaultValue": "Unavailable"
          },
          {
            "name": "removeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the remove button. Defaults to \"Remove\" and the file name."
          },
          {
            "name": "progressLabel",
            "type": "((name: string) => string)",
            "required": false,
            "description": "Accessible name of the upload progress spinner while `uploading`, given the file name. Defaults to \"Uploading\" followed by the name.",
            "defaultValue": "(fileName: string) => `Uploading ${fileName}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AttachmentViewer",
    "label": "Attachment viewer",
    "slug": "attachment-viewer",
    "category": "ai",
    "description": "A preview dialog for a message's files, with download, stepping, and plain states for files it cannot show.",
    "client": true,
    "importPath": "rift-ds/components/Attachment/AttachmentViewer",
    "barrel": "main",
    "exports": [
      {
        "component": "AttachmentViewer",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the viewer is open."
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Fires when the viewer asks to close: the close button, Escape, or the backdrop."
          },
          {
            "name": "items",
            "type": "AttachmentItem[]",
            "required": true,
            "description": "The files the viewer steps through, in order."
          },
          {
            "name": "activeId",
            "type": "string",
            "required": false,
            "description": "Id of the file on show, for controlled use. Pair with `onActiveChange`."
          },
          {
            "name": "defaultActiveId",
            "type": "string",
            "required": false,
            "description": "Id of the file shown first, for uncontrolled use. Defaults to the first item."
          },
          {
            "name": "onActiveChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the id of the file stepped to."
          },
          {
            "name": "renderPreview",
            "type": "((item: AttachmentItem) => ReactNode)",
            "required": false,
            "description": "Draws a file the viewer cannot: the pages of a PDF, a media player, a\nrendered spreadsheet. Return nothing to fall back to the built-in view."
          },
          {
            "name": "onDownload",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Fires with the file on show when Download is pressed. Its presence renders the buttons."
          },
          {
            "name": "onRetry",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Fires with a file that failed to load when \"Try again\" is pressed. Its presence renders the button."
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether Escape, the backdrop and the close button dismiss the viewer.",
            "defaultValue": "true"
          },
          {
            "name": "downloadLabel",
            "type": "string",
            "required": false,
            "description": "Text of the Download buttons.",
            "defaultValue": "Download"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the close button.",
            "defaultValue": "Close"
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the previous-file button.",
            "defaultValue": "Previous file"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the next-file button.",
            "defaultValue": "Next file"
          },
          {
            "name": "retryLabel",
            "type": "string",
            "required": false,
            "description": "Text of the retry button.",
            "defaultValue": "Try again"
          },
          {
            "name": "noPreviewLabel",
            "type": "string",
            "required": false,
            "description": "Headline when a file has nothing the viewer can draw.",
            "defaultValue": "No preview for this file type"
          },
          {
            "name": "failedLabel",
            "type": "string",
            "required": false,
            "description": "Headline when a file failed to load or is no longer available.",
            "defaultValue": "Couldn’t load this file"
          },
          {
            "name": "failedDescription",
            "type": "string",
            "required": false,
            "description": "Sentence under `failedLabel`, when the file carries no error message of its own.",
            "defaultValue": "The link may have expired."
          },
          {
            "name": "formatPosition",
            "type": "((position: number, total: number) => string)",
            "required": false,
            "description": "Builds the position text, e.g. \"2 of 5\", from a one-based index and the total.",
            "defaultValue": "(position, total) => `${position} of ${total}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the portal container, not the panel.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Avatar",
    "label": "Avatar",
    "slug": "avatar",
    "category": "data-display",
    "description": "User profile image with initials and icon fallback, status indicator, and multiple sizes.",
    "client": true,
    "importPath": "rift-ds/components/Avatar/Avatar",
    "barrel": "main",
    "exports": [
      {
        "component": "Avatar",
        "props": [
          {
            "name": "src",
            "type": "string",
            "required": false,
            "description": "Image source URL"
          },
          {
            "name": "alt",
            "type": "string",
            "required": false,
            "description": "Alt text for the image, also the avatar's accessible name. A passed `aria-label` takes precedence."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "User's name — used for initials fallback"
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Avatar size",
            "defaultValue": "md"
          },
          {
            "name": "fill",
            "type": "\"neutral\" | AvatarFill",
            "required": false,
            "description": "Which of the six fills the initials sit on. Picked from the name when\nunset, so a person keeps one colour everywhere; `neutral` keeps the\nplain grey. An AvatarGroup\nsets it on its avatars so neighbours in the stack differ."
          },
          {
            "name": "status",
            "type": "\"online\" | \"away\" | \"offline\" | \"busy\"",
            "required": false,
            "description": "Online status indicator"
          },
          {
            "name": "statusLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the status dot. Defaults to the `status` value itself (e.g. \"online\")."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "AvatarGroup",
    "label": "Avatar group",
    "slug": "avatar-group",
    "category": "data-display",
    "description": "Overlapping avatar stack with a +N counter for the overflow.",
    "client": false,
    "importPath": "rift-ds/components/AvatarGroup/AvatarGroup",
    "barrel": "main",
    "exports": [
      {
        "component": "AvatarGroup",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "The avatars to stack, in display order — normally `Avatar` elements."
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Avatars shown before the rest collapse into a \"+N\" counter.",
            "defaultValue": "5"
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Size applied to every avatar in the stack and to the overflow counter.\nCloned onto the children so the group cannot render mixed sizes.",
            "defaultValue": "md"
          },
          {
            "name": "overflowLabel",
            "type": "string | ((count: number) => string)",
            "required": false,
            "description": "Accessible label for the overflow counter. Defaults to \"N more\" (for\nexample \"4 more\"), with N the number of hidden avatars. Pass a function\ngiven that count to localise or add context, e.g.\n`(count) => \\`${count} more reviewers\\``; a plain string replaces the\nlabel outright, whatever the count."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Badge",
    "label": "Badge",
    "slug": "badge",
    "category": "data-display",
    "description": "Small inline status labels with info, positive, warning, error, and neutral variants.",
    "client": false,
    "importPath": "rift-ds/components/Badge/Badge",
    "barrel": "main",
    "exports": [
      {
        "component": "Badge",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "Badge label text"
          },
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Badge variant determines colour",
            "defaultValue": "neutral"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Banner",
    "label": "Banner",
    "slug": "banner",
    "category": "feedback",
    "description": "Full-width status strip for page-level announcements, with an action slot and optional dismissal.",
    "client": false,
    "importPath": "rift-ds/components/Banner/Banner",
    "barrel": "main",
    "exports": [
      {
        "component": "Banner",
        "props": [
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Status variant determines colour and default icon",
            "defaultValue": "info"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Short leading emphasis before the body text. Deliberately shadows the native `title` attribute — a banner never needs a hover tooltip."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Banner body content — a single line of text, rendered inside the banner's paragraph"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Custom icon override — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "action",
            "type": "ReactNode",
            "required": false,
            "description": "Action slot on the trailing edge, for a compact Button or link"
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether the banner shows a dismiss button",
            "defaultValue": "false"
          },
          {
            "name": "onDismiss",
            "type": "(() => void)",
            "required": false,
            "description": "Callback when the dismiss button is clicked"
          },
          {
            "name": "dismissLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the dismiss button.",
            "defaultValue": "Dismiss banner"
          },
          {
            "name": "align",
            "type": "\"center\" | \"start\"",
            "required": false,
            "description": "Horizontal alignment of the banner content",
            "defaultValue": "start"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "BarChart",
    "label": "Bar chart",
    "slug": "bar-chart",
    "category": "charts",
    "description": "Vertical bars for comparing values across categories or time, with summary stats and tooltips.",
    "client": true,
    "importPath": "rift-ds/components/Chart/BarChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "BarChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "label"
          },
          {
            "name": "yKey",
            "type": "string",
            "required": false,
            "description": "Key in data for y-axis values",
            "defaultValue": "value"
          },
          {
            "name": "dataLabel",
            "type": "string",
            "required": false,
            "description": "Display name for the data series (shown in tooltip)",
            "defaultValue": "Value"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "barColor",
            "type": "string",
            "required": false,
            "description": "Bar fill colour — CSS value or token reference"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "BentoTile",
    "label": "Bento tile",
    "slug": "bento-tile",
    "category": "data-display",
    "description": "A feature tile for a bento grid, with a safe content area, a shader pair, solid or transparent background, and an overlay it opens into.",
    "client": true,
    "importPath": "rift-ds/components/BentoTile/BentoTile",
    "barrel": "main",
    "exports": [
      {
        "component": "BentoTile",
        "props": [
          {
            "name": "title",
            "type": "ReactNode",
            "required": true,
            "description": "The tile's heading, also the overlay's title.\nNote: this shadows the native `title` tooltip attribute, which BentoTile does not expose."
          },
          {
            "name": "description",
            "type": "ReactNode",
            "required": false,
            "description": "A line under the heading."
          },
          {
            "name": "headingLevel",
            "type": "2 | 4 | 3 | 5 | 6",
            "required": false,
            "description": "The heading level the title renders at, to fit the page's outline. Never `1`: a tile is never the page's top heading.",
            "defaultValue": "3"
          },
          {
            "name": "background",
            "type": "\"solid\" | \"shader\" | \"transparent\"",
            "required": false,
            "description": "What sits behind the content: the container surface with a shader pair\nover it (a wash of light in the bottom-left corner with a line texture\nlaid over it, the default), the plain surface, or nothing.",
            "defaultValue": "shader"
          },
          {
            "name": "highlight",
            "type": "1 | 2 | 4 | 3 | 5 | 6",
            "required": false,
            "description": "Which of the six shader pairs the tile wears: pair N is ambient colour N\nwith texture N. Unset, tiles rotate through the set by their position\namong their siblings, so a grid of shader tiles comes out told apart."
          },
          {
            "name": "align",
            "type": "\"center\" | \"start\" | \"end\"",
            "required": false,
            "description": "Where the content sits in the space under the heading. Content that does not fit fades out at the edge it overflows.",
            "defaultValue": "center"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The tile's content. Inert while the tile is expandable, since the whole tile is then the control."
          },
          {
            "name": "expandedContent",
            "type": "ReactNode",
            "required": false,
            "description": "What the overlay shows under the title. Passing it makes the tile expandable."
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the overlay is open (controlled)."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the overlay starts open (uncontrolled).",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Called when the overlay opens or closes."
          },
          {
            "name": "expandLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the expand control. Defaults to \"Open\" and the title, when the title is a string."
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the overlay's close control.",
            "defaultValue": "Close"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the tile.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "BentoTileArt",
    "label": "Bento tile art",
    "slug": "bento-tile-art",
    "category": "effects",
    "description": "The texture half of a bento tile's shader pair: six fine patterns in one vocabulary, fading in from a corner.",
    "client": false,
    "importPath": "rift-ds/components/BentoTile/BentoTileArt",
    "barrel": "main",
    "exports": [
      {
        "component": "BentoTileArt",
        "props": [
          {
            "name": "pattern",
            "type": "BentoTileArtPattern",
            "required": false,
            "description": "Which pattern to draw. Unset, it follows its tile's shader pair (pinned by `highlight`, or by position); outside a tile it draws `dots`."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the layer.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "BottomNav",
    "label": "Bottom nav",
    "slug": "bottom-nav",
    "category": "navigation",
    "description": "Mobile tab bar for three to five destinations, in the Rift style or as iOS Liquid Glass or Material 3 Expressive.",
    "client": true,
    "importPath": "rift-ds/components/BottomNav/BottomNav",
    "barrel": "main",
    "exports": [
      {
        "component": "BottomNav",
        "props": [
          {
            "name": "items",
            "type": "BottomNavItem[]",
            "required": true,
            "description": "Destinations, three to five of them"
          },
          {
            "name": "activeKey",
            "type": "string",
            "required": false,
            "description": "Key of the destination for the current page"
          },
          {
            "name": "onValueChange",
            "type": "((key: string) => void)",
            "required": false,
            "description": "Called with a destination's key when it is pressed"
          },
          {
            "name": "platform",
            "type": "\"default\" | \"ios\" | \"android\"",
            "required": false,
            "description": "Which platform's tab bar to draw. `default` is the Rift bar; `ios` is the\niOS 26 Liquid Glass capsule floating over content with a sliding lens\nbehind the selection; `android` is the Material 3 Expressive navigation\nbar with a pill indicator behind the selected icon.",
            "defaultValue": "default"
          },
          {
            "name": "search",
            "type": "BottomNavSearch",
            "required": false,
            "description": "A destination set apart from the rest, search unless its `icon` says\notherwise. On iOS it is its own glass circle beside the bar; elsewhere it\njoins the bar as the last destination."
          },
          {
            "name": "minimized",
            "type": "boolean",
            "required": false,
            "description": "iOS only: shrinks the bar to the selected destination alone, the way the\nsystem bar minimises while the page scrolls down. Ignored on other platforms.",
            "defaultValue": "false"
          },
          {
            "name": "fixed",
            "type": "boolean",
            "required": false,
            "description": "Pins the bar to the bottom of the viewport, above the home-indicator safe area",
            "defaultValue": "false"
          },
          {
            "name": "aria-label",
            "type": "string",
            "required": false,
            "description": "Accessible name of the navigation landmark. Defaults to \"Tabs\", distinct\nfrom Nav's \"Main\", so a screen carrying both announces two different navs",
            "defaultValue": "Tabs"
          },
          {
            "name": "badgeLabel",
            "type": "((badge: string | number | true) => string)",
            "required": false,
            "description": "Visually hidden text read after a destination's label when it carries a\nbadge, given the item's `badge`. Defaults to \", new\" for a dot (`true`)\nand \", 3 new\" for a count; the leading comma and space are part of the text.",
            "defaultValue": "(badge: number | string | true) =>\n  badge === true ? ', new' : `, ${badge} new`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Breadcrumb",
    "label": "Breadcrumb",
    "slug": "breadcrumb",
    "category": "navigation",
    "description": "Hierarchical navigation trail showing the user's location within the site.",
    "client": false,
    "importPath": "rift-ds/components/Breadcrumb/Breadcrumb",
    "barrel": "main",
    "exports": [
      {
        "component": "Breadcrumb",
        "props": [
          {
            "name": "items",
            "type": "BreadcrumbItem[]",
            "required": true,
            "description": "Ordered list of breadcrumb items"
          },
          {
            "name": "maxItems",
            "type": "number",
            "required": false,
            "description": "Maximum visible items before collapsing (min 2: first + last)"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the nav landmark.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; a plain `<a>` when unset. This\ncomponent can render on the server, so it never reads a LinkProvider:\npass the prop even under one."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Button",
    "label": "Button",
    "slug": "button",
    "category": "actions",
    "description": "Primary, secondary and tertiary emphasis, each in a default, neutral or destructive tone, with icons, loading, and default and compact sizes.",
    "client": true,
    "importPath": "rift-ds/components/Button/Button",
    "barrel": "main",
    "exports": [
      {
        "component": "Button",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Button text content. When it is absent, plain-text `children` stand in\nfor it (with a development warning), and failing both the button reads\n\"Button\".",
            "defaultValue": "'Button'"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Plain text to use as the label when `label` is absent. Anything richer than text is ignored; prefer `label`."
          },
          {
            "name": "iconLeft",
            "type": "ReactNode",
            "required": false,
            "description": "Icon for left side — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "iconRight",
            "type": "ReactNode",
            "required": false,
            "description": "Icon for right side — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "variant",
            "type": "\"neutral\" | \"destructive\" | \"primary\" | \"secondary\" | \"tertiary\"",
            "required": false,
            "description": "Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary`\n(ghost). The colour is `tone`'s job. `neutral` and `destructive` are\nlegacy values from before the split: `neutral` renders as\n`variant=\"primary\" tone=\"neutral\"` and `destructive` as\n`variant=\"secondary\" tone=\"destructive\"`."
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\" | \"destructive\"",
            "required": false,
            "description": "Colour, independent of emphasis. `default` carries the action colour,\n`neutral` the greys, `destructive` the danger colour. Tertiary is\nalready grey, so `neutral` leaves it unchanged; a tertiary\n`destructive` takes the outlined look, since a danger action needs a\nvisible edge."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Button size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the button is disabled"
          },
          {
            "name": "loading",
            "type": "boolean",
            "required": false,
            "description": "Shows a spinner in the left icon slot and blocks interaction while an\nasync action runs. Keeps the variant's full-colour appearance (unlike\n`disabled`) and sets `aria-busy` on the rendered element."
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Optional href — renders as <a> instead of <button>"
          },
          {
            "name": "target",
            "type": "string",
            "required": false,
            "description": "Optional target attribute for links"
          },
          {
            "name": "rel",
            "type": "string",
            "required": false,
            "description": "Optional rel attribute for links"
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component the link renders with, such as Next.js's `Link`, so it\nnavigates through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          },
          {
            "name": "ariaCurrent",
            "type": "boolean",
            "required": false,
            "description": "Marks this link as the current page (adds aria-current=\"page\")"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "priority",
            "type": "\"destructive\" | \"primary\" | \"secondary\" | \"tertiary\"",
            "required": false,
            "description": "Legacy alias for `variant`.",
            "deprecated": "Use `variant` instead."
          },
          {
            "name": "state",
            "type": "\"active\" | \"default\" | \"disabled\" | \"hover\"",
            "required": false,
            "description": "Documentation-only interaction state.",
            "deprecated": "Use `disabled` for the disabled state.\n\nDocumentation-only affordance for rendering a *static* interaction state in\nStorybook and the showcase site. Real hover/active styling comes from CSS\npseudo-classes and needs no prop — for docs, prefer `className=\"ds-button--hover\"`."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Legacy alias for `iconLeft` — Material Symbol name (string) or custom element (ReactNode).",
            "deprecated": "Use `iconLeft` instead."
          },
          {
            "name": "text",
            "type": "boolean",
            "required": false,
            "description": "Legacy toggle for showing the text label.",
            "defaultValue": "true",
            "deprecated": "Will be removed once `label` loses its default in the next major;\nan icon-only button will simply omit `label`."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ButtonGroup",
    "label": "Button group",
    "slug": "button-group",
    "category": "actions",
    "description": "Horizontal and vertical button group layouts for related actions and navigation patterns.",
    "client": false,
    "importPath": "rift-ds/components/ButtonGroup/ButtonGroup",
    "barrel": "main",
    "exports": [
      {
        "component": "ButtonGroup",
        "props": [
          {
            "name": "orientation",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Orientation of the button group",
            "defaultValue": "horizontal"
          },
          {
            "name": "buttons",
            "type": "ButtonProps[]",
            "required": true,
            "description": "Array of button configurations"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the group.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS class",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Card",
    "label": "Card",
    "slug": "card",
    "category": "data-display",
    "description": "A titled preview tile for index grids, with a case-study variant carrying a cover, company logo and dek.",
    "client": true,
    "importPath": "rift-ds/components/Card/Card",
    "barrel": "main",
    "exports": [
      {
        "component": "Card",
        "props": [
          {
            "name": "variant",
            "type": "\"default\" | \"case-study\"",
            "required": false,
            "description": "Card variant",
            "defaultValue": "default"
          },
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Card title displayed below the preview.\nNote: this shadows the native `title` tooltip attribute, which Card does not expose."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Preview content rendered inside the card (default variant only)"
          },
          {
            "name": "interactive",
            "type": "boolean",
            "required": false,
            "description": "Whether the card is interactive (hoverable)",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Navigation href — renders the card as an <a> tag"
          },
          {
            "name": "coverSrc",
            "type": "string",
            "required": false,
            "description": "Cover image src"
          },
          {
            "name": "cover",
            "type": "ReactNode",
            "required": false,
            "description": "Cover content rendered in place of the image — for a cover that is drawn\nrather than photographed (an SVG, a chart, a live preview). Takes\nprecedence over `coverSrc`, and fills the same fixed-ratio slot."
          },
          {
            "name": "coverAlt",
            "type": "string",
            "required": false,
            "description": "Cover image alt text"
          },
          {
            "name": "companyLogo",
            "type": "string",
            "required": false,
            "description": "Path to the company logo shown in the eyebrow"
          },
          {
            "name": "companyName",
            "type": "string",
            "required": false,
            "description": "Company name shown in the eyebrow"
          },
          {
            "name": "dek",
            "type": "string",
            "required": false,
            "description": "Subtitle / dek line below the title"
          },
          {
            "name": "placeholder",
            "type": "boolean",
            "required": false,
            "description": "Render as a disabled placeholder (no href, dimmed, not interactive)",
            "defaultValue": "false"
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component the link renders with, such as Next.js's `Link`, so it\nnavigates through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CardStack",
    "label": "Card stack",
    "slug": "card-stack",
    "category": "data-display",
    "description": "A deck of cards showing one at a time, flipped through with a lift-and-settle animation.",
    "client": true,
    "importPath": "rift-ds/components/CardStack/CardStack",
    "barrel": "main",
    "exports": [
      {
        "component": "CardStack",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The cards, in order. The first child starts on top."
          },
          {
            "name": "index",
            "type": "number",
            "required": false,
            "description": "Controlled top card, as an index into `children`. Pair with\n`onIndexChange`. Omit to let the stack own its position."
          },
          {
            "name": "defaultIndex",
            "type": "number",
            "required": false,
            "description": "Initial top card when uncontrolled.",
            "defaultValue": "0"
          },
          {
            "name": "onIndexChange",
            "type": "((index: number) => void)",
            "required": false,
            "description": "Fires when the top card changes, with the new index."
          },
          {
            "name": "peek",
            "type": "number",
            "required": false,
            "description": "How many card edges peek out behind the top card.",
            "defaultValue": "2"
          },
          {
            "name": "loop",
            "type": "boolean",
            "required": false,
            "description": "Wrap from the last card back to the first. Off, the stack stops at both ends.",
            "defaultValue": "true"
          },
          {
            "name": "advanceOnClick",
            "type": "boolean",
            "required": false,
            "description": "Clicking the top card flips to the next. Clicks that land on a link or\ncontrol inside the card are left alone, so a card can still carry its\nown actions.",
            "defaultValue": "true"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the stack, e.g. \"Open roles\"."
          },
          {
            "name": "positionLabel",
            "type": "((position: number, count: number) => string)",
            "required": false,
            "description": "Visually hidden status announcing the top card's place in the deck, given\nits 1-based position and the card count. Defaults to \"Card 2 of 5\".",
            "defaultValue": "(position: number, total: number) => `Card ${position} of ${total}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Carousel",
    "label": "Carousel",
    "slug": "carousel",
    "category": "data-display",
    "description": "Sliding content viewer with navigation arrows, dot indicators, auto-play, and keyboard support.",
    "client": true,
    "importPath": "rift-ds/components/Carousel/Carousel",
    "barrel": "main",
    "exports": [
      {
        "component": "Carousel",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Carousel slides"
          },
          {
            "name": "showDots",
            "type": "boolean",
            "required": false,
            "description": "Show dot indicators",
            "defaultValue": "true"
          },
          {
            "name": "showArrows",
            "type": "boolean",
            "required": false,
            "description": "Show previous/next navigation arrows",
            "defaultValue": "true"
          },
          {
            "name": "autoPlay",
            "type": "boolean",
            "required": false,
            "description": "Auto-play slides",
            "defaultValue": "false"
          },
          {
            "name": "autoPlayInterval",
            "type": "number",
            "required": false,
            "description": "Auto-play interval in milliseconds",
            "defaultValue": "5000"
          },
          {
            "name": "loop",
            "type": "boolean",
            "required": false,
            "description": "Whether navigation should loop",
            "defaultValue": "false"
          },
          {
            "name": "slide",
            "type": "number",
            "required": false,
            "description": "Index of the active slide (zero-based), for a controlled carousel. Leave\nit undefined to let the component keep its own position, seeded from\n`defaultSlide`."
          },
          {
            "name": "defaultSlide",
            "type": "number",
            "required": false,
            "description": "Index of the slide shown on first render when the carousel is uncontrolled (zero-based)",
            "defaultValue": "0"
          },
          {
            "name": "onSlideChange",
            "type": "((index: number) => void)",
            "required": false,
            "description": "Called with the index of the slide being moved to"
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the previous-slide arrow",
            "defaultValue": "Previous slide"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the next-slide arrow",
            "defaultValue": "Next slide"
          },
          {
            "name": "slideLabel",
            "type": "((position: number, count: number) => string)",
            "required": false,
            "description": "Accessible name of each slide, given its 1-based position and the slide count",
            "defaultValue": "(position: number, count: number) => `Slide ${position} of ${count}`"
          },
          {
            "name": "slideRoleDescription",
            "type": "string",
            "required": false,
            "description": "Role description announced for each slide",
            "defaultValue": "slide"
          },
          {
            "name": "dotsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the dot indicators' tab list",
            "defaultValue": "Slide indicators"
          },
          {
            "name": "dotLabel",
            "type": "((position: number) => string)",
            "required": false,
            "description": "Accessible name of each dot indicator, given its slide's 1-based position",
            "defaultValue": "(position: number) => `Go to slide ${position}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ChatHeader",
    "label": "Chat header",
    "slug": "chat-header",
    "category": "ai",
    "description": "The top row of a chat surface, with the conversation title and its controls.",
    "client": false,
    "importPath": "rift-ds/components/ChatHeader/ChatHeader",
    "barrel": "main",
    "exports": [
      {
        "component": "ChatHeader",
        "props": [
          {
            "name": "title",
            "type": "ReactNode",
            "required": false,
            "description": "The chat or assistant name. Deliberately shadows the native `title`\ntooltip attribute — a header's title is content, not a tooltip. Pass a\nstring for the default treatment, or your own heading element."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing controls: a new-chat CircularButton, a view switcher, a close\nbutton. The slot only lays them out — each control owns its behaviour."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ChatMarker",
    "label": "Chat marker",
    "slug": "chat-marker",
    "category": "ai",
    "description": "An inline conversation separator for date breaks and system notes.",
    "client": false,
    "importPath": "rift-ds/components/ChatMarker/ChatMarker",
    "barrel": "main",
    "exports": [
      {
        "component": "ChatMarker",
        "props": [
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — a Material Symbol name, or any custom element."
          },
          {
            "name": "line",
            "type": "boolean",
            "required": false,
            "description": "Draw the flanking divider lines. Turn off for a bare centred note.",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The marker text, e.g. \"Today\" or \"Chat renamed\"."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ChatMessage",
    "label": "Chat message",
    "slug": "chat-message",
    "category": "ai",
    "description": "A single chat turn with avatar, author, timestamp, and bubble or plain content aligned by role.",
    "client": false,
    "importPath": "rift-ds/components/ChatMessage/ChatMessage",
    "barrel": "main",
    "exports": [
      {
        "component": "ChatMessage",
        "props": [
          {
            "name": "role",
            "type": "\"user\" | \"assistant\"",
            "required": false,
            "description": "Which side of the conversation this turn belongs to. Drives alignment\nand the default surface: user turns are right-aligned bubbles,\nassistant turns are surface-less full-width text. Shadows the ARIA\nrole attribute; the root renders no ARIA role.",
            "defaultValue": "assistant"
          },
          {
            "name": "avatar",
            "type": "ReactNode",
            "required": false,
            "description": "Avatar slot, e.g. an `<Avatar>`. Omit for no gutter at all."
          },
          {
            "name": "showAvatar",
            "type": "boolean",
            "required": false,
            "description": "Show the passed avatar. When false the avatar is hidden but its gutter\nspace is kept, so consecutive rows in a run stay aligned.",
            "defaultValue": "true"
          },
          {
            "name": "author",
            "type": "string",
            "required": false,
            "description": "Display name shown above the content."
          },
          {
            "name": "timestamp",
            "type": "string",
            "required": false,
            "description": "Time shown beside the author, e.g. \"2:41 PM\". Free text, so callers keep their own formatting."
          },
          {
            "name": "grouped",
            "type": "boolean",
            "required": false,
            "description": "Consecutive-message mode: hides the avatar (keeping its gutter), drops\nthe author and timestamp, and tightens the spacing to the row above.",
            "defaultValue": "false"
          },
          {
            "name": "bubble",
            "type": "boolean",
            "required": false,
            "description": "Override the role's default surface. Explicit true on an assistant turn\nrenders a received bubble; explicit false on a user turn renders plain text."
          },
          {
            "name": "tail",
            "type": "boolean",
            "required": false,
            "description": "Square the speaker-side bottom corner of the bubble — bottom-right on a\nsent bubble, bottom-left on a received one. Only meaningful when a\nbubble renders.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Compact drops the type one size step and tightens the bubble padding.",
            "defaultValue": "default"
          },
          {
            "name": "pending",
            "type": "boolean",
            "required": false,
            "description": "Waiting for the first content: renders a three-dot pulse in place of children.",
            "defaultValue": "false"
          },
          {
            "name": "pendingLabel",
            "type": "string",
            "required": false,
            "description": "Accessible text announced for the pending state.",
            "defaultValue": "Waiting for a reply"
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Action row under the content, revealed on hover and keyboard focus (always visible on touch) — `showActions` pins it on."
          },
          {
            "name": "showActions",
            "type": "boolean",
            "required": false,
            "description": "Always show the action row instead of revealing it on hover and focus.\nFor surfaces where the actions are part of the response — a copy or\nfeedback row — rather than a secondary affordance.",
            "defaultValue": "false"
          },
          {
            "name": "attachments",
            "type": "ReactNode",
            "required": false,
            "description": "Files sent with this turn, drawn outside the bubble on the speaker's\nside, above the text. Pass an AttachmentGroup. A turn that carries\nfiles and no text draws no bubble at all."
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "required": false,
            "description": "Footer slot under the content — a sources row, an edited note."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The message content. The package ships no markdown renderer; render\nmarkdown yourself, ideally wrapped in Prose, and pass the result."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ChatThread",
    "label": "Chat thread",
    "slug": "chat-thread",
    "category": "ai",
    "description": "A scrollable conversation column with edge fades, send anchoring, and a subtle scrollbar.",
    "client": true,
    "importPath": "rift-ds/components/ChatThread/ChatThread",
    "barrel": "main",
    "exports": [
      {
        "component": "ChatThread",
        "props": [
          {
            "name": "anchor",
            "type": "boolean",
            "required": false,
            "description": "Scroll a newly appended turn to the top of the viewport, pushing the\nprior conversation upward. When a user turn and the agent's pending\nturn are appended in the same update, the first new child is the one\nanchored — the response streams in below it. Detection diffs the DOM\nchild count, so replacing turns in place (a future regenerate or\nedit-last-turn) neither re-anchors nor resizes the spacer.",
            "defaultValue": "true"
          },
          {
            "name": "flow",
            "type": "\"top-down\" | \"bottom-up\"",
            "required": false,
            "description": "Which way the conversation reads. `top-down` (the default) is the send\nchoreography above: each new turn floats to the top of the viewport and\nthe answer streams in below it. `bottom-up` is the classic message\nthread: turns stack from the bottom edge, the newest always just above\nthe composer, and the view follows a streaming answer down for as long\nas the reader stays at the bottom. Scrolling up to reread lets go;\nreturning to the bottom, or the next send, takes hold again.",
            "defaultValue": "top-down"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the scrollable conversation region.",
            "defaultValue": "Conversation"
          },
          {
            "name": "jumpLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the scroll-to-bottom control.",
            "defaultValue": "Scroll to the latest message"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The conversation, in order: ChatMessages, ChatMarkers."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Checkbox",
    "label": "Checkbox",
    "slug": "checkbox",
    "category": "forms",
    "description": "Custom checkbox with check and indeterminate states, keyboard accessible with animated transitions.",
    "client": true,
    "importPath": "rift-ds/components/Checkbox/Checkbox",
    "barrel": "main",
    "exports": [
      {
        "component": "Checkbox",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered under the label text"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the checkbox invalid",
            "defaultValue": "false"
          },
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the checkbox is checked, controlled. Leave undefined to let the\ncheckbox keep its own state, seeded from `defaultChecked`."
          },
          {
            "name": "defaultChecked",
            "type": "boolean",
            "required": false,
            "description": "Whether the checkbox starts checked when uncontrolled (`checked` undefined).",
            "defaultValue": "false"
          },
          {
            "name": "indeterminate",
            "type": "boolean",
            "required": false,
            "description": "Whether the checkbox is in an indeterminate state",
            "defaultValue": "false"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the checkbox is disabled",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "onCheckedChange",
            "type": "((checked: boolean) => void)",
            "required": false,
            "description": "Called with the next checked state when toggled"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((checked: boolean) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onCheckedChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Legacy form-field name.",
            "deprecated": "No-op. This component renders a `<div role=\"checkbox\">`, not a\nnative `<input>`, so it cannot participate in native form submission.\nDeclared only so the attribute is not forwarded to an element that rejects it."
          }
        ]
      },
      {
        "component": "CheckboxGroup",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Group label"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered below the group"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the group invalid",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Marks the group required and renders the required marker on its label",
            "defaultValue": "false"
          },
          {
            "name": "items",
            "type": "{ label: string; value: string; disabled?: boolean | undefined; }[]",
            "required": true,
            "description": "Checkbox options"
          },
          {
            "name": "values",
            "type": "string[]",
            "required": false,
            "description": "Currently selected values, controlled. Leave undefined to let the group\nkeep its own selection, seeded from `defaultValues`."
          },
          {
            "name": "defaultValues",
            "type": "string[]",
            "required": false,
            "description": "Selected values on first render when uncontrolled (`values` undefined).",
            "defaultValue": "[]"
          },
          {
            "name": "direction",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Layout direction",
            "defaultValue": "vertical"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "onValuesChange",
            "type": "((values: string[]) => void)",
            "required": false,
            "description": "Called with the next selected values"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((values: string[]) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValuesChange` instead."
          }
        ]
      },
      {
        "component": "CheckboxIndicator",
        "props": [
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the box shows its check.",
            "defaultValue": "false"
          },
          {
            "name": "indeterminate",
            "type": "boolean",
            "required": false,
            "description": "Whether the box shows the minus of an indeterminate state (ignored when `checked`).",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Box size: `default` is 24px, `compact` 20px.",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "CheckIcon",
        "props": [
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes; the default is the checkbox icon's, which sizes and colours it.",
            "defaultValue": "ds-checkbox__icon"
          }
        ]
      },
      {
        "component": "MinusIcon",
        "props": [
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes; the default is the checkbox icon's, which sizes and colours it.",
            "defaultValue": "ds-checkbox__icon"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Chip",
    "label": "Chip",
    "slug": "chip",
    "category": "data-display",
    "description": "Compact pills for attributes, filters, and inline metadata.",
    "client": false,
    "importPath": "rift-ds/components/Chip/Chip",
    "barrel": "main",
    "exports": [
      {
        "component": "Chip",
        "props": [
          {
            "name": "label",
            "type": "ReactNode",
            "required": true,
            "description": "Chip label — string for plain text, ReactNode for richer content (e.g. a numbered prefix)"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "selected",
            "type": "boolean",
            "required": false,
            "description": "Selected state (filter-style chips): renders the active fill, coloured by `tone`"
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\"",
            "required": false,
            "description": "Colour of the selected fill: `default` takes the action colour, `neutral`\nfills it grey, for filter rows whose selection should read quietly.",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Disabled state",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\" | \"large\"",
            "required": false,
            "description": "Chip size — `large` matches the default Button and paragraph body scale, for pills that are a primary tap target rather than metadata",
            "defaultValue": "default"
          },
          {
            "name": "onClick",
            "type": "MouseEventHandler<HTMLButtonElement>",
            "required": false,
            "description": "Click handler — presence makes the chip an interactive <button>. On a\nremovable chip it is attached to the main region's button rather than\nthe root span."
          },
          {
            "name": "onRemove",
            "type": "(() => void)",
            "required": false,
            "description": "Remove handler — renders a trailing close button (input-style chips)"
          },
          {
            "name": "removeLabel",
            "type": "string | ((label: string) => string)",
            "required": false,
            "description": "Accessible label for the remove button. Defaults to \"Remove\". Pass a\nfunction to name each chip's button after its own label, so a row of\nchips does not announce one name for every button: it is given the\nlabel's text (a rich label's text content), e.g.\n`(label) => \\`Remove ${label}\\``. A plain string is used as given.",
            "defaultValue": "Remove"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CircularButton",
    "label": "Circular button",
    "slug": "circular-button",
    "category": "actions",
    "description": "Round icon button in primary, secondary and tertiary emphasis and a default, neutral or destructive tone, in default and compact sizes.",
    "client": false,
    "importPath": "rift-ds/components/CircularButton/CircularButton",
    "barrel": "main",
    "exports": [
      {
        "component": "CircularButton",
        "props": [
          {
            "name": "icon",
            "type": "ReactNode",
            "required": true,
            "description": "The icon — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "variant",
            "type": "\"neutral\" | \"primary\" | \"secondary\" | \"tertiary\"",
            "required": false,
            "description": "Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary`\n(ghost). The colour is `tone`'s job. `neutral` is the legacy value from\nbefore the split and renders as `variant=\"primary\" tone=\"neutral\"`."
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\" | \"destructive\"",
            "required": false,
            "description": "Colour, independent of emphasis: `default` carries the action colour,\n`neutral` the greys, `destructive` the danger colour. Tertiary is\nalready grey, so `neutral` leaves it unchanged; a tertiary\n`destructive` takes the outlined look, since a danger action needs a\nvisible edge."
          },
          {
            "name": "priority",
            "type": "\"primary\" | \"secondary\" | \"tertiary\"",
            "required": false,
            "description": "Legacy alias for `variant`.",
            "deprecated": "Use `variant` instead."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the button is disabled"
          },
          {
            "name": "state",
            "type": "\"active\" | \"default\" | \"disabled\" | \"hover\"",
            "required": false,
            "description": "Documentation-only interaction state.",
            "deprecated": "Use `disabled` for the disabled state.\n\nDocumentation-only affordance for rendering a *static* interaction state in\nStorybook and the showcase site. Real hover/active styling comes from CSS\npseudo-classes and needs no prop — for docs, prefer\n`className=\"ds-circular-button--hover\"`."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Button size",
            "defaultValue": "default"
          },
          {
            "name": "loading",
            "type": "boolean",
            "required": false,
            "description": "Shows a spinner in place of the icon and blocks interaction while an\nasync action runs. Keeps the variant's full-colour appearance (unlike\nthe disabled state) and sets `aria-busy` on the rendered element."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": true,
            "description": "Accessible label — required, because the button has no visible text"
          },
          {
            "name": "tooltip",
            "type": "string | false",
            "required": false,
            "description": "The hover/focus tooltip. An icon-only control names itself: by default\nthe button wears a Tooltip carrying `ariaLabel`. Pass a string to show\ndifferent wording, or `false` to opt out — for a host that labels the\ncontrol another way, or one that owns the button's box directly\n(SplitButton's trigger stretches to its sibling segment, which the\ntooltip wrapper would block)."
          },
          {
            "name": "tooltipPosition",
            "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
            "required": false,
            "description": "Which side the tooltip opens on.",
            "defaultValue": "top"
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Optional href — renders as <a> instead of <button>"
          },
          {
            "name": "target",
            "type": "string",
            "required": false,
            "description": "Optional target attribute for links"
          },
          {
            "name": "rel",
            "type": "string",
            "required": false,
            "description": "Optional rel attribute for links"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component the link renders with, such as Next.js's `Link`, so it\nnavigates through the app's router; a plain `<a>` when unset. This\ncomponent can render on the server, so it never reads a LinkProvider:\npass the prop even under one."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CodeBlock",
    "label": "Code block",
    "slug": "code-block",
    "category": "data-display",
    "description": "Monospace code with a header and one-click copy.",
    "client": true,
    "importPath": "rift-ds/components/CodeBlock/CodeBlock",
    "barrel": "main",
    "exports": [
      {
        "component": "CodeBlock",
        "props": [
          {
            "name": "code",
            "type": "string",
            "required": true,
            "description": "The code to display, as a plain string"
          },
          {
            "name": "language",
            "type": "string",
            "required": false,
            "description": "Language tag shown in the header, e.g. \"tsx\", \"css\""
          },
          {
            "name": "filename",
            "type": "string",
            "required": false,
            "description": "Filename shown in the header, e.g. \"tokens-light.css\""
          },
          {
            "name": "showCopy",
            "type": "boolean",
            "required": false,
            "description": "Show the copy-to-clipboard button",
            "defaultValue": "true"
          },
          {
            "name": "onCopied",
            "type": "(() => void)",
            "required": false,
            "description": "Called after the code is put on the clipboard, through the async API or its textarea fallback, so a host can count copies."
          },
          {
            "name": "maxHeight",
            "type": "string | number",
            "required": false,
            "description": "Max height of the block; code scrolls vertically inside while the header stays pinned. Numbers are px."
          },
          {
            "name": "collapsible",
            "type": "boolean",
            "required": false,
            "description": "Show a chevron beside the filename that collapses/expands the code area",
            "defaultValue": "false"
          },
          {
            "name": "defaultCollapsed",
            "type": "boolean",
            "required": false,
            "description": "Start collapsed (only applies when collapsible)",
            "defaultValue": "false"
          },
          {
            "name": "copyLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the copy button before it is pressed",
            "defaultValue": "Copy code"
          },
          {
            "name": "copyText",
            "type": "string",
            "required": false,
            "description": "Visible text on the copy button before it is pressed",
            "defaultValue": "Copy"
          },
          {
            "name": "copiedLabel",
            "type": "string",
            "required": false,
            "description": "Text and accessible name the copy button shows once the code is copied",
            "defaultValue": "Copied"
          },
          {
            "name": "expandLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the collapse toggle while the code is collapsed",
            "defaultValue": "Expand code"
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the collapse toggle while the code is showing",
            "defaultValue": "Collapse code"
          },
          {
            "name": "codeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the scrollable code region. Defaults to\n\"Code: <filename>\", then \"Code: <language>\", then \"Code\"."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CodeDiff",
    "label": "Code diff",
    "slug": "code-diff",
    "category": "ai",
    "description": "Unified diff view for code changes, with added, removed, and context lines.",
    "client": false,
    "importPath": "rift-ds/components/CodeDiff/CodeDiff",
    "barrel": "main",
    "exports": [
      {
        "component": "CodeDiff",
        "props": [
          {
            "name": "diff",
            "type": "string",
            "required": true,
            "description": "A unified-format diff body. Lines starting with `+` render as additions,\n`-` as removals, `@@ …"
          },
          {
            "name": "filename",
            "type": "string",
            "required": false,
            "description": "Filename shown in a header bar above the diff, with an additions/deletions summary"
          },
          {
            "name": "showLineNumbers",
            "type": "boolean",
            "required": false,
            "description": "Show the old and new line number gutters",
            "defaultValue": "true"
          },
          {
            "name": "diffLabel",
            "type": "((filename?: string) => string)",
            "required": false,
            "description": "Accessible name for the scrolling diff region, given the `filename` when\nthere is one. Defaults to \"Code diff: <filename>\", or \"Code diff\" without one.",
            "defaultValue": "(filename: string | undefined) =>\n  filename ? `Code diff: ${filename}` : 'Code diff'"
          },
          {
            "name": "changeLabels",
            "type": "Partial<CodeDiffChangeLabels>",
            "required": false,
            "description": "Visually hidden text announced before each changed line, so the change\ntype is not carried by colour and the marker alone. Merged over the\nEnglish defaults: `added` \"Added line:\", `removed` \"Removed line:\"."
          },
          {
            "name": "statsLabel",
            "type": "((additions: number, deletions: number) => string)",
            "required": false,
            "description": "The header's additions and deletions summary as a screen reader hears it,\ngiven both counts; the visible `+3 -1` is hidden from assistive technology.\nDefaults to \"3 added, 1 removed\".",
            "defaultValue": "(additions: number, deletions: number) =>\n  `${additions} added, ${deletions} removed`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ColorPicker",
    "label": "Colour picker",
    "slug": "color-picker",
    "category": "forms",
    "description": "Swatch trigger opening a saturation area, hue and alpha sliders, and a hex field; controlled or uncontrolled.",
    "client": true,
    "importPath": "rift-ds/components/ColorPicker/ColorPicker",
    "barrel": "main",
    "exports": [
      {
        "component": "ColorPicker",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Field label text"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current colour as a hex string — 3, 6 or 8 digit, with or without `#`"
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initial colour for uncontrolled use",
            "defaultValue": "#118AB2"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the colour as an uppercase hex string\n(`#RRGGBB`, or `#RRGGBBAA` when `showAlpha` and alpha < 100%). Fires\nlive while dragging."
          },
          {
            "name": "showText",
            "type": "boolean",
            "required": false,
            "description": "Show the current hex value as text inside the trigger",
            "defaultValue": "false"
          },
          {
            "name": "showAlpha",
            "type": "boolean",
            "required": false,
            "description": "Add an alpha (opacity) slider and emit 8-digit hex when alpha < 100%",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is disabled",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Whether the field is required",
            "defaultValue": "false"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message"
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "When set, a hidden `<input type=\"hidden\">` carries the current hex value\nunder this name so the picker participates in native form submission."
          },
          {
            "name": "panelLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the open panel. Defaults to the field label followed by \"colour picker\", or \"Colour picker\" without a label."
          },
          {
            "name": "saturationLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the saturation and brightness area.",
            "defaultValue": "Saturation and brightness"
          },
          {
            "name": "saturationValueText",
            "type": "((saturation: number, brightness: number) => string)",
            "required": false,
            "description": "Spoken value of the saturation and brightness area, given both as whole percentages.",
            "defaultValue": "(saturation: number, brightness: number) =>\n        `Saturation ${saturation}%, brightness ${brightness}%`"
          },
          {
            "name": "hueLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the hue slider.",
            "defaultValue": "Hue"
          },
          {
            "name": "alphaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the alpha slider, shown with `showAlpha`.",
            "defaultValue": "Alpha"
          },
          {
            "name": "hexLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the hex text field.",
            "defaultValue": "Hex colour value"
          },
          {
            "name": "triggerLabel",
            "type": "((hex: string) => string)",
            "required": false,
            "description": "Accessible name of the swatch trigger when there is no visible `label`,\ngiven the current hex value. Defaults to \"Choose colour, \" followed by the\nhex (`Choose colour, #118AB2`). A passed `aria-label` still wins.",
            "defaultValue": "(hex: string) => `Choose colour, ${hex}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the trigger",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ComboChart",
    "label": "Combo chart",
    "slug": "combo-chart",
    "category": "charts",
    "description": "Bar and line series in one chart, with an optional second y-axis for pairs in different units, like spend and ROAS.",
    "client": true,
    "importPath": "rift-ds/components/Chart/ComboChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "ComboChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "label"
          },
          {
            "name": "barKey",
            "type": "string",
            "required": true,
            "description": "Key in data for the bar series"
          },
          {
            "name": "barLabel",
            "type": "string",
            "required": false,
            "description": "Display name for the bar series, shown in the tooltip; defaults to the key"
          },
          {
            "name": "lineKey",
            "type": "string",
            "required": true,
            "description": "Key in data for the line series"
          },
          {
            "name": "lineLabel",
            "type": "string",
            "required": false,
            "description": "Display name for the line series, shown in the tooltip; defaults to the key"
          },
          {
            "name": "barColor",
            "type": "string",
            "required": false,
            "description": "Bar fill colour (CSS value or token reference)"
          },
          {
            "name": "lineColor",
            "type": "string",
            "required": false,
            "description": "Line stroke colour (CSS value or token reference)"
          },
          {
            "name": "secondaryAxis",
            "type": "boolean",
            "required": false,
            "description": "Plot the line on its own right-hand y-axis, for series in different units",
            "defaultValue": "true"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Combobox",
    "label": "Combobox",
    "slug": "combobox",
    "category": "forms",
    "description": "A filterable select that narrows options as the user types, with multi-select chips, grouping, and async loading.",
    "client": true,
    "importPath": "rift-ds/components/Combobox/Combobox",
    "barrel": "main",
    "exports": [
      {
        "component": "Combobox",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Combobox label text"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Placeholder shown in the text field when nothing is selected",
            "defaultValue": "Search…"
          },
          {
            "name": "value",
            "type": "string | string[]",
            "required": false,
            "description": "Selected value, controlled — a `string` in single mode, `string[]` when\n`multiple` is set. Leave undefined to let the combobox keep its own\nselection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string | string[]",
            "required": false,
            "description": "Selection on first render when uncontrolled (`value` undefined) — a\n`string` in single mode, `string[]` when `multiple` is set. Omitted, the\nselection starts empty."
          },
          {
            "name": "options",
            "type": "ComboboxOption[]",
            "required": true,
            "description": "Available options (flat list)"
          },
          {
            "name": "groups",
            "type": "ComboboxOptionGroup[]",
            "required": false,
            "description": "Optional grouped options — when provided, `options` is ignored"
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Allow selecting more than one option; selections render as removable chips",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the combobox is disabled",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Whether the combobox is required",
            "defaultValue": "false"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the field"
          },
          {
            "name": "loading",
            "type": "boolean",
            "required": false,
            "description": "Show a loading affordance in the menu — for async option fetching",
            "defaultValue": "false"
          },
          {
            "name": "emptyMessage",
            "type": "string",
            "required": false,
            "description": "Message shown when the filter matches no options",
            "defaultValue": "No results found"
          },
          {
            "name": "loadingMessage",
            "type": "string",
            "required": false,
            "description": "Status text shown in the menu while `loading` is set. Defaults to \"Loading…\".",
            "defaultValue": "Loading…"
          },
          {
            "name": "clearable",
            "type": "boolean",
            "required": false,
            "description": "Show a clear button once something is selected",
            "defaultValue": "false"
          },
          {
            "name": "clearLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the clear button. Defaults to \"Clear selection\".",
            "defaultValue": "Clear selection"
          },
          {
            "name": "removeLabel",
            "type": "((label: string) => string)",
            "required": false,
            "description": "Accessible name of a chip's remove button in `multiple` mode, given the\noption's label. Defaults to \"Remove <label>\".",
            "defaultValue": "(optionLabel) => `Remove ${optionLabel}`"
          },
          {
            "name": "onValueChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Called with the new selection — a `string` in single mode,\n`string[]` when `multiple` is set."
          },
          {
            "name": "onSearchChange",
            "type": "((query: string) => void)",
            "required": false,
            "description": "Called as the user types, for async/server-side filtering"
          },
          {
            "name": "manualFiltering",
            "type": "boolean",
            "required": false,
            "description": "Skip built-in filtering — use when options are filtered upstream",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Form field name. When set, the selection submits with an enclosing form\nunder this name through hidden inputs: the selected option's `value` in\nsingle mode (nothing until one is chosen), one entry per selected value in\n`multiple` mode, nothing while disabled. The search text the user types\nis never submitted. Also the fallback for the element id (`id || name || generated`)."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CommandPalette",
    "label": "Command palette",
    "slug": "command-palette",
    "category": "overlays",
    "description": "A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.",
    "client": true,
    "importPath": "rift-ds/components/CommandPalette/CommandPalette",
    "barrel": "main",
    "exports": [
      {
        "component": "CommandPalette",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the palette is open"
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Callback when the palette requests to open or close"
          },
          {
            "name": "groups",
            "type": "CommandPaletteGroup[]",
            "required": true,
            "description": "Commands, grouped under headings"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Placeholder for the search field",
            "defaultValue": "Type a command or search…"
          },
          {
            "name": "emptyMessage",
            "type": "string",
            "required": false,
            "description": "Message shown when the query matches nothing",
            "defaultValue": "No matching commands"
          },
          {
            "name": "loading",
            "type": "boolean",
            "required": false,
            "description": "Show a loading affordance in place of results",
            "defaultValue": "false"
          },
          {
            "name": "loadingMessage",
            "type": "string",
            "required": false,
            "description": "Status text shown in place of results while `loading` is set. Defaults to \"Loading…\".",
            "defaultValue": "Loading…"
          },
          {
            "name": "hotkey",
            "type": "boolean",
            "required": false,
            "description": "Bind Cmd+K / Ctrl+K globally to toggle the palette. Set to false when the\nhost app owns the shortcut.",
            "defaultValue": "true"
          },
          {
            "name": "onSelect",
            "type": "((command: CommandPaletteCommand) => void)",
            "required": false,
            "description": "Called with the chosen command, after its own `onSelect`. Replaces the\nnative `onSelect` (text-selection) handler on the panel."
          },
          {
            "name": "onSearchChange",
            "type": "((query: string) => void)",
            "required": false,
            "description": "Called as the user types, for async/server-side search"
          },
          {
            "name": "manualFiltering",
            "type": "boolean",
            "required": false,
            "description": "Skip built-in filtering — use when commands are filtered upstream",
            "defaultValue": "false"
          },
          {
            "name": "hideFooter",
            "type": "boolean",
            "required": false,
            "description": "Hide the hint row at the bottom of the panel",
            "defaultValue": "false"
          },
          {
            "name": "hintLabels",
            "type": "{ navigate?: string; select?: string; close?: string | undefined; escapeKey?: string | undefined; } | undefined",
            "required": false,
            "description": "The words in the hint row, merged over the English defaults: the text\nbeside each key (\"to navigate\", \"to select\", \"to close\") and `escapeKey`,\nthe visible name on the Escape key cap (\"esc\")."
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the close button",
            "defaultValue": "Close command palette"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the overlay container (the ref and native attributes go on the panel)",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "CommandPaletteTrigger",
    "label": "Command palette trigger",
    "slug": "command-palette-trigger",
    "category": "actions",
    "description": "The entry point to a command palette: a button dressed as a search field, with the shortcut's keycaps, at the row-control height.",
    "client": false,
    "importPath": "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger",
    "barrel": "main",
    "exports": [
      {
        "component": "CommandPaletteTrigger",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "The prompt the field shows, which is also the button's accessible name.",
            "defaultValue": "Search or ask anything"
          },
          {
            "name": "shortcut",
            "type": "string[]",
            "required": false,
            "description": "The keyboard shortcut drawn as keycaps at the end, one key per entry. Pass an empty array for none.",
            "defaultValue": "['⌘', 'K']"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — Material Symbol name (string) or custom element (ReactNode).",
            "defaultValue": "search"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Control size, on the row-control scale: `default` is 40px, `compact` 32px.",
            "defaultValue": "default"
          },
          {
            "name": "iconOnly",
            "type": "boolean",
            "required": false,
            "description": "Fold to the icon alone, a circle the row height across, for a row with no room for the field. The label stays the accessible name.",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Composer",
    "label": "Composer",
    "slug": "composer",
    "category": "ai",
    "description": "An auto-growing message input with send and stop states, a page-context note, a file tray fed by picker, paste and drop, and Enter-to-send.",
    "client": true,
    "importPath": "rift-ds/components/Composer/Composer",
    "barrel": "main",
    "exports": [
      {
        "component": "Composer",
        "props": [
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current value for controlled use. Pair with `onValueChange`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initial value for uncontrolled use."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries work unmodified."
          },
          {
            "name": "onSubmit",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the current value on Enter (without Shift) and on the send\nbutton — never while `streaming`, never while a file in `files` is\nstill uploading, and never when there is nothing to send. Text is\nenough, and so is a ready file on its own, in which case the value is\nan empty string. Composer does not clear the value: the consumer owns\nit and clears it after a successful submit. Shadows the native\n`onSubmit` attribute, which never fires on a textarea anyway."
          },
          {
            "name": "streaming",
            "type": "boolean",
            "required": false,
            "description": "A response is streaming: the send button becomes a stop button, submit\nis blocked, and Enter is inert. On a glowing composer (`aiGlow`) the\ngradient ring also stays lit and keeps turning while this is true.",
            "defaultValue": "false"
          },
          {
            "name": "onStop",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the stop button is pressed while `streaming`."
          },
          {
            "name": "maxRows",
            "type": "number",
            "required": false,
            "description": "Growth cap in text rows before the textarea scrolls internally.",
            "defaultValue": "8"
          },
          {
            "name": "aiGlow",
            "type": "boolean",
            "required": false,
            "description": "While focused, the shell wears AiButton's slowly rotating gradient ring\nand glow in place of the plain selected border — the system's \"a model\nanswers here\" signal, for composers whose messages are answered by one.\nWhile `streaming`, the ring stays lit and turning whether or not the\nfield holds focus. Off by default.",
            "defaultValue": "false"
          },
          {
            "name": "context",
            "type": "ReactNode",
            "required": false,
            "description": "Contextual note rendered as a full-width, non-interactive chip — the\n\"what the model is looking at\" line a chat host pins over the message\n(\"Looking at “Page name”\"). `contextPlacement` decides where it sits.\nOne line: a note too long for the shell truncates with an ellipsis.\nComposer owns the chip's chrome; the caller passes the text."
          },
          {
            "name": "contextPlacement",
            "type": "\"inside\" | \"above\"",
            "required": false,
            "description": "Where the `context` chip sits. `inside` (the default) pins it at the very\ntop of the shell, above any attachments. `above` lifts it out of the\nshell into its own bar a small gap above it, so it reads as what the\nmodel can see rather than part of the message being typed. Either way\nits icon starts on the shell's text rail, and a click on it focuses the\ntextarea.",
            "defaultValue": "inside"
          },
          {
            "name": "contextIcon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon at the left of the context chip — Material Symbol name (string,\ne.g. `visibility`, `article`) or custom element (ReactNode). Decorative\nand hidden from assistive technology — the chip's text carries the\nmeaning. None by default, matching the ai set's icon-free-unless-asked\nconvention."
          },
          {
            "name": "files",
            "type": "AttachmentItem[]",
            "required": false,
            "description": "The files queued on this message, drawn as a scrolling row of square\ntiles above the textarea. Controlled by the caller: Composer draws the\nlist and reports what was added or removed, and never stores a file.\n`useAttachments` is the usual owner."
          },
          {
            "name": "onFilesSelected",
            "type": "((files: File[]) => void)",
            "required": false,
            "description": "Fires with the files a person picked, pasted or dropped. Providing it\narms all three: the attach button and its picker, file paste in the\ntextarea, and drop on the shell."
          },
          {
            "name": "onFileRemove",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the id of the file whose remove button was pressed. Its presence renders the buttons."
          },
          {
            "name": "onFileClick",
            "type": "((item: AttachmentItem) => void)",
            "required": false,
            "description": "Fires with a queued file when its tile is pressed. Its presence makes the tiles buttons."
          },
          {
            "name": "accept",
            "type": "string",
            "required": false,
            "description": "File types the picker offers, in the native `accept` syntax."
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker allows several files at once.",
            "defaultValue": "true"
          },
          {
            "name": "attachButton",
            "type": "boolean",
            "required": false,
            "description": "Whether the built-in attach button shows when `onFilesSelected` is set.",
            "defaultValue": "true"
          },
          {
            "name": "pasteThreshold",
            "type": "number",
            "required": false,
            "description": "Pasted text at least this many characters long becomes an attachment\ninstead of landing in the textarea. Off unless set, and inert without\n`onPasteAsAttachment`."
          },
          {
            "name": "onPasteAsAttachment",
            "type": "((text: string) => void)",
            "required": false,
            "description": "Receives pasted text that met `pasteThreshold`."
          },
          {
            "name": "attachLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the attach button.",
            "defaultValue": "Attach files"
          },
          {
            "name": "dropLabel",
            "type": "string",
            "required": false,
            "description": "Text shown on the shell while files are dragged over it.",
            "defaultValue": "Drop files to attach"
          },
          {
            "name": "filesLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the list of queued files.",
            "defaultValue": "Attachments"
          },
          {
            "name": "attachmentTileLabels",
            "type": "(Pick<AttachmentTileProps, \"uploadingLabel\" | \"errorLabel\" | \"unavailableLabel\" | \"progressLabel\"> & { removeLabel?: ((name: string) => string); })",
            "required": false,
            "description": "The words each queued file's tile writes, merged over the tile's English\ndefaults: its status lines (\"Uploading…\", \"Upload failed\", \"Unavailable\"),\nits progress spinner's name, and its remove button's name, which is given\nthe file name and defaults to \"Remove\" followed by it."
          },
          {
            "name": "formatFileAnnouncement",
            "type": "((change: { type: \"failed\" | \"added\" | \"removed\"; names: string[]; }) => string)",
            "required": false,
            "description": "Builds the sentence announced to assistive technology when files join\nthe queue, leave it, or fail.",
            "defaultValue": "({\n  type,\n  names,\n}: {\n  type: 'added' | 'removed' | 'failed';\n  names: string[];\n}) => {\n  const list = names.join(', ');\n  if (type === 'added') return `Attached ${list}`;\n  if (type === 'removed') return `Removed ${list}`;\n  return `Could not attach ${list}`;\n}"
          },
          {
            "name": "attachments",
            "type": "ReactNode",
            "required": false,
            "description": "Free-form row rendered above the textarea, after any `files`.",
            "deprecated": "Use `files` with `onFilesSelected` and `onFileRemove`, which draw the queue as tiles."
          },
          {
            "name": "mentions",
            "type": "MentionSource[]",
            "required": false,
            "description": "What a person can reference while typing, one source per trigger\ncharacter: `@` for entities, `/` for skills. Typing a trigger at the\nstart of a word opens a menu of that source's items, filtered as the\nword grows. Arrows move through it, Enter or Tab writes the choice into\nthe text, Escape closes it. A mention is drawn in the tag colour\nwherever its exact name stands in the text; the value stays a plain\nstring."
          },
          {
            "name": "onMentionSelect",
            "type": "((item: MentionItem, trigger: string) => void)",
            "required": false,
            "description": "Fires with the item a person chose from the mention menu, and the trigger that opened it."
          },
          {
            "name": "mentionPlacement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the trigger's line the mention menu opens on: `top` lays\nit over the text above, `bottom` over the text below. `top` suits a\ncomposer at the foot of a view.",
            "defaultValue": "top"
          },
          {
            "name": "formatMentionAnnouncement",
            "type": "((count: number) => string)",
            "required": false,
            "description": "Builds the sentence announced to assistive technology when the mention menu opens or its matches change.",
            "defaultValue": "(count: number) =>\n  count === 1 ? '1 suggestion' : `${count} suggestions`"
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Leading actions on the left of the action bar, after the attach button (a model picker)."
          },
          {
            "name": "trailingActions",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing actions on the right of the action bar, just before the send\nbutton (dictation, voice mode)."
          },
          {
            "name": "sendLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the send button.",
            "defaultValue": "Send message"
          },
          {
            "name": "stopLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the stop button.",
            "defaultValue": "Stop generating"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the shell, not the <textarea>.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ContactCard",
    "label": "Contact card",
    "slug": "contact-card",
    "category": "data-display",
    "description": "Linked contact method with icon, label, and value.",
    "client": true,
    "importPath": "rift-ds/components/ContactCard/ContactCard",
    "barrel": "main",
    "exports": [
      {
        "component": "ContactCard",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "Primary label — e.g. \"Email\""
          },
          {
            "name": "value",
            "type": "string",
            "required": true,
            "description": "Visible value or description — e.g. \"hello@example.com\""
          },
          {
            "name": "href",
            "type": "string",
            "required": true,
            "description": "Link destination"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon used when no logo is set — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "logo",
            "type": "string",
            "required": false,
            "description": "Path to a logo image — preferred over icon when both are provided"
          },
          {
            "name": "external",
            "type": "boolean",
            "required": false,
            "description": "Opens link in a new tab and shows open_in_new indicator",
            "defaultValue": "false"
          },
          {
            "name": "copyable",
            "type": "boolean",
            "required": false,
            "description": "Renders a copy button beside the trailing icon. Pressing it calls\n`onCopy(value)`; ContactCard never writes to the clipboard itself.",
            "defaultValue": "false"
          },
          {
            "name": "onCopy",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the card's value when the copy control is pressed: the copy\nbutton, or the whole card when `copyOnClick` is set. ContactCard does not\ntouch the clipboard, so write the value there in this handler.\nNote: this replaces the native `onCopy` clipboard-event handler, which\nContactCard does not expose."
          },
          {
            "name": "copyOnClick",
            "type": "boolean",
            "required": false,
            "description": "Renders the whole card as a button that calls `onCopy(value)` on click,\nwith no navigation. The copying itself is the `onCopy` handler's job.",
            "defaultValue": "false"
          },
          {
            "name": "copyLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the copy control: the copy button, or the whole card\nwhen `copyOnClick` is set. Defaults to \"Copy <value>\", and to\n\"Copy <value> to clipboard\" on a `copyOnClick` card; both defaults assume\nyour `onCopy` writes the value to the clipboard."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ContextMenu",
    "label": "Context menu",
    "slug": "context-menu",
    "category": "overlays",
    "description": "Right-click menu at the pointer with groups, sub-menus, and shortcut hints.",
    "client": true,
    "importPath": "rift-ds/components/ContextMenu/ContextMenu",
    "barrel": "main",
    "exports": [
      {
        "component": "ContextMenu",
        "props": [
          {
            "name": "items",
            "type": "DropdownMenuEntry[]",
            "required": true,
            "description": "Menu entries — the same model as DropdownMenu (items, groups, separators)"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the menu"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "The right-clickable area the menu is attached to"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ContributionGraph",
    "label": "Contribution graph",
    "slug": "contribution-graph",
    "category": "charts",
    "description": "A year of activity, one cell per day.",
    "client": false,
    "importPath": "rift-ds/components/ContributionGraph/ContributionGraph",
    "barrel": "main",
    "exports": [
      {
        "component": "ContributionGraph",
        "props": [
          {
            "name": "days",
            "type": "ContributionDay[]",
            "required": true,
            "description": "One entry per day, ordered oldest to newest"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header.\nNote: this replaces the native `title` tooltip attribute, which the graph does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title."
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "caption",
            "type": "string",
            "required": false,
            "description": "Summary line shown under the grid, e.g. \"496 contributions in the last year\""
          },
          {
            "name": "showMonthLabels",
            "type": "boolean",
            "required": false,
            "description": "Show month labels above the grid",
            "defaultValue": "true"
          },
          {
            "name": "showLegend",
            "type": "boolean",
            "required": false,
            "description": "Show the Less → More legend under the grid",
            "defaultValue": "true"
          },
          {
            "name": "gridLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the grid of day cells, which renders as one image. Falls back to `caption`, then to \"Contribution activity\"."
          },
          {
            "name": "lessLabel",
            "type": "string",
            "required": false,
            "description": "The legend's low-end word. Defaults to \"Less\".",
            "defaultValue": "Less"
          },
          {
            "name": "moreLabel",
            "type": "string",
            "required": false,
            "description": "The legend's high-end word. Defaults to \"More\".",
            "defaultValue": "More"
          },
          {
            "name": "locale",
            "type": "string",
            "required": false,
            "description": "The BCP 47 locale the dates are written in: the default month labels\nabove the grid (\"Jan\" to \"Dec\" in `en-US`) and the date in each cell's\ndefault tooltip (\"Jul 8, 2026\"). Defaults to `en-US`.",
            "defaultValue": "en-US"
          },
          {
            "name": "monthLabels",
            "type": "string[]",
            "required": false,
            "description": "The month labels above the grid: twelve entries, January first.\nDefaults to the short month names in `locale` (\"Jan\" to \"Dec\" in\n`en-US`); a list of any other length falls back to the default."
          },
          {
            "name": "cellLabel",
            "type": "((count: number, date: Date) => string)",
            "required": false,
            "description": "A day cell's tooltip, given its count and date. Defaults to \"No\ncontributions\", \"1 contribution\" or \"N contributions\", then \"on\" and the\ndate in `locale`'s short form (e.g. \"Jul 8, 2026\")."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "DataTable",
    "label": "Data table",
    "slug": "data-table",
    "category": "data-display",
    "description": "The wired table: sort, search, filters, selection, paging, column and row controls, and inline editing, on a headless engine.",
    "client": true,
    "importPath": "rift-ds/components/DataTable/DataTable",
    "barrel": "main",
    "exports": [
      {
        "component": "DataTable",
        "props": [
          {
            "name": "columns",
            "type": "DataTableColumn<R>[]",
            "required": true,
            "description": "Column definitions."
          },
          {
            "name": "rows",
            "type": "R[]",
            "required": true,
            "description": "Row data, as raw values the table can sort and search."
          },
          {
            "name": "pageSize",
            "type": "number",
            "required": false,
            "description": "Rows per page, for controlled use (or as a fixed setting). Setting this or `defaultPageSize` turns on the built-in pagination."
          },
          {
            "name": "defaultPageSize",
            "type": "number",
            "required": false,
            "description": "Rows per page to start with, for uncontrolled use; `pageSizeOptions` then lets the reader change it."
          },
          {
            "name": "onPageSizeChange",
            "type": "((pageSize: number) => void)",
            "required": false,
            "description": "Fires with the new page size when the reader picks one from `pageSizeOptions`."
          },
          {
            "name": "pageSizeOptions",
            "type": "number[]",
            "required": false,
            "description": "The page sizes the footer offers in a Rows per page picker. Leave unset for no picker."
          },
          {
            "name": "page",
            "type": "number",
            "required": false,
            "description": "The current page, counting from 1, for controlled use. Pair with `onPageChange`. A page past the last shows the last."
          },
          {
            "name": "defaultPage",
            "type": "number",
            "required": false,
            "description": "The page to start on, counting from 1, for uncontrolled use."
          },
          {
            "name": "onPageChange",
            "type": "((page: number) => void)",
            "required": false,
            "description": "Fires with the new page, counting from 1: from the pager, and back to 1 when a search, filter, sort or page size change starts over."
          },
          {
            "name": "pageSizeLabel",
            "type": "string",
            "required": false,
            "description": "The page size picker's label. Defaults to \"Rows per page\".",
            "defaultValue": "Rows per page"
          },
          {
            "name": "phoneLayout",
            "type": "\"scroll\" | \"stack\"",
            "required": false,
            "description": "How the table reads when it is narrower than a phone (its own width,\nunder `BREAKPOINT_PHONE_PX`, so a table in a narrow panel counts):\n`scroll` keeps the rows and scrolls sideways with the row header\npinned; `stack` draws each row as a card, its row header as the title\nand every other column as a label and value pair. Defaults to `scroll`.",
            "defaultValue": "scroll"
          },
          {
            "name": "selectable",
            "type": "boolean",
            "required": false,
            "description": "Adds a checkbox column with a select-all header.",
            "defaultValue": "false"
          },
          {
            "name": "selectedIds",
            "type": "string[]",
            "required": false,
            "description": "Selected row ids for controlled use. Pair with `onSelectionChange`."
          },
          {
            "name": "defaultSelectedIds",
            "type": "string[]",
            "required": false,
            "description": "Initially selected row ids for uncontrolled use."
          },
          {
            "name": "onSelectionChange",
            "type": "((ids: string[]) => void)",
            "required": false,
            "description": "Fires with the full list of selected row ids after every change."
          },
          {
            "name": "sort",
            "type": "DataTableSort | null",
            "required": false,
            "description": "Sort state for controlled use. Pair with `onSortChange`; `null` means unsorted."
          },
          {
            "name": "defaultSort",
            "type": "DataTableSort",
            "required": false,
            "description": "Initial sort state for uncontrolled use."
          },
          {
            "name": "onSortChange",
            "type": "((sort: DataTableSort | null) => void)",
            "required": false,
            "description": "Fires with the new sort state — `null` when a third click clears the sort."
          },
          {
            "name": "sorts",
            "type": "DataTableSort[]",
            "required": false,
            "description": "Every sort, first sort first, for controlled use: the several-column form of `sort`, and wins over it when both are given. Pair with `onSortsChange`."
          },
          {
            "name": "defaultSorts",
            "type": "DataTableSort[]",
            "required": false,
            "description": "Initial sorts for uncontrolled use."
          },
          {
            "name": "onSortsChange",
            "type": "((sorts: DataTableSort[]) => void)",
            "required": false,
            "description": "Fires with every sort after one changes, first sort first. `onSortChange` fires too, with the first or `null`."
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The link component a `link` column's cells render through, so the app's router handles them. Defaults to the nearest `LinkProvider`'s, else a plain anchor."
          },
          {
            "name": "virtualize",
            "type": "boolean | \"auto\"",
            "required": false,
            "description": "Draws only the rows in view, so a table of thousands scrolls as\nsmoothly as one of ten. `auto` (the default) does it for an unpaged,\nungrouped table of more than 200 rows; `true` always; `false` never.\nA virtualised table scrolls inside its frame (`maxHeight`, 640px when\nunset), keeps its header in view, and still sends its first screen of\nrows in the server's HTML.",
            "defaultValue": "auto"
          },
          {
            "name": "onLoadMore",
            "type": "(() => void)",
            "required": false,
            "description": "Called when the reader scrolls near the end of the rows while `hasMore` is set, to fetch the next batch. Called once per batch: append the rows and it can fire again."
          },
          {
            "name": "hasMore",
            "type": "boolean",
            "required": false,
            "description": "Whether more rows can be fetched: shows a loading row at the end and calls `onLoadMore` as it comes into view.",
            "defaultValue": "false"
          },
          {
            "name": "loadingMoreLabel",
            "type": "string",
            "required": false,
            "description": "The loading row's words. Defaults to \"Loading more\".",
            "defaultValue": "Loading more"
          },
          {
            "name": "renderDetail",
            "type": "((row: R) => ReactNode)",
            "required": false,
            "description": "Renders a row's details: adds a chevron column, and an opened row shows this beneath it, across the table's width. Rendered only once opened."
          },
          {
            "name": "expandedIds",
            "type": "string[]",
            "required": false,
            "description": "The ids of the rows whose details are open, for controlled use. Pair with `onExpandedIdsChange`."
          },
          {
            "name": "defaultExpandedIds",
            "type": "string[]",
            "required": false,
            "description": "The rows open to begin with, for uncontrolled use."
          },
          {
            "name": "onExpandedIdsChange",
            "type": "((ids: string[]) => void)",
            "required": false,
            "description": "Fires with the open rows' ids after one opens or closes."
          },
          {
            "name": "expandMode",
            "type": "\"multiple\" | \"single\"",
            "required": false,
            "description": "Whether several rows' details can be open at once (`multiple`, the default) or opening one closes the rest (`single`).",
            "defaultValue": "multiple"
          },
          {
            "name": "onViewChange",
            "type": "((view: TableView) => void)",
            "required": false,
            "description": "Fires with the table's setup as a view whenever any part of it changes, so a host can keep the reader's last view."
          },
          {
            "name": "grouping",
            "type": "string[]",
            "required": false,
            "description": "The column keys the rows are grouped by, for controlled use; this milestone draws the first. Pair with `onGroupingChange`."
          },
          {
            "name": "defaultGrouping",
            "type": "string[]",
            "required": false,
            "description": "The grouping to start with, for uncontrolled use."
          },
          {
            "name": "onGroupingChange",
            "type": "((grouping: string[]) => void)",
            "required": false,
            "description": "Fires with the new grouping, from a header menu or a TableToolbar."
          },
          {
            "name": "totalsRow",
            "type": "boolean",
            "required": false,
            "description": "Adds a totals row to the table's foot, sticky at its bottom edge: each cell a menu picking its calculation over every matching row.",
            "defaultValue": "false"
          },
          {
            "name": "totals",
            "type": "Record<string, Total>",
            "required": false,
            "description": "Each column's footer calculation, by key, for controlled use. A column left out shows its `aggregate`, or nothing. Pair with `onTotalsChange`."
          },
          {
            "name": "defaultTotals",
            "type": "Record<string, Total>",
            "required": false,
            "description": "The footer calculations to start with, for uncontrolled use."
          },
          {
            "name": "onTotalsChange",
            "type": "((totals: Record<string, Total>) => void)",
            "required": false,
            "description": "Fires with every footer calculation after one is picked."
          },
          {
            "name": "multiSort",
            "type": "boolean",
            "required": false,
            "description": "Lets the table sort by several columns: Shift-click a header, or pick Add to sort from its menu, to add the column after the current sorts. Each sorted header shows its rank while more than one sorts.",
            "defaultValue": "false"
          },
          {
            "name": "searchable",
            "type": "boolean",
            "required": false,
            "description": "Shows the built-in search field, matching against every column's raw value.",
            "defaultValue": "false"
          },
          {
            "name": "searchPlaceholder",
            "type": "string",
            "required": false,
            "description": "Placeholder for the search field.",
            "defaultValue": "Search"
          },
          {
            "name": "toolbar",
            "type": "ReactNode",
            "required": false,
            "description": "Slot beside the search field for consumer-owned filter controls."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "The table's density, and the controls' with it: `default` rows with the\nsearch field and pager at the default row-control height, `compact` rows\nwith both at the compact one. Controls inside the rows (checkboxes, grips,\nmenu and action buttons) stay compact at either density, so a row's\nheight is its text's."
          },
          {
            "name": "striped",
            "type": "boolean",
            "required": false,
            "description": "Alternating row backgrounds, passed through to the underlying Table.",
            "defaultValue": "false"
          },
          {
            "name": "caption",
            "type": "string",
            "required": false,
            "description": "Accessible caption for the underlying table (visually hidden)."
          },
          {
            "name": "emptyState",
            "type": "ReactNode",
            "required": false,
            "description": "What to render when no rows match — defaults to a built-in empty state."
          },
          {
            "name": "selectAllLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the select-all checkbox in the header, shown with `selectable`.",
            "defaultValue": "Select all rows on this page"
          },
          {
            "name": "selectRowLabel",
            "type": "((row: R) => string)",
            "required": false,
            "description": "Accessible name of a row's checkbox, given the row. Defaults to \"Select\"\nfollowed by the value of the `rowHeader` column (else the first column),\nand to \"Select row\" with the id only when that value is empty.",
            "defaultValue": "(row: R) => {\n    const nameKey = (columnsProp.find((col) => col.rowHeader) ?? columnsProp[0])?.key;\n    const name = nameKey === undefined ? undefined : row.values[nameKey];\n    return name == null || name === '' ? `Select row ${row.id}` : `Select ${name}`;\n  }"
          },
          {
            "name": "sortLabel",
            "type": "((header: string, direction: \"desc\" | \"asc\" | null) => string)",
            "required": false,
            "description": "Accessible name of a sortable header's button, given the column's header\ntext (its `key` when the header is not a string) and its current sort\ndirection, `null` when unsorted. Defaults to the header text alone: the\nsort state is the header's `aria-sort`, so naming it here too would read\nit twice.",
            "defaultValue": "(header: string) => header"
          },
          {
            "name": "sortAnnouncement",
            "type": "((header: string, direction: \"desc\" | \"asc\" | null) => string)",
            "required": false,
            "description": "Announced when the sort changes, given the header text and the new direction, `null` when cleared. Defaults to \"Sorted by Name, ascending\" or \"Sort cleared\".",
            "defaultValue": "(header: string, direction: DataTableSort['direction'] | null) =>\n    direction === null ? 'Sort cleared' : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`"
          },
          {
            "name": "sortRankLabel",
            "type": "((name: string, rank: number, direction: \"desc\" | \"asc\") => string)",
            "required": false,
            "description": "With several sorts, names a header's sort button after the first: given the `sortLabel` name, its rank and its direction. Defaults to \"Owner, sort 2, ascending\". The first sort's header carries `aria-sort` instead.",
            "defaultValue": "(name: string, rank: number, direction: DataTableSort['direction']) =>\n    `${name}, sort ${rank}, ${direction === 'asc' ? 'ascending' : 'descending'}`"
          },
          {
            "name": "pageAnnouncement",
            "type": "((page: number, pageCount: number, first: number, last: number, total: number) => string)",
            "required": false,
            "description": "Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to \"Page 2 of 7, rows 21 to 40 of 140\".",
            "defaultValue": "(page: number, pageCount: number, first: number, last: number, total: number) =>\n    `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}`"
          },
          {
            "name": "resultsLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "Footer count of the rows that match, given the count. Defaults to \"1 result\" or \"N results\".",
            "defaultValue": "(count: number) => `${count} result${count === 1 ? '' : 's'}`"
          },
          {
            "name": "selectedLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "Footer count shown instead of the results while rows are selected, given the count. Defaults to \"N selected\".",
            "defaultValue": "(count: number) => `${count} selected`"
          },
          {
            "name": "paginationLabels",
            "type": "Pick<PaginationProps, \"aria-label\" | \"previousLabel\" | \"nextLabel\" | \"pageLabel\" | \"readoutLabel\">",
            "required": false,
            "description": "The built-in pager's words, merged over its English defaults: the arrows'\nnames (\"Previous page\", \"Next page\"), the readout (\"Page 2 of 4\") and the\nlandmark's name (\"Pagination\"). The pager follows the table's `size`:\nnumbered pages at the default size (named by `pageLabel`), a \"Page X of Y\"\nreadout when compact (`readoutLabel`)."
          },
          {
            "name": "emptyStateLabels",
            "type": "Partial<Pick<EmptyStateProps, \"title\" | \"description\">>",
            "required": false,
            "description": "The built-in empty state's words, merged over its English defaults\n(\"No matching rows\", \"Adjust the search or filters and try again.\").\nIgnored when `emptyState` replaces the whole node."
          },
          {
            "name": "resizableColumns",
            "type": "boolean",
            "required": false,
            "description": "Lets every column be resized by dragging its header's edge, double-clicking it to fit, or Alt+Left and Alt+Right on a focused header. A column's own `resizable` wins.",
            "defaultValue": "false"
          },
          {
            "name": "reorderableColumns",
            "type": "boolean",
            "required": false,
            "description": "Lets every column be moved by dragging its header, from its menu, or Ctrl+Shift+Left and Ctrl+Shift+Right on a focused header. A column's own `reorderable` wins.",
            "defaultValue": "false"
          },
          {
            "name": "columnMenu",
            "type": "boolean",
            "required": false,
            "description": "Adds a menu to every header: sort, pin, move, hide, fit and reset, as each column allows. Opened from the header's options button, Alt+Down, Shift+F10 or a right-click.",
            "defaultValue": "false"
          },
          {
            "name": "reorderableRows",
            "type": "boolean",
            "required": false,
            "description": "Adds a grip at each row's start to drag it up or down, or move it with Alt+Up and Alt+Down. Off while a sort is active, since the sort owns the order.",
            "defaultValue": "false"
          },
          {
            "name": "stickyHeader",
            "type": "boolean",
            "required": false,
            "description": "Keeps the header in view while the body scrolls. Takes effect with `maxHeight`, inside the table's own scroll frame.",
            "defaultValue": "false"
          },
          {
            "name": "maxHeight",
            "type": "string | number",
            "required": false,
            "description": "The table's tallest height before its body scrolls inside its frame (any CSS length, or pixels)."
          },
          {
            "name": "navigation",
            "type": "\"table\" | \"grid\"",
            "required": false,
            "description": "How the keyboard moves through the table. `table` keeps every control in\nthe Tab order, as a reading table does; `grid` makes the table one Tab\nstop with arrow-key focus across its cells. Defaults to `grid` when any\ncolumn or row control is on, else `table`."
          },
          {
            "name": "columnWidths",
            "type": "Record<string, number>",
            "required": false,
            "description": "Column widths in pixels, by key, for controlled use. Fires `onColumnWidthsChange` once per resize, on release."
          },
          {
            "name": "defaultColumnWidths",
            "type": "Record<string, number>",
            "required": false,
            "description": "Starting column widths in pixels, by key, for uncontrolled use. Columns not listed take their natural width."
          },
          {
            "name": "onColumnWidthsChange",
            "type": "((widths: Record<string, number>) => void)",
            "required": false,
            "description": "Fires with every column's width after a resize, a fit or a reset."
          },
          {
            "name": "columnOrder",
            "type": "string[]",
            "required": false,
            "description": "Column keys in display order, for controlled use. Keys left out keep their declared order after the listed ones."
          },
          {
            "name": "defaultColumnOrder",
            "type": "string[]",
            "required": false,
            "description": "Starting column order, for uncontrolled use."
          },
          {
            "name": "onColumnOrderChange",
            "type": "((order: string[]) => void)",
            "required": false,
            "description": "Fires with the full column order after a move."
          },
          {
            "name": "columnPinning",
            "type": "DataTableColumnPinning",
            "required": false,
            "description": "Columns pinned to each edge, for controlled use."
          },
          {
            "name": "defaultColumnPinning",
            "type": "DataTableColumnPinning",
            "required": false,
            "description": "Starting pins, for uncontrolled use; merged with each column's own `pin`."
          },
          {
            "name": "onColumnPinningChange",
            "type": "((pinning: DataTableColumnPinning) => void)",
            "required": false,
            "description": "Fires with the pins after a column is pinned or unpinned."
          },
          {
            "name": "hiddenColumns",
            "type": "string[]",
            "required": false,
            "description": "Hidden column keys, for controlled use."
          },
          {
            "name": "defaultHiddenColumns",
            "type": "string[]",
            "required": false,
            "description": "Starting hidden keys, for uncontrolled use; merged with each column's `defaultHidden`."
          },
          {
            "name": "onHiddenColumnsChange",
            "type": "((hidden: string[]) => void)",
            "required": false,
            "description": "Fires with every hidden key after a column is hidden or shown."
          },
          {
            "name": "rowOrder",
            "type": "string[]",
            "required": false,
            "description": "Row ids in display order, for controlled use, applied while no sort is active. Rows left out keep their given order after the listed ones."
          },
          {
            "name": "defaultRowOrder",
            "type": "string[]",
            "required": false,
            "description": "Starting row order, for uncontrolled use."
          },
          {
            "name": "onRowOrderChange",
            "type": "((order: string[]) => void)",
            "required": false,
            "description": "Fires with the full row order after a row moves."
          },
          {
            "name": "columnLabels",
            "type": "Partial<DataTableColumnLabels>",
            "required": false,
            "description": "The column and row controls' words, merged over their English defaults."
          },
          {
            "name": "columnDividers",
            "type": "boolean",
            "required": false,
            "description": "Draws a vertical line between columns, as well as the lines between rows.",
            "defaultValue": "false"
          },
          {
            "name": "cellText",
            "type": "DataTableCellText",
            "required": false,
            "description": "How every cell's text fits unless its column says otherwise: `wrap` (the default), `nowrap`, `truncate` or `lines-2`.",
            "defaultValue": "wrap"
          },
          {
            "name": "rowActions",
            "type": "((row: R) => DataTableRowAction[])",
            "required": false,
            "description": "The actions a row offers, in an actions column that sticks to the end edge: inline ones as icon buttons, the rest in a More menu."
          },
          {
            "name": "editMode",
            "type": "\"cell\" | \"row\"",
            "required": false,
            "description": "How editable cells edit: `cell` (the default) edits one cell at a time,\nstarted with Enter, F2, a typed character or a double click; `row` adds an\nEdit button to each row that opens every editable cell of the row at\nonce, with Save and Cancel.",
            "defaultValue": "cell"
          },
          {
            "name": "onCellEdit",
            "type": "((edit: DataTableCellEdit<R>) => void | Promise<unknown>)",
            "required": false,
            "description": "Saves one edited cell. Rows stay the record: update them from here. Return\na promise to have the cell show the new value as pending until it\nsettles; a rejection rolls the cell back and announces the failure."
          },
          {
            "name": "onRowEdit",
            "type": "((edit: DataTableRowEdit<R>) => void | Promise<unknown>)",
            "required": false,
            "description": "Saves one edited row with `editMode=\"row\"`, its changed values together. Without it, each changed cell goes to `onCellEdit`."
          },
          {
            "name": "filters",
            "type": "Filter[]",
            "required": false,
            "description": "The filters, for controlled use: conditions on columns, joined with AND. Set from the header menus (with `columnMenu`) or a TableToolbar."
          },
          {
            "name": "defaultFilters",
            "type": "Filter[]",
            "required": false,
            "description": "Starting filters, for uncontrolled use."
          },
          {
            "name": "onFiltersChange",
            "type": "((filters: Filter[]) => void)",
            "required": false,
            "description": "Fires with every filter after one is added, changed or removed."
          },
          {
            "name": "search",
            "type": "string",
            "required": false,
            "description": "The search text, for controlled use; the built-in search field and a TableToolbar's both set it."
          },
          {
            "name": "defaultSearch",
            "type": "string",
            "required": false,
            "description": "Starting search text, for uncontrolled use."
          },
          {
            "name": "onSearchChange",
            "type": "((search: string) => void)",
            "required": false,
            "description": "Fires with the search text as it changes."
          },
          {
            "name": "defaultSize",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Starting density, for uncontrolled use when a TableToolbar's density switch sets it; `size` controls it."
          },
          {
            "name": "onSizeChange",
            "type": "((size: \"default\" | \"compact\") => void)",
            "required": false,
            "description": "Fires when a TableToolbar's density switch changes the density."
          },
          {
            "name": "filterLabels",
            "type": "Partial<FilterLabels>",
            "required": false,
            "description": "The filters' words, merged over their English defaults."
          },
          {
            "name": "rowActionsVisibility",
            "type": "\"hover\" | \"always\"",
            "required": false,
            "description": "When the inline actions show: on row hover and focus (the default, and always on a touch screen), or always. The More button shows at rest either way, so the column never reads as empty.",
            "defaultValue": "hover"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "DateInput",
    "label": "Date input",
    "slug": "date-input",
    "category": "forms",
    "description": "Date input with native picker, calendar icon, label, and validation states.",
    "client": true,
    "importPath": "rift-ds/components/DateInput/DateInput",
    "barrel": "main",
    "exports": [
      {
        "component": "DateInput",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Input label text"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current value (YYYY-MM-DD format)"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message"
          },
          {
            "name": "min",
            "type": "string",
            "required": false,
            "description": "Minimum selectable date (YYYY-MM-DD)"
          },
          {
            "name": "max",
            "type": "string",
            "required": false,
            "description": "Maximum selectable date (YYYY-MM-DD)"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries work unmodified."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "DatePicker",
    "label": "Date picker",
    "slug": "date-picker",
    "category": "forms",
    "description": "Inline calendar with month navigation, day selection, and today indicator.",
    "client": true,
    "importPath": "rift-ds/components/DatePicker/DatePicker",
    "barrel": "main",
    "exports": [
      {
        "component": "DatePicker",
        "props": [
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected date (YYYY-MM-DD)"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is disabled",
            "defaultValue": "false"
          },
          {
            "name": "min",
            "type": "string",
            "required": false,
            "description": "Minimum selectable date (YYYY-MM-DD)"
          },
          {
            "name": "max",
            "type": "string",
            "required": false,
            "description": "Maximum selectable date (YYYY-MM-DD)"
          },
          {
            "name": "onDateSelect",
            "type": "((date: string) => void)",
            "required": false,
            "description": "Callback when a date is selected"
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the previous-month button.",
            "defaultValue": "Previous month"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the next-month button.",
            "defaultValue": "Next month"
          },
          {
            "name": "monthLabel",
            "type": "((month: Date) => string)",
            "required": false,
            "description": "The month heading, given the first day of the month in view: the visible\ntitle, the name of the day grid, and the text announced on navigation.\nDefaults to the English month name and the year.",
            "defaultValue": "(month: Date): string =>\n  `${MONTHS[month.getMonth()]} ${month.getFullYear()}`"
          },
          {
            "name": "dayLabel",
            "type": "((date: Date, selected: boolean) => string)",
            "required": false,
            "description": "Accessible name of a day button, given its date and whether it is selected. Defaults to the full date in the user's locale, with \", selected\" appended when selected.",
            "defaultValue": "(date: Date, selected: boolean): string =>\n  `${date.toLocaleDateString(undefined, {\n    weekday: 'long',\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric',\n  })}${selected ? ', selected' : ''}`"
          },
          {
            "name": "weekdayLabels",
            "type": "string[]",
            "required": false,
            "description": "The visible weekday column headers: seven entries, Sunday first.\nDefaults to the English two-letter abbreviations (\"Su\" to \"Sa\"); a list\nof any other length falls back to the default."
          },
          {
            "name": "weekdayNames",
            "type": "string[]",
            "required": false,
            "description": "The weekday column headers' accessible names, read in full where the\nvisible header is abbreviated: seven entries, Sunday first. Defaults to\nthe English weekday names (\"Sunday\" to \"Saturday\"); a list of any other\nlength falls back to the default."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Dialog",
    "label": "Dialog",
    "slug": "dialog",
    "category": "overlays",
    "description": "A general-purpose modal for focused tasks, with sizes, an optional footer, and full focus management.",
    "client": true,
    "importPath": "rift-ds/components/Dialog/Dialog",
    "barrel": "main",
    "exports": [
      {
        "component": "Dialog",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the dialog is open"
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Callback when dialog requests to close"
          },
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Dialog title.\nNote: this shadows the native `title` tooltip attribute, which Dialog does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Optional subtitle under the title"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Dialog body content"
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "required": false,
            "description": "Optional footer slot — typically a row of Buttons"
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Panel width",
            "defaultValue": "md"
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether ESC, backdrop click, and the close button can dismiss",
            "defaultValue": "true"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the close button.",
            "defaultValue": "Close dialog"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the portal container, not the panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Divider",
    "label": "Divider",
    "slug": "divider",
    "category": "layout",
    "description": "A thin rule separating stacked content, with optional inline label and vertical orientation.",
    "client": false,
    "importPath": "rift-ds/components/Divider/Divider",
    "barrel": "main",
    "exports": [
      {
        "component": "Divider",
        "props": [
          {
            "name": "orientation",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Divider direction",
            "defaultValue": "horizontal"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Optional label rendered inline in the line (horizontal only)"
          },
          {
            "name": "labelPosition",
            "type": "\"center\" | \"start\"",
            "required": false,
            "description": "Label placement along the line",
            "defaultValue": "center"
          },
          {
            "name": "spacing",
            "type": "\"none\" | \"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Margin around the divider (block for horizontal, inline for vertical)",
            "defaultValue": "md"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "DocumentChip",
    "label": "Document chip",
    "slug": "document-chip",
    "category": "ai",
    "description": "A legacy one-row file reference, superseded by the attachment tile and kept for existing consumers.",
    "client": false,
    "importPath": "rift-ds/components/DocumentChip/DocumentChip",
    "barrel": "main",
    "deprecated": "Use `AttachmentTile` instead.",
    "exports": [
      {
        "component": "DocumentChip",
        "props": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "File name, truncated with an ellipsis when it outgrows the tile."
          },
          {
            "name": "fileType",
            "type": "DocumentChipFileType",
            "required": false,
            "description": "Document type — picks the leading Material Symbol.",
            "defaultValue": "generic"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Override the type icon — a Material Symbol name, or any custom element."
          },
          {
            "name": "meta",
            "type": "string",
            "required": false,
            "description": "Free-text metadata line, e.g. \"1.2 MB\" or \"12 pages\" — callers keep their own formatting."
          },
          {
            "name": "progress",
            "type": "number",
            "required": false,
            "description": "Upload progress, 0–100. While set, replaces the metadata line with a progress bar."
          },
          {
            "name": "error",
            "type": "string",
            "required": false,
            "description": "Error message — replaces the metadata line and colours the tile with the error pair."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Tile size. Compact drops the metadata line — name only — for dense composer rows.",
            "defaultValue": "default"
          },
          {
            "name": "onClick",
            "type": "MouseEventHandler<HTMLButtonElement>",
            "required": false,
            "description": "Click handler — presence makes the chip body (icon + text) an interactive button."
          },
          {
            "name": "onRemove",
            "type": "(() => void)",
            "required": false,
            "description": "Remove handler — renders a trailing close button."
          },
          {
            "name": "removeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the remove button.",
            "defaultValue": "Remove file"
          },
          {
            "name": "progressLabel",
            "type": "((name: string) => string)",
            "required": false,
            "description": "Accessible name of the upload progress bar, given the file name. Defaults to \"Uploading <name>\".",
            "defaultValue": "(fileName: string) => `Uploading ${fileName}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ],
        "deprecated": "Use `AttachmentTile` instead."
      }
    ]
  },
  {
    "kind": "component",
    "name": "Drawer",
    "label": "Drawer",
    "slug": "drawer",
    "category": "overlays",
    "description": "An edge-anchored modal panel that slides in from any side, for filter panels, detail views, and mobile navigation.",
    "client": true,
    "importPath": "rift-ds/components/Drawer/Drawer",
    "barrel": "main",
    "exports": [
      {
        "component": "Drawer",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the drawer is open"
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Callback when the drawer requests to close"
          },
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Drawer title.\nNote: this shadows the native `title` tooltip attribute, which Drawer does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Optional subtitle under the title"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Drawer body content"
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "required": false,
            "description": "Optional footer slot — typically a row of Buttons"
          },
          {
            "name": "side",
            "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
            "required": false,
            "description": "Edge the panel slides in from",
            "defaultValue": "right"
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Panel size along the axis it slides on",
            "defaultValue": "md"
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether ESC, scrim click, and the close button can dismiss",
            "defaultValue": "true"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the close button.",
            "defaultValue": "Close drawer"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the portal container, not the panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Dropdown",
    "label": "Dropdown",
    "slug": "dropdown",
    "category": "forms",
    "description": "Custom select dropdown with keyboard navigation, disabled options, and error states.",
    "client": true,
    "importPath": "rift-ds/components/Dropdown/Dropdown",
    "barrel": "main",
    "exports": [
      {
        "component": "Dropdown",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Dropdown label text"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Placeholder when no value selected",
            "defaultValue": "Select an option"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected value, controlled. Leave undefined to let the\ndropdown keep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Selected value on first render when uncontrolled (`value` undefined)."
          },
          {
            "name": "options",
            "type": "DropdownOption[]",
            "required": true,
            "description": "Available options (flat list)"
          },
          {
            "name": "groups",
            "type": "DropdownOptionGroup[]",
            "required": false,
            "description": "Optional grouped options — when provided, renders groups with labels and separators"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the dropdown is disabled",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Whether the dropdown is required",
            "defaultValue": "false"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the newly selected value"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the list is open, controlled. Leave undefined to let the dropdown open and close itself."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the list starts open when uncontrolled (`open` undefined).",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires when the list opens or closes, with the new state."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Used only as a fallback for deriving the element id (`id || name || label`).\n\nNote: Dropdown renders a `<div role=\"combobox\">`, not a native `<select>`,\nso `name` does **not** make it participate in native form submission."
          }
        ]
      },
      {
        "component": "ChosenMark",
        "props": [
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "DropdownMenu",
    "label": "Dropdown menu",
    "slug": "dropdown-menu",
    "category": "overlays",
    "description": "Action menu opened from a trigger, with groups, sub-menus, shortcuts, radio and checkbox items, placed to stay on screen.",
    "client": true,
    "importPath": "rift-ds/components/DropdownMenu/DropdownMenu",
    "barrel": "main",
    "exports": [
      {
        "component": "DropdownMenu",
        "props": [
          {
            "name": "trigger",
            "type": "ReactNode",
            "required": true,
            "description": "Trigger element that opens the menu"
          },
          {
            "name": "items",
            "type": "DropdownMenuEntry[]",
            "required": true,
            "description": "Menu entries (items, groups, separators)"
          },
          {
            "name": "align",
            "type": "\"start\" | \"end\"",
            "required": false,
            "description": "Horizontal alignment of the panel",
            "defaultValue": "start"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the menu is open (controlled mode)"
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the menu starts open when uncontrolled",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Callback when the menu opens or closes"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the root wrapper, which holds the trigger and the panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "EmptyState",
    "label": "Empty state",
    "slug": "empty-state",
    "category": "feedback",
    "description": "The placeholder for a list, table, or search with nothing to show: icon, headline, guidance, and a next action.",
    "client": false,
    "importPath": "rift-ds/components/EmptyState/EmptyState",
    "barrel": "main",
    "exports": [
      {
        "component": "EmptyState",
        "props": [
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Material Symbol icon name, or a custom element (e.g. an illustration)"
          },
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Short headline describing the empty condition.\nNote: this shadows the native `title` tooltip attribute, which EmptyState does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Supporting copy — say what to do next, not just what is missing"
          },
          {
            "name": "action",
            "type": "ReactNode",
            "required": false,
            "description": "Action slot — typically one primary Button, optionally a secondary"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "variant",
            "type": "\"plain\" | \"bordered\"",
            "required": false,
            "description": "Visual treatment. `plain` sits directly on the page; `bordered` draws a\ndashed container, which reads better inside a card, table, or panel.",
            "defaultValue": "plain"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "EntityCard",
    "label": "Entity card",
    "slug": "entity-card",
    "category": "data-display",
    "description": "Compact display-only card with a centred icon or image and a label, used in the Icons and Logos galleries.",
    "client": false,
    "importPath": "rift-ds/components/EntityCard/EntityCard",
    "barrel": "main",
    "exports": [
      {
        "component": "EntityCard",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "Display label beneath the icon / image"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon — Material Symbol name (string, e.g. \"home\") rendered via the rounded font, or custom element (ReactNode)"
          },
          {
            "name": "imageSrc",
            "type": "string",
            "required": false,
            "description": "Path to an image asset — used instead of icon when provided"
          },
          {
            "name": "imageAlt",
            "type": "string",
            "required": false,
            "description": "Alt text for the image"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "EventCalendar",
    "label": "Event calendar",
    "slug": "event-calendar",
    "category": "data-display",
    "description": "A month grid with event pills, overflow counts, and month navigation.",
    "client": true,
    "importPath": "rift-ds/components/EventCalendar/EventCalendar",
    "barrel": "main",
    "exports": [
      {
        "component": "EventCalendar",
        "props": [
          {
            "name": "events",
            "type": "EventCalendarEvent[]",
            "required": false,
            "description": "The events to place on the grid, including any that fall on the visible leading and trailing days of the neighbouring months.",
            "defaultValue": "[]"
          },
          {
            "name": "month",
            "type": "string",
            "required": false,
            "description": "Shown month (YYYY-MM) for controlled use. Pair with `onMonthChange`."
          },
          {
            "name": "defaultMonth",
            "type": "string",
            "required": false,
            "description": "Initially shown month (YYYY-MM) for uncontrolled use. Defaults to the current month."
          },
          {
            "name": "onMonthChange",
            "type": "((month: string) => void)",
            "required": false,
            "description": "Fires with the newly shown month (YYYY-MM) after prev/next navigation."
          },
          {
            "name": "maxEventsPerDay",
            "type": "number",
            "required": false,
            "description": "Event pills shown per day before the rest collapse into \"+N more\".",
            "defaultValue": "3"
          },
          {
            "name": "onEventClick",
            "type": "((event: EventCalendarEvent) => void)",
            "required": false,
            "description": "Fires with the clicked event. Pills only render as buttons when this is set."
          },
          {
            "name": "onDateClick",
            "type": "((date: string) => void)",
            "required": false,
            "description": "Fires with the clicked day (YYYY-MM-DD) — from anywhere on the cell, the\nday number, and the \"+N more\" overflow row. The number and overflow row\nonly become buttons when this is set, and cells only take their pointer\ncursor and hover feedback with it."
          },
          {
            "name": "selectedDate",
            "type": "string",
            "required": false,
            "description": "Marks this day (YYYY-MM-DD) as the selected one — the action-colour chip\non its number, taking precedence over the today chip. Controlled by the\nconsumer; pair with `onDateClick` to move it."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing header slot, e.g. a \"New event\" Button."
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the previous-month button.",
            "defaultValue": "Previous month"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the next-month button.",
            "defaultValue": "Next month"
          },
          {
            "name": "monthLabel",
            "type": "((month: Date) => string)",
            "required": false,
            "description": "The month heading, given the first day of the month in view: the visible\ntitle and the name of the day grid. Defaults to the English month name\nand the year.",
            "defaultValue": "(month: Date): string =>\n  `${MONTHS[month.getMonth()]} ${month.getFullYear()}`"
          },
          {
            "name": "overflowLabel",
            "type": "((count: number, date: Date) => string)",
            "required": false,
            "description": "Accessible name of a day's \"+N more\" overflow button, given the number of\nhidden events and the day. Defaults to \"N more events\" followed by the\nfull date in the user's locale.",
            "defaultValue": "(count: number, date: Date): string =>\n  `${count} more event${count === 1 ? '' : 's'}, ${formatDayLabel(date)}`"
          },
          {
            "name": "moreLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The visible text of a day's overflow row, given the number of hidden\nevents. Defaults to \"+N more\". The row's accessible name is\n`overflowLabel` when it is a button.",
            "defaultValue": "(count: number): string => `+${count} more`"
          },
          {
            "name": "weekdayLabels",
            "type": "string[]",
            "required": false,
            "description": "The weekday headers above the grid: seven entries, Sunday first.\nDefaults to the English three-letter abbreviations (\"Sun\" to \"Sat\"); a\nlist of any other length falls back to the default."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Field",
    "label": "Field",
    "slug": "field",
    "category": "forms",
    "description": "The shared scaffolding for labelled form controls: label, required marker, helper and error text, and the ARIA wiring that ties them together.",
    "client": true,
    "importPath": "rift-ds/components/Field/Field",
    "barrel": "main",
    "exports": [
      {
        "component": "Field",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text rendered above the control"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The form control this field labels"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered below the control"
          },
          {
            "name": "aside",
            "type": "ReactNode",
            "required": false,
            "description": "Optional content rendered opposite the helper text — a character counter,\na unit, a \"0/280\". Present only when supplied; without it the helper sits\ndirectly in the field's column and no extra wrapper is introduced."
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the control invalid",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Marks the field required and renders the required marker",
            "defaultValue": "false"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the control is disabled — dims the label",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "group",
            "type": "boolean",
            "required": false,
            "description": "Group mode: renders the label as a `<span id>` instead of a\n`<label htmlFor>`, for scaffolding a set of controls (a checkbox or\nradio group) where no single labelable element exists — the group node\npoints `aria-labelledby` at the span via `labelId`.",
            "defaultValue": "false"
          },
          {
            "name": "id",
            "type": "string",
            "required": false,
            "description": "id for the control. Generated when omitted, so the label/control/helper\nassociation works with no configuration."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Figure",
    "label": "Figure",
    "slug": "figure",
    "category": "data-display",
    "description": "Images with captions, in the case-study frame.",
    "client": false,
    "importPath": "rift-ds/components/Figure/Figure",
    "barrel": "main",
    "exports": [
      {
        "component": "Figure",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "The image element — a plain <img> or a framework image component"
          },
          {
            "name": "caption",
            "type": "ReactNode",
            "required": false,
            "description": "Caption rendered below the image"
          },
          {
            "name": "onClick",
            "type": "MouseEventHandler<HTMLButtonElement>",
            "required": false,
            "description": "Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support.\nIt is attached to the zoom button wrapping the image, not to the\n`<figure>`, so it replaces the native `onClick` on the root."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "FileInput",
    "label": "File input",
    "slug": "file-input",
    "category": "forms",
    "description": "A click-or-drop upload zone paired with a controlled file list showing size, progress, and per-file errors.",
    "client": true,
    "importPath": "rift-ds/components/FileInput/FileInput",
    "barrel": "main",
    "exports": [
      {
        "component": "FileInput",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Field label above the dropzone"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Instructional copy inside the dropzone",
            "defaultValue": "Drag and drop, or click to browse"
          },
          {
            "name": "files",
            "type": "FileInputFile[]",
            "required": false,
            "description": "Files to list under the dropzone",
            "defaultValue": "[]"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the field"
          },
          {
            "name": "acceptHint",
            "type": "((accept: string) => string)",
            "required": false,
            "description": "Hint shown under the placeholder when `accept` is set, given the `accept` value. Defaults to \"Accepts\" followed by the value.",
            "defaultValue": "(acceptValue: string) => `Accepts ${acceptValue}`"
          },
          {
            "name": "onFilesSelected",
            "type": "((files: File[]) => void)",
            "required": false,
            "description": "Called with the newly selected files"
          },
          {
            "name": "onFileRemove",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Called with the id of a file whose remove button was pressed"
          },
          {
            "name": "progressLabel",
            "type": "((name: string) => string)",
            "required": false,
            "description": "Accessible name of a listed file's progress bar, given the file name. Defaults to \"Uploading\" followed by the name.",
            "defaultValue": "(fileName: string) => `Uploading ${fileName}`"
          },
          {
            "name": "removeLabel",
            "type": "((name: string) => string)",
            "required": false,
            "description": "Accessible name of a listed file's remove button, given the file name. Defaults to \"Remove\" followed by the name.",
            "defaultValue": "(fileName: string) => `Remove ${fileName}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "FilterBar",
    "label": "Filter bar",
    "slug": "filter-bar",
    "category": "forms",
    "description": "A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.",
    "client": true,
    "importPath": "rift-ds/components/FilterBar/FilterBar",
    "barrel": "main",
    "exports": [
      {
        "component": "FilterBar",
        "props": [
          {
            "name": "filters",
            "type": "FilterBarFilter[]",
            "required": true,
            "description": "The filters on the bar, in display order."
          },
          {
            "name": "values",
            "type": "Record<string, string[]>",
            "required": false,
            "description": "Active options per filter id (controlled). Pair with `onValuesChange`."
          },
          {
            "name": "defaultValues",
            "type": "Record<string, string[]>",
            "required": false,
            "description": "Active options per filter id (uncontrolled initial state)."
          },
          {
            "name": "onValuesChange",
            "type": "((values: Record<string, string[]>) => void)",
            "required": false,
            "description": "Fires with the full active-filter map on every change. Filters with\nnothing active are absent from the map, so an empty object means\nunfiltered."
          },
          {
            "name": "clearLabel",
            "type": "string",
            "required": false,
            "description": "Label for the button that clears every filter at once.",
            "defaultValue": "Clear all"
          },
          {
            "name": "clearFilterLabel",
            "type": "((filterLabel: string) => string)",
            "required": false,
            "description": "Accessible name of an active filter's own clear button, given the filter's label. Defaults to \"Clear\" followed by the label.",
            "defaultValue": "(filterLabel: string) => `Clear ${filterLabel}`"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "FunnelChart",
    "label": "Funnel chart",
    "slug": "funnel-chart",
    "category": "charts",
    "description": "Ordered funnel stages as centred trapezoid bands, each sized by its share of the first stage.",
    "client": true,
    "importPath": "rift-ds/components/FunnelChart/FunnelChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "FunnelChart",
        "props": [
          {
            "name": "data",
            "type": "FunnelStage[]",
            "required": true,
            "description": "Ordered stages, first stage widest. Each later stage's width is its share of the first."
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header.\nNote: this shadows the native `title` tooltip attribute, which FunnelChart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title."
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels.",
            "defaultValue": "190"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Shows each stage's name beside its band. Turn off when a legend under the chart already carries the names.",
            "defaultValue": "true"
          },
          {
            "name": "summaryLabel",
            "type": "((data: FunnelStage[]) => string)",
            "required": false,
            "description": "The chart's accessible name, summarising every stage, given `data` when it\nholds at least one stage. Defaults to \"Funnel: \" then each stage's label and\nreading (its `displayValue`, else the value in the reader's locale),\ncomma-separated, e.g. \"Funnel: Visits 12,400, Sign-ups 3,100\".",
            "defaultValue": "(data: FunnelStage[]) =>\n  `Funnel: ${data\n    .map((stage) => `${stage.label} ${stage.displayValue ?? stage.value.toLocaleString()}`)\n    .join(', ')}`"
          },
          {
            "name": "emptyLabel",
            "type": "string",
            "required": false,
            "description": "The chart's accessible name when `data` is empty. Defaults to \"Funnel, no data\".",
            "defaultValue": "Funnel, no data"
          },
          {
            "name": "minStageShare",
            "type": "number",
            "required": false,
            "description": "Floor percentage from the stepped-bar rendering this chart used to have.",
            "deprecated": "The funnel now draws true trapezoids sized by value, so a\nheight floor no longer applies; the prop is ignored."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "GanttChart",
    "label": "Gantt chart",
    "slug": "gantt-chart",
    "category": "charts",
    "description": "Phases and tasks as bars on a shared timeline, with milestones, progress, and a today rule.",
    "client": false,
    "importPath": "rift-ds/components/GanttChart/GanttChart",
    "barrel": "main",
    "exports": [
      {
        "component": "GanttChart",
        "props": [
          {
            "name": "items",
            "type": "GanttChartItem[]",
            "required": true,
            "description": "Task bars, in display order."
          },
          {
            "name": "milestones",
            "type": "GanttChartMilestone[]",
            "required": false,
            "description": "Point-in-time markers, each rendered as its own diamond row at the end of its group.",
            "defaultValue": "[]"
          },
          {
            "name": "range",
            "type": "{ start: string; end: string; }",
            "required": false,
            "description": "Explicit timeline window (YYYY-MM-DD both ends). Without it the range fits the data. Either way the window snaps outward to whole months, so an explicit range starts on the first of its start month and runs to the end of its end month."
          },
          {
            "name": "showToday",
            "type": "boolean",
            "required": false,
            "description": "Draws the vertical today rule when today falls inside the range.",
            "defaultValue": "true"
          },
          {
            "name": "today",
            "type": "string",
            "required": false,
            "description": "Pins the today rule to a given day (YYYY-MM-DD) instead of the render-time clock, so a statically built page and its hydrating client can never disagree about where the rule sits."
          },
          {
            "name": "showGrid",
            "type": "boolean",
            "required": false,
            "description": "Draws the faint vertical gridline at each month boundary behind the bars.",
            "defaultValue": "true"
          },
          {
            "name": "selectedId",
            "type": "string",
            "required": false,
            "description": "Id of the highlighted item. Selection is controlled; pair it with `onItemClick`."
          },
          {
            "name": "onItemClick",
            "type": "((item: GanttChartItem) => void)",
            "required": false,
            "description": "Called with the item when a bar is clicked. Bars render as buttons only when this is set; without it the chart is inert and renders from a Server Component."
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header.\nNote: this shadows the native `title` tooltip attribute, which GanttChart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title."
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "todayLabel",
            "type": "string",
            "required": false,
            "description": "The visible label on the today rule. Defaults to \"Today\".",
            "defaultValue": "Today"
          },
          {
            "name": "locale",
            "type": "string",
            "required": false,
            "description": "The BCP 47 locale the dates are written in: the month names on the axis\n(\"Jan 2026\", then \"Feb\"), and the days in each bar's and milestone's\ntooltip and accessible text (\"Mar 9, 2026\"). Defaults to `en-US`.",
            "defaultValue": "en-US"
          },
          {
            "name": "rangeLabel",
            "type": "((start: string, end: string) => string)",
            "required": false,
            "description": "The span in a bar's tooltip and accessible text, given its first and last day already formatted in `locale`. Defaults to \"<start> to <end>\".",
            "defaultValue": "(start: string, end: string) => `${start} to ${end}`"
          },
          {
            "name": "progressLabel",
            "type": "((percent: number) => string)",
            "required": false,
            "description": "The completion in a bar's tooltip and accessible text, given the rounded percentage. Defaults to \"<percent>% complete\".",
            "defaultValue": "(percent: number) => `${percent}% complete`"
          },
          {
            "name": "projectedLabel",
            "type": "string",
            "required": false,
            "description": "The word a `projected` bar's tooltip and accessible text carries. Defaults to \"projected\".",
            "defaultValue": "projected"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Gauge",
    "label": "Gauge",
    "slug": "gauge",
    "category": "charts",
    "description": "A radial dial for a single bounded reading, recoloured through the status roles as it crosses thresholds.",
    "client": false,
    "importPath": "rift-ds/components/Gauge/Gauge",
    "barrel": "main",
    "exports": [
      {
        "component": "Gauge",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": true,
            "description": "Current reading. Clamped into the `min`–`max` range for drawing."
          },
          {
            "name": "min",
            "type": "number",
            "required": false,
            "description": "Lower bound of the dial.",
            "defaultValue": "0"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Upper bound of the dial.",
            "defaultValue": "100"
          },
          {
            "name": "tone",
            "type": "\"error\" | \"positive\" | \"warning\" | \"neutral\" | \"accent\"",
            "required": false,
            "description": "Colour role for the value arc. `accent` (the default) follows the chart\npalette's lead colour. Ignored while a threshold matches — thresholds\nexist so the dial recolours itself as the reading crosses them.",
            "defaultValue": "accent"
          },
          {
            "name": "thresholds",
            "type": "GaugeThreshold[]",
            "required": false,
            "description": "Colour switch points, e.g. warning at 70 and error at 90. The highest\nthreshold at or below the current reading wins; below them all, the\n`tone` prop applies."
          },
          {
            "name": "showValue",
            "type": "boolean",
            "required": false,
            "description": "Shows the reading in the centre of the dial.",
            "defaultValue": "true"
          },
          {
            "name": "formatValue",
            "type": "((value: number) => string)",
            "required": false,
            "description": "Formats the centre reading — for units, precision, or locale."
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "What the reading measures, shown as a caption under it and used as the\naccessible name, e.g. \"CPU usage\"."
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header.\nNote: this shadows the native `title` tooltip attribute, which Gauge does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title."
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "number",
            "required": false,
            "description": "Rendered dial diameter in pixels. The arc geometry scales with it.",
            "defaultValue": "120"
          },
          {
            "name": "strokeWidth",
            "type": "number",
            "required": false,
            "description": "Arc thickness in pixels.",
            "defaultValue": "12"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Globe",
    "label": "Globe",
    "slug": "globe",
    "category": "maps",
    "description": "An orthographic globe with markers and great-circle arcs, rotated by drag, keys, or a slow spin.",
    "client": true,
    "importPath": "rift-ds/components/Globe/Globe",
    "barrel": "main",
    "exports": [
      {
        "component": "Globe",
        "props": [
          {
            "name": "points",
            "type": "GlobePoint[]",
            "required": false,
            "description": "The places to mark.",
            "defaultValue": "[]"
          },
          {
            "name": "arcs",
            "type": "GlobeArc[]",
            "required": false,
            "description": "The arcs to draw between them. An arc whose endpoint is not in `points` is skipped.",
            "defaultValue": "[]"
          },
          {
            "name": "rotation",
            "type": "GlobeRotation",
            "required": false,
            "description": "Controlled view: `[longitude, latitude]` of the centre, in degrees.\nPair with `onRotationChange`. Omit to let the globe own its rotation."
          },
          {
            "name": "defaultRotation",
            "type": "GlobeRotation",
            "required": false,
            "description": "Initial view when uncontrolled.",
            "defaultValue": "[-20, 20]"
          },
          {
            "name": "onRotationChange",
            "type": "((rotation: GlobeRotation) => void)",
            "required": false,
            "description": "Fires whenever the view changes — drag, keys, or the auto-rotation."
          },
          {
            "name": "autoRotate",
            "type": "number",
            "required": false,
            "description": "Spin slowly on its own, in degrees per second at the shipped motion\ntempo. The speed follows `--motion-duration-orbit`, so a theme that\nstretches or shortens its durations slows or quickens the spin with\nthem. Pauses while the pointer is over the globe or it has focus, and\nnever runs under `prefers-reduced-motion`. `0` switches it off.",
            "defaultValue": "3"
          },
          {
            "name": "interactive",
            "type": "boolean",
            "required": false,
            "description": "Drag to rotate, and rotate with the arrow keys (or W, A, S, D) when focused.",
            "defaultValue": "true"
          },
          {
            "name": "graticuleStep",
            "type": "number",
            "required": false,
            "description": "Degrees between graticule lines. `0` removes the graticule.",
            "defaultValue": "30"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Draw each point's `label` beside its marker.",
            "defaultValue": "true"
          },
          {
            "name": "activePointId",
            "type": "string",
            "required": false,
            "description": "The point to single out: its marker enlarges and its callout renders."
          },
          {
            "name": "onPointHover",
            "type": "((point: GlobePoint | null) => void)",
            "required": false,
            "description": "Fires as the pointer enters a marker (or it takes focus), and with `null` as it leaves."
          },
          {
            "name": "onPointClick",
            "type": "((point: GlobePoint) => void)",
            "required": false,
            "description": "Fires when a marker is clicked, or activated with Enter or Space while\nfocused. Setting it makes the markers real buttons on a non-interactive\nglobe too."
          },
          {
            "name": "renderCallout",
            "type": "((point: GlobePoint) => ReactNode)",
            "required": false,
            "description": "Renders the annotation for the active (or hovered) point. It is placed\nbeside the marker in an HTML overlay, so any markup works; MapCallout is\nthe intended filling. The overlay carries `data-side=\"left\"|\"right\"` for\nwhich side of the marker it sits on."
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the globe, e.g. \"Listening points across the\nnetwork\". The point and arc counts are appended for screen readers.",
            "defaultValue": "Globe"
          },
          {
            "name": "pointsLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The point count appended to the globe's accessible name, given the count. Defaults to \"<count> point\" or \"<count> points\".",
            "defaultValue": "(count: number) => `${count} ${count === 1 ? 'point' : 'points'}`"
          },
          {
            "name": "arcsLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The arc count appended to the globe's accessible name, given the count. Defaults to \"<count> arc\" or \"<count> arcs\".",
            "defaultValue": "(count: number) => `${count} ${count === 1 ? 'arc' : 'arcs'}`"
          },
          {
            "name": "rotateHintLabel",
            "type": "string",
            "required": false,
            "description": "The pointer and keyboard instructions appended to the accessible name while `interactive`.",
            "defaultValue": "Drag to rotate, or use the arrow keys when focused."
          },
          {
            "name": "roleDescription",
            "type": "string",
            "required": false,
            "description": "What assistive technology calls the globe in place of its role, applied\nwhichever role it takes: `application` while `interactive`, `group` when\nonly `onPointClick` makes the markers buttons, and `img` otherwise.\nDefaults to \"globe\".",
            "defaultValue": "globe"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "HoverCard",
    "label": "Hover card",
    "slug": "hover-card",
    "category": "overlays",
    "description": "Rich preview panel that opens from hover or focus, with interactive content and position options.",
    "client": true,
    "importPath": "rift-ds/components/HoverCard/HoverCard",
    "barrel": "main",
    "exports": [
      {
        "component": "HoverCard",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Trigger element"
          },
          {
            "name": "content",
            "type": "ReactNode",
            "required": true,
            "description": "Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse.\nNote: this shadows the native `content` attribute, which HoverCard does not expose."
          },
          {
            "name": "position",
            "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
            "required": false,
            "description": "Preferred position",
            "defaultValue": "bottom"
          },
          {
            "name": "showDelay",
            "type": "number",
            "required": false,
            "description": "Delay before showing (in ms)",
            "defaultValue": "300"
          },
          {
            "name": "hideDelay",
            "type": "number",
            "required": false,
            "description": "Delay before hiding (in ms)",
            "defaultValue": "150"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ImageCompare",
    "label": "Image compare",
    "slug": "image-compare",
    "category": "data-display",
    "description": "Before-and-after image comparison with a draggable divider, keyboard control, and corner labels.",
    "client": true,
    "importPath": "rift-ds/components/ImageCompare/ImageCompare",
    "barrel": "main",
    "exports": [
      {
        "component": "ImageCompare",
        "props": [
          {
            "name": "beforeSrc",
            "type": "string",
            "required": true,
            "description": "Source of the image revealed on the left of the divider"
          },
          {
            "name": "afterSrc",
            "type": "string",
            "required": true,
            "description": "Source of the image revealed on the right of the divider"
          },
          {
            "name": "beforeAlt",
            "type": "string",
            "required": true,
            "description": "Alt text for the before image"
          },
          {
            "name": "afterAlt",
            "type": "string",
            "required": true,
            "description": "Alt text for the after image"
          },
          {
            "name": "beforeLabel",
            "type": "string",
            "required": false,
            "description": "Corner label over the before side",
            "defaultValue": "Before"
          },
          {
            "name": "afterLabel",
            "type": "string",
            "required": false,
            "description": "Corner label over the after side",
            "defaultValue": "After"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Whether the corner labels render",
            "defaultValue": "true"
          },
          {
            "name": "handleLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the divider handle. Defaults to the two corner labels joined as \"Before and After comparison\"."
          },
          {
            "name": "handleValueText",
            "type": "((position: number) => string)",
            "required": false,
            "description": "Spoken value of the divider handle, given its whole-percent position. Defaults to the percentage followed by the before label in lower case."
          },
          {
            "name": "position",
            "type": "number",
            "required": false,
            "description": "Divider position as a percentage from the left (controlled)"
          },
          {
            "name": "defaultPosition",
            "type": "number",
            "required": false,
            "description": "Initial divider position for uncontrolled use",
            "defaultValue": "50"
          },
          {
            "name": "onPositionChange",
            "type": "((position: number) => void)",
            "required": false,
            "description": "Convenience callback receiving the divider position on every change"
          },
          {
            "name": "aspectRatio",
            "type": "string",
            "required": false,
            "description": "CSS aspect-ratio of the frame (both images are sized to cover it)",
            "defaultValue": "16 / 10"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Input",
    "label": "Input",
    "slug": "input",
    "category": "forms",
    "description": "Text input with label, placeholder, left and right icons, helper text, and error states.",
    "client": true,
    "importPath": "rift-ds/components/Input/Input",
    "barrel": "main",
    "exports": [
      {
        "component": "Input",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Input label text"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current value"
          },
          {
            "name": "type",
            "type": "\"number\" | \"search\" | \"text\" | \"tel\" | \"url\" | \"email\" | \"password\"",
            "required": false,
            "description": "Input type — curated subset; use a dedicated component for checkbox/radio/file",
            "defaultValue": "text"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the input"
          },
          {
            "name": "iconLeft",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "iconRight",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing icon — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries (react-hook-form, Formik, TanStack Form) work unmodified."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorColorPicker",
    "label": "Inspector colour picker",
    "slug": "inspector-color-picker",
    "category": "inspector",
    "description": "One-row colour setting for inspector panels, with the hex and a round swatch at the bar's end and ColorPicker's own panel.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorColorPicker",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorColorPicker",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left. Also the start of the trigger's accessible name."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current colour as a hex string — 3, 6 or 8 digit, with or without `#`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initial colour for uncontrolled use."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the colour as an uppercase hex string (`#RRGGBB`, or\n`#RRGGBBAA` when `showAlpha` and alpha is below 100%). Fires live while\ndragging, as in ColorPicker."
          },
          {
            "name": "showAlpha",
            "type": "boolean",
            "required": false,
            "description": "Add an alpha (opacity) slider to the panel and emit 8-digit hex when alpha is below 100%.",
            "defaultValue": "false"
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "When set, a hidden input carries the current hex under this name, so the picker joins native form submission."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is disabled.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px.",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the wrapper.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorDropdown",
    "label": "Inspector dropdown",
    "slug": "inspector-dropdown",
    "category": "inspector",
    "description": "One-row select for inspector panels, with the name inside the bar and the library Dropdown's menu and font previews.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorDropdown",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorDropdown",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left. Also the dropdown's accessible name."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected value, controlled. Leave undefined to let the\ndropdown keep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Selected value on first render when uncontrolled (`value` undefined)."
          },
          {
            "name": "options",
            "type": "DropdownOption[]",
            "required": true,
            "description": "Available options (flat list). Each option's `font` previews the face, as in Dropdown."
          },
          {
            "name": "groups",
            "type": "DropdownOptionGroup[]",
            "required": false,
            "description": "Optional grouped options. When provided, renders groups with labels and separators."
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Shown on the right when nothing is selected."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the dropdown is disabled.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px.",
            "defaultValue": "default"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the newly selected value."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the wrapper.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorInput",
    "label": "Inspector input",
    "slug": "inspector-input",
    "category": "inspector",
    "description": "One-row text field for inspector panels, with the name on the left and the value right-aligned in the bar.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorInput",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorInput",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left, as the field's real <label>."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current value."
          },
          {
            "name": "type",
            "type": "\"search\" | \"text\" | \"tel\" | \"url\" | \"email\"",
            "required": false,
            "description": "Input type: a curated subset of the single-line text types.",
            "defaultValue": "text"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute).",
            "defaultValue": "default"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries work unmodified."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the bar rather than the <input>.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorSection",
    "label": "Inspector section",
    "slug": "inspector-section",
    "category": "inspector",
    "description": "Collapsible, titled run of inspector controls whose open body lets a dropdown menu open past its edge.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorSection",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorSection",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The section's heading, shown on its header row. Not the native tooltip `title` attribute."
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the section is expanded (controlled). Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether an uncontrolled section starts expanded.",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Called with the next expanded state when the header is pressed."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The section's controls, stacked one rhythm apart."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the <section>.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorSegmentedControl",
    "label": "Inspector segments",
    "slug": "inspector-segmented-control",
    "category": "inspector",
    "description": "One-row choice between a few options for inspector panels, as native radios under a sliding selection pill.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorSegmentedControl",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorSegmentedControl",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left. Names the radiogroup."
          },
          {
            "name": "options",
            "type": "InspectorSegment[]",
            "required": true,
            "description": "The choices, drawn left to right in the bar's end."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "The selected value (controlled). Leave unset and use `defaultValue` for an uncontrolled set."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "The starting selection for an uncontrolled set."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "The radios' shared `name`, for native form submission. Generated when unset."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Takes the whole set out of use.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px.",
            "defaultValue": "default"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the newly chosen value."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the bar.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorSlider",
    "label": "Inspector slider",
    "slug": "inspector-slider",
    "category": "inspector",
    "description": "One-row slider for inspector panels, where the whole bar is the control and its fill is the value.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorSlider",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorSlider",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left. Also the range's accessible name."
          },
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current value (controlled). Leave unset and use `defaultValue` for an uncontrolled slider."
          },
          {
            "name": "defaultValue",
            "type": "number",
            "required": false,
            "description": "Starting value for an uncontrolled slider. Defaults to `min`."
          },
          {
            "name": "min",
            "type": "number",
            "required": false,
            "description": "Minimum value.",
            "defaultValue": "0"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Maximum value.",
            "defaultValue": "100"
          },
          {
            "name": "step",
            "type": "number",
            "required": false,
            "description": "Step increment. Also sets how many decimals the reading shows (0.02 reads \"0.50\").",
            "defaultValue": "1"
          },
          {
            "name": "format",
            "type": "((value: number) => string)",
            "required": false,
            "description": "Formats the reading on the right, and the value a screen reader announces. Defaults to the step's precision."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute).",
            "defaultValue": "default"
          },
          {
            "name": "onValueChange",
            "type": "((value: number) => void)",
            "required": false,
            "description": "Convenience callback receiving the numeric value directly.\nFires alongside `onChange`, which keeps the standard React event signature."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the bar rather than the <input>.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InspectorToggleSwitch",
    "label": "Inspector toggle switch",
    "slug": "inspector-toggle-switch",
    "category": "inspector",
    "description": "One-row switch for inspector panels, where the whole bar toggles and the track sits at its end.",
    "client": true,
    "importPath": "rift-ds/components/Inspector/InspectorToggleSwitch",
    "barrel": "main",
    "exports": [
      {
        "component": "InspectorToggleSwitch",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The setting's name, drawn inside the bar on the left. Also the switch's accessible name."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute).",
            "defaultValue": "default"
          },
          {
            "name": "onCheckedChange",
            "type": "((checked: boolean) => void)",
            "required": false,
            "description": "Convenience callback receiving the checked state directly.\nFires alongside `onChange`, which keeps the standard React event signature."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the bar rather than the <input>.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Instructions",
    "label": "Instructions",
    "slug": "instructions",
    "category": "data-display",
    "description": "Step-by-step guidance with numbered badges, connecting lines, and horizontal layout.",
    "client": false,
    "importPath": "rift-ds/components/Instructions/Instructions",
    "barrel": "main",
    "exports": [
      {
        "component": "Instructions",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Instructions title, rendered as a heading above the steps.\nNote: this shadows the native `title` tooltip attribute, which Instructions does not expose."
          },
          {
            "name": "steps",
            "type": "InstructionStep[]",
            "required": true,
            "description": "Array of instruction steps"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "direction",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Layout direction",
            "defaultValue": "vertical"
          },
          {
            "name": "numbered",
            "type": "boolean",
            "required": false,
            "description": "What a step without an `icon` shows in its badge: its number when true\n(the default), a small dot when false. A step's own `icon` always wins.",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "InterruptCard",
    "label": "Interrupt card",
    "slug": "interrupt-card",
    "category": "ai",
    "description": "A human-in-the-loop checkpoint with a question from the agent and option buttons to decide.",
    "client": false,
    "importPath": "rift-ds/components/InterruptCard/InterruptCard",
    "barrel": "main",
    "exports": [
      {
        "component": "InterruptCard",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The question, e.g. \"Allow file edit?\".\nNote: this shadows the native `title` tooltip attribute, which InterruptCard does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "One line of context under the title."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading Material Symbol name, or any custom element. No icon by default."
          },
          {
            "name": "options",
            "type": "InterruptCardOption[]",
            "required": false,
            "description": "The choices, rendered as buttons left to right."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the chosen option's value."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "The already-chosen value. When set, the card renders its answered state:\nthe options are replaced by a quiet echo of the chosen label."
          },
          {
            "name": "answeredLabel",
            "type": "string",
            "required": false,
            "description": "Override the echoed text in the answered state (default: the chosen option's label)."
          },
          {
            "name": "waitingLabel",
            "type": "string",
            "required": false,
            "description": "Visually hidden status announced while the card waits for a decision. Defaults to \"Waiting for your decision\".",
            "defaultValue": "Waiting for your decision"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Detail slot between the description and the options — typically a\n`<ToolCall status=\"pending\">` showing what wants to run."
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (fill, border, radius) when the card sits inside another panel that supplies the surface, such as AiButton's request panel.",
            "defaultValue": "false"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Kbd",
    "label": "Kbd",
    "slug": "kbd",
    "category": "data-display",
    "description": "A keyboard key rendered as a keycap, for shortcut hints in menus and prose.",
    "client": false,
    "importPath": "rift-ds/components/Kbd/Kbd",
    "barrel": "main",
    "exports": [
      {
        "component": "Kbd",
        "props": [
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Key size",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The key legend — e.g. ⌘, K, Esc, Shift"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "LegendTile",
    "label": "Legend tile",
    "slug": "legend-tile",
    "category": "charts",
    "description": "The labelled value tile under a chart: a series dot, the series name, and its reading, on an inset fill.",
    "client": false,
    "importPath": "rift-ds/components/LegendTile/LegendTile",
    "barrel": "main",
    "exports": [
      {
        "component": "LegendTile",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The series name shown above the value. Truncates with an ellipsis rather than wrapping."
          },
          {
            "name": "value",
            "type": "string | number",
            "required": true,
            "description": "The reading for this series. Numbers are formatted with `toLocaleString()`;\npass a string when the value carries its own formatting or a unit."
          },
          {
            "name": "swatch",
            "type": "string",
            "required": false,
            "description": "Any CSS colour for the series dot — consumers typically pass a chart\npalette token, e.g. `var(--color-chart-series-1)`. When omitted, no dot\nrenders."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Lightbox",
    "label": "Lightbox",
    "slug": "lightbox",
    "category": "overlays",
    "description": "Fullscreen media viewer on the shared overlay stack: deep scrim, caption chip, gallery stepping, trapped and restored focus.",
    "client": true,
    "importPath": "rift-ds/components/Lightbox/Lightbox",
    "barrel": "main",
    "exports": [
      {
        "component": "Lightbox",
        "props": [
          {
            "name": "open",
            "type": "boolean",
            "required": true,
            "description": "Whether the lightbox is open"
          },
          {
            "name": "onOpenChange",
            "type": "(open: boolean) => void",
            "required": true,
            "description": "Callback when the lightbox requests to close"
          },
          {
            "name": "src",
            "type": "string",
            "required": false,
            "description": "The image to show. Omit it when `children` supplies the media."
          },
          {
            "name": "alt",
            "type": "string",
            "required": false,
            "description": "Image alt text — also the panel's accessible name. Required whenever `src` is set."
          },
          {
            "name": "caption",
            "type": "string",
            "required": false,
            "description": "Optional caption shown in a chip under the media"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Custom media instead of `src` — a framework image component, a video, a\nlive embed. Sized by the same viewport bounds the plain image gets."
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether ESC, backdrop click, and the close button can dismiss",
            "defaultValue": "true"
          },
          {
            "name": "onPrev",
            "type": "(() => void)",
            "required": false,
            "description": "Steps to the previous item. Providing it renders the previous chevron and\narms the Left arrow key — the consumer owns the collection and the index."
          },
          {
            "name": "onNext",
            "type": "(() => void)",
            "required": false,
            "description": "Steps to the next item — the next chevron and the Right arrow key."
          },
          {
            "name": "viewerLabel",
            "type": "string",
            "required": false,
            "description": "The panel's accessible name when neither `alt` nor `caption` is set.",
            "defaultValue": "Media viewer"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the close button.",
            "defaultValue": "Close viewer"
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the previous button, shown with `onPrev`.",
            "defaultValue": "Previous"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the next button, shown with `onNext`.",
            "defaultValue": "Next"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the portal container, not the panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "LineChart",
    "label": "Line chart",
    "slug": "line-chart",
    "category": "charts",
    "description": "Multi-series line chart for trends over time, with per-series colours and a summary row.",
    "client": true,
    "importPath": "rift-ds/components/Chart/LineChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "LineChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "label"
          },
          {
            "name": "series",
            "type": "LineSeriesConfig[]",
            "required": true,
            "description": "One or more line series to render"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "LinkList",
    "label": "Link list",
    "slug": "link-list",
    "category": "data-display",
    "description": "Linked items with logo, label, and subtitle.",
    "client": false,
    "importPath": "rift-ds/components/LinkList/LinkList",
    "barrel": "main",
    "exports": [
      {
        "component": "LinkList",
        "props": [
          {
            "name": "items",
            "type": "LinkListItem[]",
            "required": true,
            "description": "Links to render, in display order"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; a plain `<a>` when unset. This\ncomponent can render on the server, so it never reads a LinkProvider:\npass the prop even under one."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "MapCallout",
    "label": "Map callout",
    "slug": "map-callout",
    "category": "maps",
    "description": "The annotation beside a map point: a name in capitals over monospace readout lines.",
    "client": false,
    "importPath": "rift-ds/components/MapCallout/MapCallout",
    "barrel": "main",
    "exports": [
      {
        "component": "MapCallout",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The place's name, set in capitals: \"Santiago, CL\". Intentionally shadows\nthe native `title` tooltip attribute, which MapCallout does not expose."
          },
          {
            "name": "lines",
            "type": "ReactNode[]",
            "required": false,
            "description": "Readout lines under the title, in order: a status, a reading, a route.",
            "defaultValue": "[]"
          },
          {
            "name": "align",
            "type": "\"start\" | \"end\"",
            "required": false,
            "description": "Which way the text ranges. A callout sitting left of its marker ranges\nright so it hangs off the point; `start` is the ordinary reading order.",
            "defaultValue": "start"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "MapLegend",
    "label": "Map legend",
    "slug": "map-legend",
    "category": "maps",
    "description": "The corner block of a map: its name, what it shows, and the key to its markers.",
    "client": false,
    "importPath": "rift-ds/components/MapLegend/MapLegend",
    "barrel": "main",
    "exports": [
      {
        "component": "MapLegend",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "The map's name, set above the key. Intentionally shadows the native\n`title` tooltip attribute, which MapLegend does not expose."
          },
          {
            "name": "description",
            "type": "ReactNode",
            "required": false,
            "description": "One or two lines saying what the map shows."
          },
          {
            "name": "items",
            "type": "MapLegendItem[]",
            "required": false,
            "description": "The key itself: one row per marker kind.",
            "defaultValue": "[]"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Mention",
    "label": "Mention",
    "slug": "mention",
    "category": "ai",
    "description": "An inline reference to an entity or a skill, with the menu that @ or / opens while typing and the tag it leaves in the message.",
    "client": true,
    "importPath": "rift-ds/components/Mention/Mention",
    "barrel": "main",
    "exports": [
      {
        "component": "Mention",
        "props": [
          {
            "name": "trigger",
            "type": "string",
            "required": false,
            "description": "The character that opened the mention, drawn a step quieter than the name.",
            "defaultValue": "@"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The name: a person, a file, a skill."
          }
        ]
      },
      {
        "component": "MentionMenu",
        "props": [
          {
            "name": "items",
            "type": "MentionItem[]",
            "required": true,
            "description": "The items to list, already filtered and ordered."
          },
          {
            "name": "activeId",
            "type": "string",
            "required": false,
            "description": "The `id` of the highlighted item: the one Enter would choose."
          },
          {
            "name": "onActiveChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with an item's `id` when the pointer moves onto it."
          },
          {
            "name": "onSelect",
            "type": "((item: MentionItem) => void)",
            "required": false,
            "description": "Fires with the item a person chose.\nNote: this replaces the native `onSelect` text-selection event, which MentionMenu does not expose."
          },
          {
            "name": "query",
            "type": "string",
            "required": false,
            "description": "The text typed so far. The part of each label that matches it is drawn stronger.",
            "defaultValue": ""
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the list.",
            "defaultValue": "Suggestions"
          },
          {
            "name": "emptyText",
            "type": "ReactNode",
            "required": false,
            "description": "Shown in place of the list when `items` is empty. Without it an empty menu renders nothing."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "MentionText",
        "props": [
          {
            "name": "text",
            "type": "string",
            "required": true,
            "description": "The plain text, exactly as it was typed or sent."
          },
          {
            "name": "sources",
            "type": "MentionSource[]",
            "required": true,
            "description": "The sources whose items count as mentions in this text."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "MessageActions",
    "label": "Message actions",
    "slug": "message-actions",
    "category": "ai",
    "description": "An icon-button row for message-level actions like copy, retry, and feedback.",
    "client": false,
    "importPath": "rift-ds/components/MessageActions/MessageActions",
    "barrel": "main",
    "exports": [
      {
        "component": "MessageActions",
        "props": [
          {
            "name": "items",
            "type": "MessageAction[]",
            "required": true,
            "description": "The actions, rendered left to right."
          },
          {
            "name": "onActionClick",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the pressed action's id."
          },
          {
            "name": "showTooltips",
            "type": "boolean",
            "required": false,
            "description": "Wrap each button in a Tooltip showing its label. The label stays as `aria-label` either way.",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "MessageCard",
    "label": "Message card",
    "slug": "message-card",
    "category": "ai",
    "description": "A structured rich-content card embedded in a chat message, with media, title, body, and actions.",
    "client": false,
    "importPath": "rift-ds/components/MessageCard/MessageCard",
    "barrel": "main",
    "exports": [
      {
        "component": "MessageCard",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Card heading.\nNote: this shadows the native `title` tooltip attribute, which MessageCard does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "One or two lines under the title."
          },
          {
            "name": "media",
            "type": "ReactNode",
            "required": false,
            "description": "Top media slot — an image or chart, inset from the card edges with its own rounded corners."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Small leading icon beside the title — a Material Symbol name, or any custom element."
          },
          {
            "name": "meta",
            "type": "string",
            "required": false,
            "description": "Free-text metadata line, e.g. a domain or date, so callers keep their own formatting."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Action row rendered in a footer outside the body — small secondary or\ntertiary Buttons, mirroring ToolCall's actions footer."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Body content between the description and the footer — rich content, a Prose block, an AttachmentGroup."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Meter",
    "label": "Meter",
    "slug": "meter",
    "category": "feedback",
    "description": "Level indicator for a known quantity, with a status-coloured fill and an optional value readout.",
    "client": false,
    "importPath": "rift-ds/components/Meter/Meter",
    "barrel": "main",
    "exports": [
      {
        "component": "Meter",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current level",
            "defaultValue": "0"
          },
          {
            "name": "min",
            "type": "number",
            "required": false,
            "description": "Lower bound of the range",
            "defaultValue": "0"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Upper bound of the range",
            "defaultValue": "100"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Visible label naming what is measured, doubling as the meter's accessible\nname. A native `aria-label` takes precedence, and with neither the meter\nis announced as \"Level\"."
          },
          {
            "name": "showValue",
            "type": "boolean",
            "required": false,
            "description": "Shows the value readout on the trailing edge of the label row",
            "defaultValue": "false"
          },
          {
            "name": "valueText",
            "type": "string",
            "required": false,
            "description": "Readout override — replaces the default percentage, spoken via aria-valuetext"
          },
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Status role colouring the fill",
            "defaultValue": "info"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (bar height)",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ModelPicker",
    "label": "Model picker",
    "slug": "model-picker",
    "category": "ai",
    "description": "A model selector for chat surfaces, with per-model descriptions and an optional effort row.",
    "client": true,
    "importPath": "rift-ds/components/ModelPicker/ModelPicker",
    "barrel": "main",
    "exports": [
      {
        "component": "ModelPicker",
        "props": [
          {
            "name": "models",
            "type": "ModelPickerModel[]",
            "required": true,
            "description": "The models on offer, in display order."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Selected model value for controlled use. Pair with `onValueChange`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initially selected model value for uncontrolled use. Defaults to the first model."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the newly selected model's value."
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Text the trigger shows when no model is selected, and the trigger's\naccessible name when no `aria-label` is passed. Defaults to \"Choose a model\".",
            "defaultValue": "Choose a model"
          },
          {
            "name": "effort",
            "type": "string",
            "required": false,
            "description": "Selected effort level for controlled use. Setting this (or `defaultEffort`)\nis what makes the effort row appear at all."
          },
          {
            "name": "defaultEffort",
            "type": "string",
            "required": false,
            "description": "Initially selected effort level for uncontrolled use."
          },
          {
            "name": "onEffortChange",
            "type": "((effort: string) => void)",
            "required": false,
            "description": "Fires with the newly selected effort value."
          },
          {
            "name": "effortOptions",
            "type": "ModelPickerEffortOption[]",
            "required": false,
            "description": "The effort levels on offer. Defaults to low, medium and high.",
            "defaultValue": "[\n  { label: 'Low', value: 'low' },\n  { label: 'Medium', value: 'medium' },\n  { label: 'High', value: 'high' },\n]"
          },
          {
            "name": "listLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the model list in the open panel.",
            "defaultValue": "Model"
          },
          {
            "name": "effortLabel",
            "type": "string",
            "required": false,
            "description": "Heading of the effort row, which is also the accessible name of its radio group.",
            "defaultValue": "Effort"
          },
          {
            "name": "placement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the trigger the panel opens on. In a composer pinned to the bottom of the screen, use `top`.",
            "defaultValue": "bottom"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Trigger size, on the row-control scale: `default` is 40px, `compact` 32px, so it lines up with the fields and buttons beside it.",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the whole control is disabled.",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Nav",
    "label": "Nav",
    "slug": "nav",
    "category": "navigation",
    "description": "Desktop top navigation bar with a brand slot, horizontal button group, and optional trailing content.",
    "client": false,
    "importPath": "rift-ds/components/Nav/Nav",
    "barrel": "main",
    "exports": [
      {
        "component": "Nav",
        "props": [
          {
            "name": "brandText",
            "type": "string",
            "required": false,
            "description": "Brand/logo text"
          },
          {
            "name": "brandIcon",
            "type": "ReactNode",
            "required": false,
            "description": "Brand icon element (img, svg, etc.)"
          },
          {
            "name": "buttons",
            "type": "ButtonProps[]",
            "required": true,
            "description": "Navigation buttons config — passed directly to ButtonGroup"
          },
          {
            "name": "trailing",
            "type": "ReactNode",
            "required": false,
            "description": "Additional elements rendered after the button group (e.g. ToggleSwitch)"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "NavList",
    "label": "Nav list",
    "slug": "nav-list",
    "category": "navigation",
    "description": "Vertical list of navigation links for drawers and menus, with three indent levels and per-row expand toggles.",
    "client": true,
    "importPath": "rift-ds/components/NavList/NavList",
    "barrel": "main",
    "exports": [
      {
        "component": "NavList",
        "props": [
          {
            "name": "items",
            "type": "NavListItem[]",
            "required": true,
            "description": "Navigation tree to render."
          },
          {
            "name": "currentHref",
            "type": "string",
            "required": false,
            "description": "href of the current page — the exactly matching row gets `aria-current=\"page\"` and the active treatment."
          },
          {
            "name": "expandedIds",
            "type": "string[]",
            "required": false,
            "description": "Controlled list of expanded item ids."
          },
          {
            "name": "defaultExpandedIds",
            "type": "string[]",
            "required": false,
            "description": "Initially expanded item ids (uncontrolled)."
          },
          {
            "name": "onExpandedChange",
            "type": "((expandedIds: string[]) => void)",
            "required": false,
            "description": "Fires with the full new list of expanded ids whenever a toggle is pressed, in both controlled and uncontrolled modes."
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Allow several sections expanded at once. Default false — expanding one collapses the rest.",
            "defaultValue": "false"
          },
          {
            "name": "onNavigate",
            "type": "((item: NavListItem, event: MouseEvent<HTMLElement, MouseEvent>) => void)",
            "required": false,
            "description": "Fires when any link is clicked, alongside native navigation — e.g. to close the drawer that contains the list."
          },
          {
            "name": "expandLabel",
            "type": "((label: string) => string)",
            "required": false,
            "description": "Accessible name of a collapsed section's chevron toggle, given the row's label. Defaults to \"Expand <label>\".",
            "defaultValue": "(label) => `Expand ${label}`"
          },
          {
            "name": "collapseLabel",
            "type": "((label: string) => string)",
            "required": false,
            "description": "Accessible name of an expanded section's chevron toggle, given the row's label. Defaults to \"Collapse <label>\".",
            "defaultValue": "(label) => `Collapse ${label}`"
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; passed on to each row's Button. Wins over a\nLinkProvider's; a plain `<a>` when neither is set."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "NotificationCenter",
    "label": "Notification centre",
    "slug": "notification-center",
    "category": "feedback",
    "description": "A persistent notification inbox with unread count, filter tabs, and per-item actions.",
    "client": true,
    "importPath": "rift-ds/components/NotificationCenter/NotificationCenter",
    "barrel": "main",
    "exports": [
      {
        "component": "NotificationCenter",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Heading shown in the header.\nNote: this shadows the native `title` tooltip attribute, which NotificationCenter does not expose.",
            "defaultValue": "Notifications"
          },
          {
            "name": "unreadCount",
            "type": "number",
            "required": false,
            "description": "How many notifications are unread, shown under the heading. Omit to hide the line."
          },
          {
            "name": "unreadCountLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "Text of the unread line under the heading, given the count. Defaults to \"<count> unread\".",
            "defaultValue": "(count) => `${count} unread`"
          },
          {
            "name": "tabsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the filter tablist. Defaults to \"<title> filters\"."
          },
          {
            "name": "onMarkAllRead",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when \"Mark all read\" is pressed; the control only renders when this is set."
          },
          {
            "name": "markAllLabel",
            "type": "string",
            "required": false,
            "description": "Text of the mark-all-read control.",
            "defaultValue": "Mark all read"
          },
          {
            "name": "tabs",
            "type": "NotificationCenterTab[]",
            "required": false,
            "description": "Filter tabs under the header, each with an optional count."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Value of the active filter tab, for controlled use. Leave it undefined to\nlet the component keep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Value of the tab active on first render when the tabs are uncontrolled.\nFalls back to the first tab."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the newly selected tab's value."
          },
          {
            "name": "activeTab",
            "type": "string",
            "required": false,
            "description": "Legacy name for `value`; `value` wins when both are set.",
            "deprecated": "Use `value` instead."
          },
          {
            "name": "defaultTab",
            "type": "string",
            "required": false,
            "description": "Legacy name for `defaultValue`; `defaultValue` wins when both are set.",
            "deprecated": "Use `defaultValue` instead."
          },
          {
            "name": "onTabChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change callback; fires alongside `onValueChange`.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "emptyState",
            "type": "ReactNode",
            "required": false,
            "description": "What to render when there are no children — defaults to a built-in empty state."
          },
          {
            "name": "emptyStateLabels",
            "type": "Partial<Pick<EmptyStateProps, \"title\" | \"description\">>",
            "required": false,
            "description": "The built-in empty state's copy, merged over the English defaults: title\n\"Nothing new\", description \"Notifications will collect here as they\narrive.\" Ignored when `emptyState` is set."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The notifications, newest first — typically NotificationItems."
          }
        ]
      },
      {
        "component": "NotificationItem",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "One-line headline, e.g. who did what.\nNote: this shadows the native `title` tooltip attribute, which NotificationItem does not expose."
          },
          {
            "name": "time",
            "type": "string",
            "required": false,
            "description": "When it happened, as already-formatted text like \"2m\" or \"Mon\"."
          },
          {
            "name": "unread",
            "type": "boolean",
            "required": false,
            "description": "Marks the notification as not yet read: a dot beside the time and emphasised title.",
            "defaultValue": "false"
          },
          {
            "name": "unreadLabel",
            "type": "string",
            "required": false,
            "description": "Visually hidden text announcing the unread dot. Defaults to \"Unread\".",
            "defaultValue": "Unread"
          },
          {
            "name": "media",
            "type": "ReactNode",
            "required": false,
            "description": "Leading visual — a Material Symbol name (string) or a custom element (e.g. an Avatar)."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Action row under the body — typically compact Buttons like \"Reply\" or \"Retry\"."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Supporting copy under the title."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "NumberInput",
    "label": "Number input",
    "slug": "number-input",
    "category": "forms",
    "description": "Numeric field with increment and decrement steppers and min/max clamping.",
    "client": true,
    "importPath": "rift-ds/components/NumberInput/NumberInput",
    "barrel": "main",
    "exports": [
      {
        "component": "NumberInput",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Input label text"
          },
          {
            "name": "value",
            "type": "number | \"\"",
            "required": false,
            "description": "Current value (controlled). Pass an empty string for an empty field"
          },
          {
            "name": "defaultValue",
            "type": "number",
            "required": false,
            "description": "Initial value (uncontrolled)"
          },
          {
            "name": "min",
            "type": "number",
            "required": false,
            "description": "Minimum allowed value — steppers stop here, and typed values clamp to it on blur"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Maximum allowed value — steppers stop here, and typed values clamp to it on blur"
          },
          {
            "name": "step",
            "type": "number",
            "required": false,
            "description": "Amount each stepper click (or arrow key) changes the value by",
            "defaultValue": "1"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the input"
          },
          {
            "name": "onValueChange",
            "type": "((value: number | null) => void)",
            "required": false,
            "description": "Convenience callback receiving the numeric value directly — `null` when\nthe field is empty or unparseable. Fires on typing alongside `onChange`\n(which keeps the standard React event signature so form libraries work\nunmodified) and also on stepper clicks, where no native change event exists."
          },
          {
            "name": "decreaseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the decrement stepper button. Defaults to \"Decrease value\".",
            "defaultValue": "Decrease value"
          },
          {
            "name": "increaseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the increment stepper button. Defaults to \"Increase value\".",
            "defaultValue": "Increase value"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Pagination",
    "label": "Pagination",
    "slug": "pagination",
    "category": "navigation",
    "description": "Numbered page navigation for long datasets, with ellipses, disabled end arrows, and a compact readout mode.",
    "client": true,
    "importPath": "rift-ds/components/Pagination/Pagination",
    "barrel": "main",
    "exports": [
      {
        "component": "Pagination",
        "props": [
          {
            "name": "page",
            "type": "number",
            "required": false,
            "description": "Current page (1-based), for a controlled pager. Leave it undefined to let\nthe component keep its own page, seeded from `defaultPage`."
          },
          {
            "name": "defaultPage",
            "type": "number",
            "required": false,
            "description": "Page shown on first render when the pager is uncontrolled (1-based)",
            "defaultValue": "1"
          },
          {
            "name": "pageCount",
            "type": "number",
            "required": true,
            "description": "Total number of pages"
          },
          {
            "name": "onPageChange",
            "type": "((page: number) => void)",
            "required": false,
            "description": "Called with the page the user requests"
          },
          {
            "name": "siblingCount",
            "type": "number",
            "required": false,
            "description": "Pages shown on each side of the current page",
            "defaultValue": "1"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size — compact swaps the numbers for a \"Page X of Y\" readout",
            "defaultValue": "default"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the nav landmark.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "previousLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the previous-page arrow",
            "defaultValue": "Previous page"
          },
          {
            "name": "nextLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the next-page arrow",
            "defaultValue": "Next page"
          },
          {
            "name": "pageLabel",
            "type": "((page: number) => string)",
            "required": false,
            "description": "Accessible name of a numbered page button, given its page number",
            "defaultValue": "(page: number) => `Page ${page}`"
          },
          {
            "name": "readoutLabel",
            "type": "((page: number, pageCount: number) => string)",
            "required": false,
            "description": "Text of the compact size's readout, given the current page and the page count",
            "defaultValue": "(page: number, pageCount: number) => `Page ${page} of ${pageCount}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Panel",
    "label": "Panel",
    "slug": "panel",
    "category": "layout",
    "description": "The plain dashboard surface: a rounded container with no border or shadow, just padding and a gap.",
    "client": false,
    "importPath": "rift-ds/components/Panel/Panel",
    "barrel": "main",
    "exports": [
      {
        "component": "Panel",
        "props": [
          {
            "name": "padding",
            "type": "\"none\" | \"default\" | \"compact\"",
            "required": false,
            "description": "Interior padding: 'default' uses --padding-500, 'compact' uses --padding-400, 'none' removes it",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Panel content"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "PieChart",
    "label": "Pie chart",
    "slug": "pie-chart",
    "category": "charts",
    "description": "Proportional share of a whole as a pie or donut, with per-slice colours.",
    "client": true,
    "importPath": "rift-ds/components/Chart/PieChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "PieChart",
        "props": [
          {
            "name": "data",
            "type": "PieSlice[]",
            "required": true,
            "description": "Array of slices"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "innerRadius",
            "type": "number",
            "required": false,
            "description": "Inner radius for donut style (0 = solid pie)",
            "defaultValue": "0"
          },
          {
            "name": "outerRadius",
            "type": "number",
            "required": false,
            "description": "Outer radius",
            "defaultValue": "140"
          },
          {
            "name": "showLegend",
            "type": "boolean",
            "required": false,
            "description": "Show legend",
            "defaultValue": "true"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "PinInput",
    "label": "Pin input",
    "slug": "pin-input",
    "category": "forms",
    "description": "Segmented one-time-code input with auto-advance, paste support, and completion callback.",
    "client": true,
    "importPath": "rift-ds/components/PinInput/PinInput",
    "barrel": "main",
    "exports": [
      {
        "component": "PinInput",
        "props": [
          {
            "name": "length",
            "type": "number",
            "required": false,
            "description": "Number of cells, one character each",
            "defaultValue": "6"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current code (controlled) — character at index n renders in cell n"
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initial code (uncontrolled)"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the joined code whenever any cell changes.\nThere is no single native `onChange` here: the control is a group of\none-character inputs, so the value callback is the primary API."
          },
          {
            "name": "onComplete",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires once when every cell is filled, with the complete code"
          },
          {
            "name": "mask",
            "type": "boolean",
            "required": false,
            "description": "Render cells as password fields, hiding the entered characters",
            "defaultValue": "false"
          },
          {
            "name": "format",
            "type": "\"numeric\" | \"alphanumeric\"",
            "required": false,
            "description": "Accepted characters — `numeric` rejects non-digits and sets a numeric keyboard",
            "defaultValue": "numeric"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text rendered above the cells; also names the group for screen readers"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the cells"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours cell borders and the helper text",
            "defaultValue": "false"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the whole control is disabled",
            "defaultValue": "false"
          },
          {
            "name": "cellLabel",
            "type": "((position: number, count: number) => string)",
            "required": false,
            "description": "Accessible name of each cell, given its 1-based position and the cell count.\nDefaults to \"Digit <position> of <count>\" for the numeric format and\n\"Character <position> of <count>\" for alphanumeric."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the cells",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "PixelAvatar",
    "label": "Pixel avatar",
    "slug": "pixel-avatar",
    "category": "data-display",
    "description": "A generated character mark drawn from a name: the same name is always the same pixel creature in the same ink.",
    "client": false,
    "importPath": "rift-ds/components/PixelAvatar/PixelAvatar",
    "barrel": "main",
    "exports": [
      {
        "component": "PixelAvatar",
        "props": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "The seed. The same name always draws the same character in the same\nink, so a project, workspace or thread has its mark the moment it has a\nname, with nothing designed or stored for it."
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\" | \"xl\"",
            "required": false,
            "description": "Rendered size, on the icon scale (`--icon-size-500/600/800/1200` — 20, 24, 32 and 48px), so the character seats wherever an icon does.",
            "defaultValue": "md"
          },
          {
            "name": "ink",
            "type": "PixelInk",
            "required": false,
            "description": "Overrides the ink the name picks (1 to 6, the `--color-pixel-ink-*`\ntokens). A name's own ink is one of six, so two neighbours can land on\nthe same one; a host drawing a list passes each row's entry from\n`distinctPixelInks` here to keep them apart. The character's shape still\ncomes from the name."
          },
          {
            "name": "variant",
            "type": "\"plain\" | \"tile\"",
            "required": false,
            "description": "`plain` draws the character alone; `tile` seats it on a rounded wash of its own ink, for a larger standalone mark.",
            "defaultValue": "plain"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name. Omit it when the mark sits beside the name it was\ndrawn from, which is the usual case: the character is then decorative\nand hidden from assistive technology. Given, the root becomes an image\nwith this label."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Popover",
    "label": "Popover",
    "slug": "popover",
    "category": "overlays",
    "description": "Contextual overlay panel with click and hover triggers, positioned relative to its anchor.",
    "client": true,
    "importPath": "rift-ds/components/Popover/Popover",
    "barrel": "main",
    "exports": [
      {
        "component": "Popover",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "Trigger element"
          },
          {
            "name": "content",
            "type": "ReactNode",
            "required": true,
            "description": "Popover content. Replaces the native `content` attribute, which only\nmeans something on a `<meta>` element."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "surface",
            "type": "\"menu\" | \"panel\"",
            "required": false,
            "description": "The panel's surface. `panel` (the default) is the content panel: a\n16px inset and the container border. `menu` is DropdownMenu's own\nsurface (its 4px inset, input border and corner), for a popover that\nsits among menus and should read as one of them, such as a table\ntoolbar's sort or column panel.",
            "defaultValue": "panel"
          },
          {
            "name": "position",
            "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
            "required": false,
            "description": "Preferred position",
            "defaultValue": "bottom"
          },
          {
            "name": "trigger",
            "type": "\"hover\" | \"click\"",
            "required": false,
            "description": "Trigger mode",
            "defaultValue": "click"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the popover is open (controlled mode)"
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the popover starts open when uncontrolled",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Callback when open state changes"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the trigger and the panel; the panel is named \"Popover\" when it is omitted"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes for the popover's root wrapper, which holds the trigger and the panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ProgressBar",
    "label": "Progress bar",
    "slug": "progress-bar",
    "category": "feedback",
    "description": "Horizontal bar indicating completion progress, with an optional percentage label.",
    "client": false,
    "importPath": "rift-ds/components/ProgressBar/ProgressBar",
    "barrel": "main",
    "exports": [
      {
        "component": "ProgressBar",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current progress value (0–100)",
            "defaultValue": "0"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Size of the bar",
            "defaultValue": "default"
          },
          {
            "name": "showLabel",
            "type": "boolean",
            "required": false,
            "description": "Show percentage label",
            "defaultValue": "false"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label describing what is loading. Defaults to \"Progress\"; a passed native `aria-label` works too."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "PromptSuggestions",
    "label": "Prompt suggestions",
    "slug": "prompt-suggestions",
    "category": "ai",
    "description": "Tappable prompt suggestions to start or steer a conversation, as a scrolling or wrapping row, a stack, tiles or cards.",
    "client": true,
    "importPath": "rift-ds/components/PromptSuggestions/PromptSuggestions",
    "barrel": "main",
    "exports": [
      {
        "component": "PromptSuggestions",
        "props": [
          {
            "name": "suggestions",
            "type": "PromptSuggestion[]",
            "required": true,
            "description": "The suggestions to render, in order."
          },
          {
            "name": "onValueChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the tapped suggestion's `id`, one acknowledgment beat after the tap — the chosen chip pulses and its siblings dim first, so the choice is seen even when selection unmounts the row."
          },
          {
            "name": "layout",
            "type": "\"wrap\" | \"scroll\" | \"stack\" | \"tiles\" | \"cards\"",
            "required": false,
            "description": "How the suggestions are arranged. `scroll` is one line that scrolls\nsideways behind edge fades. `wrap` runs them across as many lines as\nthey need, for empty-state hero placements. `stack` gives each one its\nown line, for narrow columns where a wrapped row breaks unevenly and\nthe ragged right edge reads as an accident. `tiles` and `cards` leave\nthe chip behind for an empty-state home screen: `tiles` is an even row\nof quiet blocks, each an icon over a label and its `description`;\n`cards` gives each suggestion a tinted cover holding its icon, with the\nlabel and description beneath. Both fold to fewer columns as their own\nwidth narrows."
          },
          {
            "name": "wrap",
            "type": "boolean",
            "required": false,
            "description": "Legacy alias for `layout=\"wrap\"`; ignored when `layout` is set.",
            "defaultValue": "false",
            "deprecated": "Use `layout` instead, which also covers `stack`."
          },
          {
            "name": "pending",
            "type": "boolean",
            "required": false,
            "description": "The suggestions are still being generated: shimmer placeholder pills\nhold their place, matching the current size's chip geometry so nothing\nshifts when the real chips land. While pending the given `suggestions`\nare not rendered, the placeholders are hidden from assistive technology,\nand the row reports `aria-busy` instead.",
            "defaultValue": "false"
          },
          {
            "name": "pendingCount",
            "type": "number",
            "required": false,
            "description": "How many placeholder pills the pending state holds space with.",
            "defaultValue": "3"
          },
          {
            "name": "entrance",
            "type": "boolean",
            "required": false,
            "description": "Play the staggered pop-in when the items mount. On by default; a host\nre-showing a set that has already landed (reopening a panel over the\nsame suggestions) turns it off, so the chips stand where they were\ninstead of arriving twice.",
            "defaultValue": "true"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Row scale. `default` sits at the body-paragraph scale, so a suggestion\nreads at the same weight as the messages it will become; `compact` is\nthe quieter row for placements alongside a live conversation.",
            "defaultValue": "default"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "The `id` of the suggestion already taken. Set, the row becomes the\nrecord of that choice: the taken suggestion outlined solid in the\nstrongest ink, the rest faded behind a dashed line, and none of them\ntappable any more. The same treatment QuestionCard gives a pick. For a row that stays\non screen after use, such as the follow-ups under an earlier answer."
          },
          {
            "name": "chosenLabel",
            "type": "string",
            "required": false,
            "description": "Visually hidden text read after the taken suggestion once `value` is set. Defaults to \"(chosen)\".",
            "defaultValue": "(chosen)"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the list.",
            "defaultValue": "Suggested prompts"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Prose",
    "label": "Prose",
    "slug": "prose",
    "category": "ai",
    "description": "Token-styled typography for rendered markdown and rich agent output.",
    "client": false,
    "importPath": "rift-ds/components/Prose/Prose",
    "barrel": "main",
    "exports": [
      {
        "component": "Prose",
        "props": [
          {
            "name": "size",
            "type": "\"default\" | \"sm\"",
            "required": false,
            "description": "Body scale. `sm` maps paragraphs, lists and code to the small paragraph tokens for dense chat contexts.",
            "defaultValue": "default"
          },
          {
            "name": "tableSize",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Density of the tables inside: `compact` tightens the cell padding to the library Table's compact step, for long or dense tables.",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The rendered markup to style — the output of whatever markdown renderer the consumer uses."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "QuestionCard",
    "label": "Question card",
    "slug": "question-card",
    "category": "ai",
    "description": "An agent's question with answers to pick: one or several, a set asked a step at a time, kept as a record once answered.",
    "client": true,
    "importPath": "rift-ds/components/QuestionCard/QuestionCard",
    "barrel": "main",
    "exports": [
      {
        "component": "QuestionCard",
        "props": [
          {
            "name": "questions",
            "type": "QuestionCardQuestion[]",
            "required": true,
            "description": "The questions, asked one at a time when there is more than one."
          },
          {
            "name": "values",
            "type": "QuestionCardAnswer[]",
            "required": false,
            "description": "The answers already given. When set, the card renders its answered\nstate and stops taking input: the options stay where they were, the\npicked ones marked and the rest dimmed, so the record of the choice\nstays in place. An empty array records a skip."
          },
          {
            "name": "onValuesChange",
            "type": "((answers: QuestionCardAnswer[]) => void)",
            "required": false,
            "description": "Fires with every question's answer once the last one is given."
          },
          {
            "name": "onSkip",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the person declines to answer. Its presence is what shows the Skip button."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "The moment to answer has passed: the options stay on screen, dimmed and inert, under a line saying so.",
            "defaultValue": "false"
          },
          {
            "name": "labels",
            "type": "Partial<QuestionCardLabels>",
            "required": false,
            "description": "Replacement copy for the words the card draws itself."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "QuestionSummary",
        "props": [
          {
            "name": "items",
            "type": "QuestionSummaryItem[]",
            "required": true,
            "description": "The questions and their answers, in the order they were asked."
          },
          {
            "name": "missingLabel",
            "type": "string",
            "required": false,
            "description": "What stands in the answer's place for a question left without one.",
            "defaultValue": "No answer"
          },
          {
            "name": "variant",
            "type": "\"plain\" | \"card\"",
            "required": false,
            "description": "`card` draws the summary in its own hairline frame, as a set's record\nunder the reply that asked it. `plain` drops the frame, for a surface\nthat brings its own, such as the message bubble that sent the answers.",
            "defaultValue": "card"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Quote",
    "label": "Quote",
    "slug": "quote",
    "category": "data-display",
    "description": "Blockquotes and pull-quotes with attribution.",
    "client": false,
    "importPath": "rift-ds/components/Quote/Quote",
    "barrel": "main",
    "exports": [
      {
        "component": "Quote",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "The quote text"
          },
          {
            "name": "attribution",
            "type": "string",
            "required": false,
            "description": "Who said it, e.g. \"Jordan Reyes\""
          },
          {
            "name": "detail",
            "type": "string",
            "required": false,
            "description": "Context under the attribution, e.g. \"Design Lead, Northlight\""
          },
          {
            "name": "variant",
            "type": "\"default\" | \"pull\"",
            "required": false,
            "description": "`default` is an inline blockquote; `pull` is a large display pull-quote",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "RadarChart",
    "label": "Radar chart",
    "slug": "radar-chart",
    "category": "charts",
    "description": "Multi-axis comparison of series across categories on a radial grid.",
    "client": true,
    "importPath": "rift-ds/components/Chart/RadarChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "RadarChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects — each should have a category key and one or more value keys"
          },
          {
            "name": "categoryKey",
            "type": "string",
            "required": false,
            "description": "Key in data for the category labels on each axis",
            "defaultValue": "subject"
          },
          {
            "name": "series",
            "type": "RadarSeriesConfig[]",
            "required": true,
            "description": "One or more radar series to render"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "RadialChart",
    "label": "Radial chart",
    "slug": "radial-chart",
    "category": "charts",
    "description": "Concentric progress rings for completion and KPI readouts.",
    "client": true,
    "importPath": "rift-ds/components/Chart/RadialChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "RadialChart",
        "props": [
          {
            "name": "data",
            "type": "RadialDataItem[]",
            "required": true,
            "description": "Array of data items — each renders as a concentric ring"
          },
          {
            "name": "maxValue",
            "type": "number",
            "required": false,
            "description": "Maximum value for the radial scale (100 = percentage)",
            "defaultValue": "100"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "innerRadius",
            "type": "number",
            "required": false,
            "description": "Inner radius of the innermost ring",
            "defaultValue": "40"
          },
          {
            "name": "outerRadius",
            "type": "number",
            "required": false,
            "description": "Outer radius of the outermost ring",
            "defaultValue": "140"
          },
          {
            "name": "showLegend",
            "type": "boolean",
            "required": false,
            "description": "Show legend",
            "defaultValue": "true"
          },
          {
            "name": "centerLabel",
            "type": "string",
            "required": false,
            "description": "Headline printed in the donut hole, e.g. \"46%\"; pairs best with showLegend false, since the legend shifts the rings above centre"
          },
          {
            "name": "centerSublabel",
            "type": "string",
            "required": false,
            "description": "Small caption under the centre headline"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "RadioButton",
    "label": "Radio button",
    "slug": "radio-button",
    "category": "forms",
    "description": "Radio button and radio group with vertical and horizontal layouts, animated dot indicator.",
    "client": true,
    "importPath": "rift-ds/components/RadioButton/RadioButton",
    "barrel": "main",
    "exports": [
      {
        "component": "RadioButton",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered under the label text"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text. Deliberately no `aria-invalid`:\nARIA does not allow it on `role=\"radio\"`; group-level errors carry it on\nthe radiogroup via RadioGroup's `error`.",
            "defaultValue": "false"
          },
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether this radio is selected",
            "defaultValue": "false"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the radio is disabled",
            "defaultValue": "false"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Value for this radio option",
            "defaultValue": ""
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with this radio's value when selected"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Legacy form-field name.",
            "deprecated": "No-op. This component renders a `<div role=\"radio\">`, not a\nnative `<input type=\"radio\">`, so it does not group by name or participate\nin native form submission — `RadioGroup` handles grouping in React state.\nDeclared only so the attribute is not forwarded to an element that rejects it."
          }
        ]
      },
      {
        "component": "RadioGroup",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Group label"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered below the group"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the group invalid",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Marks the group required and renders the required marker on its label",
            "defaultValue": "false"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected value, controlled. Leave undefined to let the group\nkeep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Selected value on first render when uncontrolled (`value` undefined)."
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Legacy grouping name, never used.",
            "deprecated": "No-op. Grouping is React state (`value`/`onValueChange`), not\nnative `name` semantics — the group renders `role=\"radiogroup\"` over\n`<div role=\"radio\">`s, so there is nothing for a name to group."
          },
          {
            "name": "options",
            "type": "{ label: string; value: string; disabled?: boolean | undefined; }[]",
            "required": true,
            "description": "Radio options"
          },
          {
            "name": "direction",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Layout direction",
            "defaultValue": "vertical"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the newly selected value"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          }
        ]
      },
      {
        "component": "RadioIndicator",
        "props": [
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the circle shows its dot.",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Rating",
    "label": "Rating",
    "slug": "rating",
    "category": "forms",
    "description": "Star-scale rating control with keyboard selection, a read-only mode, and a configurable icon.",
    "client": true,
    "importPath": "rift-ds/components/Rating/Rating",
    "barrel": "main",
    "exports": [
      {
        "component": "Rating",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current rating (controlled). 0 means no rating."
          },
          {
            "name": "defaultValue",
            "type": "number",
            "required": false,
            "description": "Initial rating for uncontrolled use. 0 means no rating.",
            "defaultValue": "0"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Number of steps on the scale",
            "defaultValue": "5"
          },
          {
            "name": "onValueChange",
            "type": "((value: number) => void)",
            "required": false,
            "description": "Convenience callback receiving the new rating directly.\nFires on every selection, including a clear back to 0 via `allowClear`."
          },
          {
            "name": "readOnly",
            "type": "boolean",
            "required": false,
            "description": "Display-only mode — renders the current rating with no interaction",
            "defaultValue": "false"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the control is disabled",
            "defaultValue": "false"
          },
          {
            "name": "allowClear",
            "type": "boolean",
            "required": false,
            "description": "Selecting the already-selected step clears the rating back to 0",
            "defaultValue": "false"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Glyph drawn for each step — Material Symbol name (string) or custom element (ReactNode). A string glyph solidifies on filled steps via the font's fill axis; a custom element should draw with `currentColor` so the filled colour still reads.",
            "defaultValue": "star"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the group, and the base of each step's label",
            "defaultValue": "Rating"
          },
          {
            "name": "valueLabel",
            "type": "((value: number, max: number) => string)",
            "required": false,
            "description": "The spoken value, given a step (or, in `readOnly` mode, the current\nrating) and `max`. Defaults to \"3 out of 5\". It follows `label` and a\ncolon, as in \"Rating: 3 out of 5\".",
            "defaultValue": "(value: number, max: number) => `${value} out of ${max}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Reasoning",
    "label": "Reasoning",
    "slug": "reasoning",
    "category": "ai",
    "description": "A model's thinking, disclosed behind a one-line summary and collapsed once it finishes.",
    "client": true,
    "importPath": "rift-ds/components/Reasoning/Reasoning",
    "barrel": "main",
    "exports": [
      {
        "component": "Reasoning",
        "props": [
          {
            "name": "streaming",
            "type": "boolean",
            "required": false,
            "description": "The model is still producing the trace. Opens the panel and shimmers the summary.",
            "defaultValue": "false"
          },
          {
            "name": "duration",
            "type": "number",
            "required": false,
            "description": "Seconds spent reasoning, shown in the summary once complete."
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Override the summary line in every state. By default it reports the streaming state and the duration through the three labels below."
          },
          {
            "name": "thinkingLabel",
            "type": "string",
            "required": false,
            "description": "The summary while reasoning streams. Defaults to \"Thinking\".",
            "defaultValue": "Thinking"
          },
          {
            "name": "durationLabel",
            "type": "((seconds: number) => string)",
            "required": false,
            "description": "The summary once complete with a duration, given the seconds. Defaults to \"Thought for <n>s\".",
            "defaultValue": "(seconds: number) => `Thought for ${seconds}s`"
          },
          {
            "name": "doneLabel",
            "type": "string",
            "required": false,
            "description": "The summary once complete with no duration. Defaults to \"Thought process\".",
            "defaultValue": "Thought process"
          },
          {
            "name": "summary",
            "type": "ReactNode",
            "required": false,
            "description": "Replace the summary text with custom content — typically an AgentStatus,\npairing the live indicator with the trace disclosure. The node owns its\nown appearance and announcement, so Reasoning's shimmer and live region\nstand down."
          },
          {
            "name": "summaryOnly",
            "type": "boolean",
            "required": false,
            "description": "Render the summary line alone, with no chevron, no trigger, and no\npanel — for a model that reports what it is doing but produces no trace\nto read. A disclosure that opens onto nothing is a promise the component\ncannot keep, so it stops being one.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Text scale, paired with ChatMessage's sizes: `default` matches default\nmessage text, `compact` matches compact message text.",
            "defaultValue": "default"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Open state for controlled use. Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Open state for uncontrolled use. Defaults to open while `streaming`."
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires whenever the panel opens or closes, from a click or from the stream ending."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The reasoning trace."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "RichDropdown",
    "label": "Rich dropdown",
    "slug": "rich-dropdown",
    "category": "forms",
    "description": "Dropdown's rich sibling: options preview their own heading face, body face, and key colour.",
    "client": true,
    "importPath": "rift-ds/components/RichDropdown/RichDropdown",
    "barrel": "main",
    "exports": [
      {
        "component": "RichDropdown",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Field label text"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Placeholder when no value selected",
            "defaultValue": "Select an option"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Selected option value for controlled use. Pair with `onValueChange`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initially selected option value for uncontrolled use."
          },
          {
            "name": "options",
            "type": "RichDropdownOption[]",
            "required": true,
            "description": "The options on offer, in display order."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is disabled",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is required",
            "defaultValue": "false"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the newly selected option's value."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Used only as a fallback for deriving the element id (`id || name || label`).\n\nNote: RichDropdown renders a `<div role=\"combobox\">`, not a native\n`<select>`, so `name` does **not** make it participate in native form\nsubmission."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ScatterChart",
    "label": "Scatter chart",
    "slug": "scatter-chart",
    "category": "charts",
    "description": "Plots point clusters across two axes to show correlation and distribution.",
    "client": true,
    "importPath": "rift-ds/components/Chart/ScatterChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "ScatterChart",
        "props": [
          {
            "name": "datasets",
            "type": "ScatterDatasetConfig[]",
            "required": true,
            "description": "One or more scatter datasets to plot"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "x"
          },
          {
            "name": "yKey",
            "type": "string",
            "required": false,
            "description": "Key in data for y-axis values",
            "defaultValue": "y"
          },
          {
            "name": "xLabel",
            "type": "string",
            "required": false,
            "description": "Display label for x-axis",
            "defaultValue": "X"
          },
          {
            "name": "yLabel",
            "type": "string",
            "required": false,
            "description": "Display label for y-axis",
            "defaultValue": "Y"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SectionTitle",
    "label": "Section title",
    "slug": "section-title",
    "category": "layout",
    "description": "Heading with a divider line and optional trailing content for organising page sections.",
    "client": false,
    "importPath": "rift-ds/components/SectionTitle/SectionTitle",
    "barrel": "main",
    "exports": [
      {
        "component": "SectionTitle",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Section heading text.\nNote: this shadows the native `title` tooltip attribute, which SectionTitle does not expose."
          },
          {
            "name": "trailing",
            "type": "ReactNode",
            "required": false,
            "description": "Optional trailing content (count, badge, metadata)"
          },
          {
            "name": "divider",
            "type": "boolean",
            "required": false,
            "description": "Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone.",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SegmentedControl",
    "label": "Segmented control",
    "slug": "segmented-control",
    "category": "actions",
    "description": "Pill-style toggle between related views with keyboard navigation and icon support.",
    "client": true,
    "importPath": "rift-ds/components/SegmentedControl/SegmentedControl",
    "barrel": "main",
    "exports": [
      {
        "component": "SegmentedControl",
        "props": [
          {
            "name": "segments",
            "type": "Segment[]",
            "required": true,
            "description": "Array of segments"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Value of the active segment, for a controlled control. Leave it undefined\nto let the component keep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Value of the segment active on first render when the control is\nuncontrolled. Falls back to the first enabled segment."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the value of the segment the user selects"
          },
          {
            "name": "activeSegment",
            "type": "string",
            "required": false,
            "description": "Legacy name for `value`.",
            "deprecated": "Use `value` instead."
          },
          {
            "name": "onSegmentChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change callback; fires alongside `onValueChange`.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\"",
            "required": false,
            "description": "Colour of the active segment: `default` takes the action colour, `neutral`\nfills it grey, for a set whose selection should not carry the action\ncolour's weight."
          },
          {
            "name": "variant",
            "type": "\"neutral\" | \"primary\"",
            "required": false,
            "description": "Legacy name for `tone`, from before colour moved onto its own prop:\n`primary` is `tone=\"default\"`.",
            "deprecated": "Use `tone` instead."
          },
          {
            "name": "fullWidth",
            "type": "boolean",
            "required": false,
            "description": "Full width — segments fill container",
            "defaultValue": "false"
          },
          {
            "name": "collapse",
            "type": "boolean",
            "required": false,
            "description": "Shed parts rather than overflow when the container is too narrow for the\nstrip. The control measures its own natural widths and drops to labels\nalone, then to icons alone, in that order — the label carries the\nmeaning, so the icon goes first. It only falls to icons when every\nsegment has one, and hidden labels stay in the accessibility tree, so\nnothing loses its name. Off by default; the control overflows as before.",
            "defaultValue": "false"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Show each segment's label beside its icon. Set it to `false` for an\nicon-only strip: the labels stay in the accessibility tree as the\nsegments' names, and a segment without an icon keeps its label on\nscreen. Defaults to `true`.",
            "defaultValue": "true"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the strip.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SelectionCard",
    "label": "Selection card",
    "slug": "selection-card",
    "category": "data-display",
    "description": "Large option cards for high-visibility choices like settings and onboarding, with radio, checkbox or per-card toggle indicators.",
    "client": true,
    "importPath": "rift-ds/components/SelectionCard/SelectionCard",
    "barrel": "main",
    "exports": [
      {
        "component": "SelectionCard",
        "props": [
          {
            "name": "mode",
            "type": "\"checkbox\" | \"radio\" | \"toggle\"",
            "required": false,
            "description": "Selection mode — radio (single), checkbox (multi), or toggle (each card is an on/off switch)",
            "defaultValue": "radio"
          },
          {
            "name": "options",
            "type": "SelectionCardOption[]",
            "required": true,
            "description": "Available options"
          },
          {
            "name": "value",
            "type": "string | string[]",
            "required": false,
            "description": "Currently selected value(s), controlled: a string for radio, a string[]\notherwise. Leave undefined to let the group keep its own selection,\nseeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string | string[]",
            "required": false,
            "description": "Selected value(s) on first render when uncontrolled (`value` undefined)."
          },
          {
            "name": "onValueChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Called with the next selection — a string in radio mode, an array otherwise"
          },
          {
            "name": "name",
            "type": "string",
            "required": false,
            "description": "Group name (used for aria-label on the group)"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ShaderField",
    "label": "Shader field",
    "slug": "shader-field",
    "category": "effects",
    "description": "An ambient WebGL2 field of soft light sources that sample colour tokens, with a reported fallback status.",
    "client": true,
    "importPath": "rift-ds/components/ShaderField/ShaderField",
    "barrel": "main",
    "exports": [
      {
        "component": "ShaderField",
        "props": [
          {
            "name": "params",
            "type": "Partial<ShaderParams>",
            "required": false,
            "description": "Field parameters, merged over the shipped defaults, so passing one\nproperty changes one thing. Changing them never rebuilds the GL state."
          },
          {
            "name": "blobs",
            "type": "readonly ShaderBlob[]",
            "required": false,
            "description": "The light sources. Defaults to an eight-source composition: six on the\nambient tokens (`--color-ambient-*`, which follow the core accents unless a\ntheme re-points them) and two on surface tokens. Fewer than `BLOB_COUNT` entries is fine — unused slots park\noff-field; more are ignored, because the shader's uniform arrays are\nfixed-size.",
            "defaultValue": "[\n  { token: \"--color-ambient-1\", size: 0.45, cx: 0.175, cy: 0.125, period: 18, phase: 0, weight: 1 },\n  { token: \"--color-ambient-2\", size: 0.55, cx: 0.125, cy: 0.125, period: 16, phase: 1, weight: 1 },\n  { token: \"--color-ambient-3\", size: 0.9, cx: 0.35, cy: 0.25, period: 22, phase: 0.5, weight: 1 },\n  { token: \"--color-bg-container-secondary\", size: 0.55, cx: 0.025, cy: 0.075, period: 14, phase: 1.5, weight: 1 },\n  { token: \"--color-ambient-4\", size: 0.55, cx: -0.125, cy: 0.475, period: 17, phase: 0.8, weight: 1 },\n  { token: \"--color-ambient-5\", size: 0.48, cx: 0.39, cy: -0.26, period: 19, phase: 0.3, weight: 1 },\n  { token: \"--color-ambient-6\", size: 0.3, cx: 0.35, cy: 0.3, period: 15, phase: 1.2, weight: 1 },\n  { token: \"--color-core-ui-secondary\", size: 0.75, cx: -0.125, cy: -0.025, period: 20, phase: 0.7, weight: 1 },\n]"
          },
          {
            "name": "enabled",
            "type": "boolean",
            "required": false,
            "description": "False keeps WebGL entirely unmounted and reports `unavailable`, so the\ncaller's fallback is the whole background. This is the kill switch: a\nconfig lever, or an A/B against the fallback.",
            "defaultValue": "true"
          },
          {
            "name": "onStatusChange",
            "type": "((status: ShaderFieldStatus) => void)",
            "required": false,
            "description": "Called whenever the renderer's status changes. Drive the fallback layer's\nvisibility from this — the component deliberately does not own one, since\nwhat to paint instead is a design decision, not a rendering one."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SidebarPanel",
    "label": "Sidebar panel",
    "slug": "sidebar-panel",
    "category": "layout",
    "description": "Secondary navigation column listing one section's pages, with group headings and one level of accordion nesting.",
    "client": true,
    "importPath": "rift-ds/components/SidebarPanel/SidebarPanel",
    "barrel": "main",
    "exports": [
      {
        "component": "SidebarPanel",
        "props": [
          {
            "name": "items",
            "type": "SidebarPanelItem[]",
            "required": true,
            "description": "Items to list, optionally grouped with `group` and nested one level with `children`"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Heading at the top of the panel, usually the label of the item that opened it. Also the panel's accessible name, after a native `aria-label`; with neither, the panel is named \"Section navigation\".\nNote: this shadows the native `title` tooltip attribute, which SidebarPanel does not expose."
          },
          {
            "name": "activeKey",
            "type": "string",
            "required": false,
            "description": "Key of the item for the current page. Its accordion parent starts open"
          },
          {
            "name": "defaultOpenKeys",
            "type": "string[]",
            "required": false,
            "description": "Keys of the accordion rows open on first render, in addition to the active item's parent"
          },
          {
            "name": "onCollapse",
            "type": "(() => void)",
            "required": false,
            "description": "Renders a collapse button beside the heading and calls this when it is pressed"
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the collapse button. Defaults to \"Collapse <title>\", or \"Collapse panel\" when there is no title"
          },
          {
            "name": "onBack",
            "type": "(() => void)",
            "required": false,
            "description": "Renders a back row above the heading and calls this when it is pressed; the drill-in navigation on small screens"
          },
          {
            "name": "backLabel",
            "type": "string",
            "required": false,
            "description": "Label of the back row",
            "defaultValue": "Back"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Skeleton",
    "label": "Skeleton",
    "slug": "skeleton",
    "category": "feedback",
    "description": "Placeholder loading indicators with text, circular, and rectangular variants.",
    "client": false,
    "importPath": "rift-ds/components/Skeleton/Skeleton",
    "barrel": "main",
    "exports": [
      {
        "component": "Skeleton",
        "props": [
          {
            "name": "variant",
            "type": "\"text\" | \"circular\" | \"rectangular\"",
            "required": false,
            "description": "Shape of the skeleton",
            "defaultValue": "text"
          },
          {
            "name": "width",
            "type": "string",
            "required": false,
            "description": "Width (CSS value, e.g. '100%', '200px')"
          },
          {
            "name": "height",
            "type": "string",
            "required": false,
            "description": "Height (CSS value, e.g. '20px', '100px')"
          },
          {
            "name": "lines",
            "type": "number",
            "required": false,
            "description": "Number of text lines to render (only for text variant)",
            "defaultValue": "1"
          },
          {
            "name": "loadingLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name announced while the placeholder shows. A passed `aria-label` takes precedence.",
            "defaultValue": "Loading"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes. On a multi-line text skeleton they apply to each line, not the group.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Slider",
    "label": "Slider",
    "slug": "slider",
    "category": "forms",
    "description": "Range input for selecting a value between a minimum and maximum, in default and compact sizes.",
    "client": true,
    "importPath": "rift-ds/components/Slider/Slider",
    "barrel": "main",
    "exports": [
      {
        "component": "Slider",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text rendered above the slider, which names it. Without one the\nslider is named by the native `aria-label`, then the deprecated\n`ariaLabel`, and defaults to \"Slider\" so it is never nameless."
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered below the slider"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the slider invalid",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Marks the slider required and renders the required marker on its label",
            "defaultValue": "false"
          },
          {
            "name": "showValue",
            "type": "boolean",
            "required": false,
            "description": "Shows the current value opposite the helper line",
            "defaultValue": "false"
          },
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current value (controlled). Leave it undefined for an uncontrolled\nslider, which keeps its own state seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "number",
            "required": false,
            "description": "Initial value when uncontrolled (`value` undefined). Defaults to 50.",
            "defaultValue": "50"
          },
          {
            "name": "min",
            "type": "number",
            "required": false,
            "description": "Minimum value",
            "defaultValue": "0"
          },
          {
            "name": "max",
            "type": "number",
            "required": false,
            "description": "Maximum value",
            "defaultValue": "100"
          },
          {
            "name": "step",
            "type": "number",
            "required": false,
            "description": "Step increment",
            "defaultValue": "1"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "onValueChange",
            "type": "((value: number) => void)",
            "required": false,
            "description": "Convenience callback receiving the numeric value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries work unmodified."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SourceChip",
    "label": "Source chip",
    "slug": "source-chip",
    "category": "ai",
    "description": "A numbered citation pill linking a claim to its source.",
    "client": true,
    "importPath": "rift-ds/components/SourceChip/SourceChip",
    "barrel": "main",
    "exports": [
      {
        "component": "SourceChip",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The source name, e.g. \"Design tokens quarterly\". Truncates with an ellipsis when long.\nNote: this shadows the native `title` tooltip attribute, which SourceChip does not expose."
          },
          {
            "name": "index",
            "type": "number",
            "required": false,
            "description": "Citation number, rendered as a leading numeral in its own small badge circle. Wins the leading slot over `logo` and `icon`."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "The glyph for a source with neither a number nor a logo — a Material Symbol\nname (string) or custom element (ReactNode). Defaults to a globe, so the\nleading slot is never empty.",
            "defaultValue": "language"
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Optional href — renders as an `<a>` instead of a `<span>`."
          },
          {
            "name": "excerpt",
            "type": "string",
            "required": false,
            "description": "The passage the answer drew on. Setting it gives the chip a preview panel\nthat opens on hover, focus or press: the full title over this excerpt.\nWithout an `href` the chip then renders as a `<button>`, so the preview\nis reachable from the keyboard."
          },
          {
            "name": "source",
            "type": "string",
            "required": false,
            "description": "Where the source lives, shown as the preview's top line, e.g. \"docs.acme.com\". Only rendered with `excerpt`."
          },
          {
            "name": "logo",
            "type": "ReactNode",
            "required": false,
            "description": "The source's logo or favicon — an image URL (string) or a custom element\n(ReactNode), cropped to a circle. It fills the chip's leading slot when\nthere is no `index`, and always leads the preview's top line. Decorative:\nthe title and `source` text carry the name."
          },
          {
            "name": "meta",
            "type": "string",
            "required": false,
            "description": "A short trailing fact for the preview's top line, e.g. \"Updated 3 days ago\". Only rendered with `excerpt`."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component the link renders with, such as Next.js's `Link`, so it\nnavigates through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SourceTrail",
    "label": "Source trail",
    "slug": "source-trail",
    "category": "ai",
    "description": "The sources an agent opened while answering, as a collapsible list with per-item status.",
    "client": true,
    "importPath": "rift-ds/components/SourceTrail/SourceTrail",
    "barrel": "main",
    "exports": [
      {
        "component": "SourceTrail",
        "props": [
          {
            "name": "items",
            "type": "SourceTrailItem[]",
            "required": true,
            "description": "The sources, in the order the agent opened them."
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Header text. Left unset, it is computed from the items —\n\"Reading 3 sources\" while any is still pending or active,\n\"Read 3 sources\" once every visit has settled.\nNote: this shadows the native `title` tooltip attribute, which SourceTrail does not expose."
          },
          {
            "name": "readingLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The computed header while any visit is pending or active, or while\n`streaming`, given the number of sources. Defaults to \"Reading 1 source\"\nor \"Reading N sources\". Ignored when `title` is set.",
            "defaultValue": "(count: number) =>\n  `Reading ${count} source${count === 1 ? '' : 's'}`"
          },
          {
            "name": "readLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The computed header once every visit has settled, given the number of\nsources. Defaults to \"Read 1 source\" or \"Read N sources\". Ignored when\n`title` is set.",
            "defaultValue": "(count: number) => `Read ${count} source${count === 1 ? '' : 's'}`"
          },
          {
            "name": "statusLabels",
            "type": "Partial<Record<SourceTrailStatus, string>>",
            "required": false,
            "description": "Visually hidden text announcing each row's status after its source. Merged over the English defaults (Not opened yet, Reading now, Read)."
          },
          {
            "name": "streaming",
            "type": "boolean",
            "required": false,
            "description": "Still researching: newly appended rows animate in.",
            "defaultValue": "false"
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Open state for controlled use. Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Open state for uncontrolled use.",
            "defaultValue": "true"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires whenever the panel opens or closes."
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; passed on to each source's SourceChip. Wins over a\nLinkProvider's; a plain `<a>` when neither is set."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Sparkline",
    "label": "Sparkline",
    "slug": "sparkline",
    "category": "charts",
    "description": "Inline trend line for stats and table cells, drawn without axes or chrome.",
    "client": false,
    "importPath": "rift-ds/components/Sparkline/Sparkline",
    "barrel": "main",
    "exports": [
      {
        "component": "Sparkline",
        "props": [
          {
            "name": "data",
            "type": "number[]",
            "required": true,
            "description": "The series to plot, in order. Values are normalised into the viewBox."
          },
          {
            "name": "variant",
            "type": "\"area\" | \"line\"",
            "required": false,
            "description": "Rendering treatment — a bare line, or a line with a soft fill underneath.",
            "defaultValue": "line"
          },
          {
            "name": "tone",
            "type": "\"error\" | \"positive\" | \"neutral\" | \"accent\" | \"negative\"",
            "required": false,
            "description": "Colour role for the line and end dot. `accent` follows the chart palette's\nlead colour; `positive`/`error` map to the trend pair (up and down), named\nlike the status roles Gauge and the status components use; `neutral`\nrecedes to secondary text. `negative` is the legacy name for `error`.",
            "defaultValue": "accent"
          },
          {
            "name": "showDot",
            "type": "boolean",
            "required": false,
            "description": "Marks the final point with a small dot.",
            "defaultValue": "true"
          },
          {
            "name": "strokeWidth",
            "type": "number",
            "required": false,
            "description": "Line thickness in viewBox units — an SVG geometry attribute, not a token.",
            "defaultValue": "2"
          },
          {
            "name": "width",
            "type": "number",
            "required": false,
            "description": "ViewBox width. Also the default rendered width; the SVG scales to its\ncontainer when sized externally via CSS. Intentionally shadows the native\nSVG `width` attribute, which it sets.",
            "defaultValue": "120"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "ViewBox height. Also the default rendered height; the SVG scales to its\ncontainer when sized externally via CSS. Intentionally shadows the native\nSVG `height` attribute, which it sets.",
            "defaultValue": "32"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible description of the trend, e.g. \"Revenue, trending up\". When\nomitted the SVG is decorative and hidden from assistive technology."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Spinner",
    "label": "Spinner",
    "slug": "spinner",
    "category": "feedback",
    "description": "Animated circular loading indicator in three sizes and a default, neutral or inherit tone.",
    "client": false,
    "importPath": "rift-ds/components/Spinner/Spinner",
    "barrel": "main",
    "exports": [
      {
        "component": "Spinner",
        "props": [
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Size of the spinner",
            "defaultValue": "md"
          },
          {
            "name": "tone",
            "type": "\"inherit\" | \"default\" | \"neutral\"",
            "required": false,
            "description": "Colour of the arc: `default` in the primary text colour, `neutral` in\nthe secondary one, `inherit` in `currentColor`, for use inside coloured\ncontrols."
          },
          {
            "name": "variant",
            "type": "\"inherit\" | \"neutral\" | \"primary\"",
            "required": false,
            "description": "Legacy name for `tone`, from before colour moved onto its own prop:\n`primary` is `tone=\"default\"`.",
            "deprecated": "Use `tone` instead."
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible label, announced as the spinner's name. A passed `aria-label` takes precedence.",
            "defaultValue": "Loading"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SplitButton",
    "label": "Split button",
    "slug": "split-button",
    "category": "actions",
    "description": "Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill, in primary or secondary emphasis and any tone.",
    "client": false,
    "importPath": "rift-ds/components/SplitButton/SplitButton",
    "barrel": "main",
    "exports": [
      {
        "component": "SplitButton",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "Label of the primary action"
          },
          {
            "name": "onClick",
            "type": "MouseEventHandler<HTMLButtonElement>",
            "required": false,
            "description": "Click handler for the primary action"
          },
          {
            "name": "items",
            "type": "DropdownMenuEntry[]",
            "required": true,
            "description": "Menu entries for the alternative actions"
          },
          {
            "name": "variant",
            "type": "\"neutral\" | \"primary\" | \"secondary\"",
            "required": false,
            "description": "Emphasis, shared by both segments: `primary` (filled) or `secondary`\n(outlined). The colour is `tone`'s job. `neutral` is the legacy value\nfrom before the split and renders as `variant=\"primary\" tone=\"neutral\"`.",
            "defaultValue": "primary"
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\" | \"destructive\"",
            "required": false,
            "description": "Colour, shared by both segments: `default` carries the action colour,\n`neutral` the greys, `destructive` the danger colour."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Disables both segments",
            "defaultValue": "false"
          },
          {
            "name": "loading",
            "type": "boolean",
            "required": false,
            "description": "Shows a spinner on the primary segment and blocks interaction while an async action runs",
            "defaultValue": "false"
          },
          {
            "name": "iconLeft",
            "type": "ReactNode",
            "required": false,
            "description": "Icon for the primary segment — Material Symbol name or custom element"
          },
          {
            "name": "align",
            "type": "\"start\" | \"end\"",
            "required": false,
            "description": "Horizontal alignment of the menu panel relative to the control",
            "defaultValue": "end"
          },
          {
            "name": "menuLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the menu trigger segment",
            "defaultValue": "More actions"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the wrapper around both segments, not the primary button",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "SplitPane",
    "label": "Split pane",
    "slug": "split-pane",
    "category": "layout",
    "description": "Two resizable regions with a draggable, keyboard-operable divider between them.",
    "client": true,
    "importPath": "rift-ds/components/SplitPane/SplitPane",
    "barrel": "main",
    "exports": [
      {
        "component": "SplitPane",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "The two panes, in order. Children beyond the first two are ignored."
          },
          {
            "name": "direction",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Which way the panes sit: side by side, or stacked.",
            "defaultValue": "horizontal"
          },
          {
            "name": "split",
            "type": "number",
            "required": false,
            "description": "First pane's share as a percentage (controlled). Pair with `onSplitChange`."
          },
          {
            "name": "defaultSplit",
            "type": "number",
            "required": false,
            "description": "First pane's share as a percentage (uncontrolled initial value).",
            "defaultValue": "50"
          },
          {
            "name": "minSplit",
            "type": "number",
            "required": false,
            "description": "Smallest share the first pane can be dragged to, as a percentage.",
            "defaultValue": "10"
          },
          {
            "name": "maxSplit",
            "type": "number",
            "required": false,
            "description": "Largest share the first pane can be dragged to, as a percentage.",
            "defaultValue": "90"
          },
          {
            "name": "onSplitChange",
            "type": "((split: number) => void)",
            "required": false,
            "description": "Fires with the new percentage on every drag step or keyboard resize."
          },
          {
            "name": "separatorLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the resize handle.",
            "defaultValue": "Resize panes"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "StackedBarChart",
    "label": "Stacked bar chart",
    "slug": "stacked-bar-chart",
    "category": "charts",
    "description": "Bars split into stacked segments to compare totals and their composition.",
    "client": true,
    "importPath": "rift-ds/components/Chart/StackedBarChart",
    "barrel": "charts",
    "exports": [
      {
        "component": "StackedBarChart",
        "props": [
          {
            "name": "data",
            "type": "Record<string, unknown>[]",
            "required": true,
            "description": "Array of data objects"
          },
          {
            "name": "xKey",
            "type": "string",
            "required": false,
            "description": "Key in data for x-axis values",
            "defaultValue": "label"
          },
          {
            "name": "series",
            "type": "BarSeriesConfig[]",
            "required": true,
            "description": "One or more bar series to render (stacked)"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "yAxisFormatter",
            "type": "((value: number) => string)",
            "required": false,
            "description": "Y-axis tick formatter"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Stat",
    "label": "Stat",
    "slug": "stat",
    "category": "data-display",
    "description": "Headline metrics with labels and trend deltas.",
    "client": false,
    "importPath": "rift-ds/components/Stat/Stat",
    "barrel": "main",
    "exports": [
      {
        "component": "Stat",
        "props": [
          {
            "name": "value",
            "type": "ReactNode",
            "required": true,
            "description": "The headline number, e.g. \"~900%\" or \"3.8M\" — or a node, such as an AnimatedNumber, for figures that move"
          },
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "What the number measures"
          },
          {
            "name": "delta",
            "type": "string",
            "required": false,
            "description": "Optional change annotation, e.g. \"+42% vs last quarter\""
          },
          {
            "name": "trend",
            "type": "\"neutral\" | \"up\" | \"down\"",
            "required": false,
            "description": "Direction of the delta — colours it and adds an arrow",
            "defaultValue": "neutral"
          },
          {
            "name": "deltaPlacement",
            "type": "\"inline\" | \"stacked\"",
            "required": false,
            "description": "Where the delta sits: stacked below the label, or inline to the right of the value, bottom-aligned",
            "defaultValue": "stacked"
          },
          {
            "name": "size",
            "type": "\"default\" | \"large\"",
            "required": false,
            "description": "Stat size",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "StatusDot",
    "label": "Status dot",
    "slug": "status-dot",
    "category": "feedback",
    "description": "The bare status mark: a dot in the five status roles, with an optional label and a live pulse for recording and online-now states.",
    "client": false,
    "importPath": "rift-ds/components/StatusDot/StatusDot",
    "barrel": "main",
    "exports": [
      {
        "component": "StatusDot",
        "props": [
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Status role the dot carries — coloured through the plain-surface `--color-status-*-icon` steps.",
            "defaultValue": "neutral"
          },
          {
            "name": "size",
            "type": "\"sm\" | \"md\" | \"lg\" | \"xs\"",
            "required": false,
            "description": "Dot diameter, derived from the icon scale (half of `--icon-size-500/600/800`); `xs` is the 8px list-row mark, sized on the gap scale.",
            "defaultValue": "md"
          },
          {
            "name": "outline",
            "type": "boolean",
            "required": false,
            "description": "Draws the dot hollow: a ring in the role's colour around an empty\ncentre, for a settled or empty state that still holds its seat beside\nfilled dots.",
            "defaultValue": "false"
          },
          {
            "name": "pulse",
            "type": "boolean",
            "required": false,
            "description": "Radiates a repeating ring from the dot for a live state — recording,\nonline now, deploy in flight. The ring stills under reduced motion.",
            "defaultValue": "false"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Visible text beside the dot. Omit it for a bare dot only when the meaning\nhas another home — a row label, or an `aria-label` passed through — since\na colour alone announces nothing."
          },
          {
            "name": "decorative",
            "type": "boolean",
            "required": false,
            "description": "Renders the dot as decoration: no `role=\"status\"`, hidden from assistive\ntechnology. For a dot repeated down a list, where the host announces the\nstate in the row's own text and a live region per row would be noise.",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Stepper",
    "label": "Stepper",
    "slug": "stepper",
    "category": "navigation",
    "description": "Step-by-step progress indicator for wizards and multi-stage flows.",
    "client": true,
    "importPath": "rift-ds/components/Stepper/Stepper",
    "barrel": "main",
    "exports": [
      {
        "component": "Stepper",
        "props": [
          {
            "name": "steps",
            "type": "StepperStep[]",
            "required": true,
            "description": "Ordered list of steps in the flow"
          },
          {
            "name": "activeStep",
            "type": "number",
            "required": true,
            "description": "Index of the active step. Steps before it render as complete (check\nicon), steps after it as upcoming (step number). Pass `steps.length`\nto mark the whole flow complete."
          },
          {
            "name": "onStepClick",
            "type": "((index: number) => void)",
            "required": false,
            "description": "Callback with the clicked step's index. When provided, completed steps\nand the active step become buttons so the reader can revisit an earlier\nstage; upcoming steps stay non-interactive either way."
          },
          {
            "name": "orientation",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Layout direction",
            "defaultValue": "horizontal"
          },
          {
            "name": "completeLabel",
            "type": "string",
            "required": false,
            "description": "Status read after a completed step's label. The check mark that draws the\nstate is decorative, so this visually hidden text is what tells a screen\nreader a done step from an upcoming one. Defaults to \"Completed\".",
            "defaultValue": "Completed"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "StreamingText",
    "label": "Streaming text",
    "slug": "streaming-text",
    "category": "ai",
    "description": "Progressive reveal for text arriving in chunks, with a blinking cursor while more is coming.",
    "client": true,
    "importPath": "rift-ds/components/StreamingText/StreamingText",
    "barrel": "main",
    "exports": [
      {
        "component": "StreamingText",
        "props": [
          {
            "name": "text",
            "type": "string",
            "required": true,
            "description": "The text received so far. Grow it across renders as chunks arrive; the\nreveal animates through the appended part. A value that does not extend\nthe previous one is treated as a new message and reveals from the start."
          },
          {
            "name": "streaming",
            "type": "boolean",
            "required": false,
            "description": "Whether the source is still producing text. Keeps the cursor visible\nbetween chunks, when the reveal has caught up but more may arrive.",
            "defaultValue": "false"
          },
          {
            "name": "floorCps",
            "type": "number",
            "required": false,
            "description": "Slowest the reveal ever runs, in characters per second — the pace a\nthin trickle of chunks types at. Defaults to MOTION_STREAM_FLOOR_CPS."
          },
          {
            "name": "drainMs",
            "type": "number",
            "required": false,
            "description": "However much text is waiting, it is fully on screen within this long,\nin milliseconds — the rate rises with the backlog. Defaults to\nMOTION_STREAM_DRAIN_MS."
          },
          {
            "name": "charIntervalMs",
            "type": "number",
            "required": false,
            "description": "The retired interval between reveal steps; when set and `floorCps` is\nnot, its equivalent rate becomes the reveal's floor.",
            "deprecated": "The reveal is frame-driven now — pace it with `floorCps`\nand `drainMs` instead."
          },
          {
            "name": "cursor",
            "type": "boolean",
            "required": false,
            "description": "Shows the blinking cursor while streaming or revealing.",
            "defaultValue": "true"
          },
          {
            "name": "onRevealComplete",
            "type": "(() => void)",
            "required": false,
            "description": "Fires once when the reveal catches up with `text` after `streaming` has\nended — the moment the message is fully on screen."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Swatch",
    "label": "Swatch",
    "slug": "swatch",
    "category": "forms",
    "description": "Clickable colour tile for preset palettes and picker triggers, with a theme-aware selection ring.",
    "client": false,
    "importPath": "rift-ds/components/Swatch/Swatch",
    "barrel": "main",
    "exports": [
      {
        "component": "Swatch",
        "props": [
          {
            "name": "value",
            "type": "string",
            "required": true,
            "description": "The colour this swatch shows — any valid CSS colour, typically a hex value"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the swatch. Defaults to the colour value, which is\nmeaningful but terse — prefer a human name (\"Teal 07\") when you have one."
          },
          {
            "name": "selected",
            "type": "boolean",
            "required": false,
            "description": "Selected state — renders the selection ring and sets aria-pressed",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Swatch size",
            "defaultValue": "default"
          },
          {
            "name": "shape",
            "type": "\"circle\" | \"square\"",
            "required": false,
            "description": "Corner treatment — circle matches the site's preset grids; square suits picker triggers",
            "defaultValue": "circle"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the swatch is disabled",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Table",
    "label": "Table",
    "slug": "table",
    "category": "data-display",
    "description": "Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.",
    "client": false,
    "importPath": "rift-ds/components/Table/Table",
    "barrel": "main",
    "exports": [
      {
        "component": "Table",
        "props": [
          {
            "name": "columns",
            "type": "TableColumn[]",
            "required": true,
            "description": "Column definitions"
          },
          {
            "name": "rows",
            "type": "TableRow[]",
            "required": true,
            "description": "Row data"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Visual size",
            "defaultValue": "default"
          },
          {
            "name": "striped",
            "type": "boolean",
            "required": false,
            "description": "Alternating row background colours",
            "defaultValue": "false"
          },
          {
            "name": "bordered",
            "type": "boolean",
            "required": false,
            "description": "Adds an outer border + border-radius container, a tinted thead background,\nand `--color-divider` row lines — matching the bordered table style used on\nmarkdown content pages.",
            "defaultValue": "false"
          },
          {
            "name": "columnDividers",
            "type": "boolean",
            "required": false,
            "description": "Draws a vertical line between columns, as well as the lines between rows.",
            "defaultValue": "false"
          },
          {
            "name": "caption",
            "type": "string",
            "required": false,
            "description": "Accessible caption for the table"
          },
          {
            "name": "captionHidden",
            "type": "boolean",
            "required": false,
            "description": "Whether to visually hide the caption (still available to screen readers)",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "TableToolbar",
    "label": "Table toolbar",
    "slug": "table-toolbar",
    "category": "data-display",
    "description": "The control bar over a table: search, filters as chips, the columns panel, density and a count, reading a DataTable's state with no props.",
    "client": true,
    "importPath": "rift-ds/components/TableToolbar/TableToolbar",
    "barrel": "main",
    "exports": [
      {
        "component": "TableToolbar",
        "props": [
          {
            "name": "columns",
            "type": "TableToolbarColumn[]",
            "required": false,
            "description": "The columns the bar filters and shows, for a bar over some other table. Inside a DataTable's `toolbar` the table's own columns are used."
          },
          {
            "name": "filters",
            "type": "Filter[]",
            "required": false,
            "description": "The filters, for controlled use. Inside a DataTable the table's filters are used unless this is set."
          },
          {
            "name": "defaultFilters",
            "type": "Filter[]",
            "required": false,
            "description": "Starting filters, for uncontrolled use outside a DataTable."
          },
          {
            "name": "onFiltersChange",
            "type": "((filters: Filter[]) => void)",
            "required": false,
            "description": "Fires with every filter after one is added, changed or removed."
          },
          {
            "name": "search",
            "type": "string",
            "required": false,
            "description": "The search text, for controlled use. Inside a DataTable the table's search is used unless this is set."
          },
          {
            "name": "defaultSearch",
            "type": "string",
            "required": false,
            "description": "Starting search text, for uncontrolled use outside a DataTable."
          },
          {
            "name": "onSearchChange",
            "type": "((search: string) => void)",
            "required": false,
            "description": "Fires with the search text as it changes."
          },
          {
            "name": "hiddenColumns",
            "type": "string[]",
            "required": false,
            "description": "Hidden column keys, for controlled use. Inside a DataTable the table's are used unless this is set."
          },
          {
            "name": "defaultHiddenColumns",
            "type": "string[]",
            "required": false,
            "description": "Starting hidden keys, for uncontrolled use outside a DataTable."
          },
          {
            "name": "onHiddenColumnsChange",
            "type": "((hidden: string[]) => void)",
            "required": false,
            "description": "Fires with every hidden key after the Columns panel changes one."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "The density the bar's controls take and its switch sets, for controlled use. Inside a DataTable the table's density is used unless this is set."
          },
          {
            "name": "defaultSize",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Starting density, for uncontrolled use outside a DataTable."
          },
          {
            "name": "onSizeChange",
            "type": "((size: \"default\" | \"compact\") => void)",
            "required": false,
            "description": "Fires when the density switch changes."
          },
          {
            "name": "count",
            "type": "{ shown: number; total: number; }",
            "required": false,
            "description": "The result count's numbers, outside a DataTable: rows that match and rows in all."
          },
          {
            "name": "searchable",
            "type": "boolean",
            "required": false,
            "description": "Shows the search field. Defaults to true.",
            "defaultValue": "true"
          },
          {
            "name": "filterable",
            "type": "boolean",
            "required": false,
            "description": "Shows the Filter button and the filter chips. Defaults to true.",
            "defaultValue": "true"
          },
          {
            "name": "columnsPanel",
            "type": "boolean",
            "required": false,
            "description": "Shows the Columns panel. Defaults to true.",
            "defaultValue": "true"
          },
          {
            "name": "densitySwitch",
            "type": "boolean",
            "required": false,
            "description": "Shows the density switch (in More when the bar folds). Defaults to true.",
            "defaultValue": "true"
          },
          {
            "name": "showCount",
            "type": "boolean",
            "required": false,
            "description": "Shows the result count in the bar. Defaults to true over some other table and false inside a DataTable, whose footer carries the count; set it to move the count into the bar, and the footer leaves it out."
          },
          {
            "name": "columnOrder",
            "type": "string[]",
            "required": false,
            "description": "Every column key in display order, for controlled use. Inside a DataTable the table's order is used unless this is set."
          },
          {
            "name": "defaultColumnOrder",
            "type": "string[]",
            "required": false,
            "description": "Starting column order, for uncontrolled use outside a DataTable."
          },
          {
            "name": "onColumnOrderChange",
            "type": "((order: string[]) => void)",
            "required": false,
            "description": "Fires with the full column order after the Columns panel moves one."
          },
          {
            "name": "bulkActions",
            "type": "TableToolbarBulkAction[]",
            "required": false,
            "description": "The actions for the selected rows. Inside a DataTable with `selectable`, selecting a row turns the bar, at the same height, into the bulk bar: Clear, the count, Select all N, then these, the first non-destructive one and the first destructive one labelled and the rest in a More menu.",
            "defaultValue": "[]"
          },
          {
            "name": "sorts",
            "type": "DataTableSort[]",
            "required": false,
            "description": "Every sort, first sort first, for controlled use. Inside a DataTable the table's sorts are used unless this is set."
          },
          {
            "name": "defaultSorts",
            "type": "DataTableSort[]",
            "required": false,
            "description": "Initial sorts for uncontrolled use."
          },
          {
            "name": "onSortsChange",
            "type": "((sorts: DataTableSort[]) => void)",
            "required": false,
            "description": "Fires with every sort after the sort panel changes one."
          },
          {
            "name": "views",
            "type": "TableToolbarView[]",
            "required": false,
            "description": "Saved views, shown as tabs over the bar inside a DataTable: picking one\napplies its setup to the table, its tab shows a dot while the table no\nlonger matches it, and its menu saves, saves as new, resets, renames\nand deletes. For controlled use; store them however you like (each\n`view` is plain data). Pair with `onViewsChange`."
          },
          {
            "name": "defaultViews",
            "type": "TableToolbarView[]",
            "required": false,
            "description": "The saved views to start with, for uncontrolled use."
          },
          {
            "name": "onViewsChange",
            "type": "((views: TableToolbarView[]) => void)",
            "required": false,
            "description": "Fires with every view after one is saved, added, renamed or deleted."
          },
          {
            "name": "activeView",
            "type": "string",
            "required": false,
            "description": "The active view's id, for controlled use. Pair with `onActiveViewChange`."
          },
          {
            "name": "defaultActiveView",
            "type": "string",
            "required": false,
            "description": "The view active to begin with, for uncontrolled use. Defaults to the first."
          },
          {
            "name": "onActiveViewChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the id of the view picked or added."
          },
          {
            "name": "grouping",
            "type": "string[]",
            "required": false,
            "description": "The column keys the rows are grouped by, for controlled use. Inside a DataTable the table's grouping is used unless this is set."
          },
          {
            "name": "defaultGrouping",
            "type": "string[]",
            "required": false,
            "description": "The grouping to start with, for uncontrolled use."
          },
          {
            "name": "onGroupingChange",
            "type": "((grouping: string[]) => void)",
            "required": false,
            "description": "Fires with the new grouping when the Group panel changes it."
          },
          {
            "name": "groupable",
            "type": "boolean",
            "required": false,
            "description": "Shows the Group button, whose panel picks the column the rows group by. Defaults to true; it shows when a column is `groupable`.",
            "defaultValue": "true"
          },
          {
            "name": "sortable",
            "type": "boolean",
            "required": false,
            "description": "Shows the Sort button, whose panel orders, flips and removes the sorts. Defaults to true; inside a DataTable it shows when a column sorts, and holds one sort unless the table has `multiSort`.",
            "defaultValue": "true"
          },
          {
            "name": "primaryAction",
            "type": "TableToolbarAction",
            "required": false,
            "description": "The page's main action (New project, Invite), drawn as the primary button at the bar's end."
          },
          {
            "name": "secondaryActions",
            "type": "TableToolbarAction[]",
            "required": false,
            "description": "Actions beside the primary one (Export, Import), drawn as icon buttons before it, each named and tooltipped by its label; folded, they move into the More panel.",
            "defaultValue": "[]"
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Any other controls at the bar's end, after the actions."
          },
          {
            "name": "labels",
            "type": "Partial<TableToolbarLabels>",
            "required": false,
            "description": "The bar's words, merged over their English defaults."
          },
          {
            "name": "filterLabels",
            "type": "Partial<FilterLabels>",
            "required": false,
            "description": "The filters' words, merged over their English defaults (inside a DataTable, over the table's)."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Tabs",
    "label": "Tabs",
    "slug": "tabs",
    "category": "navigation",
    "description": "Tab navigation with underline indicator, icon support, compact size, and full-width mode.",
    "client": true,
    "importPath": "rift-ds/components/Tabs/Tabs",
    "barrel": "main",
    "exports": [
      {
        "component": "Tabs",
        "props": [
          {
            "name": "tabs",
            "type": "Tab[]",
            "required": true,
            "description": "Array of tab definitions"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Value of the selected tab, for a controlled set. Leave it undefined to let\nthe component keep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Value of the tab selected on first render when the set is uncontrolled.\nFalls back to the first enabled tab."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the value of the tab the user selects"
          },
          {
            "name": "activeTab",
            "type": "string",
            "required": false,
            "description": "Legacy name for `value`.",
            "deprecated": "Use `value` instead."
          },
          {
            "name": "onTabChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Legacy change callback; fires alongside `onValueChange`.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Visual size",
            "defaultValue": "default"
          },
          {
            "name": "fullWidth",
            "type": "boolean",
            "required": false,
            "description": "Whether tabs fill the available width",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop for the tab list.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "TagInput",
    "label": "Tag input",
    "slug": "tag-input",
    "category": "forms",
    "description": "Multi-value text input with entries held as removable tags.",
    "client": true,
    "importPath": "rift-ds/components/TagInput/TagInput",
    "barrel": "main",
    "exports": [
      {
        "component": "TagInput",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Field label text"
          },
          {
            "name": "values",
            "type": "string[]",
            "required": false,
            "description": "Committed tags (controlled) — pair with `onValuesChange`"
          },
          {
            "name": "defaultValues",
            "type": "string[]",
            "required": false,
            "description": "Initial tags when uncontrolled"
          },
          {
            "name": "onValuesChange",
            "type": "((values: string[]) => void)",
            "required": false,
            "description": "Convenience callback receiving the full tag array whenever a tag is added\nor removed. The native `onChange` still fires for draft-text edits, which\nkeeps the standard React event signature for form libraries."
          },
          {
            "name": "maxTags",
            "type": "number",
            "required": false,
            "description": "Maximum number of tags — at the limit the input stops accepting new ones"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size (not the native character-width `size` attribute)",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below the control"
          },
          {
            "name": "removeLabel",
            "type": "((tag: string) => string)",
            "required": false,
            "description": "Accessible name of a tag's remove button, given the tag. Defaults to \"Remove <tag>\".",
            "defaultValue": "(tag) => `Remove ${tag}`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <input>",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Textarea",
    "label": "Textarea",
    "slug": "textarea",
    "category": "forms",
    "description": "Multi-line text input with character counter, resize control, helper text, and error states.",
    "client": true,
    "importPath": "rift-ds/components/Textarea/Textarea",
    "barrel": "main",
    "exports": [
      {
        "component": "Textarea",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Textarea label text"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Current value (controlled). Leave it undefined for an uncontrolled\ntextarea, which keeps its own state seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initial value when uncontrolled (`value` undefined)."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — shows error styling and message",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message displayed below"
          },
          {
            "name": "resize",
            "type": "\"none\" | \"both\" | \"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Whether the textarea is resizable",
            "defaultValue": "vertical"
          },
          {
            "name": "maxLength",
            "type": "number",
            "required": false,
            "description": "Max character count — shows counter when set"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Convenience callback receiving the value directly.\nFires alongside `onChange`, which keeps the standard React event signature\nso form libraries work unmodified."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes — applied to the wrapper, not the <textarea>",
            "defaultValue": ""
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ThemePicker",
    "label": "Theme picker",
    "slug": "theme-picker",
    "category": "actions",
    "description": "A circular trigger wearing the active theme's swatch, opening a menu of every theme on offer with its colour, corner and faces.",
    "client": true,
    "importPath": "rift-ds/components/ThemePicker/ThemePicker",
    "barrel": "main",
    "exports": [
      {
        "component": "ThemePicker",
        "props": [
          {
            "name": "themes",
            "type": "ThemePickerOption[]",
            "required": true,
            "description": "The themes on offer, in the order the menu lists them."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "The active theme, controlled. Leave undefined to let the picker keep its own, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "The active theme on first render when uncontrolled. Defaults to the first theme."
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the chosen theme's value. The host applies it (a `data-brand` attribute on `<html>`, for the shipped presets)."
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Whether the menu is open, controlled. Leave undefined to let the picker open and close itself."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Whether the menu starts open when uncontrolled.",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires when the menu opens or closes."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Trigger size, on the row-control scale: `default` is 40px, `compact` 32px.",
            "defaultValue": "default"
          },
          {
            "name": "placement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the trigger the menu prefers; it flips when that side has no room.",
            "defaultValue": "bottom"
          },
          {
            "name": "align",
            "type": "\"start\" | \"end\"",
            "required": false,
            "description": "Which trigger edge the menu lines up with.",
            "defaultValue": "end"
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "required": false,
            "description": "Content after the themes, below a divider: a link to make a theme of your own, say. Give each control in it `role=\"menuitem\"`, since a menu holds only menu items; the arrow keys reach it."
          },
          {
            "name": "triggerLabel",
            "type": "((label: string) => string)",
            "required": false,
            "description": "Accessible name of the trigger, given the active theme's name. Defaults to \"Theme: \" followed by it.",
            "defaultValue": "(label: string) => `Theme: ${label}`"
          },
          {
            "name": "menuLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the menu.",
            "defaultValue": "Theme"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ThemeToggle",
    "label": "Theme toggle",
    "slug": "theme-toggle",
    "category": "actions",
    "description": "The colour-mode control: System, Light and Dark over a stored setting, with the script that applies it before first paint.",
    "client": true,
    "importPath": "rift-ds/components/ThemeToggle/ThemeToggle",
    "barrel": "main",
    "exports": [
      {
        "component": "ThemeToggle",
        "props": [
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Control size, on SegmentedControl's scale.",
            "defaultValue": "compact"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Show each segment's label beside its icon. Set `false` for an icon-only strip: each label becomes the segment's tooltip on hover and keyboard focus, and stays its accessible name.",
            "defaultValue": "true"
          },
          {
            "name": "storageKey",
            "type": "string",
            "required": false,
            "description": "The localStorage key the choice is kept under. Match the key given to `colorModeScript`. Default `theme`."
          },
          {
            "name": "systemLabel",
            "type": "string",
            "required": false,
            "description": "Label of the setting that follows the operating system.",
            "defaultValue": "System"
          },
          {
            "name": "lightLabel",
            "type": "string",
            "required": false,
            "description": "Label of the light setting.",
            "defaultValue": "Light"
          },
          {
            "name": "darkLabel",
            "type": "string",
            "required": false,
            "description": "Label of the dark setting.",
            "defaultValue": "Dark"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ThreadPanel",
    "label": "Thread panel",
    "slug": "thread-panel",
    "category": "ai",
    "description": "The session-history rail for chat products: brand header, new-thread action, standing controls, projects, grouped detail-rich threads, and a profile footer.",
    "client": false,
    "importPath": "rift-ds/components/ThreadPanel/ThreadPanel",
    "barrel": "main",
    "exports": [
      {
        "component": "ThreadPanel",
        "props": [
          {
            "name": "groups",
            "type": "ThreadPanelGroup[]",
            "required": true,
            "description": "The history, in display order. A flat list is one group with no label."
          },
          {
            "name": "activeThreadId",
            "type": "string",
            "required": false,
            "description": "Id of the thread on stage. Its row renders filled and carries `aria-current`."
          },
          {
            "name": "onThreadSelect",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the clicked thread's id. Rows with an `href` navigate as well."
          },
          {
            "name": "threadActions",
            "type": "ThreadPanelThreadAction[]",
            "required": false,
            "description": "Shared menu actions for every thread row, behind a hover-revealed trailing trigger; a thread's own `actions` overrides the set. The menu renders only when `onThreadAction` is also given, and never on a `pending` row."
          },
          {
            "name": "onThreadAction",
            "type": "((threadId: string, actionId: string) => void)",
            "required": false,
            "description": "Fires with the thread's id and the chosen action's id."
          },
          {
            "name": "statusLabels",
            "type": "Partial<Record<ThreadPanelThreadStatus, string>>",
            "required": false,
            "description": "Spoken text for each thread status, read after the row's title; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). `idle` is silent unless given a label here."
          },
          {
            "name": "pinnedLabel",
            "type": "string",
            "required": false,
            "description": "Spoken text for a `pinned` thread, read after the title and any status; the pin glyph itself is decorative. Not read on a `pending` row, whose name is its tooltip alone.",
            "defaultValue": "Pinned"
          },
          {
            "name": "threadMenuLabel",
            "type": "string | ((title: string) => string)",
            "required": false,
            "description": "Accessible name for a row's menu trigger. A string is followed by a colon\nand the thread's title (\"Thread options: Q3 plan\"); a function is given\nthe title and returns the whole name, so a translation can put the title\nwhere its grammar needs it.",
            "defaultValue": "Thread options"
          },
          {
            "name": "renamingThreadId",
            "type": "string",
            "required": false,
            "description": "Id of the thread being renamed: its row swaps to an inline text field, prefilled with the title and selected. The host owns the state, like everything else."
          },
          {
            "name": "onThreadRename",
            "type": "((threadId: string, title: string) => void)",
            "required": false,
            "description": "Fires with the thread's id and the trimmed new title when a rename commits (Enter, or focus leaving the field). An empty or unchanged value fires `onRenameCancel` instead."
          },
          {
            "name": "onRenameCancel",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when a rename ends without a change: Escape, an empty value, or an unchanged title."
          },
          {
            "name": "renameLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the inline rename field.",
            "defaultValue": "Rename thread"
          },
          {
            "name": "logo",
            "type": "ReactNode",
            "required": false,
            "description": "Brand mark slot at the top, e.g. a logo `<img>`. While collapsed it doubles as the expand button, AppSidebar's contract."
          },
          {
            "name": "logoText",
            "type": "string",
            "required": false,
            "description": "Brand name beside the logo. The header row renders only when `logo`, `logoText`, or `onExpandedChange` is given."
          },
          {
            "name": "newThreadLabel",
            "type": "string",
            "required": false,
            "description": "Text for the new-thread row. Defaults to \"New thread\". The row renders when this, `onNewThread`, or `newThreadHref` is given."
          },
          {
            "name": "newThreadIcon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon for the new-thread row — Material Symbol name (string) or custom element (ReactNode). Defaults to the pen-in-a-box `edit_square`, the same glyph chat headers use for New chat.",
            "defaultValue": "edit_square"
          },
          {
            "name": "newThreadShortcut",
            "type": "string[]",
            "required": false,
            "description": "Keyboard hint rendered as compact Kbds at the row's trailing edge, e.g. `[\"Ctrl\", \"N\"]`. Decorative — the host owns the actual binding."
          },
          {
            "name": "onNewThread",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the new-thread row is clicked."
          },
          {
            "name": "newThreadHref",
            "type": "string",
            "required": false,
            "description": "Optional href — the new-thread row renders as an `<a>`."
          },
          {
            "name": "controls",
            "type": "ThreadPanelControl[]",
            "required": false,
            "description": "Standing rows between the new-thread action and the history, e.g. Automations or Settings."
          },
          {
            "name": "onControlSelect",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the clicked control's id. Rows with an `href` navigate as well."
          },
          {
            "name": "projects",
            "type": "ThreadPanelProject[]",
            "required": false,
            "description": "Project rows between the standing controls and the history, under their own overline header. The section renders only when non-empty; collapsed, the rows fold to icon circles like the controls."
          },
          {
            "name": "projectsLabel",
            "type": "string",
            "required": false,
            "description": "The projects section's overline header text.",
            "defaultValue": "Projects"
          },
          {
            "name": "activeProjectId",
            "type": "string",
            "required": false,
            "description": "Id of the open project. Its row renders filled and carries `aria-current`."
          },
          {
            "name": "onProjectSelect",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the clicked project's id. Rows with an `href` navigate as well."
          },
          {
            "name": "onProjectCreate",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the header's trailing new-project button is pressed. The button renders only when this is given."
          },
          {
            "name": "newProjectLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the new-project button.",
            "defaultValue": "New project"
          },
          {
            "name": "moreLabel",
            "type": "string",
            "required": false,
            "description": "Text for the quiet trailing row that reveals older threads, e.g. \"Show 20 more\". Renders only when given."
          },
          {
            "name": "onShowMore",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the more row is clicked."
          },
          {
            "name": "historyLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the scrollable history region.",
            "defaultValue": "Thread history"
          },
          {
            "name": "expanded",
            "type": "boolean",
            "required": false,
            "description": "Whether the panel is expanded (280px, labels and history showing). Collapsed it is AppSidebar's 64px icon rail: circular icon rows, the history faded out, the avatar alone in the footer.",
            "defaultValue": "true"
          },
          {
            "name": "onExpandedChange",
            "type": "((expanded: boolean) => void)",
            "required": false,
            "description": "Fires with the next state when the toggle (or, collapsed, the logo) is pressed. The toggle renders only when this is given; the panel is controlled, so the host owns the state."
          },
          {
            "name": "collapseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the header toggle while expanded.",
            "defaultValue": "Collapse the panel"
          },
          {
            "name": "expandLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the expand affordance while collapsed.",
            "defaultValue": "Expand the panel"
          },
          {
            "name": "profile",
            "type": "ThreadPanelProfile",
            "required": false,
            "description": "The signed-in person, rendered as the footer's Avatar row."
          },
          {
            "name": "footerSlot",
            "type": "ReactNode",
            "required": false,
            "description": "Rendered in the footer above the profile row — a theme toggle, a storage meter. Fades out while collapsed, AppSidebar's contract."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; a plain `<a>` when unset. This\ncomponent can render on the server, so it never reads a LinkProvider:\npass the prop even under one."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ThreadTabs",
    "label": "Thread tabs",
    "slug": "thread-tabs",
    "category": "ai",
    "description": "The strip of open chat sessions: pill tabs with status dots and hover-revealed close buttons, a new-tab action, and animated enter and exit.",
    "client": true,
    "importPath": "rift-ds/components/ThreadTabs/ThreadTabs",
    "barrel": "main",
    "exports": [
      {
        "component": "ThreadTabs",
        "props": [
          {
            "name": "tabs",
            "type": "ThreadTab[]",
            "required": true,
            "description": "The open tabs, in display order. A tab added between renders glides open in place; a removed one folds away while its neighbours slide over."
          },
          {
            "name": "activeId",
            "type": "string",
            "required": false,
            "description": "Id of the tab on stage. Its pill renders filled and carries `aria-current`."
          },
          {
            "name": "onTabSelect",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the clicked tab's id."
          },
          {
            "name": "onTabClose",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the tab's id when its close button is pressed, or Delete lands on the focused tab. The close affordance renders only when this is given."
          },
          {
            "name": "statusLabels",
            "type": "Partial<Record<ThreadTabStatus, string>>",
            "required": false,
            "description": "Spoken text for each tab status, read after the tab's label; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed)."
          },
          {
            "name": "closeLabel",
            "type": "string | ((title: string) => string)",
            "required": false,
            "description": "Accessible name for a tab's close button. A string is followed by a colon\nand the tab's label (\"Close thread: Q3 plan\"); a function is given the\nlabel and returns the whole name, so a translation can put the label where\nits grammar needs it.",
            "defaultValue": "Close thread"
          },
          {
            "name": "onAdd",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the trailing new-tab button is pressed. The button renders only when this is given."
          },
          {
            "name": "addLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the new-tab button.",
            "defaultValue": "New thread"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the tab strip.",
            "defaultValue": "Open threads"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "TimePicker",
    "label": "Time picker",
    "slug": "time-picker",
    "category": "forms",
    "description": "Time-of-day field with a dropdown list of selectable times.",
    "client": true,
    "importPath": "rift-ds/components/TimePicker/TimePicker",
    "barrel": "main",
    "exports": [
      {
        "component": "TimePicker",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text rendered above the trigger"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "Placeholder shown when no time is selected",
            "defaultValue": "Select time"
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected time as a 24-hour \"HH:MM\" string (controlled)"
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "Initially selected time as a 24-hour \"HH:MM\" string (uncontrolled)"
          },
          {
            "name": "minTime",
            "type": "string",
            "required": false,
            "description": "Earliest generated option, as a 24-hour \"HH:MM\" string",
            "defaultValue": "00:00"
          },
          {
            "name": "maxTime",
            "type": "string",
            "required": false,
            "description": "Latest generated option, as a 24-hour \"HH:MM\" string",
            "defaultValue": "23:30"
          },
          {
            "name": "stepMinutes",
            "type": "number",
            "required": false,
            "description": "Minutes between generated options",
            "defaultValue": "30"
          },
          {
            "name": "hourFormat",
            "type": "\"12\" | \"24\"",
            "required": false,
            "description": "Display format for the trigger and options — the value stays a 24-hour \"HH:MM\" string either way",
            "defaultValue": "12"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the picker is disabled",
            "defaultValue": "false"
          },
          {
            "name": "required",
            "type": "boolean",
            "required": false,
            "description": "Whether the field is required",
            "defaultValue": "false"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state",
            "defaultValue": "false"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message"
          },
          {
            "name": "onValueChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the newly selected 24-hour \"HH:MM\" value"
          },
          {
            "name": "periodLabels",
            "type": "{ am?: string; pm?: string; } | undefined",
            "required": false,
            "description": "The period suffixes a 12-hour time is written with, merged over the\nEnglish defaults `{ am: 'AM', pm: 'PM' }`. Only read when `hourFormat` is\n`'12'`."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes, applied to the Field wrapper around the label,\ntrigger and helper text, not to the trigger button the ref and the other\nprops reach.",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Timeline",
    "label": "Timeline",
    "slug": "timeline",
    "category": "data-display",
    "description": "Ordered sequences: histories and steppers.",
    "client": false,
    "importPath": "rift-ds/components/Timeline/Timeline",
    "barrel": "main",
    "exports": [
      {
        "component": "Timeline",
        "props": [
          {
            "name": "variant",
            "type": "\"default\" | \"company\"",
            "required": false,
            "description": "Selects the flat step/event layout — the default when omitted\nSelects the grouped layout: roles nested under a company logo"
          },
          {
            "name": "items",
            "type": "TimelineItem[] | TimelineCompany[]",
            "required": true,
            "description": "Ordered list of steps/events\nOrdered list of company/tool entries"
          },
          {
            "name": "orientation",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "`vertical` timeline (default) or `horizontal` stepper",
            "defaultValue": "vertical"
          },
          {
            "name": "numbered",
            "type": "boolean",
            "required": false,
            "description": "Number the markers 1..n instead of dots",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "presentLabel",
            "type": "string",
            "required": false,
            "description": "Text shown in place of the end date for a role marked `present`",
            "defaultValue": "Present"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Toast",
    "label": "Toast",
    "slug": "toast",
    "category": "feedback",
    "description": "Temporary notification with status variants, auto-dismiss, and stacking via ToastProvider.",
    "client": true,
    "importPath": "rift-ds/components/Toast/Toast",
    "barrel": "main",
    "exports": [
      {
        "component": "Toast",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Toast title text.\nNote: this shadows the native `title` tooltip attribute, which Toast does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "Toast description / body text"
          },
          {
            "name": "variant",
            "type": "\"error\" | \"info\" | \"positive\" | \"warning\" | \"neutral\"",
            "required": false,
            "description": "Toast variant",
            "defaultValue": "info"
          },
          {
            "name": "dismissible",
            "type": "boolean",
            "required": false,
            "description": "Whether the toast can be manually dismissed. The dismiss button renders only when `onDismiss` is also given",
            "defaultValue": "true"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Custom icon override — Material Symbol name (string) or custom element (ReactNode)"
          },
          {
            "name": "onDismiss",
            "type": "(() => void)",
            "required": false,
            "description": "Fires when the dismiss button is pressed. The button renders only when this is given (and `dismissible` is not false); the host owns removing the toast"
          },
          {
            "name": "dismissLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the dismiss button",
            "defaultValue": "Dismiss notification"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "ToastProvider",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": true,
            "description": "Children that can access the toast context"
          },
          {
            "name": "position",
            "type": "\"top-right\" | \"top-left\" | \"bottom-right\" | \"bottom-left\" | \"top-center\" | \"bottom-center\"",
            "required": false,
            "description": "Position of the toast stack",
            "defaultValue": "bottom-right"
          },
          {
            "name": "maxToasts",
            "type": "number",
            "required": false,
            "description": "Maximum number of visible toasts",
            "defaultValue": "5"
          },
          {
            "name": "regionLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the toast stack's region landmark",
            "defaultValue": "Notifications"
          },
          {
            "name": "dismissLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of every toast's dismiss button",
            "defaultValue": "Dismiss notification"
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ToggleGroup",
    "label": "Toggle group",
    "slug": "toggle-group",
    "category": "actions",
    "description": "A set of two-state buttons that can be toggled on or off, supporting text and icon items.",
    "client": true,
    "importPath": "rift-ds/components/ToggleGroup/ToggleGroup",
    "barrel": "main",
    "exports": [
      {
        "component": "ToggleGroup",
        "props": [
          {
            "name": "items",
            "type": "ToggleGroupItem[]",
            "required": true,
            "description": "Available items"
          },
          {
            "name": "value",
            "type": "string | string[]",
            "required": false,
            "description": "Currently active value(s), controlled. Leave undefined to let the group\nkeep its own selection, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string | string[]",
            "required": false,
            "description": "Active value(s) on first render when uncontrolled (`value` undefined).",
            "defaultValue": "[]"
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Allow multiple selection, where each item toggles on or off. Without it\nexactly one item is active once chosen, and pressing it again keeps it.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "tone",
            "type": "\"default\" | \"neutral\"",
            "required": false,
            "description": "Colour of active items: `default` takes the action colour, `neutral`\nfills them grey, for a set whose selection should not carry the action\ncolour's weight."
          },
          {
            "name": "variant",
            "type": "\"neutral\" | \"primary\"",
            "required": false,
            "description": "Legacy name for `tone`, from before colour moved onto its own prop:\n`primary` is `tone=\"default\"`.",
            "deprecated": "Use `tone` instead."
          },
          {
            "name": "disabled",
            "type": "boolean",
            "required": false,
            "description": "Whether the whole group is disabled",
            "defaultValue": "false"
          },
          {
            "name": "onValueChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Called with the next selection — a string when single, an array when `multiple`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((value: string | string[]) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ToggleSwitch",
    "label": "Toggle switch",
    "slug": "toggle-switch",
    "category": "forms",
    "description": "Binary on/off toggle control with sliding thumb and check indicator, for settings that take effect immediately.",
    "client": true,
    "importPath": "rift-ds/components/ToggleSwitch/ToggleSwitch",
    "barrel": "main",
    "exports": [
      {
        "component": "ToggleSwitch",
        "props": [
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the toggle is on, controlled. Leave undefined to let the switch\nkeep its own state, seeded from `defaultChecked`."
          },
          {
            "name": "defaultChecked",
            "type": "boolean",
            "required": false,
            "description": "Whether the toggle starts on when uncontrolled (`checked` undefined). Defaults to true, so an uncontrolled switch starts on unless this is false.",
            "defaultValue": "true"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Label text displayed next to the toggle",
            "defaultValue": "Toggle"
          },
          {
            "name": "showLabel",
            "type": "boolean",
            "required": false,
            "description": "Whether to show the label",
            "defaultValue": "true"
          },
          {
            "name": "helperText",
            "type": "string",
            "required": false,
            "description": "Helper or error message rendered under the label text"
          },
          {
            "name": "error",
            "type": "boolean",
            "required": false,
            "description": "Error state — recolours the helper text and marks the switch invalid",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
          },
          {
            "name": "onCheckedChange",
            "type": "((checked: boolean) => void)",
            "required": false,
            "description": "Called with the next checked state when toggled"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "onChange",
            "type": "((checked: boolean) => void)",
            "required": false,
            "description": "Legacy change handler, kept for backwards compatibility.",
            "deprecated": "Use `onCheckedChange` instead."
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Legacy accessible-name prop.",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      },
      {
        "component": "SwitchIndicator",
        "props": [
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the switch is on.",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Track size: `default` is 42×24px, `compact` 34×20px.",
            "defaultValue": "default"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "ToolCall",
    "label": "Tool call",
    "slug": "tool-call",
    "category": "ai",
    "description": "The record of one tool invocation, with its arguments and result behind a disclosure.",
    "client": true,
    "importPath": "rift-ds/components/ToolCall/ToolCall",
    "barrel": "main",
    "exports": [
      {
        "component": "ToolCall",
        "props": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "The tool that was invoked, shown in monospace."
          },
          {
            "name": "status",
            "type": "ToolCallStatus",
            "required": false,
            "description": "Where the call has got to. Drives the colour, the indicator, and the default status text.",
            "defaultValue": "success"
          },
          {
            "name": "summary",
            "type": "string",
            "required": false,
            "description": "One line describing this particular call, e.g. the target path or query."
          },
          {
            "name": "duration",
            "type": "string",
            "required": false,
            "description": "How long the call took, e.g. \"1.2s\". Free text, so callers keep their own formatting."
          },
          {
            "name": "statusLabel",
            "type": "string",
            "required": false,
            "description": "Override the status text shown beside the indicator."
          },
          {
            "name": "open",
            "type": "boolean",
            "required": false,
            "description": "Open state for controlled use. Pair with `onOpenChange`."
          },
          {
            "name": "defaultOpen",
            "type": "boolean",
            "required": false,
            "description": "Open state for uncontrolled use.",
            "defaultValue": "false"
          },
          {
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Fires whenever the panel opens or closes."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Controls for a call awaiting a decision — allow, deny, always allow.\nRendered outside the collapsible panel, so approving never requires\nexpanding the call first."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The call's arguments and result."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Toolbar",
    "label": "Toolbar",
    "slug": "toolbar",
    "category": "layout",
    "description": "A grouped strip of controls in one pill shell: clusters, separators, arrow-key focus, and a glass floating variant.",
    "client": true,
    "importPath": "rift-ds/components/Toolbar/Toolbar",
    "barrel": "main",
    "exports": [
      {
        "component": "Toolbar",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "Accessible name for the toolbar — what a screen reader calls the group."
          },
          {
            "name": "orientation",
            "type": "\"horizontal\" | \"vertical\"",
            "required": false,
            "description": "Which way the controls run.",
            "defaultValue": "horizontal"
          },
          {
            "name": "variant",
            "type": "\"default\" | \"floating\"",
            "required": false,
            "description": "`default` is an attached bar on the container fill; `floating` is the\nglass pill for controls hovering over content — position it with your own\nlayout (the component never fixes itself to the viewport).",
            "defaultValue": "default"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The toolbar's controls — group unrelated clusters with `ToolbarSeparator`."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "ToolbarSeparator",
        "props": []
      }
    ]
  },
  {
    "kind": "component",
    "name": "Tooltip",
    "label": "Tooltip",
    "slug": "tooltip",
    "category": "overlays",
    "description": "Contextual text label that appears on hover or focus with position and delay options.",
    "client": true,
    "importPath": "rift-ds/components/Tooltip/Tooltip",
    "barrel": "main",
    "exports": [
      {
        "component": "Tooltip",
        "props": [
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Trigger element"
          },
          {
            "name": "content",
            "type": "string",
            "required": true,
            "description": "Tooltip text content. Replaces the native `content` attribute, which only\nmeans something on a `<meta>` element."
          },
          {
            "name": "position",
            "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
            "required": false,
            "description": "Preferred position",
            "defaultValue": "top"
          },
          {
            "name": "showDelay",
            "type": "number",
            "required": false,
            "description": "Delay before showing (in ms)",
            "defaultValue": "300"
          },
          {
            "name": "hideDelay",
            "type": "number",
            "required": false,
            "description": "Delay before hiding (in ms)",
            "defaultValue": "150"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "TopAppBar",
    "label": "Top app bar",
    "slug": "top-app-bar",
    "category": "navigation",
    "description": "Mobile screen header with a menu or back button, title, and actions, in Rift, iOS, or Android style, collapsing on scroll.",
    "client": true,
    "importPath": "rift-ds/components/TopAppBar/TopAppBar",
    "barrel": "main",
    "exports": [
      {
        "component": "TopAppBar",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The screen's title.\nNote: this shadows the native `title` tooltip attribute, which TopAppBar does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "A second line under the title, e.g. a count or a date range"
          },
          {
            "name": "platform",
            "type": "\"default\" | \"ios\" | \"android\"",
            "required": false,
            "description": "Which platform's bar to draw. `default` is the Rift bar; `ios` is the iOS\n26 navigation bar, with glass circle buttons over content and a soft\nblurred edge; `android` is the Material 3 Expressive top app bar.",
            "defaultValue": "default"
          },
          {
            "name": "size",
            "type": "\"small\" | \"large\" | \"medium\"",
            "required": false,
            "description": "`small` puts the title in the bar. `medium` and `large` add an expanded\ntitle under it that collapses into the bar as the page scrolls; on iOS\nboth are the large title.",
            "defaultValue": "small"
          },
          {
            "name": "align",
            "type": "\"center\" | \"start\"",
            "required": false,
            "description": "Title alignment in the bar. Defaults to centred on iOS and to the start edge elsewhere"
          },
          {
            "name": "navigation",
            "type": "\"menu\" | \"close\" | \"back\"",
            "required": false,
            "description": "The leading control: a menu button, a back button, or a close button"
          },
          {
            "name": "onNavigate",
            "type": "(() => void)",
            "required": false,
            "description": "Called when the leading control is pressed"
          },
          {
            "name": "navigationLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label of the leading control; defaults to \"Open menu\", \"Back\" or \"Close\""
          },
          {
            "name": "actions",
            "type": "TopAppBarAction[]",
            "required": false,
            "description": "Trailing actions. The first three show as icon buttons; any more join the\noverflow menu, ahead of `overflowActions`, where they render as plain rows\n(a menu row draws no badge and routes from `onClick`, not `href`)",
            "defaultValue": "[]"
          },
          {
            "name": "overflowActions",
            "type": "TopAppBarOverflowAction[]",
            "required": false,
            "description": "Actions listed in a menu behind a trailing \"More\" button",
            "defaultValue": "[]"
          },
          {
            "name": "overflowLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label of the button that opens the overflow menu",
            "defaultValue": "More"
          },
          {
            "name": "badgeLabel",
            "type": "((label: string) => string)",
            "required": false,
            "description": "The accessible name of an action that carries a `badge`, given the\naction's `label`. Defaults to \"<label>, new\", e.g. \"Notifications, new\".",
            "defaultValue": "(label: string) => `${label}, new`"
          },
          {
            "name": "scrolled",
            "type": "boolean",
            "required": false,
            "description": "Whether content has scrolled under the bar, which collapses an expanded\ntitle and switches the bar to its scrolled surface. Leave unset to have\nthe bar watch `scrollTarget` itself."
          },
          {
            "name": "scrollTarget",
            "type": "HTMLElement | null",
            "required": false,
            "description": "The element whose scroll the bar watches when `scrolled` is unset. Defaults to the window"
          },
          {
            "name": "headingLevel",
            "type": "1 | 2 | 4 | 3 | 5 | 6",
            "required": false,
            "description": "Level of the title's heading element",
            "defaultValue": "1"
          },
          {
            "name": "sticky",
            "type": "boolean",
            "required": false,
            "description": "Keeps the bar stuck to the top of its scroll container",
            "defaultValue": "true"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router. Wins over a LinkProvider's; a plain\n`<a>` when neither is set."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "TreeView",
    "label": "Tree view",
    "slug": "tree-view",
    "category": "data-display",
    "description": "Collapsible hierarchy for files, folders, and nested structures.",
    "client": true,
    "importPath": "rift-ds/components/TreeView/TreeView",
    "barrel": "main",
    "exports": [
      {
        "component": "TreeView",
        "props": [
          {
            "name": "nodes",
            "type": "TreeViewNode[]",
            "required": true,
            "description": "Tree data to render"
          },
          {
            "name": "defaultExpandedIds",
            "type": "string[]",
            "required": false,
            "description": "IDs of initially expanded branches (uncontrolled)",
            "defaultValue": "[]"
          },
          {
            "name": "expandedIds",
            "type": "string[]",
            "required": false,
            "description": "Expanded branch IDs (controlled) — pair with `onExpandedChange`"
          },
          {
            "name": "onExpandedChange",
            "type": "((ids: string[]) => void)",
            "required": false,
            "description": "Called with the full list of expanded branch IDs whenever a branch toggles"
          },
          {
            "name": "selectedId",
            "type": "string",
            "required": false,
            "description": "Selected node ID (controlled) — pair with `onSelect`"
          },
          {
            "name": "defaultSelectedId",
            "type": "string",
            "required": false,
            "description": "ID of the initially selected node (uncontrolled)"
          },
          {
            "name": "onSelect",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Called with the node's ID when a row is selected via click, Enter, or\nSpace. Intentionally shadows the native `select` event handler, which\nhas no meaning on a tree widget."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Treemap",
    "label": "Treemap",
    "slug": "treemap",
    "category": "charts",
    "description": "Nested rectangles sized by value for part-to-whole breakdowns.",
    "client": true,
    "importPath": "rift-ds/components/Chart/Treemap",
    "barrel": "charts",
    "exports": [
      {
        "component": "Treemap",
        "props": [
          {
            "name": "data",
            "type": "TreemapDataItem[]",
            "required": true,
            "description": "Hierarchical data — each item needs `name` and `size` (or `children`)"
          },
          {
            "name": "dataKey",
            "type": "string",
            "required": false,
            "description": "Key used for sizing rectangles",
            "defaultValue": "size"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Chart title, in the shared chart header; it also names the figure.\nNote: this replaces the native `title` tooltip attribute, which the chart does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Description text below the title"
          },
          {
            "name": "summaryItems",
            "type": "ChartSummaryItem[]",
            "required": false,
            "description": "Summary stats displayed in the header"
          },
          {
            "name": "height",
            "type": "number",
            "required": false,
            "description": "Chart area height in pixels",
            "defaultValue": "350"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "sizeLabel",
            "type": "string",
            "required": false,
            "description": "The tooltip's name for a tile's value. Defaults to \"Size\".",
            "defaultValue": "Size"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes on the wrapper",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "UsageCard",
    "label": "Usage card",
    "slug": "usage-card",
    "category": "ai",
    "description": "An agent's budgets at a glance: context window and plan limits as meter rows with reset captions.",
    "client": false,
    "importPath": "rift-ds/components/UsageCard/UsageCard",
    "barrel": "main",
    "exports": [
      {
        "component": "UsageCard",
        "props": [
          {
            "name": "items",
            "type": "UsageItem[]",
            "required": true,
            "description": "The budgets to show, one meter row each"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Card title in the shared chart-chrome header.\nNote: this shadows the native `title` tooltip attribute, which UsageCard does not expose."
          },
          {
            "name": "subtitle",
            "type": "string",
            "required": false,
            "description": "Supporting line under the title"
          },
          {
            "name": "thresholds",
            "type": "{ warning?: number; error?: number; } | undefined",
            "required": false,
            "description": "Fractions of an item's max where its fill recolours to warning and then error"
          },
          {
            "name": "bare",
            "type": "boolean",
            "required": false,
            "description": "Chrome off (no border, padding, or fill) for use inside a panel that supplies the surface",
            "defaultValue": "false"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Waveform",
    "label": "Waveform",
    "slug": "waveform",
    "category": "ai",
    "description": "Voice made visible: a row of bars dancing on the shared twelve-slot cycle, or tracking a live analyser level by level.",
    "client": false,
    "importPath": "rift-ds/components/Waveform/Waveform",
    "barrel": "main",
    "exports": [
      {
        "component": "Waveform",
        "props": [
          {
            "name": "state",
            "type": "\"idle\" | \"listening\" | \"speaking\"",
            "required": false,
            "description": "What the audio channel is doing: `idle` parks the bars low and still,\n`listening` runs a gentle half-height wave, `speaking` runs the full one.\nIgnored while `levels` drives the bars.",
            "defaultValue": "idle"
          },
          {
            "name": "bars",
            "type": "number",
            "required": false,
            "description": "How many bars the wave has.",
            "defaultValue": "5"
          },
          {
            "name": "levels",
            "type": "number[]",
            "required": false,
            "description": "Live amplitudes from a real audio analyser, one 0–1 value per bar.\nProviding them switches the component to controlled mode: the CSS wave\nstops and each bar tracks its level, easing between updates."
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Bar height scale — `default` sits on `--icon-size-600`, `compact` on `--icon-size-500`.",
            "defaultValue": "default"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "What a screen reader hears the indicator say. Defaults per state\n(\"Listening\", \"Speaking\", \"Microphone idle\")."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "Widget",
    "label": "Widget",
    "slug": "widget",
    "category": "data-display",
    "description": "A titled tile for a dashboard or home screen, with rows, labelled groups, and a board that packs tiles into columns.",
    "client": false,
    "importPath": "rift-ds/components/Widget/Widget",
    "barrel": "main",
    "exports": [
      {
        "component": "Widget",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The tile's heading. Also the section's accessible name, unless an `aria-label` is passed. Note: this shadows the native `title` tooltip attribute, which Widget does not expose."
          },
          {
            "name": "count",
            "type": "number",
            "required": false,
            "description": "A quiet figure after the title: how many rows the tile holds, how many are open."
          },
          {
            "name": "action",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing header slot, opposite the title — a compact button, a link, a period label."
          },
          {
            "name": "titleAs",
            "type": "\"h2\" | \"h3\" | \"h4\"",
            "required": false,
            "description": "Heading element for the title, so the tile takes its place in the page's outline.",
            "defaultValue": "h3"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The tile's body: WidgetRows, WidgetGroups, a chart, a figure, anything."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "WidgetGrid",
        "props": [
          {
            "name": "columns",
            "type": "1 | 2 | 3",
            "required": false,
            "description": "The most columns the board runs to. It folds to fewer as its own width narrows.",
            "defaultValue": "2"
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The Widgets on the board, in reading order: they fill the first column, then the next."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "WidgetGroup",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": true,
            "description": "The run's quiet label, e.g. \"Waiting on you\"."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "The rows in this run."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "WidgetRow",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The row's main line. Note: this shadows the native `title` tooltip attribute, which WidgetRow does not expose."
          },
          {
            "name": "description",
            "type": "string",
            "required": false,
            "description": "A quiet second line under the title: who, where, or how much."
          },
          {
            "name": "leading",
            "type": "ReactNode",
            "required": false,
            "description": "Leading mark — a StatusDot, a PixelAvatar, an Avatar, a Spinner, an icon. Decorative unless the element names itself."
          },
          {
            "name": "meta",
            "type": "ReactNode",
            "required": false,
            "description": "Trailing fact in the caption face: a date, an amount, a state."
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Renders the row as a link to this URL."
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          },
          {
            "name": "linkComponent",
            "type": "LinkComponent",
            "required": false,
            "description": "The component its links render with, such as Next.js's `Link`, so they\nnavigate through the app's router; a plain `<a>` when unset. This\ncomponent can render on the server, so it never reads a LinkProvider:\npass the prop even under one."
          }
        ]
      }
    ]
  },
  {
    "kind": "component",
    "name": "WorldMap",
    "label": "World map",
    "slug": "world-map",
    "category": "maps",
    "description": "A flat world map from Natural Earth land shapes: token-coloured continents, framed bounds, and colour-carrying markers.",
    "client": true,
    "importPath": "rift-ds/components/WorldMap/WorldMap",
    "barrel": "main",
    "exports": [
      {
        "component": "WorldMap",
        "props": [
          {
            "name": "points",
            "type": "WorldMapPoint[]",
            "required": false,
            "description": "The places to mark. A point outside the framed view is simply not drawn.",
            "defaultValue": "[]"
          },
          {
            "name": "bounds",
            "type": "WorldMapBounds",
            "required": false,
            "description": "The window the map frames: `[west, south, east, north]` in degrees.\nIt must not cross the antimeridian. Defaults to the whole world\n(Antarctica is not in the land data). Changing it resets any zoom.",
            "defaultValue": "[-180, -58, 180, 84]"
          },
          {
            "name": "fit",
            "type": "\"cover\" | \"contain\"",
            "required": false,
            "description": "How the framed window meets the container: `contain` letterboxes so the\nwhole window is visible, `cover` fills the container and crops the\nwindow's edges — the full-bleed stage look.",
            "defaultValue": "contain"
          },
          {
            "name": "showZoomControls",
            "type": "boolean",
            "required": false,
            "description": "Renders the zoom pill (zoom out, a percent readout that resets the\nview, zoom in). Zoom steps into `bounds` and out past them — down to\nthe whole world with air around it, the graticule carrying on into\nthe space. Ctrl or ⌘ with the scroll wheel (a trackpad pinch) zooms at\nthe pointer; a plain scroll keeps scrolling the page. Dragging, or the\narrow keys with the map focused, moves the view anywhere on the world\nat any zoom; a finger only drags while zoomed in, so the page keeps\nits touch scroll too. Needs `interactive`.",
            "defaultValue": "false"
          },
          {
            "name": "maxZoom",
            "type": "number",
            "required": false,
            "description": "How far the zoom controls can step in, as a multiple of `bounds`.",
            "defaultValue": "8"
          },
          {
            "name": "graticuleStep",
            "type": "number",
            "required": false,
            "description": "Degrees between graticule lines. `0` removes the graticule.",
            "defaultValue": "15"
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "required": false,
            "description": "Draw each point's `label` beside its marker.",
            "defaultValue": "false"
          },
          {
            "name": "activePointId",
            "type": "string",
            "required": false,
            "description": "The point to single out: its marker enlarges and its callout renders."
          },
          {
            "name": "interactive",
            "type": "boolean",
            "required": false,
            "description": "Markers are real buttons: hoverable, focusable, clickable. Off, they become inert glyphs and the map is one image.",
            "defaultValue": "true"
          },
          {
            "name": "onPointHover",
            "type": "((point: WorldMapPoint | null) => void)",
            "required": false,
            "description": "Fires as the pointer enters a marker (or it takes focus), and with `null` as it leaves."
          },
          {
            "name": "onPointClick",
            "type": "((point: WorldMapPoint) => void)",
            "required": false,
            "description": "Fires when a marker is clicked."
          },
          {
            "name": "renderCallout",
            "type": "((point: WorldMapPoint) => ReactNode)",
            "required": false,
            "description": "Renders the annotation for the active (or hovered) point, placed beside\nits marker in an HTML overlay; MapCallout is the intended filling. The\noverlay carries `data-side=\"left\"|\"right\"` for which side of the marker\nit opens on — toward the map's centre, where the room is."
          },
          {
            "name": "renderHoverCard",
            "type": "((point: WorldMapPoint) => ReactNode)",
            "required": false,
            "description": "Wraps each marker in the library's HoverCard, with this as the card's\ncontent — the floating-panel alternative to `renderCallout`'s bare\nreadout, opening on hover or focus with the system's delays and Escape\ndismissal. Content must be phrasing-level (spans), the panel's own\nrule. Opens upward, or downward for a marker near the frame's top.\nNeeds `interactive`; when both renderers are given, this one wins."
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible name for the map, e.g. \"Offices across the network\". The\npoint count is appended for screen readers.",
            "defaultValue": "World map"
          },
          {
            "name": "pointsLabel",
            "type": "((count: number) => string)",
            "required": false,
            "description": "The point count appended to the map's accessible name, given the count. Defaults to \"<count> point\" or \"<count> points\".",
            "defaultValue": "(count) => `${count} ${count === 1 ? 'point' : 'points'}`"
          },
          {
            "name": "zoomHintLabel",
            "type": "string",
            "required": false,
            "description": "The keyboard and pointer instructions appended to the map's accessible name while zooming is on.",
            "defaultValue": "Zoom with the controls or the plus and minus keys; drag or use the arrow keys to move the map."
          },
          {
            "name": "zoomControlsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the zoom toolbar. Defaults to \"Map zoom controls\".",
            "defaultValue": "Map zoom controls"
          },
          {
            "name": "zoomOutLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the zoom-out button. Defaults to \"Zoom out\".",
            "defaultValue": "Zoom out"
          },
          {
            "name": "zoomInLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the zoom-in button. Defaults to \"Zoom in\".",
            "defaultValue": "Zoom in"
          },
          {
            "name": "zoomResetLabel",
            "type": "((percent: number) => string)",
            "required": false,
            "description": "Accessible name of the zoom readout that resets the view, given the zoom as a whole percentage. Defaults to \"Zoom <percent>%. Reset the view\".",
            "defaultValue": "(percent) => `Zoom ${percent}%. Reset the view`"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "kind": "widget",
    "name": "ChatWidget",
    "label": "AI chat",
    "slug": "ai-chat",
    "category": "widget",
    "description": "The whole AI chat: the panel, the streaming replies, the history, the cards and questions a reply can carry and the server handlers, set up with props.",
    "client": true,
    "importPath": "rift-ds/chat",
    "barrel": "chat",
    "exports": [
      {
        "component": "ChatWidget",
        "props": [
          {
            "name": "fullscreenEnabled",
            "type": "boolean",
            "required": false,
            "description": "Show the expand toggle. A host whose stage is always a takeover hides it.",
            "defaultValue": "true"
          },
          {
            "name": "closeEnabled",
            "type": "boolean",
            "required": false,
            "description": "Show the header's close button. A host that seats the chat as the page\nitself rather than as a panel over one has nothing to close back to,\nso it turns this off.",
            "defaultValue": "true"
          },
          {
            "name": "placementEnabled",
            "type": "boolean",
            "required": false,
            "description": "Show the header's Chat position menu (dock right, dock left, floating). Off by default: a host turns it on only when it implements the seats the menu offers, as ChatLauncher does.",
            "defaultValue": "false"
          },
          {
            "name": "compact",
            "type": "boolean",
            "required": false,
            "description": "Narrow insets for phone-width hosts.",
            "defaultValue": "false"
          },
          {
            "name": "phone",
            "type": "boolean",
            "required": false,
            "description": "The host is a phone viewport, where the soft keyboard will claim the\nlower half of the screen the moment the composer is focused. The\nwelcome screen stacks instead of centring the composer: greeting in\nthe middle of the empty thread, starters directly above the composer,\ncomposer pinned to the bottom from the first paint.",
            "defaultValue": "false"
          },
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "The header brand name, which also seeds the agent's PixelAvatar.\nNote: not the native `title` tooltip attribute; ChatWidget spreads no native attributes.",
            "defaultValue": "Assistant"
          },
          {
            "name": "flow",
            "type": "\"top-down\" | \"bottom-up\"",
            "required": false,
            "description": "Which way the conversation reads. `top-down` (the default) floats each\nnew turn to the top of the thread and streams the answer in below it.\n`bottom-up` is the classic message thread: turns stack from the bottom,\nthe newest just above the composer, and the view follows the answer.",
            "defaultValue": "top-down"
          },
          {
            "name": "placeholder",
            "type": "string",
            "required": false,
            "description": "The composer's placeholder text.",
            "defaultValue": "Ask anything"
          },
          {
            "name": "questionsPlaceholder",
            "type": "string",
            "required": false,
            "description": "The composer's placeholder while a set of questions holds it: the answer goes in the card, or the card is skipped.",
            "defaultValue": "Answer the questions above, or skip them"
          },
          {
            "name": "showStarters",
            "type": "boolean",
            "required": false,
            "description": "Show the conversation starters on the welcome screen.",
            "defaultValue": "true"
          },
          {
            "name": "logo",
            "type": "string | null",
            "required": false,
            "description": "The header mark's image src; null (the default) shows the name alone.",
            "defaultValue": "null"
          },
          {
            "name": "tagline",
            "type": "string",
            "required": false,
            "description": "The welcome screen's line under the greeting.",
            "defaultValue": "How can I help you today?"
          },
          {
            "name": "starters",
            "type": "Starter[]",
            "required": false,
            "description": "The conversation starters: a few pre-written questions. Each must fit the chip budget (SUGGESTION_MAX_CHARS); one that does not is dropped rather than clipped."
          },
          {
            "name": "startersKey",
            "type": "string",
            "required": false,
            "description": "Keys the starters' staged reveal: a new key replays the generation beat, the same key shows the set standing. A host whose starters follow the page passes the pathname.",
            "defaultValue": ""
          },
          {
            "name": "composerActions",
            "type": "ReactNode",
            "required": false,
            "description": "Replaces the composer's leading actions (the model picker)."
          },
          {
            "name": "models",
            "type": "ChatModelOption[]",
            "required": false,
            "description": "The models the picker offers. The pick rides on each send as a wire value; the server resolves it. Omit for no picker."
          },
          {
            "name": "defaultModel",
            "type": "string",
            "required": false,
            "description": "The picker's selection before the server has reported its default. Defaults to the first model."
          },
          {
            "name": "lockedModelDescription",
            "type": "string",
            "required": false,
            "description": "The one line a locked model shows in place of its description.",
            "defaultValue": "Paused for today to stay in budget."
          },
          {
            "name": "fileAttachments",
            "type": "boolean",
            "required": false,
            "description": "Let the visitor attach files: an attach button, paste, drop anywhere\non the chat, and long pastes folded into a tile. Files are read in the\nbrowser for previews; what reaches the transport is names and kinds.",
            "defaultValue": "false"
          },
          {
            "name": "maxAttachments",
            "type": "number",
            "required": false,
            "description": "Most files the visitor may queue on one message.",
            "defaultValue": "10"
          },
          {
            "name": "maxAttachmentBytes",
            "type": "number",
            "required": false,
            "description": "Largest file the visitor may queue, in bytes.",
            "defaultValue": "50 * 1024 * 1024"
          },
          {
            "name": "mentions",
            "type": "MentionSource[]",
            "required": false,
            "description": "What the visitor can reference while typing: one source per trigger\ncharacter, drawn as tags in the composer and in the sent bubble."
          },
          {
            "name": "threads",
            "type": "RailSlot",
            "required": false,
            "description": "A session-history rail. `true` seats the built-in ChatThreads over the\nprovider's thread lifecycle; a render prop seats your own. Wide hosts\nseat it as an inline left rail, narrow ones summon it from a header\nhamburger as a slide-over sheet behind a scrim."
          },
          {
            "name": "threadsProps",
            "type": "Omit<ChatThreadsProps, \"close\" | \"overlay\">",
            "required": false,
            "description": "Props for the built-in threads rail when `threads` is `true`."
          },
          {
            "name": "tabs",
            "type": "ReactNode",
            "required": false,
            "description": "An open-sessions tab strip as its own row under the header. `true` seats the built-in ChatTabs; a node seats your own."
          },
          {
            "name": "tabsProps",
            "type": "ChatTabsProps",
            "required": false,
            "description": "Props for the built-in tab strip when `tabs` is `true`: its name, its close buttons' names and its spoken statuses."
          },
          {
            "name": "aside",
            "type": "((ctx: { overlay: boolean; close: () => void; }) => ReactNode)",
            "required": false,
            "description": "A companion rail on the trailing edge, the mirror of `threads`: a render prop for your own pane, seated inline on a wide host and raised as a bottom sheet from a header button on a narrow one. For the built-in pane pass `agent` instead."
          },
          {
            "name": "agent",
            "type": "ChatAgentOptions",
            "required": false,
            "description": "The built-in agent pane: who the agent is and what it has been doing. Seated like `aside`."
          },
          {
            "name": "artifacts",
            "type": "boolean",
            "required": false,
            "description": "Seat the artifact panel: a reply that carries an artifact draws a tile in the thread, and the tile (or the header's artifact button) opens the artifact beside the conversation on a wide host and as a bottom sheet on a narrow one. The trailing seat holds one panel at a time, so an open artifact stands in for the agent pane. Off, none of it exists: no header button, no tile, no panel.",
            "defaultValue": "false"
          },
          {
            "name": "contextLabel",
            "type": "string | null",
            "required": false,
            "description": "The composer's context note, naming what the chat is looking at. Omit for none. The note's wording comes from `contextNote`."
          },
          {
            "name": "contextNote",
            "type": "((title: string) => string)",
            "required": false,
            "description": "The composer's context note, written from `contextLabel`. Defaults to `Looking at “<title>”`.",
            "defaultValue": "(title: string) => `Looking at “${title}”`"
          },
          {
            "name": "attachHint",
            "type": "((maxSize: string, maxFiles: number, maxBytes: number) => string)",
            "required": false,
            "description": "The second line of the drop overlay with attachments on, written from the limits: the largest file as text (\"50 MB\"), the most files per message, and the largest file in bytes for a host that formats sizes itself. Defaults to `Up to <maxSize> each · <maxFiles> files max`.",
            "defaultValue": "(maxSize: string, maxFiles: number) =>\n  `Up to ${maxSize} each · ${maxFiles} files max`"
          },
          {
            "name": "greetings",
            "type": "Partial<GreetingCopy>",
            "required": false,
            "description": "The welcome greeting for each part of the visitor's day; a key left out keeps its English. Defaults to \"Good morning\", \"Good afternoon\" and \"Good evening\"."
          },
          {
            "name": "placementLabels",
            "type": "Partial<Record<ChatPlacement, string>>",
            "required": false,
            "description": "The Chat position menu's rows, one per seat; a key left out keeps its English. Defaults to \"Dock right\", \"Dock left\" and \"Floating\"."
          },
          {
            "name": "agentStatus",
            "type": "string",
            "required": false,
            "description": "The status line under the agent's name in the agent pane, where `agent` brings no `profile` of its own. Defaults to \"Connected\".",
            "defaultValue": "Connected"
          },
          {
            "name": "artifactPanelTitle",
            "type": "string",
            "required": false,
            "description": "The artifact panel's title while nothing is on stage. Defaults to \"Artifacts\".",
            "defaultValue": "Artifacts"
          },
          {
            "name": "artifactEmptyTitle",
            "type": "string",
            "required": false,
            "description": "The artifact panel's empty-state heading. Defaults to \"Nothing here yet\".",
            "defaultValue": "Nothing here yet"
          },
          {
            "name": "artifactEmptyDescription",
            "type": "string",
            "required": false,
            "description": "The artifact panel's empty-state description. Defaults to \"What the chat makes for you, like a dashboard or a page, opens in this panel.\"",
            "defaultValue": "What the chat makes for you, like a dashboard or a page, opens in this panel."
          },
          {
            "name": "widgets",
            "type": "ReactNode",
            "required": false,
            "description": "A widget slot on the welcome screen, under the composer and its\nstarters. It takes any content and keeps its natural height, so the\ncomposer rides up by half of it instead of holding dead centre: the\nempty chat reads as a home page rather than a blank prompt. It leaves\nwith the first message, like the rest of the welcome dressing."
          },
          {
            "name": "widgetsLayout",
            "type": "\"scroll\" | \"fit\"",
            "required": false,
            "description": "How the widget slot takes its room. `fit` keeps the welcome screen to\none viewport: the widgets hold their height and the composer rides up\nto make room. `scroll` turns the welcome screen into a page: the\ngreeting and composer take the opening of the viewport, the widgets\nrun on below the fold, and the whole welcome scrolls as one.",
            "defaultValue": "fit"
          },
          {
            "name": "widgetsWidth",
            "type": "\"column\" | \"wide\"",
            "required": false,
            "description": "How wide the widget slot runs. `column` holds it to the composer's\nbounding box; `wide` lets it run past them, for a dashboard.",
            "defaultValue": "column"
          },
          {
            "name": "disclaimer",
            "type": "ReactNode",
            "required": false,
            "description": "The quiet line pinned to the widget's floor: what the chat is and where its policy lives.",
            "defaultValue": "Answers may be wrong."
          },
          {
            "name": "startersLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the welcome screen's conversation starters. Defaults to \"Conversation starters\".",
            "defaultValue": "Conversation starters"
          },
          {
            "name": "newChatLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the header's new-chat button. Defaults to \"New chat\".",
            "defaultValue": "New chat"
          },
          {
            "name": "showAgentLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the agent-pane toggle while the pane is closed. Defaults to \"Show the agent panel\".",
            "defaultValue": "Show the agent panel"
          },
          {
            "name": "hideAgentLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the agent-pane toggle while the pane is open. Defaults to \"Hide the agent panel\".",
            "defaultValue": "Hide the agent panel"
          },
          {
            "name": "closeAgentLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the agent pane's own close button, and of the scrim that closes the pane's bottom sheet. Defaults to \"Close the agent panel\".",
            "defaultValue": "Close the agent panel"
          },
          {
            "name": "showArtifactLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the artifact-panel toggle while the panel is closed. Defaults to \"Show the artifact panel\".",
            "defaultValue": "Show the artifact panel"
          },
          {
            "name": "hideArtifactLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the artifact-panel toggle while the panel is open. Defaults to \"Hide the artifact panel\".",
            "defaultValue": "Hide the artifact panel"
          },
          {
            "name": "closeArtifactLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the scrim that closes the artifact panel's bottom sheet. Defaults to \"Close the artifact panel\".",
            "defaultValue": "Close the artifact panel"
          },
          {
            "name": "placementLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the Chat position menu's button, and the heading of its group. Defaults to \"Chat position\".",
            "defaultValue": "Chat position"
          },
          {
            "name": "enterFullscreenLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the expand toggle in panel view. Defaults to \"Enter full screen\".",
            "defaultValue": "Enter full screen"
          },
          {
            "name": "exitFullscreenLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the expand toggle in full-screen view. Defaults to \"Exit full screen\".",
            "defaultValue": "Exit full screen"
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the header's close button. Defaults to \"Close chat\".",
            "defaultValue": "Close chat"
          },
          {
            "name": "openThreadsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the header button that opens the chat-history sheet on a narrow host. Defaults to \"Open the chat history\".",
            "defaultValue": "Open the chat history"
          },
          {
            "name": "closeThreadsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the scrim that closes the chat-history sheet. Defaults to \"Close the chat history\".",
            "defaultValue": "Close the chat history"
          },
          {
            "name": "modelPickerLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the composer's model picker. Defaults to \"Choose a model\".",
            "defaultValue": "Choose a model"
          },
          {
            "name": "sendLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the composer's send button. Defaults to \"Send\".",
            "defaultValue": "Send"
          },
          {
            "name": "copyResponseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of a reply's copy button. Defaults to \"Copy response\".",
            "defaultValue": "Copy response"
          },
          {
            "name": "copiedResponseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of a reply's copy button once the copy has landed. Defaults to \"Copied\".",
            "defaultValue": "Copied"
          },
          {
            "name": "copiedAnnouncementLabel",
            "type": "string",
            "required": false,
            "description": "What screen readers hear once a reply has been copied. Defaults to \"Copied to clipboard\".",
            "defaultValue": "Copied to clipboard"
          },
          {
            "name": "goodResponseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of a reply's thumbs-up button. Defaults to \"Good response\".",
            "defaultValue": "Good response"
          },
          {
            "name": "badResponseLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of a reply's thumbs-down button. Defaults to \"Bad response\".",
            "defaultValue": "Bad response"
          },
          {
            "name": "followupsLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the follow-up question row under a finished answer. Defaults to \"Follow-up questions\".",
            "defaultValue": "Follow-up questions"
          },
          {
            "name": "pastedTextLabel",
            "type": "string",
            "required": false,
            "description": "The name a long paste's tile wears in the composer and the sent message. Defaults to \"Pasted text\"."
          },
          {
            "name": "reasoningLabel",
            "type": "((durationSeconds: number) => string)",
            "required": false,
            "description": "The reasoning disclosure's summary once the thinking is over, given the seconds it took when known. Defaults to \"Thought for <n>s\", or \"Thought process\" with no duration."
          },
          {
            "name": "composerLabels",
            "type": "Pick<ComposerProps, \"aria-label\" | \"attachmentTileLabels\" | \"attachLabel\" | \"dropLabel\" | \"filesLabel\" | \"formatFileAnnouncement\" | \"formatMentionAnnouncement\" | \"stopLabel\">",
            "required": false,
            "description": "The composer's words, over Composer's English defaults: the attach button (\"Attach files\"), the drop overlay on the shell (\"Drop files to attach\"), the queued files' list (\"Attachments\") and their tiles (`attachmentTileLabels`), the stop button (\"Stop generating\"), the text field's name (\"Message\"), and the sentences announced when files or mention matches change. The send button's name is `sendLabel`."
          },
          {
            "name": "attachmentDropZoneLabels",
            "type": "Pick<AttachmentDropZoneProps, \"label\">",
            "required": false,
            "description": "The drop overlay's headline when a file is dragged over the chat with attachments on, over AttachmentDropZone's \"Drop files to attach\". Its second line is `attachHint`."
          },
          {
            "name": "attachmentGroupLabels",
            "type": "Pick<AttachmentGroupProps, \"label\" | \"showMoreLabel\" | \"showLessLabel\" | \"attachmentTileLabels\" | \"attachmentViewerLabels\">",
            "required": false,
            "description": "The words of the files on a sent message, over AttachmentGroup's English defaults: the list's name (\"Attachments\"), the overflow buttons (\"Show 3 more\", \"Show fewer\"), the tiles' status lines (`attachmentTileLabels`) and the viewer a pressed file opens in (`attachmentViewerLabels`)."
          },
          {
            "name": "chatThreadLabels",
            "type": "Pick<ChatThreadProps, \"ariaLabel\" | \"jumpLabel\">",
            "required": false,
            "description": "The conversation's names, over ChatThread's English defaults: the scrolling region (\"Conversation\") and the scroll-to-latest control (\"Scroll to the latest message\")."
          },
          {
            "name": "modelPickerLabels",
            "type": "Pick<ModelPickerProps, \"placeholder\" | \"listLabel\">",
            "required": false,
            "description": "The model picker's words, over ModelPicker's English defaults: the open list's name (\"Model\") and the trigger's text when nothing is selected (\"Choose a model\"). The trigger's own name is `modelPickerLabel`."
          },
          {
            "name": "artifactPanelLabels",
            "type": "Pick<ArtifactPanelProps, \"collapseLabel\" | \"closeLabel\" | \"expandLabel\" | \"previewLabel\" | \"codeLabel\" | \"viewLabel\" | \"codeBlockLabels\">",
            "required": false,
            "description": "The artifact panel's words, over ArtifactPanel's English defaults: the view switch (\"Preview\", \"Code\", \"Artifact view\"), the expand and close buttons (\"Expand the artifact\", \"Collapse the artifact\", \"Close the artifact\") and the code view's CodeBlock (`codeBlockLabels`)."
          },
          {
            "name": "agentRailLabels",
            "type": "Pick<AgentRailProps, \"tabsLabel\">",
            "required": false,
            "description": "The agent pane's words, over AgentRail's English defaults: the tab strip's name (\"Agent views\"). The pane's close is `closeAgentLabel`."
          },
          {
            "name": "questionCardLabels",
            "type": "Partial<QuestionCardLabels>",
            "required": false,
            "description": "The words of a question card a reply ends in, over QuestionCard's English defaults: the step count (\"1 of 3\"), the buttons (\"Back\", \"Next\", \"Send\", \"Skip\"), the records (\"Skipped\", \"Not answered\", \"(chosen)\"), the pick lines (\"Choose one\") and the \"Something else\" row."
          },
          {
            "name": "questionSummaryLabels",
            "type": "Pick<QuestionSummaryProps, \"missingLabel\">",
            "required": false,
            "description": "The words of a sent set of answers, over QuestionSummary's English default: what stands in for a question left without an answer (\"No answer\")."
          },
          {
            "name": "codeBlockLabels",
            "type": "(Pick<CodeBlockProps, \"copyLabel\" | \"copyText\" | \"copiedLabel\"> & { codeLabel?: ((language: string) => string); }) | undefined",
            "required": false,
            "description": "The words of a reply's fenced code, over CodeBlock's English defaults: the copy button (\"Copy code\", \"Copy\", \"Copied\"), and the code region's name, given the fence's language (\"Code: bash\", or \"Code\" with none)."
          },
          {
            "name": "promptSuggestionsLabels",
            "type": "Pick<PromptSuggestionsProps, \"chosenLabel\">",
            "required": false,
            "description": "The follow-up row's words, over PromptSuggestions' English default: the hidden text read after the sent suggestion (\"(chosen)\"). The row's name is `followupsLabel`."
          }
        ]
      },
      {
        "component": "ChatProvider",
        "props": [
          {
            "name": "transport",
            "type": "ChatTransport",
            "required": false,
            "description": "Where the conversation goes. Defaults to the fetch transport against\n`endpoint`, carrying the visitor's model pick. A script from\n`scriptChat()` runs the widget with no backend at all."
          },
          {
            "name": "endpoint",
            "type": "string",
            "required": false,
            "description": "The endpoint the default transport posts to.",
            "defaultValue": "/api/chat"
          },
          {
            "name": "defaultPlacement",
            "type": "ChatPlacement",
            "required": false,
            "description": "The seat the panel opens in.",
            "defaultValue": "right"
          },
          {
            "name": "followups",
            "type": "string | false | FollowupsSource",
            "required": false,
            "description": "Where follow-up questions come from after an answer commits: a source\nfunction, an endpoint for the built-in fetcher, or `false` for none:\nwith `false` no chips show under an answer at all, not even the written\n`fallbackFollowups`. Defaults to the fetcher against `/api/chat/followups`.",
            "defaultValue": "/api/chat/followups"
          },
          {
            "name": "fallbackFollowups",
            "type": "readonly string[]",
            "required": false,
            "description": "The written questions offered when the source returns none or fails. Unused when `followups` is `false`.",
            "defaultValue": "[\n  'Can you say more about that?',\n  'What should I do next?',\n  'Where can I read more?',\n  'Can you give an example?',\n  'What are the alternatives?',\n]"
          },
          {
            "name": "feedback",
            "type": "string | false | FeedbackSink",
            "required": false,
            "description": "Where a thumbs verdict goes: a sink function, an endpoint for the\nbuilt-in poster, or `false` to hide the thumbs. Defaults to the poster\nagainst `/api/chat/feedback`. Thumbs only ever show on a turn the\nserver logged (one with an exchange id).",
            "defaultValue": "/api/chat/feedback"
          },
          {
            "name": "renderers",
            "type": "ChatCardRenderers",
            "required": false,
            "description": "Draws `card` events by kind."
          },
          {
            "name": "artifactRenderers",
            "type": "ChatArtifactRenderers",
            "required": false,
            "description": "Draws an artifact's preview by kind, for artifacts that are live React content rather than a document or a URL."
          },
          {
            "name": "renderLink",
            "type": "ChatLinkRenderer",
            "required": false,
            "description": "Renders a same-site link in an answer. The default renders through the\nnearest LinkProvider's link component, else a plain anchor; passing\nthis wins over both.",
            "defaultValue": "(props) => <DefaultChatLink {...props} />"
          },
          {
            "name": "isInternalHref",
            "type": "((href: string) => boolean)",
            "required": false,
            "description": "Which hrefs in an answer become links. Everything else renders as text.",
            "defaultValue": "(href: string) => INTERNAL_PATH.test(href)"
          },
          {
            "name": "threads",
            "type": "ThreadsOptions",
            "required": false,
            "description": "Seeds the thread lifecycle behind the `threads` and `tabs` slots."
          },
          {
            "name": "placeholders",
            "type": "Partial<ChatPlaceholderCopy>",
            "required": false,
            "description": "Replacement copy for the words the hook writes itself, merged over the English defaults: the status line of a reply that has not started (\"Thinking\") and the placeholder replies for an empty, stopped or failed turn."
          }
        ]
      },
      {
        "component": "ChatLauncher",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "The floating button's text.",
            "defaultValue": "Ask"
          },
          {
            "name": "icon",
            "type": "string",
            "required": false,
            "description": "The button's icon.",
            "defaultValue": "forum"
          },
          {
            "name": "summary",
            "type": "(AiButtonSummary & { chips?: { id: string; label: string; prompt: string; }[]; })",
            "required": false,
            "description": "A TLDR panel the button summons on hover: a pre-written summary and\nprompt chips. A tapped chip opens the chat and sends the chip's\n`prompt`. The launcher hands it to the closed button's AiButton, which\nopens the panel on pointer hover; it does no device or hydration gating\nof its own, so a host that wants the panel on hover-capable devices only,\nor kept out of server HTML, passes `summary` only there."
          },
          {
            "name": "hidden",
            "type": "boolean",
            "required": false,
            "description": "Render nothing at all: for routes that carry no chrome.\nNote: not the native `hidden` attribute, which keeps an element mounted and only hides it; the launcher unmounts its button and panel, and spreads no native attributes.",
            "defaultValue": "false"
          },
          {
            "name": "panelId",
            "type": "string",
            "required": false,
            "description": "The panel's DOM id, for a host control's `aria-controls`.",
            "defaultValue": "ds-chat-panel"
          },
          {
            "name": "hostAttribute",
            "type": "string | false",
            "required": false,
            "description": "The attribute the launcher writes on `<html>` to say how the panel sits\n(`docked`, `docked-left`, `takeover`), so the host's stylesheet can pad\nthe page or hide it. `false` writes none.",
            "defaultValue": "data-chat"
          },
          {
            "name": "panelLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the panel.",
            "defaultValue": "Chat"
          },
          {
            "name": "aiButtonLabels",
            "type": "Pick<AiButtonProps, \"summaryRegionLabel\" | \"dismissLabel\" | \"suggestionsLabel\">",
            "required": false,
            "description": "The words of the floating button's summary panel, over AiButton's English defaults: the panel's name, given the summary's title (\"Summary: <title>\"), its dismiss button (\"Dismiss summary\") and its chips' group (\"Suggested prompts\")."
          },
          {
            "name": "widget",
            "type": "Omit<ChatWidgetProps, \"compact\" | \"fullscreenEnabled\" | \"placementEnabled\" | \"phone\">",
            "required": false,
            "description": "Everything the widget takes. The launcher sets the responsive ones itself."
          },
          {
            "name": "children",
            "type": "ReactNode",
            "required": false,
            "description": "Rendered inside the panel after the widget: for a host's extra chrome."
          }
        ]
      },
      {
        "component": "ChatThreads",
        "props": [
          {
            "name": "overlay",
            "type": "boolean",
            "required": true,
            "description": "The widget seated the rail as a sheet over the conversation rather than beside it."
          },
          {
            "name": "close",
            "type": "() => void",
            "required": true,
            "description": "Closes the sheet; a no-op on the inline rail."
          },
          {
            "name": "logo",
            "type": "ReactNode",
            "required": false,
            "description": "The brand row's mark, in both seats."
          },
          {
            "name": "logoText",
            "type": "string",
            "required": false,
            "description": "The brand row's text. Shown only on the sheet, where the chat header is hidden behind it; the inline rail leaves it out."
          },
          {
            "name": "profile",
            "type": "ThreadPanelProfile",
            "required": false,
            "description": "The signed-in person, shown on the inline rail."
          },
          {
            "name": "collapsible",
            "type": "boolean",
            "required": false,
            "description": "Whether the inline rail can collapse to its icon strip.",
            "defaultValue": "true"
          },
          {
            "name": "defaultExpanded",
            "type": "boolean",
            "required": false,
            "description": "Whether the inline rail starts expanded. Defaults to `false`: it starts\ncollapsed to its icon strip. The sheet, and a rail that is not\n`collapsible`, always show expanded.",
            "defaultValue": "false"
          },
          {
            "name": "historyLabel",
            "type": "string",
            "required": false,
            "description": "Accessible heading over the history.",
            "defaultValue": "Chat history"
          },
          {
            "name": "threadPanelLabels",
            "type": "Pick<ThreadPanelProps, \"statusLabels\" | \"collapseLabel\" | \"expandLabel\" | \"pinnedLabel\" | \"threadMenuLabel\" | \"renameLabel\" | \"projectsLabel\" | \"newProjectLabel\">",
            "required": false,
            "description": "The words the ThreadPanel writes, merged over its English defaults: the\nspoken pin and status text (\"Pinned\", \"Working\"…), each row's menu\ntrigger (\"Thread options\"), the rename field (\"Rename thread\"), the\nprojects header and its add button (\"Projects\", \"New project\"), and the\ncollapse toggle (\"Collapse the panel\", \"Expand the panel\"). The history's\nown name is `historyLabel`."
          },
          {
            "name": "actionLabels",
            "type": "Partial<Record<\"pin\" | \"unpin\" | \"rename\" | \"delete\", string>>",
            "required": false,
            "description": "The rows of each thread's menu, by action; a key left out keeps its English. Defaults to \"Pin\", \"Unpin\", \"Rename\" and \"Delete\"."
          }
        ]
      },
      {
        "component": "ChatTabs",
        "props": [
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for the tab strip.",
            "defaultValue": "Open chats"
          },
          {
            "name": "closeLabel",
            "type": "string | ((title: string) => string)",
            "required": false,
            "description": "Accessible name of each tab's close button. A string is followed by a colon and the tab's title; a function is given the title and returns the whole name. Defaults to \"Close chat\".",
            "defaultValue": "Close chat"
          },
          {
            "name": "statusLabels",
            "type": "Partial<Record<ThreadTabStatus, string>>",
            "required": false,
            "description": "Spoken text for each tab's status, merged over ThreadTabs' English defaults (Working, Unread, Needs input, Failed)."
          }
        ]
      },
      {
        "component": "ChatAgentPane",
        "props": [
          {
            "name": "profile",
            "type": "AgentRailProfile",
            "required": true,
            "description": "The agent this pane belongs to: the portrait block at the top."
          },
          {
            "name": "tabs",
            "type": "AgentRailTab[]",
            "required": true,
            "description": "The panes, in display order: activity, approvals, automations, personalisation, or whatever the agent has."
          },
          {
            "name": "value",
            "type": "string",
            "required": false,
            "description": "The tab on stage, when the host owns the state; otherwise the pane keeps its own, seeded from `defaultValue`."
          },
          {
            "name": "defaultValue",
            "type": "string",
            "required": false,
            "description": "The tab on stage first when the pane keeps its own state. Defaults to the first tab."
          },
          {
            "name": "onValueChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Fires with the chosen tab's id."
          },
          {
            "name": "activeTab",
            "type": "string",
            "required": false,
            "description": "Legacy name for `value`.",
            "deprecated": "Use `value` instead."
          },
          {
            "name": "onTabChange",
            "type": "((id: string) => void)",
            "required": false,
            "description": "Legacy change callback; fires alongside `onValueChange`.",
            "deprecated": "Use `onValueChange` instead."
          },
          {
            "name": "overlay",
            "type": "boolean",
            "required": true,
            "description": "The widget seated the pane as a bottom sheet, where it fills the width instead of holding its own column."
          },
          {
            "name": "onClose",
            "type": "(() => void)",
            "required": false,
            "description": "Fires from the pane's own close button, a cross in its top trailing corner. Omit for a pane with no close of its own."
          },
          {
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name of the pane's own close button. Defaults to \"Close the agent panel\".",
            "defaultValue": "Close the agent panel"
          },
          {
            "name": "agentRailLabels",
            "type": "Pick<AgentRailProps, \"tabsLabel\">",
            "required": false,
            "description": "The words the AgentRail writes, merged over its English defaults: the tab strip's name (\"Agent views\")."
          }
        ]
      },
      {
        "component": "ChatArtifactPane",
        "props": [
          {
            "name": "artifact",
            "type": "ChatArtifact | null",
            "required": true,
            "description": "The artifact on stage, or null for the empty state: the panel opened before the conversation has made anything."
          },
          {
            "name": "expanded",
            "type": "boolean",
            "required": false,
            "description": "Whether the widget is showing the pane at its expanded size."
          },
          {
            "name": "onExpandedChange",
            "type": "((expanded: boolean) => void)",
            "required": false,
            "description": "Fires with the next state from the expand toggle; omit where the seat has one size."
          },
          {
            "name": "onClose",
            "type": "(() => void)",
            "required": false,
            "description": "Fires from the pane's close button; omit where another control closes the seat."
          },
          {
            "name": "emptyPanelTitle",
            "type": "string",
            "required": false,
            "description": "The panel's title while nothing is on stage. Defaults to \"Artifacts\".",
            "defaultValue": "Artifacts"
          },
          {
            "name": "emptyTitle",
            "type": "string",
            "required": false,
            "description": "The empty state's heading. Defaults to \"Nothing here yet\".",
            "defaultValue": "Nothing here yet"
          },
          {
            "name": "emptyDescription",
            "type": "string",
            "required": false,
            "description": "The empty state's description. Defaults to \"What the chat makes for you, like a dashboard or a page, opens in this panel.\"",
            "defaultValue": "What the chat makes for you, like a dashboard or a page, opens in this panel."
          },
          {
            "name": "artifactPanelLabels",
            "type": "Pick<ArtifactPanelProps, \"collapseLabel\" | \"closeLabel\" | \"expandLabel\" | \"previewLabel\" | \"codeLabel\" | \"viewLabel\" | \"codeBlockLabels\">",
            "required": false,
            "description": "The words the ArtifactPanel writes, merged over its English defaults:\nthe view switch's segments and name (\"Preview\", \"Code\", \"Artifact\nview\"), the expand toggle and close button's names (\"Expand the\nartifact\", \"Collapse the artifact\", \"Close the artifact\"), and the code\nview's copy button and region (`codeBlockLabels`)."
          }
        ]
      },
      {
        "component": "ChatArtifactCard",
        "props": [
          {
            "name": "artifact",
            "type": "ChatArtifact",
            "required": true,
            "description": "The artifact this tile stands for."
          }
        ]
      }
    ]
  }
];
