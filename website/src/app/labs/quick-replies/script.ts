/**
 * The quick-replies lab's script: five levels of how an agent's reply can
 * end, each one a self-contained exchange for a fictional workspace product
 * (Acme) getting ready for a launch. Every option and every typed answer
 * routes to a reply written for it, so whatever the visitor picks or types,
 * the conversation reads as a real one.
 *
 * Played through the package's scripted transport (scriptChat), with one
 * thin wrapper for level one: an open question has no card, so the answer
 * arrives as free text, and the wrapper routes free text that follows the
 * open question to the reply written for it rather than to the fallback.
 */
import { createSimTransport, scriptChat, type ScriptedReply } from "rift-ds/chat";
import type { ChatTransport } from "rift-ds/chat";

/* ------------------------------------------------------------ the levels */

export interface QuickReplyLevel {
  id: string;
  /** The eyebrow: what the visitor does with it. Read down the list, it climbs. */
  action: string;
  title: string;
  /** When an agent should end a reply this way, in one line. */
  when: string;
  /** What to do in the chat while it plays. */
  tryIt: string;
  /** The visitor's message that opens the exchange. */
  prompt: string;
}

export const LEVELS: QuickReplyLevel[] = [
  {
    id: "open",
    action: "You type",
    title: "Open question",
    when: "When the answer is easy to say in your own words.",
    tryIt: "Send the reply we started, or write your own.",
    prompt: "Help me write the launch page",
  },
  {
    id: "chips",
    action: "You can tap",
    title: "Suggested follow-ups",
    when: "When the next question is not obvious. Take one or ignore them.",
    tryIt: "Tap a suggestion, or type something else.",
    prompt: "What do the plans include?",
  },
  {
    id: "single",
    action: "You pick one",
    title: "Single choice",
    when: "When the agent needs one answer before it can go on.",
    tryIt: "Tap an option. That sends it.",
    prompt: "Help me pick a plan",
  },
  {
    id: "multi",
    action: "You pick several",
    title: "Multiple choice",
    when: "When more than one answer can be true.",
    tryIt: "Tick everything that applies, then Send.",
    prompt: "Set up notifications for me",
  },
  {
    id: "set",
    action: "You answer a few",
    title: "Set of questions",
    when: "When the agent needs a few answers before it starts.",
    tryIt: "Answer one at a time. The chat waits until you finish.",
    prompt: "Plan our launch kickoff",
  },
];

/* ------------------------------------------------------- level 1: open */

/** The open question, word for word: the wrapper finds it in the history. */
export const OPEN_ASK =
  "Happy to draft it. What should the launch page lead with? A sentence in your own words is plenty.";

/** The answer level one pre-types into the composer, ready to send or rewrite. */
export const OPEN_SUGGESTED_ANSWER = "Lead with the team plan";

function openAnswered(answer: string): ScriptedReply {
  const said = answer.toLowerCase();
  if (said.includes("team plan") || said.includes("team")) {
    return {
      steps: [{ status: "Drafting the page", point: "The lead is the Team plan; everything else supports it." }],
      text:
        "Good call. The draft leads with the Team plan: the headline names shared workspaces, " +
        "the next section shows guest seats and version history, and the page ends on one " +
        "call to action, Start a free trial.",
      followups: [],
    };
  }
  return {
    steps: [{ status: "Drafting the page", point: "Build the page around the lead the visitor gave." }],
    text:
      "Got it, the draft leads with that. The headline carries it, the next section shows " +
      "what it means day to day, and the page ends on one call to action, Start a free trial.",
    followups: [],
  };
}

/* ------------------------------------------------------ level 2: chips */

const PLANS_ANSWER =
  "Every plan includes unlimited projects. The Team plan adds shared workspaces, guest seats, and 90 days of version history.";

/* ----------------------------------------------- level 3: single choice */

const TEAM_SIZES = [
  { value: "solo", label: "Just me" },
  { value: "small", label: "2 to 10 people" },
  { value: "medium", label: "11 to 50 people" },
  { value: "large", label: "More than 50" },
];

