# Chat

The whole AI chat as one installable widget: the panel, the conversation engine, the streaming protocol and the server handlers, configured with props.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: widget
- Import: `import { ChatWidget, ChatProvider, ChatLauncher, ChatThreads, ChatTabs, ChatAgentPane } from 'rift-ds/chat';`
- Subpath `rift-ds/chat`: The widget, the provider, the launcher and the engine under them. Optional peers: react-markdown, remark-gfm.
- Subpath `rift-ds/chat/server`: The streaming chat handler and its follow-ups and feedback siblings, for any web-standard route. Optional peers: @anthropic-ai/sdk.
- Subpath `rift-ds/chat/upstash`: Rate limits, a daily budget and the exchange log over Upstash Redis, as the handlers' guardrails. Optional peers: @upstash/ratelimit, @upstash/redis.
- Subpath `rift-ds/chat/demo`: A scripted conversation with rich cards and fixtures, for a preview that needs no key. Optional peers: recharts.
- Subpath `rift-ds/chat/chat.css`: The widget's stylesheet.
- Scaffold: `npx rift-ds init chat`
- Composes: AgentRail, AgentStatus, AiButton, AttachmentDropZone, AttachmentGroup, ChatHeader, ChatMessage, ChatThread, CircularButton, CodeBlock, Composer, DropdownMenu, Mention, ModelPicker, PromptSuggestions, Prose, Reasoning, ThreadPanel, ThreadTabs
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/chat

## ChatWidget props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| fullscreenEnabled | `boolean` | no | `true` | Show the expand toggle. A host whose stage is always a takeover hides it. |
| closeEnabled | `boolean` | no | `true` | Show the header's close button. A host that seats the chat as the page itself rather than as a panel over one has nothing to close back to, so it turns this off. |
| placementEnabled | `boolean` | no | `false` | Show the header's Chat position menu (dock right, dock left, floating). Off by default: a host turns it on only when it implements the seats the menu offers, as ChatLauncher does. |
| compact | `boolean` | no | `false` | Narrow insets for phone-width hosts. |
| phone | `boolean` | no | `false` | The host is a phone viewport, where the soft keyboard will claim the lower half of the screen the moment the composer is focused. The welcome screen stacks instead of centring the composer: greeting in the middle of the empty thread, starters directly above the composer, composer pinned to the bottom from the first paint. |
| title | `string` | no | `Assistant` | The header brand name. |
| placeholder | `string` | no | `Ask anything` | The composer's placeholder text. |
| showStarters | `boolean` | no | `true` | Show the conversation starters on the welcome screen. |
| logo | `string \| null` | no | `null` | The header mark's image src; null (the default) shows the name alone. |
| tagline | `string` | no | `How can I help you today?` | The welcome screen's line under the greeting. |
| starters | `Starter[]` | no |  | The conversation starters: a few pre-written questions. Each must fit the chip budget (SUGGESTION_MAX_CHARS); one that does not is dropped rather than clipped. |
| startersKey | `string` | no | `` | Keys the starters' staged reveal: a new key replays the generation beat, the same key shows the set standing. A host whose starters follow the page passes the pathname. |
| composerActions | `ReactNode` | no |  | Replaces the composer's leading actions (the model picker). |
| models | `ChatModelOption[]` | no |  | The models the picker offers. The pick rides on each send as a wire value; the server resolves it. Omit for no picker. |
| defaultModel | `string` | no |  | The picker's selection before the server has reported its default. Defaults to the first model. |
| lockedModelDescription | `string` | no | `Paused for today to stay in budget.` | The one line a locked model shows in place of its description. |
| fileAttachments | `boolean` | no | `false` | Let the visitor attach files: an attach button, paste, drop anywhere on the chat, and long pastes folded into a tile. Files are read in the browser for previews; what reaches the transport is names and kinds. |
| maxAttachments | `number` | no | `10` | Most files the visitor may queue on one message. |
| maxAttachmentBytes | `number` | no | `50 * 1024 * 1024` | Largest file the visitor may queue, in bytes. |
| mentions | `MentionSource[]` | no |  | What the visitor can reference while typing: one source per trigger character, drawn as tags in the composer and in the sent bubble. |
| threads | `RailSlot` | no |  | A session-history rail. `true` seats the built-in ChatThreads over the provider's thread lifecycle; a render prop seats your own. Wide hosts seat it as an inline left rail, narrow ones summon it from a header hamburger as a slide-over sheet behind a scrim. |
| threadsProps | `Omit<ChatThreadsProps, "close" \| "overlay">` | no |  | Props for the built-in threads rail when `threads` is `true`. |
| tabs | `ReactNode` | no |  | An open-sessions tab strip as its own row under the header. `true` seats the built-in ChatTabs; a node seats your own. |
| aside | `((ctx: { overlay: boolean; close: () => void; }) => ReactNode)` | no |  | A companion rail on the trailing edge, the mirror of `threads`: a render prop for your own pane, seated inline on a wide host and raised as a bottom sheet from a header button on a narrow one. For the built-in pane pass `agent` instead. |
| agent | `ChatAgentOptions` | no |  | The built-in agent pane: who the agent is and what it has been doing. Seated like `aside`. |
| contextLabel | `string \| null` | no |  | The composer's context note, naming what the chat is looking at. Omit for none. |
| widgets | `ReactNode` | no |  | A widget slot on the welcome screen, under the composer and its starters. It takes any content and keeps its natural height, so the composer rides up by half of it instead of holding dead centre: the empty chat reads as a home page rather than a blank prompt. It leaves with the first message, like the rest of the welcome dressing. |
| widgetsLayout | `"scroll" \| "fit"` | no | `fit` | How the widget slot takes its room. `fit` keeps the welcome screen to one viewport: the widgets hold their height and the composer rides up to make room. `scroll` turns the welcome screen into a page: the greeting and composer take the opening of the viewport, the widgets run on below the fold, and the whole welcome scrolls as one. |
| widgetsWidth | `"column" \| "wide"` | no | `column` | How wide the widget slot runs. `column` holds it to the composer's bounding box; `wide` lets it run past them, for a dashboard. |
| disclaimer | `ReactNode` | no | `Answers may be wrong.` | The quiet line pinned to the widget's floor: what the chat is and where its policy lives. |

