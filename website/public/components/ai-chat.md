# AI chat

The whole AI chat: the panel, or the page itself in an app shell mode, the streaming replies, the history, the cards and questions a reply can carry and the server handlers, set up with props.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: widget
- Import: `import { ChatWidget, ChatProvider, ChatLauncher, ChatThreads, ChatTabs, ChatAgentPane, ChatArtifactPane, ChatArtifactCard } from 'rift-ds/chat';`
- Subpath `rift-ds/chat`: The widget, the provider, the launcher and the engine under them, with the hooks that let it follow the reader and write starters for what they picked. Optional peers: react-markdown, remark-gfm.
- Subpath `rift-ds/chat/server`: The streaming chat handler, with an opt-in tool for asking the visitor questions, its follow-ups, starters and feedback siblings, and the checks for what a reader highlighted, for any web-standard route. Optional peers: @anthropic-ai/sdk.
- Subpath `rift-ds/chat/actions`: The action definitions a page and its route share, their dry run and the mark that says a change was confirmed on its card, with no dependencies.
- Subpath `rift-ds/chat/upstash`: Rate limits, a daily budget and the exchange log over Upstash Redis, as the handlers' guardrails. Optional peers: @upstash/ratelimit, @upstash/redis.
- Subpath `rift-ds/chat/demo`: A scripted conversation with rich cards and fixtures, for a preview that needs no key. Optional peers: recharts.
- Subpath `rift-ds/chat/chat.css`: The widget's stylesheet.
- Scaffold: `npx rift-ds init chat`
- Composes: AgentRail, AgentStatus, AiButton, ArtifactCard, ArtifactPanel, AttachmentDropZone, AttachmentGroup, ChatHeader, ChatMessage, ChatThread, CircularButton, CodeBlock, Composer, DocumentChip, DropdownMenu, EmptyState, Mention, ModelPicker, PixelAvatar, PromptSuggestions, Prose, QuestionCard, Reasoning, ThreadPanel, ThreadTabs
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/ai-chat
- Schema: https://rift-ds.com/schema/components/ai-chat.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ChatWidget props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| fullscreenEnabled | `boolean` | no | `true` | Show the expand toggle. A host whose stage is always a takeover hides it. |
| closeEnabled | `boolean` | no | `true` | Show the header's close button. A host that seats the chat as the page itself rather than as a panel over one has nothing to close back to, so it turns this off. |
| placementEnabled | `boolean` | no | `false` | Show the header's Chat position menu (dock right, dock left, floating). Off by default: a host turns it on only when it implements the seats the menu offers, as ChatLauncher does. |
| compact | `boolean` | no | `false` | Narrow insets for phone-width hosts. |
| layout | `ChatLayout` | no |  | Seat the widget as a page in one of the three app shell modes, the ones AppLayout draws, for a host where the chat is the page (a chat home) rather than a panel over one. `flush` runs the history rail on the shell colour behind a hairline with the conversation crisp beside it; `floating` lifts the rail into a glass card off the edges; `inset` runs the rail flush on the shell colour and seats the conversation and each trailing panel in raised surfaces. Left out, the widget draws no shell of its own and takes its host's ground, as a docked or floating panel does. A widget narrower than the inline rail's 720px threshold has no room for a raised mode, so floating and inset lay out flush on the solid backdrop there, and below the mobile breakpoint every mode gives way to the plain full-screen chat. |
| backdrop | `ChatBackdrop` | no | `'blur'` | What the flush layout lies on, a chat's own lever: blur says the chat rests above something, solid that it is the floor of its own page. `blur` (the default, the site chat's takeover look) lays the glass and a strong blur over whatever is behind the widget, the history rail and the conversation clear on it; `solid` sets the rail on the shell colour beside a crisp conversation. App layouts and templates are always the floor, so they have no backdrop. Ignored without `layout`, and by the other modes. |
| phone | `boolean` | no | `false` | The host is a phone viewport, where the soft keyboard will claim the lower half of the screen the moment the composer is focused. The welcome screen stacks instead of centring the composer: greeting in the middle of the empty thread, starters directly above the composer, composer pinned to the bottom from the first paint. |
| title | `string` | no | `'Assistant'` | The header brand name, which also seeds the agent's PixelAvatar. Note: not the native `title` tooltip attribute; ChatWidget spreads no native attributes. |
| flow | `"top-down" \| "bottom-up"` | no | `'top-down'` | Which way the conversation reads. `top-down` (the default) floats each new turn to the top of the thread and streams the answer in below it. `bottom-up` is the classic message thread: turns stack from the bottom, the newest just above the composer, and the view follows the answer. |
| placeholder | `string` | no | `'Ask anything'` | The composer's placeholder text. |
| questionsPlaceholder | `string` | no | `'Answer the questions above, or skip them'` | The composer's placeholder while a set of questions holds it: the answer goes in the card, or the card is skipped. |
| showStarters | `boolean` | no | `true` | Show the conversation starters on the welcome screen. |
| logo | `string \| null` | no | `null` | The header mark's image src; null (the default) shows the name alone. |
| tagline | `string` | no | `'How can I help you today?'` | The welcome screen's line under the greeting. |
| starters | `Starter[]` | no |  | The conversation starters: a few pre-written questions. Each must fit the chip budget (SUGGESTION_MAX_CHARS); one that does not is dropped rather than clipped. |
| startersKey | `string` | no | `''` | Keys the starters' staged reveal: a new key replays the generation beat, the same key shows the set standing. A host whose starters follow the page passes the pathname. |
| startersPending | `boolean` | no | `false` | Holds the starters' shimmer while the host is still writing them, for starters a model generates: the set reveals the moment this turns false, without the staged beat. Off by default. |
| composerActions | `ReactNode` | no |  | Replaces the composer's leading actions (the model picker). |
| models | `ChatModelOption[]` | no |  | The models the picker offers. The pick rides on each send as a wire value; the server resolves it. Omit for no picker. |
| defaultModel | `string` | no |  | The picker's selection before the server has reported its default. Defaults to the first model. |
| lockedModelDescription | `string` | no | `'Paused for today to stay in budget.'` | The one line a locked model shows in place of its description. |
| fileAttachments | `boolean` | no | `false` | Let the visitor attach files: an attach button, paste, drop anywhere on the chat, and long pastes folded into a tile. Files are read in the browser for previews; what reaches the transport is names and kinds. |
| maxAttachments | `number` | no | `10` | Most files the visitor may queue on one message. |
| maxAttachmentBytes | `number` | no | `50 * 1024 * 1024` | Largest file the visitor may queue, in bytes. |
| mentions | `MentionSource[]` | no |  | What the visitor can reference while typing: one source per trigger character, drawn as tags in the composer and in the sent bubble. |
| threads | `RailSlot` | no |  | A session-history rail. `true` seats the built-in ChatThreads over the provider's thread lifecycle; a render prop seats your own. Wide hosts seat it as an inline left rail, narrow ones summon it from a header hamburger as a slide-over sheet behind a scrim. |
| threadsProps | `Omit<ChatThreadsProps, "close" \| "overlay">` | no |  | Props for the built-in threads rail when `threads` is `true`. |
| tabs | `boolean \| ReactNode` | no |  | An open-sessions tab strip as its own row under the header. `true` seats the built-in ChatTabs; a node seats your own. |
| tabsProps | `ChatTabsProps` | no |  | Props for the built-in tab strip when `tabs` is `true`: its name, its close buttons' names and its spoken statuses. |
| aside | `((ctx: { overlay: boolean; close: () => void; }) => ReactNode)` | no |  | A companion rail on the trailing edge, the mirror of `threads`: a render prop for your own pane, seated inline on a wide host and raised as a bottom sheet from a header button on a narrow one. For the built-in pane pass `agent` instead. |
| agent | `ChatAgentOptions` | no |  | The built-in agent pane: who the agent is and what it has been doing. Seated like `aside`. |
| artifacts | `boolean` | no | `false` | Seat the artifact panel: a reply that carries an artifact draws a tile in the thread, and the tile (or the header's artifact button) opens the artifact beside the conversation on a wide host and as a bottom sheet on a narrow one. The trailing seat holds one panel at a time, so an open artifact stands in for the agent pane. The panel's expand toggle gives it the conversation's room, never the history's: the history rail keeps its place, and Escape steps back. Off, none of it exists: no header button, no tile, no panel. |
| context | `ChatContext \| null` | no |  | What the chat is looking at, named on the composer's context note: a page, a selection, a passage. Omit for none. A host whose context follows the reader (rows they ticked, text they highlighted) updates it as they go, and can offer a way back and repeat it on each message sent. |
| contextClearLabel | `string` | no | `'Clear context'` | The accessible name of the context note's clear button, shown when `context.onClear` is set. Defaults to "Clear context". |
| contextLabel | `string \| null` | no |  | The composer's context note, naming what the chat is looking at. Deprecated: Use `context` with its `label`. |
| contextPlacement | `"inside" \| "above"` | no | `'inside'` | Where the context note sits: `inside` the composer, at the top of the shell, or `above` it as a bar of its own. Defaults to `inside`, the Composer's own default. A note alone never brings the composer's footer: with nothing else to seat there, it sits over the one-row composer. |
| contextNote | `((title: string) => string)` | no | `` (title: string) => `Looking at “${title}”` `` | The composer's context note, written from `contextLabel`, for a host still on the label prop; `context` takes its `note` as a line. Deprecated: Use `context` with its `note`. |
| attachHint | `((maxSize: string, maxFiles: number, maxBytes: number) => string)` | no | `` (maxSize: string, maxFiles: number) => `Up to ${maxSize} each · ${maxFiles} files max` `` | The second line of the drop overlay with attachments on, written from the limits: the largest file as text ("50 MB"), the most files per message, and the largest file in bytes for a host that formats sizes itself. Defaults to `Up to <maxSize> each · <maxFiles> files max`, which reads the first two and leaves `maxBytes` to a custom hint. |
| greetings | `Partial<GreetingCopy>` | no |  | The welcome greeting for each part of the visitor's day; a key left out keeps its English. Defaults to "Good morning", "Good afternoon" and "Good evening". |
| placementLabels | `Partial<Record<ChatPlacement, string>>` | no |  | The Chat position menu's rows, one per seat; a key left out keeps its English. Defaults to "Dock right", "Dock left" and "Floating". |
| agentStatus | `string` | no | `'Connected'` | The status line under the agent's name in the agent pane, where `agent` brings no `profile` of its own. Defaults to "Connected". |
| artifactPanelTitle | `string` | no | `'Artifacts'` | The artifact panel's title while nothing is on stage. Defaults to "Artifacts". |
| artifactEmptyTitle | `string` | no | `'Nothing here yet'` | The artifact panel's empty-state heading. Defaults to "Nothing here yet". |
| artifactEmptyDescription | `string` | no | `'What the chat makes for you, like a dashboard or a page, opens in this panel.'` | The artifact panel's empty-state description. Defaults to "What the chat makes for you, like a dashboard or a page, opens in this panel." |
| widgets | `ReactNode` | no |  | A widget slot on the welcome screen, under the composer and its starters. It takes any content and keeps its natural height, laid out by `widgetsLayout`, so the empty chat reads as a home page rather than a blank prompt. It leaves with the first message, like the rest of the welcome dressing. |
| widgetsLayout | `"scroll" \| "fit"` | no | `'fit'` | How the widget slot takes its room. `fit` keeps the welcome screen to one viewport: the composer holds dead centre as it does over the starters, the widgets hanging below it, and rides up only when they need more than half the room. `scroll` turns the welcome screen into a page: the greeting and composer take the opening of the viewport, the widgets run on below the fold, and the whole welcome scrolls as one. |
| widgetsWidth | `"wide" \| "column"` | no | `'column'` | How wide the widget slot runs. `column` holds it to the composer's bounding box; `wide` lets it run past them, for a dashboard. |
| disclaimer | `ReactNode` | no | `'Answers may be wrong.'` | The quiet line pinned to the widget's floor: what the chat is and where its policy lives. |
| startersLabel | `string` | no | `'Conversation starters'` | Accessible name of the welcome screen's conversation starters. Defaults to "Conversation starters". |
| newChatLabel | `string` | no | `'New chat'` | Accessible name of the header's new-chat button. Defaults to "New chat". |
| showAgentLabel | `string` | no | `'Show the agent panel'` | Accessible name of the agent-pane toggle while the pane is closed. Defaults to "Show the agent panel". |
| hideAgentLabel | `string` | no | `'Hide the agent panel'` | Accessible name of the agent-pane toggle while the pane is open. Defaults to "Hide the agent panel". |
| closeAgentLabel | `string` | no | `'Close the agent panel'` | Accessible name of the agent pane's own close button, and of the scrim that closes the pane's bottom sheet. Defaults to "Close the agent panel". |
| showArtifactLabel | `string` | no | `'Show the artifact panel'` | Accessible name of the artifact-panel toggle while the panel is closed. Defaults to "Show the artifact panel". |
| hideArtifactLabel | `string` | no | `'Hide the artifact panel'` | Accessible name of the artifact-panel toggle while the panel is open. Defaults to "Hide the artifact panel". |
| closeArtifactLabel | `string` | no | `'Close the artifact panel'` | Accessible name of the scrim that closes the artifact panel's bottom sheet. Defaults to "Close the artifact panel". |
| placementLabel | `string` | no | `'Chat position'` | Accessible name of the Chat position menu's button, and the heading of its group. Defaults to "Chat position". |
| enterFullscreenLabel | `string` | no | `'Enter full screen'` | Accessible name of the expand toggle in panel view. Defaults to "Enter full screen". |
| exitFullscreenLabel | `string` | no | `'Exit full screen'` | Accessible name of the expand toggle in full-screen view. Defaults to "Exit full screen". |
| closeLabel | `string` | no | `'Close chat'` | Accessible name of the header's close button. Defaults to "Close chat". |
| openThreadsLabel | `string` | no | `'Open the chat history'` | Accessible name of the header button that opens the chat-history sheet on a narrow host. Defaults to "Open the chat history". |
| closeThreadsLabel | `string` | no | `'Close the chat history'` | Accessible name of the scrim that closes the chat-history sheet. Defaults to "Close the chat history". |
| modelPickerLabel | `string` | no | `'Choose a model'` | Accessible name of the composer's model picker. Defaults to "Choose a model". |
| sendLabel | `string` | no | `'Send'` | Accessible name of the composer's send button. Defaults to "Send". |
| copyResponseLabel | `string` | no | `'Copy response'` | Accessible name of a reply's copy button. Defaults to "Copy response". |
| copiedResponseLabel | `string` | no | `'Copied'` | Accessible name of a reply's copy button once the copy has landed. Defaults to "Copied". |
| copiedAnnouncementLabel | `string` | no | `'Copied to clipboard'` | What screen readers hear once a reply has been copied. Defaults to "Copied to clipboard". |
| goodResponseLabel | `string` | no | `'Good response'` | Accessible name of a reply's thumbs-up button. Defaults to "Good response". |
| badResponseLabel | `string` | no | `'Bad response'` | Accessible name of a reply's thumbs-down button. Defaults to "Bad response". |
| followupsLabel | `string` | no | `'Follow-up questions'` | Accessible name of the follow-up question row under a finished answer. Defaults to "Follow-up questions". |
| pastedTextLabel | `string` | no |  | The name a long paste's tile wears in the composer and the sent message. Defaults to "Pasted text". |
| reasoningLabel | `((durationSeconds: number) => string)` | no |  | The reasoning disclosure's summary once the thinking is over, given the seconds it took when known. Defaults to "Thought for <n>s", or "Thought process" with no duration. |
| composerLabels | `Pick<ComposerProps, "aria-label" \| "attachmentTileLabels" \| "attachLabel" \| "dropLabel" \| "filesLabel" \| "formatFileAnnouncement" \| "formatMentionAnnouncement" \| "stopLabel">` | no |  | The composer's words, over Composer's English defaults: the attach button ("Attach files"), the drop overlay on the shell ("Drop files to attach"), the queued files' list ("Attachments") and their tiles (`attachmentTileLabels`), the stop button ("Stop generating"), the text field's name ("Message"), and the sentences announced when files or mention matches change. The send button's name is `sendLabel`. |
| attachmentDropZoneLabels | `Pick<AttachmentDropZoneProps, "label">` | no |  | The drop overlay's headline when a file is dragged over the chat with attachments on, over AttachmentDropZone's "Drop files to attach". Its second line is `attachHint`. |
| renderAttachmentPreview | `((item: AttachmentItem) => ReactNode)` | no |  | Draws a sent file in the viewer its tile opens, in place of the built-in view: a document renderer of the host's own, a spreadsheet. Return nothing to keep the built-in view, which shows pictures, pasted text, and a PDF or a text file that carries a `fileUrl`. |
| onAttachmentDownload | `((item: AttachmentItem) => void)` | no |  | Called with a sent file when the viewer's Download is pressed. Its presence renders the button. |
| attachmentGroupLabels | `Pick<AttachmentGroupProps, "label" \| "showMoreLabel" \| "showLessLabel" \| "attachmentTileLabels" \| "attachmentViewerLabels">` | no |  | The words of the files on a sent message, over AttachmentGroup's English defaults: the list's name ("Attachments"), the overflow buttons ("Show 3 more", "Show fewer"), the tiles' status lines (`attachmentTileLabels`) and the viewer a pressed file opens in (`attachmentViewerLabels`). |
| chatThreadLabels | `Pick<ChatThreadProps, "ariaLabel" \| "jumpLabel">` | no |  | The conversation's names, over ChatThread's English defaults: the scrolling region ("Conversation") and the scroll-to-latest control ("Scroll to the latest message"). |
| modelPickerLabels | `Pick<ModelPickerProps, "placeholder" \| "listLabel">` | no |  | The model picker's words, over ModelPicker's English defaults: the open list's name ("Model") and the trigger's text when nothing is selected ("Choose a model"). The trigger's own name is `modelPickerLabel`. |
| artifactPanelLabels | `Pick<ArtifactPanelProps, "collapseLabel" \| "closeLabel" \| "expandLabel" \| "previewLabel" \| "codeLabel" \| "viewLabel" \| "codeBlockLabels">` | no |  | The artifact panel's words, over ArtifactPanel's English defaults: the view switch ("Preview", "Code", "Artifact view"), the expand and close buttons ("Expand the artifact", "Collapse the artifact", "Close the artifact") and the code view's CodeBlock (`codeBlockLabels`). |
| agentRailLabels | `Pick<AgentRailProps, "tabsLabel">` | no |  | The agent pane's words, over AgentRail's English defaults: the tab strip's name ("Agent views"). The pane's close is `closeAgentLabel`. |
| questionCardLabels | `Partial<QuestionCardLabels>` | no |  | The words of a question card a reply ends in, over QuestionCard's English defaults: the step count ("1 of 3"), the buttons ("Back", "Next", "Send", "Skip"), the records ("Skipped", "Not answered", "(chosen)"), the pick lines ("Choose one") and the "Something else" row. |
| questionSummaryLabels | `Pick<QuestionSummaryProps, "missingLabel">` | no |  | The words of a sent set of answers, over QuestionSummary's English default: what stands in for a question left without an answer ("No answer"). |
| codeBlockLabels | `(Pick<CodeBlockProps, "copyLabel" \| "copyText" \| "copiedLabel"> & { codeLabel?: ((language: string) => string); })` | no |  | The words of a reply's fenced code, over CodeBlock's English defaults: the copy button ("Copy code", "Copy", "Copied"), and the code region's name, given the fence's language ("Code: bash", or "Code" with none). |
| promptSuggestionsLabels | `Pick<PromptSuggestionsProps, "chosenLabel">` | no |  | The follow-up row's words, over PromptSuggestions' English default: the hidden text read after the sent suggestion ("(chosen)"). The row's name is `followupsLabel`. |

## ChatProvider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| transport | `ChatTransport` | no |  | Where the conversation goes. Defaults to the fetch transport against `endpoint`, carrying the visitor's model pick. A script from `scriptChat()` runs the widget with no backend at all. |
| endpoint | `string` | no | `'/api/chat'` | The endpoint the default transport posts to. |
| getContext | `(() => string \| null)` | no |  | What the default transport sends as the request's context, read at each send: the page by default (`window.location.pathname`). A host whose chat follows more than the page (a highlight, a selection) returns its own string, which its handler's `sanitiseContext` checks. Pass a stable function (one that reads the latest state itself), since a new one makes a new transport. Ignored with a `transport`, which carries its own. |
| defaultPlacement | `ChatPlacement` | no | `'right'` | The seat the panel opens in. |
| followups | `string \| false \| FollowupsSource` | no | `'/api/chat/followups'` | Where follow-up questions come from after an answer commits: a source function, an endpoint for the built-in fetcher, or `false` for none: with `false` no chips show under an answer at all, not even the written `fallbackFollowups`. Defaults to the fetcher against `/api/chat/followups`. |
| fallbackFollowups | `readonly string[]` | no | `[ 'Can you say more about that?', 'What should I do next?', 'Where can I read more?', 'Can you give an example?', 'What are the alternatives?', ]` | The written questions offered when the source returns none or fails. Unused when `followups` is `false`. |
| feedback | `string \| false \| FeedbackSink` | no | `'/api/chat/feedback'` | Where a thumbs verdict goes: a sink function, an endpoint for the built-in poster, or `false` to hide the thumbs. Defaults to the poster against `/api/chat/feedback`. Thumbs only ever show on a turn the server logged (one with an exchange id). |
| renderers | `ChatCardRenderers` | no |  | Draws `card` events by kind. |
| artifactRenderers | `ChatArtifactRenderers` | no |  | Draws an artifact's preview by kind, for artifacts that are live React content rather than a document or a URL. |
| renderLink | `ChatLinkRenderer` | no | `(props) => <DefaultChatLink {...props} />` | Renders a same-site link in an answer. The default renders through the nearest LinkProvider's link component, else a plain anchor; passing this wins over both. |
| isInternalHref | `((href: string) => boolean)` | no | `(href: string) => INTERNAL_PATH.test(href)` | Which hrefs in an answer become links. Everything else renders as text. |
| threads | `ThreadsOptions` | no |  | Seeds the thread lifecycle behind the `threads` and `tabs` slots. |
| placeholders | `Partial<ChatPlaceholderCopy>` | no |  | Replacement copy for the words the hook writes itself, merged over the English defaults: the status line of a reply that has not started ("Thinking") and the placeholder replies for an empty, stopped or failed turn. |

## ChatLauncher props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `'Ask'` | The floating button's text. |
| icon | `string` | no | `'forum'` | The button's icon. |
| summary | `(AiButtonSummary & { chips?: { id: string; label: string; prompt: string; }[]; })` | no |  | A TLDR panel the button summons on hover: a pre-written summary and prompt chips. A tapped chip opens the chat and sends the chip's `prompt`. The launcher hands it to the closed button's AiButton, which opens the panel on pointer hover; it does no device or hydration gating of its own, so a host that wants the panel on hover-capable devices only, or kept out of server HTML, passes `summary` only there. |
| hidden | `boolean` | no | `false` | Render nothing at all: for routes that carry no chrome. Note: not the native `hidden` attribute, which keeps an element mounted and only hides it; the launcher unmounts its button and panel, and spreads no native attributes. |
| panelId | `string` | no | `'ds-chat-panel'` | The panel's DOM id, for a host control's `aria-controls`. |
| hostAttribute | `string \| false` | no | `'data-chat'` | The attribute the launcher writes on `<html>` to say how the panel sits (`docked`, `docked-left`, `takeover`), so the host's stylesheet can pad the page or hide it. `false` writes none. |
| panelLabel | `string` | no | `'Chat'` | Accessible name for the panel. |
| aiButtonLabels | `Pick<AiButtonProps, "dismissLabel" \| "summaryRegionLabel" \| "suggestionsLabel">` | no |  | The words of the floating button's summary panel, over AiButton's English defaults: the panel's name, given the summary's title ("Summary: <title>"), its dismiss button ("Dismiss summary") and its chips' group ("Suggested prompts"). |
| widget | `Omit<ChatWidgetProps, "compact" \| "fullscreenEnabled" \| "placementEnabled" \| "phone">` | no |  | Everything the widget takes. The launcher sets the responsive ones itself. |
| children | `ReactNode` | no |  | Rendered inside the panel after the widget: for a host's extra chrome. |
| surface | `"inset" \| "raised"` | no | `'raised'` | How the docked panel sits on the page. `raised` (the default) is a glass card with the floating shadow, inset by `--ds-chat-inset`. `inset` is AppLayout's `inset` content surface beside it, solid on the app surface colour with the same raised edge (the hairline and the floating shadow), no blur, and the `--ds-shell-inset` gap. The overlay below the dock threshold takes the same gap but keeps its shadow, since it still covers the page; the floating card and the takeover keep their own look. |

## ChatThreads props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| overlay | `boolean` | yes |  | The widget seated the rail as a sheet over the conversation rather than beside it. |
| close | `() => void` | yes |  | Closes the sheet; a no-op on the inline rail. |
| logo | `ReactNode` | no |  | The brand row's mark, in both seats. |
| logoText | `string` | no |  | The brand row's text. Shown only on the sheet, where the chat header is hidden behind it; the inline rail leaves it out. |
| profile | `ThreadPanelProfile` | no |  | The signed-in person, shown on the inline rail. |
| footerSlot | `ReactNode` | no |  | Rendered in the rail's footer in both seats (above the profile row on the inline rail; the sheet has none): a theme toggle, a link out. Fades out while the inline rail is collapsed. |
| collapsedFooterSlot | `ReactNode` | no |  | Rendered in the inline rail's footer while it is collapsed, in `footerSlot`'s place: the same controls at their smallest, stacked on the rail's axis, crossfading with the full form. The sheet never collapses, so it never shows. |
| collapsible | `boolean` | no | `true` | Whether the inline rail can collapse to its icon strip. |
| defaultExpanded | `boolean` | no | `false` | Whether the inline rail starts expanded. Defaults to `false`: it starts collapsed to its icon strip. The sheet, and a rail that is not `collapsible`, always show expanded. |
| historyLabel | `string` | no | `'Chat history'` | Accessible heading over the history. |
| threadPanelLabels | `Pick<ThreadPanelProps, "statusLabels" \| "collapseLabel" \| "expandLabel" \| "pinnedLabel" \| "threadMenuLabel" \| "renameLabel" \| "projectsLabel" \| "newProjectLabel">` | no |  | The words the ThreadPanel writes, merged over its English defaults: the spoken pin and status text ("Pinned", "Working"…), each row's menu trigger ("Thread options"), the rename field ("Rename thread"), the projects header and its add button ("Projects", "New project"), and the collapse toggle ("Collapse the panel", "Expand the panel"). The history's own name is `historyLabel`. |
| actionLabels | `Partial<Record<"pin" \| "unpin" \| "rename" \| "delete", string>>` | no |  | The rows of each thread's menu, by action; a key left out keeps its English. Defaults to "Pin", "Unpin", "Rename" and "Delete". |

## ChatTabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| ariaLabel | `string` | no | `'Open chats'` | Accessible name for the tab strip. |
| closeLabel | `string \| ((title: string) => string)` | no | `'Close chat'` | Accessible name of each tab's close button. A string is followed by a colon and the tab's title; a function is given the title and returns the whole name. Defaults to "Close chat". |
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
| closeLabel | `string` | no | `'Close the agent panel'` | Accessible name of the pane's own close button. Defaults to "Close the agent panel". |
| agentRailLabels | `Pick<AgentRailProps, "tabsLabel">` | no |  | The words the AgentRail writes, merged over its English defaults: the tab strip's name ("Agent views"). |

## ChatArtifactPane props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| artifact | `ChatArtifact \| null` | yes |  | The artifact on stage, or null for the empty state: the panel opened before the conversation has made anything. |
| expanded | `boolean` | no |  | Whether the widget is showing the pane at its expanded size. |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Fires with the next state from the expand toggle; omit where the seat has one size. |
| onClose | `(() => void)` | no |  | Fires from the pane's close button; omit where another control closes the seat. |
| emptyPanelTitle | `string` | no | `'Artifacts'` | The panel's title while nothing is on stage. Defaults to "Artifacts". |
| emptyTitle | `string` | no | `'Nothing here yet'` | The empty state's heading. Defaults to "Nothing here yet". |
| emptyDescription | `string` | no | `'What the chat makes for you, like a dashboard or a page, opens in this panel.'` | The empty state's description. Defaults to "What the chat makes for you, like a dashboard or a page, opens in this panel." |
| artifactPanelLabels | `Pick<ArtifactPanelProps, "collapseLabel" \| "closeLabel" \| "expandLabel" \| "previewLabel" \| "codeLabel" \| "viewLabel" \| "codeBlockLabels">` | no |  | The words the ArtifactPanel writes, merged over its English defaults: the view switch's segments and name ("Preview", "Code", "Artifact view"), the expand toggle and close button's names ("Expand the artifact", "Collapse the artifact", "Close the artifact"), and the code view's copy button and region (`codeBlockLabels`). |

## ChatArtifactCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| artifact | `ChatArtifact` | yes |  | The artifact this tile stands for. |

## Types

### AgentRailProfile

```ts
interface AgentRailProfile {
  /** The agent's display name, shown under the portrait; also seeds the Avatar's initials. */
  name: string;
  /** The portrait's image src, handed to an `lg` Avatar. Without one the rail draws its own agent mark instead, since initials would claim a person. Ignored when `avatar` is given. */
  avatarSrc?: string;
  /** Replaces the default portrait with a custom element — a hero portrait, an illustrated mark. */
  avatar?: React.ReactNode;
  /** A short line under the name, e.g. "Connected". Renders with a leading status dot. */
  status?: React.ReactNode;
  /** Which status role the dot under the name takes. */
  statusTone?: 'positive' | 'info' | 'warning' | 'error' | 'neutral';
  /** Fires when the portrait's edit affordance is pressed. The pencil renders only when this is given. */
  onEdit?: () => void;
  /** Accessible name for the portrait's edit affordance. */
  editLabel?: string;
}
```

### AgentRailProps

The props of AgentRail: `get_component("AgentRail")`.

### AgentRailTab

```ts
interface AgentRailTab {
  /** Stable identifier: `value` matches against it and `onValueChange` reports it. */
  id: string;
  /** The tab's label, shown beside its icon and used as the pane's accessible name. */
  label: string;
  /** Leading icon on the tab — Material Symbol name (string) or custom element (ReactNode). Give every tab one and a squeezed rail can fall back to icons alone; give none and it keeps the labels. */
  icon?: string | React.ReactNode;
  /** The pane rendered while this tab is active. */
  content?: React.ReactNode;
  /** Whether the tab is selectable. */
  disabled?: boolean;
}
```

### AiButtonProps

The props of AiButton: `get_component("AiButton")`.

### AiButtonSummary

The content of AiButton's summary panel.

```ts
interface AiButtonSummary {
  /** Overline label above the title. */
  overline?: string;
  /** Title line — usually the page or subject being summarized. */
  title: string;
  /** Small caption beside the overline, e.g. a reading time. */
  caption?: string;
  /** The pre-written summary the panel reveals. */
  text: string;
  /** Prompt chips under the summary; a tap reports through `onSummarySuggestion`. */
  suggestions?: PromptSuggestion[];
}
```

### ArtifactPanelProps

The props of ArtifactPanel: `get_component("ArtifactPanel")`.

### AttachmentDropZoneProps

The props of AttachmentDropZone: `get_component("AttachmentDropZone")`.

### AttachmentGroupProps

The props of AttachmentGroup: `get_component("AttachmentGroup")`.

### AttachmentItem

One attachment as the family passes it around: what a tile draws, what a
group lays out, and what `useAttachments` keeps. Plain data, so it
serialises and crosses the server boundary; the `File` itself stays with
whoever owns the upload.

```ts
interface AttachmentItem {
  /** Stable identity, unique within its list. */
  id: string;
  /** File name, extension included. */
  name: string;
  /** What kind of file it is. */
  kind: FileKind;
  /**
   * Short label on the file's type mark, replacing the one derived from its
   * kind and extension (`getFileTypeLabel`: "PDF", "DOC", the extension, or
   * "FILE"), wherever the family draws the mark: the tile, a lone picture's
   * badge, the viewer and a composer's queue. Set it to localise the mark or
   * to name a format the derivation does not know.
   */
  typeLabel?: string;
  /** Size in bytes. */
  size?: number;
  /** Mime type, when the source reported one. */
  mimeType?: string;
  /** Where the file is in its life. */
  status: AttachmentStatus;
  /** Upload progress, 0 to 100, while `status` is `uploading`. */
  progress?: number;
  /** Why it failed, while `status` is `error`. */
  error?: string;
  /** Image that fills the tile: an object URL for a picture, or a
      host-rendered first page for a document. */
  previewSrc?: string;
  /** Alt text for the preview. Defaults to the name. */
  previewAlt?: string;
  /** Full-size image for the viewer, when the preview is a thumbnail.
      Defaults to `previewSrc`. */
  src?: string;
  /** The file itself, for the viewer to show a PDF or a text file in place
      (through DocumentViewer) and for a picture with no `src`. Distinct
      from `src`, which is always an image. */
  fileUrl?: string;
  /** Intrinsic width of the preview, to reserve its shape before it loads. */
  width?: number;
  /** Intrinsic height of the preview. */
  height?: number;
  /** First lines of a pasted block, drawn as the tile's excerpt. */
  excerpt?: string;
}
```

### AttachmentStatus

Where an attachment is in its life: usable, on its way, failed, or gone.

```ts
type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';
```

### ChatAgentOptions

What the built-in agent pane shows.

```ts
interface ChatAgentOptions {
  /** The agent's portrait block. Defaults to the widget's title with the widget's `agentStatus` ("Connected" unless set). A profile with neither `avatar` nor `avatarSrc` wears a PixelAvatar seeded by the widget's title, the mark the header toggle wears. */
  profile?: AgentRailProfile;
  /** The panes, in display order. */
  tabs: AgentRailTab[];
  /** Open the pane at mount, where the panel is wide enough to seat it inline. Off by default: the header button opens it. */
  defaultOpen?: boolean;
}
```

### ChatArtifact

Something the chat made that is worth more room than a turn can give it: a
dashboard, a document, a page, a site. It travels as an ordinary card of
kind `ARTIFACT_CARD_KIND`, so any transport that can send a card can send
one; the thread draws it as a tile, and the tile opens the artifact panel
beside the conversation.

```ts
interface ChatArtifact {
  /** Stable identity: the same id reopened is the same artifact. */
  id: string;
  /** The artifact's name, on the tile and in the panel's header. */
  title: string;
  /**
   * How to draw it. `html` frames the `html` document, `url` frames the
   * `url`, `code` shows the `code` alone; any other kind is drawn by the
   * provider's `artifactRenderers`. An unknown kind with no renderer falls
   * back to whichever of `html`, `url` and `code` it carries.
   */
  kind: string;
  /** A quiet line beside the name: what it is, or which version. */
  meta?: string;
  /** A Material Symbol name for the tile and the header. */
  icon?: string;
  /** A complete HTML document, drawn in a sandboxed frame. */
  html?: string;
  /** A page to frame. Only http(s) URLs and same-site paths are framed. */
  url?: string;
  /** The source, offered as the panel's Code view. An `html` artifact offers its document when this is absent. */
  code?: string;
  /** The source's language. */
  language?: string;
  /** Whatever a custom renderer for `kind` expects. Must survive JSON. */
  data?: unknown;
}
```

### ChatArtifactRenderers

Draws an artifact's preview as a React node, keyed by the artifact's
`kind`. A kind with no renderer falls back to the built-in frames.

```ts
type ChatArtifactRenderers = Record<string, (artifact: ChatArtifact) => ReactNode>;
```

### ChatBackdrop

What a chat seated as a page lies on in the flush layout: the solid shell colour, or the glass and a strong blur over what lies behind.

```ts
type ChatBackdrop = 'solid' | 'blur';
```

### ChatCard

Rich content that can cross a network: a kind the host knows how to draw
and the data to draw it from. The provider's `renderers` map turns one
into a React node when the turn renders. A tool can answer with one from
the server handler, and a script can attach one to a reply.

```ts
interface ChatCard {
  /** The renderer key, e.g. "chart" or "plan". Unknown kinds render nothing. */
  kind: string;
  /** Whatever the renderer for `kind` expects. Must survive JSON. */
  data: unknown;
  /** The opening of a reply the host worked out before the model began, such as the readout of a change just confirmed: drawn first under the status line, which stays one row for the whole reply (its trace opens only on request) so the thinking never moves the card. */
  lead?: boolean;
}
```

### ChatCardRenderers

Draws a `card` event's data as a React node. Keyed by the card's `kind`;
a kind with no renderer draws nothing.

```ts
type ChatCardRenderers = Record<string, (data: unknown) => ReactNode>;
```

### ChatContext

What the chat is looking at, as the composer's context note shows it. One
object, so a host whose context follows the reader changes the label, the
line, the icon, the way back and what each sent message carries together.

```ts
interface ChatContext {
  /** What it is called: a page title, "ORD-1000116", "3 orders", a passage. The note says it, and a sent message's chip names it. */
  label: string;
  /** The note's whole line, for a host that words it itself. Defaults to `Looking at “<label>”`. */
  note?: string;
  /** The note's icon: a Material Symbol name, or your own element. Defaults to `description`. */
  icon?: string | ReactNode;
  /** Called by the note's clear button, which appears only when this is set: for a context that follows a selection and can go back to the page as a whole. Its name is `contextClearLabel`. */
  onClear?: () => void;
  /** Repeat the context above each message sent while it is set, so the thread keeps what each question was about. `true` draws `label` as a compact DocumentChip wearing `icon`; a function draws what it returns, called at the send, for a chip that does more, such as bringing its context back. A message sent with files keeps its files there instead. */
  sent?: boolean | (() => ReactNode);
}
```

### ChatEvent

```ts
type ChatEvent =
  /** A live status step: the AgentStatus label, with an optional reasoning trace point. */
  | { type: 'status'; label: string; point?: string }
  /** The model serving this exchange, as a display label ("Sonnet 5").
      The server's per-answer ground truth; kept in state but not rendered
      by the widget today, whose picker follows the `models` offer event. */
  | { type: 'model'; label: string }
  /** What the server is offering right now: the wire value it defaults to,
      and any values the day's budget has locked out. The picker follows
      this: the server owns the default and the lock, the client only
      expresses a preference. */
  | { type: 'models'; default: string; locked: string[] }
  /** A chunk of response text. The first delta ends the thinking phase. */
  | { type: 'delta'; text: string }
  /** The server-side log id for this exchange. Feedback references it, so a
      thumbs verdict can be joined back to the logged question and answer.
      A transport that never sends one hides the thumbs, which is what a
      script does. */
  | { type: 'exchange'; id: string }
  /** Follow-up questions to offer under the finished answer. A transport that
      can produce them yields this before `done`; the fetch transport cannot
      (they are written from the completed answer, so waiting for them would
      hold the turn open) and the provider fetches them after the turn
      commits instead. */
  | { type: 'followups'; items: string[] }
  /** Rich content, as a React node, drawn on the live reply as it arrives
      and kept with the committed turn. Only an in-browser transport can
      yield one (a script, or `injectTurn`); the network form is `card`. */
  | { type: 'content'; node: ReactNode }
  /** Rich content as serialisable data the provider's `renderers` draw,
      on the live reply as it arrives and with the committed turn. The form
      a server can send. */
  | { type: 'card'; card: ChatCard }
  /** Questions the agent asks with answers to pick, drawn under the committed
      turn in place of follow-ups: a turn that asks is never asked about. */
  | { type: 'question'; set: ChatQuestionSet }
  /** Terminal: the response is complete. */
  | { type: 'done' }
  /** A guardrail response (rate limit, circuit breaker): rendered as a normal assistant message. */
  | { type: 'notice'; text: string }
  /** A failure the user should see, phrased for humans. */
  | { type: 'error'; message: string };
```

### ChatFeedbackVerdict

The thumbs verdict a visitor can give an answer.

```ts
type ChatFeedbackVerdict = 'up' | 'down';
```

### ChatLayout

The three app shell modes a chat can be seated as a page in, AppLayout's and AppSidebar's (`AppSidebarLayout`), named here so the chat draws on the shell recipe without composing the sidebar.

```ts
type ChatLayout = 'flush' | 'floating' | 'inset';
```

### ChatLinkRenderer

How the widget renders a link the model wrote.

```ts
type ChatLinkRenderer = (props: {
  href: string;
  children: ReactNode;
  /** Call on navigation: closes the panel when it covers the page. */
  onNavigate: () => void;
}) => ReactNode;
```

### ChatModelOption

One model the widget can offer in its picker and the server handler can
serve. Shared by both halves so the wire value the client sends is one the
server knows.

```ts
interface ChatModelOption {
  /** Stable wire value: what the picker holds and the client sends. */
  value: string;
  /** The provider's model id the server calls. */
  id: string;
  /** Display name in the picker. */
  label: string;
  /** One line under the name in the picker. */
  description: string;
  /**
   * Whether the model takes adaptive thinking and the effort dial. A model
   * that predates them rejects both, so the handler sends it a plain request.
   */
  adaptiveThinking: boolean;
}
```

### ChatPlaceholderCopy

The copy the hook writes itself: the status line of a reply that has not started, and the reply it shows when a transport ends a turn with nothing to show.

```ts
interface ChatPlaceholderCopy {
  /** A completion that produced no text. */
  empty: string;
  /** The reader stopped the response before any text arrived. */
  stopped: string;
  /** The transport failed before any text arrived. */
  failed: string;
  /**
   * The status line of a reply in flight before the transport reports one of
   * its own. Defaults to "Thinking". Optional so a full object written
   * against the earlier shape still type-checks.
   */
  thinking?: string;
}
```

### ChatPlacement

A panel's seat: a dock edge, or floating free of both.

```ts
type ChatPlacement = ChatSide | 'floating';
```

### ChatQuestion

One question the agent asks: a prompt and the answers on offer. The shape QuestionCard draws.

```ts
type ChatQuestion = QuestionCardQuestion;
```

### ChatQuestionSet

Questions the agent asks at the end of a reply, with the answers it can
list: one question or a short set, each taking one option or several.
The reply's text asks in words too, so a transport or a renderer that
drops the set still leaves a conversation that reads correctly.

```ts
interface ChatQuestionSet {
  /** Stable identity within the conversation. */
  id: string;
  /** Asked one at a time when there is more than one. A set of more than one holds the composer until it is answered or skipped. */
  questions: ChatQuestion[];
}
```

### ChatSide

The edge a docked panel takes, and the edge it overlays from below the dock threshold.

```ts
type ChatSide = 'left' | 'right';
```

### ChatTabsProps

The props of ChatTabs: `get_component("ChatWidget", { export: "ChatTabs" })`.

### ChatThreadProps

The props of ChatThread: `get_component("ChatThread")`.

### ChatThreadsProps

The props of ChatThreads: `get_component("ChatWidget", { export: "ChatThreads" })`.

### ChatTransport

A transport streams events for one exchange. Abort the signal to stop it.

Contract notes for implementations:
- The consumer `break`s out of its `for await` loop on `done` (and on
  abort), which invokes the iterator's `return()`: close any underlying
  reader or connection in a `try/finally`.
- Check the signal between yields; the consumer also guards its own loop,
  but a transport that ignores abort keeps its own work running.
- There is no first-event timeout on the consumer side: a transport that
  can hang before its first yield should implement its own watchdog.

```ts
type ChatTransport = (
  messages: ChatTransportMessage[],
  signal: AbortSignal
) => AsyncIterable<ChatEvent>;
```

### ChatTransportMessage

```ts
interface ChatTransportMessage {
  role: 'user' | 'assistant';
  content: string;
  /**
   * What was attached to a user message: names and kinds, never bytes. The
   * scripted transport reads it to answer about the files. The fetch
   * transport drops it before the request is built, so nothing about an
   * attachment reaches the server.
   */
  attachments?: { name: string; kind: AttachmentItem['kind']; size?: number }[];
}
```

### ChatWidgetProps

The props of ChatWidget: `get_component("ChatWidget", { export: "ChatWidget" })`.

### CodeBlockProps

The props of CodeBlock: `get_component("CodeBlock")`.

### ComposerProps

The props of Composer: `get_component("Composer")`.

### FeedbackSink

Sends a thumbs verdict somewhere.

```ts
type FeedbackSink = (exchangeId: string, verdict: ChatFeedbackVerdict) => Promise<void>;
```

### FileKind

```ts
type FileKind =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'code'
  | 'text'
  | 'pasted'
  | 'generic';
```

### FollowupsSource

A source of follow-up questions for a finished answer.

```ts
type FollowupsSource = (
  question: string,
  answer: string,
  signal: AbortSignal
) => Promise<string[]>;
```

### GreetingCopy

The three greetings, overridable by a host that speaks differently.

```ts
interface GreetingCopy {
  morning: string;
  afternoon: string;
  evening: string;
}
```

### MentionItem

One thing a person can reference: a teammate, a file, a skill.

```ts
type MentionItem = {
  /** Stable identity, unique within its source. */
  id: string;
  /** The name shown in the menu and written into the text after the trigger character. */
  label: string;
  /** A quieter second phrase on the same row: a role, a path, what a skill does. */
  description?: string;
  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */
  icon?: string | React.ReactNode;
  /** Extra words the filter matches on besides the label. */
  keywords?: string[];
  /** Listed but not choosable. */
  disabled?: boolean;
};
```

### MentionSource

Everything one trigger character opens: `@` for entities, `/` for skills.

```ts
type MentionSource = {
  /** The single character that opens this source. */
  trigger: string;
  /** The items it offers. */
  items: MentionItem[];
  /** Accessible name for this source's menu ("People", "Skills"). */
  label?: string;
};
```

### ModelPickerProps

The props of ModelPicker: `get_component("ModelPicker")`.

### PromptSuggestion

One tappable suggestion in the row.

```ts
interface PromptSuggestion {
  /** Stable identifier passed to `onValueChange`. */
  id: string;
  /** The suggestion text shown in the chip. */
  label: string;
  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */
  icon?: string | React.ReactNode;
  /** A quiet second line under the label, drawn by the `tiles` and `cards` layouts: what the tile leads to, or the full question a card asks. The chip layouts have no room for it and leave it out. */
  description?: string;
}
```

### PromptSuggestionsProps

The props of PromptSuggestions: `get_component("PromptSuggestions")`.

### QuestionCardLabels

Every word the card draws itself, for a host writing in another voice or language.

```ts
interface QuestionCardLabels {
  /** The last row's label when `other` is set. */
  other: string;
  /** The placeholder of the field that row opens. */
  otherPlaceholder: string;
  /** The button that sends the answers. */
  submit: string;
  /** The button that moves to the next question in a set. */
  next: string;
  /** The button that moves back a question in a set. */
  back: string;
  /** The button that declines to answer, shown when `onSkip` is passed. */
  skip: string;
  /** The line an answered-by-skipping card shows. */
  skipped: string;
  /** The line a card shows when the moment to answer passed. */
  unanswered: string;
  /** The step count beside a set's heading. */
  step: (current: number, total: number) => string;
  /** The line above a one-answer question's options. */
  chooseOne: string;
  /** The line above a several-answer question's options, from its `min` and `max`. */
  chooseMany: (min: number, max: number, total: number) => string;
  /** Visually hidden text read after each picked option in the answered record. Defaults to "(chosen)". */
  chosen?: string;
}
```

### QuestionCardOption

One answer a question offers.

```ts
interface QuestionCardOption {
  /** Stable identifier reported in the answer's `values`. */
  value: string;
  /** The answer as the person would say it, e.g. "Next.js". One line. */
  label: string;
  /** A quiet second line under the label: what choosing it means. */
  description?: string;
}
```

### QuestionCardQuestion

One question the card asks.

```ts
interface QuestionCardQuestion {
  /** Stable identifier reported in the answer's `questionId`. */
  id: string;
  /** The question in a few words, e.g. "Which framework?". Shown as the step's heading in a set, and the options' accessible name always. */
  prompt: string;
  /** `single` takes one option, `multi` any number of them. */
  mode?: 'single' | 'multi';
  /** The answers on offer, in order. */
  options: QuestionCardOption[];
  /** Offer a last "Something else" row that opens a text field, for an answer the options do not hold. */
  other?: boolean;
  /** `multi` only: the fewest options that make an answer. Defaults to 1. */
  min?: number;
  /** `multi` only: the most options that can be picked. Defaults to all of them. */
  max?: number;
}
```

### QuestionSummaryItem

One question in a summary, and what was answered to it.

```ts
interface QuestionSummaryItem {
  /** The question, as it was asked. */
  prompt: string;
  /** Every answer given, as the person would say each one. Empty when none was. */
  answers: string[];
}
```

### QuestionSummaryOwnProps

Props owned by QuestionSummary itself — everything else falls through to the root element.

```ts
type QuestionSummaryOwnProps = {
  /** The questions and their answers, in the order they were asked. */
  items: QuestionSummaryItem[];
  /** What stands in the answer's place for a question left without one. */
  missingLabel?: string;
  /**
   * `card` draws the summary in its own hairline frame, as a set's record
   * under the reply that asked it. `plain` drops the frame, for a surface
   * that brings its own, such as the message bubble that sent the answers.
   */
  variant?: 'card' | 'plain';
  /** Additional CSS classes */
  className?: string;
};
```

### QuestionSummaryProps

```ts
interface QuestionSummaryProps
  extends QuestionSummaryOwnProps,
    Omit<React.ComponentPropsWithoutRef<'dl'>, keyof QuestionSummaryOwnProps> {}
```

### RailSlot

A rail slot: the widget's own panel, or a render prop for a custom one.

```ts
type RailSlot = boolean | ((ctx: { overlay: boolean; close: () => void }) => ReactNode);
```

### Starter

One conversation starter on the welcome screen.

```ts
interface Starter {
  id: string;
  label: string;
}
```

### ThreadPanelGroup

```ts
interface ThreadPanelGroup {
  /** Group heading in the rails' shared mixed-case style, e.g. a project or repo name. Omit for an unlabelled run of threads. */
  label?: string;
  /** The group's threads, in display order. */
  threads: ThreadPanelThread[];
}
```

### ThreadPanelProfile

```ts
interface ThreadPanelProfile {
  /** The signed-in person's display name; also seeds the Avatar's initials. */
  name: string;
  /** The quiet second line under the name, e.g. the person's email, plan or workspace (AppSidebar's profile block carries the email there). */
  meta?: string;
  /** Replace the initials Avatar with a custom element, e.g. an `<Avatar src>`; the row seats a 40px mark (Avatar at `md`). */
  avatar?: React.ReactNode;
}
```

### ThreadPanelProject

```ts
interface ThreadPanelProject {
  /** Stable identifier: `activeProjectId` matches against it and `onProjectSelect` reports it. */
  id: string;
  /** The project's name. */
  label: string;
  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). Omit it and the row draws the project's generated PixelAvatar, which is the default mark. */
  icon?: string | React.ReactNode;
  /** Seed for the generated PixelAvatar a project wears when it has no `icon`. Defaults to `label`; pass a stable id so a renamed project keeps its character. The panel spreads the inks across its projects, so neighbours differ in colour as well as shape. */
  pixelAvatar?: string;
  /** Small trailing annotation in the caption face, e.g. how recently the project was touched. */
  meta?: string;
  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */
  href?: string;
}
```

### ThreadPanelProps

The props of ThreadPanel: `get_component("ThreadPanel")`.

### ThreadPanelThread

```ts
interface ThreadPanelThread {
  /** Stable identifier: `activeThreadId` matches against it and `onThreadSelect` reports it. */
  id: string;
  /** The thread's one-line title. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the row's native tooltip. */
  title: string;
  /** Optional href — the row renders as an `<a>` for real navigation instead of a `<button>`. */
  href?: string;
  /** Small trailing annotation in the caption face, e.g. a relative timestamp. */
  meta?: string;
  /** The title is still being generated: the row shows a shimmer bar in the title's place and hides its menu, keeping `title` (e.g. "New chat") as the accessible name. */
  pending?: boolean;
  /** This thread's own menu actions, overriding the panel-wide `threadActions`. */
  actions?: ThreadPanelThreadAction[];
  /** Quiet second line under the title in the caption face — a repo, an environment, a one-line summary. Overflows under the same trailing mask as the title. */
  description?: string;
  /** The thread's state, drawn as the dot leading the row: `idle` (nothing new, nothing running), `working` (an agent is running now), `unread` (finished, not yet seen), `waiting` (blocked on the reader) or `error` (stopped on a failure). Once any thread in the panel carries a status every row draws a dot, the rest reading `idle`, so the titles share one left edge. The dot is decorative; every state but `idle` is also read aloud through `statusLabels`. */
  status?: ThreadPanelThreadStatus;
  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */
  unread?: boolean;
  /** Trailing icon before the meta — Material Symbol name (string) or custom element (ReactNode), e.g. `cloud` for a session that lives remotely. */
  icon?: string | React.ReactNode;
  /** Marks the thread pinned with a trailing pin glyph, read aloud through the panel's `pinnedLabel`. A marker only: the host groups pinned threads (typically a leading group) and offers pin/unpin through the row menu. */
  pinned?: boolean;
}
```

### ThreadPanelThreadAction

```ts
interface ThreadPanelThreadAction {
  /** Stable identifier reported through `onThreadAction`. */
  id: string;
  /** Menu row text. */
  label: string;
  /** Leading icon on the menu row — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Destructive styling (the error text colour) for delete-like actions. */
  destructive?: boolean;
}
```

### ThreadPanelThreadStatus

What a thread's leading dot reports. Fill says whether the thread wants
the reader, colour says what it wants, motion says it is live right now:
`idle` is a hollow neutral ring, `working` a pulsing neutral dot, and
`unread`, `waiting` and `error` solid dots in the info, warning and error
roles.

```ts
type ThreadPanelThreadStatus =
  | 'idle'
  | 'working'
  | 'unread'
  | 'waiting'
  | 'error';
```

### ThreadsLabels

The words the thread engine writes into its state, each with an English default.

```ts
interface ThreadsLabels {
  /** The row menu's pin action. Defaults to "Pin". */
  pin?: string;
  /** The row menu's unpin action. Defaults to "Unpin". */
  unpin?: string;
  /** The row menu's rename action. Defaults to "Rename". */
  rename?: string;
  /** The row menu's delete action. Defaults to "Delete". */
  delete?: string;
  /** A new project's name, given its ordinal. Defaults to "New project <n>". */
  newProject?: (index: number) => string;
  /** A new project's meta line. Defaults to "now". */
  newProjectMeta?: string;
}
```

### ThreadsOptions

```ts
interface ThreadsOptions {
  /** The history to start from. The groups' labels are the host's. */
  groups?: ThreadPanelGroup[];
  /** The projects section, when the rail shows one. */
  projects?: ThreadPanelProject[];
  /** The group pinned threads move into. Created on first pin when absent. */
  pinnedGroup?: string;
  /** The group a new thread is born into. Defaults to the first non-pinned group. */
  homeGroup?: string;
  /**
   * The name a new thread gets once its shimmer resolves. Called with the
   * thread's ordinal; a host with a real title generator returns a promise.
   */
  nameThread?: (index: number) => string | Promise<string>;
  /** How long the naming shimmer runs. */
  namingDelayMs?: number;
  /** Offer pin and unpin in each row's menu, and keep the pinned group. */
  pins?: boolean;
  /** Keep each row's detail anatomy (description, status, icon, meta). Off strips rows to bare titles. */
  details?: boolean;
  /** The label of the New chat row and tab. */
  newThreadLabel?: string;
  /** The row actions' names and a new project's name and meta, merged over their English defaults. */
  labels?: ThreadsLabels;
  /** Called when a thread is selected, so a host can load its conversation. */
  onSelect?: (threadId: string) => void;
  onRename?: (threadId: string, title: string) => void;
  onDelete?: (threadId: string) => void;
  onPin?: (threadId: string, pinned: boolean) => void;
}
```

### ThreadTabsProps

The props of ThreadTabs: `get_component("ThreadTabs")`.

### ThreadTabStatus

What a tab's leading dot reports — ThreadPanel's thread statuses, so a session reads the same in the rail and in the strip.

```ts
type ThreadTabStatus = 'idle' | 'working' | 'unread' | 'waiting' | 'error';
```

Types from other packages: `AbortSignal` (typescript), `AsyncIterable` (typescript), `ComponentPropsWithoutRef` (react), `Omit` (typescript), `Partial` (typescript), `Pick` (typescript), `Promise` (typescript), `ReactNode` (react), `Record` (typescript).
