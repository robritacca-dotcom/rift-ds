/**
 * The settings block: the app shell with a column of FormSections, each a
 * heading and a sentence beside its fields, and each saving on its own. The
 * values are placeholders; read and write your own.
 *
 * The profile section is a client form (ProfileForm.tsx beside this page)
 * that checks every field in one pass on save: the errors go to an
 * ErrorSummary at the top of the form and to each field's errorText, both
 * from one record through fieldErrorsFrom. The other sections render from
 * this server page.
 */

import { Button } from 'rift-ds/components/Button/Button';
import { Dropdown } from 'rift-ds/components/Dropdown/Dropdown';
import { FormSection } from 'rift-ds/components/FormSection/FormSection';
import { ToggleSwitch } from 'rift-ds/components/ToggleSwitch/ToggleSwitch';
import { AppShell } from '../../components/blocks/AppShell';
import { ProfileForm } from './ProfileForm';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <AppShell
      activeKey="settings"
      breadcrumb={[{ label: 'Workspace', href: '#' }, { label: 'Settings' }]}
      title="Settings"
    >
      <div className={styles.column}>
        <ProfileForm />

        <FormSection
          layout="aside"
          divider
          title="Notifications"
          description="What we email you about. Changes apply from the next message."
          actions={<Button label="Save notifications" />}
        >
          <ToggleSwitch label="A weekly summary" defaultChecked />
          <ToggleSwitch label="When someone mentions you" defaultChecked />
          <ToggleSwitch label="Product news" />
        </FormSection>

        <FormSection
          layout="aside"
          divider
          columns={2}
          title="Region"
          description="How dates, times and numbers are written for you."
          actions={<Button label="Save region" />}
        >
          <Dropdown
            label="Language"
            defaultValue="en"
            options={[
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
              { value: 'fr', label: 'Français' },
            ]}
          />
          <Dropdown
            label="Time zone"
            defaultValue="utc"
            options={[
              { value: 'utc', label: 'UTC' },
              { value: 'cet', label: 'Central European' },
              { value: 'pt', label: 'Pacific' },
            ]}
          />
        </FormSection>

        <FormSection
          layout="aside"
          divider
          title="Delete workspace"
          description="Removes the workspace and everything in it. This cannot be undone."
        >
          <div>
            <Button label="Delete workspace" variant="secondary" tone="destructive" />
          </div>
        </FormSection>
      </div>
    </AppShell>
  );
}