## ChatProvider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| transport | `ChatTransport` | no |  | Where the conversation goes. Defaults to the fetch transport against `endpoint`, carrying the visitor's model pick. A script from `scriptChat()` runs the widget with no backend at all. |
| endpoint | `string` | no | `/api/chat` | The endpoint the default transport posts to. |
| defaultPlacement | `ChatPlacement` | no | `right` | The seat the panel opens in. |
| followups | `string \| false \| FollowupsSource` | no | `/api/chat/followups` | Where follow-up questions come from after an answer commits: a source function, an endpoint for the built-in fetcher, or `false` for none. Defaults to the fetcher against `/api/chat/followups`. |
| fallbackFollowups | `readonly string[]` | no | `[   'Can you say more about that?',   'What should I do next?',   'Where can I read more?',   'Can you give an example?',   'What are the alternatives?', ]` | The written questions offered when the source returns none. |
| feedback | `string \| false \| FeedbackSink` | no | `/api/chat/feedback` | Where a thumbs verdict goes: a sink function, an endpoint for the built-in poster, or `false` to hide the thumbs. Defaults to the poster against `/api/chat/feedback`. Thumbs only ever show on a turn the server logged (one with an exchange id). |
| renderers | `ChatCardRenderers` | no |  | Draws `card` events by kind. |
| renderLink | `ChatLinkRenderer` | no | `({ href, children, onNavigate }) => (   <a href={href} onClick={onNavigate}>     {children}   </a> )` | Renders a same-site link in an answer. The default is a plain anchor; a Next.js host passes its Link. |
| isInternalHref | `((href: string) => boolean)` | no | `(href: string) => INTERNAL_PATH.test(href)` | Which hrefs in an answer become links. Everything else renders as text. |
| threads | `ThreadsOptions` | no |  | Seeds the thread lifecycle behind the `threads` and `tabs` slots. |
| placeholders | `Partial<ChatPlaceholderCopy>` | no |  | Replacement copy for the hook's placeholder replies. |

## ChatLauncher props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Ask` | The floating button's text. |
| icon | `string` | no | `forum` | The button's icon. |
| summary | `(AiButtonSummary & { chips?: { id: string; label: string; prompt: string; }[]; })` | no |  | A TLDR panel the button summons on hover: a pre-written summary and prompt chips. A tapped chip opens the chat and sends the chip's `prompt`. Hover-capable devices only: the launcher never renders it on touch, and never in server HTML. |
| hidden | `boolean` | no | `false` | Render nothing at all: for routes that carry no chrome. |
| panelId | `string` | no | `ds-chat-panel` | The panel's DOM id, for a host control's `aria-controls`. |
| hostAttribute | `string \| false` | no | `data-chat` | The attribute the launcher writes on `<html>` to say how the panel sits (`docked`, `docked-left`, `takeover`), so the host's stylesheet can pad the page or hide it. `false` writes none. |
| panelLabel | `string` | no | `Chat` | Accessible name for the panel. |
| widget | `Omit<ChatWidgetProps, "compact" \| "fullscreenEnabled" \| "placementEnabled" \| "phone">` | no |  | Everything the widget takes. The launcher sets the responsive ones itself. |
| children | `ReactNode` | no |  | Rendered inside the panel after the widget: for a host's extra chrome. |

## ChatThreads props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| overlay | `boolean` | yes |  | The widget seated the rail as a sheet over the conversation rather than beside it. |
| close | `() => void` | yes |  | Closes the sheet; a no-op on the inline rail. |
| logo | `ReactNode` | no |  | The brand row's mark, in both seats. |
| logoText | `string` | no |  | The brand row's text. Shown on the sheet by default, where the chat header is hidden behind it. |
| profile | `ThreadPanelProfile` | no |  | The signed-in person, shown on the inline rail. |
| collapsible | `boolean` | no | `true` | Whether the inline rail can collapse to its icon strip. |
| defaultExpanded | `boolean` | no | `false` | Whether the rail starts collapsed. |
| historyLabel | `string` | no | `Chat history` | Accessible heading over the history. |

## ChatTabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| ariaLabel | `string` | no | `Open chats` | Accessible name for the tab strip. |

## ChatAgentPane props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| profile | `AgentRailProfile` | yes |  | The agent this pane belongs to: the portrait block at the top. |
| tabs | `AgentRailTab[]` | yes |  | The panes, in display order: activity, approvals, automations, personalisation, or whatever the agent has. |
| activeTab | `string` | no |  | The tab on stage, when the host owns the state; otherwise the pane keeps its own. |
| onTabChange | `((id: string) => void)` | no |  | Fires with the chosen tab's id. |
| overlay | `boolean` | yes |  | The widget seated the pane as a bottom sheet, where it fills the width instead of holding its own column. |
