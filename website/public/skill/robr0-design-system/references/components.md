# @robr0/design-system component catalog

Generated from the component registry at version 0.21.0. One entry per public component; each Contract link is the component's full prop table as markdown.

## Actions (6)

Buttons, button groups, and toggles for triggering actions and switching modes.

### Button

Primary, secondary, tertiary, neutral and destructive variants in default and compact sizes, with icon support and multiple states.

- Import: `import { Button } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/button.md

### Button group

Horizontal and vertical button group layouts for related actions and navigation patterns.

- Import: `import { ButtonGroup } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/button-group.md

### Circular button

Round icon button with primary, secondary, tertiary and neutral variants, default and compact sizes.

- Import: `import { CircularButton } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/circular-button.md

### Segmented control

Pill-style toggle between related views with keyboard navigation and icon support.

- Import: `import { SegmentedControl } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/segmented-control.md

### Split button

Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill.

- Import: `import { SplitButton } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/split-button.md

### Toggle group

A set of two-state buttons that can be toggled on or off, supporting text and icon items.

- Import: `import { ToggleGroup } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/toggle-group.md

## AI (25)

Chat, agent, and model surfaces for building AI products, from the composer to the reasoning trace and the diff an agent proposes.

### Agent plan

A collapsible checklist of an agent's task, with live step states and a progress readout.

- Import: `import { AgentPlan } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/agent-plan.md

### Agent status

A dot-matrix indicator and status line reporting what an agent is doing right now.

- Import: `import { AgentStatus } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/agent-status.md

### AI button

The AI entry point: icon and label ringed by a turning gradient and glow, with an optional hover-summoned AI-summary panel and prompt chips.

- Import: `import { AiButton } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/ai-button.md

### Chat header

The top row of a chat surface, with the conversation title and its controls.

- Import: `import { ChatHeader } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/chat-header.md

### Chat marker

An inline conversation separator for date breaks and system notes.

- Import: `import { ChatMarker } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/chat-marker.md

### Chat message

A single chat turn with avatar, author, timestamp, and bubble or plain content aligned by role.

- Import: `import { ChatMessage } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/chat-message.md

### Chat thread

A scrollable conversation column with edge fades, send anchoring, and a subtle scrollbar.

- Import: `import { ChatThread } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/chat-thread.md

### Code diff

Unified diff view for code changes, with added, removed, and context lines.

- Import: `import { CodeDiff } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/code-diff.md

### Composer

An auto-growing message input with send and stop states, a page-context note, an attachment slot, and Enter-to-send.

- Import: `import { Composer } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/composer.md

### Document chip

A compact file reference with a type icon, name, metadata, and optional remove.

- Import: `import { DocumentChip } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/document-chip.md

### Interrupt card

A human-in-the-loop checkpoint with a question from the agent and option buttons to decide.

- Import: `import { InterruptCard } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/interrupt-card.md

### Message actions

An icon-button row for message-level actions like copy, retry, and feedback.

- Import: `import { MessageActions } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/message-actions.md

### Message card

A structured rich-content card embedded in a chat message, with media, title, body, and actions.

- Import: `import { MessageCard } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/message-card.md

### Model picker

A model selector for chat surfaces, with per-model descriptions and an optional effort row.

- Import: `import { ModelPicker } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/model-picker.md

### Prompt suggestions

A horizontal row of tappable prompt suggestions to start or steer a conversation.

- Import: `import { PromptSuggestions } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/prompt-suggestions.md

### Prose

Token-styled typography for rendered markdown and rich agent output.

- Import: `import { Prose } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/prose.md

### Reasoning

A model's thinking, disclosed behind a one-line summary and collapsed once it finishes.

- Import: `import { Reasoning } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/reasoning.md

### Source chip

A numbered citation pill linking a claim to its source.

- Import: `import { SourceChip } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/source-chip.md

### Source trail

The sources an agent opened while answering, as a collapsible list with per-item status.

- Import: `import { SourceTrail } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/source-trail.md

### Streaming text

Progressive reveal for text arriving in chunks, with a blinking cursor while more is coming.

- Import: `import { StreamingText } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/streaming-text.md