function planFor(answer: string): ScriptedReply {
  const said = answer.trim().toLowerCase();
  const step = [{ status: "Matching the plan", point: "Team size decides the plan; nothing else differs." }];
  if (said === "just me") {
    return {
      steps: step,
      text: "Then the Starter plan covers you: unlimited projects and no seats to manage. It is free for as long as you work alone.",
      followups: [],
    };
  }
  if (said === "2 to 10 people" || said === "11 to 50 people") {
    return {
      steps: step,
      text: `For ${said}, the Team plan fits: a shared workspace everyone edits, and guest seats stay free.`,
      followups: [],
    };
  }
  if (said === "more than 50") {
    return {
      steps: step,
      text: "At that size, the Business plan fits: single sign-on, audit logs, and seats pooled across teams.",
      followups: [],
    };
  }
  /* Typed instead of tapped: the words can be anything, so the reply leans
     on the safe default rather than repeating them back. */
  return {
    steps: step,
    text:
      "Thanks. Going by that, the Team plan is the safe start: it covers anything from 2 to 50 people, " +
      "and you can move up or down in any month.",
    followups: [],
  };
}

/* --------------------------------------------- level 4: multiple choice */

const NOTIFICATION_PHRASES: Record<string, string> = {
  mentions: "mentions",
  comments: "comments on your files",
  "weekly summary": "the Monday summary",
};

const listed = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

function notificationsFor(answer: string): ScriptedReply {
  const parts = answer.split(",").map((part) => part.trim()).filter(Boolean);
  const known = parts.filter((part) => NOTIFICATION_PHRASES[part.toLowerCase()]);
  const other = parts.filter((part) => !NOTIFICATION_PHRASES[part.toLowerCase()]).join(", ");
  const phrases = known.map((part) => NOTIFICATION_PHRASES[part.toLowerCase()]);
  const step = [{ status: "Saving your settings", point: "Turn on what was picked, everything else off." }];

  if (phrases.length === 0) {
    return {
      steps: step,
      text: `Done. I have set up a custom alert for “${other}” and left everything else off. Change it any time in Settings.`,
      followups: [],
    };
  }
  const extra = other ? `, plus a custom alert for “${other}”` : "";
  return {
    steps: step,
    text: `Done. You will hear about ${listed(phrases)}${extra}, and nothing else. Change it any time in Settings.`,
    followups: [],
  };
}

/* ------------------------------------------------ level 5: a set of them */

const KICKOFF_WHEN = "When should it happen?";
const KICKOFF_WHO = "Who should be there?";
const KICKOFF_FORMAT = "What format?";

/** One question's answer out of the set's serialised reply, or null. */
function answerTo(answer: string, prompt: string): string | null {
  const line = answer.split("\n").find((entry) => entry.startsWith(prompt));
  if (!line) return null;
  const value = line.slice(prompt.length).trim();
  return value === "" || value === "(no answer)" ? null : value;
}

function kickoffFor(answer: string): ScriptedReply {
  const asked = [KICKOFF_WHEN, KICKOFF_WHO, KICKOFF_FORMAT].some((prompt) => answer.includes(prompt));
  if (!asked) {
    /* The set was skipped and something else typed: nothing gets booked. */
    return {
      steps: [{ status: "Holding the kickoff", point: "No answers to the set; book nothing." }],
      text: "No problem, nothing is booked. Ask me to plan the kickoff again whenever you are ready.",
      followups: [],
    };
  }

  const whenRaw = answerTo(answer, KICKOFF_WHEN);
  const when =
    whenRaw === "This week"
      ? "this week"
      : whenRaw === "Next week"
        ? "next week"
        : whenRaw === "After the beta"
          ? "the week after the beta closes"
          : "at the first slot that suits everyone";

  const whoRaw = answerTo(answer, KICKOFF_WHO);
  const who = whoRaw ? listed(whoRaw.split(",").map((team) => team.trim())) : "the whole launch team";

  const formatRaw = answerTo(answer, KICKOFF_FORMAT);
  const steps = [
    { status: "Booking the kickoff", point: "Find the first slot everyone named is free." },
    { status: "Drafting the agenda", point: "Lead with the launch dates, then the owners." },
  ];

  if (formatRaw === "An async update") {
    return {
      steps,
      text:
        `Set. The kickoff goes out ${when} as an async update to ${who}. ` +
        "I will draft it from the launch plan and share it for comments first.",
      followups: [],
    };
  }
  const format =
    formatRaw === "In person"
      ? "in person"
      : formatRaw === "A video call"
        ? "on a video call"
        : formatRaw
          ? `as ${formatRaw.replace(/[.!?]$/, "")}`
          : "on a video call";
  return {
    steps,
    text:
      `Booked. The kickoff is ${when}, ${format}, with ${who}. ` +
      "The slot is held on every calendar, and the agenda is being drafted from the launch plan.",
    followups: [],
  };
}

/* ------------------------------------------------------------ the script */

