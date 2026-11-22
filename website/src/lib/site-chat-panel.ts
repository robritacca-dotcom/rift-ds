/**
 * What the site chat's own panel shows, for the model. The chat is on the
 * visitor's screen, so a question about "this", "the dots", "that chip" or
 * "the note above the box" is often about the panel the model answers in.
 *
 * The widget and its parts come from the generated screens file (the widget
 * registry's `parts`, each resolved to its page). The walk through the panel
 * below describes the configuration in website/src/components/SiteChat/
 * (useSiteWidgetProps.tsx and SiteChatProvider.tsx) and the reply anatomy in
 * src/chat/AssistantTurn.tsx: a change there that adds, removes or redraws a
 * visible part changes this text in the same change. Everything here is
 * visible to anyone who opens the chat, so it is public like the corpus.
 */
import { chatPanel } from "@/data/page-screens.generated";

const link = ({ label, path }: { label: string; path: string }) => `${label} (${path})`;

export const CHAT_PANEL_LINES = [
  `The chat panel the visitor is typing in is this site's own chat: the library's ${link(chatPanel)}, set up as /docs/chat describes.`,
  "Top to bottom it shows: a header with the assistant's name, a new-chat button and close. " +
    "Then the conversation: each of the visitor's messages, with your reply under it. " +
    "Every reply opens with one status line, a Reasoning disclosure whose summary is an Agent status. While you work, its dots run and its label names the step you are on: this is the live status. " +
    'Once the reply lands, the dots draw a tick in the positive status colour (a cross in the error colour if the reply failed), and the label settles to how long you thought, such as "Thought for 4s", with a chevron that opens your reasoning trace when there is one. ' +
    "Under the reply's prose: a row of actions (copy, thumbs up, thumbs down), then follow-up question chips (Prompt suggestions). " +
    'Above the box they type in, a context note says what the chat is looking at: the page\'s name, or "Looking at" and the words they highlighted, with a button back to the whole page. ' +
    "The composer holds the text box, the model picker and the send button.",
  `The panel is built from: ${chatPanel.parts.map(link).join(", ")}.`,
];
