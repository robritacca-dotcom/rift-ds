'use client';

/**
 * The settings block's page. The open section follows the address's hash,
 * which the sidebar's settings links set (so the back button and a pasted
 * link land on the right one), and the page header names it.
 *
 * Every section is built from the same few parts, so a new setting is one
 * more of them, whatever its control:
 *
 *  - Group: a heading over its rows, a rule between one group and the next.
 *  - Row: what the setting is and a sentence on why (with a link where it
 *    helps) on the left; its value and its control on the right; an icon
 *    tile leading it when it reports a status. The control is whatever the
 *    setting needs: an Edit that edits in place, a switch that saves as it
 *    flips, a chevron that opens more, a button that acts.
 *  - Fields: labelled controls set side by side, two to a row, for settings
 *    read together (a pair of selects, a pair of sliders).
 *
 * The values are placeholders. Replace them with your own, `save` with a
 * call to your server, and `check` with your rules or the errors your
 * server returns.
 */

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Alert } from 'rift-ds/components/Alert/Alert';
import { Avatar } from 'rift-ds/components/Avatar/Avatar';
import { Button } from 'rift-ds/components/Button/Button';
import { Dropdown } from 'rift-ds/components/Dropdown/Dropdown';
import { Icon } from 'rift-ds/components/Icon/Icon';
import { IconButton } from 'rift-ds/components/IconButton/IconButton';
import { Input } from 'rift-ds/components/Input/Input';
import { Link } from 'rift-ds/components/Link/Link';
import { Meter } from 'rift-ds/components/Meter/Meter';
import { RadioGroup } from 'rift-ds/components/RadioButton/RadioButton';
import { SegmentedControl } from 'rift-ds/components/SegmentedControl/SegmentedControl';
import { Slider } from 'rift-ds/components/Slider/Slider';
import { ToggleSwitch } from 'rift-ds/components/ToggleSwitch/ToggleSwitch';
import { AppShell, SETTINGS_SECTIONS } from '../../components/blocks/AppShell';
import styles from './page.module.css';

type SectionId = (typeof SETTINGS_SECTIONS)[number]['id'];

const subscribeHash = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};
const readSection = (): SectionId => {
  const id = window.location.hash.slice(1);
  return SETTINGS_SECTIONS.some((section) => section.id === id) ? (id as SectionId) : 'general';
};

const TIME_ZONES = [
  { value: 'Pacific Time', label: 'Pacific Time' },
  { value: 'Eastern Time', label: 'Eastern Time' },
  { value: 'Central European Time', label: 'Central European Time' },
  { value: 'UTC', label: 'UTC' },
];

const CURRENCIES = [
  { value: 'usd', label: 'US dollar' },
  { value: 'eur', label: 'Euro' },
  { value: 'gbp', label: 'Pound sterling' },
];

const HOURS = ['18:00', '20:00', '22:00', '06:00', '08:00'].map((hour) => ({ value: hour, label: hour }));

/** Every setting edited in place, by key. */
type FieldKey = 'workspaceName' | 'workspaceUrl' | 'name' | 'email' | 'phone' | 'password';

const INITIAL: Record<FieldKey, string> = {
  workspaceName: 'Acme',
  workspaceUrl: 'acme',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  phone: '+1 (555) 010-0199',
  password: '',
};

function check(key: FieldKey, value: string): string | undefined {
  if (!value.trim()) return 'Enter a value.';
  if (key === 'email' && !/^\S+@\S+\.\S+$/.test(value)) return 'Enter an email address like name@example.com.';
  if (key === 'workspaceUrl' && !/^[a-z0-9-]+$/.test(value)) return 'Use lowercase letters, numbers and dashes.';
  if (key === 'password' && value.length < 12) return 'Use at least 12 characters.';
  return undefined;
}

