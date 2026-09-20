import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageCard } from './MessageCard';
import { Button } from '../Button/Button';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { Avatar } from '../Avatar/Avatar';

/** Self-contained stand-in for an image or chart — no external assets. */
const MediaPlaceholder = () => (
  <div
    style={{
      aspectRatio: '2 / 1',
      background: 'var(--color-bg-container-secondary)',
      display: 'flex',
      alignItems: 'flex-end',
    }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 200 60"
      style={{ width: '100%', display: 'block', color: 'var(--color-icon-secondary)' }}
    >
      <rect x="16" y="34" width="24" height="26" fill="currentColor" opacity="0.35" />
      <rect x="52" y="22" width="24" height="38" fill="currentColor" opacity="0.5" />
      <rect x="88" y="40" width="24" height="20" fill="currentColor" opacity="0.35" />
      <rect x="124" y="12" width="24" height="48" fill="currentColor" opacity="0.65" />
      <rect x="160" y="27" width="24" height="33" fill="currentColor" opacity="0.5" />
    </svg>
  </div>
);

const meta = {
  title: 'Components/MessageCard',
  component: MessageCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    meta: { control: 'text' },
    description: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MessageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: 'article',
    title: 'Design tokens, explained',
    meta: 'fieldnotes.example · 4 min read',
    description:
      'How a three-tier token architecture keeps a component library on one palette without hardcoding a single hex value.',
  },
};

/** The classic unfurl: icon, domain, description, and an open action in the footer. */
export const LinkPreview: Story = {
  args: {
    icon: 'language',
    title: 'Harbour Line timetable',
    meta: 'transit.harbourline.example',
    description: 'Departures every twelve minutes from Pier 4 until midnight.',
    actions: <Button variant="secondary" size="compact" label="Open" />,
  },
};

/** The media slot sits inset with its own rounded corners, on a page-tone panel concentric with the card's shell. */
export const WithMedia: Story = {
  args: {
    media: <MediaPlaceholder />,
    title: 'Weekly signups',
    meta: 'Updated this morning',
    description: 'Thursday is still the strongest day, holding the pattern from last month.',
  },
};

/** Children render between the description and the footer — rich content, lists, chip rows. */
export const WithBody: Story = {
  args: {
    icon: 'map',
    title: 'Rome, three-day outline',
    meta: 'Draft itinerary',
    children: (
      <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
        <li>Day 1: Forum and Palatine Hill</li>
        <li>Day 2: Vatican museums, early entry</li>
        <li>Day 3: Trastevere on foot</li>
      </ul>
    ),
    actions: (
      <>
        <Button variant="secondary" size="compact" label="Save" />
        <Button variant="tertiary" size="compact" label="Edit" />
      </>
    ),
  },
};

/** The intended habitat: rich content embedded in an assistant turn. */
export const InAMessage: Story = {
  render: () => (
    <div style={{ width: '480px' }}>
      <ChatMessage
        role="assistant"
        author="Assistant"
        timestamp="2:41 PM"
        avatar={<Avatar name="A I" size="sm" />}
      >
        <p style={{ margin: '0 0 8px' }}>
          Found the timetable you asked about. The last ferry back leaves at 11:48 PM.
        </p>
        <MessageCard
          title="Harbour Line timetable"
          meta="transit.harbourline.example"
          description="Departures every twelve minutes from Pier 4 until midnight."
          actions={<Button variant="secondary" size="compact" label="Open" />}
        />
      </ChatMessage>
    </div>
  ),
};
