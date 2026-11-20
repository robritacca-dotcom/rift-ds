#!/usr/bin/env node
/**
 * validate-demo-images.mjs
 *
 * Holds the owner's rule that a demo picture is always one of the sample
 * pictures, never a drawn or fetched stand-in. The set lives in two twins:
 * `website/src/lib/attachment-demo.ts` for the site (files under
 * `website/public/images/attachments/`) and `src/stories/attachment-fixtures.ts`
 * for Storybook (the same files, bundled). A page or a story that needs a
 * photograph, a cover, a thumbnail or a before-and-after pair imports from
 * there; on 2026-11-19 the Card, Figure, ImageCompare and Lightbox demos
 * still drew grey circles and labelled gradients, and the Carousel story
 * fetched remote pictures, so the same slot looked different on every page.
 *
 * Two shapes fail, in the stories, the story fixtures and the website source:
 *
 *   - a remote placeholder host (picsum, placehold and the like): a story
 *     that touches the network is not deterministic, and the site never
 *     hotlinks a third party's pictures;
 *   - an inline SVG drawn as an image (`data:image/svg+xml`), unless the
 *     drawing is its own subject rather than a stand-in photo: a receipt the
 *     document viewer opens, a company's mark. Those files are sanctioned in
 *     SANCTIONED with the reason, and the table is held in both directions.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { relative } from 'node:path';
import { fromRoot, read, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const ROOT = fromRoot();

/** Repo-relative file → why its inline SVG is the subject, not a stand-in photo. */
const SANCTIONED = {
  'src/components/DocumentViewer/DocumentViewer.stories.tsx':
    'a drawn receipt: the document the viewer opens is the subject, not a photograph',
  'website/src/app/components/document-viewer/page.tsx':
    'the same drawn receipt the stories open, the document being viewed',
  'src/components/EntitySwitcher/EntitySwitcher.stories.tsx':
    "workspace marks: a company's logo tile, not a picture",
};

const REMOTE = /https?:\/\/(?:[a-z0-9-]+\.)*(?:picsum\.photos|placehold\.co|placeholder\.com|placehold\.it|dummyimage\.com|loremflickr\.com|placekitten\.com|placeimg\.com|unsplash\.it|source\.unsplash\.com|fakeimg\.pl)\b/i;
const INLINE_SVG = /data:image\/svg\+xml/;

const isSource = (path) => /\.(tsx?|mdx)$/.test(path) && !/\.generated\.ts$/.test(path);
const skipDir = (path) => /node_modules|[\\/]\.next[\\/]?/.test(path);

const files = [
  ...walk(fromRoot('src'), (p) => isSource(p) && (/\.stories\.tsx?$/.test(p) || /[\\/]src[\\/]stories[\\/]/.test(p)), skipDir),
  ...walk(fromRoot('website', 'src'), isSource, skipDir),
];

const errors = [];
const used = new Set();
for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const text = read(abs);
  const remote = text.match(REMOTE);
  if (remote) {
    errors.push(
      `${rel} — loads a remote placeholder (${remote[0]}). Use a sample picture from ` +
        `src/stories/attachment-fixtures.ts (stories) or website/src/lib/attachment-demo.ts (site).`
    );
  }
  if (INLINE_SVG.test(text)) {
    if (SANCTIONED[rel]) {
      used.add(rel);
    } else {
      errors.push(
        `${rel} — draws an inline SVG image. A demo picture is a sample picture from ` +
          `src/stories/attachment-fixtures.ts (stories) or website/src/lib/attachment-demo.ts (site); ` +
          `if the drawing is its own subject (a document, a logo), sanction it in SANCTIONED in scripts/validate-demo-images.mjs.`
      );
    }
  }
}
for (const rel of Object.keys(SANCTIONED)) {
  if (!used.has(rel)) errors.push(`SANCTIONED lists ${rel}, which no longer draws an inline SVG image: remove the entry.`);
}

finish(
  '✗ Demo image validation failed:',
  errors,
  `✓ Demo pictures come from the sample set — ${files.length} files checked, ${used.size} sanctioned drawings`
);
