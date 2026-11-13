// AUTO-GENERATED — do not edit by hand.
// Source of truth: the type declarations under src/, walked from each
// component's props by scripts/component-types.mjs.
// Regenerate: node scripts/generate-component-api.mjs (runs via predev/prebuild).

/**
 * One in-repo type a prop reaches, as declared in the source, or, for
 * another component's props interface, a pointer to the call that returns
 * them (kind `component-props`, with `component` and `see`).
 */
export interface ComponentTypeApi {
  kind: 'interface' | 'type' | 'enum' | 'class' | 'component-props';
  /** The declaration as written in the source, keywords such as `export` dropped. Absent on a pointer. */
  definition?: string;
  /** On a pointer: the component whose props these are. */
  component?: string;
  /** On a pointer: the get_component call that returns them. */
  see?: string;
  /** The declaration's JSDoc summary, when it has one. */
  description?: string;
  /** The other in-repo types the definition mentions, each a key of the entry's `types`. */
  refs?: string[];
}

/** One entry's closed type map. */
export interface ComponentTypesApi {
  /** Every in-repo type the props reference, nested ones included, by name. */
  types: Record<string, ComponentTypeApi>;
  /** Every outside type the props or `types` mention, with the package that defines it (`typescript` for a built-in). */
  externalTypes: Record<string, string>;
}

