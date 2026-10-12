'use client';

/**
 * The demo agent's panes: fixture data, frozen. The panes are here to be
 * looked at and re-themed, and the edit affordances render because they are
 * part of the pattern's anatomy without being wired to anything.
 */
import { Button } from '../components/Button/Button';
import { NotificationItem } from '../components/NotificationCenter/NotificationCenter';
import './ChatAgentPane.css';

const NOOP = () => {};

export function DemoActivityPane() {
  return (
    <>
      <div className="ds-chat-agent-pane__group">
        <p className="ds-chat-agent-pane__heading">Today</p>
        <NotificationItem title="Watch the Q3 invoices" media="bolt" time="9:13 am">
          Started the hourly check on the billing inbox
        </NotificationItem>
        <NotificationItem title="Draft the renewal note" media="check_circle" time="9:04 am">
          Asked for your choice on the tone
        </NotificationItem>
        <NotificationItem title="Send the approval request" media="check_circle" time="9:02 am">
          Prepared the request and paused for a yes
        </NotificationItem>
        <NotificationItem title="Tidy the workspace roles" media="check_circle" time="8:58 am">
          Interrupted
        </NotificationItem>
      </div>
      <div className="ds-chat-agent-pane__group">
        <p className="ds-chat-agent-pane__heading">Yesterday</p>
        <NotificationItem title="Summarize the standup" media="check_circle" time="4:40 pm">
          Posted the recap to the team channel
        </NotificationItem>
        <NotificationItem title="Retire the stale flags" media="check_circle" time="11:12 am">
          Opened a pull request for review
        </NotificationItem>
      </div>
    </>
  );
}

export function DemoScheduledPane() {
  return (
    <div className="ds-chat-agent-pane__group">
      <p className="ds-chat-agent-pane__heading">Daily</p>
      <NotificationItem title="Morning digest" media="schedule" time="8:00 am">
        Every weekday
      </NotificationItem>
      <NotificationItem title="Inbox sweep" media="mail" time="Every 30m">
        Flags anything still waiting on a reply
      </NotificationItem>
      <NotificationItem title="Invoice watch" media="receipt_long" time="Hourly">
        Asks before it pays anything
      </NotificationItem>
    </div>
  );
}

export function DemoPersonalizationPane({ name }: { name: string }) {
  return (
    <>
      <div className="ds-chat-agent-pane__card">
        <div className="ds-chat-agent-pane__card-row">
          <span className="ds-chat-agent-pane__card-label">{name}</span>
          <Button variant="secondary" size="compact" iconLeft="edit" onClick={NOOP} label="Edit" />
        </div>
      </div>
      <div className="ds-chat-agent-pane__group">
        <p className="ds-chat-agent-pane__heading">What it remembers</p>
        <NotificationItem title="Tone" media="favorite" time="18 Sep">
          Plain and short, no exclamation marks
        </NotificationItem>
        <NotificationItem title="Working hours" media="psychology" time="22 Sep">
          Nothing scheduled before 9am
        </NotificationItem>
      </div>
    </>
  );
}