/** Shows only the end of a value, as a value worth guarding should be shown. */
function mask(key: FieldKey, value: string) {
  if (key === 'email') return value.replace(/^[^@]+/, (name) => '•'.repeat(Math.max(4, name.length)));
  if (key === 'phone') return `•••••••${value.replace(/\D/g, '').slice(-4)}`;
  return value;
}

/** A heading over its rows; a rule parts one group from the next. */
function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.group} aria-label={title ? undefined : 'More settings'}>
      {title ? <h2 className={styles.groupTitle}>{title}</h2> : null}
      <div className={styles.rows}>{children}</div>
    </section>
  );
}

/**
 * One setting: the label and its sentence, its value, its control, and an
 * icon tile leading it when it reports a status.
 */
function Row({
  label,
  description,
  value,
  control,
  icon,
  status,
  below,
}: {
  label: string;
  description?: ReactNode;
  value?: ReactNode;
  control?: ReactNode;
  icon?: ReactNode;
  status?: 'positive' | 'default';
  below?: ReactNode;
}) {
  return (
    <div className={styles.row}>
      {icon ? (
        <span className={styles.tile} data-status={status ?? 'default'}>
          {icon}
        </span>
      ) : null}
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </div>
      {value !== undefined || control ? (
        <div className={styles.end}>
          {value !== undefined ? <span className={styles.value}>{value}</span> : null}
          {control}
        </div>
      ) : null}
      {below ? <div className={styles.below}>{below}</div> : null}
    </div>
  );
}

/** Labelled controls side by side, two to a row, one on a phone. */
function Fields({ children }: { children: ReactNode }) {
  return <div className={styles.fields}>{children}</div>;
}