/** The type map for every entry whose props reference a named type, by slug. */
export const componentTypes: Readonly<Record<string, ComponentTypesApi>> = {
  "accordion": {
    "types": {
      "AccordionItem": {
        "kind": "interface",
        "definition": "interface AccordionItem {\n  /** Unique identifier */\n  id: string;\n  /** Header text */\n  title: string;\n  /** Body content */\n  content: React.ReactNode;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "action-card": {
    "types": {
      "ActionCardStatus": {
        "kind": "type",
        "definition": "type ActionCardStatus = 'proposed' | 'confirmed' | 'dismissed' | 'undone';",
        "description": "Where a proposed change stands."
      },
      "ActionReadoutFact": {
        "kind": "interface",
        "definition": "interface ActionReadoutFact {\n  /** What it measures: \"Refunded\". */\n  label: string;\n  /** Its value: \"$101,137 across 52 orders\". */\n  value: React.ReactNode;\n}",
        "description": "One line of a readout: what it measures and its value, already written in the reader's locale."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "action-readout": {
    "types": {
      "ActionReadoutFact": {
        "kind": "interface",
        "definition": "interface ActionReadoutFact {\n  /** What it measures: \"Refunded\". */\n  label: string;\n  /** Its value: \"$101,137 across 52 orders\". */\n  value: React.ReactNode;\n}",
        "description": "One line of a readout: what it measures and its value, already written in the reader's locale."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "agent-plan": {
    "types": {
      "AgentPlanStep": {
        "kind": "interface",
        "definition": "interface AgentPlanStep {\n  /** What this step does, in one line. */\n  label: string;\n  /** Where the step has got to. Defaults to `pending`. */\n  status?: AgentPlanStepStatus;\n  /** Optional supporting line under the label, e.g. the file it touched. */\n  detail?: string;\n}",
        "refs": [
          "AgentPlanStepStatus"
        ]
      },
      "AgentPlanStepStatus": {
        "kind": "type",
        "definition": "type AgentPlanStepStatus = 'pending' | 'active' | 'completed' | 'failed';"
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "Record": "typescript"
    }
  },
  "agent-rail": {
    "types": {
      "AgentRailProfile": {
        "kind": "interface",
        "definition": "interface AgentRailProfile {\n  /** The agent's display name, shown under the portrait; also seeds the Avatar's initials. */\n  name: string;\n  /** The portrait's image src, handed to an `lg` Avatar. Without one the rail draws its own agent mark instead, since initials would claim a person. Ignored when `avatar` is given. */\n  avatarSrc?: string;\n  /** Replaces the default portrait with a custom element — a hero portrait, an illustrated mark. */\n  avatar?: React.ReactNode;\n  /** A short line under the name, e.g. \"Connected\". Renders with a leading status dot. */\n  status?: React.ReactNode;\n  /** Which status role the dot under the name takes. */\n  statusTone?: 'positive' | 'info' | 'warning' | 'error' | 'neutral';\n  /** Fires when the portrait's edit affordance is pressed. The pencil renders only when this is given. */\n  onEdit?: () => void;\n  /** Accessible name for the portrait's edit affordance. */\n  editLabel?: string;\n}"
      },
      "AgentRailTab": {
        "kind": "interface",
        "definition": "interface AgentRailTab {\n  /** Stable identifier: `value` matches against it and `onValueChange` reports it. */\n  id: string;\n  /** The tab's label, shown beside its icon and used as the pane's accessible name. */\n  label: string;\n  /** Leading icon on the tab — Material Symbol name (string) or custom element (ReactNode). Give every tab one and a squeezed rail can fall back to icons alone; give none and it keeps the labels. */\n  icon?: string | React.ReactNode;\n  /** The pane rendered while this tab is active. */\n  content?: React.ReactNode;\n  /** Whether the tab is selectable. */\n  disabled?: boolean;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "agent-status": {
    "types": {
      "AgentStatusPattern": {
        "kind": "type",
        "definition": "type AgentStatusPattern = (typeof agentStatusPatterns)[number];"
      },
      "AgentStatusState": {
        "kind": "type",
        "definition": "type AgentStatusState =\n  | 'idle'\n  | 'thinking'\n  | 'working'\n  | 'waiting'\n  | 'done'\n  | 'error';"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "ai-button": {
    "types": {
      "AgentStatusState": {
        "kind": "type",
        "definition": "type AgentStatusState =\n  | 'idle'\n  | 'thinking'\n  | 'working'\n  | 'waiting'\n  | 'done'\n  | 'error';"
      },
      "AiButtonSummary": {
        "kind": "interface",
        "definition": "interface AiButtonSummary {\n  /** Overline label above the title. */\n  overline?: string;\n  /** Title line — usually the page or subject being summarized. */\n  title: string;\n  /** Small caption beside the overline, e.g. a reading time. */\n  caption?: string;\n  /** The pre-written summary the panel reveals. */\n  text: string;\n  /** Prompt chips under the summary; a tap reports through `onSummarySuggestion`. */\n  suggestions?: PromptSuggestion[];\n}",
        "description": "The content of AiButton's summary panel.",
        "refs": [
          "PromptSuggestion"
        ]
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "PromptSuggestion": {
        "kind": "interface",
        "definition": "interface PromptSuggestion {\n  /** Stable identifier passed to `onValueChange`. */\n  id: string;\n  /** The suggestion text shown in the chip. */\n  label: string;\n  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */\n  icon?: string | React.ReactNode;\n  /** A quiet second line under the label, drawn by the `tiles` and `cards` layouts: what the tile leads to, or the full question a card asks. The chip layouts have no room for it and leave it out. */\n  description?: string;\n}",
        "description": "One tappable suggestion in the row."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "alert": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "anchor-nav": {
    "types": {
      "AnchorNavItem": {
        "kind": "interface",
        "definition": "interface AnchorNavItem {\n  /** The id of the element the item jumps to (rendered as `href=\"#id\"`) */\n  id: string;\n  /** Link text */\n  label: string;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "app-layout": {
    "types": {
      "AppSidebarItem": {
        "kind": "interface",
        "definition": "interface AppSidebarItem {\n  /** Unique key for this item */\n  key: string;\n  /** Item icon — Material Symbol name (string) or custom element (ReactNode). Optional only when `pixelAvatar` draws the mark instead */\n  icon?: string | React.ReactNode;\n  /**\n   * Draws a generated PixelAvatar in the icon seat instead of `icon`, for\n   * rows that name a thing rather than a place — projects, workspaces,\n   * accounts. `true` seeds the character from `label`; a string seeds it\n   * from that value, so a renamed item can keep its character by passing a\n   * stable id. The sidebar spreads the inks across all of its avatar rows,\n   * so neighbours differ in colour as well as shape. The character is\n   * decorative: the label beside it is the name\n   */\n  pixelAvatar?: boolean | string;\n  /** Display label (shown when expanded) */\n  label: string;\n  /** Click handler — also fires on a link item, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */\n  href?: string;\n  /** Trailing pill, e.g. unread items. A count takes the count badge colours and, while the rail is collapsed, rides the icon's corner; a word stays a quiet pill, hidden while collapsed */\n  badge?: string | number;\n  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav=\"panel\"` */\n  children?: AppSidebarSubItem[];\n}",
        "refs": [
          "AppSidebarSubItem"
        ]
      },
      "AppSidebarLayout": {
        "kind": "type",
        "definition": "type AppSidebarLayout = 'flush' | 'floating' | 'inset';",
        "description": "The three app shell modes, how the rail meets the page: edge to edge behind a hairline, floating as a card, or flush beside a raised inset surface."
      },
      "AppSidebarProfile": {
        "kind": "interface",
        "definition": "interface AppSidebarProfile {\n  /** User display name */\n  name: string;\n  /** User email */\n  email: string;\n  /** Avatar image URL */\n  avatarUrl?: string;\n}"
      },
      "AppSidebarSection": {
        "kind": "interface",
        "definition": "interface AppSidebarSection {\n  /** Optional category label above the group */\n  category?: string;\n  /** Nav items in this section */\n  items: AppSidebarItem[];\n}",
        "refs": [
          "AppSidebarItem"
        ]
      },
      "AppSidebarSubItem": {
        "kind": "interface",
        "definition": "interface AppSidebarSubItem {\n  /** Unique key for this sub-item */\n  key: string;\n  /** Display label */\n  label: string;\n  /** Click handler — also fires on a link sub-item, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Renders the sub-item as a real link to this URL instead of a button. Ignored when the sub-item has children, whose row opens them */\n  href?: string;\n  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */\n  badge?: string | number;\n  /** Group heading this entry sits under when it is listed in the panel (see `subNav`); ignored in the accordion */\n  group?: string;\n  /**\n   * The next level down. With `subNav=\"accordion\"` a sub-item's children are\n   * level 3 and open in the side panel; with `subNav=\"panel\"` they are the\n   * panel's own accordion. Navigation stops at three levels, so deeper\n   * children are not rendered.\n   */\n  children?: AppSidebarSubItem[];\n}"
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "app-sidebar": {
    "types": {
      "AppSidebarItem": {
        "kind": "interface",
        "definition": "interface AppSidebarItem {\n  /** Unique key for this item */\n  key: string;\n  /** Item icon — Material Symbol name (string) or custom element (ReactNode). Optional only when `pixelAvatar` draws the mark instead */\n  icon?: string | React.ReactNode;\n  /**\n   * Draws a generated PixelAvatar in the icon seat instead of `icon`, for\n   * rows that name a thing rather than a place — projects, workspaces,\n   * accounts. `true` seeds the character from `label`; a string seeds it\n   * from that value, so a renamed item can keep its character by passing a\n   * stable id. The sidebar spreads the inks across all of its avatar rows,\n   * so neighbours differ in colour as well as shape. The character is\n   * decorative: the label beside it is the name\n   */\n  pixelAvatar?: boolean | string;\n  /** Display label (shown when expanded) */\n  label: string;\n  /** Click handler — also fires on a link item, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */\n  href?: string;\n  /** Trailing pill, e.g. unread items. A count takes the count badge colours and, while the rail is collapsed, rides the icon's corner; a word stays a quiet pill, hidden while collapsed */\n  badge?: string | number;\n  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav=\"panel\"` */\n  children?: AppSidebarSubItem[];\n}",
        "refs": [
          "AppSidebarSubItem"
        ]
      },
      "AppSidebarLayout": {
        "kind": "type",
        "definition": "type AppSidebarLayout = 'flush' | 'floating' | 'inset';",
        "description": "The three app shell modes, how the rail meets the page: edge to edge behind a hairline, floating as a card, or flush beside a raised inset surface."
      },
      "AppSidebarProfile": {
        "kind": "interface",
        "definition": "interface AppSidebarProfile {\n  /** User display name */\n  name: string;\n  /** User email */\n  email: string;\n  /** Avatar image URL */\n  avatarUrl?: string;\n}"
      },
      "AppSidebarSection": {
        "kind": "interface",
        "definition": "interface AppSidebarSection {\n  /** Optional category label above the group */\n  category?: string;\n  /** Nav items in this section */\n  items: AppSidebarItem[];\n}",
        "refs": [
          "AppSidebarItem"
        ]
      },
      "AppSidebarSubItem": {
        "kind": "interface",
        "definition": "interface AppSidebarSubItem {\n  /** Unique key for this sub-item */\n  key: string;\n  /** Display label */\n  label: string;\n  /** Click handler — also fires on a link sub-item, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Renders the sub-item as a real link to this URL instead of a button. Ignored when the sub-item has children, whose row opens them */\n  href?: string;\n  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */\n  badge?: string | number;\n  /** Group heading this entry sits under when it is listed in the panel (see `subNav`); ignored in the accordion */\n  group?: string;\n  /**\n   * The next level down. With `subNav=\"accordion\"` a sub-item's children are\n   * level 3 and open in the side panel; with `subNav=\"panel\"` they are the\n   * panel's own accordion. Navigation stops at three levels, so deeper\n   * children are not rendered.\n   */\n  children?: AppSidebarSubItem[];\n}"
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "area-chart": {
    "types": {
      "AreaSeriesConfig": {
        "kind": "interface",
        "definition": "interface AreaSeriesConfig {\n  /** Key in data for this series */\n  dataKey: string;\n  /** Display name (shown in tooltip and legend) */\n  label: string;\n  /** Area stroke / fill colour — CSS value */\n  color?: string;\n  /** Fill opacity (0–1) */\n  fillOpacity?: number;\n}"
      },
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "artifact-card": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "artifact-panel": {
    "types": {
      "ArtifactPanelView": {
        "kind": "type",
        "definition": "type ArtifactPanelView = 'preview' | 'code';",
        "description": "Which face of the artifact is on stage."
      },
      "CodeBlockProps": {
        "kind": "component-props",
        "component": "CodeBlock",
        "see": "get_component(\"CodeBlock\")"
      }
    },
    "externalTypes": {
      "Pick": "typescript",
      "ReactNode": "react"
    }
  },
  "attachment-drop-zone": {
    "types": {},
    "externalTypes": {
      "File": "typescript",
      "ReactNode": "react"
    }
  },
  "attachment-group": {
    "types": {
      "AttachmentItem": {
        "kind": "interface",
        "definition": "interface AttachmentItem {\n  /** Stable identity, unique within its list. */\n  id: string;\n  /** File name, extension included. */\n  name: string;\n  /** What kind of file it is. */\n  kind: FileKind;\n  /**\n   * Short label on the file's type mark, replacing the one derived from its\n   * kind and extension (`getFileTypeLabel`: \"PDF\", \"DOC\", the extension, or\n   * \"FILE\"), wherever the family draws the mark: the tile, a lone picture's\n   * badge, the viewer and a composer's queue. Set it to localise the mark or\n   * to name a format the derivation does not know.\n   */\n  typeLabel?: string;\n  /** Size in bytes. */\n  size?: number;\n  /** Mime type, when the source reported one. */\n  mimeType?: string;\n  /** Where the file is in its life. */\n  status: AttachmentStatus;\n  /** Upload progress, 0 to 100, while `status` is `uploading`. */\n  progress?: number;\n  /** Why it failed, while `status` is `error`. */\n  error?: string;\n  /** Image that fills the tile: an object URL for a picture, or a\n      host-rendered first page for a document. */\n  previewSrc?: string;\n  /** Alt text for the preview. Defaults to the name. */\n  previewAlt?: string;\n  /** Full-size image for the viewer, when the preview is a thumbnail.\n      Defaults to `previewSrc`. */\n  src?: string;\n  /** The file itself, for the viewer to show a PDF or a text file in place\n      (through DocumentViewer) and for a picture with no `src`. Distinct\n      from `src`, which is always an image. */\n  fileUrl?: string;\n  /** Intrinsic width of the preview, to reserve its shape before it loads. */\n  width?: number;\n  /** Intrinsic height of the preview. */\n  height?: number;\n  /** First lines of a pasted block, drawn as the tile's excerpt. */\n  excerpt?: string;\n}",
        "description": "One attachment as the family passes it around: what a tile draws, what a\ngroup lays out, and what `useAttachments` keeps. Plain data, so it\nserialises and crosses the server boundary; the `File` itself stays with\nwhoever owns the upload.",
        "refs": [
          "AttachmentStatus",
          "FileKind"
        ]
      },
      "AttachmentStatus": {
        "kind": "type",
        "definition": "type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';",
        "description": "Where an attachment is in its life: usable, on its way, failed, or gone."
      },
      "AttachmentTileProps": {
        "kind": "component-props",
        "component": "AttachmentTile",
        "see": "get_component(\"AttachmentTile\")"
      },
      "AttachmentViewerProps": {
        "kind": "component-props",
        "component": "AttachmentViewer",
        "see": "get_component(\"AttachmentViewer\")"
      },
      "FileKind": {
        "kind": "type",
        "definition": "type FileKind =\n  | 'pdf'\n  | 'document'\n  | 'spreadsheet'\n  | 'presentation'\n  | 'image'\n  | 'audio'\n  | 'video'\n  | 'archive'\n  | 'code'\n  | 'text'\n  | 'pasted'\n  | 'generic';"
      }
    },
    "externalTypes": {
      "Pick": "typescript",
      "ReactNode": "react"
    }
  },
  "attachment-tile": {
    "types": {
      "AttachmentStatus": {
        "kind": "type",
        "definition": "type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';",
        "description": "Where an attachment is in its life: usable, on its way, failed, or gone."
      },
      "FileKind": {
        "kind": "type",
        "definition": "type FileKind =\n  | 'pdf'\n  | 'document'\n  | 'spreadsheet'\n  | 'presentation'\n  | 'image'\n  | 'audio'\n  | 'video'\n  | 'archive'\n  | 'code'\n  | 'text'\n  | 'pasted'\n  | 'generic';"
      }
    },
    "externalTypes": {
      "HTMLButtonElement": "typescript",
      "MouseEventHandler": "react"
    }
  },
  "attachment-viewer": {
    "types": {
      "AttachmentItem": {
        "kind": "interface",
        "definition": "interface AttachmentItem {\n  /** Stable identity, unique within its list. */\n  id: string;\n  /** File name, extension included. */\n  name: string;\n  /** What kind of file it is. */\n  kind: FileKind;\n  /**\n   * Short label on the file's type mark, replacing the one derived from its\n   * kind and extension (`getFileTypeLabel`: \"PDF\", \"DOC\", the extension, or\n   * \"FILE\"), wherever the family draws the mark: the tile, a lone picture's\n   * badge, the viewer and a composer's queue. Set it to localise the mark or\n   * to name a format the derivation does not know.\n   */\n  typeLabel?: string;\n  /** Size in bytes. */\n  size?: number;\n  /** Mime type, when the source reported one. */\n  mimeType?: string;\n  /** Where the file is in its life. */\n  status: AttachmentStatus;\n  /** Upload progress, 0 to 100, while `status` is `uploading`. */\n  progress?: number;\n  /** Why it failed, while `status` is `error`. */\n  error?: string;\n  /** Image that fills the tile: an object URL for a picture, or a\n      host-rendered first page for a document. */\n  previewSrc?: string;\n  /** Alt text for the preview. Defaults to the name. */\n  previewAlt?: string;\n  /** Full-size image for the viewer, when the preview is a thumbnail.\n      Defaults to `previewSrc`. */\n  src?: string;\n  /** The file itself, for the viewer to show a PDF or a text file in place\n      (through DocumentViewer) and for a picture with no `src`. Distinct\n      from `src`, which is always an image. */\n  fileUrl?: string;\n  /** Intrinsic width of the preview, to reserve its shape before it loads. */\n  width?: number;\n  /** Intrinsic height of the preview. */\n  height?: number;\n  /** First lines of a pasted block, drawn as the tile's excerpt. */\n  excerpt?: string;\n}",
        "description": "One attachment as the family passes it around: what a tile draws, what a\ngroup lays out, and what `useAttachments` keeps. Plain data, so it\nserialises and crosses the server boundary; the `File` itself stays with\nwhoever owns the upload.",
        "refs": [
          "AttachmentStatus",
          "FileKind"
        ]
      },
      "AttachmentStatus": {
        "kind": "type",
        "definition": "type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';",
        "description": "Where an attachment is in its life: usable, on its way, failed, or gone."
      },
      "FileKind": {
        "kind": "type",
        "definition": "type FileKind =\n  | 'pdf'\n  | 'document'\n  | 'spreadsheet'\n  | 'presentation'\n  | 'image'\n  | 'audio'\n  | 'video'\n  | 'archive'\n  | 'code'\n  | 'text'\n  | 'pasted'\n  | 'generic';"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "avatar": {
    "types": {
      "AvatarFill": {
        "kind": "type",
        "definition": "type AvatarFill = 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "One of the six avatar fills, by token number (`--color-avatar-bg-*`)."
      }
    },
    "externalTypes": {}
  },
  "avatar-group": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "banner": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "bar-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "bento-tile": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "bento-tile-art": {
    "types": {
      "BentoTileArtPattern": {
        "kind": "type",
        "definition": "type BentoTileArtPattern = 'dots' | 'lines' | 'rings' | 'grid' | 'waves' | 'rays';",
        "description": "One pattern of the BentoTile art set, listed in the order tiles rotate through them."
      }
    },
    "externalTypes": {}
  },
  "bottom-nav": {
    "types": {
      "BottomNavItem": {
        "kind": "interface",
        "definition": "interface BottomNavItem {\n  /** Unique key for this destination */\n  key: string;\n  /** Display label, always shown under the icon */\n  label: string;\n  /** Icon — Material Symbol name (string, drawn filled when selected) or custom element (ReactNode) */\n  icon: string | React.ReactNode;\n  /** Renders the destination as a real link to this URL instead of a button */\n  href?: string;\n  /** Click handler — also fires on a link destination, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Count on the icon's corner; `true` shows a dot with no number */\n  badge?: number | string | true;\n}"
      },
      "BottomNavSearch": {
        "kind": "interface",
        "definition": "interface BottomNavSearch {\n  /** The button's accessible name on iOS, and its visible tab label on the other platforms */\n  label: string;\n  /**\n   * Icon — Material Symbol name (string) or custom element (ReactNode).\n   * Defaults to `search`; set it when the set-apart slot launches something\n   * else, such as an assistant.\n   */\n  icon?: string | React.ReactNode;\n  /** Click handler */\n  onClick?: () => void;\n  /** Renders the button as a link to this URL instead */\n  href?: string;\n}"
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "breadcrumb": {
    "types": {
      "BreadcrumbItem": {
        "kind": "interface",
        "definition": "interface BreadcrumbItem {\n  /** Display label */\n  label: string;\n  /** Link href — omit for the current / last item */\n  href?: string;\n}"
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react"
    }
  },
  "button": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "button-group": {
    "types": {
      "ButtonProps": {
        "kind": "component-props",
        "component": "Button",
        "see": "get_component(\"Button\")"
      }
    },
    "externalTypes": {
      "Array": "typescript"
    }
  },
  "card": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "card-stack": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "carousel": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "chat-header": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "chat-marker": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "chat-message": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "chat-thread": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "chip": {
    "types": {},
    "externalTypes": {
      "HTMLButtonElement": "typescript",
      "MouseEventHandler": "react",
      "ReactNode": "react"
    }
  },
  "circular-button": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "code-diff": {
    "types": {
      "CodeDiffChangeLabels": {
        "kind": "interface",
        "definition": "interface CodeDiffChangeLabels {\n  /** Announced before an added line */\n  added: string;\n  /** Announced before a removed line */\n  removed: string;\n}",
        "description": "The visually hidden text announced before a changed line, per change type."
      }
    },
    "externalTypes": {
      "Partial": "typescript"
    }
  },
  "combo-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "combobox": {
    "types": {
      "ComboboxOption": {
        "kind": "interface",
        "definition": "interface ComboboxOption {\n  /** Display label — also the text matched when filtering */\n  label: string;\n  /** Option value */\n  value: string;\n  /** Optional secondary line shown under the label */\n  description?: string;\n  /** Whether this option is disabled */\n  disabled?: boolean;\n}"
      },
      "ComboboxOptionGroup": {
        "kind": "interface",
        "definition": "interface ComboboxOptionGroup {\n  /** Group heading */\n  label: string;\n  /** Options within the group */\n  options: ComboboxOption[];\n}",
        "refs": [
          "ComboboxOption"
        ]
      }
    },
    "externalTypes": {}
  },
  "command-palette": {
    "types": {
      "CommandPaletteCommand": {
        "kind": "interface",
        "definition": "interface CommandPaletteCommand {\n  /** Stable identifier */\n  id: string;\n  /** Display label — the primary text matched when filtering */\n  label: string;\n  /** Optional secondary line under the label */\n  description?: string;\n  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** Keyboard shortcut shown on the right as literal keycaps, e.g. ['⌘', 'P']. `keys` draws it for the visitor's platform instead. */\n  shortcut?: string[];\n  /** Keyboard shortcut shown on the right in the shortcut grammar (`mod+p`), drawn in the platform's legends: ⌘ P on a Mac, Ctrl P elsewhere. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */\n  keys?: Shortcut;\n  /** Custom node at the row's right edge, after any `shortcut` — a badge or affordance the keycap slot can't express. It renders inside the option row, so keep it non-interactive: a focusable element here would nest controls. */\n  trailing?: React.ReactNode;\n  /** Extra terms that should match this command when filtering */\n  keywords?: string[];\n  /** Whether the command is disabled */\n  disabled?: boolean;\n  /** Marks a dangerous or irreversible command (delete, remove…): the row takes the danger colour, the same as a destructive DropdownMenu item */\n  destructive?: boolean;\n  /** Called when this command is chosen */\n  onSelect?: () => void;\n}",
        "refs": [
          "Shortcut"
        ]
      },
      "CommandPaletteGroup": {
        "kind": "interface",
        "definition": "interface CommandPaletteGroup {\n  /** Group heading */\n  label: string;\n  /** Commands within the group */\n  commands: CommandPaletteCommand[];\n}",
        "refs": [
          "CommandPaletteCommand"
        ]
      },
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "command-palette-trigger": {
    "types": {
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "composer": {
    "types": {
      "AttachmentItem": {
        "kind": "interface",
        "definition": "interface AttachmentItem {\n  /** Stable identity, unique within its list. */\n  id: string;\n  /** File name, extension included. */\n  name: string;\n  /** What kind of file it is. */\n  kind: FileKind;\n  /**\n   * Short label on the file's type mark, replacing the one derived from its\n   * kind and extension (`getFileTypeLabel`: \"PDF\", \"DOC\", the extension, or\n   * \"FILE\"), wherever the family draws the mark: the tile, a lone picture's\n   * badge, the viewer and a composer's queue. Set it to localise the mark or\n   * to name a format the derivation does not know.\n   */\n  typeLabel?: string;\n  /** Size in bytes. */\n  size?: number;\n  /** Mime type, when the source reported one. */\n  mimeType?: string;\n  /** Where the file is in its life. */\n  status: AttachmentStatus;\n  /** Upload progress, 0 to 100, while `status` is `uploading`. */\n  progress?: number;\n  /** Why it failed, while `status` is `error`. */\n  error?: string;\n  /** Image that fills the tile: an object URL for a picture, or a\n      host-rendered first page for a document. */\n  previewSrc?: string;\n  /** Alt text for the preview. Defaults to the name. */\n  previewAlt?: string;\n  /** Full-size image for the viewer, when the preview is a thumbnail.\n      Defaults to `previewSrc`. */\n  src?: string;\n  /** The file itself, for the viewer to show a PDF or a text file in place\n      (through DocumentViewer) and for a picture with no `src`. Distinct\n      from `src`, which is always an image. */\n  fileUrl?: string;\n  /** Intrinsic width of the preview, to reserve its shape before it loads. */\n  width?: number;\n  /** Intrinsic height of the preview. */\n  height?: number;\n  /** First lines of a pasted block, drawn as the tile's excerpt. */\n  excerpt?: string;\n}",
        "description": "One attachment as the family passes it around: what a tile draws, what a\ngroup lays out, and what `useAttachments` keeps. Plain data, so it\nserialises and crosses the server boundary; the `File` itself stays with\nwhoever owns the upload.",
        "refs": [
          "AttachmentStatus",
          "FileKind"
        ]
      },
      "AttachmentStatus": {
        "kind": "type",
        "definition": "type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';",
        "description": "Where an attachment is in its life: usable, on its way, failed, or gone."
      },
      "AttachmentTileProps": {
        "kind": "component-props",
        "component": "AttachmentTile",
        "see": "get_component(\"AttachmentTile\")"
      },
      "FileKind": {
        "kind": "type",
        "definition": "type FileKind =\n  | 'pdf'\n  | 'document'\n  | 'spreadsheet'\n  | 'presentation'\n  | 'image'\n  | 'audio'\n  | 'video'\n  | 'archive'\n  | 'code'\n  | 'text'\n  | 'pasted'\n  | 'generic';"
      },
      "MentionItem": {
        "kind": "type",
        "definition": "type MentionItem = {\n  /** Stable identity, unique within its source. */\n  id: string;\n  /** The name shown in the menu and written into the text after the trigger character. */\n  label: string;\n  /** A quieter second phrase on the same row: a role, a path, what a skill does. */\n  description?: string;\n  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */\n  icon?: string | React.ReactNode;\n  /** Extra words the filter matches on besides the label. */\n  keywords?: string[];\n  /** Listed but not choosable. */\n  disabled?: boolean;\n};",
        "description": "One thing a person can reference: a teammate, a file, a skill."
      },
      "MentionSource": {
        "kind": "type",
        "definition": "type MentionSource = {\n  /** The single character that opens this source. */\n  trigger: string;\n  /** The items it offers. */\n  items: MentionItem[];\n  /** Accessible name for this source's menu (\"People\", \"Skills\"). */\n  label?: string;\n};",
        "description": "Everything one trigger character opens: `@` for entities, `/` for skills.",
        "refs": [
          "MentionItem"
        ]
      }
    },
    "externalTypes": {
      "File": "typescript",
      "Pick": "typescript",
      "ReactNode": "react"
    }
  },
  "contact-card": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "context-menu": {
    "types": {
      "DropdownMenuEntry": {
        "kind": "type",
        "definition": "type DropdownMenuEntry =\n  | DropdownMenuItem\n  | DropdownMenuSeparator\n  | DropdownMenuGroup;",
        "refs": [
          "DropdownMenuGroup",
          "DropdownMenuItem",
          "DropdownMenuSeparator"
        ]
      },
      "DropdownMenuGroup": {
        "kind": "interface",
        "definition": "interface DropdownMenuGroup {\n  type: 'group';\n  /** Section heading */\n  label: string;\n  /** Items within the group */\n  items: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry"
        ]
      },
      "DropdownMenuItem": {
        "kind": "interface",
        "definition": "interface DropdownMenuItem {\n  type?: 'item';\n  /** Display label */\n  label: string;\n  /** A line under the label, such as what the choice does or means. It wraps the row to two lines in the caption style; the icon stays centred on the pair. */\n  description?: string;\n  /** Keyboard shortcut hint as literal text (e.g. \"⇧ ⌘ P\"). `keys` writes it for the reader's platform instead. */\n  shortcut?: string;\n  /** Keyboard shortcut hint in the shortcut grammar (`mod+shift+p`), written for the reader's platform (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere) and announced through `aria-keyshortcuts`. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */\n  keys?: Shortcut;\n  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** A trailing icon after the label, such as `open_in_new` on an item that opens another site. Decorative: say what the item does in its label. A Material Symbol name (string) or a custom element (ReactNode). Ignored on an item that opens a sub-menu. */\n  iconRight?: string | React.ReactNode;\n  /** Disabled state */\n  disabled?: boolean;\n  /** Marks a dangerous or irreversible item (delete, remove…): it takes the destructive colour, with the error tint on hover and focus */\n  destructive?: boolean;\n  /** Marks the item as the current choice of a set: it holds the passive wash and a trailing check, and is announced as a checked radio item. Leave undefined on plain action items; pass `false` on the unchosen members of a set so they are announced as radio items too. Ignored on an item that opens a sub-menu. */\n  selected?: boolean;\n  /** Marks the item as one of a set picked independently: it leads with the checkbox's box, ticked when true, and is announced as a checkbox item. Leave undefined on plain action items. The host toggles it in `onClick`. Ignored on an item that opens a sub-menu. */\n  checked?: boolean;\n  /** Whether choosing the item closes the menu. Defaults to false for a checkbox item, so several can be toggled in one visit, and true for every other item. */\n  closeOnSelect?: boolean;\n  /** Click handler */\n  onClick?: () => void;\n  /** Nested sub-menu items */\n  children?: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry",
          "Shortcut"
        ]
      },
      "DropdownMenuSeparator": {
        "kind": "interface",
        "definition": "interface DropdownMenuSeparator {\n  type: 'separator';\n}"
      },
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "contribution-graph": {
    "types": {
      "ContributionDay": {
        "kind": "interface",
        "definition": "interface ContributionDay {\n  /** ISO date string, e.g. \"2026-07-08\" */\n  date: string;\n  /** Number of contributions on this day */\n  count: number;\n  /** Intensity level 0 (none) to 4 (most) — drives the cell colour */\n  level: 0 | 1 | 2 | 3 | 4;\n}"
      },
      "Weekday": {
        "kind": "type",
        "definition": "type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday."
      }
    },
    "externalTypes": {
      "Date": "typescript"
    }
  },
  "currency-input": {
    "types": {
      "DecimalString": {
        "kind": "type",
        "definition": "type DecimalString = string;",
        "description": "A decimal amount written with an optional leading minus, digits and an optional `.` fraction: `\"1234.50\"`, `\"-0.07\"`."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "data-table": {
    "types": {
      "Aggregate": {
        "kind": "type",
        "definition": "type Aggregate = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct' | 'range';",
        "description": "The calculations a column's `aggregate` can name."
      },
      "CellEditorKind": {
        "kind": "type",
        "definition": "type CellEditorKind =\n  | 'text'\n  | 'textarea'\n  | 'number'\n  | 'select'\n  | 'multiselect'\n  | 'combobox'\n  | 'tags'\n  | 'date'\n  | 'time'\n  | 'checkbox'\n  | 'switch';",
        "description": "The editor kinds a column can name, each one of the library's fields."
      },
      "CellValue": {
        "kind": "type",
        "definition": "type CellValue = string | number | boolean | string[] | null | undefined;",
        "description": "Any value a cell can hold."
      },
      "ColumnFormat": {
        "kind": "interface",
        "definition": "interface ColumnFormat {\n  /** BCP 47 locale for numbers, money and dates. Defaults to the table's `locale` (else the nearest LocaleProvider's, else `en-US`), never the browser's, so the server and the browser agree. */\n  locale?: string;\n  /** ISO 4217 code for a `currency` column. Defaults to `USD`. */\n  currency?: string;\n  /** Digits after the point for `number`, `currency` and `progress`. Defaults to none for money and progress, and up to two for a number. */\n  fractionDigits?: number;\n  /** How a `date` column reads: `short` (11/04/26), `medium` (Nov 4, 2026), `long` (November 4, 2026) or `relative` (in 3 days). Defaults to `medium`; the full date shows on hover either way. */\n  date?: 'short' | 'medium' | 'long' | 'relative';\n}",
        "description": "How a typed column formats its values."
      },
      "ColumnType": {
        "kind": "type",
        "definition": "type ColumnType =\n  'text' | 'number' | 'currency' | 'date' | 'status' | 'person' | 'tags' | 'progress' | 'checkbox' | 'link';",
        "description": "The types a column can be."
      },
      "DataTableAggregate": {
        "kind": "type",
        "definition": "type DataTableAggregate = Aggregate;",
        "description": "The calculations a column's `aggregate` can name.",
        "refs": [
          "Aggregate"
        ]
      },
      "DataTableCellEdit": {
        "kind": "interface",
        "definition": "interface DataTableCellEdit<R extends DataTableRow = DataTableRow> {\n  /** The row, as it was before the edit. */\n  row: R;\n  /** The column's key. */\n  key: string;\n  /** The new value. */\n  value: DataTableValue;\n  /** The value before the edit. */\n  previous: DataTableValue;\n}",
        "description": "One saved cell, as `onCellEdit` hears it.",
        "refs": [
          "DataTableRow",
          "DataTableValue"
        ]
      },
      "DataTableCellText": {
        "kind": "type",
        "definition": "type DataTableCellText = 'wrap' | 'nowrap' | 'truncate' | 'lines-2';",
        "description": "How a cell's text fits its width: `wrap` breaks onto as many lines as it\nneeds; `nowrap` stays on one line and runs on; `truncate` stays on one\nline and ends in an ellipsis, with the full text as the cell's tooltip;\n`lines-2` wraps onto two lines at most, then ends in an ellipsis."
      },
      "DataTableColumn": {
        "kind": "interface",
        "definition": "interface DataTableColumn<R extends DataTableRow = DataTableRow> {\n  /** Unique column identifier, used as the key into each row's values. */\n  key: string;\n  /** Header label displayed in the column header. */\n  header: React.ReactNode;\n  /** Whether clicking this header sorts by the column. */\n  sortable?: boolean;\n  /** Optional column width (CSS value like '200px', '30%', 'auto'). */\n  width?: string;\n  /** Text alignment for cells in this column. `start` and `end` follow the reading direction (a typed column defaults to its type's: `end` for numbers, money and progress, `start` for text); `left` and `right` are screen sides. */\n  align?: 'start' | 'center' | 'end' | 'left' | 'right';\n  /** Render the cell for a row; defaults to the row's raw value for this key. */\n  render?: (row: R) => React.ReactNode;\n  /** Whether this column names each row: its cells render as row headers, and its value names the row's checkbox (\"Select Ada Lovelace\"). One column per table. */\n  rowHeader?: boolean;\n  /** Narrowest width a resize can reach, in pixels. Defaults to what the header needs (its padding, two letters of label, and its sort glyph and menu button) or, for an editable column, its editor, whichever is wider. */\n  minWidth?: number;\n  /** Widest width a resize can reach, in pixels. */\n  maxWidth?: number;\n  /** Starts the column pinned to the start or end edge (logical, so right-to-left correct), where it stays while the rest scroll sideways. */\n  pin?: 'start' | 'end';\n  /** Whether this column can be resized. Defaults to the table's `resizableColumns`. */\n  resizable?: boolean;\n  /** Whether this column can be moved. Defaults to the table's `reorderableColumns`. */\n  reorderable?: boolean;\n  /** Whether this column can be hidden from its header menu. Defaults to true. */\n  hideable?: boolean;\n  /** Starts the column hidden, seeding `defaultHiddenColumns`. */\n  defaultHidden?: boolean;\n  /** Holds the column where it is: it cannot be resized, moved, hidden or unpinned, whatever the table allows. The row header is the usual one. */\n  locked?: boolean;\n  /** How this column's cell text fits. Defaults to the table's `cellText`. */\n  cellText?: DataTableCellText;\n  /**\n   * Makes the column's cells editable, with one of the library's fields\n   * (`text`, `textarea`, `number`, `select`, `multiselect`, `combobox`,\n   * `tags`, `date`, `time`, `checkbox`, `switch`) or a function that renders\n   * your own editor. A cell reads as text until it is edited; `checkbox` and\n   * `switch` are live controls in the cell, saved as they toggle.\n   */\n  editor?: DataTableEditorKind | ((context: DataTableEditorContext<R>) => React.ReactNode);\n  /** The choices of a `select`, `multiselect` or `combobox` editor. A cell shows the chosen option's label. */\n  options?: DataTableOption[];\n  /** Checks a new value before it is saved: return the message to show, or nothing when it passes. An error keeps the editor open. */\n  validate?: (value: DataTableValue, row: R) => string | null | undefined;\n  /** Whether a row's cell in this column can be edited, given the row. Defaults to true when the column has an `editor`. */\n  editable?: boolean | ((row: R) => boolean);\n  /** Whether the column can be filtered, from its header menu or a TableToolbar. Defaults to true. */\n  filterable?: boolean;\n  /**\n   * What the column holds, which sets everything the column does not set\n   * itself: how a cell is drawn (`render` still wins), its alignment, its\n   * sort, its filter's conditions, and the editor it opens when `editable`\n   * is set. `text`, `number`, `currency`, `date` (a `YYYY-MM-DD` value),\n   * `status` (a Badge in the option's `status` role, sorted in the options'\n   * order), `person` (an Avatar and the name, or a stack for a list),\n   * `tags` (a list, the first two shown), `progress` (0 to 100),\n   * `checkbox` (a check, or a live checkbox when editable) and `link` (a\n   * URL, shown without its scheme). An untyped column reads as text and\n   * filters by what its values look like.\n   */\n  type?: DataTableColumnType;\n  /** How a typed column formats its values: the locale, the currency, the digits after the point, the date style. */\n  format?: DataTableColumnFormat;\n  /** Whether the table can be grouped by this column, from its header menu or a TableToolbar. Defaults to false. */\n  groupable?: boolean;\n  /**\n   * The calculation a group row shows in this column, and the totals\n   * footer's starting pick: `sum`, `avg`, `min`, `max`, `count`,\n   * `countDistinct` or `range`, formatted through the column's type, or a\n   * function of the column's values returning what to show.\n   */\n  aggregate?: DataTableAggregate | ((values: DataTableValue[], rows: R[]) => React.ReactNode);\n}",
        "refs": [
          "DataTableAggregate",
          "DataTableCellText",
          "DataTableColumnFormat",
          "DataTableColumnType",
          "DataTableEditorContext",
          "DataTableEditorKind",
          "DataTableOption",
          "DataTableRow",
          "DataTableValue"
        ]
      },
      "DataTableColumnFormat": {
        "kind": "type",
        "definition": "type DataTableColumnFormat = ColumnFormat;",
        "description": "How a typed column formats its values.",
        "refs": [
          "ColumnFormat"
        ]
      },
      "DataTableColumnLabels": {
        "kind": "interface",
        "definition": "interface DataTableColumnLabels {\n  /** Accessible name of a column's menu button, given the header text. */\n  menu: (header: string) => string;\n  /** Menu item: sort the column ascending. */\n  sortAscending: string;\n  /** Menu item: sort the column descending. */\n  sortDescending: string;\n  /** Menu item: clear the sort. */\n  clearSort: string;\n  /** Menu item, with `multiSort`: add the column after the current sorts. */\n  addToSort: string;\n  /** Menu item, with several sorts: take the column out of the sort and keep the others. */\n  removeFromSort: string;\n  /** Menu item: pin the column to the start edge. */\n  pinStart: string;\n  /** Menu item: pin the column to the end edge. */\n  pinEnd: string;\n  /** Menu item: unpin the column. */\n  unpin: string;\n  /** Menu item: move the column one place towards the start. */\n  moveLeft: string;\n  /** Menu item: move the column one place towards the end. */\n  moveRight: string;\n  /** Menu item: hide the column. */\n  hide: string;\n  /** Menu item: fit the column to its widest visible content. */\n  fit: string;\n  /** Menu item: put the column back to its starting width. */\n  resetWidth: string;\n  /** Accessible name of a row's move grip, given the row's name. */\n  rowGrip: (rowName: string) => string;\n  /** Accessible name of the move-grip column header. */\n  rowGripColumn: string;\n  /** The hidden header of the details column. */\n  detailsColumn: string;\n  /** A row's details toggle, given the row's name and whether its details are showing. */\n  toggleDetails: (rowName: string, expanded: boolean) => string;\n  /** Accessible name of the actions column header. */\n  actionsColumn: string;\n  /** Accessible name of a row's More menu button, given the row's name. */\n  moreActions: (rowName: string) => string;\n  /** Announced after a column moves, given its header, its new position and the column count. */\n  movedColumn: (header: string, position: number, count: number) => string;\n  /** Announced after a row moves, given its name, its new position and the row count. */\n  movedRow: (rowName: string, position: number, count: number) => string;\n  /** Announced after a column is pinned, given its header and the edge. */\n  pinnedColumn: (header: string, edge: 'start' | 'end') => string;\n  /** Announced after a column is unpinned, given its header. */\n  unpinnedColumn: (header: string) => string;\n  /** Announced after a column is hidden, given its header. */\n  hiddenColumn: (header: string) => string;\n  /** Announced after a column is resized, given its header and the new width in pixels. */\n  resizedColumn: (header: string, width: number) => string;\n  /** Accessible name of a cell's editor, given the column's header and the row's name. */\n  editField: (header: string, rowName: string) => string;\n  /** Accessible name of a cell's hover edit button, in cell mode, given the column's header and the row's name. */\n  editCell: (header: string, rowName: string) => string;\n  /** How a `checkbox` column's checked cell is read. */\n  checkedValue: string;\n  /** How a `checkbox` column's unchecked cell is read. */\n  uncheckedValue: string;\n  /** The count a `tags` cell shows for the tags it folds away, given how many. */\n  moreValues: (count: number) => string;\n  /** Menu item: group the table by the column. */\n  groupBy: string;\n  /** Menu item: stop grouping, on the grouped column. */\n  ungroup: string;\n  /** A group row's toggle, given the group's value, its row count and whether it is open. */\n  groupToggle: (value: string, count: number, expanded: boolean) => string;\n  /** A group row's row count, given how many. */\n  groupCount: (count: number) => string;\n  /** The group of rows with no value in the grouped column. */\n  emptyGroup: string;\n  /** Selects every row in a group, given the group's value. */\n  selectGroup: (value: string) => string;\n  /** The totals footer's prompt on a column with no calculation picked. */\n  calculate: string;\n  /** The totals footer's menu button, given the column's header. */\n  totalsMenu: (header: string) => string;\n  /** A picked footer cell's name, given the column's header, the calculation and its result, so it says which column it totals. */\n  totalsValue: (header: string, calculation: string, value: string) => string;\n  /** Each calculation's name, as the footer's menu and its caption read it. */\n  totals: Record<DataTableTotal, string>;\n  /** Accessible name of a row's Edit button, with `editMode=\"row\"`, given the row's name. */\n  editRow: (rowName: string) => string;\n  /** Accessible name of a row's Save button while it edits, given the row's name. */\n  saveRow: (rowName: string) => string;\n  /** Accessible name of a row's Cancel button while it edits, given the row's name. */\n  cancelRow: (rowName: string) => string;\n  /** Announced, assertively, when a save fails and the value rolls back, given the column's header and the row's name. */\n  saveFailed: (header: string, rowName: string) => string;\n}",
        "refs": [
          "DataTableTotal"
        ]
      },
      "DataTableColumnPinning": {
        "kind": "interface",
        "definition": "interface DataTableColumnPinning {\n  /** Keys pinned to the start edge, outermost first. */\n  start?: string[];\n  /** Keys pinned to the end edge, outermost first. */\n  end?: string[];\n}",
        "description": "Columns pinned to either edge, by column key, in order from that edge."
      },
      "DataTableColumnType": {
        "kind": "type",
        "definition": "type DataTableColumnType = ColumnType;",
        "description": "The types a column can be; see `DataTableColumn.type`.",
        "refs": [
          "ColumnType"
        ]
      },
      "DataTableEditorContext": {
        "kind": "interface",
        "definition": "interface DataTableEditorContext<R extends DataTableRow = DataTableRow> {\n  /** The draft value. */\n  value: DataTableValue;\n  /** Changes the draft. */\n  setValue: (value: DataTableValue) => void;\n  /** Saves the draft, or the value given. */\n  commit: (value?: DataTableValue) => void;\n  /** Ends the edit without saving. */\n  cancel: () => void;\n  /** The row being edited. */\n  row: R;\n  /** The size to draw the editor at: always `compact`, the size every built-in editor takes, whatever the table's density. */\n  size: 'default' | 'compact';\n  /** The editor's accessible name. */\n  label: string;\n  /** The validation message, when the draft does not pass. */\n  error?: string;\n}",
        "description": "What a custom editor is handed.",
        "refs": [
          "DataTableRow",
          "DataTableValue"
        ]
      },
      "DataTableEditorKind": {
        "kind": "type",
        "definition": "type DataTableEditorKind = CellEditorKind;",
        "description": "The editor kinds a column's `editor` can name, each composed from the library's own field.",
        "refs": [
          "CellEditorKind"
        ]
      },
      "DataTableFilter": {
        "kind": "type",
        "definition": "type DataTableFilter = Filter;",
        "description": "One filter condition on one column, as the table and TableToolbar share it.",
        "refs": [
          "Filter"
        ]
      },
      "DataTableFilterLabels": {
        "kind": "type",
        "definition": "type DataTableFilterLabels = FilterLabels;",
        "description": "Every word a filter shows or announces, each defaulting to English.",
        "refs": [
          "FilterLabels"
        ]
      },
      "DataTableLoadLabels": {
        "kind": "interface",
        "definition": "interface DataTableLoadLabels {\n  /** The skeleton rows' name, and the refetch line's. */\n  loading: string;\n  /** The loading row that ends the rows while `hasMore` fetches the next batch. */\n  loadingMore: string;\n  /** The title of a failed load, in the error state and the Banner. */\n  errorTitle: string;\n  /** The button that calls `onRetry`. */\n  retry: string;\n}",
        "description": "Every word the table shows while rows load or fail to, each defaulting to English."
      },
      "DataTableOption": {
        "kind": "interface",
        "definition": "interface DataTableOption {\n  /** The value stored in the row. */\n  value: string;\n  /** What the cell and the list show. */\n  label: string;\n  /** For a `status` column, the status role its Badge takes. Defaults to `neutral`. */\n  status?: StatusRole;\n}",
        "description": "One choice of a `select`, `multiselect` or `combobox` editor.",
        "refs": [
          "StatusRole"
        ]
      },
      "DataTableRow": {
        "kind": "interface",
        "definition": "interface DataTableRow {\n  /** Unique row identifier. */\n  id: string;\n  /** Raw values keyed by column key — used for sorting, searching, and default rendering. */\n  values: Record<string, DataTableValue>;\n}",
        "refs": [
          "DataTableValue"
        ]
      },
      "DataTableRowAction": {
        "kind": "interface",
        "definition": "interface DataTableRowAction {\n  /** Stable id for the action. */\n  id: string;\n  /** What the action does, as its accessible name and its tooltip or menu label. */\n  label: string;\n  /** Material Symbol name (string) or custom element. */\n  icon?: React.ReactNode;\n  /** Runs the action. */\n  onSelect: () => void;\n  /** Shows the action as its own button rather than in the More menu. Defaults to false. */\n  inline?: boolean;\n  /** Marks a dangerous or irreversible action, drawn in the destructive colour in the menu. */\n  destructive?: boolean;\n  /** Whether the action is unavailable for this row. */\n  disabled?: boolean;\n}",
        "description": "One action a row offers in its actions column."
      },
      "DataTableRowEdit": {
        "kind": "interface",
        "definition": "interface DataTableRowEdit<R extends DataTableRow = DataTableRow> {\n  /** The row, as it was before the edit. */\n  row: R;\n  /** The changed values, by column key. */\n  values: Record<string, DataTableValue>;\n  /** The changed columns' values before the edit. */\n  previous: Record<string, DataTableValue>;\n}",
        "description": "One saved row, as `onRowEdit` hears it.",
        "refs": [
          "DataTableRow",
          "DataTableValue"
        ]
      },
      "DataTableSort": {
        "kind": "interface",
        "definition": "interface DataTableSort {\n  /** The column being sorted. */\n  key: string;\n  /** Sort direction. */\n  direction: 'asc' | 'desc';\n}"
      },
      "DataTableTotal": {
        "kind": "type",
        "definition": "type DataTableTotal = Total;",
        "description": "Every calculation the totals footer offers, `none` included.",
        "refs": [
          "Total"
        ]
      },
      "DataTableValue": {
        "kind": "type",
        "definition": "type DataTableValue = CellValue;",
        "description": "Any value a cell can hold.",
        "refs": [
          "CellValue"
        ]
      },
      "DataTableView": {
        "kind": "type",
        "definition": "type DataTableView = TableView;",
        "description": "One saved setup of a table: its sorts, filters, search, columns, pinning, widths, grouping, density and page size. Selection, the page and open details are the session, never part of a view.",
        "refs": [
          "TableView"
        ]
      },
      "EmptyStateProps": {
        "kind": "component-props",
        "component": "EmptyState",
        "see": "get_component(\"EmptyState\")"
      },
      "Filter": {
        "kind": "interface",
        "definition": "interface Filter {\n  /** Stable id, so a chip and its editor keep their place while the value changes. */\n  id: string;\n  /** The column's key. */\n  column: string;\n  /** How the value is compared. */\n  operator: FilterOperator;\n  /** What it is compared with; missing until it is picked. */\n  value?: FilterValue;\n}",
        "description": "One condition on one column.",
        "refs": [
          "FilterOperator",
          "FilterValue"
        ]
      },
      "FilterLabels": {
        "kind": "interface",
        "definition": "interface FilterLabels {\n  /** An operator as a chip and the operator menu read it. */\n  operators: Record<FilterOperator, string>;\n  /** The toolbar's button that adds a filter. */\n  addFilter: string;\n  /** The editor's name, given the column's header. */\n  editor: (header: string) => string;\n  /** The operator field's name. */\n  operatorField: string;\n  /** The value field's name, given the column's header. */\n  valueField: (header: string) => string;\n  /** The first value of a `between`. */\n  from: string;\n  /** The second value of a `between`. */\n  to: string;\n  /** Placeholder and name of the search field over a list filter's choices. */\n  searchChoices: string;\n  /** Shown when the search matches none of a list filter's choices. */\n  noChoices: string;\n  /** Removes one filter, given its chip's text. */\n  remove: (chip: string) => string;\n  /** Removes every filter. */\n  clearAll: string;\n  /** A chip's placeholder for a value not picked yet. */\n  noValue: string;\n  /** Joins the two ends of a `between` on a chip. */\n  and: string;\n  /** Joins two or more chosen values on a chip, given how many past the first. */\n  more: (count: number) => string;\n  /** The header menu item that opens a column's filter. */\n  filterColumn: string;\n  /** Name of a filtered header's mark, given the header. */\n  filtered: (header: string) => string;\n  /** Announced when the filters change, given the rows that match. */\n  filteredAnnouncement: (count: number) => string;\n}",
        "description": "Every word a filter shows or announces, each defaulting to English.",
        "refs": [
          "FilterOperator"
        ]
      },
      "FilterOperator": {
        "kind": "type",
        "definition": "type FilterOperator =\n  | 'contains'\n  | 'notContains'\n  | 'is'\n  | 'isNot'\n  | 'startsWith'\n  | 'endsWith'\n  | 'eq'\n  | 'neq'\n  | 'lt'\n  | 'lte'\n  | 'gt'\n  | 'gte'\n  | 'between'\n  | 'before'\n  | 'after'\n  | 'isAnyOf'\n  | 'isNoneOf'\n  | 'hasAnyOf'\n  | 'hasAllOf'\n  | 'hasNoneOf'\n  | 'isEmpty'\n  | 'isNotEmpty'\n  | 'isChecked'\n  | 'isNotChecked';",
        "description": "Every operator, across the kinds."
      },
      "FilterValue": {
        "kind": "type",
        "definition": "type FilterValue = string | number | [number | string | null, number | string | null] | string[] | null | undefined;",
        "description": "A filter's value: text or a date for one-value operators, a number, a pair for `between`, a list for the set operators."
      },
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "PaginationProps": {
        "kind": "component-props",
        "component": "Pagination",
        "see": "get_component(\"Pagination\")"
      },
      "StatusRole": {
        "kind": "type",
        "definition": "type StatusRole = 'info' | 'positive' | 'warning' | 'error' | 'neutral';",
        "description": "A status option's role, the Badge variant its cells take."
      },
      "TableView": {
        "kind": "interface",
        "definition": "interface TableView {\n  /** The view format's version, so a stored view can be read by a later one. */\n  version: 1;\n  /** The sorts, first sort first. */\n  sorts?: { key: string; direction: 'asc' | 'desc' }[];\n  /** The filters. */\n  filters?: Filter[];\n  /** The search text. */\n  search?: string;\n  /** The hidden columns' keys. */\n  hiddenColumns?: string[];\n  /** Every column key in display order. */\n  columnOrder?: string[];\n  /** The columns pinned to either edge. */\n  columnPinning?: { start?: string[]; end?: string[] };\n  /** The column widths in pixels, by key. */\n  columnWidths?: Record<string, number>;\n  /** The column keys the rows are grouped by. */\n  grouping?: string[];\n  /** The density. */\n  size?: 'default' | 'compact';\n  /** Rows per page. */\n  pageSize?: number;\n}",
        "description": "One saved setup of a table. Every field is optional: a view leaves out what it does not set.",
        "refs": [
          "Filter"
        ]
      },
      "Total": {
        "kind": "type",
        "definition": "type Total = 'none' | 'count' | 'countDistinct' | 'empty' | 'filled' | 'percentEmpty' | 'sum' | 'avg' | 'min' | 'max' | 'range';",
        "description": "Every calculation the totals footer offers, `none` included (Notion's Calculate set)."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "Partial": "typescript",
      "Pick": "typescript",
      "Promise": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "date-picker": {
    "types": {
      "Weekday": {
        "kind": "type",
        "definition": "type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday."
      }
    },
    "externalTypes": {
      "Date": "typescript"
    }
  },
  "date-range-picker": {
    "types": {
      "DateRange": {
        "kind": "type",
        "definition": "type DateRange = { start: string | null; end: string | null };",
        "description": "A range as two `YYYY-MM-DD` strings; `end` is null while the second day is still to be chosen."
      },
      "DateRangePosition": {
        "kind": "type",
        "definition": "type DateRangePosition = 'start' | 'end' | 'start-end' | 'inside' | 'outside';",
        "description": "Where a day sits in the range, for its spoken name."
      },
      "DateRangePreset": {
        "kind": "type",
        "definition": "type DateRangePreset = {\n  /** What the preset is called: \"Last 7 days\", \"This month\". */\n  label: string;\n  /** The range it sets. */\n  range: { start: string; end: string };\n};",
        "description": "A ready-made range the reader can pick in one press."
      },
      "Weekday": {
        "kind": "type",
        "definition": "type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday."
      }
    },
    "externalTypes": {
      "Date": "typescript"
    }
  },
  "deadline": {
    "types": {
      "DateInput": {
        "kind": "type",
        "definition": "type DateInput = Date | string | number;",
        "description": "A date, an ISO 8601 string, or milliseconds since the epoch. A bare `YYYY-MM-DD` is read as midnight UTC, so it never shifts a day."
      },
      "DeadlineStatus": {
        "kind": "type",
        "definition": "type DeadlineStatus = 'neutral' | 'warning' | 'error' | 'overdue';",
        "description": "Where a deadline stands against now."
      },
      "DeadlineThresholds": {
        "kind": "type",
        "definition": "type DeadlineThresholds = {\n  /** Under this long to go, the deadline turns to the warning role. Defaults to three days. */\n  warning?: number;\n  /** Under this long to go, the deadline turns to the error role. Defaults to one day. */\n  critical?: number;\n};",
        "description": "How close a deadline must be for each warning, in milliseconds."
      }
    },
    "externalTypes": {
      "Date": "typescript"
    }
  },
  "description-list": {
    "types": {
      "DescriptionListEntry": {
        "kind": "type",
        "definition": "type DescriptionListEntry = {\n  /** The term: what the value is (\"Account number\", \"Due date\"). */\n  term: React.ReactNode;\n  /** The value. Empty (null, undefined or an empty string) shows the list's `emptyValue`. */\n  details?: React.ReactNode;\n  /** A stable key for the entry; also its element id. */\n  id?: string;\n  /** A trailing control for this value: an Edit button, a link. */\n  action?: React.ReactNode;\n  /** Offer a copy button: `true` copies the value when it is text, a string copies that string (the unformatted account number behind a formatted one). */\n  copyable?: boolean | string;\n};",
        "description": "One term and its value, as `items` takes them."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "dialog": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "document-chip": {
    "types": {
      "DocumentChipFileType": {
        "kind": "type",
        "definition": "type DocumentChipFileType =\n  | 'pdf'\n  | 'doc'\n  | 'sheet'\n  | 'slide'\n  | 'image'\n  | 'code'\n  | 'archive'\n  | 'generic';"
      }
    },
    "externalTypes": {
      "HTMLButtonElement": "typescript",
      "MouseEventHandler": "react",
      "ReactNode": "react"
    }
  },
  "document-viewer": {
    "types": {
      "DocumentViewerKind": {
        "kind": "type",
        "definition": "type DocumentViewerKind = 'pdf' | 'image' | 'text';",
        "description": "What the viewer shows a file as."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "drawer": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "dropdown": {
    "types": {
      "DropdownOption": {
        "kind": "interface",
        "definition": "interface DropdownOption {\n  /** Display label */\n  label: string;\n  /** Option value */\n  value: string;\n  /**\n   * CSS font-family stack to render this option's label in, so a typeface\n   * can preview itself in a font picker. Applies to the option row and to\n   * the closed trigger while the option is selected; omitted, the label\n   * keeps the theme's own face.\n   */\n  font?: string;\n  /**\n   * Icon drawn before the label, in the option row and on the closed\n   * trigger while the option is selected — Material Symbol name (string)\n   * or custom element (ReactNode).\n   */\n  icon?: string | React.ReactNode;\n  /** Whether this option is disabled */\n  disabled?: boolean;\n}"
      },
      "DropdownOptionGroup": {
        "kind": "interface",
        "definition": "interface DropdownOptionGroup {\n  /** Group heading */\n  label: string;\n  /** Options within the group */\n  options: DropdownOption[];\n}",
        "refs": [
          "DropdownOption"
        ]
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "dropdown-menu": {
    "types": {
      "DropdownMenuEntry": {
        "kind": "type",
        "definition": "type DropdownMenuEntry =\n  | DropdownMenuItem\n  | DropdownMenuSeparator\n  | DropdownMenuGroup;",
        "refs": [
          "DropdownMenuGroup",
          "DropdownMenuItem",
          "DropdownMenuSeparator"
        ]
      },
      "DropdownMenuGroup": {
        "kind": "interface",
        "definition": "interface DropdownMenuGroup {\n  type: 'group';\n  /** Section heading */\n  label: string;\n  /** Items within the group */\n  items: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry"
        ]
      },
      "DropdownMenuItem": {
        "kind": "interface",
        "definition": "interface DropdownMenuItem {\n  type?: 'item';\n  /** Display label */\n  label: string;\n  /** A line under the label, such as what the choice does or means. It wraps the row to two lines in the caption style; the icon stays centred on the pair. */\n  description?: string;\n  /** Keyboard shortcut hint as literal text (e.g. \"⇧ ⌘ P\"). `keys` writes it for the reader's platform instead. */\n  shortcut?: string;\n  /** Keyboard shortcut hint in the shortcut grammar (`mod+shift+p`), written for the reader's platform (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere) and announced through `aria-keyshortcuts`. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */\n  keys?: Shortcut;\n  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** A trailing icon after the label, such as `open_in_new` on an item that opens another site. Decorative: say what the item does in its label. A Material Symbol name (string) or a custom element (ReactNode). Ignored on an item that opens a sub-menu. */\n  iconRight?: string | React.ReactNode;\n  /** Disabled state */\n  disabled?: boolean;\n  /** Marks a dangerous or irreversible item (delete, remove…): it takes the destructive colour, with the error tint on hover and focus */\n  destructive?: boolean;\n  /** Marks the item as the current choice of a set: it holds the passive wash and a trailing check, and is announced as a checked radio item. Leave undefined on plain action items; pass `false` on the unchosen members of a set so they are announced as radio items too. Ignored on an item that opens a sub-menu. */\n  selected?: boolean;\n  /** Marks the item as one of a set picked independently: it leads with the checkbox's box, ticked when true, and is announced as a checkbox item. Leave undefined on plain action items. The host toggles it in `onClick`. Ignored on an item that opens a sub-menu. */\n  checked?: boolean;\n  /** Whether choosing the item closes the menu. Defaults to false for a checkbox item, so several can be toggled in one visit, and true for every other item. */\n  closeOnSelect?: boolean;\n  /** Click handler */\n  onClick?: () => void;\n  /** Nested sub-menu items */\n  children?: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry",
          "Shortcut"
        ]
      },
      "DropdownMenuSeparator": {
        "kind": "interface",
        "definition": "interface DropdownMenuSeparator {\n  type: 'separator';\n}"
      },
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "empty-state": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "entity-card": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "entity-switcher": {
    "types": {
      "AvatarFill": {
        "kind": "type",
        "definition": "type AvatarFill = 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "One of the six avatar fills, by token number (`--color-avatar-bg-*`)."
      },
      "EntitySwitcherItem": {
        "kind": "interface",
        "definition": "interface EntitySwitcherItem {\n  /** Unique across the whole tree; the value `value` and `onValueChange` carry. */\n  id: string;\n  /** The entity's name: the trigger's title and the row's label. */\n  name: string;\n  /** One line under the name. The trigger falls back to the entity's path when it is omitted. */\n  description?: string;\n  /** A logo or photo, by image URL, filling the mark's tile. Wins over `icon`. Decorative: the name carries the entity. */\n  logo?: string;\n  /** The mark when there is no `logo`: a Material Symbol name (string) or any element (ReactNode), such as an inline SVG logo. Initials stand in when both are omitted. */\n  icon?: string | React.ReactNode;\n  /** Which of Avatar's six fills the initials tile takes, so entities read apart at a glance. Only initials take it; a logo or icon keeps the plain tile. Plain when omitted. */\n  fill?: AvatarFill;\n  /** The entities under this one. Any child anywhere in the tree makes the list drill in. */\n  children?: EntitySwitcherItem[];\n  /** Whether the entity is shown but cannot be picked or opened. */\n  disabled?: boolean;\n}",
        "description": "One entity in the tree: a company, a business unit, a team, an advertiser, an account.",
        "refs": [
          "AvatarFill"
        ]
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "error-summary": {
    "types": {
      "ErrorSummaryError": {
        "kind": "type",
        "definition": "type ErrorSummaryError<Message = string> = {\n  /** The id of the control the error belongs to; the summary's link focuses it. */\n  id: string;\n  /** What is wrong, in words that say how to fix it. */\n  message: Message;\n};",
        "description": "One error ErrorSummary lists: the id of the control it belongs to, and what is wrong."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "event-calendar": {
    "types": {
      "EventCalendarColor": {
        "kind": "type",
        "definition": "type EventCalendarColor =\n  | 'neutral'\n  | 'coral'\n  | 'violet'\n  | 'cobalt'\n  | 'amber'\n  | 'gold'\n  | 'mint';"
      },
      "EventCalendarEvent": {
        "kind": "interface",
        "definition": "interface EventCalendarEvent {\n  /** Unique event identifier. */\n  id: string;\n  /** The day the event falls on (YYYY-MM-DD). */\n  date: string;\n  /** Short label shown in the event pill. */\n  title: string;\n  /** Start time as already-formatted text like \"09:30\". Untimed events sort first. */\n  time?: string;\n  /** Accent for the pill's dot, from the core accent roles. Defaults to `neutral`. */\n  color?: EventCalendarColor;\n}",
        "refs": [
          "EventCalendarColor"
        ]
      },
      "Weekday": {
        "kind": "type",
        "definition": "type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday."
      }
    },
    "externalTypes": {
      "Date": "typescript",
      "ReactNode": "react"
    }
  },
  "field": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "figure": {
    "types": {},
    "externalTypes": {
      "HTMLButtonElement": "typescript",
      "MouseEventHandler": "react",
      "ReactNode": "react"
    }
  },
  "file-input": {
    "types": {
      "FileInputFile": {
        "kind": "interface",
        "definition": "interface FileInputFile {\n  /** Stable identifier */\n  id: string;\n  /** File name shown in the list */\n  name: string;\n  /** Size in bytes — rendered human-readable */\n  size?: number;\n  /** Upload progress 0–100. Omit for files that are already stored. */\n  progress?: number;\n  /** Per-file error message — replaces the size line */\n  error?: string;\n}"
      }
    },
    "externalTypes": {
      "File": "typescript"
    }
  },
  "filter-bar": {
    "types": {
      "FilterBarFilter": {
        "kind": "interface",
        "definition": "interface FilterBarFilter {\n  /** Stable key for this filter — the key under which its values are reported. */\n  id: string;\n  /** Chip label, e.g. \"Status\". */\n  label: string;\n  /** Icon shown before the label — Material Symbol name (string) or custom element (ReactNode). */\n  icon?: string | React.ReactNode;\n  /** The choices this filter offers. */\n  options: FilterBarOption[];\n  /**\n   * Whether several options can be active at once. Defaults to true; set it\n   * to false for a single-select filter, which closes on choice.\n   */\n  multiple?: boolean;\n}",
        "description": "One filter: a chip on the bar with a popover of options behind it.",
        "refs": [
          "FilterBarOption"
        ]
      },
      "FilterBarOption": {
        "kind": "interface",
        "definition": "interface FilterBarOption {\n  /** Stored value, reported through `onValuesChange`. */\n  value: string;\n  /** Display label. */\n  label: string;\n}",
        "description": "One choice inside a filter's popover."
      }
    },
    "externalTypes": {
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "funnel-chart": {
    "types": {
      "FunnelStage": {
        "kind": "interface",
        "definition": "interface FunnelStage {\n  /** Stage name, shown beside the stage and read into the chart's accessible label. */\n  label: string;\n  /** Raw count for the stage — drives the stage's width as a share of the first stage. */\n  value: number;\n  /**\n   * Preformatted value (\"96.4K\") for the tooltip and the accessible label.\n   * Falls back to the raw `value`, locale-formatted.\n   */\n  displayValue?: string;\n}",
        "description": "One stage of the funnel, ordered widest first."
      }
    },
    "externalTypes": {}
  },
  "gantt-chart": {
    "types": {
      "GanttChartColor": {
        "kind": "type",
        "definition": "type GanttChartColor =\n  | 'neutral'\n  | 'coral'\n  | 'violet'\n  | 'cobalt'\n  | 'amber'\n  | 'gold'\n  | 'mint';",
        "description": "Accent roles a Gantt bar or milestone can take — the core accent vocabulary shared with EventCalendar."
      },
      "GanttChartItem": {
        "kind": "interface",
        "definition": "interface GanttChartItem {\n  /** Unique item identifier. Selection and the click callback key on it. */\n  id: string;\n  /** Task name, shown in the sticky label column. */\n  label: string;\n  /** First day of the bar (YYYY-MM-DD). */\n  start: string;\n  /** Last day of the bar, inclusive (YYYY-MM-DD). */\n  end: string;\n  /** Accent for the bar, from the core accent roles. Defaults to `neutral`. */\n  color?: GanttChartColor;\n  /** Completion from 0 to 100. When set, the bar shows a quiet track with the accent filling this share; without it the whole bar takes the accent. */\n  progress?: number;\n  /** Draws the bar as a dashed outline, for planned or tentative work whose dates are targets rather than commitments. */\n  projected?: boolean;\n  /** Group heading this item sits under. Items sharing a group render under one heading row; omit for a flat chart. */\n  group?: string;\n  /** Extra line appended to the bar's tooltip and accessible text, e.g. \"Target: Q4 2026\". */\n  detail?: string;\n}",
        "description": "One task bar on the timeline.",
        "refs": [
          "GanttChartColor"
        ]
      },
      "GanttChartMilestone": {
        "kind": "interface",
        "definition": "interface GanttChartMilestone {\n  /** Unique milestone identifier. */\n  id: string;\n  /** Milestone name, shown in the sticky label column. */\n  label: string;\n  /** The day the diamond sits on (YYYY-MM-DD). */\n  date: string;\n  /** Accent for the diamond, from the core accent roles. Defaults to `neutral`. */\n  color?: GanttChartColor;\n  /** Group heading this milestone sits under, matching the items' group labels. */\n  group?: string;\n}",
        "description": "A point-in-time marker on the timeline, drawn as a diamond on its own row.",
        "refs": [
          "GanttChartColor"
        ]
      }
    },
    "externalTypes": {}
  },
  "gauge": {
    "types": {
      "GaugeThreshold": {
        "kind": "interface",
        "definition": "interface GaugeThreshold {\n  /** Reading at which this tone takes over. */\n  value: number;\n  /** Tone applied from this reading upward. */\n  tone: 'accent' | 'positive' | 'warning' | 'error' | 'neutral';\n}",
        "description": "One colour switch point: at or above `value`, the dial takes `tone`."
      }
    },
    "externalTypes": {}
  },
  "globe": {
    "types": {
      "GlobeArc": {
        "kind": "interface",
        "definition": "interface GlobeArc {\n  /** `id` of the point the arc leaves. */\n  from: string;\n  /** `id` of the point the arc reaches. */\n  to: string;\n  /**\n   * Stroke colour, any CSS colour (`var(--color-chart-series-3)` works).\n   * Omit for the default cobalt-to-violet gradient along the arc.\n   */\n  color?: string;\n  /** How far the arc lifts off the surface at its midpoint, as a fraction of the radius. */\n  altitude?: number;\n}",
        "description": "A great-circle arc between two points."
      },
      "GlobePoint": {
        "kind": "interface",
        "definition": "interface GlobePoint {\n  /** Stable identifier, referenced by arcs and by `activePointId`. */\n  id: string;\n  /** Latitude in degrees, north positive. */\n  lat: number;\n  /** Longitude in degrees, east positive. */\n  lng: number;\n  /** Short label drawn beside the marker when `showLabels` is on. */\n  label?: string;\n  /**\n   * Marker glyph. `point` is a cross (something that moves or listens),\n   * `anchor` is a square (something fixed). The glyph is the only difference.\n   */\n  kind?: 'point' | 'anchor';\n  /**\n   * Marker colour, any CSS colour (`var(--color-status-warning-border)`\n   * works) — the same per-point channel WorldMap carries, so one dataset\n   * keys identically on both projections. Omit for the text-ramp default;\n   * a coloured marker keeps its colour on hover instead of brightening.\n   */\n  color?: string;\n}",
        "description": "A place on the globe."
      },
      "GlobeRotation": {
        "kind": "type",
        "definition": "type GlobeRotation = [number, number];",
        "description": "Where the globe is looking: `[longitude, latitude]` of the centre, in degrees."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "heading": {
    "types": {
      "HeadingTier": {
        "kind": "type",
        "definition": "type HeadingTier =\n  | 'mega-1'\n  | 'mega-2'\n  | 'display-1'\n  | 'display-2'\n  | 'sub-display'\n  | 'heading-1'\n  | 'heading-2'\n  | 'heading-3'\n  | 'title-body';",
        "description": "A heading type style, named as the type scale names it, from the largest."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "hover-card": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "input": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "inspector-dropdown": {
    "types": {
      "DropdownOption": {
        "kind": "interface",
        "definition": "interface DropdownOption {\n  /** Display label */\n  label: string;\n  /** Option value */\n  value: string;\n  /**\n   * CSS font-family stack to render this option's label in, so a typeface\n   * can preview itself in a font picker. Applies to the option row and to\n   * the closed trigger while the option is selected; omitted, the label\n   * keeps the theme's own face.\n   */\n  font?: string;\n  /**\n   * Icon drawn before the label, in the option row and on the closed\n   * trigger while the option is selected — Material Symbol name (string)\n   * or custom element (ReactNode).\n   */\n  icon?: string | React.ReactNode;\n  /** Whether this option is disabled */\n  disabled?: boolean;\n}"
      },
      "DropdownOptionGroup": {
        "kind": "interface",
        "definition": "interface DropdownOptionGroup {\n  /** Group heading */\n  label: string;\n  /** Options within the group */\n  options: DropdownOption[];\n}",
        "refs": [
          "DropdownOption"
        ]
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "inspector-section": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "inspector-segmented-control": {
    "types": {
      "InspectorSegment": {
        "kind": "interface",
        "definition": "interface InspectorSegment {\n  /** The value reported when this segment is chosen. */\n  value: string;\n  /** Visible text. */\n  label: string;\n  /** Takes this one choice out of the set. */\n  disabled?: boolean;\n}",
        "description": "One choice in an InspectorSegmentedControl."
      }
    },
    "externalTypes": {}
  },
  "instructions": {
    "types": {
      "InstructionStep": {
        "kind": "interface",
        "definition": "interface InstructionStep {\n  /** Step label/title */\n  label: string;\n  /** Optional step description */\n  description?: string;\n  /** Optional custom icon — Material Symbol name (string) or custom element (ReactNode); defaults to step number */\n  icon?: string | React.ReactNode;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "interrupt-card": {
    "types": {
      "InterruptCardAnsweredVariant": {
        "kind": "type",
        "definition": "type InterruptCardAnsweredVariant = 'positive' | 'error' | 'neutral';",
        "description": "The status an answered card records: an approval, a refusal, or neither."
      },
      "InterruptCardOption": {
        "kind": "interface",
        "definition": "interface InterruptCardOption {\n  /** Value passed to `onValueChange` when this option is chosen. */\n  value: string;\n  /** Button text, e.g. \"Allow once\". */\n  label: string;\n  /**\n   * Visual weight: `primary` for the recommended choice, `secondary` (the\n   * default) for the rest. `danger` is the legacy value from before colour\n   * moved onto `tone`, and renders as `variant=\"secondary\" tone=\"destructive\"`.\n   */\n  variant?: 'primary' | 'secondary' | 'danger';\n  /** Colour, passed to the option's Button: `destructive` for dangerous approvals. */\n  tone?: 'default' | 'destructive';\n  /**\n   * The status the answered card's read-out takes once this option is chosen.\n   * Defaults to `positive` for a `primary` option, `error` for a destructive\n   * one and `neutral` for the rest; set `error` on a refusal such as \"Deny\".\n   */\n  answeredVariant?: InterruptCardAnsweredVariant;\n  /**\n   * What the answered card's read-out says once this option is chosen,\n   * written as the decision made rather than the button pressed, e.g.\n   * \"Denied\" for \"Deny\". Defaults to `label`.\n   */\n  answeredLabel?: string;\n}",
        "description": "One choice the card offers, rendered as a Button in the options footer.",
        "refs": [
          "InterruptCardAnsweredVariant"
        ]
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "kbd": {
    "types": {
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "lightbox": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "line-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "LineSeriesConfig": {
        "kind": "interface",
        "definition": "interface LineSeriesConfig {\n  /** Key in data for this series */\n  dataKey: string;\n  /** Display name (shown in tooltip) */\n  label: string;\n  /** Line colour — CSS value */\n  color?: string;\n  /** Dashed line */\n  strokeDasharray?: string;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "link": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "link-list": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "LinkListItem": {
        "kind": "interface",
        "definition": "interface LinkListItem {\n  /** Link destination */\n  href: string;\n  /** Primary label — shown with the open_in_new icon */\n  label: string;\n  /** One or more subtitle lines shown below the label */\n  sub?: string | string[];\n  /** Path to a logo image (preferred over icon when both are set) */\n  logo?: string;\n  /** Alt text for the logo — defaults to empty string (decorative) */\n  logoAlt?: string;\n  /** Icon used when no logo is provided — Material Symbol name (string, e.g. \"emoji_events\") or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** Open in a new tab. Defaults to true; set false for links inside the same site, which swaps the open_in_new indicator for arrow_forward. */\n  newTab?: boolean;\n}"
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "list": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "map-callout": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "map-legend": {
    "types": {
      "MapLegendItem": {
        "kind": "interface",
        "definition": "interface MapLegendItem {\n  /**\n   * The marker the row explains. `point` and `anchor` draw Globe's cross and\n   * square; `arc` draws a short stroke of the arc gradient; a `line` is a flat\n   * rule in `color`; any React node renders as given.\n   */\n  glyph: 'point' | 'anchor' | 'arc' | 'line' | React.ReactNode;\n  /** What the marker means. */\n  label: React.ReactNode;\n  /** Colour for the `line` glyph (and the `arc` glyph, replacing its gradient). Any CSS colour. */\n  color?: string;\n}",
        "description": "One row of the key."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "masked-input": {
    "types": {
      "Mask": {
        "kind": "type",
        "definition": "type Mask = string | ((raw: string) => string);",
        "description": "A pattern string, or a function from the raw characters to the shown text."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "mega-menu": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "MegaMenuItem": {
        "kind": "interface",
        "definition": "interface MegaMenuItem {\n  /** Where the row links. */\n  href: string;\n  /** The page's name. */\n  label: string;\n  /** One line on what the page holds, clamped to two lines in the panel. */\n  description?: string;\n  /** A Material Symbols name drawn in the row's icon tile. */\n  icon?: string;\n  /** An image path drawn in the icon tile instead of `icon`, for a brand or product mark. */\n  logo?: string;\n}",
        "description": "One link row in a mega menu: a page and the line that says what is on it."
      },
      "MegaMenuShowcase": {
        "kind": "interface",
        "definition": "interface MegaMenuShowcase {\n  /** Where the card links. */\n  href: string;\n  /** A short kicker above the title, set in the overline face. */\n  overline?: string;\n  /** The card's title, followed by a forward arrow. */\n  label: string;\n  /** One or two lines under the title. */\n  description?: string;\n  /**\n   * A drawing that fills the card behind the copy. Decorative: the title and\n   * description carry the meaning, so mark it `aria-hidden`.\n   */\n  cover?: React.ReactNode;\n}",
        "description": "The featured card beside a mega menu's link grid: one link that is the whole card."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "mention": {
    "types": {
      "MentionItem": {
        "kind": "type",
        "definition": "type MentionItem = {\n  /** Stable identity, unique within its source. */\n  id: string;\n  /** The name shown in the menu and written into the text after the trigger character. */\n  label: string;\n  /** A quieter second phrase on the same row: a role, a path, what a skill does. */\n  description?: string;\n  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */\n  icon?: string | React.ReactNode;\n  /** Extra words the filter matches on besides the label. */\n  keywords?: string[];\n  /** Listed but not choosable. */\n  disabled?: boolean;\n};",
        "description": "One thing a person can reference: a teammate, a file, a skill."
      },
      "MentionSource": {
        "kind": "type",
        "definition": "type MentionSource = {\n  /** The single character that opens this source. */\n  trigger: string;\n  /** The items it offers. */\n  items: MentionItem[];\n  /** Accessible name for this source's menu (\"People\", \"Skills\"). */\n  label?: string;\n};",
        "description": "Everything one trigger character opens: `@` for entities, `/` for skills.",
        "refs": [
          "MentionItem"
        ]
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "message-actions": {
    "types": {
      "MessageAction": {
        "kind": "interface",
        "definition": "interface MessageAction {\n  /** Stable identifier passed to `onActionClick`. */\n  id: string;\n  /** Button glyph — Material Symbol name (string) or custom element (ReactNode). */\n  icon: string | React.ReactNode;\n  /** Accessible name, also shown as the tooltip. */\n  label: string;\n  /** Marks the action as selected, e.g. the chosen feedback thumb. */\n  active?: boolean;\n  /** Disables just this action. */\n  disabled?: boolean;\n  /** Marks a dangerous or irreversible action, e.g. deleting the message: it rests like its neighbours and takes the danger colour on hover. */\n  destructive?: boolean;\n}",
        "description": "One action in the row: a stable id, a glyph, and an accessible name."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "message-card": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "model-picker": {
    "types": {
      "ModelPickerEffortOption": {
        "kind": "interface",
        "definition": "interface ModelPickerEffortOption {\n  /** Display label, e.g. \"Medium\". */\n  label: string;\n  /** Stable identifier reported through `onEffortChange`. */\n  value: string;\n}"
      },
      "ModelPickerModel": {
        "kind": "interface",
        "definition": "interface ModelPickerModel {\n  /** Display name, e.g. \"Fable 5\". */\n  label: string;\n  /** Stable identifier reported through `onValueChange`. */\n  value: string;\n  /** One line on what the model is good at or how fast it is. */\n  description?: string;\n  /** Small trailing tag, e.g. \"New\". */\n  badge?: string;\n  /** Whether this model can be chosen. */\n  disabled?: boolean;\n}"
      }
    },
    "externalTypes": {}
  },
  "nav": {
    "types": {
      "ButtonGroupProps": {
        "kind": "component-props",
        "component": "ButtonGroup",
        "see": "get_component(\"ButtonGroup\")"
      },
      "ButtonProps": {
        "kind": "component-props",
        "component": "Button",
        "see": "get_component(\"Button\")"
      }
    },
    "externalTypes": {
      "Array": "typescript",
      "ReactNode": "react"
    }
  },
  "nav-list": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "NavListItem": {
        "kind": "interface",
        "definition": "interface NavListItem {\n  /** Row text. */\n  label: string;\n  /** Link destination — every row is a real link. */\n  href: string;\n  /** Stable identity for expansion state and aria wiring. Defaults to `href`. */\n  id?: string;\n  /** Child rows, indented one level. Nesting is supported three levels deep. */\n  items?: NavListItem[];\n  /**\n   * When false, an item with children renders no toggle and its children stay\n   * visible — a permanent group rather than a collapsible section.\n   */\n  collapsible?: boolean;\n  /**\n   * Forces the current-page treatment on this row regardless of the exact\n   * match against `currentHref` — for prefix-matched sections that should\n   * stay current on their child routes.\n   */\n  current?: boolean;\n}"
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "HTMLElement": "typescript",
      "MouseEvent": "react"
    }
  },
  "notification-center": {
    "types": {
      "EmptyStateProps": {
        "kind": "component-props",
        "component": "EmptyState",
        "see": "get_component(\"EmptyState\")"
      },
      "NotificationCenterTab": {
        "kind": "interface",
        "definition": "interface NotificationCenterTab {\n  /** Display label */\n  label: string;\n  /** Unique tab identifier */\n  value: string;\n  /** Count shown beside the label, e.g. the number of notifications in this filter. */\n  count?: number;\n}"
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "Pick": "typescript",
      "ReactNode": "react"
    }
  },
  "panel": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "pie-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "PieSlice": {
        "kind": "interface",
        "definition": "interface PieSlice {\n  /** Display name */\n  name: string;\n  /** Numeric value */\n  value: number;\n  /** Slice fill colour */\n  color?: string;\n}"
      }
    },
    "externalTypes": {}
  },
  "pixel-avatar": {
    "types": {
      "PixelInk": {
        "kind": "type",
        "definition": "type PixelInk = 1 | 2 | 3 | 4 | 5 | 6;",
        "description": "One of the six pixel inks, by token number."
      }
    },
    "externalTypes": {}
  },
  "popover": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "prompt-suggestions": {
    "types": {
      "PromptSuggestion": {
        "kind": "interface",
        "definition": "interface PromptSuggestion {\n  /** Stable identifier passed to `onValueChange`. */\n  id: string;\n  /** The suggestion text shown in the chip. */\n  label: string;\n  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */\n  icon?: string | React.ReactNode;\n  /** A quiet second line under the label, drawn by the `tiles` and `cards` layouts: what the tile leads to, or the full question a card asks. The chip layouts have no room for it and leave it out. */\n  description?: string;\n}",
        "description": "One tappable suggestion in the row."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "prose": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "question-card": {
    "types": {
      "QuestionCardAnswer": {
        "kind": "interface",
        "definition": "interface QuestionCardAnswer {\n  /** The `id` of the question answered. */\n  questionId: string;\n  /** The `value` of every option picked, in the options' order. */\n  values: string[];\n  /** The text written in the \"Something else\" field, when it was used. */\n  other?: string;\n}",
        "description": "What the person answered to one question."
      },
      "QuestionCardLabels": {
        "kind": "interface",
        "definition": "interface QuestionCardLabels {\n  /** The last row's label when `other` is set. */\n  other: string;\n  /** The placeholder of the field that row opens. */\n  otherPlaceholder: string;\n  /** The button that sends the answers. */\n  submit: string;\n  /** The button that moves to the next question in a set. */\n  next: string;\n  /** The button that moves back a question in a set. */\n  back: string;\n  /** The button that declines to answer, shown when `onSkip` is passed. */\n  skip: string;\n  /** The line an answered-by-skipping card shows. */\n  skipped: string;\n  /** The line a card shows when the moment to answer passed. */\n  unanswered: string;\n  /** The step count beside a set's heading. */\n  step: (current: number, total: number) => string;\n  /** The line above a one-answer question's options. */\n  chooseOne: string;\n  /** The line above a several-answer question's options, from its `min` and `max`. */\n  chooseMany: (min: number, max: number, total: number) => string;\n  /** Visually hidden text read after each picked option in the answered record. Defaults to \"(chosen)\". */\n  chosen?: string;\n}",
        "description": "Every word the card draws itself, for a host writing in another voice or language."
      },
      "QuestionCardOption": {
        "kind": "interface",
        "definition": "interface QuestionCardOption {\n  /** Stable identifier reported in the answer's `values`. */\n  value: string;\n  /** The answer as the person would say it, e.g. \"Next.js\". One line. */\n  label: string;\n  /** A quiet second line under the label: what choosing it means. */\n  description?: string;\n}",
        "description": "One answer a question offers."
      },
      "QuestionCardQuestion": {
        "kind": "interface",
        "definition": "interface QuestionCardQuestion {\n  /** Stable identifier reported in the answer's `questionId`. */\n  id: string;\n  /** The question in a few words, e.g. \"Which framework?\". Shown as the step's heading in a set, and the options' accessible name always. */\n  prompt: string;\n  /** `single` takes one option, `multi` any number of them. */\n  mode?: 'single' | 'multi';\n  /** The answers on offer, in order. */\n  options: QuestionCardOption[];\n  /** Offer a last \"Something else\" row that opens a text field, for an answer the options do not hold. */\n  other?: boolean;\n  /** `multi` only: the fewest options that make an answer. Defaults to 1. */\n  min?: number;\n  /** `multi` only: the most options that can be picked. Defaults to all of them. */\n  max?: number;\n}",
        "description": "One question the card asks.",
        "refs": [
          "QuestionCardOption"
        ]
      },
      "QuestionSummaryItem": {
        "kind": "interface",
        "definition": "interface QuestionSummaryItem {\n  /** The question, as it was asked. */\n  prompt: string;\n  /** Every answer given, as the person would say each one. Empty when none was. */\n  answers: string[];\n}",
        "description": "One question in a summary, and what was answered to it."
      }
    },
    "externalTypes": {
      "Partial": "typescript"
    }
  },
  "quote": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "radar-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "RadarSeriesConfig": {
        "kind": "interface",
        "definition": "interface RadarSeriesConfig {\n  /** Key in data for this series */\n  dataKey: string;\n  /** Display name (shown in tooltip and legend) */\n  label: string;\n  /** Fill / stroke colour — CSS value */\n  color?: string;\n  /** Fill opacity (0–1) */\n  fillOpacity?: number;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "radial-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "RadialDataItem": {
        "kind": "interface",
        "definition": "interface RadialDataItem {\n  /** Display name */\n  name: string;\n  /** Numeric value */\n  value: number;\n  /** Ring fill colour */\n  color?: string;\n}"
      }
    },
    "externalTypes": {}
  },
  "rating": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "reasoning": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "rich-dropdown": {
    "types": {
      "RichDropdownOption": {
        "kind": "interface",
        "definition": "interface RichDropdownOption {\n  /** Display name of the option, rendered in its own heading face. */\n  label: string;\n  /** Stable identifier reported through `onValueChange`. */\n  value: string;\n  /**\n   * CSS font-family stack this option's headings use — the option name\n   * renders in it. Falls back to the theme's heading face when omitted.\n   */\n  headingFont?: string;\n  /**\n   * CSS font-family stack this option's body text uses — the detail line\n   * renders in it. Falls back to the theme's body face when omitted.\n   */\n  bodyFont?: string;\n  /** Key colour shown as the option's swatch dot — any valid CSS colour. */\n  color?: string;\n  /**\n   * Corner radius for the swatch, so the dot can carry the option's corner\n   * language too — a sharp-cornered look gets a square swatch. Any CSS\n   * radius value (`'0px'`, `'4px'`); the default is a full circle.\n   */\n  swatchRadius?: string;\n  /** One-line supporting text, typically the font pairing's names. */\n  description?: string;\n  /** Whether this option can be chosen. */\n  disabled?: boolean;\n}"
      }
    },
    "externalTypes": {}
  },
  "scatter-chart": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "ScatterDatasetConfig": {
        "kind": "interface",
        "definition": "interface ScatterDatasetConfig {\n  /** Display name for this dataset (shown in tooltip and legend) */\n  name: string;\n  /** Array of data points */\n  data: Record<string, unknown>[];\n  /** Fill colour */\n  color?: string;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "section-title": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "segmented-control": {
    "types": {
      "Segment": {
        "kind": "interface",
        "definition": "interface Segment {\n  /** Unique value for this segment */\n  value: string;\n  /** Display label */\n  label: string;\n  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** Whether disabled */\n  disabled?: boolean;\n  /** The id of the `role=\"tabpanel\"` element this segment shows, written as its `aria-controls`. The consumer renders the panels. */\n  panelId?: string;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "selection-card": {
    "types": {
      "SelectionCardOption": {
        "kind": "interface",
        "definition": "interface SelectionCardOption {\n  /** Unique value for this option */\n  value: string;\n  /** Primary label */\n  label: string;\n  /** Optional description text below the label */\n  description?: string;\n  /** Whether this option is disabled */\n  disabled?: boolean;\n}"
      }
    },
    "externalTypes": {}
  },
  "shader-field": {
    "types": {
      "ShaderBlob": {
        "kind": "interface",
        "definition": "interface ShaderBlob {\n  /**\n   * Semantic colour token, read from the canvas's computed style at runtime,\n   * so the field re-themes with `data-theme` and with any scoped custom-\n   * property override. A token nothing defines resolves to no colour — an\n   * invisible source, never an error.\n   */\n  token: string;\n  /** Disc diameter in container-width units. */\n  size: number;\n  /** Centre offset from the container centre, width units. */\n  cx: number;\n  /** Centre offset from the container centre, width units. */\n  cy: number;\n  /** Drift cycle in seconds, before `speed` is applied. */\n  period: number;\n  /** Phase offset, so sources never move in lockstep. */\n  phase: number;\n  /**\n   * Emission weight. Positive emits light; negative absorbs it, giving a\n   * shadow that occludes whatever shines behind it.\n   */\n  weight: number;\n}",
        "description": "One light source in the field.\n\nThe coordinate space is the shader's (see field.glsl): origin at the\ncontainer centre, one unit = container width, y running downward. Centres\nare constants — nothing here is recomputed on resize."
      },
      "ShaderFieldStatus": {
        "kind": "type",
        "definition": "type ShaderFieldStatus = 'pending' | 'active' | 'unavailable';",
        "description": "How the renderer has resolved.\n\n`pending` is the one that matters to a caller: the context is still coming\nup, so neither the field nor a fallback should be painted yet — showing a\nfallback here and swapping it a frame later reads as two backgrounds loading\nin sequence."
      },
      "ShaderParams": {
        "kind": "interface",
        "definition": "interface ShaderParams {\n  /** Overall opacity of the field, 0.1–1. */\n  intensity: number;\n  /** Domain-warp strength: how much fbm noise bends the field, 0–0.5. */\n  warp: number;\n  /** Noise frequency. Higher values give finer, busier structure, 0.5–6. */\n  scale: number;\n  /** Drift-rate multiplier on every blob's period, 0–4. */\n  speed: number;\n  /** Dither/film-grain amplitude, 0–0.4. Also what kills 8-bit banding. */\n  grain: number;\n  /** Anisotropic stretch: 0 renders discs, 1 renders diagonal streams, 0–1. */\n  streak: number;\n  /**\n   * Cursor-wake strength, 0–1. Defaults to 0 — the interaction is built and\n   * dormant, not absent. Raising it turns on the swirl and glow trail, and\n   * with them the loop's step up from 30fps to 60fps while a wake is alive.\n   */\n  react: number;\n  /**\n   * How much the composition resists shrinking with the container, 0–1.\n   *\n   * At 0 — the behaviour a CSS blob layer has — the whole\n   * field is fitted to whatever width it is given, so a phone shows the\n   * entire composition at phone scale: every source small, and more of them\n   * crowded into view than the look was built for. At 1 the field holds the\n   * scale it was composed at (`REFERENCE_WIDTH`) and a narrower container\n   * crops into it instead. Values between blend the two geometrically,\n   * keeping some of the shrink so colours still bleed together on a small\n   * screen. Above the reference width it does nothing.\n   *\n   * The default sits between the two, which suits a full-viewport background,\n   * read on a phone as a scene rather than a diagram; set it to 0 wherever\n   * the point is to see the whole composition, such as a small demo tile.\n   */\n  crop: number;\n}",
        "description": "The eight tuneable properties of the field."
      }
    },
    "externalTypes": {
      "Partial": "typescript"
    }
  },
  "shader-scene": {
    "types": {
      "ShaderSceneId": {
        "kind": "type",
        "definition": "type ShaderSceneId = 'horizon' | 'rift' | 'glyphs' | 'prism' | 'meteors' | 'waves' | 'aurora';",
        "description": "The scenes ShaderScene paints."
      },
      "ShaderScenePassSetting": {
        "kind": "type",
        "definition": "type ShaderScenePassSetting = {\n  /** Run the pass. Each pass has its own default. */\n  on?: boolean;\n  /** The pass's settings, merged over its defaults. */\n  params?: Partial<Record<string, number>>;\n};",
        "description": "One finishing pass's setting: whether it runs, and its own settings."
      },
      "ShaderSceneStatus": {
        "kind": "type",
        "definition": "type ShaderSceneStatus = 'pending' | 'active' | 'unavailable';",
        "description": "How the scene resolved, the same three states ShaderField reports.\n`pending` while the GL context comes up (bounded by a watchdog), `active`\nonce a frame has painted, `unavailable` when it is disabled or WebGL2\ncannot run it."
      },
      "Values": {
        "kind": "type",
        "definition": "type Values = {\n  speed: number;\n  scene: Record<string, number>;\n  passes: Record<string, { on: boolean; params: Record<string, number> }>;\n};",
        "description": "What the canvas reads every frame. A ref holds it, so a drag never renders."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "Record": "typescript",
      "RefObject": "react"
    }
  },
  "sidebar-panel": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "SidebarPanelItem": {
        "kind": "interface",
        "definition": "interface SidebarPanelItem {\n  /** Unique key for this item */\n  key: string;\n  /** Display label */\n  label: string;\n  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */\n  href?: string;\n  /** Click handler — also fires on a link item, so a consumer can route client-side */\n  onClick?: () => void;\n  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */\n  badge?: string | number;\n  /** Group heading this item sits under; consecutive items sharing a group render beneath one heading */\n  group?: string;\n  /** Nested items — turns this row into an accordion. One level deep: grandchildren are not rendered */\n  children?: SidebarPanelItem[];\n}"
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react"
    }
  },
  "signature-pad": {
    "types": {
      "SignatureValue": {
        "kind": "type",
        "definition": "type SignatureValue = {\n  /** Whether it was drawn or typed. */\n  kind: 'drawn' | 'typed';\n  /** The signature as a standalone SVG document in `currentColor`, so it scales and prints. */\n  svg: string;\n  /** The typed name, for a typed signature. */\n  text?: string;\n  /** Renders the signature to a PNG on demand, at twice its size. */\n  png: () => Promise<Blob>;\n};",
        "description": "A signature as the pad hands it over."
      }
    },
    "externalTypes": {
      "Blob": "typescript",
      "Promise": "typescript",
      "ReactNode": "react"
    }
  },
  "site-header": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "MegaMenuItem": {
        "kind": "interface",
        "definition": "interface MegaMenuItem {\n  /** Where the row links. */\n  href: string;\n  /** The page's name. */\n  label: string;\n  /** One line on what the page holds, clamped to two lines in the panel. */\n  description?: string;\n  /** A Material Symbols name drawn in the row's icon tile. */\n  icon?: string;\n  /** An image path drawn in the icon tile instead of `icon`, for a brand or product mark. */\n  logo?: string;\n}",
        "description": "One link row in a mega menu: a page and the line that says what is on it."
      },
      "MegaMenuShowcase": {
        "kind": "interface",
        "definition": "interface MegaMenuShowcase {\n  /** Where the card links. */\n  href: string;\n  /** A short kicker above the title, set in the overline face. */\n  overline?: string;\n  /** The card's title, followed by a forward arrow. */\n  label: string;\n  /** One or two lines under the title. */\n  description?: string;\n  /**\n   * A drawing that fills the card behind the copy. Decorative: the title and\n   * description carry the meaning, so mark it `aria-hidden`.\n   */\n  cover?: React.ReactNode;\n}",
        "description": "The featured card beside a mega menu's link grid: one link that is the whole card."
      },
      "SiteHeaderSection": {
        "kind": "interface",
        "definition": "interface SiteHeaderSection {\n  /** A stable key for the section. */\n  id: string;\n  /** The pill's text. */\n  label: string;\n  /** The section's landing page: where a click on the pill goes. */\n  href: string;\n  /**\n   * A mega menu for the section. Hovering or focusing the pill opens it; its\n   * items are also the section's sub-list in the drawer.\n   */\n  mega?: {\n    /** The panel's link rows. */\n    items: MegaMenuItem[];\n    /** A featured card beside the rows. */\n    showcase?: MegaMenuShowcase;\n  };\n  /**\n   * The section's sub-list in the drawer, when it should differ from its\n   * menu's items: a page that needs a wide screen, say, left out of the\n   * drawer that only narrow screens see. Defaults to the menu's items.\n   */\n  drawerItems?: { href: string; label: string }[];\n  /**\n   * Marks the section as the one being viewed. Left unset, the header works\n   * it out from `currentHref`: the section's own page, a page under it, or\n   * any page its menu lists.\n   */\n  current?: boolean;\n}",
        "description": "One top-level section of the site: a pill in the bar, a row in the drawer.",
        "refs": [
          "MegaMenuItem",
          "MegaMenuShowcase"
        ]
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "source-chip": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "source-trail": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "SourceTrailItem": {
        "kind": "interface",
        "definition": "interface SourceTrailItem {\n  /** The source name, passed through to the row's SourceChip. */\n  title: string;\n  /** Optional link to the source — the chip renders as an anchor. */\n  href?: string;\n  /** Leading icon for the chip — a Material Symbol name (string) or custom element (ReactNode). */\n  icon?: string | React.ReactNode;\n  /** Where the visit has got to. Drives the row's indicator; defaults to done. */\n  status?: SourceTrailStatus;\n  /** Supporting line, e.g. what the source contributed to the answer. */\n  detail?: string;\n}",
        "description": "One source the agent opened while answering.",
        "refs": [
          "SourceTrailStatus"
        ]
      },
      "SourceTrailStatus": {
        "kind": "type",
        "definition": "type SourceTrailStatus = 'pending' | 'active' | 'done';"
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "split-button": {
    "types": {
      "DropdownMenuEntry": {
        "kind": "type",
        "definition": "type DropdownMenuEntry =\n  | DropdownMenuItem\n  | DropdownMenuSeparator\n  | DropdownMenuGroup;",
        "refs": [
          "DropdownMenuGroup",
          "DropdownMenuItem",
          "DropdownMenuSeparator"
        ]
      },
      "DropdownMenuGroup": {
        "kind": "interface",
        "definition": "interface DropdownMenuGroup {\n  type: 'group';\n  /** Section heading */\n  label: string;\n  /** Items within the group */\n  items: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry"
        ]
      },
      "DropdownMenuItem": {
        "kind": "interface",
        "definition": "interface DropdownMenuItem {\n  type?: 'item';\n  /** Display label */\n  label: string;\n  /** A line under the label, such as what the choice does or means. It wraps the row to two lines in the caption style; the icon stays centred on the pair. */\n  description?: string;\n  /** Keyboard shortcut hint as literal text (e.g. \"⇧ ⌘ P\"). `keys` writes it for the reader's platform instead. */\n  shortcut?: string;\n  /** Keyboard shortcut hint in the shortcut grammar (`mod+shift+p`), written for the reader's platform (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere) and announced through `aria-keyshortcuts`. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */\n  keys?: Shortcut;\n  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** A trailing icon after the label, such as `open_in_new` on an item that opens another site. Decorative: say what the item does in its label. A Material Symbol name (string) or a custom element (ReactNode). Ignored on an item that opens a sub-menu. */\n  iconRight?: string | React.ReactNode;\n  /** Disabled state */\n  disabled?: boolean;\n  /** Marks a dangerous or irreversible item (delete, remove…): it takes the destructive colour, with the error tint on hover and focus */\n  destructive?: boolean;\n  /** Marks the item as the current choice of a set: it holds the passive wash and a trailing check, and is announced as a checked radio item. Leave undefined on plain action items; pass `false` on the unchosen members of a set so they are announced as radio items too. Ignored on an item that opens a sub-menu. */\n  selected?: boolean;\n  /** Marks the item as one of a set picked independently: it leads with the checkbox's box, ticked when true, and is announced as a checkbox item. Leave undefined on plain action items. The host toggles it in `onClick`. Ignored on an item that opens a sub-menu. */\n  checked?: boolean;\n  /** Whether choosing the item closes the menu. Defaults to false for a checkbox item, so several can be toggled in one visit, and true for every other item. */\n  closeOnSelect?: boolean;\n  /** Click handler */\n  onClick?: () => void;\n  /** Nested sub-menu items */\n  children?: DropdownMenuEntry[];\n}",
        "refs": [
          "DropdownMenuEntry",
          "Shortcut"
        ]
      },
      "DropdownMenuSeparator": {
        "kind": "interface",
        "definition": "interface DropdownMenuSeparator {\n  type: 'separator';\n}"
      },
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      }
    },
    "externalTypes": {
      "HTMLButtonElement": "typescript",
      "MouseEventHandler": "react",
      "ReactNode": "react"
    }
  },
  "split-pane": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "stacked-bar-chart": {
    "types": {
      "BarSeriesConfig": {
        "kind": "interface",
        "definition": "interface BarSeriesConfig {\n  /** Key in data for this series */\n  dataKey: string;\n  /** Display name (shown in tooltip & legend) */\n  label: string;\n  /** Bar fill colour */\n  color?: string;\n}"
      },
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      }
    },
    "externalTypes": {
      "Record": "typescript"
    }
  },
  "stat": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "stepper": {
    "types": {
      "StepperStep": {
        "kind": "type",
        "definition": "type StepperStep = {\n  /** Step label shown beside or below the indicator */\n  label: string;\n  /** Optional supporting line rendered under the label */\n  description?: string;\n};",
        "description": "A single step in a Stepper flow."
      }
    },
    "externalTypes": {}
  },
  "table": {
    "types": {
      "TableColumn": {
        "kind": "interface",
        "definition": "interface TableColumn {\n  /** Unique column identifier, used as the key into each row's cells */\n  key: string;\n  /** Header label displayed in the column header */\n  header: React.ReactNode;\n  /** Optional column width (CSS value like '200px', '30%', 'auto') */\n  width?: string;\n  /** Text alignment for cells in this column. `start` (the default) and `end` follow the reading direction, so a number column set to `end` sits right in English and left in Arabic; `left` and `right` are screen sides. */\n  align?: 'start' | 'center' | 'end' | 'left' | 'right';\n  /** The column's current sort, the direction DataTable's sorts use, set as `aria-sort` on its header so a screen reader announces it while reading the column. Leave unset on unsorted columns. */\n  sort?: 'asc' | 'desc';\n  /** Whether this column names each row. Its cells render as row headers (`<th scope=\"row\">`), so moving along a row announces which record it is. */\n  rowHeader?: boolean;\n}"
      },
      "TableRow": {
        "kind": "interface",
        "definition": "interface TableRow {\n  /** Unique row identifier */\n  id: string;\n  /** Cell values keyed by column key — each accepts any React node */\n  cells: Record<string, React.ReactNode>;\n  /** Whether the row is selected, drawn with the table's selected-row tint. */\n  selected?: boolean;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "table-toolbar": {
    "types": {
      "DataTableFilter": {
        "kind": "type",
        "definition": "type DataTableFilter = Filter;",
        "description": "One filter condition on one column, as the table and TableToolbar share it.",
        "refs": [
          "Filter"
        ]
      },
      "DataTableFilterLabels": {
        "kind": "type",
        "definition": "type DataTableFilterLabels = FilterLabels;",
        "description": "Every word a filter shows or announces, each defaulting to English.",
        "refs": [
          "FilterLabels"
        ]
      },
      "DataTableSort": {
        "kind": "interface",
        "definition": "interface DataTableSort {\n  /** The column being sorted. */\n  key: string;\n  /** Sort direction. */\n  direction: 'asc' | 'desc';\n}"
      },
      "DataTableView": {
        "kind": "type",
        "definition": "type DataTableView = TableView;",
        "description": "One saved setup of a table: its sorts, filters, search, columns, pinning, widths, grouping, density and page size. Selection, the page and open details are the session, never part of a view.",
        "refs": [
          "TableView"
        ]
      },
      "Filter": {
        "kind": "interface",
        "definition": "interface Filter {\n  /** Stable id, so a chip and its editor keep their place while the value changes. */\n  id: string;\n  /** The column's key. */\n  column: string;\n  /** How the value is compared. */\n  operator: FilterOperator;\n  /** What it is compared with; missing until it is picked. */\n  value?: FilterValue;\n}",
        "description": "One condition on one column.",
        "refs": [
          "FilterOperator",
          "FilterValue"
        ]
      },
      "FilterKind": {
        "kind": "type",
        "definition": "type FilterKind = 'text' | 'number' | 'date' | 'enum' | 'tags' | 'boolean';",
        "description": "The kinds of filter, each with its own operators. A typed column's kind follows its type; an untyped one's is read from its values."
      },
      "FilterLabels": {
        "kind": "interface",
        "definition": "interface FilterLabels {\n  /** An operator as a chip and the operator menu read it. */\n  operators: Record<FilterOperator, string>;\n  /** The toolbar's button that adds a filter. */\n  addFilter: string;\n  /** The editor's name, given the column's header. */\n  editor: (header: string) => string;\n  /** The operator field's name. */\n  operatorField: string;\n  /** The value field's name, given the column's header. */\n  valueField: (header: string) => string;\n  /** The first value of a `between`. */\n  from: string;\n  /** The second value of a `between`. */\n  to: string;\n  /** Placeholder and name of the search field over a list filter's choices. */\n  searchChoices: string;\n  /** Shown when the search matches none of a list filter's choices. */\n  noChoices: string;\n  /** Removes one filter, given its chip's text. */\n  remove: (chip: string) => string;\n  /** Removes every filter. */\n  clearAll: string;\n  /** A chip's placeholder for a value not picked yet. */\n  noValue: string;\n  /** Joins the two ends of a `between` on a chip. */\n  and: string;\n  /** Joins two or more chosen values on a chip, given how many past the first. */\n  more: (count: number) => string;\n  /** The header menu item that opens a column's filter. */\n  filterColumn: string;\n  /** Name of a filtered header's mark, given the header. */\n  filtered: (header: string) => string;\n  /** Announced when the filters change, given the rows that match. */\n  filteredAnnouncement: (count: number) => string;\n}",
        "description": "Every word a filter shows or announces, each defaulting to English.",
        "refs": [
          "FilterOperator"
        ]
      },
      "FilterOperator": {
        "kind": "type",
        "definition": "type FilterOperator =\n  | 'contains'\n  | 'notContains'\n  | 'is'\n  | 'isNot'\n  | 'startsWith'\n  | 'endsWith'\n  | 'eq'\n  | 'neq'\n  | 'lt'\n  | 'lte'\n  | 'gt'\n  | 'gte'\n  | 'between'\n  | 'before'\n  | 'after'\n  | 'isAnyOf'\n  | 'isNoneOf'\n  | 'hasAnyOf'\n  | 'hasAllOf'\n  | 'hasNoneOf'\n  | 'isEmpty'\n  | 'isNotEmpty'\n  | 'isChecked'\n  | 'isNotChecked';",
        "description": "Every operator, across the kinds."
      },
      "FilterValue": {
        "kind": "type",
        "definition": "type FilterValue = string | number | [number | string | null, number | string | null] | string[] | null | undefined;",
        "description": "A filter's value: text or a date for one-value operators, a number, a pair for `between`, a list for the set operators."
      },
      "TableToolbarAction": {
        "kind": "interface",
        "definition": "interface TableToolbarAction {\n  /** Stable id for the action. */\n  id: string;\n  /** What the action does, as its label (and its name and tooltip when the bar folds it to an icon). */\n  label: string;\n  /** Material Symbol name (string) or custom element; the folded bar's primary icon. Defaults to `add` there. */\n  icon?: React.ReactNode;\n  /** Runs the action. */\n  onSelect: () => void;\n  /** Whether the action is unavailable. */\n  disabled?: boolean;\n  /** On the primary action, the further actions its split button's menu offers (Import, a template); folded, they move into the More panel. */\n  menu?: TableToolbarAction[];\n}",
        "description": "One of the bar's own actions: its primary action, or a secondary one beside it."
      },
      "TableToolbarBulkAction": {
        "kind": "interface",
        "definition": "interface TableToolbarBulkAction {\n  /** Stable id for the action. */\n  id: string;\n  /** What the action does, as its menu label. */\n  label: string;\n  /** Material Symbol name (string) or custom element. */\n  icon?: React.ReactNode;\n  /** Runs the action on the selection. */\n  onSelect: (selection: TableToolbarSelection) => void;\n  /** Marks a dangerous or irreversible action: drawn in the destructive colour and set apart at the bar's end. */\n  destructive?: boolean;\n  /** Whether the action is unavailable. */\n  disabled?: boolean;\n}",
        "description": "One action the bulk bar offers for the selected rows.",
        "refs": [
          "TableToolbarSelection"
        ]
      },
      "TableToolbarColumn": {
        "kind": "interface",
        "definition": "interface TableToolbarColumn {\n  /** The column's key. */\n  key: string;\n  /** Its header text. */\n  label: string;\n  /** How it filters: `text`, `number`, `date`, `enum` (choices) or `tags`. Defaults to `text`, or `enum` when it has options. */\n  filterType?: FilterKind;\n  /** The choices an `enum` or `tags` filter offers. */\n  options?: { value: string; label: string }[];\n  /** Whether the Columns panel may hide it. Defaults to true. */\n  hideable?: boolean;\n  /** Whether the Columns panel may move it, DataTable's word for the same. Defaults to true. */\n  reorderable?: boolean;\n  /** Whether it can be filtered. Defaults to true. */\n  filterable?: boolean;\n  /** Whether it can be sorted. Defaults to true. */\n  sortable?: boolean;\n  /** Whether the rows can be grouped by it. Defaults to false. */\n  groupable?: boolean;\n}",
        "description": "One column as a TableToolbar over some other table is told about it.",
        "refs": [
          "FilterKind"
        ]
      },
      "TableToolbarCommand": {
        "kind": "interface",
        "definition": "interface TableToolbarCommand {\n  /** Turns the reader's text into a setup. A rejection shows as an error toast, using the error's message, and leaves the table alone. */\n  onSubmit: (request: TableToolbarCommandRequest) => Promise<TableToolbarCommandResult>;\n}",
        "description": "The AI command in a TableToolbar.",
        "refs": [
          "TableToolbarCommandRequest",
          "TableToolbarCommandResult"
        ]
      },
      "TableToolbarCommandRequest": {
        "kind": "interface",
        "definition": "interface TableToolbarCommandRequest {\n  /** What the reader typed. */\n  text: string;\n  /** The table's setup right now, so a command can refine it. */\n  view: TableView;\n  /** The columns, as the bar knows them: keys, labels, filter kinds and choices. */\n  columns: ToolbarColumn[];\n  /** Aborts when the table leaves the page while the command runs. */\n  signal: AbortSignal;\n}",
        "description": "What a TableToolbar's command handler is given.",
        "refs": [
          "TableView",
          "ToolbarColumn"
        ]
      },
      "TableToolbarCommandResult": {
        "kind": "interface",
        "definition": "interface TableToolbarCommandResult {\n  /** The whole setup to apply; applying replaces the setup, and leaving it out changes nothing. */\n  view?: TableView;\n  /** What was done or found. A toast carries it, with an Undo when the setup changed; a setup that changed with no message takes the `commandApplied` label. */\n  message?: string;\n}",
        "description": "What a TableToolbar's command handler answers with.",
        "refs": [
          "TableView"
        ]
      },
      "TableToolbarLabels": {
        "kind": "interface",
        "definition": "interface TableToolbarLabels {\n  /** The bar's accessible name. */\n  toolbar: string;\n  /** The search field's placeholder and name. */\n  search: string;\n  /** The Columns button, its panel and the column list's name. */\n  columns: string;\n  /** The Columns panel's Show all button. */\n  showAll: string;\n  /** The density switch's name. */\n  density: string;\n  /** The density switch's default segment. */\n  densityDefault: string;\n  /** The density switch's compact segment. */\n  densityCompact: string;\n  /** The result count, given the rows that match and the rows in all. */\n  count: (shown: number, total: number) => string;\n  /** The Filter icon's name, given how many filters are on. */\n  filters: (count: number) => string;\n  /** The title of the filter panel when a phone opens it as a sheet. */\n  filterSheet: string;\n  /** The folded bar's filter panel button that adds a filter. */\n  addFilter: string;\n  /** The chip the filters that do not fit fold into, given how many. */\n  moreFilters: (count: number) => string;\n  /** The More button, shown when the bar is folded, whose panel holds the secondary actions and the density switch. */\n  more: string;\n  /** The More panel's heading over the secondary actions it holds when the bar is folded. */\n  actionsSection: string;\n  /** The Sort button, given how many sorts are set. */\n  sort: (count: number) => string;\n  /** The view tabs' name. */\n  views: string;\n  /** The active view's menu button, given its name and whether the table has moved on from it (the tab's dot, said aloud). */\n  viewMenu: (name: string, unsaved: boolean) => string;\n  /** The view menu's items. */\n  saveView: string;\n  saveAsNewView: string;\n  resetView: string;\n  renameView: string;\n  deleteView: string;\n  /** The button that saves the table's setup as a new view, and a new view's name, given its number. */\n  newView: string;\n  newViewName: (count: number) => string;\n  /** The rename field's name, and its buttons. */\n  viewName: string;\n  saveName: string;\n  cancelRename: string;\n  /** The Group button, given whether the rows are grouped. */\n  group: (grouped: boolean) => string;\n  /** The Group panel's column field. */\n  groupBy: string;\n  /** The Group panel's choice for no grouping. */\n  noGrouping: string;\n  /** The Group panel's buttons that close and open every group. */\n  collapseAll: string;\n  expandAll: string;\n  /** The sort panel's button that adds a sort. */\n  addSort: string;\n  /** The sort panel's button that clears every sort. */\n  clearSorts: string;\n  /** A sort row's column field. */\n  sortColumn: string;\n  /** A sort row's direction switch, and its two choices. */\n  sortDirection: string;\n  ascending: string;\n  descending: string;\n  /** Removes one sort, given its column's header. */\n  removeSort: (column: string) => string;\n  /** Name of a sort row's move grip, given its column's header. */\n  moveSort: (column: string) => string;\n  /** Announced when a sort row moves, given its column, its new rank and how many sorts there are. */\n  movedSort: (column: string, rank: number, count: number) => string;\n  /** The bulk bar's count and its name, given how many rows are selected. */\n  selected: (count: number) => string;\n  /** The bulk bar's count once every matching row is selected, given how many. */\n  allSelected: (count: number) => string;\n  /** The command button's label. */\n  command: string;\n  /** Closes the command's row and brings the bar back. */\n  commandClose: string;\n  /** The command composer's placeholder. */\n  commandPlaceholder: string;\n  /** The command composer's send button. */\n  commandSend: string;\n  /** Shown when a command changes the table without a message of its own. */\n  commandApplied: string;\n  /** Shown when a command fails without a message of its own. */\n  commandFailed: string;\n  /** Puts the table back as it was before the last command. */\n  commandUndo: string;\n  /** Closes a command's toast in the bar's own stack; inside a ToastProvider, its `dismissLabel` applies instead. */\n  commandDismiss: string;\n  /** The bulk bar's menu of the actions that do not fit. */\n  moreBulkActions: string;\n  /** The bulk bar's button that selects every matching row, given how many match. */\n  selectAll: (count: number) => string;\n  /** The bulk bar's button that clears the selection. */\n  clearSelection: string;\n  /** On a phone, the stop in the bar's own row that hands the keyboard to the bulk bar floating at the foot of the screen, given how many rows are selected. */\n  goToBulkBar: (count: number) => string;\n  /** Name of a column's move grip in the Columns panel, given its header. */\n  moveColumn: (label: string) => string;\n  /** Announced after the panel moves a column, given its header, its new position and the column count. */\n  movedColumn: (label: string, position: number, count: number) => string;\n}",
        "description": "Every word the control bar shows or announces, beyond the filters', each defaulting to English."
      },
      "TableToolbarSelection": {
        "kind": "interface",
        "definition": "interface TableToolbarSelection {\n  /** The selected row ids. */\n  ids: string[];\n  /** Whether every matching row is selected. */\n  allMatching: boolean;\n  /** Matching rows left out of an `allMatching` selection. */\n  except: string[];\n}",
        "description": "What a bulk action runs on. `ids` lists every selected row. `allMatching`\nsays the selection is every row that matches the search and filters,\nwhich a server can act on as a query rather than a list, leaving out\n`except`. A table that holds every row resolves `ids` in full either way."
      },
      "TableToolbarView": {
        "kind": "interface",
        "definition": "interface TableToolbarView {\n  /** Stable id for the view. */\n  id: string;\n  /** The view's name, shown as its tab's label. */\n  label: string;\n  /** The table's setup the view holds. */\n  view: DataTableView;\n}",
        "description": "One saved view of the table: its label and its setup.",
        "refs": [
          "DataTableView"
        ]
      },
      "TableView": {
        "kind": "interface",
        "definition": "interface TableView {\n  /** The view format's version, so a stored view can be read by a later one. */\n  version: 1;\n  /** The sorts, first sort first. */\n  sorts?: { key: string; direction: 'asc' | 'desc' }[];\n  /** The filters. */\n  filters?: Filter[];\n  /** The search text. */\n  search?: string;\n  /** The hidden columns' keys. */\n  hiddenColumns?: string[];\n  /** Every column key in display order. */\n  columnOrder?: string[];\n  /** The columns pinned to either edge. */\n  columnPinning?: { start?: string[]; end?: string[] };\n  /** The column widths in pixels, by key. */\n  columnWidths?: Record<string, number>;\n  /** The column keys the rows are grouped by. */\n  grouping?: string[];\n  /** The density. */\n  size?: 'default' | 'compact';\n  /** Rows per page. */\n  pageSize?: number;\n}",
        "description": "One saved setup of a table. Every field is optional: a view leaves out what it does not set.",
        "refs": [
          "Filter"
        ]
      },
      "ToolbarColumn": {
        "kind": "interface",
        "definition": "interface ToolbarColumn {\n  /** The column's key. */\n  key: string;\n  /** Its header text. */\n  label: string;\n  /** Whether the columns panel may hide it. */\n  hideable: boolean;\n  /** Whether the columns panel may move it. */\n  movable: boolean;\n  /** Whether it can be filtered. */\n  filterable: boolean;\n  /** Whether it can be sorted. */\n  sortable: boolean;\n  /** Whether the rows can be grouped by it. */\n  groupable: boolean;\n  /** Its filter kind. */\n  kind: FilterKind;\n  /** The values a choice filter offers: the column's options, else the values it holds. */\n  options: { value: string; label: string }[];\n}",
        "description": "One column as the control bar sees it.",
        "refs": [
          "FilterKind"
        ]
      }
    },
    "externalTypes": {
      "AbortSignal": "typescript",
      "Partial": "typescript",
      "Promise": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "tabs": {
    "types": {
      "Tab": {
        "kind": "interface",
        "definition": "interface Tab {\n  /** Unique tab identifier */\n  value: string;\n  /** Display label */\n  label: string;\n  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n  /** Whether this tab is disabled */\n  disabled?: boolean;\n  /** The id of the `role=\"tabpanel\"` element this tab shows, written as the tab's `aria-controls`. The consumer renders the panels. */\n  panelId?: string;\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "text": {
    "types": {
      "TextTier": {
        "kind": "type",
        "definition": "type TextTier = 'paragraph' | 'paragraph-sm' | 'caption' | 'overline' | 'code';",
        "description": "A running-text type style, named as the type scale names it."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "theme-picker": {
    "types": {
      "ThemePickerOption": {
        "kind": "interface",
        "definition": "interface ThemePickerOption {\n  /** The theme's id, reported through `onValueChange` (a `data-brand` value, say). */\n  value: string;\n  /** The theme's name. */\n  label: string;\n  /** The swatch colour, the theme's action colour as a CSS value. Without one the swatch is an empty chip. */\n  color?: string;\n  /** The swatch's corner, so the chip shows the theme's corner language too. Defaults to a circle. */\n  swatchRadius?: string;\n  /** A line under the name, such as the faces the theme pairs. */\n  description?: string;\n  /** CSS font stack the name is set in, so each row previews its heading face. */\n  headingFont?: string;\n  /** CSS font stack the description is set in, previewing the body face. */\n  bodyFont?: string;\n}",
        "description": "One theme on offer: its name, its swatch, and optionally the faces it sets."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "theme-toggle": {
    "types": {
      "ColorModeSetting": {
        "kind": "type",
        "definition": "type ColorModeSetting = (typeof colorModeSettings)[number];"
      }
    },
    "externalTypes": {}
  },
  "thread-panel": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "Shortcut": {
        "kind": "type",
        "definition": "type Shortcut = string;",
        "description": "A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`."
      },
      "ShortcutKeyLabels": {
        "kind": "type",
        "definition": "type ShortcutKeyLabels = Partial<Record<string, string>>;",
        "description": "The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults."
      },
      "ThreadPanelControl": {
        "kind": "interface",
        "definition": "interface ThreadPanelControl {\n  /** Stable identifier reported through `onControlSelect`. */\n  id: string;\n  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). */\n  icon: string | React.ReactNode;\n  /** Row text. */\n  label: string;\n  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */\n  href?: string;\n}"
      },
      "ThreadPanelGroup": {
        "kind": "interface",
        "definition": "interface ThreadPanelGroup {\n  /** Group heading in the rails' shared mixed-case style, e.g. a project or repo name. Omit for an unlabelled run of threads. */\n  label?: string;\n  /** The group's threads, in display order. */\n  threads: ThreadPanelThread[];\n}",
        "refs": [
          "ThreadPanelThread"
        ]
      },
      "ThreadPanelProfile": {
        "kind": "interface",
        "definition": "interface ThreadPanelProfile {\n  /** The signed-in person's display name; also seeds the Avatar's initials. */\n  name: string;\n  /** The quiet second line under the name, e.g. the person's email, plan or workspace (AppSidebar's profile block carries the email there). */\n  meta?: string;\n  /** Replace the initials Avatar with a custom element, e.g. an `<Avatar src>`; the row seats a 40px mark (Avatar at `md`). */\n  avatar?: React.ReactNode;\n}"
      },
      "ThreadPanelProject": {
        "kind": "interface",
        "definition": "interface ThreadPanelProject {\n  /** Stable identifier: `activeProjectId` matches against it and `onProjectSelect` reports it. */\n  id: string;\n  /** The project's name. */\n  label: string;\n  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). Omit it and the row draws the project's generated PixelAvatar, which is the default mark. */\n  icon?: string | React.ReactNode;\n  /** Seed for the generated PixelAvatar a project wears when it has no `icon`. Defaults to `label`; pass a stable id so a renamed project keeps its character. The panel spreads the inks across its projects, so neighbours differ in colour as well as shape. */\n  pixelAvatar?: string;\n  /** Small trailing annotation in the caption face, e.g. how recently the project was touched. */\n  meta?: string;\n  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */\n  href?: string;\n}"
      },
      "ThreadPanelThread": {
        "kind": "interface",
        "definition": "interface ThreadPanelThread {\n  /** Stable identifier: `activeThreadId` matches against it and `onThreadSelect` reports it. */\n  id: string;\n  /** The thread's one-line title. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the row's native tooltip. */\n  title: string;\n  /** Optional href — the row renders as an `<a>` for real navigation instead of a `<button>`. */\n  href?: string;\n  /** Small trailing annotation in the caption face, e.g. a relative timestamp. */\n  meta?: string;\n  /** The title is still being generated: the row shows a shimmer bar in the title's place and hides its menu, keeping `title` (e.g. \"New chat\") as the accessible name. */\n  pending?: boolean;\n  /** This thread's own menu actions, overriding the panel-wide `threadActions`. */\n  actions?: ThreadPanelThreadAction[];\n  /** Quiet second line under the title in the caption face — a repo, an environment, a one-line summary. Overflows under the same trailing mask as the title. */\n  description?: string;\n  /** The thread's state, drawn as the dot leading the row: `idle` (nothing new, nothing running), `working` (an agent is running now), `unread` (finished, not yet seen), `waiting` (blocked on the reader) or `error` (stopped on a failure). Once any thread in the panel carries a status every row draws a dot, the rest reading `idle`, so the titles share one left edge. The dot is decorative; every state but `idle` is also read aloud through `statusLabels`. */\n  status?: ThreadPanelThreadStatus;\n  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */\n  unread?: boolean;\n  /** Trailing icon before the meta — Material Symbol name (string) or custom element (ReactNode), e.g. `cloud` for a session that lives remotely. */\n  icon?: string | React.ReactNode;\n  /** Marks the thread pinned with a trailing pin glyph, read aloud through the panel's `pinnedLabel`. A marker only: the host groups pinned threads (typically a leading group) and offers pin/unpin through the row menu. */\n  pinned?: boolean;\n}",
        "refs": [
          "ThreadPanelThreadAction",
          "ThreadPanelThreadStatus"
        ]
      },
      "ThreadPanelThreadAction": {
        "kind": "interface",
        "definition": "interface ThreadPanelThreadAction {\n  /** Stable identifier reported through `onThreadAction`. */\n  id: string;\n  /** Menu row text. */\n  label: string;\n  /** Leading icon on the menu row — Material Symbol name (string) or custom element (ReactNode). */\n  icon?: string | React.ReactNode;\n  /** Destructive styling (the error text colour) for delete-like actions. */\n  destructive?: boolean;\n}"
      },
      "ThreadPanelThreadStatus": {
        "kind": "type",
        "definition": "type ThreadPanelThreadStatus =\n  | 'idle'\n  | 'working'\n  | 'unread'\n  | 'waiting'\n  | 'error';",
        "description": "What a thread's leading dot reports. Fill says whether the thread wants\nthe reader, colour says what it wants, motion says it is live right now:\n`idle` is a hollow neutral ring, `working` a pulsing neutral dot, and\n`unread`, `waiting` and `error` solid dots in the info, warning and error\nroles."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "thread-tabs": {
    "types": {
      "ThreadTab": {
        "kind": "interface",
        "definition": "interface ThreadTab {\n  /** Stable identifier: `activeId` matches against it and the callbacks report it. */\n  id: string;\n  /** The tab's one-line label. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the tab's native tooltip. */\n  label: string;\n  /** The tab's leading icon — Material Symbol name (string) or custom element (ReactNode). */\n  icon?: string | React.ReactNode;\n  /** The thread's state, drawn as a dot leading the label: `working` pulses in neutral, `unread`, `waiting` and `error` are solid in the info, warning and error roles. An `idle` tab draws no dot: a strip has no left edge to keep, so only a state worth a glance takes the room. The dot is decorative; the state is also read aloud through `statusLabels`. */\n  status?: ThreadTabStatus;\n  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */\n  unread?: boolean;\n}",
        "refs": [
          "ThreadTabStatus"
        ]
      },
      "ThreadTabStatus": {
        "kind": "type",
        "definition": "type ThreadTabStatus = 'idle' | 'working' | 'unread' | 'waiting' | 'error';",
        "description": "What a tab's leading dot reports — ThreadPanel's thread statuses, so a session reads the same in the rail and in the strip."
      }
    },
    "externalTypes": {
      "Partial": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  },
  "timeline": {
    "types": {
      "TimelineCompany": {
        "kind": "interface",
        "definition": "interface TimelineCompany {\n  /** Company or tool name shown beside the logo */\n  name: string;\n  /** Image node used as the marker (e.g. an `<img>` / framework image element) */\n  logo?: React.ReactNode;\n  /** One or more roles nested under this entry */\n  roles: TimelineRole[];\n}",
        "description": "A company/tool entry grouping one or more roles under a logo (`company` variant).",
        "refs": [
          "TimelineRole"
        ]
      },
      "TimelineItem": {
        "kind": "interface",
        "definition": "interface TimelineItem {\n  /** Step or event title */\n  title: string;\n  /** Small line above the title, e.g. a date range or stage tag */\n  meta?: string;\n  /** Body content under the title */\n  description?: React.ReactNode;\n  /** Icon shown in the marker (overrides dot/number) — Material Symbol name (string) or custom element (ReactNode) */\n  icon?: string | React.ReactNode;\n}"
      },
      "TimelineRole": {
        "kind": "interface",
        "definition": "interface TimelineRole {\n  /** Role or position title */\n  title: string;\n  /** Secondary line under the title, e.g. the team, org, or product the role sat in */\n  subtitle?: React.ReactNode;\n  /** Start of the date range, e.g. \"May 2024\" (omit for entries with no dates) */\n  start?: string;\n  /** End of the date range, e.g. \"Jan 2026\" (ignored when `present` is set) */\n  end?: string;\n  /** Renders a green \"Present\" in place of `end` for current roles */\n  present?: boolean;\n  /** Optional summary paragraph under the role header */\n  description?: React.ReactNode;\n  /** Optional bullet points; each entry is rendered as an `<li>` */\n  bullets?: React.ReactNode[];\n}",
        "description": "A single role/position within a company entry (`company` variant)."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "toast": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "toggle-group": {
    "types": {
      "ToggleGroupItem": {
        "kind": "interface",
        "definition": "interface ToggleGroupItem {\n  /** Unique value */\n  value: string;\n  /** Display label or icon name (Material Symbols) */\n  label: string;\n  /** Use Material Symbol icon instead of text */\n  icon?: boolean;\n}"
      }
    },
    "externalTypes": {}
  },
  "toggle-switch": {
    "types": {},
    "externalTypes": {
      "ComponentPropsWithoutRef": "react"
    }
  },
  "tool-call": {
    "types": {
      "ToolCallStatus": {
        "kind": "type",
        "definition": "type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "toolbar": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "tooltip": {
    "types": {},
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "top-app-bar": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      },
      "TopAppBarAction": {
        "kind": "interface",
        "definition": "interface TopAppBarAction {\n  /** Unique key for this action */\n  key: string;\n  /** Icon — Material Symbol name (string) or custom element (ReactNode) */\n  icon: string | React.ReactNode;\n  /** Accessible label; also the overflow menu's row text */\n  label: string;\n  /** Click handler */\n  onClick?: () => void;\n  /** Renders the action as a link to this URL instead of a button */\n  href?: string;\n  /** Shows a dot on the icon's corner, e.g. unread notifications */\n  badge?: boolean;\n}"
      },
      "TopAppBarOverflowAction": {
        "kind": "type",
        "definition": "type TopAppBarOverflowAction = Omit<TopAppBarAction, 'href' | 'badge'>;",
        "description": "An action in the overflow menu. The menu's rows are buttons and draw no\nicon badge, so `href` and `badge` are left out rather than silently\ndropped: route from `onClick` instead.",
        "refs": [
          "TopAppBarAction"
        ]
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "HTMLElement": "typescript",
      "Omit": "typescript",
      "ReactNode": "react"
    }
  },
  "tree-view": {
    "types": {
      "TreeViewNode": {
        "kind": "interface",
        "definition": "interface TreeViewNode {\n  /** Unique identifier for the node */\n  id: string;\n  /** Text shown on the row */\n  label: string;\n  /** Icon on the row — Material Symbol name (string) or custom element (ReactNode); defaults to `folder` for branches and `draft` for leaves */\n  icon?: string | React.ReactNode;\n  /** Child nodes; a non-empty list makes the node an expandable branch */\n  children?: TreeViewNode[];\n}"
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "treemap": {
    "types": {
      "ChartSummaryItem": {
        "kind": "interface",
        "definition": "interface ChartSummaryItem {\n  /** Label shown above the value */\n  label: string;\n  /** Formatted value to display */\n  value: string | number;\n}"
      },
      "TreemapDataItem": {
        "kind": "interface",
        "definition": "interface TreemapDataItem {\n  /** Display name for the node */\n  name: string;\n  /** Numeric size — determines rectangle area */\n  size: number;\n  /** Optional fill colour */\n  color?: string;\n  /** Nested children for hierarchical data */\n  children?: TreemapDataItem[];\n  [key: string]: unknown;\n}"
      }
    },
    "externalTypes": {}
  },
  "usage-card": {
    "types": {
      "UsageItem": {
        "kind": "interface",
        "definition": "interface UsageItem {\n  /** What is being budgeted, e.g. the context window or a weekly limit */\n  label: string;\n  /** Current level */\n  value: number;\n  /** Upper bound of the budget; defaults to 100 */\n  max?: number;\n  /** Readout override replacing the default percentage, e.g. a token count */\n  valueText?: string;\n  /** Caption under the bar's trailing edge, e.g. when the limit resets */\n  resetLabel?: string;\n  /** Status override; left unset, the fill recolours through the card's thresholds */\n  variant?: 'info' | 'positive' | 'warning' | 'error' | 'neutral';\n}",
        "description": "One budgeted quantity in the card — a meter row with an optional reset caption."
      }
    },
    "externalTypes": {}
  },
  "widget": {
    "types": {
      "LinkComponent": {
        "kind": "type",
        "definition": "type LinkComponent = React.ElementType<LinkComponentProps>;",
        "description": "A component that renders a link in place of a plain `<a>`, such as a router's.",
        "refs": [
          "LinkComponentProps"
        ]
      },
      "LinkComponentProps": {
        "kind": "type",
        "definition": "type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };",
        "description": "The props a link component receives: every anchor attribute, the ref, and\nan `href` that is always a string. Next.js's `Link` takes these as they\nare; a router whose link takes `to` instead needs a one-line adapter:\n`({ href, ...props }) => <RouterLink to={href} {...props} />`."
      }
    },
    "externalTypes": {
      "ComponentPropsWithRef": "react",
      "ElementType": "react",
      "ReactNode": "react"
    }
  },
  "world-map": {
    "types": {
      "WorldMapBounds": {
        "kind": "type",
        "definition": "type WorldMapBounds = [number, number, number, number];",
        "description": "The framed window: `[west, south, east, north]` in degrees."
      },
      "WorldMapPoint": {
        "kind": "interface",
        "definition": "interface WorldMapPoint {\n  /** Stable identifier, referenced by `activePointId`. */\n  id: string;\n  /** Latitude in degrees, north positive. */\n  lat: number;\n  /** Longitude in degrees, east positive. */\n  lng: number;\n  /** Short label drawn beside the marker when `showLabels` is on, and the marker's accessible name. */\n  label?: string;\n  /**\n   * Marker glyph. `point` is a filled dot (something plotted), `anchor` is\n   * an outlined square (something fixed) — the same vocabulary Globe and\n   * MapLegend draw.\n   */\n  kind?: 'point' | 'anchor';\n  /**\n   * Marker colour, any CSS colour (`var(--color-chart-series-2)` works) —\n   * the flat map's channel for colour-coding a category per point. Omit for\n   * the default text colour.\n   */\n  color?: string;\n}",
        "description": "A place on the map."
      }
    },
    "externalTypes": {
      "ReactNode": "react"
    }
  },
  "ai-chat": {
    "types": {
      "AgentRailProfile": {
        "kind": "interface",
        "definition": "interface AgentRailProfile {\n  /** The agent's display name, shown under the portrait; also seeds the Avatar's initials. */\n  name: string;\n  /** The portrait's image src, handed to an `lg` Avatar. Without one the rail draws its own agent mark instead, since initials would claim a person. Ignored when `avatar` is given. */\n  avatarSrc?: string;\n  /** Replaces the default portrait with a custom element — a hero portrait, an illustrated mark. */\n  avatar?: React.ReactNode;\n  /** A short line under the name, e.g. \"Connected\". Renders with a leading status dot. */\n  status?: React.ReactNode;\n  /** Which status role the dot under the name takes. */\n  statusTone?: 'positive' | 'info' | 'warning' | 'error' | 'neutral';\n  /** Fires when the portrait's edit affordance is pressed. The pencil renders only when this is given. */\n  onEdit?: () => void;\n  /** Accessible name for the portrait's edit affordance. */\n  editLabel?: string;\n}"
      },
      "AgentRailProps": {
        "kind": "component-props",
        "component": "AgentRail",
        "see": "get_component(\"AgentRail\")"
      },
      "AgentRailTab": {
        "kind": "interface",
        "definition": "interface AgentRailTab {\n  /** Stable identifier: `value` matches against it and `onValueChange` reports it. */\n  id: string;\n  /** The tab's label, shown beside its icon and used as the pane's accessible name. */\n  label: string;\n  /** Leading icon on the tab — Material Symbol name (string) or custom element (ReactNode). Give every tab one and a squeezed rail can fall back to icons alone; give none and it keeps the labels. */\n  icon?: string | React.ReactNode;\n  /** The pane rendered while this tab is active. */\n  content?: React.ReactNode;\n  /** Whether the tab is selectable. */\n  disabled?: boolean;\n}"
      },
      "AiButtonProps": {
        "kind": "component-props",
        "component": "AiButton",
        "see": "get_component(\"AiButton\")"
      },
      "AiButtonSummary": {
        "kind": "interface",
        "definition": "interface AiButtonSummary {\n  /** Overline label above the title. */\n  overline?: string;\n  /** Title line — usually the page or subject being summarized. */\n  title: string;\n  /** Small caption beside the overline, e.g. a reading time. */\n  caption?: string;\n  /** The pre-written summary the panel reveals. */\n  text: string;\n  /** Prompt chips under the summary; a tap reports through `onSummarySuggestion`. */\n  suggestions?: PromptSuggestion[];\n}",
        "description": "The content of AiButton's summary panel.",
        "refs": [
          "PromptSuggestion"
        ]
      },
      "ArtifactPanelProps": {
        "kind": "component-props",
        "component": "ArtifactPanel",
        "see": "get_component(\"ArtifactPanel\")"
      },
      "AttachmentDropZoneProps": {
        "kind": "component-props",
        "component": "AttachmentDropZone",
        "see": "get_component(\"AttachmentDropZone\")"
      },
      "AttachmentGroupProps": {
        "kind": "component-props",
        "component": "AttachmentGroup",
        "see": "get_component(\"AttachmentGroup\")"
      },
      "AttachmentItem": {
        "kind": "interface",
        "definition": "interface AttachmentItem {\n  /** Stable identity, unique within its list. */\n  id: string;\n  /** File name, extension included. */\n  name: string;\n  /** What kind of file it is. */\n  kind: FileKind;\n  /**\n   * Short label on the file's type mark, replacing the one derived from its\n   * kind and extension (`getFileTypeLabel`: \"PDF\", \"DOC\", the extension, or\n   * \"FILE\"), wherever the family draws the mark: the tile, a lone picture's\n   * badge, the viewer and a composer's queue. Set it to localise the mark or\n   * to name a format the derivation does not know.\n   */\n  typeLabel?: string;\n  /** Size in bytes. */\n  size?: number;\n  /** Mime type, when the source reported one. */\n  mimeType?: string;\n  /** Where the file is in its life. */\n  status: AttachmentStatus;\n  /** Upload progress, 0 to 100, while `status` is `uploading`. */\n  progress?: number;\n  /** Why it failed, while `status` is `error`. */\n  error?: string;\n  /** Image that fills the tile: an object URL for a picture, or a\n      host-rendered first page for a document. */\n  previewSrc?: string;\n  /** Alt text for the preview. Defaults to the name. */\n  previewAlt?: string;\n  /** Full-size image for the viewer, when the preview is a thumbnail.\n      Defaults to `previewSrc`. */\n  src?: string;\n  /** The file itself, for the viewer to show a PDF or a text file in place\n      (through DocumentViewer) and for a picture with no `src`. Distinct\n      from `src`, which is always an image. */\n  fileUrl?: string;\n  /** Intrinsic width of the preview, to reserve its shape before it loads. */\n  width?: number;\n  /** Intrinsic height of the preview. */\n  height?: number;\n  /** First lines of a pasted block, drawn as the tile's excerpt. */\n  excerpt?: string;\n}",
        "description": "One attachment as the family passes it around: what a tile draws, what a\ngroup lays out, and what `useAttachments` keeps. Plain data, so it\nserialises and crosses the server boundary; the `File` itself stays with\nwhoever owns the upload.",
        "refs": [
          "AttachmentStatus",
          "FileKind"
        ]
      },
      "AttachmentStatus": {
        "kind": "type",
        "definition": "type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';",
        "description": "Where an attachment is in its life: usable, on its way, failed, or gone."
      },
      "ChatAgentOptions": {
        "kind": "interface",
        "definition": "interface ChatAgentOptions {\n  /** The agent's portrait block. Defaults to the widget's title with the widget's `agentStatus` (\"Connected\" unless set). A profile with neither `avatar` nor `avatarSrc` wears a PixelAvatar seeded by the widget's title, the mark the header toggle wears. */\n  profile?: AgentRailProfile;\n  /** The panes, in display order. */\n  tabs: AgentRailTab[];\n  /** Open the pane at mount, where the panel is wide enough to seat it inline. Off by default: the header button opens it. */\n  defaultOpen?: boolean;\n}",
        "description": "What the built-in agent pane shows.",
        "refs": [
          "AgentRailProfile",
          "AgentRailTab"
        ]
      },
      "ChatArtifact": {
        "kind": "interface",
        "definition": "interface ChatArtifact {\n  /** Stable identity: the same id reopened is the same artifact. */\n  id: string;\n  /** The artifact's name, on the tile and in the panel's header. */\n  title: string;\n  /**\n   * How to draw it. `html` frames the `html` document, `url` frames the\n   * `url`, `code` shows the `code` alone; any other kind is drawn by the\n   * provider's `artifactRenderers`. An unknown kind with no renderer falls\n   * back to whichever of `html`, `url` and `code` it carries.\n   */\n  kind: string;\n  /** A quiet line beside the name: what it is, or which version. */\n  meta?: string;\n  /** A Material Symbol name for the tile and the header. */\n  icon?: string;\n  /** A complete HTML document, drawn in a sandboxed frame. */\n  html?: string;\n  /** A page to frame. Only http(s) URLs and same-site paths are framed. */\n  url?: string;\n  /** The source, offered as the panel's Code view. An `html` artifact offers its document when this is absent. */\n  code?: string;\n  /** The source's language. */\n  language?: string;\n  /** Whatever a custom renderer for `kind` expects. Must survive JSON. */\n  data?: unknown;\n}",
        "description": "Something the chat made that is worth more room than a turn can give it: a\ndashboard, a document, a page, a site. It travels as an ordinary card of\nkind `ARTIFACT_CARD_KIND`, so any transport that can send a card can send\none; the thread draws it as a tile, and the tile opens the artifact panel\nbeside the conversation."
      },
      "ChatArtifactRenderers": {
        "kind": "type",
        "definition": "type ChatArtifactRenderers = Record<string, (artifact: ChatArtifact) => ReactNode>;",
        "description": "Draws an artifact's preview as a React node, keyed by the artifact's\n`kind`. A kind with no renderer falls back to the built-in frames.",
        "refs": [
          "ChatArtifact"
        ]
      },
      "ChatBackdrop": {
        "kind": "type",
        "definition": "type ChatBackdrop = 'solid' | 'blur';",
        "description": "What a chat seated as a page lies on in the flush layout: the solid shell colour, or the glass and a strong blur over what lies behind."
      },
      "ChatCard": {
        "kind": "interface",
        "definition": "interface ChatCard {\n  /** The renderer key, e.g. \"chart\" or \"plan\". Unknown kinds render nothing. */\n  kind: string;\n  /** Whatever the renderer for `kind` expects. Must survive JSON. */\n  data: unknown;\n  /** The opening of a reply the host worked out before the model began, such as the readout of a change just confirmed: drawn first under the status line, which stays one row for the whole reply (its trace opens only on request) so the thinking never moves the card. */\n  lead?: boolean;\n}",
        "description": "Rich content that can cross a network: a kind the host knows how to draw\nand the data to draw it from. The provider's `renderers` map turns one\ninto a React node when the turn renders. A tool can answer with one from\nthe server handler, and a script can attach one to a reply."
      },
      "ChatCardRenderers": {
        "kind": "type",
        "definition": "type ChatCardRenderers = Record<string, (data: unknown) => ReactNode>;",
        "description": "Draws a `card` event's data as a React node. Keyed by the card's `kind`;\na kind with no renderer draws nothing."
      },
      "ChatContext": {
        "kind": "interface",
        "definition": "interface ChatContext {\n  /** What it is called: a page title, \"ORD-1000116\", \"3 orders\", a passage. The note says it, and a sent message's chip names it. */\n  label: string;\n  /** The note's whole line, for a host that words it itself. Defaults to `Looking at “<label>”`. */\n  note?: string;\n  /** The note's icon: a Material Symbol name, or your own element. Defaults to `description`. */\n  icon?: string | ReactNode;\n  /** Called by the note's clear button, which appears only when this is set: for a context that follows a selection and can go back to the page as a whole. Its name is `contextClearLabel`. */\n  onClear?: () => void;\n  /** Repeat the context above each message sent while it is set, so the thread keeps what each question was about. `true` draws `label` as a compact DocumentChip wearing `icon`; a function draws what it returns, called at the send, for a chip that does more, such as bringing its context back. A message sent with files keeps its files there instead. */\n  sent?: boolean | (() => ReactNode);\n}",
        "description": "What the chat is looking at, as the composer's context note shows it. One\nobject, so a host whose context follows the reader changes the label, the\nline, the icon, the way back and what each sent message carries together."
      },
      "ChatEvent": {
        "kind": "type",
        "definition": "type ChatEvent =\n  /** A live status step: the AgentStatus label, with an optional reasoning trace point. */\n  | { type: 'status'; label: string; point?: string }\n  /** The model serving this exchange, as a display label (\"Sonnet 5\").\n      The server's per-answer ground truth; kept in state but not rendered\n      by the widget today, whose picker follows the `models` offer event. */\n  | { type: 'model'; label: string }\n  /** What the server is offering right now: the wire value it defaults to,\n      and any values the day's budget has locked out. The picker follows\n      this: the server owns the default and the lock, the client only\n      expresses a preference. */\n  | { type: 'models'; default: string; locked: string[] }\n  /** A chunk of response text. The first delta ends the thinking phase. */\n  | { type: 'delta'; text: string }\n  /** The server-side log id for this exchange. Feedback references it, so a\n      thumbs verdict can be joined back to the logged question and answer.\n      A transport that never sends one hides the thumbs, which is what a\n      script does. */\n  | { type: 'exchange'; id: string }\n  /** Follow-up questions to offer under the finished answer. A transport that\n      can produce them yields this before `done`; the fetch transport cannot\n      (they are written from the completed answer, so waiting for them would\n      hold the turn open) and the provider fetches them after the turn\n      commits instead. */\n  | { type: 'followups'; items: string[] }\n  /** Rich content, as a React node, drawn on the live reply as it arrives\n      and kept with the committed turn. Only an in-browser transport can\n      yield one (a script, or `injectTurn`); the network form is `card`. */\n  | { type: 'content'; node: ReactNode }\n  /** Rich content as serialisable data the provider's `renderers` draw,\n      on the live reply as it arrives and with the committed turn. The form\n      a server can send. */\n  | { type: 'card'; card: ChatCard }\n  /** Questions the agent asks with answers to pick, drawn under the committed\n      turn in place of follow-ups: a turn that asks is never asked about. */\n  | { type: 'question'; set: ChatQuestionSet }\n  /** Terminal: the response is complete. */\n  | { type: 'done' }\n  /** A guardrail response (rate limit, circuit breaker): rendered as a normal assistant message. */\n  | { type: 'notice'; text: string }\n  /** A failure the user should see, phrased for humans. */\n  | { type: 'error'; message: string };",
        "refs": [
          "ChatCard",
          "ChatQuestionSet"
        ]
      },
      "ChatFeedbackVerdict": {
        "kind": "type",
        "definition": "type ChatFeedbackVerdict = 'up' | 'down';",
        "description": "The thumbs verdict a visitor can give an answer."
      },
      "ChatLayout": {
        "kind": "type",
        "definition": "type ChatLayout = 'flush' | 'floating' | 'inset';",
        "description": "The three app shell modes a chat can be seated as a page in, AppLayout's and AppSidebar's (`AppSidebarLayout`), named here so the chat draws on the shell recipe without composing the sidebar."
      },
      "ChatLinkRenderer": {
        "kind": "type",
        "definition": "type ChatLinkRenderer = (props: {\n  href: string;\n  children: ReactNode;\n  /** Call on navigation: closes the panel when it covers the page. */\n  onNavigate: () => void;\n}) => ReactNode;",
        "description": "How the widget renders a link the model wrote."
      },
      "ChatModelOption": {
        "kind": "interface",
        "definition": "interface ChatModelOption {\n  /** Stable wire value: what the picker holds and the client sends. */\n  value: string;\n  /** The provider's model id the server calls. */\n  id: string;\n  /** Display name in the picker. */\n  label: string;\n  /** One line under the name in the picker. */\n  description: string;\n  /**\n   * Whether the model takes adaptive thinking and the effort dial. A model\n   * that predates them rejects both, so the handler sends it a plain request.\n   */\n  adaptiveThinking: boolean;\n}",
        "description": "One model the widget can offer in its picker and the server handler can\nserve. Shared by both halves so the wire value the client sends is one the\nserver knows."
      },
      "ChatPlaceholderCopy": {
        "kind": "interface",
        "definition": "interface ChatPlaceholderCopy {\n  /** A completion that produced no text. */\n  empty: string;\n  /** The reader stopped the response before any text arrived. */\n  stopped: string;\n  /** The transport failed before any text arrived. */\n  failed: string;\n  /**\n   * The status line of a reply in flight before the transport reports one of\n   * its own. Defaults to \"Thinking\". Optional so a full object written\n   * against the earlier shape still type-checks.\n   */\n  thinking?: string;\n}",
        "description": "The copy the hook writes itself: the status line of a reply that has not started, and the reply it shows when a transport ends a turn with nothing to show."
      },
      "ChatPlacement": {
        "kind": "type",
        "definition": "type ChatPlacement = ChatSide | 'floating';",
        "description": "A panel's seat: a dock edge, or floating free of both.",
        "refs": [
          "ChatSide"
        ]
      },
      "ChatQuestion": {
        "kind": "type",
        "definition": "type ChatQuestion = QuestionCardQuestion;",
        "description": "One question the agent asks: a prompt and the answers on offer. The shape QuestionCard draws.",
        "refs": [
          "QuestionCardQuestion"
        ]
      },
      "ChatQuestionSet": {
        "kind": "interface",
        "definition": "interface ChatQuestionSet {\n  /** Stable identity within the conversation. */\n  id: string;\n  /** Asked one at a time when there is more than one. A set of more than one holds the composer until it is answered or skipped. */\n  questions: ChatQuestion[];\n}",
        "description": "Questions the agent asks at the end of a reply, with the answers it can\nlist: one question or a short set, each taking one option or several.\nThe reply's text asks in words too, so a transport or a renderer that\ndrops the set still leaves a conversation that reads correctly.",
        "refs": [
          "ChatQuestion"
        ]
      },
      "ChatSide": {
        "kind": "type",
        "definition": "type ChatSide = 'left' | 'right';",
        "description": "The edge a docked panel takes, and the edge it overlays from below the dock threshold."
      },
      "ChatTabsProps": {
        "kind": "component-props",
        "component": "ChatTabs",
        "see": "get_component(\"ChatWidget\", { export: \"ChatTabs\" })"
      },
      "ChatThreadProps": {
        "kind": "component-props",
        "component": "ChatThread",
        "see": "get_component(\"ChatThread\")"
      },
      "ChatThreadsProps": {
        "kind": "component-props",
        "component": "ChatThreads",
        "see": "get_component(\"ChatWidget\", { export: \"ChatThreads\" })"
      },
      "ChatTransport": {
        "kind": "type",
        "definition": "type ChatTransport = (\n  messages: ChatTransportMessage[],\n  signal: AbortSignal\n) => AsyncIterable<ChatEvent>;",
        "description": "A transport streams events for one exchange. Abort the signal to stop it.\n\nContract notes for implementations:\n- The consumer `break`s out of its `for await` loop on `done` (and on\n  abort), which invokes the iterator's `return()`: close any underlying\n  reader or connection in a `try/finally`.\n- Check the signal between yields; the consumer also guards its own loop,\n  but a transport that ignores abort keeps its own work running.\n- There is no first-event timeout on the consumer side: a transport that\n  can hang before its first yield should implement its own watchdog.",
        "refs": [
          "ChatEvent",
          "ChatTransportMessage"
        ]
      },
      "ChatTransportMessage": {
        "kind": "interface",
        "definition": "interface ChatTransportMessage {\n  role: 'user' | 'assistant';\n  content: string;\n  /**\n   * What was attached to a user message: names and kinds, never bytes. The\n   * scripted transport reads it to answer about the files. The fetch\n   * transport drops it before the request is built, so nothing about an\n   * attachment reaches the server.\n   */\n  attachments?: { name: string; kind: AttachmentItem['kind']; size?: number }[];\n}",
        "refs": [
          "AttachmentItem",
          "FileKind"
        ]
      },
      "ChatWidgetProps": {
        "kind": "component-props",
        "component": "ChatWidget",
        "see": "get_component(\"ChatWidget\", { export: \"ChatWidget\" })"
      },
      "CodeBlockProps": {
        "kind": "component-props",
        "component": "CodeBlock",
        "see": "get_component(\"CodeBlock\")"
      },
      "ComposerProps": {
        "kind": "component-props",
        "component": "Composer",
        "see": "get_component(\"Composer\")"
      },
      "FeedbackSink": {
        "kind": "type",
        "definition": "type FeedbackSink = (exchangeId: string, verdict: ChatFeedbackVerdict) => Promise<void>;",
        "description": "Sends a thumbs verdict somewhere.",
        "refs": [
          "ChatFeedbackVerdict"
        ]
      },
      "FileKind": {
        "kind": "type",
        "definition": "type FileKind =\n  | 'pdf'\n  | 'document'\n  | 'spreadsheet'\n  | 'presentation'\n  | 'image'\n  | 'audio'\n  | 'video'\n  | 'archive'\n  | 'code'\n  | 'text'\n  | 'pasted'\n  | 'generic';"
      },
      "FollowupsSource": {
        "kind": "type",
        "definition": "type FollowupsSource = (\n  question: string,\n  answer: string,\n  signal: AbortSignal\n) => Promise<string[]>;",
        "description": "A source of follow-up questions for a finished answer."
      },
      "GreetingCopy": {
        "kind": "interface",
        "definition": "interface GreetingCopy {\n  morning: string;\n  afternoon: string;\n  evening: string;\n}",
        "description": "The three greetings, overridable by a host that speaks differently."
      },
      "MentionItem": {
        "kind": "type",
        "definition": "type MentionItem = {\n  /** Stable identity, unique within its source. */\n  id: string;\n  /** The name shown in the menu and written into the text after the trigger character. */\n  label: string;\n  /** A quieter second phrase on the same row: a role, a path, what a skill does. */\n  description?: string;\n  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */\n  icon?: string | React.ReactNode;\n  /** Extra words the filter matches on besides the label. */\n  keywords?: string[];\n  /** Listed but not choosable. */\n  disabled?: boolean;\n};",
        "description": "One thing a person can reference: a teammate, a file, a skill."
      },
      "MentionSource": {
        "kind": "type",
        "definition": "type MentionSource = {\n  /** The single character that opens this source. */\n  trigger: string;\n  /** The items it offers. */\n  items: MentionItem[];\n  /** Accessible name for this source's menu (\"People\", \"Skills\"). */\n  label?: string;\n};",
        "description": "Everything one trigger character opens: `@` for entities, `/` for skills.",
        "refs": [
          "MentionItem"
        ]
      },
      "ModelPickerProps": {
        "kind": "component-props",
        "component": "ModelPicker",
        "see": "get_component(\"ModelPicker\")"
      },
      "PromptSuggestion": {
        "kind": "interface",
        "definition": "interface PromptSuggestion {\n  /** Stable identifier passed to `onValueChange`. */\n  id: string;\n  /** The suggestion text shown in the chip. */\n  label: string;\n  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */\n  icon?: string | React.ReactNode;\n  /** A quiet second line under the label, drawn by the `tiles` and `cards` layouts: what the tile leads to, or the full question a card asks. The chip layouts have no room for it and leave it out. */\n  description?: string;\n}",
        "description": "One tappable suggestion in the row."
      },
      "PromptSuggestionsProps": {
        "kind": "component-props",
        "component": "PromptSuggestions",
        "see": "get_component(\"PromptSuggestions\")"
      },
      "QuestionCardLabels": {
        "kind": "interface",
        "definition": "interface QuestionCardLabels {\n  /** The last row's label when `other` is set. */\n  other: string;\n  /** The placeholder of the field that row opens. */\n  otherPlaceholder: string;\n  /** The button that sends the answers. */\n  submit: string;\n  /** The button that moves to the next question in a set. */\n  next: string;\n  /** The button that moves back a question in a set. */\n  back: string;\n  /** The button that declines to answer, shown when `onSkip` is passed. */\n  skip: string;\n  /** The line an answered-by-skipping card shows. */\n  skipped: string;\n  /** The line a card shows when the moment to answer passed. */\n  unanswered: string;\n  /** The step count beside a set's heading. */\n  step: (current: number, total: number) => string;\n  /** The line above a one-answer question's options. */\n  chooseOne: string;\n  /** The line above a several-answer question's options, from its `min` and `max`. */\n  chooseMany: (min: number, max: number, total: number) => string;\n  /** Visually hidden text read after each picked option in the answered record. Defaults to \"(chosen)\". */\n  chosen?: string;\n}",
        "description": "Every word the card draws itself, for a host writing in another voice or language."
      },
      "QuestionCardOption": {
        "kind": "interface",
        "definition": "interface QuestionCardOption {\n  /** Stable identifier reported in the answer's `values`. */\n  value: string;\n  /** The answer as the person would say it, e.g. \"Next.js\". One line. */\n  label: string;\n  /** A quiet second line under the label: what choosing it means. */\n  description?: string;\n}",
        "description": "One answer a question offers."
      },
      "QuestionCardQuestion": {
        "kind": "interface",
        "definition": "interface QuestionCardQuestion {\n  /** Stable identifier reported in the answer's `questionId`. */\n  id: string;\n  /** The question in a few words, e.g. \"Which framework?\". Shown as the step's heading in a set, and the options' accessible name always. */\n  prompt: string;\n  /** `single` takes one option, `multi` any number of them. */\n  mode?: 'single' | 'multi';\n  /** The answers on offer, in order. */\n  options: QuestionCardOption[];\n  /** Offer a last \"Something else\" row that opens a text field, for an answer the options do not hold. */\n  other?: boolean;\n  /** `multi` only: the fewest options that make an answer. Defaults to 1. */\n  min?: number;\n  /** `multi` only: the most options that can be picked. Defaults to all of them. */\n  max?: number;\n}",
        "description": "One question the card asks.",
        "refs": [
          "QuestionCardOption"
        ]
      },
      "QuestionSummaryItem": {
        "kind": "interface",
        "definition": "interface QuestionSummaryItem {\n  /** The question, as it was asked. */\n  prompt: string;\n  /** Every answer given, as the person would say each one. Empty when none was. */\n  answers: string[];\n}",
        "description": "One question in a summary, and what was answered to it."
      },
      "QuestionSummaryOwnProps": {
        "kind": "type",
        "definition": "type QuestionSummaryOwnProps = {\n  /** The questions and their answers, in the order they were asked. */\n  items: QuestionSummaryItem[];\n  /** What stands in the answer's place for a question left without one. */\n  missingLabel?: string;\n  /**\n   * `card` draws the summary in its own hairline frame, as a set's record\n   * under the reply that asked it. `plain` drops the frame, for a surface\n   * that brings its own, such as the message bubble that sent the answers.\n   */\n  variant?: 'card' | 'plain';\n  /** Additional CSS classes */\n  className?: string;\n};",
        "description": "Props owned by QuestionSummary itself — everything else falls through to the root element.",
        "refs": [
          "QuestionSummaryItem"
        ]
      },
      "QuestionSummaryProps": {
        "kind": "interface",
        "definition": "interface QuestionSummaryProps\n  extends QuestionSummaryOwnProps,\n    Omit<React.ComponentPropsWithoutRef<'dl'>, keyof QuestionSummaryOwnProps> {}",
        "refs": [
          "QuestionSummaryOwnProps"
        ]
      },
      "RailSlot": {
        "kind": "type",
        "definition": "type RailSlot = boolean | ((ctx: { overlay: boolean; close: () => void }) => ReactNode);",
        "description": "A rail slot: the widget's own panel, or a render prop for a custom one."
      },
      "Starter": {
        "kind": "interface",
        "definition": "interface Starter {\n  id: string;\n  label: string;\n}",
        "description": "One conversation starter on the welcome screen."
      },
      "ThreadPanelGroup": {
        "kind": "interface",
        "definition": "interface ThreadPanelGroup {\n  /** Group heading in the rails' shared mixed-case style, e.g. a project or repo name. Omit for an unlabelled run of threads. */\n  label?: string;\n  /** The group's threads, in display order. */\n  threads: ThreadPanelThread[];\n}",
        "refs": [
          "ThreadPanelThread"
        ]
      },
      "ThreadPanelProfile": {
        "kind": "interface",
        "definition": "interface ThreadPanelProfile {\n  /** The signed-in person's display name; also seeds the Avatar's initials. */\n  name: string;\n  /** The quiet second line under the name, e.g. the person's email, plan or workspace (AppSidebar's profile block carries the email there). */\n  meta?: string;\n  /** Replace the initials Avatar with a custom element, e.g. an `<Avatar src>`; the row seats a 40px mark (Avatar at `md`). */\n  avatar?: React.ReactNode;\n}"
      },
      "ThreadPanelProject": {
        "kind": "interface",
        "definition": "interface ThreadPanelProject {\n  /** Stable identifier: `activeProjectId` matches against it and `onProjectSelect` reports it. */\n  id: string;\n  /** The project's name. */\n  label: string;\n  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). Omit it and the row draws the project's generated PixelAvatar, which is the default mark. */\n  icon?: string | React.ReactNode;\n  /** Seed for the generated PixelAvatar a project wears when it has no `icon`. Defaults to `label`; pass a stable id so a renamed project keeps its character. The panel spreads the inks across its projects, so neighbours differ in colour as well as shape. */\n  pixelAvatar?: string;\n  /** Small trailing annotation in the caption face, e.g. how recently the project was touched. */\n  meta?: string;\n  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */\n  href?: string;\n}"
      },
      "ThreadPanelProps": {
        "kind": "component-props",
        "component": "ThreadPanel",
        "see": "get_component(\"ThreadPanel\")"
      },
      "ThreadPanelThread": {
        "kind": "interface",
        "definition": "interface ThreadPanelThread {\n  /** Stable identifier: `activeThreadId` matches against it and `onThreadSelect` reports it. */\n  id: string;\n  /** The thread's one-line title. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the row's native tooltip. */\n  title: string;\n  /** Optional href — the row renders as an `<a>` for real navigation instead of a `<button>`. */\n  href?: string;\n  /** Small trailing annotation in the caption face, e.g. a relative timestamp. */\n  meta?: string;\n  /** The title is still being generated: the row shows a shimmer bar in the title's place and hides its menu, keeping `title` (e.g. \"New chat\") as the accessible name. */\n  pending?: boolean;\n  /** This thread's own menu actions, overriding the panel-wide `threadActions`. */\n  actions?: ThreadPanelThreadAction[];\n  /** Quiet second line under the title in the caption face — a repo, an environment, a one-line summary. Overflows under the same trailing mask as the title. */\n  description?: string;\n  /** The thread's state, drawn as the dot leading the row: `idle` (nothing new, nothing running), `working` (an agent is running now), `unread` (finished, not yet seen), `waiting` (blocked on the reader) or `error` (stopped on a failure). Once any thread in the panel carries a status every row draws a dot, the rest reading `idle`, so the titles share one left edge. The dot is decorative; every state but `idle` is also read aloud through `statusLabels`. */\n  status?: ThreadPanelThreadStatus;\n  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */\n  unread?: boolean;\n  /** Trailing icon before the meta — Material Symbol name (string) or custom element (ReactNode), e.g. `cloud` for a session that lives remotely. */\n  icon?: string | React.ReactNode;\n  /** Marks the thread pinned with a trailing pin glyph, read aloud through the panel's `pinnedLabel`. A marker only: the host groups pinned threads (typically a leading group) and offers pin/unpin through the row menu. */\n  pinned?: boolean;\n}",
        "refs": [
          "ThreadPanelThreadAction",
          "ThreadPanelThreadStatus"
        ]
      },
      "ThreadPanelThreadAction": {
        "kind": "interface",
        "definition": "interface ThreadPanelThreadAction {\n  /** Stable identifier reported through `onThreadAction`. */\n  id: string;\n  /** Menu row text. */\n  label: string;\n  /** Leading icon on the menu row — Material Symbol name (string) or custom element (ReactNode). */\n  icon?: string | React.ReactNode;\n  /** Destructive styling (the error text colour) for delete-like actions. */\n  destructive?: boolean;\n}"
      },
      "ThreadPanelThreadStatus": {
        "kind": "type",
        "definition": "type ThreadPanelThreadStatus =\n  | 'idle'\n  | 'working'\n  | 'unread'\n  | 'waiting'\n  | 'error';",
        "description": "What a thread's leading dot reports. Fill says whether the thread wants\nthe reader, colour says what it wants, motion says it is live right now:\n`idle` is a hollow neutral ring, `working` a pulsing neutral dot, and\n`unread`, `waiting` and `error` solid dots in the info, warning and error\nroles."
      },
      "ThreadsLabels": {
        "kind": "interface",
        "definition": "interface ThreadsLabels {\n  /** The row menu's pin action. Defaults to \"Pin\". */\n  pin?: string;\n  /** The row menu's unpin action. Defaults to \"Unpin\". */\n  unpin?: string;\n  /** The row menu's rename action. Defaults to \"Rename\". */\n  rename?: string;\n  /** The row menu's delete action. Defaults to \"Delete\". */\n  delete?: string;\n  /** A new project's name, given its ordinal. Defaults to \"New project <n>\". */\n  newProject?: (index: number) => string;\n  /** A new project's meta line. Defaults to \"now\". */\n  newProjectMeta?: string;\n}",
        "description": "The words the thread engine writes into its state, each with an English default."
      },
      "ThreadsOptions": {
        "kind": "interface",
        "definition": "interface ThreadsOptions {\n  /** The history to start from. The groups' labels are the host's. */\n  groups?: ThreadPanelGroup[];\n  /** The projects section, when the rail shows one. */\n  projects?: ThreadPanelProject[];\n  /** The group pinned threads move into. Created on first pin when absent. */\n  pinnedGroup?: string;\n  /** The group a new thread is born into. Defaults to the first non-pinned group. */\n  homeGroup?: string;\n  /**\n   * The name a new thread gets once its shimmer resolves. Called with the\n   * thread's ordinal; a host with a real title generator returns a promise.\n   */\n  nameThread?: (index: number) => string | Promise<string>;\n  /** How long the naming shimmer runs. */\n  namingDelayMs?: number;\n  /** Offer pin and unpin in each row's menu, and keep the pinned group. */\n  pins?: boolean;\n  /** Keep each row's detail anatomy (description, status, icon, meta). Off strips rows to bare titles. */\n  details?: boolean;\n  /** The label of the New chat row and tab. */\n  newThreadLabel?: string;\n  /** The row actions' names and a new project's name and meta, merged over their English defaults. */\n  labels?: ThreadsLabels;\n  /** Called when a thread is selected, so a host can load its conversation. */\n  onSelect?: (threadId: string) => void;\n  onRename?: (threadId: string, title: string) => void;\n  onDelete?: (threadId: string) => void;\n  onPin?: (threadId: string, pinned: boolean) => void;\n}",
        "refs": [
          "ThreadPanelGroup",
          "ThreadPanelProject",
          "ThreadsLabels"
        ]
      },
      "ThreadTabsProps": {
        "kind": "component-props",
        "component": "ThreadTabs",
        "see": "get_component(\"ThreadTabs\")"
      },
      "ThreadTabStatus": {
        "kind": "type",
        "definition": "type ThreadTabStatus = 'idle' | 'working' | 'unread' | 'waiting' | 'error';",
        "description": "What a tab's leading dot reports — ThreadPanel's thread statuses, so a session reads the same in the rail and in the strip."
      }
    },
    "externalTypes": {
      "AbortSignal": "typescript",
      "AsyncIterable": "typescript",
      "ComponentPropsWithoutRef": "react",
      "Omit": "typescript",
      "Partial": "typescript",
      "Pick": "typescript",
      "Promise": "typescript",
      "ReactNode": "react",
      "Record": "typescript"
    }
  }
};
