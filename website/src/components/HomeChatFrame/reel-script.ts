/**
 * The home page chat's story: a finance assistant at a fictional company,
 * walked through one quarter's review by its founder. Every prompt the reel
 * sends is scripted here, in the order it sends them, so the conversation
 * reads end to end from the welcome board (FinanceBoard.tsx): the
 * quarter's revenue, the expense report dropped in,
 * a runway question that needs two answers first, the numbers handed to
 * the CFO, and the board update drafted from all of it.
 *
 * Everything is invented: the company, the people, the figures. It lives
 * outside the app folder, so the site chat's corpus never reads it.
 */

import { scriptChat, type ChatCard, type ThreadsOptions } from "rift-ds/chat";
import type { DemoChartCard, DemoSourcesCard, DemoStackCard, DemoToolCallCard } from "rift-ds/chat/demo";
import type { MentionSource } from "rift-ds/components/Mention/mentions";

const card = <T,>(kind: string, data: T): ChatCard => ({ kind, data });

/* ------------------------------------------------------------ the reel */

/** The prompts and picks the reel plays, named so the script and the reel share them. */
export const REEL_COPY = {
  revenue: "How did revenue do this quarter?",
  file: "Q3-expenses.pdf",
  spend: "Here is the Q3 expense report. Where is the money going?",
  runway: "What would a 20% cut to cloud spend do to runway?",
  runwayPicks: ["From October", "Keep all three"],
  mention: { query: "Pri", id: "priya" },
  handoff: "@Priya Shah can you check these before the board pack?",
  board: "Draft the board update",
} as const;

/* ------------------------------------------------------------ fixtures */

export const FINANCE_PRODUCT = "Acme Corp";
export const FINANCE_PERSON = "Jordan Reyes";

/** People and files the composer can tag. */
export const FINANCE_MENTIONS: MentionSource[] = [
  {
    trigger: "@",
    label: "People and files",
    items: [
      { id: "priya", label: "Priya Shah", description: "CFO", icon: "person" },
      { id: "marcus", label: "Marcus Bell", description: "FP&A lead", icon: "person" },
      { id: "lena", label: "Lena Ortiz", description: "Controller", icon: "person" },
      { id: "board", label: "Q3-board-pack.pdf", description: "Board", icon: "description" },
      { id: "model", label: "runway-q4.xlsx", description: "Finance", icon: "description" },
    ],
  },
];

/** The history rail: a finance team's week, with two projects and a pin. */
export const FINANCE_THREADS: ThreadsOptions = {
  projects: [
    { id: "q4-planning", label: "Q4 planning", meta: "1m" },
    { id: "board-pack", label: "Board pack", meta: "3d" },
  ],
  groups: [
    {
      label: "Pinned",
      threads: [
        {
          id: "cloud-contracts",
          title: "Compare the cloud contracts",
          description: "Three vendors, annual terms",
          status: "idle",
          pinned: true,
          meta: "2d",
        },
      ],
    },
    {
      label: "This week",
      threads: [
        {
          id: "close",
          title: "Close the September books",
          description: "Waiting on two receipts",
          status: "waiting",
          icon: "cloud",
          meta: "32m",
        },
        {
          id: "hiring",
          title: "Forecast Q4 hiring",
          description: "Modelling three scenarios",
          status: "working",
          icon: "cloud",
          meta: "2h",
        },
      ],
    },
    {
      label: "Earlier",
      threads: [
        { id: "payouts", title: "Reconcile the Stripe payouts", meta: "4d" },
        { id: "card-spend", title: "Tag last month's card spend", status: "error", meta: "5d" },
        { id: "lease", title: "Renew the office lease", status: "unread", meta: "1w" },
      ],
    },
  ],
  pinnedGroup: "Pinned",
  homeGroup: "This week",
  pins: true,
  details: true,
  nameThread: () => "Q3 review for the board",
};

/* ------------------------------------------------------------- figures */

/* Q1 938, Q2 1,051, Q3 1,240 ($K): Q3 is 18% over Q2, and August dips.
   The welcome board charts the same months. */
export const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 300 },
  { month: "Feb", revenue: 312 },
  { month: "Mar", revenue: 326 },
  { month: "Apr", revenue: 340 },
  { month: "May", revenue: 350 },
  { month: "Jun", revenue: 361 },
  { month: "Jul", revenue: 405 },
  { month: "Aug", revenue: 398 },
  { month: "Sep", revenue: 437 },
];

/* $1,031K in all; payroll is 59% of it. */
const Q3_SPEND = [
  { category: "Payroll", spend: 612 },
  { category: "Cloud", spend: 186 },
  { category: "Marketing", spend: 121 },
  { category: "Software", spend: 74 },
  { category: "Travel", spend: 38 },
];

const RUNWAY = [
  { scenario: "Today", months: 14 },
  { scenario: "Cut cloud 20%", months: 17 },
  { scenario: "Cut and pause hires", months: 21 },
];

/* -------------------------------------------------------------- script */

