# AI chat

The whole AI chat: the panel, the streaming replies, the history, the cards and questions a reply can carry and the server handlers, set up with props.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: widget
- Import: `import { ChatWidget, ChatProvider, ChatLauncher, ChatThreads, ChatTabs, ChatAgentPane, ChatArtifactPane, ChatArtifactCard } from 'rift-ds/chat';`
- Subpath `rift-ds/chat`: The widget, the provider, the launcher and the engine under them. Optional peers: react-markdown, remark-gfm.
- Subpath `rift-ds/chat/server`: The streaming chat handler, with an opt-in tool for asking the visitor questions, and its follow-ups and feedback siblings, for any web-standard route. Optional peers: @anthropic-ai/sdk.
- Subpath `rift-ds/chat/upstash`: Rate limits, a daily budget and the exchange log over Upstash Redis, as the handlers' guardrails. Optional peers: @upstash/ratelimit, @upstash/redis.
- Subpath `rift-ds/chat/demo`: A scripted conversation with rich cards and fixtures, for a preview that needs no key. Optional peers: recharts.
- Subpath `rift-ds/chat/chat.css`: The widget's stylesheet.
- Scaffold: `npx rift-ds init chat`
- Composes: AgentRail, AgentStatus, AiButton, ArtifactCard, ArtifactPanel, AttachmentDropZone, AttachmentGroup, ChatHeader, ChatMessage, ChatThread, CircularButton, CodeBlock, Composer, DropdownMenu, EmptyState, Mention, ModelPicker, PixelAvatar, PromptSuggestions, Prose, QuestionCard, Reasoning, ThreadPanel, ThreadTabs
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/ai-chat

