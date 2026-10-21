import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CodeDiff } from './CodeDiff';

const TS_DIFF = `@@ -12,7 +12,8 @@ export function normalizeLabel(input: string) {
 export function normalizeLabel(input: string) {
   const trimmed = input.trim();
-  if (!trimmed) return '';
-  return trimmed.toUpperCase();
+  if (!trimmed) return DEFAULT_LABEL;
+  const upper = trimmed.toLocaleUpperCase();
+  return truncate(upper, MAX_LABEL_LENGTH);
 }

 export function truncate(value: string, max: number) {`;

const FILE_DIFF = `--- a/src/lib/normalize.ts
+++ b/src/lib/normalize.ts
${TS_DIFF}`;

const ADDITIONS_DIFF = `+import { Badge } from 'rift-ds';
+
+export const shippedBadge = (
+  <Badge label="Shipped" status="positive" />
+);`;

const meta = {
  title: 'Components/CodeDiff',
  component: CodeDiff,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeDiff>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    diff: TS_DIFF,
  },
};

export const WithFilename: Story = {
  args: {
    diff: FILE_DIFF,
    filename: 'src/lib/normalize.ts',
  },
};

export const NoLineNumbers: Story = {
  args: {
    diff: TS_DIFF,
    filename: 'src/lib/normalize.ts',
    showLineNumbers: false,
  },
};

export const AdditionsOnly: Story = {
  args: {
    diff: ADDITIONS_DIFF,
    filename: 'src/components/shippedBadge.tsx',
  },
};

const DASHED_DIFF = `--- a/db/schema.sql
+++ b/db/schema.sql
@@ -1,3 +1,3 @@
--- legacy users table
+++i;
 CREATE TABLE users (`;

/**
 * Content lines that start with dashes or plus signs, such as a removed SQL
 * comment (`--- …`) or an added `++i`, stay in the diff; only the `---`/`+++`
 * pair ahead of the hunk is read as a file header.
 */
export const DashedContent: Story = {
  args: {
    diff: DASHED_DIFF,
    filename: 'db/schema.sql',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('-- legacy users table')).toBeInTheDocument();
    await expect(canvas.getByText('++i;')).toBeInTheDocument();
    await expect(canvas.getByText('1 added, 1 removed')).toBeInTheDocument();
  },
};
