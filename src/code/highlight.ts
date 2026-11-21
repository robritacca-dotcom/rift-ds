/**
 * rift-ds/code/highlight: syntax highlighting for CodeBlock, through the
 * optional shiki peer (install `shiki` to use it).
 *
 * `highlight(code, lang)` returns the `lines` CodeBlock takes: one array of
 * tokens per line, each marked with a syntax role (keyword, string,
 * function, constant, comment) rather than a colour. The colour is the
 * theme's, through the `--color-code-*` tokens, so highlighted code follows
 * light and dark mode and every preset with no second palette to keep in
 * step. Shiki's CSS-variable theme does the work: it names a role in each
 * token's colour, which is read back here and never reaches the page.
 *
 * Async, and safe on the server: call it in a Server Component and pass the
 * lines down, and the page ships no highlighter at all. The highlighter is
 * created once per process and loads each language on first use; a language
 * shiki does not know comes back as plain lines, never an error.
 */
import { createCssVariablesTheme, createHighlighter, type BundledLanguage } from 'shiki';
import type { CodeLine, CodeTokenRole } from '../components/CodeBlock/CodeBlock';

export type { CodeLine, CodeToken, CodeTokenRole } from '../components/CodeBlock/CodeBlock';

const PREFIX = '--rift-code-';
const theme = createCssVariablesTheme({ name: 'rift', variablePrefix: PREFIX, variableDefaults: {}, fontStyle: false });

/** Shiki's CSS-variable names, read back as the library's five roles. */
const ROLES: Record<string, CodeTokenRole> = {
  'token-keyword': 'keyword',
  'token-string': 'string',
  'token-string-expression': 'string',
  'token-link': 'string',
  'token-function': 'function',
  'token-constant': 'constant',
  'token-comment': 'comment',
};

let highlighter: ReturnType<typeof createHighlighter> | undefined;

const plain = (code: string): CodeLine[] => code.split('\n').map((text) => [{ content: text }]);

/** Highlight `code` as `lang` (any language shiki bundles: "tsx", "css", "bash", "json" and the rest). */
export async function highlight(code: string, lang: string): Promise<CodeLine[]> {
  highlighter ??= createHighlighter({ themes: [theme], langs: [] });
  const h = await highlighter;
  try {
    if (!h.getLoadedLanguages().includes(lang)) await h.loadLanguage(lang as BundledLanguage);
  } catch {
    return plain(code);
  }
  const { tokens } = h.codeToTokens(code, { lang: lang as BundledLanguage, theme: 'rift' });
  return tokens.map((line) =>
    line.map((token) => {
      const match = token.color?.match(/var\(--rift-code-([a-z-]+)\)/);
      const role = match ? ROLES[match[1]] : undefined;
      return role ? { content: token.content, role } : { content: token.content };
    }),
  );
}
