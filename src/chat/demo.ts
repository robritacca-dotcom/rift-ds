/**
 * rift-ds/chat/demo: a scripted conversation for a fictional workspace
 * product, with the rich cards, mock data and welcome fillings that show
 * every feature of the widget before a consumer has a model, a route or a
 * key. `createDemoTransport()` plays it; `DEMO_RENDERERS` draws its cards;
 * the fixtures seat the threads rail, the tabs, the agent pane, the
 * mentions and the model picker.
 *
 * Imports recharts for the chart cards, which is why this is its own
 * subpath with its own optional peer rather than part of rift-ds/chat.
 * Everything here is invented: the product, the people, the numbers.
 */
import { createSimTransport, type SimTiming } from './sim';
import { DEMO_SCRIPT } from './demo-script';
import type { ChatTransport } from './types';

export {
  DEMO_RENDERERS,
  type DemoProductCard,
  type DemoChartCard,
  type DemoSourcesCard,
  type DemoToolCallCard,
  type DemoDiffCard,
  type DemoPlanCard,
  type DemoInterruptCard,
  type DemoStackCard,
} from './demo-cards';
export { DEMO_SCRIPT, DEMO_STARTERS } from './demo-script';
export {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_THREAD_GROUPS,
  DEMO_PROJECTS,
  DEMO_THREAD_NAMES,
  DEMO_THREADS,
  DEMO_WELCOME_OPTIONS,
  type DemoWelcomeVariant,
} from './demo-fixtures';
export { demoAgentTabs } from './demo-agent';
export { DemoBoard, DemoWelcome } from './DemoWelcome';

/** The demo's transport: the script, played at the default beats unless told otherwise. */
export const createDemoTransport = (timing?: Partial<SimTiming>): ChatTransport =>
  createSimTransport(DEMO_SCRIPT, timing);
