import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * The chat widget's anatomy as an architecture map: the client half, from
 * the provider that holds the conversation to the surface that draws it,
 * and the one function type that joins it to any backend. Editorial data,
 * like the maps on /overview: the server half is /overview's own
 * chatExchangeMap, reused on /chat rather than redrawn.
 */
export const widgetMap: ArchMap = {
  id: "chat-widget",
  title: "The widget",
  label:
    "ChatProvider holds the conversation and hands it to ChatWidget and ChatLauncher; a transport, one function, is the whole integration with a backend.",
  width: 1600,
  height: 760,
  nodes: [
    { id: "z-widget", x: 60, y: 70, w: 980, h: 620, kind: "zone", title: "rift-ds/chat", sub: "mounted once, high in the tree" },
    { id: "provider", x: 100, y: 160, w: 420, h: 90, title: "ChatProvider", sub: "the conversation, the open state, the placement, the thread lifecycle", icon: "memory", chip: "info" },
    { id: "usechat", x: 100, y: 330, w: 420, h: 76, title: "useChat", sub: "turns · the live turn · send, stop, reset, injectTurn", icon: "settings_suggest", chip: "info" },
    { id: "usethreads", x: 100, y: 480, w: 420, h: 76, title: "useThreads", sub: "born on the first utterance · pin · rename · delete · tabs", icon: "forum", chip: "info" },
    { id: "widget", x: 600, y: 160, w: 400, h: 90, title: "ChatWidget", sub: "header · thread · composer · starters · rails · cards", icon: "chat", chip: "positive" },
    { id: "launcher", x: 600, y: 330, w: 400, h: 76, title: "ChatLauncher", sub: "the button and the panel: docked, overlay, floating, takeover", icon: "open_in_new", chip: "positive" },
    { id: "renderers", x: 600, y: 480, w: 400, h: 76, title: "renderers", sub: "card kind → component: charts, plans, diffs, approvals", icon: "dashboard_customize", chip: "neutral" },
    { id: "transport", x: 1140, y: 160, w: 400, h: 90, title: "A transport", sub: "(messages, signal) => AsyncIterable<ChatEvent>", icon: "swap_horiz", chip: "action" },
    { id: "fetch", x: 1140, y: 330, w: 400, h: 76, title: "createFetchTransport", sub: "NDJSON from createChatHandler", icon: "cloud", chip: "neutral" },
    { id: "script", x: 1140, y: 480, w: 400, h: 76, title: "scriptChat()", sub: "a conversation written in advance, no key", icon: "theater_comedy", chip: "neutral" },
  ],
  edges: [
    { id: "provider-usechat", from: "provider", to: "usechat", label: "owns" },
    { id: "provider-usethreads", from: "provider", to: "usethreads", label: "owns", bend: 40 },
    { id: "provider-widget", from: "provider", to: "widget", label: "context" },
    { id: "provider-launcher", from: "provider", to: "launcher", label: "open · placement · view", bend: 30 },
    { id: "renderers-widget", from: "renderers", to: "widget", label: "draws a reply's card", bend: -30 },
    { id: "transport-usechat", from: "transport", to: "usechat", label: "status, delta, card, followups, done", kind: "accent", bend: -60 },
    { id: "fetch-transport", from: "fetch", to: "transport", label: "one implementation" },
    { id: "script-transport", from: "script", to: "transport", label: "another", bend: 30 },
  ],
};
