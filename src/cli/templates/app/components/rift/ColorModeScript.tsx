import { colorModeScript } from 'rift-ds/components/ThemeToggle/colorMode';

/**
 * Applies the visitor's stored colour mode before first paint, so a
 * returning visitor never sees the wrong mode flash. Render it in your root
 * layout's <head>. ThemeToggle reads and changes the same setting.
 */
export function ColorModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />;
}