### Thread panel

The session-history rail for chat products: brand header, new-thread action, standing controls, projects, grouped detail-rich threads, and a profile footer.

- Import: `import { ThreadPanel } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/thread-panel.md

### Thread tabs

The strip of open chat sessions: pill tabs with unread dots and hover-revealed close buttons, a new-tab action, and animated enter and exit.

- Import: `import { ThreadTabs } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/thread-tabs.md

### Tool call

The record of one tool invocation, with its arguments and result behind a disclosure.

- Import: `import { ToolCall } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/tool-call.md

### Usage card

An agent's budgets at a glance: context window and plan limits as meter rows with reset captions.

- Import: `import { UsageCard } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/usage-card.md

### Waveform

Voice made visible: a row of bars dancing on the shared twelve-slot cycle, or tracking a live analyser level by level.

- Import: `import { Waveform } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/waveform.md

## Charts (16)

Data visualisation components for plotting series and activity over time.

### Area chart

Filled area chart for showing volume over time, with stacked and single-series variants.

- Import: `import { AreaChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/area-chart.md

### Bar chart

Vertical bars for comparing values across categories or time, with summary stats and tooltips.

- Import: `import { BarChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/bar-chart.md

### Combo chart

Bar and line series in one chart, with an optional second y-axis for pairs in different units, like spend and ROAS.

- Import: `import { ComboChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/combo-chart.md

### Contribution graph

A year of activity, one cell per day.

- Import: `import { ContributionGraph } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/contribution-graph.md

### Funnel chart

Ordered funnel stages as centred trapezoid bands, each sized by its share of the first stage.

- Import: `import { FunnelChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/funnel-chart.md

### Gantt chart

Phases and tasks as bars on a shared timeline, with milestones, progress, and a today rule.

- Import: `import { GanttChart } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/gantt-chart.md

### Gauge

A radial dial for a single bounded reading, recoloured through the status roles as it crosses thresholds.

- Import: `import { Gauge } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/gauge.md

### Legend tile

The labelled value tile under a chart: a series dot, the series name, and its reading, on an inset fill.

- Import: `import { LegendTile } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/legend-tile.md

### Line chart

Multi-series line chart for trends over time, with per-series colours and a summary row.

- Import: `import { LineChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/line-chart.md

### Pie chart

Proportional share of a whole as a pie or donut, with per-slice colours.

- Import: `import { PieChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/pie-chart.md

### Radar chart

Multi-axis comparison of series across categories on a radial grid.

- Import: `import { RadarChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/radar-chart.md

### Radial chart

Concentric progress rings for completion and KPI readouts.

- Import: `import { RadialChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/radial-chart.md

### Scatter chart

Plots point clusters across two axes to show correlation and distribution.

- Import: `import { ScatterChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/scatter-chart.md

### Sparkline

Inline trend line for stats and table cells, drawn without axes or chrome.

- Import: `import { Sparkline } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/sparkline.md

### Stacked bar chart

Bars split into stacked segments to compare totals and their composition.

- Import: `import { StackedBarChart } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/stacked-bar-chart.md

### Treemap

Nested rectangles sized by value for part-to-whole breakdowns.

- Import: `import { Treemap } from '@robr0/design-system/charts';` (needs the optional recharts peer)
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/treemap.md

## Data display (25)

Cards, tables, lists, and badges for presenting structured content.

### Accordion

Collapsible content sections for organising related information.

- Import: `import { Accordion } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/accordion.md

### Animated number

A number that counts to its value: count-up on mount, eased tweens on change, tabular digits that never jitter.

- Import: `import { AnimatedNumber } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/animated-number.md

### Avatar

User profile image with initials and icon fallback, status indicator, and multiple sizes.

- Import: `import { Avatar } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/avatar.md

### Avatar group

Overlapping avatar stack with a +N counter for the overflow.

- Import: `import { AvatarGroup } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/avatar-group.md

### Badge

Small inline status labels with info, positive, warning, error, and neutral variants.

- Import: `import { Badge } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/badge.md

### Card

Card components for previews, navigation, and token documentation, from content cards to colour swatches and typography specimens.

- Import: `import { Card } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/card.md

### Card stack

A deck of cards showing one at a time, flipped through with a lift-and-settle animation.

- Import: `import { CardStack } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/card-stack.md

### Carousel

Sliding content viewer with navigation arrows, dot indicators, auto-play, and keyboard support.

- Import: `import { Carousel } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/carousel.md

### Chip

Compact pills for attributes, filters, and inline metadata.

- Import: `import { Chip } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/chip.md

### Code block

Monospace code with a header and one-click copy.

- Import: `import { CodeBlock } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/code-block.md

### Contact card

Linked contact method with icon, label, and value.

- Import: `import { ContactCard } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/contact-card.md

### Data table

The wired table: sorting, search, row selection, and pagination assembled around Table.

- Import: `import { DataTable } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/data-table.md

### Entity card

Compact display-only card with a centred icon or image and a label, used in the Icons and Logos galleries.

- Import: `import { EntityCard } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/entity-card.md

### Event calendar

A month grid with event pills, overflow counts, and month navigation.

- Import: `import { EventCalendar } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/event-calendar.md

### Figure

Images with captions, in the case-study frame.

- Import: `import { Figure } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/figure.md

### Image compare

Before-and-after image comparison with a draggable divider, keyboard control, and corner labels.

- Import: `import { ImageCompare } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/image-compare.md

### Instructions

Step-by-step guidance with numbered badges, connecting lines, and horizontal layout.

- Import: `import { Instructions } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/instructions.md

### Kbd

A keyboard key rendered as a keycap, for shortcut hints in menus and prose.

- Import: `import { Kbd } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/kbd.md

### Link list

Linked items with logo, label, and subtitle.

- Import: `import { LinkList } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/link-list.md

### Quote

Blockquotes and pull-quotes with attribution.

- Import: `import { Quote } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/quote.md

### Selection card

Large selectable option cards with radio or checkbox indicators for high-visibility choices like settings and onboarding.

- Import: `import { SelectionCard } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/selection-card.md

### Stat

Headline metrics with labels and trend deltas.

- Import: `import { Stat } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/stat.md

### Table

Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.

- Import: `import { Table } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/table.md

### Timeline

Ordered sequences: histories and steppers.

- Import: `import { Timeline } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/timeline.md

### Tree view

Collapsible hierarchy for files, folders, and nested structures.

- Import: `import { TreeView } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/tree-view.md

## Effects (1)

Ambient and decorative surfaces that sit behind or around the interface.

### Shader field

An ambient WebGL2 field of soft light sources that sample colour tokens, with a reported fallback status.

- Import: `import { ShaderField } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/shader-field.md

## Feedback (10)

Alerts, toasts, progress, and empty states that tell people what is happening.

### Alert

Contextual feedback with status variants, optional dismiss, and compact sizing.

- Import: `import { Alert } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/alert.md

### Banner

Full-width status strip for page-level announcements, with an action slot and optional dismissal.

- Import: `import { Banner } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/banner.md

### Empty state

The placeholder for a list, table, or search with nothing to show: icon, headline, guidance, and a next action.

- Import: `import { EmptyState } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/empty-state.md

### Meter

Level indicator for a known quantity, with a status-coloured fill and an optional value readout.

- Import: `import { Meter } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/meter.md

### Notification centre

A persistent notification inbox with unread count, filter tabs, and per-item actions.

- Import: `import { NotificationCenter } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/notification-center.md

### Progress bar

Horizontal bar indicating completion progress, with an optional percentage label.

- Import: `import { ProgressBar } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/progress-bar.md

### Skeleton

Placeholder loading indicators with text, circular, and rectangular variants.

- Import: `import { Skeleton } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/skeleton.md

### Spinner

Animated circular loading indicator in three sizes and primary, neutral, or inherit variants.

- Import: `import { Spinner } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/spinner.md

### Status dot

The bare status mark: a dot in the five status roles, with an optional label and a live pulse for recording and online-now states.

- Import: `import { StatusDot } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/status-dot.md

### Toast

Temporary notification with status variants, auto-dismiss, and stacking via ToastProvider.

- Import: `import { Toast } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/toast.md

## Forms (21)

Inputs, pickers, and selection controls for collecting and editing values.

### Checkbox

Custom checkbox with check and indeterminate states, keyboard accessible with animated transitions.

- Import: `import { Checkbox } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/checkbox.md

### Colour picker

Swatch trigger opening a saturation area, hue and alpha sliders, and a hex field; controlled or uncontrolled.

- Import: `import { ColorPicker } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/color-picker.md

### Combobox

A filterable select that narrows options as the user types, with multi-select chips, grouping, and async loading.

- Import: `import { Combobox } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/combobox.md

### Date input

Date input with native picker, calendar icon, label, and validation states.

- Import: `import { DateInput } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/date-input.md

### Date picker

Inline calendar with month navigation, day selection, and today indicator.

- Import: `import { DatePicker } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/date-picker.md

### Dropdown

Custom select dropdown with keyboard navigation, disabled options, and error states.

- Import: `import { Dropdown } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/dropdown.md

### Field

The shared scaffolding for labelled form controls: label, required marker, helper and error text, and the ARIA wiring that ties them together.

- Import: `import { Field } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/field.md

### File input

A click-or-drop upload zone paired with a controlled file list showing size, progress, and per-file errors.

- Import: `import { FileInput } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/file-input.md

### Filter bar

A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.

- Import: `import { FilterBar } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/filter-bar.md

### Input

Text input with label, placeholder, left and right icons, helper text, and error states.

- Import: `import { Input } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/input.md

### Number input

Numeric field with increment and decrement steppers and min/max clamping.

- Import: `import { NumberInput } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/number-input.md

### Pin input

Segmented one-time-code input with auto-advance, paste support, and completion callback.

- Import: `import { PinInput } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/pin-input.md

### Radio button

Radio button and radio group with vertical and horizontal layouts, animated dot indicator.

- Import: `import { RadioButton } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/radio-button.md

### Rating

Star-scale rating control with keyboard selection, a read-only mode, and a configurable icon.

- Import: `import { Rating } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/rating.md

### Rich dropdown

Dropdown's rich sibling: options preview their own heading face, body face, and key colour.

- Import: `import { RichDropdown } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/rich-dropdown.md

### Slider

Range input for selecting a value between a minimum and maximum, in default and compact sizes.

- Import: `import { Slider } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/slider.md

### Swatch

Clickable colour tile for preset palettes and picker triggers, with a theme-aware selection ring.

- Import: `import { Swatch } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/swatch.md

### Tag input

Multi-value text input with entries held as removable tags.

- Import: `import { TagInput } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/tag-input.md

### Textarea

Multi-line text input with character counter, resize control, helper text, and error states.

- Import: `import { Textarea } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/textarea.md

### Time picker

Time-of-day field with a dropdown list of selectable times.

- Import: `import { TimePicker } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/time-picker.md

### Toggle switch

Binary on/off toggle control with sliding thumb and check indicator, used for settings like theme switching.

- Import: `import { ToggleSwitch } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/toggle-switch.md

## Layout (7)

Page scaffolding: app shells, sidebars, dividers, and section headings.

### App layout

Full-page template pairing the collapsible App sidebar with a centred content area.

- Import: `import { AppLayout } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/app-layout.md

### App sidebar

Collapsible navigation rail with accordion sub-items, category headings, and profile section.

- Import: `import { AppSidebar } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/app-sidebar.md

### Divider

A thin rule separating stacked content, with optional inline label and vertical orientation.

- Import: `import { Divider } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/divider.md

### Panel

The plain dashboard surface: a rounded container with no border or shadow, just padding and a gap.

- Import: `import { Panel } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/panel.md

### Section title

Heading with a divider line and optional trailing content for organising page sections.

- Import: `import { SectionTitle } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/section-title.md

### Split pane

Two resizable regions with a draggable, keyboard-operable divider between them.

- Import: `import { SplitPane } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/split-pane.md

### Toolbar

A grouped strip of controls in one pill shell: clusters, separators, arrow-key focus, and a glass floating variant.

- Import: `import { Toolbar } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/toolbar.md

## Maps (4)

Geographic surfaces for showing where things are and what connects them: a globe, a flat world map, and the callout and key that explain them.

### Globe

An orthographic globe with markers and great-circle arcs, rotated by drag, keys, or a slow spin.

- Import: `import { Globe } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/globe.md

### Map callout

The annotation beside a map point: a name in capitals over monospace readout lines.

- Import: `import { MapCallout } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/map-callout.md

### Map legend

The corner block of a map: its name, what it shows, and the key to its markers.

- Import: `import { MapLegend } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/map-legend.md

### World map

A flat world map from Natural Earth land shapes: token-coloured continents, framed bounds, and colour-carrying markers.

- Import: `import { WorldMap } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/world-map.md

## Navigation (7)

Top bars, breadcrumbs, tabs, steppers, and pagination for moving through a product.

### Anchor nav

An on-page list of anchor links that tracks the reader's position and jumps between sections.

- Import: `import { AnchorNav } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/anchor-nav.md

### Breadcrumb

Hierarchical navigation trail showing the user's location within the site.

- Import: `import { Breadcrumb } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/breadcrumb.md

### Nav

Desktop top navigation bar with a brand slot, horizontal button group, and optional trailing content.

- Import: `import { Nav } from '@robr0/design-system';`
- Rendering: server-renderable (no 'use client')
- Contract: https://robertritacca.com/components/nav.md

### Nav list

Vertical list of navigation links for drawers and menus, with three indent levels and per-row expand toggles.

- Import: `import { NavList } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/nav-list.md

### Pagination

Numbered page navigation for long datasets, with ellipses, disabled end arrows, and a compact readout mode.

- Import: `import { Pagination } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/pagination.md

### Stepper

Step-by-step progress indicator for wizards and multi-stage flows.

- Import: `import { Stepper } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/stepper.md

### Tabs

Tab navigation with underline indicator, icon support, compact size, and full-width mode.

- Import: `import { Tabs } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/tabs.md

## Overlays (10)

Dialogs, drawers, menus, and tooltips that float above the page.

### Alert dialog

Modal confirmation overlay with title, description, and confirm / cancel actions.

- Import: `import { AlertDialog } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/alert-dialog.md

### Command palette

A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.

- Import: `import { CommandPalette } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/command-palette.md

### Context menu

Right-click menu at the pointer with groups, sub-menus, and shortcut hints.

- Import: `import { ContextMenu } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/context-menu.md

### Dialog

A general-purpose modal for focused tasks, with sizes, an optional footer, and full focus management.

- Import: `import { Dialog } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/dialog.md

### Drawer

An edge-anchored modal panel that slides in from any side, for filter panels, detail views, and mobile navigation.

- Import: `import { Drawer } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/drawer.md

### Dropdown menu

Contextual menu with sections, sub-menus, keyboard shortcuts, and inset-gap hover styling.

- Import: `import { DropdownMenu } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/dropdown-menu.md

### Hover card

Rich preview panel that opens from hover or focus, with interactive content and position options.

- Import: `import { HoverCard } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/hover-card.md

### Lightbox

Fullscreen media viewer on the shared overlay stack: deep scrim, caption chip, gallery stepping, trapped and restored focus.

- Import: `import { Lightbox } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/lightbox.md

### Popover

Contextual overlay panel with click and hover triggers, positioned relative to its anchor.

- Import: `import { Popover } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/popover.md

### Tooltip

Contextual text label that appears on hover or focus with position and delay options.

- Import: `import { Tooltip } from '@robr0/design-system';`
- Rendering: client component (declares 'use client')
- Contract: https://robertritacca.com/components/tooltip.md