export const FINANCE_SCRIPT = scriptChat()
  .user(REEL_COPY.revenue)
  .assistant(
    "Q3 closed at **$1.24M**, up 18% on Q2. Expansion in existing accounts did most of the work: new customers slowed in August, then picked back up in September.",
    {
      steps: [
        { status: "Pulling the revenue ledger", point: "Nine months of booked revenue, by month." },
        { status: "Comparing the quarters", point: "Q3 against Q2, split into new and expansion." },
      ],
      card: card<DemoChartCard>("chart", {
        type: "area",
        title: "Monthly revenue",
        meta: "2026, in $K",
        data: MONTHLY_REVENUE,
        xKey: "month",
        yKey: "revenue",
        label: "Revenue",
      }),
      followups: ["Where is our cash going?", "How long is our runway?", REEL_COPY.board],
    }
  )
  .user(REEL_COPY.spend)
  .assistant(
    "Payroll is the biggest line, at nearly 60%, as expected. The one that stands out is **cloud**: up 41% on Q2 while revenue grew 18%, so it is the only cost growing faster than the business.",
    {
      steps: [
        { status: `Reading ${REEL_COPY.file}`, point: "14 pages, 212 line items." },
        { status: "Grouping the spend", point: "Five categories cover nearly all of it." },
      ],
      card: card<DemoStackCard>("stack", {
        items: [
          card<DemoToolCallCard>("tool-call", {
            name: "read_pdf",
            summary: `${REEL_COPY.file}, 14 pages`,
            status: "success",
            duration: "1.2s",
          }),
          card<DemoChartCard>("chart", {
            type: "bar",
            title: "Q3 spend by category",
            meta: "In $K",
            data: Q3_SPEND,
            xKey: "category",
            yKey: "spend",
            label: "Spend",
          }),
        ],
      }),
      followups: ["Why did cloud costs jump?", "How long is our runway?", REEL_COPY.board],
    }
  )
  .user(REEL_COPY.runway)
  .assistant("Two things change the answer, so a quick check before I model it.", {
    steps: [{ status: "Setting up the model", point: "Timing and hiring move runway the most." }],
    question: {
      id: "runway",
      questions: [
        {
          id: "timing",
          prompt: "When does the cut start?",
          options: [
            { value: "october", label: REEL_COPY.runwayPicks[0] },
            { value: "phased", label: "Phased over Q4" },
          ],
        },
        {
          id: "hiring",
          prompt: "Keep the three Q4 hires?",
          options: [
            { value: "keep", label: REEL_COPY.runwayPicks[1] },
            { value: "pause", label: "Pause two roles" },
          ],
        },
      ],
    },
    answered: {
      steps: [
        { status: "Modelling the runway", point: "Monthly burn with the cut from October." },
        { status: "Comparing scenarios", point: "Today, the cut, and the cut with paused hiring." },
      ],
      text: "With the cut from October and all three hires kept, runway goes from **14 to 17 months**. Pausing two of the roles as well would take it to 21.",
      card: card<DemoChartCard>("chart", {
        type: "bar",
        title: "Runway by scenario",
        meta: "Months of cash",
        data: RUNWAY,
        xKey: "scenario",
        yKey: "months",
        label: "Months",
      }),
      followups: ["Share this with Priya", REEL_COPY.board, "Why did cloud costs jump?"],
    },
  })
  .user(REEL_COPY.handoff)
  .assistant(
    "Shared the runway model with Priya and flagged the cloud assumption for her review. She has all three scenarios, and the expense report is attached.",
    {
      steps: [{ status: "Sharing the model", point: "Priya owns the board numbers." }],
      card: card<DemoToolCallCard>("tool-call", {
        name: "share_model",
        summary: "runway-q4.xlsx with Priya Shah",
        status: "success",
        duration: "0.4s",
      }),
      followups: [REEL_COPY.board, "Remind me if she has questions", "How long is our runway?"],
    }
  )
  .user(REEL_COPY.board)
  .assistant(
    "A first draft for the board:\n\n- **Revenue:** $1.24M in Q3, up 18% on Q2, led by expansion.\n- **Spend:** cloud grew 41%, the one cost outpacing revenue.\n- **Runway:** 14 months today, 17 with a 20% cloud cut from October.\n- **Ask:** approve the cut so it lands this quarter.",
    {
      steps: [
        { status: "Collecting the numbers", point: "Revenue, spend and runway from this thread." },
        { status: "Drafting the update", point: "Four lines, ending on the decision." },
      ],
      card: card<DemoSourcesCard>("sources", {
        items: [
          {
            title: REEL_COPY.file,
            source: "Uploaded today",
            letter: "E",
            excerpt: "Cloud hosting, Q3: $186K against $132K in Q2. Payroll, Q3: $612K.",
          },
          {
            title: "Revenue ledger",
            source: "Stripe, synced hourly",
            letter: "R",
            excerpt: "Q3 booked revenue $1,240K. Expansion 64%, new customers 36%.",
          },
          {
            title: "Runway model",
            source: "runway-q4.xlsx",
            letter: "M",
            excerpt: "Scenario B: cloud down 20% from October, hiring as planned. 17 months.",
          },
        ],
      }),
      followups: ["Make it shorter", "Add the hiring plan", "Send it to Priya"],
    }
  )
  .fallback("I can look at revenue, spend and runway for any quarter. Which would help?", {
    followups: [REEL_COPY.revenue, "Where is our cash going?", "How long is our runway?"],
  });