## ChatWidget props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| fullscreenEnabled | `boolean` | no | `true` | Show the expand toggle. A host whose stage is always a takeover hides it. |
| closeEnabled | `boolean` | no | `true` | Show the header's close button. A host that seats the chat as the page itself rather than as a panel over one has nothing to close back to, so it turns this off. |
| placementEnabled | `boolean` | no | `false` | Show the header's Chat position menu (dock right, dock left, floating). Off by default: a host turns it on only when it implements the seats the menu offers, as ChatLauncher does. |
| compact | `boolean` | no | `false` | Narrow insets for phone-width hosts. |
| phone | `boolean` | no | `false` | The host is a phone viewport, where the soft keyboard will claim the lower half of the screen the moment the composer is focused. The welcome screen stacks instead of centring the composer: greeting in the middle of the empty thread, starters directly above the composer, composer pinned to the bottom from the first paint. |
| title | `string` | no | `Assistant` | The header brand name, which also seeds the agent's PixelAvatar. Note: not the native `title` tooltip attribute; ChatWidget spreads no native attributes. |
| flow | `"top-down" \| "bottom-up"` | no | `top-down` | Which way the conversation reads. `top-down` (the default) floats each new turn to the top of the thread and streams the answer in below it. `bottom-up` is the classic message thread: turns stack from the bottom, the newest just above the composer, and the view follows the answer. |
| placeholder | `string` | no | `Ask anything` | The composer's placeholder text. |
| questionsPlaceholder | `string` | no | `Answer the questions above, or skip them` | The composer's placeholder while a set of questions holds it: the answer goes in the card, or the card is skipped. |
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
| tabsProps | `ChatTabsProps` | no |  | Props for the built-in tab strip when `tabs` is `true`: its name, its close buttons' names and its spoken statuses. |
| aside | `((ctx: { overlay: boolean; close: () => void; }) => ReactNode)` | no |  | A companion rail on the trailing edge, the mirror of `threads`: a render prop for your own pane, seated inline on a wide host and raised as a bottom sheet from a header button on a narrow one. For the built-in pane pass `agent` instead. |
| agent | `ChatAgentOptions` | no |  | The built-in agent pane: who the agent is and what it has been doing. Seated like `aside`. |
| artifacts | `boolean` | no | `false` | Seat the artifact panel: a reply that carries an artifact draws a tile in the thread, and the tile (or the header's artifact button) opens the artifact beside the conversation on a wide host and as a bottom sheet on a narrow one. The trailing seat holds one panel at a time, so an open artifact stands in for the agent pane. Off, none of it exists: no header button, no tile, no panel. |
| contextLabel | `string \| null` | no |  | The composer's context note, naming what the chat is looking at. Omit for none. The note's wording comes from `contextNote`. |
| contextNote | `((title: string) => string)` | no | `(title: string) => `Looking at “${title}”`` | The composer's context note, written from `contextLabel`. Defaults to `Looking at “<title>”`. |
| attachHint | `((maxSize: string, maxFiles: number, maxBytes: number) => string)` | no | `(maxSize: string, maxFiles: number) =>   `Up to ${maxSize} each · ${maxFiles} files max`` | The second line of the drop overlay with attachments on, written from the limits: the largest file as text ("50 MB"), the most files per message, and the largest file in bytes for a host that formats sizes itself. Defaults to `Up to <maxSize> each · <maxFiles> files max`. |
| greetings | `Partial<GreetingCopy>` | no |  | The welcome greeting for each part of the visitor's day; a key left out keeps its English. Defaults to "Good morning", "Good afternoon" and "Good evening". |
| placementLabels | `Partial<Record<ChatPlacement, string>>` | no |  | The Chat position menu's rows, one per seat; a key left out keeps its English. Defaults to "Dock right", "Dock left" and "Floating". |
| agentStatus | `string` | no | `Connected` | The status line under the agent's name in the agent pane, where `agent` brings no `profile` of its own. Defaults to "Connected". |
| artifactPanelTitle | `string` | no | `Artifacts` | The artifact panel's title while nothing is on stage. Defaults to "Artifacts". |
| artifactEmptyTitle | `string` | no | `Nothing here yet` | The artifact panel's empty-state heading. Defaults to "Nothing here yet". |
| artifactEmptyDescription | `string` | no | `What the chat makes for you, like a dashboard or a page, opens in this panel.` | The artifact panel's empty-state description. Defaults to "What the chat makes for you, like a dashboard or a page, opens in this panel." |
| widgets | `ReactNode` | no |  | A widget slot on the welcome screen, under the composer and its starters. It takes any content and keeps its natural height, so the composer rides up by half of it instead of holding dead centre: the empty chat reads as a home page rather than a blank prompt. It leaves with the first message, like the rest of the welcome dressing. |
| widgetsLayout | `"scroll" \| "fit"` | no | `fit` | How the widget slot takes its room. `fit` keeps the welcome screen to one viewport: the widgets hold their height and the composer rides up to make room. `scroll` turns the welcome screen into a page: the greeting and composer take the opening of the viewport, the widgets run on below the fold, and the whole welcome scrolls as one. |
| widgetsWidth | `"column" \| "wide"` | no | `column` | How wide the widget slot runs. `column` holds it to the composer's bounding box; `wide` lets it run past them, for a dashboard. |
| disclaimer | `ReactNode` | no | `Answers may be wrong.` | The quiet line pinned to the widget's floor: what the chat is and where its policy lives. |
| startersLabel | `string` | no | `Conversation starters` | Accessible name of the welcome screen's conversation starters. Defaults to "Conversation starters". |
| newChatLabel | `string` | no | `New chat` | Accessible name of the header's new-chat button. Defaults to "New chat". |
| showAgentLabel | `string` | no | `Show the agent panel` | Accessible name of the agent-pane toggle while the pane is closed. Defaults to "Show the agent panel". |
| hideAgentLabel | `string` | no | `Hide the agent panel` | Accessible name of the agent-pane toggle while the pane is open. Defaults to "Hide the agent panel". |
| closeAgentLabel | `string` | no | `Close the agent panel` | Accessible name of the agent pane's own close button, and of the scrim that closes the pane's bottom sheet. Defaults to "Close the agent panel". |
| showArtifactLabel | `string` | no | `Show the artifact panel` | Accessible name of the artifact-panel toggle while the panel is closed. Defaults to "Show the artifact panel". |
| hideArtifactLabel | `string` | no | `Hide the artifact panel` | Accessible name of the artifact-panel toggle while the panel is open. Defaults to "Hide the artifact panel". |
| closeArtifactLabel | `string` | no | `Close the artifact panel` | Accessible name of the scrim that closes the artifact panel's bottom sheet. Defaults to "Close the artifact panel". |
| placementLabel | `string` | no | `Chat position` | Accessible name of the Chat position menu's button, and the heading of its group. Defaults to "Chat position". |
| enterFullscreenLabel | `string` | no | `Enter full screen` | Accessible name of the expand toggle in panel view. Defaults to "Enter full screen". |
| exitFullscreenLabel | `string` | no | `Exit full screen` | Accessible name of the expand toggle in full-screen view. Defaults to "Exit full screen". |
| closeLabel | `string` | no | `Close chat` | Accessible name of the header's close button. Defaults to "Close chat". |
| openThreadsLabel | `string` | no | `Open the chat history` | Accessible name of the header button that opens the chat-history sheet on a narrow host. Defaults to "Open the chat history". |
| closeThreadsLabel | `string` | no | `Close the chat history` | Accessible name of the scrim that closes the chat-history sheet. Defaults to "Close the chat history". |
| modelPickerLabel | `string` | no | `Choose a model` | Accessible name of the composer's model picker. Defaults to "Choose a model". |
| sendLabel | `string` | no | `Send` | Accessible name of the composer's send button. Defaults to "Send". |
| copyResponseLabel | `string` | no | `Copy response` | Accessible name of a reply's copy button. Defaults to "Copy response". |
| copiedResponseLabel | `string` | no | `Copied` | Accessible name of a reply's copy button once the copy has landed. Defaults to "Copied". |
| copiedAnnouncementLabel | `string` | no | `Copied to clipboard` | What screen readers hear once a reply has been copied. Defaults to "Copied to clipboard". |
| goodResponseLabel | `string` | no | `Good response` | Accessible name of a reply's thumbs-up button. Defaults to "Good response". |
| badResponseLabel | `string` | no | `Bad response` | Accessible name of a reply's thumbs-down button. Defaults to "Bad response". |
| followupsLabel | `string` | no | `Follow-up questions` | Accessible name of the follow-up question row under a finished answer. Defaults to "Follow-up questions". |
| pastedTextLabel | `string` | no |  | The name a long paste's tile wears in the composer and the sent message. Defaults to "Pasted text". |
| reasoningLabel | `((durationSeconds: number) => string)` | no |  | The reasoning disclosure's summary once the thinking is over, given the seconds it took when known. Defaults to "Thought for <n>s", or "Thought process" with no duration. |
| composerLabels | `Pick<ComposerProps, "aria-label" \| "attachmentTileLabels" \| "attachLabel" \| "dropLabel" \| "filesLabel" \| "formatFileAnnouncement" \| "formatMentionAnnouncement" \| "stopLabel">` | no |  | The composer's words, over Composer's English defaults: the attach button ("Attach files"), the drop overlay on the shell ("Drop files to attach"), the queued files' list ("Attachments") and their tiles (`attachmentTileLabels`), the stop button ("Stop generating"), the text field's name ("Message"), and the sentences announced when files or mention matches change. The send button's name is `sendLabel`. |
| attachmentDropZoneLabels | `Pick<AttachmentDropZoneProps, "label">` | no |  | The drop overlay's headline when a file is dragged over the chat with attachments on, over AttachmentDropZone's "Drop files to attach". Its second line is `attachHint`. |
| attachmentGroupLabels | `Pick<AttachmentGroupProps, "label" \| "showMoreLabel" \| "showLessLabel" \| "attachmentTileLabels" \| "attachmentViewerLabels">` | no |  | The words of the files on a sent message, over AttachmentGroup's English defaults: the list's name ("Attachments"), the overflow buttons ("Show 3 more", "Show fewer"), the tiles' status lines (`attachmentTileLabels`) and the viewer a pressed file opens in (`attachmentViewerLabels`). |
| chatThreadLabels | `Pick<ChatThreadProps, "ariaLabel" \| "jumpLabel">` | no |  | The conversation's names, over ChatThread's English defaults: the scrolling region ("Conversation") and the scroll-to-latest control ("Scroll to the latest message"). |
| modelPickerLabels | `Pick<ModelPickerProps, "placeholder" \| "listLabel">` | no |  | The model picker's words, over ModelPicker's English defaults: the open list's name ("Model") and the trigger's text when nothing is selected ("Choose a model"). The trigger's own name is `modelPickerLabel`. |
| artifactPanelLabels | `Pick<ArtifactPanelProps, "collapseLabel" \| "closeLabel" \| "expandLabel" \| "previewLabel" \| "codeLabel" \| "viewLabel" \| "codeBlockLabels">` | no |  | The artifact panel's words, over ArtifactPanel's English defaults: the view switch ("Preview", "Code", "Artifact view"), the expand and close buttons ("Expand the artifact", "Collapse the artifact", "Close the artifact") and the code view's CodeBlock (`codeBlockLabels`). |
| agentRailLabels | `Pick<AgentRailProps, "tabsLabel">` | no |  | The agent pane's words, over AgentRail's English defaults: the tab strip's name ("Agent views"). The pane's close is `closeAgentLabel`. |
| questionCardLabels | `Partial<QuestionCardLabels>` | no |  | The words of a question card a reply ends in, over QuestionCard's English defaults: the step count ("1 of 3"), the buttons ("Back", "Next", "Send", "Skip"), the records ("Skipped", "Not answered", "(chosen)"), the pick lines ("Choose one") and the "Something else" row. |
| questionSummaryLabels | `Pick<QuestionSummaryProps, "missingLabel">` | no |  | The words of a sent set of answers, over QuestionSummary's English default: what stands in for a question left without an answer ("No answer"). |
| codeBlockLabels | `(Pick<CodeBlockProps, "copyLabel" \| "copyText" \| "copiedLabel"> & { codeLabel?: ((language: string) => string); }) \| undefined` | no |  | The words of a reply's fenced code, over CodeBlock's English defaults: the copy button ("Copy code", "Copy", "Copied"), and the code region's name, given the fence's language ("Code: bash", or "Code" with none). |
| promptSuggestionsLabels | `Pick<PromptSuggestionsProps, "chosenLabel">` | no |  | The follow-up row's words, over PromptSuggestions' English default: the hidden text read after the sent suggestion ("(chosen)"). The row's name is `followupsLabel`. |

## ChatProvider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| transport | `ChatTransport` | no |  | Where the conversation goes. Defaults to the fetch transport against `endpoint`, carrying the visitor's model pick. A script from `scriptChat()` runs the widget with no backend at all. |
| endpoint | `string` | no | `/api/chat` | The endpoint the default transport posts to. |
| defaultPlacement | `ChatPlacement` | no | `right` | The seat the panel opens in. |
| followups | `string \| false \| FollowupsSource` | no | `/api/chat/followups` | Where follow-up questions come from after an answer commits: a source function, an endpoint for the built-in fetcher, or `false` for none: with `false` no chips show under an answer at all, not even the written `fallbackFollowups`. Defaults to the fetcher against `/api/chat/followups`. |
| fallbackFollowups | `readonly string[]` | no | `[   'Can you say more about that?',   'What should I do next?',   'Where can I read more?',   'Can you give an example?',   'What are the alternatives?', ]` | The written questions offered when the source returns none or fails. Unused when `followups` is `false`. |
| feedback | `string \| false \| FeedbackSink` | no | `/api/chat/feedback` | Where a thumbs verdict goes: a sink function, an endpoint for the built-in poster, or `false` to hide the thumbs. Defaults to the poster against `/api/chat/feedback`. Thumbs only ever show on a turn the server logged (one with an exchange id). |
| renderers | `ChatCardRenderers` | no |  | Draws `card` events by kind. |
| artifactRenderers | `ChatArtifactRenderers` | no |  | Draws an artifact's preview by kind, for artifacts that are live React content rather than a document or a URL. |
| renderLink | `ChatLinkRenderer` | no | `(props) => <DefaultChatLink {...props} />` | Renders a same-site link in an answer. The default renders through the nearest LinkProvider's link component, else a plain anchor; passing this wins over both. |
| isInternalHref | `((href: string) => boolean)` | no | `(href: string) => INTERNAL_PATH.test(href)` | Which hrefs in an answer become links. Everything else renders as text. |
| threads | `ThreadsOptions` | no |  | Seeds the thread lifecycle behind the `threads` and `tabs` slots. |
| placeholders | `Partial<ChatPlaceholderCopy>` | no |  | Replacement copy for the words the hook writes itself, merged over the English defaults: the status line of a reply that has not started ("Thinking") and the placeholder replies for an empty, stopped or failed turn. |

## ChatLauncher props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Ask` | The floating button's text. |
| icon | `string` | no | `forum` | The button's icon. |
| summary | `(AiButtonSummary & { chips?: { id: string; label: string; prompt: string; }[]; })` | no |  | A TLDR panel the button summons on hover: a pre-written summary and prompt chips. A tapped chip opens the chat and sends the chip's `prompt`. The launcher hands it to the closed button's AiButton, which opens the panel on pointer hover; it does no device or hydration gating of its own, so a host that wants the panel on hover-capable devices only, or kept out of server HTML, passes `summary` only there. |
| hidden | `boolean` | no | `false` | Render nothing at all: for routes that carry no chrome. Note: not the native `hidden` attribute, which keeps an element mounted and only hides it; the launcher unmounts its button and panel, and spreads no native attributes. |
| panelId | `string` | no | `ds-chat-panel` | The panel's DOM id, for a host control's `aria-controls`. |
| hostAttribute | `string \| false` | no | `data-chat` | The attribute the launcher writes on `<html>` to say how the panel sits (`docked`, `docked-left`, `takeover`), so the host's stylesheet can pad the page or hide it. `false` writes none. |
| panelLabel | `string` | no | `Chat` | Accessible name for the panel. |
| aiButtonLabels | `Pick<AiButtonProps, "summaryRegionLabel" \| "dismissLabel" \| "suggestionsLabel">` | no |  | The words of the floating button's summary panel, over AiButton's English defaults: the panel's name, given the summary's title ("Summary: <title>"), its dismiss button ("Dismiss summary") and its chips' group ("Suggested prompts"). |
| widget | `Omit<ChatWidgetProps, "compact" \| "fullscreenEnabled" \| "placementEnabled" \| "phone">` | no |  | Everything the widget takes. The launcher sets the responsive ones itself. |
| children | `ReactNode` | no |  | Rendered inside the panel after the widget: for a host's extra chrome. |

## ChatThreads props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| overlay | `boolean` | yes |  | The widget seated the rail as a sheet over the conversation rather than beside it. |
| close | `() => void` | yes |  | Closes the sheet; a no-op on the inline rail. |
| logo | `ReactNode` | no |  | The brand row's mark, in both seats. |
| logoText | `string` | no |  | The brand row's text. Shown only on the sheet, where the chat header is hidden behind it; the inline rail leaves it out. |
| profile | `ThreadPanelProfile` | no |  | The signed-in person, shown on the inline rail. |
| collapsible | `boolean` | no | `true` | Whether the inline rail can collapse to its icon strip. |
| defaultExpanded | `boolean` | no | `false` | Whether the inline rail starts expanded. Defaults to `false`: it starts collapsed to its icon strip. The sheet, and a rail that is not `collapsible`, always show expanded. |
| historyLabel | `string` | no | `Chat history` | Accessible heading over the history. |
| threadPanelLabels | `Pick<ThreadPanelProps, "statusLabels" \| "collapseLabel" \| "expandLabel" \| "pinnedLabel" \| "threadMenuLabel" \| "renameLabel" \| "projectsLabel" \| "newProjectLabel">` | no |  | The words the ThreadPanel writes, merged over its English defaults: the spoken pin and status text ("Pinned", "Working"…), each row's menu trigger ("Thread options"), the rename field ("Rename thread"), the projects header and its add button ("Projects", "New project"), and the collapse toggle ("Collapse the panel", "Expand the panel"). The history's own name is `historyLabel`. |
| actionLabels | `Partial<Record<"pin" \| "unpin" \| "rename" \| "delete", string>>` | no |  | The rows of each thread's menu, by action; a key left out keeps its English. Defaults to "Pin", "Unpin", "Rename" and "Delete". |

## ChatTabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| ariaLabel | `string` | no | `Open chats` | Accessible name for the tab strip. |
| closeLabel | `string \| ((title: string) => string)` | no | `Close chat` | Accessible name of each tab's close button. A string is followed by a colon and the tab's title; a function is given the title and returns the whole name. Defaults to "Close chat". |
| statusLabels | `Partial<Record<ThreadTabStatus, string>>` | no |  | Spoken text for each tab's status, merged over ThreadTabs' English defaults (Working, Unread, Needs input, Failed). |

## ChatAgentPane props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| profile | `AgentRailProfile` | yes |  | The agent this pane belongs to: the portrait block at the top. |
| tabs | `AgentRailTab[]` | yes |  | The panes, in display order: activity, approvals, automations, personalisation, or whatever the agent has. |
| value | `string` | no |  | The tab on stage, when the host owns the state; otherwise the pane keeps its own, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | The tab on stage first when the pane keeps its own state. Defaults to the first tab. |
| onValueChange | `((id: string) => void)` | no |  | Fires with the chosen tab's id. |
| activeTab | `string` | no |  | Legacy name for `value`. Deprecated: Use `value` instead. |
| onTabChange | `((id: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| overlay | `boolean` | yes |  | The widget seated the pane as a bottom sheet, where it fills the width instead of holding its own column. |
| onClose | `(() => void)` | no |  | Fires from the pane's own close button, a cross in its top trailing corner. Omit for a pane with no close of its own. |
| closeLabel | `string` | no | `Close the agent panel` | Accessible name of the pane's own close button. Defaults to "Close the agent panel". |
| agentRailLabels | `Pick<AgentRailProps, "tabsLabel">` | no |  | The words the AgentRail writes, merged over its English defaults: the tab strip's name ("Agent views"). |

## ChatArtifactPane props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| artifact | `ChatArtifact \| null` | yes |  | The artifact on stage, or null for the empty state: the panel opened before the conversation has made anything. |
| expanded | `boolean` | no |  | Whether the widget is showing the pane at its expanded size. |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Fires with the next state from the expand toggle; omit where the seat has one size. |
| onClose | `(() => void)` | no |  | Fires from the pane's close button; omit where another control closes the seat. |
| emptyPanelTitle | `string` | no | `Artifacts` | The panel's title while nothing is on stage. Defaults to "Artifacts". |
| emptyTitle | `string` | no | `Nothing here yet` | The empty state's heading. Defaults to "Nothing here yet". |
| emptyDescription | `string` | no | `What the chat makes for you, like a dashboard or a page, opens in this panel.` | The empty state's description. Defaults to "What the chat makes for you, like a dashboard or a page, opens in this panel." |
| artifactPanelLabels | `Pick<ArtifactPanelProps, "collapseLabel" \| "closeLabel" \| "expandLabel" \| "previewLabel" \| "codeLabel" \| "viewLabel" \| "codeBlockLabels">` | no |  | The words the ArtifactPanel writes, merged over its English defaults: the view switch's segments and name ("Preview", "Code", "Artifact view"), the expand toggle and close button's names ("Expand the artifact", "Collapse the artifact", "Close the artifact"), and the code view's copy button and region (`codeBlockLabels`). |

## ChatArtifactCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| artifact | `ChatArtifact` | yes |  | The artifact this tile stands for. |
