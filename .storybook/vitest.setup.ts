import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from '@storybook/react-vite';
import { configure } from 'storybook/test';
import * as projectAnnotations from './preview';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// How long a play function's waitFor and findBy* wait before giving up. The
// default is one second of wall-clock time, but the story files run in
// parallel iframes that share one main thread, and every story also runs axe,
// which can hold that thread for most of a second on a large story. On a slow
// CI runner a wait could spend its whole second queued behind a neighbour's
// axe pass and time out the moment the thread came back, before its own
// pending render ran: a removal or a move the component did make, failed. The
// flakes it caused (a viewer still open after Escape, a tab still present
// after closing) never reproduced locally. A wait that succeeds still returns
// as soon as it does, so passing runs are no slower; only a starved one gets
// the room. testTimeout in vite.config.ts stays the hard ceiling.
configure({ asyncUtilTimeout: 5_000 });
