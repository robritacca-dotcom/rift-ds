import { colorModeScript, type ColorModeScriptOptions } from 'rift-ds/components/ThemeToggle/colorMode';

/**
 * Applies the visitor's stored colour mode before first paint, so a
 * returning visitor never sees the wrong mode flash. Render it in your root
 * layout's <head>. ThemeToggle reads and changes the same setting.
 *
 * If your app lets the visitor pick a theme, store the preset id under a key
 * of your own and pass it as `brandStorageKey`: the script then applies that
 * theme before first paint too.
 */
export function ColorModeScript(options: ColorModeScriptOptions) {
  return <script dangerouslySetInnerHTML={{ __html: colorModeScript(options) }} />;
}