const SCRIPT = scriptChat()
  .user("Help me write the launch page")
  .assistant(OPEN_ASK, {
    steps: [{ status: "Reading the launch plan", point: "The page needs one lead message, and only the team can say which." }],
    /* An open question ends in nothing to tap: the composer is the answer. */
    followups: [],
  })
  .user("What do the plans include?")
  .assistant(PLANS_ANSWER, {
    steps: [
      { status: "Comparing the plans", point: "Three plans differ on collaboration, not on limits." },
      { status: "Drafting the answer", point: "Name what the Team plan adds over the base." },
    ],
    followups: ["What does the Team plan cost?", "Help me pick a plan", "Where is that written down?"],
  })
  .user("What does the Team plan cost?")
  .assistant(
    "$12 per editor a month, or $10 billed yearly. Viewers and guests are free, and a seat you remove mid-cycle comes back as credit.",
    {
      steps: [{ status: "Reading the pricing", point: "Per editor, monthly or yearly; viewers are free." }],
      followups: ["Where is that written down?", "Help me pick a plan"],
    }
  )
  .user("Where is that written down?")
  .assistant(
    "On the pricing page, under Compare plans. The seat rules live in the workspace docs, under Billing.",
    {
      steps: [{ status: "Finding the source", point: "The pricing page and the billing docs back the answer." }],
      followups: ["What does the Team plan cost?", "Help me pick a plan"],
    }
  )
  .user("Help me pick a plan")
  .assistant("Happy to. How big is the team that will use the workspace?", {
    steps: [{ status: "Reading the plans", point: "Plans differ by team size; ask before recommending." }],
    question: {
      id: "team-size",
      questions: [{ id: "size", prompt: "How big is the team?", options: TEAM_SIZES, other: true }],
    },
    answered: planFor,
  })
  .user("Set up notifications for me")
  .assistant("Sure. Which of these should reach you? Pick as many as you like.", {
    steps: [{ status: "Reading your settings", point: "Three kinds of notification; ask which matter." }],
    question: {
      id: "notifications",
      questions: [
        {
          id: "kinds",
          prompt: "Notify me about",
          mode: "multi",
          options: [
            { value: "mentions", label: "Mentions", description: "When someone writes your name" },
            { value: "comments", label: "Comments", description: "On files you own" },
            { value: "summary", label: "Weekly summary", description: "Mondays, one email" },
          ],
          other: true,
        },
      ],
    },
    answered: notificationsFor,
  })
  .user("Plan our launch kickoff")
  .assistant("Three quick questions first, so the kickoff fits the team.", {
    steps: [
      { status: "Reading the launch plan", point: "The kickoff needs a date, a guest list and a format." },
      { status: "Preparing the questions", point: "Ask all three before booking anything." },
    ],
    question: {
      id: "kickoff",
      questions: [
        {
          id: "when",
          prompt: KICKOFF_WHEN,
          options: [
            { value: "this-week", label: "This week" },
            { value: "next-week", label: "Next week" },
            { value: "after-beta", label: "After the beta" },
          ],
        },
        {
          id: "who",
          prompt: KICKOFF_WHO,
          mode: "multi",
          options: [
            { value: "design", label: "Design" },
            { value: "engineering", label: "Engineering" },
            { value: "marketing", label: "Marketing" },
            { value: "sales", label: "Sales" },
          ],
        },
        {
          id: "format",
          prompt: KICKOFF_FORMAT,
          options: [
            { value: "room", label: "In person" },
            { value: "video", label: "A video call" },
            { value: "async", label: "An async update" },
          ],
          other: true,
        },
      ],
    },
    answered: kickoffFor,
  })
  .fallback(
    "This chat is scripted to show the five ways a reply can end, so it only has answers for the levels. Pick one to see it play out.",
    { steps: [{ status: "Reading the question", point: "Nothing scripted matches this one." }], followups: [] }
  )
  .build();

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

const SCRIPTED_PROMPTS = new Set(SCRIPT.nodes.map((node) => normalize(node.prompt)));

/** The lab's transport: the script, with free text after the open question routed to its answer. */
export function createQuickRepliesTransport(): ChatTransport {
  const scripted = createSimTransport(SCRIPT);
  return (messages, signal) => {
    const last = messages[messages.length - 1];
    const previous = messages[messages.length - 2];
    const answeringOpen =
      last?.role === "user" &&
      previous?.role === "assistant" &&
      normalize(previous.content) === normalize(OPEN_ASK) &&
      !SCRIPTED_PROMPTS.has(normalize(last.content));
    if (answeringOpen) {
      return createSimTransport({ nodes: [], fallbacks: [openAnswered(last.content)] })(messages, signal);
    }
    return scripted(messages, signal);
  };
}
