import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import '../fonts/material-symbols.css';
import { EntityCard } from '../components/EntityCard/EntityCard';

/* ============================================
   ICON DATA
   Material 3 — Rounded only.
   Grouped into logical categories.
   ============================================ */

interface IconCategory {
  title: string;
  icons: string[];
}

const iconCategories: IconCategory[] = [
  {
    title: 'Navigation',
    icons: [
      'home', 'search', 'menu', 'close', 'arrow_back', 'arrow_forward',
      'arrow_upward', 'arrow_downward', 'chevron_left', 'chevron_right',
      'expand_more', 'expand_less', 'unfold_more', 'unfold_less',
      'first_page', 'last_page', 'navigate_before', 'navigate_next',
      'refresh', 'sync', 'cached', 'open_in_new', 'open_in_full',
      'fullscreen', 'fullscreen_exit', 'zoom_in', 'zoom_out',
      'apps', 'grid_view', 'view_list', 'view_module', 'view_column',
      'view_agenda', 'dashboard', 'more_vert', 'more_horiz', 'menu_open',
      'drag_indicator', 'drag_handle',
    ],
  },
  {
    title: 'User & Account',
    icons: [
      'person', 'account_circle', 'face', 'group', 'people',
      'supervisor_account', 'switch_account', 'person_add', 'person_remove',
      'login', 'logout', 'manage_accounts', 'badge', 'contact_page',
      'recent_actors', 'contacts', 'engineering', 'support_agent',
      'admin_panel_settings',
    ],
  },
  {
    title: 'Communication',
    icons: [
      'mail', 'email', 'inbox', 'send', 'forward_to_inbox',
      'mark_email_read', 'mark_email_unread', 'drafts', 'outbox',
      'unsubscribe', 'move_to_inbox', 'phone', 'call', 'call_end',
      'dialpad', 'voicemail', 'contact_phone', 'phone_in_talk',
      'message', 'chat', 'chat_bubble', 'comment', 'forum',
      'question_answer', 'feedback', 'sms', 'textsms', 'speaker_notes',
      'campaign', 'announcement',
    ],
  },
  {
    title: 'Content & Files',
    icons: [
      'folder', 'folder_open', 'create_new_folder', 'snippet_folder',
      'folder_shared', 'description', 'article', 'note', 'sticky_note_2',
      'text_snippet', 'assignment', 'file_copy', 'content_copy',
      'content_cut', 'content_paste', 'file_present', 'attach_file',
      'attachment', 'link', 'insert_link', 'link_off', 'add_link',
      'cloud', 'cloud_upload', 'cloud_download', 'cloud_done',
      'cloud_sync', 'cloud_off', 'upload', 'download', 'upload_file',
      'download_for_offline', 'file_download', 'file_upload',
    ],
  },
  {
    title: 'Media',
    icons: [
      'image', 'photo', 'photo_camera', 'camera_alt',
      'add_photo_alternate', 'photo_library', 'collections', 'burst_mode',
      'panorama', 'filter', 'image_search', 'crop', 'rotate_right',
      'flip', 'tune', 'palette', 'brush', 'color_lens', 'gradient',
      'auto_fix_high', 'movie', 'video_library', 'videocam',
      'play_circle', 'play_arrow', 'pause', 'stop', 'skip_next',
      'skip_previous', 'fast_forward', 'fast_rewind', 'replay', 'repeat',
      'shuffle', 'volume_up', 'volume_down', 'volume_off', 'volume_mute',
      'mic', 'mic_off', 'headphones',
    ],
  },
  {
    title: 'Editing & Formatting',
    icons: [
      'edit', 'edit_note', 'mode_edit', 'draw', 'create', 'stylus',
      'border_color', 'format_bold', 'format_italic', 'format_underlined',
      'format_size', 'format_color_text', 'format_align_left',
      'format_align_center', 'format_align_right', 'format_align_justify',
      'format_list_bulleted', 'format_list_numbered', 'format_quote',
      'format_indent_increase', 'text_fields', 'title', 'subject',
      'notes', 'spellcheck', 'translate',
    ],
  },
  {
    title: 'Actions & Status',
    icons: [
      'add', 'add_circle', 'add_box', 'remove', 'remove_circle', 'block',
      'do_not_disturb', 'check', 'check_circle', 'check_box', 'done',
      'done_all', 'verified', 'task_alt', 'cancel', 'clear',
      'highlight_off', 'unpublished', 'disabled_by_default', 'delete',
      'delete_forever', 'delete_outline', 'restore_from_trash',
      'backspace', 'save', 'save_as', 'archive', 'unarchive', 'inventory',
      'inventory_2', 'star', 'star_border', 'star_half', 'star_rate',
      'grade', 'favorite', 'favorite_border', 'bookmark',
      'bookmark_border', 'bookmarks', 'bookmark_add', 'bookmark_remove',
      'flag', 'outlined_flag', 'assistant_photo', 'label',
      'label_important', 'new_label',
    ],
  },
  {
    title: 'Notifications & Alerts',
    icons: [
      'notifications', 'notifications_active', 'notifications_none',
      'notifications_off', 'notification_important', 'add_alert', 'error',
      'error_outline', 'warning', 'warning_amber', 'info', 'help',
      'report', 'report_problem', 'priority_high', 'crisis_alert',
      'emergency', 'doorbell', 'alarm', 'alarm_on', 'timer',
    ],
  },
  {
    title: 'Settings & Security',
    icons: [
      'settings', 'settings_suggest', 'build', 'construction', 'handyman',
      'security', 'privacy_tip', 'shield', 'vpn_key', 'key', 'password',
      'lock', 'lock_open', 'lock_clock', 'no_encryption', 'visibility',
      'visibility_off', 'remove_red_eye', 'preview', 'pageview',
    ],
  },
  {
    title: 'Commerce',
    icons: [
      'shopping_cart', 'shopping_bag', 'add_shopping_cart',
      'remove_shopping_cart', 'storefront', 'store', 'local_mall',
      'loyalty', 'card_giftcard', 'redeem', 'receipt', 'receipt_long',
      'payment', 'credit_card', 'account_balance', 'savings',
      'currency_exchange', 'point_of_sale', 'shopping_basket', 'sell',
      'price_check', 'discount', 'local_offer', 'new_releases',
    ],
  },
  {
    title: 'Time & Calendar',
    icons: [
      'schedule', 'access_time', 'hourglass_empty', 'hourglass_full',
      'calendar_today', 'event', 'event_available', 'event_busy',
      'date_range', 'calendar_month', 'today', 'upcoming', 'history',
      'update', 'query_builder', 'pending', 'pending_actions',
    ],
  },
  {
    title: 'Location & Maps',
    icons: [
      'location_on', 'place', 'pin_drop', 'add_location', 'my_location',
      'gps_fixed', 'gps_off', 'map', 'satellite', 'layers', 'terrain',
      'explore', 'navigation', 'directions', 'near_me', 'location_city',
      'home_work', 'apartment', 'house', 'cottage', 'domain', 'business',
    ],
  },
  {
    title: 'Travel & Transport',
    icons: [
      'flight', 'flight_takeoff', 'flight_land', 'local_airport',
      'connecting_airports', 'directions_car', 'directions_bus',
      'directions_subway', 'directions_train', 'directions_bike',
      'directions_walk', 'directions_run', 'local_shipping', 'local_taxi',
      'departure_board', 'commute', 'emoji_transportation', 'ev_station',
      'local_gas_station', 'traffic',
    ],
  },
  {
    title: 'Devices & Hardware',
    icons: [
      'computer', 'laptop', 'phone_android', 'phone_iphone', 'tablet',
      'tablet_mac', 'watch', 'desktop_windows', 'devices', 'smartphone',
      'speaker', 'headset', 'keyboard', 'mouse', 'print', 'scanner',
      'router', 'wifi', 'bluetooth', 'usb', 'cable', 'battery_full',
      'memory', 'storage', 'sd_card', 'sim_card', 'developer_board',
      'sensors',
    ],
  },
  {
    title: 'UI & Display',
    icons: [
      'brightness_high', 'brightness_low', 'brightness_4',
      'brightness_auto', 'dark_mode', 'light_mode', 'contrast',
      'invert_colors', 'opacity', 'tonality', 'blur_on', 'flare',
      'wb_sunny', 'screen_rotation', 'screen_lock_rotation',
      'stay_current_portrait', 'stay_current_landscape', 'crop_square',
      'crop_free', 'straighten', 'transform', 'aspect_ratio',
    ],
  },
  {
    title: 'Social & Sharing',
    icons: [
      'share', 'ios_share', 'screen_share', 'cast', 'cast_connected',
      'rss_feed', 'public', 'language', 'web', 'alternate_email',
      'import_contacts', 'group_add', 'person_add_alt', 'thumbs_up_down',
      'thumb_up', 'thumb_down', 'sentiment_satisfied', 'emoji_emotions',
    ],
  },
  {
    title: 'Data & Analytics',
    icons: [
      'analytics', 'insights', 'assessment', 'bar_chart', 'pie_chart',
      'show_chart', 'trending_up', 'trending_down', 'trending_flat',
      'equalizer', 'data_usage', 'donut_large', 'query_stats',
      'leaderboard', 'table_chart', 'table_rows', 'view_timeline',
      'timeline', 'scatter_plot',
    ],
  },
  {
    title: 'Development',
    icons: [
      'code', 'terminal', 'integration_instructions', 'data_object',
      'javascript', 'css', 'html', 'bug_report', 'build_circle',
      'webhook', 'api', 'dataset', 'database', 'cloud_queue', 'dns',
      'http', 'cloud_circle', 'token', 'schema', 'science', 'psychology',
    ],
  },
  {
    title: 'Health & Wellness',
    icons: [
      'local_hospital', 'medical_services', 'health_and_safety', 'healing',
      'medication', 'vaccines', 'biotech', 'coronavirus', 'masks',
      'sanitizer', 'monitor_heart', 'fitness_center', 'sports', 'pool',
      'self_improvement', 'spa',
    ],
  },
  {
    title: 'Entertainment',
    icons: [
      'sports_esports', 'videogame_asset', 'casino', 'nightlife',
      'theater_comedy', 'local_movies', 'music_note', 'library_music',
      'album', 'audiotrack', 'piano', 'guitar', 'mic_external_on',
    ],
  },
  {
    title: 'Food & Dining',
    icons: [
      'restaurant', 'local_dining', 'fastfood', 'local_pizza',
      'lunch_dining', 'dinner_dining', 'breakfast_dining', 'local_cafe',
      'local_bar', 'liquor', 'cake', 'icecream', 'emoji_food_beverage',
    ],
  },
  {
    title: 'Weather & Nature',
    icons: [
      'wb_cloudy', 'ac_unit', 'grain', 'thunderstorm', 'water_drop',
      'air', 'wind_power', 'eco', 'energy_savings_leaf', 'park', 'forest',
      'nature', 'nature_people',
    ],
  },
  {
    title: 'Sports',
    icons: [
      'sports_basketball', 'sports_soccer', 'sports_tennis', 'golf_course',
      'skateboarding', 'snowboarding', 'surfing', 'kayaking', 'hiking',
    ],
  },
  {
    title: 'Miscellaneous',
    icons: [
      'extension', 'lightbulb', 'emoji_objects', 'tips_and_updates',
      'school', 'military_tech', 'workspace_premium', 'verified_user',
      'gavel', 'balance', 'policy', 'copyright', 'fingerprint',
      'qr_code', 'qr_code_scanner', 'barcode_reader', 'nfc', 'pets',
      'cruelty_free', 'volunteer_activism', 'heart_broken', 'diversity_3',
    ],
  },
];

