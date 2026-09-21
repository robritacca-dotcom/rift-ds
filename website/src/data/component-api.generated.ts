// AUTO-GENERATED — do not edit by hand.
// Source of truth: src/components/registry.json and the prop JSDoc in
// src/components (via react-docgen-typescript — settings in
// scripts/component-docgen.mjs, shared with Storybook's props tables).
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
}

/** One public registry component: metadata, import paths, and every export behind it. */
export interface ComponentApiEntry {
  name: string;
  label: string;
  slug: string;
  category: string;
  description: string;
  /** Whether the module declares 'use client'. */
  client: boolean;
  /** Deep import subpath; the barrel named in `barrel` also re-exports it. */
  importPath: string;
  /** 'charts' modules need the optional recharts peer; 'main' modules never do. */
  barrel: 'main' | 'charts';
  exports: ComponentExportApi[];
}

/** The full prop API for every public component, in registry (alphabetical) order. */
export const componentApi: readonly ComponentApiEntry[] = [
  {
    "name": "Accordion",
    "label": "Accordion",
    "slug": "accordion",
    "category": "data-display",
    "description": "Collapsible content sections for organising related information.",
    "client": true,
    "importPath": "@robr0/design-system/components/Accordion/Accordion",
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
            "name": "defaultExpanded",
            "type": "string[]",
            "required": false,
            "description": "IDs of initially expanded items",
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
    "name": "AgentPlan",
    "label": "Agent plan",
    "slug": "agent-plan",
    "category": "ai",
    "description": "A collapsible checklist of an agent's task, with live step states and a progress readout.",
    "client": true,
    "importPath": "@robr0/design-system/components/AgentPlan/AgentPlan",
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
            "description": "Header text. Left unset, it is computed from the steps —\n\"3 steps left\", or \"All steps complete\" once everything is done."
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
    "name": "AgentStatus",
    "label": "Agent status",
    "slug": "agent-status",
    "category": "ai",
    "description": "A dot-matrix indicator and status line reporting what an agent is doing right now.",
    "client": true,
    "importPath": "@robr0/design-system/components/AgentStatus/AgentStatus",
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
            "type": "\"braille\" | \"orbit\" | \"breathe\" | \"snake\" | \"fill-sweep\" | \"pulse\" | \"columns\" | \"checkerboard\" | \"scan\" | \"rain\" | \"cascade\" | \"sparkle\" | \"wave-rows\" | \"helix\" | \"diagonal-swipe\"",
            "required": false,
            "description": "Which dot-matrix choreography to run.",
            "defaultValue": "orbit"
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
            "type": "\"inline\" | \"bar\"",
            "required": false,
            "description": "`inline` sits in a line of content; `bar` is a full-width row for the top of a panel.",
            "defaultValue": "inline"
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
      }
    ]
  },
  {
    "name": "AiButton",
    "label": "AI button",
    "slug": "ai-button",
    "category": "ai",
    "description": "The AI entry point: icon and label ringed by a turning gradient and glow, with an optional hover-summoned AI-summary panel and prompt chips.",
    "client": true,
    "importPath": "@robr0/design-system/components/AiButton/AiButton",
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
    "name": "Alert",
    "label": "Alert",
    "slug": "alert",
    "category": "feedback",
    "description": "Contextual feedback with status variants, optional dismiss, and compact sizing.",
    "client": false,
    "importPath": "@robr0/design-system/components/Alert/Alert",
    "barrel": "main",
    "exports": [
      {
        "component": "Alert",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Alert title text"
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
    "name": "AlertDialog",
    "label": "Alert dialog",
    "slug": "alert-dialog",
    "category": "overlays",
    "description": "Modal confirmation overlay with title, description, and confirm / cancel actions.",
    "client": true,
    "importPath": "@robr0/design-system/components/AlertDialog/AlertDialog",
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
            "description": "Dialog title"
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
            "name": "variant",
            "type": "\"default\" | \"destructive\"",
            "required": false,
            "description": "Destructive variant for dangerous actions",
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
    "name": "AnchorNav",
    "label": "Anchor nav",
    "slug": "anchor-nav",
    "category": "navigation",
    "description": "An on-page list of anchor links that tracks the reader's position and jumps between sections.",
    "client": true,
    "importPath": "@robr0/design-system/components/AnchorNav/AnchorNav",
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
            "description": "Header text above the list; pass an empty string to render no header",
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
    "name": "AnimatedNumber",
    "label": "Animated number",
    "slug": "animated-number",
    "category": "data-display",
    "description": "A number that counts to its value: count-up on mount, eased tweens on change, tabular digits that never jitter.",
    "client": true,
    "importPath": "@robr0/design-system/components/AnimatedNumber/AnimatedNumber",
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
    "name": "AppLayout",
    "label": "App layout",
    "slug": "app-layout",
    "category": "layout",
    "description": "Full-page template pairing the collapsible App sidebar with a centred content area.",
    "client": true,
    "importPath": "@robr0/design-system/components/AppLayout/AppLayout",
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
    "name": "AppSidebar",
    "label": "App sidebar",
    "slug": "app-sidebar",
    "category": "layout",
    "description": "Collapsible navigation rail with accordion sub-items, category headings, and profile section.",
    "client": true,
    "importPath": "@robr0/design-system/components/AppSidebar/AppSidebar",
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
            "defaultValue": "Dragonspine"
          },
          {
            "name": "showMobileTrigger",
            "type": "boolean",
            "required": false,
            "description": "Below the mobile breakpoint the rail hides and this fixed hamburger\nbutton opens it as an overlay drawer instead. Set false when the\nhost renders its own trigger in the page chrome.",
            "defaultValue": "true"
          }
        ]
      }
    ]
  },
  {
    "name": "AreaChart",
    "label": "Area chart",
    "slug": "area-chart",
    "category": "charts",
    "description": "Filled area chart for showing volume over time, with stacked and single-series variants.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/AreaChart",
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
            "description": "Chart title"
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
    "name": "Avatar",
    "label": "Avatar",
    "slug": "avatar",
    "category": "data-display",
    "description": "User profile image with initials and icon fallback, status indicator, and multiple sizes.",
    "client": true,
    "importPath": "@robr0/design-system/components/Avatar/Avatar",
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
            "description": "Alt text for the image"
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
            "name": "status",
            "type": "\"online\" | \"away\" | \"offline\" | \"busy\"",
            "required": false,
            "description": "Online status indicator"
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
    "name": "AvatarGroup",
    "label": "Avatar group",
    "slug": "avatar-group",
    "category": "data-display",
    "description": "Overlapping avatar stack with a +N counter for the overflow.",
    "client": false,
    "importPath": "@robr0/design-system/components/AvatarGroup/AvatarGroup",
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
            "type": "string",
            "required": false,
            "description": "Accessible label for the overflow counter. Defaults to \"N more\" —\noverride it to localise or add context, e.g. \"4 more reviewers\"."
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
    "name": "Badge",
    "label": "Badge",
    "slug": "badge",
    "category": "data-display",
    "description": "Small inline status labels with info, positive, warning, error, and neutral variants.",
    "client": false,
    "importPath": "@robr0/design-system/components/Badge/Badge",
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
    "name": "Banner",
    "label": "Banner",
    "slug": "banner",
    "category": "feedback",
    "description": "Full-width status strip for page-level announcements, with an action slot and optional dismissal.",
    "client": false,
    "importPath": "@robr0/design-system/components/Banner/Banner",
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
    "name": "BarChart",
    "label": "Bar chart",
    "slug": "bar-chart",
    "category": "charts",
    "description": "Vertical bars for comparing values across categories or time, with summary stats and tooltips.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/BarChart",
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
            "description": "Chart title"
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
    "name": "Breadcrumb",
    "label": "Breadcrumb",
    "slug": "breadcrumb",
    "category": "navigation",
    "description": "Hierarchical navigation trail showing the user's location within the site.",
    "client": false,
    "importPath": "@robr0/design-system/components/Breadcrumb/Breadcrumb",
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
            "description": "Accessible name for the nav landmark. Override when more than one\nBreadcrumb can appear on a page — identically-named landmarks are\nindistinguishable to assistive technology."
          }
        ]
      }
    ]
  },
  {
    "name": "Button",
    "label": "Button",
    "slug": "button",
    "category": "actions",
    "description": "Primary, secondary, tertiary, neutral and destructive variants in default and compact sizes, with icon support and multiple states.",
    "client": true,
    "importPath": "@robr0/design-system/components/Button/Button",
    "barrel": "main",
    "exports": [
      {
        "component": "Button",
        "props": [
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Button text content",
            "defaultValue": "Button"
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
            "description": "Visual treatment"
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
            "type": "\"default\" | \"disabled\" | \"hover\" | \"active\"",
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
    "name": "ButtonGroup",
    "label": "Button group",
    "slug": "button-group",
    "category": "actions",
    "description": "Horizontal and vertical button group layouts for related actions and navigation patterns.",
    "client": false,
    "importPath": "@robr0/design-system/components/ButtonGroup/ButtonGroup",
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
            "description": "Accessible label for the group"
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
    "name": "Card",
    "label": "Card",
    "slug": "card",
    "category": "data-display",
    "description": "Card components for previews, navigation, and token documentation, from content cards to colour swatches and typography specimens.",
    "client": true,
    "importPath": "@robr0/design-system/components/Card/Card",
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
          }
        ]
      }
    ]
  },
  {
    "name": "CardStack",
    "label": "Card stack",
    "slug": "card-stack",
    "category": "data-display",
    "description": "A deck of cards showing one at a time, flipped through with a lift-and-settle animation.",
    "client": true,
    "importPath": "@robr0/design-system/components/CardStack/CardStack",
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
    "name": "Carousel",
    "label": "Carousel",
    "slug": "carousel",
    "category": "data-display",
    "description": "Sliding content viewer with navigation arrows, dot indicators, auto-play, and keyboard support.",
    "client": true,
    "importPath": "@robr0/design-system/components/Carousel/Carousel",
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
            "name": "onSlideChange",
            "type": "((index: number) => void)",
            "required": false,
            "description": "Callback when active slide changes"
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
    "name": "ChatHeader",
    "label": "Chat header",
    "slug": "chat-header",
    "category": "ai",
    "description": "The top row of a chat surface, with the conversation title and its controls.",
    "client": false,
    "importPath": "@robr0/design-system/components/ChatHeader/ChatHeader",
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
    "name": "ChatMarker",
    "label": "Chat marker",
    "slug": "chat-marker",
    "category": "ai",
    "description": "An inline conversation separator for date breaks and system notes.",
    "client": false,
    "importPath": "@robr0/design-system/components/ChatMarker/ChatMarker",
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
    "name": "ChatMessage",
    "label": "Chat message",
    "slug": "chat-message",
    "category": "ai",
    "description": "A single chat turn with avatar, author, timestamp, and bubble or plain content aligned by role.",
    "client": false,
    "importPath": "@robr0/design-system/components/ChatMessage/ChatMessage",
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
    "name": "ChatThread",
    "label": "Chat thread",
    "slug": "chat-thread",
    "category": "ai",
    "description": "A scrollable conversation column with edge fades, send anchoring, and a subtle scrollbar.",
    "client": true,
    "importPath": "@robr0/design-system/components/ChatThread/ChatThread",
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
    "name": "Checkbox",
    "label": "Checkbox",
    "slug": "checkbox",
    "category": "forms",
    "description": "Custom checkbox with check and indeterminate states, keyboard accessible with animated transitions.",
    "client": true,
    "importPath": "@robr0/design-system/components/Checkbox/Checkbox",
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
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the checkbox is checked",
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
            "name": "items",
            "type": "{ label: string; value: string; disabled?: boolean | undefined; }[]",
            "required": true,
            "description": "Checkbox options"
          },
          {
            "name": "values",
            "type": "string[]",
            "required": false,
            "description": "Currently selected values",
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
      }
    ]
  },
  {
    "name": "Chip",
    "label": "Chip",
    "slug": "chip",
    "category": "data-display",
    "description": "Compact pills for attributes, filters, and inline metadata.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chip/Chip",
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
            "description": "Selected state (filter-style chips) — renders the teal active fill"
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
            "type": "(() => void)",
            "required": false,
            "description": "Click handler — presence makes the chip an interactive <button>"
          },
          {
            "name": "onRemove",
            "type": "(() => void)",
            "required": false,
            "description": "Remove handler — renders a trailing close button (input-style chips)"
          },
          {
            "name": "removeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the remove button",
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
    "name": "CircularButton",
    "label": "Circular button",
    "slug": "circular-button",
    "category": "actions",
    "description": "Round icon button with primary, secondary, tertiary and neutral variants, default and compact sizes.",
    "client": false,
    "importPath": "@robr0/design-system/components/CircularButton/CircularButton",
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
            "description": "Visual treatment"
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
            "type": "\"default\" | \"disabled\" | \"hover\" | \"active\"",
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
          }
        ]
      }
    ]
  },
  {
    "name": "CodeBlock",
    "label": "Code block",
    "slug": "code-block",
    "category": "data-display",
    "description": "Monospace code with a header and one-click copy.",
    "client": true,
    "importPath": "@robr0/design-system/components/CodeBlock/CodeBlock",
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
    "name": "CodeDiff",
    "label": "Code diff",
    "slug": "code-diff",
    "category": "ai",
    "description": "Unified diff view for code changes, with added, removed, and context lines.",
    "client": false,
    "importPath": "@robr0/design-system/components/CodeDiff/CodeDiff",
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
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      },
      {
        "component": "parseUnifiedDiff",
        "props": []
      }
    ]
  },
  {
    "name": "ColorPicker",
    "label": "Colour picker",
    "slug": "color-picker",
    "category": "forms",
    "description": "Swatch trigger opening a saturation area, hue and alpha sliders, and a hex field; controlled or uncontrolled.",
    "client": true,
    "importPath": "@robr0/design-system/components/ColorPicker/ColorPicker",
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
    "name": "ComboChart",
    "label": "Combo chart",
    "slug": "combo-chart",
    "category": "charts",
    "description": "Bar and line series in one chart, with an optional second y-axis for pairs in different units, like spend and ROAS.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/ComboChart",
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
            "description": "Chart title"
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
    "name": "Combobox",
    "label": "Combobox",
    "slug": "combobox",
    "category": "forms",
    "description": "A filterable select that narrows options as the user types, with multi-select chips, grouping, and async loading.",
    "client": true,
    "importPath": "@robr0/design-system/components/Combobox/Combobox",
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
            "description": "Selected value — a `string` in single mode, `string[]` when `multiple`\nis set. Leave undefined for an empty selection."
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
            "name": "clearable",
            "type": "boolean",
            "required": false,
            "description": "Show a clear button once something is selected",
            "defaultValue": "false"
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
            "description": "Used only as a fallback for deriving the element id (`id || name || generated`).\n\nNote: Combobox renders a `<div>` wrapper around a text input, not a native\n`<select>`, so `name` does **not** make the selection participate in native\nform submission."
          }
        ]
      }
    ]
  },
  {
    "name": "CommandPalette",
    "label": "Command palette",
    "slug": "command-palette",
    "category": "overlays",
    "description": "A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.",
    "client": true,
    "importPath": "@robr0/design-system/components/CommandPalette/CommandPalette",
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
            "description": "Called with the chosen command, after its own `onSelect`"
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
    "name": "Composer",
    "label": "Composer",
    "slug": "composer",
    "category": "ai",
    "description": "An auto-growing message input with send and stop states, a page-context note, an attachment slot, and Enter-to-send.",
    "client": true,
    "importPath": "@robr0/design-system/components/Composer/Composer",
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
            "description": "Fires with the current value on Enter (without Shift) and on the send\nbutton — never while `streaming`, and never when the trimmed value is\nempty. Composer does not clear the value: the consumer owns it and clears\nit after a successful submit. Shadows the native `onSubmit` attribute,\nwhich never fires on a textarea anyway."
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
            "description": "Contextual note rendered as a full-width, non-interactive chip at the\nvery top of the shell, above any attachments — the \"what the model is\nlooking at\" line a chat host pins over the message (\"Looking at\n“Page name”\"). One line: a note too long for the shell truncates with\nan ellipsis. Composer owns the chip's chrome; the caller passes the\ntext."
          },
          {
            "name": "contextIcon",
            "type": "ReactNode",
            "required": false,
            "description": "Icon at the left of the context chip — Material Symbol name (string,\ne.g. `visibility`, `article`) or custom element (ReactNode). Decorative\nand hidden from assistive technology — the chip's text carries the\nmeaning. None by default, matching the ai set's icon-free-unless-asked\nconvention."
          },
          {
            "name": "attachments",
            "type": "ReactNode",
            "required": false,
            "description": "Attachment row rendered above the textarea (DocumentChips). Fully\ncontrolled by the caller — Composer never owns the list."
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "required": false,
            "description": "Leading actions on the left of the action bar (attach button, model picker)."
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
    "name": "ContactCard",
    "label": "Contact card",
    "slug": "contact-card",
    "category": "data-display",
    "description": "Linked contact method with icon, label, and value.",
    "client": true,
    "importPath": "@robr0/design-system/components/ContactCard/ContactCard",
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
            "description": "Renders a copy-to-clipboard button; fires onCopy(value) when clicked",
            "defaultValue": "false"
          },
          {
            "name": "onCopy",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Called with the card's value when the copy button is clicked"
          },
          {
            "name": "copyOnClick",
            "type": "boolean",
            "required": false,
            "description": "Renders the whole card as a button that copies `value` on click — no navigation",
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
    "name": "ContextMenu",
    "label": "Context menu",
    "slug": "context-menu",
    "category": "overlays",
    "description": "Right-click menu at the pointer with groups, sub-menus, and shortcut hints.",
    "client": true,
    "importPath": "@robr0/design-system/components/ContextMenu/ContextMenu",
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
    "name": "ContributionGraph",
    "label": "Contribution graph",
    "slug": "contribution-graph",
    "category": "charts",
    "description": "A year of activity, one cell per day.",
    "client": false,
    "importPath": "@robr0/design-system/components/ContributionGraph/ContributionGraph",
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
            "description": "Chart title, in the shared chart header."
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
    "name": "DataTable",
    "label": "Data table",
    "slug": "data-table",
    "category": "data-display",
    "description": "The wired table: sorting, search, row selection, and pagination assembled around Table.",
    "client": true,
    "importPath": "@robr0/design-system/components/DataTable/DataTable",
    "barrel": "main",
    "exports": [
      {
        "component": "DataTable",
        "props": [
          {
            "name": "columns",
            "type": "DataTableColumn[]",
            "required": true,
            "description": "Column definitions."
          },
          {
            "name": "rows",
            "type": "DataTableRow[]",
            "required": true,
            "description": "Row data, as raw values the table can sort and search."
          },
          {
            "name": "pageSize",
            "type": "number",
            "required": false,
            "description": "Rows per page. Setting this turns on the built-in pagination."
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
            "description": "Visual size, passed through to the underlying Table.",
            "defaultValue": "default"
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
    "name": "DateInput",
    "label": "Date input",
    "slug": "date-input",
    "category": "forms",
    "description": "Date input with native picker, calendar icon, label, and validation states.",
    "client": true,
    "importPath": "@robr0/design-system/components/DateInput/DateInput",
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
    "name": "DatePicker",
    "label": "Date picker",
    "slug": "date-picker",
    "category": "forms",
    "description": "Inline calendar with month navigation, day selection, and today indicator.",
    "client": true,
    "importPath": "@robr0/design-system/components/DatePicker/DatePicker",
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
    "name": "Dialog",
    "label": "Dialog",
    "slug": "dialog",
    "category": "overlays",
    "description": "A general-purpose modal for focused tasks, with sizes, an optional footer, and full focus management.",
    "client": true,
    "importPath": "@robr0/design-system/components/Dialog/Dialog",
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
    "name": "Divider",
    "label": "Divider",
    "slug": "divider",
    "category": "layout",
    "description": "A thin rule separating stacked content, with optional inline label and vertical orientation.",
    "client": false,
    "importPath": "@robr0/design-system/components/Divider/Divider",
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
    "name": "DocumentChip",
    "label": "Document chip",
    "slug": "document-chip",
    "category": "ai",
    "description": "A compact file reference with a type icon, name, metadata, and optional remove.",
    "client": false,
    "importPath": "@robr0/design-system/components/DocumentChip/DocumentChip",
    "barrel": "main",
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
            "type": "(() => void)",
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
    "name": "Drawer",
    "label": "Drawer",
    "slug": "drawer",
    "category": "overlays",
    "description": "An edge-anchored modal panel that slides in from any side, for filter panels, detail views, and mobile navigation.",
    "client": true,
    "importPath": "@robr0/design-system/components/Drawer/Drawer",
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
    "name": "Dropdown",
    "label": "Dropdown",
    "slug": "dropdown",
    "category": "forms",
    "description": "Custom select dropdown with keyboard navigation, disabled options, and error states.",
    "client": true,
    "importPath": "@robr0/design-system/components/Dropdown/Dropdown",
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
            "description": "Currently selected value"
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
      }
    ]
  },
  {
    "name": "DropdownMenu",
    "label": "Dropdown menu",
    "slug": "dropdown-menu",
    "category": "overlays",
    "description": "Contextual menu with sections, sub-menus, keyboard shortcuts, and inset-gap hover styling.",
    "client": true,
    "importPath": "@robr0/design-system/components/DropdownMenu/DropdownMenu",
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
    "name": "EmptyState",
    "label": "Empty state",
    "slug": "empty-state",
    "category": "feedback",
    "description": "The placeholder for a list, table, or search with nothing to show: icon, headline, guidance, and a next action.",
    "client": false,
    "importPath": "@robr0/design-system/components/EmptyState/EmptyState",
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
            "description": "Short headline describing the empty condition"
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
    "name": "EntityCard",
    "label": "Entity card",
    "slug": "entity-card",
    "category": "data-display",
    "description": "Compact display-only card with a centred icon or image and a label, used in the Icons and Logos galleries.",
    "client": false,
    "importPath": "@robr0/design-system/components/EntityCard/EntityCard",
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
    "name": "EventCalendar",
    "label": "Event calendar",
    "slug": "event-calendar",
    "category": "data-display",
    "description": "A month grid with event pills, overflow counts, and month navigation.",
    "client": true,
    "importPath": "@robr0/design-system/components/EventCalendar/EventCalendar",
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
    "name": "Field",
    "label": "Field",
    "slug": "field",
    "category": "forms",
    "description": "The shared scaffolding for labelled form controls: label, required marker, helper and error text, and the ARIA wiring that ties them together.",
    "client": true,
    "importPath": "@robr0/design-system/components/Field/Field",
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
    "name": "Figure",
    "label": "Figure",
    "slug": "figure",
    "category": "data-display",
    "description": "Images with captions, in the case-study frame.",
    "client": false,
    "importPath": "@robr0/design-system/components/Figure/Figure",
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
            "type": "(() => void)",
            "required": false,
            "description": "Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support"
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
    "name": "FileInput",
    "label": "File input",
    "slug": "file-input",
    "category": "forms",
    "description": "A click-or-drop upload zone paired with a controlled file list showing size, progress, and per-file errors.",
    "client": true,
    "importPath": "@robr0/design-system/components/FileInput/FileInput",
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
    "name": "FilterBar",
    "label": "Filter bar",
    "slug": "filter-bar",
    "category": "forms",
    "description": "A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.",
    "client": true,
    "importPath": "@robr0/design-system/components/FilterBar/FilterBar",
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
    "name": "FunnelChart",
    "label": "Funnel chart",
    "slug": "funnel-chart",
    "category": "charts",
    "description": "Ordered funnel stages as centred trapezoid bands, each sized by its share of the first stage.",
    "client": false,
    "importPath": "@robr0/design-system/components/FunnelChart/FunnelChart",
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
            "description": "Chart title, in the shared chart header."
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
    "name": "GanttChart",
    "label": "Gantt chart",
    "slug": "gantt-chart",
    "category": "charts",
    "description": "Phases and tasks as bars on a shared timeline, with milestones, progress, and a today rule.",
    "client": false,
    "importPath": "@robr0/design-system/components/GanttChart/GanttChart",
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
            "description": "Explicit timeline window (YYYY-MM-DD both ends). Without it the range fits the data, snapped outward to whole months."
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
            "description": "Chart title, in the shared chart header."
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
    "name": "Gauge",
    "label": "Gauge",
    "slug": "gauge",
    "category": "charts",
    "description": "A radial dial for a single bounded reading, recoloured through the status roles as it crosses thresholds.",
    "client": false,
    "importPath": "@robr0/design-system/components/Gauge/Gauge",
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
            "description": "Chart title, in the shared chart header."
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
    "name": "Globe",
    "label": "Globe",
    "slug": "globe",
    "category": "maps",
    "description": "An orthographic globe with markers and great-circle arcs, rotated by drag, keys, or a slow spin.",
    "client": true,
    "importPath": "@robr0/design-system/components/Globe/Globe",
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
            "description": "Spin slowly on its own, in degrees per second. Pauses while the pointer\nis over the globe or it has focus, and never runs under\n`prefers-reduced-motion`. `0` switches it off.",
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
            "description": "Fires as the pointer enters a marker, and with `null` as it leaves."
          },
          {
            "name": "onPointClick",
            "type": "((point: GlobePoint) => void)",
            "required": false,
            "description": "Fires when a marker is clicked."
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
    "name": "HoverCard",
    "label": "Hover card",
    "slug": "hover-card",
    "category": "overlays",
    "description": "Rich preview panel that opens from hover or focus, with interactive content and position options.",
    "client": true,
    "importPath": "@robr0/design-system/components/HoverCard/HoverCard",
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
            "description": "Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse."
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
    "name": "ImageCompare",
    "label": "Image compare",
    "slug": "image-compare",
    "category": "data-display",
    "description": "Before-and-after image comparison with a draggable divider, keyboard control, and corner labels.",
    "client": true,
    "importPath": "@robr0/design-system/components/ImageCompare/ImageCompare",
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
    "name": "Input",
    "label": "Input",
    "slug": "input",
    "category": "forms",
    "description": "Text input with label, placeholder, left and right icons, helper text, and error states.",
    "client": true,
    "importPath": "@robr0/design-system/components/Input/Input",
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
    "name": "Instructions",
    "label": "Instructions",
    "slug": "instructions",
    "category": "data-display",
    "description": "Step-by-step guidance with numbered badges, connecting lines, and horizontal layout.",
    "client": false,
    "importPath": "@robr0/design-system/components/Instructions/Instructions",
    "barrel": "main",
    "exports": [
      {
        "component": "Instructions",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Instructions title"
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
            "description": "Whether to show step numbers instead of icons",
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
    "name": "InterruptCard",
    "label": "Interrupt card",
    "slug": "interrupt-card",
    "category": "ai",
    "description": "A human-in-the-loop checkpoint with a question from the agent and option buttons to decide.",
    "client": false,
    "importPath": "@robr0/design-system/components/InterruptCard/InterruptCard",
    "barrel": "main",
    "exports": [
      {
        "component": "InterruptCard",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The question, e.g. \"Allow file edit?\"."
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
          }
        ]
      }
    ]
  },
  {
    "name": "Kbd",
    "label": "Kbd",
    "slug": "kbd",
    "category": "data-display",
    "description": "A keyboard key rendered as a keycap, for shortcut hints in menus and prose.",
    "client": false,
    "importPath": "@robr0/design-system/components/Kbd/Kbd",
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
    "name": "LegendTile",
    "label": "Legend tile",
    "slug": "legend-tile",
    "category": "charts",
    "description": "The labelled value tile under a chart: a series dot, the series name, and its reading, on an inset fill.",
    "client": false,
    "importPath": "@robr0/design-system/components/LegendTile/LegendTile",
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
    "name": "Lightbox",
    "label": "Lightbox",
    "slug": "lightbox",
    "category": "overlays",
    "description": "Fullscreen media viewer on the shared overlay stack: deep scrim, caption chip, gallery stepping, trapped and restored focus.",
    "client": true,
    "importPath": "@robr0/design-system/components/Lightbox/Lightbox",
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
    "name": "LineChart",
    "label": "Line chart",
    "slug": "line-chart",
    "category": "charts",
    "description": "Multi-series line chart for trends over time, with per-series colours and a summary row.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/LineChart",
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
            "description": "Chart title"
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
    "name": "LinkList",
    "label": "Link list",
    "slug": "link-list",
    "category": "data-display",
    "description": "Linked items with logo, label, and subtitle.",
    "client": false,
    "importPath": "@robr0/design-system/components/LinkList/LinkList",
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
          }
        ]
      }
    ]
  },
  {
    "name": "MapCallout",
    "label": "Map callout",
    "slug": "map-callout",
    "category": "maps",
    "description": "The annotation beside a map point: a name in capitals over monospace readout lines.",
    "client": false,
    "importPath": "@robr0/design-system/components/MapCallout/MapCallout",
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
    "name": "MapLegend",
    "label": "Map legend",
    "slug": "map-legend",
    "category": "maps",
    "description": "The corner block of a map: its name, what it shows, and the key to its markers.",
    "client": false,
    "importPath": "@robr0/design-system/components/MapLegend/MapLegend",
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
    "name": "MessageActions",
    "label": "Message actions",
    "slug": "message-actions",
    "category": "ai",
    "description": "An icon-button row for message-level actions like copy, retry, and feedback.",
    "client": false,
    "importPath": "@robr0/design-system/components/MessageActions/MessageActions",
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
    "name": "MessageCard",
    "label": "Message card",
    "slug": "message-card",
    "category": "ai",
    "description": "A structured rich-content card embedded in a chat message, with media, title, body, and actions.",
    "client": false,
    "importPath": "@robr0/design-system/components/MessageCard/MessageCard",
    "barrel": "main",
    "exports": [
      {
        "component": "MessageCard",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Card heading."
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
            "description": "Body content between the description and the footer — rich content, a Prose block, a DocumentChip row."
          }
        ]
      }
    ]
  },
  {
    "name": "Meter",
    "label": "Meter",
    "slug": "meter",
    "category": "feedback",
    "description": "Level indicator for a known quantity, with a status-coloured fill and an optional value readout.",
    "client": false,
    "importPath": "@robr0/design-system/components/Meter/Meter",
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
            "description": "Visible label naming what is measured, doubling as the accessible name"
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
    "name": "ModelPicker",
    "label": "Model picker",
    "slug": "model-picker",
    "category": "ai",
    "description": "A model selector for chat surfaces, with per-model descriptions and an optional effort row.",
    "client": true,
    "importPath": "@robr0/design-system/components/ModelPicker/ModelPicker",
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
            "name": "placement",
            "type": "\"top\" | \"bottom\"",
            "required": false,
            "description": "Which side of the trigger the panel opens on. In a composer pinned to the bottom of the screen, use `top`.",
            "defaultValue": "bottom"
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
    "name": "Nav",
    "label": "Nav",
    "slug": "nav",
    "category": "navigation",
    "description": "Desktop top navigation bar with a brand slot, horizontal button group, and optional trailing content.",
    "client": false,
    "importPath": "@robr0/design-system/components/Nav/Nav",
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
    "name": "NavList",
    "label": "Nav list",
    "slug": "nav-list",
    "category": "navigation",
    "description": "Vertical list of navigation links for drawers and menus, with three indent levels and per-row expand toggles.",
    "client": true,
    "importPath": "@robr0/design-system/components/NavList/NavList",
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
    "name": "NotificationCenter",
    "label": "Notification centre",
    "slug": "notification-center",
    "category": "feedback",
    "description": "A persistent notification inbox with unread count, filter tabs, and per-item actions.",
    "client": true,
    "importPath": "@robr0/design-system/components/NotificationCenter/NotificationCenter",
    "barrel": "main",
    "exports": [
      {
        "component": "NotificationCenter",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Heading shown in the header.",
            "defaultValue": "Notifications"
          },
          {
            "name": "unreadCount",
            "type": "number",
            "required": false,
            "description": "How many notifications are unread, shown under the heading. Omit to hide the line."
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
            "name": "activeTab",
            "type": "string",
            "required": false,
            "description": "Active tab value for controlled use. Pair with `onTabChange`."
          },
          {
            "name": "defaultTab",
            "type": "string",
            "required": false,
            "description": "Initially active tab value for uncontrolled use. Defaults to the first tab."
          },
          {
            "name": "onTabChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Fires with the newly selected tab's value."
          },
          {
            "name": "emptyState",
            "type": "ReactNode",
            "required": false,
            "description": "What to render when there are no children — defaults to a built-in empty state."
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
            "required": false,
            "description": "One-line headline, e.g. who did what.",
            "defaultValue": "Notifications"
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
    "name": "NumberInput",
    "label": "Number input",
    "slug": "number-input",
    "category": "forms",
    "description": "Numeric field with increment and decrement steppers and min/max clamping.",
    "client": true,
    "importPath": "@robr0/design-system/components/NumberInput/NumberInput",
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
    "name": "Pagination",
    "label": "Pagination",
    "slug": "pagination",
    "category": "navigation",
    "description": "Numbered page navigation for long datasets, with ellipses, disabled end arrows, and a compact readout mode.",
    "client": true,
    "importPath": "@robr0/design-system/components/Pagination/Pagination",
    "barrel": "main",
    "exports": [
      {
        "component": "Pagination",
        "props": [
          {
            "name": "page",
            "type": "number",
            "required": true,
            "description": "Current page (1-based)"
          },
          {
            "name": "pageCount",
            "type": "number",
            "required": true,
            "description": "Total number of pages"
          },
          {
            "name": "onPageChange",
            "type": "(page: number) => void",
            "required": true,
            "description": "Callback with the requested page"
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
            "description": "Accessible label for the nav landmark",
            "defaultValue": "Pagination"
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
    "name": "Panel",
    "label": "Panel",
    "slug": "panel",
    "category": "layout",
    "description": "The plain dashboard surface: a rounded container with no border or shadow, just padding and a gap.",
    "client": false,
    "importPath": "@robr0/design-system/components/Panel/Panel",
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
    "name": "PieChart",
    "label": "Pie chart",
    "slug": "pie-chart",
    "category": "charts",
    "description": "Proportional share of a whole as a pie or donut, with per-slice colours.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/PieChart",
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
            "description": "Chart title"
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
    "name": "PinInput",
    "label": "Pin input",
    "slug": "pin-input",
    "category": "forms",
    "description": "Segmented one-time-code input with auto-advance, paste support, and completion callback.",
    "client": true,
    "importPath": "@robr0/design-system/components/PinInput/PinInput",
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
    "name": "Popover",
    "label": "Popover",
    "slug": "popover",
    "category": "overlays",
    "description": "Contextual overlay panel with click and hover triggers, positioned relative to its anchor.",
    "client": true,
    "importPath": "@robr0/design-system/components/Popover/Popover",
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
            "description": "Popover content"
          },
          {
            "name": "size",
            "type": "\"default\" | \"compact\"",
            "required": false,
            "description": "Component size",
            "defaultValue": "default"
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
            "name": "onOpenChange",
            "type": "((open: boolean) => void)",
            "required": false,
            "description": "Callback when open state changes"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the trigger"
          },
          {
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes for the popover panel",
            "defaultValue": ""
          }
        ]
      }
    ]
  },
  {
    "name": "ProgressBar",
    "label": "Progress bar",
    "slug": "progress-bar",
    "category": "feedback",
    "description": "Horizontal bar indicating completion progress, with an optional percentage label.",
    "client": false,
    "importPath": "@robr0/design-system/components/ProgressBar/ProgressBar",
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
            "description": "Accessible label describing what is loading"
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
    "name": "PromptSuggestions",
    "label": "Prompt suggestions",
    "slug": "prompt-suggestions",
    "category": "ai",
    "description": "A horizontal row of tappable prompt suggestions to start or steer a conversation.",
    "client": true,
    "importPath": "@robr0/design-system/components/PromptSuggestions/PromptSuggestions",
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
            "type": "\"wrap\" | \"scroll\" | \"stack\"",
            "required": false,
            "description": "How the suggestions are arranged. `scroll` is one line that scrolls\nsideways behind edge fades. `wrap` runs them across as many lines as\nthey need, for empty-state hero placements. `stack` gives each one its\nown line, for narrow columns where a wrapped row breaks unevenly and\nthe ragged right edge reads as an accident."
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
    "name": "Prose",
    "label": "Prose",
    "slug": "prose",
    "category": "ai",
    "description": "Token-styled typography for rendered markdown and rich agent output.",
    "client": false,
    "importPath": "@robr0/design-system/components/Prose/Prose",
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
    "name": "Quote",
    "label": "Quote",
    "slug": "quote",
    "category": "data-display",
    "description": "Blockquotes and pull-quotes with attribution.",
    "client": false,
    "importPath": "@robr0/design-system/components/Quote/Quote",
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
    "name": "RadarChart",
    "label": "Radar chart",
    "slug": "radar-chart",
    "category": "charts",
    "description": "Multi-axis comparison of series across categories on a radial grid.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/RadarChart",
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
            "description": "Chart title"
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
    "name": "RadialChart",
    "label": "Radial chart",
    "slug": "radial-chart",
    "category": "charts",
    "description": "Concentric progress rings for completion and KPI readouts.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/RadialChart",
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
            "description": "Chart title"
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
    "name": "RadioButton",
    "label": "Radio button",
    "slug": "radio-button",
    "category": "forms",
    "description": "Radio button and radio group with vertical and horizontal layouts, animated dot indicator.",
    "client": true,
    "importPath": "@robr0/design-system/components/RadioButton/RadioButton",
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
            "name": "value",
            "type": "string",
            "required": false,
            "description": "Currently selected value",
            "defaultValue": ""
          },
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "Radio group name"
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
      }
    ]
  },
  {
    "name": "Rating",
    "label": "Rating",
    "slug": "rating",
    "category": "forms",
    "description": "Star-scale rating control with keyboard selection, a read-only mode, and a configurable icon.",
    "client": true,
    "importPath": "@robr0/design-system/components/Rating/Rating",
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
    "name": "Reasoning",
    "label": "Reasoning",
    "slug": "reasoning",
    "category": "ai",
    "description": "A model's thinking, disclosed behind a one-line summary and collapsed once it finishes.",
    "client": true,
    "importPath": "@robr0/design-system/components/Reasoning/Reasoning",
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
            "description": "Override the summary line. By default it reports the streaming state and the duration."
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
    "name": "RichDropdown",
    "label": "Rich dropdown",
    "slug": "rich-dropdown",
    "category": "forms",
    "description": "Dropdown's rich sibling: options preview their own heading face, body face, and key colour.",
    "client": true,
    "importPath": "@robr0/design-system/components/RichDropdown/RichDropdown",
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
    "name": "ScatterChart",
    "label": "Scatter chart",
    "slug": "scatter-chart",
    "category": "charts",
    "description": "Plots point clusters across two axes to show correlation and distribution.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/ScatterChart",
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
            "description": "Chart title"
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
    "name": "SectionTitle",
    "label": "Section title",
    "slug": "section-title",
    "category": "layout",
    "description": "Heading with a divider line and optional trailing content for organising page sections.",
    "client": false,
    "importPath": "@robr0/design-system/components/SectionTitle/SectionTitle",
    "barrel": "main",
    "exports": [
      {
        "component": "SectionTitle",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Section heading text"
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
    "name": "SegmentedControl",
    "label": "Segmented control",
    "slug": "segmented-control",
    "category": "actions",
    "description": "Pill-style toggle between related views with keyboard navigation and icon support.",
    "client": true,
    "importPath": "@robr0/design-system/components/SegmentedControl/SegmentedControl",
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
            "name": "activeSegment",
            "type": "string",
            "required": true,
            "description": "Currently active segment value"
          },
          {
            "name": "onSegmentChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Callback when segment changes"
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
            "type": "\"neutral\" | \"primary\"",
            "required": false,
            "description": "Visual treatment of the active segment — teal by default, `neutral` fills it grey",
            "defaultValue": "primary"
          },
          {
            "name": "fullWidth",
            "type": "boolean",
            "required": false,
            "description": "Full width — segments fill container",
            "defaultValue": "false"
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "required": false,
            "description": "Accessible label for the tablist"
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
    "name": "SelectionCard",
    "label": "Selection card",
    "slug": "selection-card",
    "category": "data-display",
    "description": "Large selectable option cards with radio or checkbox indicators for high-visibility choices like settings and onboarding.",
    "client": true,
    "importPath": "@robr0/design-system/components/SelectionCard/SelectionCard",
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
            "description": "Currently selected value(s) — string for radio, string[] for checkbox"
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
    "name": "ShaderField",
    "label": "Shader field",
    "slug": "shader-field",
    "category": "effects",
    "description": "An ambient WebGL2 field of soft light sources that sample colour tokens, with a reported fallback status.",
    "client": true,
    "importPath": "@robr0/design-system/components/ShaderField/ShaderField",
    "barrel": "main",
    "exports": [
      {
        "component": "ShaderField",
        "props": []
      }
    ]
  },
  {
    "name": "Skeleton",
    "label": "Skeleton",
    "slug": "skeleton",
    "category": "feedback",
    "description": "Placeholder loading indicators with text, circular, and rectangular variants.",
    "client": false,
    "importPath": "@robr0/design-system/components/Skeleton/Skeleton",
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
    "name": "Slider",
    "label": "Slider",
    "slug": "slider",
    "category": "forms",
    "description": "Range input for selecting a value between a minimum and maximum, in default and compact sizes.",
    "client": true,
    "importPath": "@robr0/design-system/components/Slider/Slider",
    "barrel": "main",
    "exports": [
      {
        "component": "Slider",
        "props": [
          {
            "name": "value",
            "type": "number",
            "required": false,
            "description": "Current value",
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
            "defaultValue": "Slider",
            "deprecated": "Pass the native `aria-label` attribute instead."
          }
        ]
      }
    ]
  },
  {
    "name": "SourceChip",
    "label": "Source chip",
    "slug": "source-chip",
    "category": "ai",
    "description": "A numbered citation pill linking a claim to its source.",
    "client": false,
    "importPath": "@robr0/design-system/components/SourceChip/SourceChip",
    "barrel": "main",
    "exports": [
      {
        "component": "SourceChip",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "The source name, e.g. \"Design tokens quarterly\". Truncates with an ellipsis when long."
          },
          {
            "name": "index",
            "type": "number",
            "required": false,
            "description": "Citation number, rendered as a leading numeral in its own small badge circle."
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Leading icon — a Material Symbol name (string) or custom element (ReactNode).\nThe icon and the index share the leading slot: when both are passed, `index` wins\nand the icon is not rendered."
          },
          {
            "name": "href",
            "type": "string",
            "required": false,
            "description": "Optional href — renders as an `<a>` instead of a `<span>`."
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
    "name": "SourceTrail",
    "label": "Source trail",
    "slug": "source-trail",
    "category": "ai",
    "description": "The sources an agent opened while answering, as a collapsible list with per-item status.",
    "client": true,
    "importPath": "@robr0/design-system/components/SourceTrail/SourceTrail",
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
            "description": "Header text. Left unset, it is computed from the items —\n\"Reading 3 sources\" while any is still pending or active,\n\"Read 3 sources\" once every visit has settled."
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
    "name": "Sparkline",
    "label": "Sparkline",
    "slug": "sparkline",
    "category": "charts",
    "description": "Inline trend line for stats and table cells, drawn without axes or chrome.",
    "client": false,
    "importPath": "@robr0/design-system/components/Sparkline/Sparkline",
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
            "type": "\"positive\" | \"neutral\" | \"accent\" | \"negative\"",
            "required": false,
            "description": "Colour role for the line and end dot. `accent` follows the chart palette's\nlead colour; `positive`/`negative` map to the status text tokens; `neutral`\nrecedes to secondary text.",
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
    "name": "Spinner",
    "label": "Spinner",
    "slug": "spinner",
    "category": "feedback",
    "description": "Animated circular loading indicator in three sizes and primary, neutral, or inherit variants.",
    "client": false,
    "importPath": "@robr0/design-system/components/Spinner/Spinner",
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
            "name": "variant",
            "type": "\"inherit\" | \"neutral\" | \"primary\"",
            "required": false,
            "description": "Visual variant — `inherit` draws the spinner in `currentColor`, for use inside coloured controls",
            "defaultValue": "primary"
          },
          {
            "name": "label",
            "type": "string",
            "required": false,
            "description": "Accessible label",
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
    "name": "SplitButton",
    "label": "Split button",
    "slug": "split-button",
    "category": "actions",
    "description": "Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill.",
    "client": false,
    "importPath": "@robr0/design-system/components/SplitButton/SplitButton",
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
            "description": "Visual treatment, shared by both segments",
            "defaultValue": "primary"
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
    "name": "SplitPane",
    "label": "Split pane",
    "slug": "split-pane",
    "category": "layout",
    "description": "Two resizable regions with a draggable, keyboard-operable divider between them.",
    "client": true,
    "importPath": "@robr0/design-system/components/SplitPane/SplitPane",
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
    "name": "StackedBarChart",
    "label": "Stacked bar chart",
    "slug": "stacked-bar-chart",
    "category": "charts",
    "description": "Bars split into stacked segments to compare totals and their composition.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/StackedBarChart",
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
            "description": "Chart title"
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
    "name": "Stat",
    "label": "Stat",
    "slug": "stat",
    "category": "data-display",
    "description": "Headline metrics with labels and trend deltas.",
    "client": false,
    "importPath": "@robr0/design-system/components/Stat/Stat",
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
    "name": "StatusDot",
    "label": "Status dot",
    "slug": "status-dot",
    "category": "feedback",
    "description": "The bare status mark: a dot in the five status roles, with an optional label and a live pulse for recording and online-now states.",
    "client": false,
    "importPath": "@robr0/design-system/components/StatusDot/StatusDot",
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
            "type": "\"sm\" | \"md\" | \"lg\"",
            "required": false,
            "description": "Dot diameter, derived from the icon scale (half of `--icon-size-500/md/lg`).",
            "defaultValue": "md"
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
    "name": "Stepper",
    "label": "Stepper",
    "slug": "stepper",
    "category": "navigation",
    "description": "Step-by-step progress indicator for wizards and multi-stage flows.",
    "client": true,
    "importPath": "@robr0/design-system/components/Stepper/Stepper",
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
    "name": "StreamingText",
    "label": "Streaming text",
    "slug": "streaming-text",
    "category": "ai",
    "description": "Progressive reveal for text arriving in chunks, with a blinking cursor while more is coming.",
    "client": true,
    "importPath": "@robr0/design-system/components/StreamingText/StreamingText",
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
            "description": "The retired interval between reveal steps; when set, its equivalent\nrate becomes the reveal's floor.",
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
      },
      {
        "component": "createStreamReveal",
        "props": [
          {
            "name": "onUpdate",
            "type": "(visible: string) => void",
            "required": true,
            "description": "Receives the visible slice each time the reveal moves it."
          },
          {
            "name": "floorCps",
            "type": "number",
            "required": false,
            "description": "Slowest the reveal ever runs, in characters per second. Defaults to\nMOTION_STREAM_FLOOR_CPS."
          },
          {
            "name": "drainMs",
            "type": "number",
            "required": false,
            "description": "However much text is waiting, it is fully on screen within this long,\nin milliseconds. Defaults to MOTION_STREAM_DRAIN_MS."
          },
          {
            "name": "paced",
            "type": "boolean | (() => boolean)",
            "required": false,
            "description": "Whether appended text is paced at all. Pass false (or a function\nreturning false — it is read on every append) to show each chunk\nwhole: the reduced-motion path."
          }
        ]
      },
      {
        "component": "useStreamReveal",
        "props": []
      }
    ]
  },
  {
    "name": "Swatch",
    "label": "Swatch",
    "slug": "swatch",
    "category": "forms",
    "description": "Clickable colour tile for preset palettes and picker triggers, with a theme-aware selection ring.",
    "client": false,
    "importPath": "@robr0/design-system/components/Swatch/Swatch",
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
    "name": "Table",
    "label": "Table",
    "slug": "table",
    "category": "data-display",
    "description": "Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.",
    "client": false,
    "importPath": "@robr0/design-system/components/Table/Table",
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
    "name": "Tabs",
    "label": "Tabs",
    "slug": "tabs",
    "category": "navigation",
    "description": "Tab navigation with underline indicator, icon support, compact size, and full-width mode.",
    "client": true,
    "importPath": "@robr0/design-system/components/Tabs/Tabs",
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
            "name": "activeTab",
            "type": "string",
            "required": true,
            "description": "Currently active tab value"
          },
          {
            "name": "onTabChange",
            "type": "((value: string) => void)",
            "required": false,
            "description": "Callback when tab is selected"
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
            "description": "Accessible label for the tab list",
            "defaultValue": "Tabs"
          }
        ]
      }
    ]
  },
  {
    "name": "TagInput",
    "label": "Tag input",
    "slug": "tag-input",
    "category": "forms",
    "description": "Multi-value text input with entries held as removable tags.",
    "client": true,
    "importPath": "@robr0/design-system/components/TagInput/TagInput",
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
    "name": "Textarea",
    "label": "Textarea",
    "slug": "textarea",
    "category": "forms",
    "description": "Multi-line text input with character counter, resize control, helper text, and error states.",
    "client": true,
    "importPath": "@robr0/design-system/components/Textarea/Textarea",
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
            "description": "Current value",
            "defaultValue": ""
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
    "name": "ThreadPanel",
    "label": "Thread panel",
    "slug": "thread-panel",
    "category": "ai",
    "description": "The session-history rail for chat products: brand header, new-thread action, standing controls, projects, grouped detail-rich threads, and a profile footer.",
    "client": false,
    "importPath": "@robr0/design-system/components/ThreadPanel/ThreadPanel",
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
            "name": "threadMenuLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for a row's menu trigger; the thread's title is appended after it.",
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
            "description": "Text for the new-thread row. The row renders when this, `onNewThread`, or `newThreadHref` is given."
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
          }
        ]
      }
    ]
  },
  {
    "name": "ThreadTabs",
    "label": "Thread tabs",
    "slug": "thread-tabs",
    "category": "ai",
    "description": "The strip of open chat sessions: pill tabs with unread dots and hover-revealed close buttons, a new-tab action, and animated enter and exit.",
    "client": true,
    "importPath": "@robr0/design-system/components/ThreadTabs/ThreadTabs",
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
            "name": "closeLabel",
            "type": "string",
            "required": false,
            "description": "Accessible name for a tab's close button; the tab's label is appended after it.",
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
    "name": "TimePicker",
    "label": "Time picker",
    "slug": "time-picker",
    "category": "forms",
    "description": "Time-of-day field with a dropdown list of selectable times.",
    "client": true,
    "importPath": "@robr0/design-system/components/TimePicker/TimePicker",
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
    "name": "Timeline",
    "label": "Timeline",
    "slug": "timeline",
    "category": "data-display",
    "description": "Ordered sequences: histories and steppers.",
    "client": false,
    "importPath": "@robr0/design-system/components/Timeline/Timeline",
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
            "description": "`vertical` timeline (default) or `horizontal` stepper"
          },
          {
            "name": "numbered",
            "type": "boolean",
            "required": false,
            "description": "Number the markers 1..n instead of dots"
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
    "name": "Toast",
    "label": "Toast",
    "slug": "toast",
    "category": "feedback",
    "description": "Temporary notification with status variants, auto-dismiss, and stacking via ToastProvider.",
    "client": true,
    "importPath": "@robr0/design-system/components/Toast/Toast",
    "barrel": "main",
    "exports": [
      {
        "component": "Toast",
        "props": [
          {
            "name": "title",
            "type": "string",
            "required": false,
            "description": "Toast title text"
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
            "description": "Whether the toast can be manually dismissed",
            "defaultValue": "true"
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "required": false,
            "description": "Custom icon override — Material Symbol name (string) or custom element (ReactNode)"
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
          }
        ]
      },
      {
        "component": "useToast",
        "props": []
      }
    ]
  },
  {
    "name": "ToggleGroup",
    "label": "Toggle group",
    "slug": "toggle-group",
    "category": "actions",
    "description": "A set of two-state buttons that can be toggled on or off, supporting text and icon items.",
    "client": true,
    "importPath": "@robr0/design-system/components/ToggleGroup/ToggleGroup",
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
            "description": "Currently active value(s)",
            "defaultValue": "[]"
          },
          {
            "name": "multiple",
            "type": "boolean",
            "required": false,
            "description": "Allow multiple selection",
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
            "name": "variant",
            "type": "\"neutral\" | \"primary\"",
            "required": false,
            "description": "Visual treatment of active items — teal by default, `neutral` fills them grey",
            "defaultValue": "primary"
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
    "name": "ToggleSwitch",
    "label": "Toggle switch",
    "slug": "toggle-switch",
    "category": "forms",
    "description": "Binary on/off toggle control with sliding thumb and check indicator, used for settings like theme switching.",
    "client": true,
    "importPath": "@robr0/design-system/components/ToggleSwitch/ToggleSwitch",
    "barrel": "main",
    "exports": [
      {
        "component": "ToggleSwitch",
        "props": [
          {
            "name": "checked",
            "type": "boolean",
            "required": false,
            "description": "Whether the toggle is on (checked)",
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
      }
    ]
  },
  {
    "name": "ToolCall",
    "label": "Tool call",
    "slug": "tool-call",
    "category": "ai",
    "description": "The record of one tool invocation, with its arguments and result behind a disclosure.",
    "client": true,
    "importPath": "@robr0/design-system/components/ToolCall/ToolCall",
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
    "name": "Toolbar",
    "label": "Toolbar",
    "slug": "toolbar",
    "category": "layout",
    "description": "A grouped strip of controls in one pill shell: clusters, separators, arrow-key focus, and a glass floating variant.",
    "client": true,
    "importPath": "@robr0/design-system/components/Toolbar/Toolbar",
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
    "name": "Tooltip",
    "label": "Tooltip",
    "slug": "tooltip",
    "category": "overlays",
    "description": "Contextual text label that appears on hover or focus with position and delay options.",
    "client": true,
    "importPath": "@robr0/design-system/components/Tooltip/Tooltip",
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
            "description": "Tooltip text content"
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
    "name": "TreeView",
    "label": "Tree view",
    "slug": "tree-view",
    "category": "data-display",
    "description": "Collapsible hierarchy for files, folders, and nested structures.",
    "client": true,
    "importPath": "@robr0/design-system/components/TreeView/TreeView",
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
    "name": "Treemap",
    "label": "Treemap",
    "slug": "treemap",
    "category": "charts",
    "description": "Nested rectangles sized by value for part-to-whole breakdowns.",
    "client": false,
    "importPath": "@robr0/design-system/components/Chart/Treemap",
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
            "description": "Chart title"
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
    "name": "UsageCard",
    "label": "Usage card",
    "slug": "usage-card",
    "category": "ai",
    "description": "An agent's budgets at a glance: context window and plan limits as meter rows with reset captions.",
    "client": false,
    "importPath": "@robr0/design-system/components/UsageCard/UsageCard",
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
            "description": "Card title in the shared chart-chrome header"
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
    "name": "Waveform",
    "label": "Waveform",
    "slug": "waveform",
    "category": "ai",
    "description": "Voice made visible: a row of bars dancing on the shared twelve-slot cycle, or tracking a live analyser level by level.",
    "client": false,
    "importPath": "@robr0/design-system/components/Waveform/Waveform",
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
            "description": "Bar height scale — `default` sits on the md icon size, `compact` on sm.",
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
    "name": "WorldMap",
    "label": "World map",
    "slug": "world-map",
    "category": "maps",
    "description": "A flat world map from Natural Earth land shapes: token-coloured continents, framed bounds, and colour-carrying markers.",
    "client": true,
    "importPath": "@robr0/design-system/components/WorldMap/WorldMap",
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
            "name": "className",
            "type": "string",
            "required": false,
            "description": "Additional CSS classes",
            "defaultValue": ""
          }
        ]
      }
    ]
  }
];