export function Settings() {
  const active = useSyncExternalStore(subscribeHash, readSection, () => 'general' as SectionId);
  const section = SETTINGS_SECTIONS.find((entry) => entry.id === active) ?? SETTINGS_SECTIONS[0];

  const [values, setValues] = useState(INITIAL);
  // An edit remembers its section, so leaving the section leaves it behind.
  const [editing, setEditing] = useState<{ section: SectionId; key: FieldKey } | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [revealed, setRevealed] = useState<FieldKey[]>([]);
  const [noticeShown, setNoticeShown] = useState(true);
  const [settings, setSettings] = useState({
    timeZone: 'Pacific Time',
    currency: 'usd',
    weekStart: 'monday',
    mentions: true,
    approvals: true,
    weeklySummary: true,
    productNews: false,
    digest: 'daily',
    quietFrom: '20:00',
    quietUntil: '08:00',
    urgentAlerts: true,
    signOutAfter: 60,
  });
  const set = <K extends keyof typeof settings>(key: K) => (value: (typeof settings)[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const editingKey = editing?.section === active ? editing.key : null;
  const startEdit = (key: FieldKey) => {
    setEditing({ section: active, key });
    setDraft(key === 'password' ? '' : values[key]);
    setError(undefined);
  };
  const cancel = () => {
    setEditing(null);
    setError(undefined);
  };
  const save = () => {
    if (!editingKey) return;
    const problem = check(editingKey, draft);
    if (problem) {
      setError(problem);
      return;
    }
    // Save to your server here, and show what it returns.
    setValues((current) => ({ ...current, [editingKey]: draft }));
    setEditing(null);
  };

  /**
   * A row edited in place: its value and an Edit at rest; its field, Save
   * and Cancel while editing. `masked` hides the value behind a Reveal.
   */
  const editable = (key: FieldKey, label: string, description?: string, options: { masked?: boolean; display?: string } = {}) => {
    if (editingKey === key) {
      return (
        <Row
          label={label}
          description={description}
          below={
            <form
              className={styles.editor}
              // The check below runs on Save, so the browser's own stays out of it.
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <Input
                aria-label={label}
                type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'password' ? 'password' : 'text'}
                value={draft}
                onValueChange={setDraft}
                errorText={error}
                prefix={key === 'workspaceUrl' ? 'acme.app/' : undefined}
                autoFocus
              />
              <div className={styles.editorActions}>
                <Button type="submit" size="compact" label="Save" />
                <Button size="compact" variant="tertiary" label="Cancel" onClick={cancel} />
              </div>
            </form>
          }
        />
      );
    }
    const shown = !options.masked || revealed.includes(key);
    return (
      <Row
        label={label}
        description={description}
        value={
          key === 'password' ? undefined : (
            <>
              {options.display ?? (shown ? values[key] : mask(key, values[key]))}
              {options.masked && !shown ? (
                <Button
                  size="compact"
                  variant="tertiary"
                  label="Reveal"
                  aria-label={`Reveal ${label.toLowerCase()}`}
                  onClick={() => setRevealed((keys) => [...keys, key])}
                />
              ) : null}
            </>
          )
        }
        control={
          <Button
            size="compact"
            variant="secondary"
            label="Edit"
            aria-label={`Edit ${label.toLowerCase()}`}
            onClick={() => startEdit(key)}
          />
        }
      />
    );
  };

  /** A row that opens more: its state, then a chevron. */
  const opens = (label: string, description: string, value: string, icon?: ReactNode, status?: 'positive') => (
    <Row
      label={label}
      description={description}
      value={value}
      icon={icon}
      status={status}
      control={<IconButton icon="chevron_right" variant="tertiary" size="compact" label={`Manage ${label.toLowerCase()}`} />}
    />
  );

  /** A row whose switch saves as it flips. */
  const toggle = (key: 'mentions' | 'approvals' | 'weeklySummary' | 'productNews' | 'urgentAlerts', label: string, description: ReactNode) => (
    <Row
      label={label}
      description={description}
      control={<ToggleSwitch label={label} showLabel={false} checked={settings[key]} onCheckedChange={set(key)} />}
    />
  );

  return (
    <AppShell
      activeKey="settings"
      activeSubKey={active}
      breadcrumb={[{ label: 'Acme', href: '#' }, { label: 'Settings', href: '#general' }, { label: section.label }]}
      title={section.label}
      description={section.description}
    >
      <div className={styles.page}>
        {active === 'general' && (
          <>
            <Group title="Workspace">
              {editable('workspaceName', 'Workspace name', 'Shown in the sidebar and in every email we send.')}
              {editable('workspaceUrl', 'Workspace address', 'Where your team signs in.', {
                display: `acme.app/${values.workspaceUrl}`,
              })}
              <Row
                label="Logo"
                description="Square, at least 256 pixels. It appears beside the workspace name."
                icon={<Avatar name={values.workspaceName} shape="square" aria-label={`${values.workspaceName} logo`} />}
                control={<Button size="compact" variant="secondary" label="Change" aria-label="Change logo" />}
              />
            </Group>

            <Group title="Region">
              <Fields>
                <Dropdown label="Time zone" options={TIME_ZONES} value={settings.timeZone} onValueChange={set('timeZone')} />
                <Dropdown label="Currency" options={CURRENCIES} value={settings.currency} onValueChange={set('currency')} />
              </Fields>
              <Row
                label="Week starts on"
                description="For calendars, schedules and weekly reports."
                control={
                  <SegmentedControl
                    aria-label="Week starts on"
                    segments={[
                      { value: 'monday', label: 'Monday' },
                      { value: 'sunday', label: 'Sunday' },
                    ]}
                    value={settings.weekStart}
                    onValueChange={set('weekStart')}
                  />
                }
              />
            </Group>

            <Group title="Plan and usage">
              <Row
                label="Plan"
                description="Up to 25 members and 10 GB of files."
                value="Team"
                control={<Button size="compact" variant="secondary" label="Change plan" />}
              />
              <Row
                label="Storage"
                description="Files, receipts and exports across the workspace."
                below={<Meter label="Storage used" value={62} valueText="6.2 of 10 GB" showValue />}
              />
            </Group>

            <Group>
              <Row
                label="Archive this workspace"
                description="Hides it for everyone until an admin restores it. Nothing is deleted."
                control={<Button size="compact" variant="secondary" tone="destructive" label="Archive" />}
              />
              <Row
                label="Delete this workspace"
                description="Removes the workspace and everything in it for every member. This cannot be undone."
                control={<Button size="compact" variant="primary" tone="destructive" label="Delete workspace" />}
              />
            </Group>
          </>
        )}

        {active === 'notifications' && (
          <>
            {noticeShown ? (
              <Alert
                variant="info"
                description="Notifications wait during your quiet hours and arrive together when they end, except the urgent ones you allow."
                dismissible
                onDismiss={() => setNoticeShown(false)}
              />
            ) : null}

            <Group title="Email">
              {toggle('mentions', 'Mentions', 'When someone mentions you in a comment or a note.')}
              {toggle('approvals', 'Approvals waiting', 'When a request needs your yes or no.')}
              {toggle('weeklySummary', 'Weekly summary', 'Monday morning: what moved last week.')}
              {toggle(
                'productNews',
                'Product news',
                <>
                  New features, now and then. <Link href="#notifications">Learn more</Link>
                </>,
              )}
            </Group>

            <Group title="Digest">
              <RadioGroup
                label="How often we gather the rest"
                value={settings.digest}
                onValueChange={set('digest')}
                options={[
                  { value: 'off', label: 'Off', description: 'Each notification arrives on its own.' },
                  { value: 'daily', label: 'Daily', description: 'One email at the end of the day.' },
                  { value: 'weekly', label: 'Weekly', description: 'One email on Friday afternoon.' },
                ]}
              />
            </Group>

            <Group title="Quiet hours">
              <Fields>
                <Dropdown label="From" options={HOURS} value={settings.quietFrom} onValueChange={set('quietFrom')} />
                <Dropdown label="Until" options={HOURS} value={settings.quietUntil} onValueChange={set('quietUntil')} />
              </Fields>
              {toggle('urgentAlerts', 'Allow urgent alerts', 'A frozen card or a failed payment still reaches you.')}
            </Group>
          </>
        )}

        {active === 'profile' && (
          <>
            <Group title="Account info">
              {editable('name', 'Name')}
              {editable('email', 'Email', 'Where sign-in links and notifications go.', { masked: true })}
              {editable('phone', 'Phone number', 'Used for two-step verification.', { masked: true })}
            </Group>

            <Group title="Photo">
              <Row
                label="Profile photo"
                description="Shown beside your name in comments, approvals and the sidebar."
                icon={<Avatar name={values.name} />}
                control={<Button size="compact" variant="secondary" label="Upload" aria-label="Upload a profile photo" />}
              />
            </Group>
          </>
        )}

        {active === 'security' && (
          <>
            <Group title="Password and security">
              {editable('password', 'Password', 'Last changed three months ago.')}
              {opens('Two-step verification', 'A code from your phone each time you sign in.', 'Enabled')}
              {opens('Signed-in devices', 'This laptop, and two others.', '3 devices')}
            </Group>

            <Group title="Sessions">
              <Row
                label="Sign out after"
                description="How long a quiet session stays signed in, on every device."
                value={`${settings.signOutAfter} minutes`}
                below={
                  <Slider
                    aria-label="Sign out after, in minutes"
                    min={15}
                    max={240}
                    step={15}
                    value={settings.signOutAfter}
                    onValueChange={set('signOutAfter')}
                  />
                }
              />
            </Group>

            <Group title="Account status">
              {opens(
                'Account standing',
                'Thanks for keeping to the terms. A problem would show here.',
                'All good',
                <Icon name="check_circle" tone="inherit" />,
                'positive',
              )}
              <Row
                label="Role"
                description="Admins can change billing, members and these settings."
                value="Admin"
                icon={<Icon name="shield_person" tone="inherit" />}
              />
            </Group>
          </>
        )}
      </div>
    </AppShell>
  );
}