const allIcons = iconCategories.flatMap((cat) => cat.icons);

const meta = {
  title: 'Foundations/Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Material Symbols 3 icon gallery: **Rounded** only.

## Usage
\`\`\`tsx
<span className="material-symbols-rounded">home</span>
\`\`\`

## Sizing
Set \`--icon-size\` to a scale step, never \`font-size\`, which changes the
glyph without changing its layout box.

\`\`\`css
.ds-thing__icon { --icon-size: var(--icon-size-sm); }
\`\`\`

| Token | Value | Use |
|---|---|---|
| \`--icon-size-sm\` | 20px | Compact controls, inline affordances |
| \`--icon-size-md\` | 24px | Default |
| \`--icon-size-lg\` | 32px | Feature icons |
| \`--icon-size-xl\` | 48px | Marketing, empty states |

The scale floors at 20px because that is the bottom of the font's \`opsz\`
(optical size) axis, which runs 20–48. \`font-optical-sizing: auto\` lets
stroke weight track the step automatically.
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ============================================
   SEARCHABLE ICON GALLERY
   ============================================ */

const SearchableIconGallery = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return iconCategories;
    const term = searchTerm.toLowerCase();
    return iconCategories
      .map((cat) => ({
        ...cat,
        icons: cat.icons.filter((icon) => icon.includes(term)),
      }))
      .filter((cat) => cat.icons.length > 0);
  }, [searchTerm]);

  const totalFiltered = filteredCategories.reduce((sum, cat) => sum + cat.icons.length, 0);

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8, fontFamily: 'system-ui, sans-serif', fontSize: 24 }}>
          Material Symbols Rounded
        </h2>
        <p style={{ color: '#6d6d6d', fontSize: 14, marginBottom: 16 }}>
          {totalFiltered} of {allIcons.length} icons
          {searchTerm && ` matching "${searchTerm}"`}
        </p>

        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '12px 16px',
            fontSize: 14,
            border: '1px solid #d6d6d6',
            borderRadius: 8,
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#118ab2'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#d6d6d6'; }}
        />
      </div>

      {/* Categorised grid */}
      {filteredCategories.map((category) => (
        <div key={category.title} style={{ marginBottom: 48 }}>
          <h3 style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text-secondary, #6d6d6d)',
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: '1px solid var(--color-bg-container-border, #303030)',
          }}>
            {category.title}
            <span style={{ fontWeight: 400, marginLeft: 8, fontSize: 14, color: 'var(--color-text-tertiary, #949494)' }}>
              {category.icons.length}
            </span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 16,
          }}>
            {category.icons.map((iconName) => (
              <EntityCard key={iconName} label={iconName} icon={iconName} />
            ))}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6d6d6d', fontSize: 14 }}>
          No icons found matching &ldquo;{searchTerm}&rdquo;
        </div>
      )}
    </div>
  );
};

export const AllIcons: Story = {
  render: () => <SearchableIconGallery />,
};

/* ============================================
   SIZE SCALE
   ============================================ */

const ICON_SIZES = [
  { label: 'SM', px: '20px', token: '--icon-size-sm', use: 'Compact controls, inline affordances' },
  { label: 'MD', px: '24px', token: '--icon-size-md', use: 'Default: most UI icons' },
  { label: 'LG', px: '32px', token: '--icon-size-lg', use: 'Feature icons, section headers' },
  { label: 'XL', px: '48px', token: '--icon-size-xl', use: 'Marketing and empty states' },
] as const;

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ margin: 0, maxWidth: '60ch', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
        Components set <code>--icon-size</code> to one of these steps, never a raw{' '}
        <code>font-size</code>. The scale starts at 20px because that is the floor of the
        font&rsquo;s optical-size axis (20–48); below it, stroke weight stops adapting.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {ICON_SIZES.map((size) => (
          <div
            key={size.token}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: 16,
              minWidth: 170,
              border: '1px solid var(--color-bg-container-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {/* Fixed stage so all four align on one baseline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: 56,
                marginBottom: 8,
                color: 'var(--color-icon-primary)',
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ ['--icon-size' as string]: `var(${size.token})` }}
                aria-hidden="true"
              >
                settings
              </span>
            </div>
            <strong style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>{size.label}</strong>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-action-primary-text-tertiary)' }}>
              {size.px}
            </span>
            <code style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{size.token}</code>
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{size.use}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
