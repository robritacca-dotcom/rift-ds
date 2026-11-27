/**
 * The settings block: a standard page in the app shell, one section at a
 * time. The sections open from the Settings row in the sidebar's side panel
 * (SETTINGS_SECTIONS in components/blocks/AppShell.tsx), and the page shows
 * the open one as rows across the content column: what a setting is and
 * why it matters, then its value and an Edit. Edit turns the row into its
 * field with Save and Cancel; a switch saves as it flips. The values are
 * placeholders (Settings.tsx beside this page holds them); read and write
 * your own.
 */

import { Settings } from './Settings';

export default function SettingsPage() {
  return <Settings />;
}
