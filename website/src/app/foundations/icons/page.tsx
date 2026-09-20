"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { EntityCard } from "@robr0/design-system/components/EntityCard/EntityCard";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/icons");

/* ============================================
   ICON DATA
   Material 3 — Rounded only.
   Grouped into logical categories.
   ============================================ */

interface IconCategory {
  title: string;
  icons: string[];
}

/** The four steps of the icon-size scale, mirroring tokens-light.css. */
const ICON_SIZES = [
  { label: "SM", px: "20px", token: "--icon-size-sm", use: "Compact controls, inline affordances" },
  { label: "MD", px: "24px", token: "--icon-size-md", use: "Default: most UI icons" },
  { label: "LG", px: "32px", token: "--icon-size-lg", use: "Feature icons, section headers" },
  { label: "XL", px: "48px", token: "--icon-size-xl", use: "Marketing and empty states" },
] as const;

const iconCategories: IconCategory[] = [
  {
    title: "Navigation",
    icons: [
      "home", "search", "menu", "close", "arrow_back", "arrow_forward",
      "arrow_upward", "arrow_downward", "chevron_left", "chevron_right",
      "expand_more", "expand_less", "unfold_more", "unfold_less",
      "first_page", "last_page", "navigate_before", "navigate_next",
      "refresh", "sync", "cached", "open_in_new", "open_in_full",
      "fullscreen", "fullscreen_exit", "zoom_in", "zoom_out",
      "apps", "grid_view", "view_list", "view_module", "view_column",
      "view_agenda", "dashboard", "more_vert", "more_horiz", "menu_open",
      "drag_indicator", "drag_handle",
    ],
  },
  {
    title: "User & account",
    icons: [
      "person", "account_circle", "face", "group", "people",
      "supervisor_account", "switch_account", "person_add", "person_remove",
      "login", "logout", "manage_accounts", "badge", "contact_page",
      "recent_actors", "contacts", "engineering", "support_agent",
      "admin_panel_settings",
    ],
  },
  {
    title: "Communication",
    icons: [
      "mail", "email", "inbox", "send", "forward_to_inbox",
      "mark_email_read", "mark_email_unread", "drafts", "outbox",
      "unsubscribe", "move_to_inbox", "phone", "call", "call_end",
      "dialpad", "voicemail", "contact_phone", "phone_in_talk",
      "message", "chat", "chat_bubble", "comment", "forum",
      "question_answer", "feedback", "sms", "textsms", "speaker_notes",
      "campaign", "announcement",
    ],
  },
  {
    title: "Content & files",
    icons: [
      "folder", "folder_open", "create_new_folder", "snippet_folder",
      "folder_shared", "description", "article", "note", "sticky_note_2",
      "text_snippet", "assignment", "file_copy", "content_copy",
      "content_cut", "content_paste", "file_present", "attach_file",
      "attachment", "link", "insert_link", "link_off", "add_link",
      "cloud", "cloud_upload", "cloud_download", "cloud_done",
      "cloud_sync", "cloud_off", "upload", "download", "upload_file",
      "download_for_offline", "file_download", "file_upload",
    ],
  },
  {
    title: "Media",
    icons: [
      "image", "photo", "photo_camera", "camera_alt",
      "add_photo_alternate", "photo_library", "collections", "burst_mode",
      "panorama", "filter", "image_search", "crop", "rotate_right",
      "flip", "tune", "palette", "brush", "color_lens", "gradient",
      "auto_fix_high", "movie", "video_library", "videocam",
      "play_circle", "play_arrow", "pause", "stop", "skip_next",
      "skip_previous", "fast_forward", "fast_rewind", "replay", "repeat",
      "shuffle", "volume_up", "volume_down", "volume_off", "volume_mute",
      "mic", "mic_off", "headphones",
    ],
  },
  {
    title: "Editing & formatting",
    icons: [
      "edit", "edit_note", "mode_edit", "draw", "create", "stylus",
      "border_color", "format_bold", "format_italic", "format_underlined",
      "format_size", "format_color_text", "format_align_left",
      "format_align_center", "format_align_right", "format_align_justify",
      "format_list_bulleted", "format_list_numbered", "format_quote",
      "format_indent_increase", "text_fields", "title", "subject",
      "notes", "spellcheck", "translate",
    ],
  },
  {
    title: "Actions & status",
    icons: [
      "add", "add_circle", "add_box", "remove", "remove_circle", "block",
      "do_not_disturb", "check", "check_circle", "check_box", "done",
      "done_all", "verified", "task_alt", "cancel", "clear",
      "highlight_off", "unpublished", "disabled_by_default", "delete",
      "delete_forever", "delete_outline", "restore_from_trash",
      "backspace", "save", "save_as", "archive", "unarchive", "inventory",
      "inventory_2", "star", "star_border", "star_half", "star_rate",
      "grade", "favorite", "favorite_border", "bookmark",
      "bookmark_border", "bookmarks", "bookmark_add", "bookmark_remove",
      "flag", "outlined_flag", "assistant_photo", "label",
      "label_important", "new_label",
    ],
  },
  {
    title: "Notifications & alerts",
    icons: [
      "notifications", "notifications_active", "notifications_none",
      "notifications_off", "notification_important", "add_alert", "error",
      "error_outline", "warning", "warning_amber", "info", "help",
      "report", "report_problem", "priority_high", "crisis_alert",
      "emergency", "doorbell", "alarm", "alarm_on", "timer",
    ],
  },
  {
    title: "Settings & security",
    icons: [
      "settings", "settings_suggest", "build", "construction", "handyman",
      "security", "privacy_tip", "shield", "vpn_key", "key", "password",
      "lock", "lock_open", "lock_clock", "no_encryption", "visibility",
      "visibility_off", "remove_red_eye", "preview", "pageview",
    ],
  },
  {
    title: "Commerce",
    icons: [
      "shopping_cart", "shopping_bag", "add_shopping_cart",
      "remove_shopping_cart", "storefront", "store", "local_mall",
      "loyalty", "card_giftcard", "redeem", "receipt", "receipt_long",
      "payment", "credit_card", "account_balance", "savings",
      "currency_exchange", "point_of_sale", "shopping_basket", "sell",
      "price_check", "discount", "local_offer", "new_releases",
    ],
  },
  {
    title: "Time & calendar",
    icons: [
      "schedule", "access_time", "hourglass_empty", "hourglass_full",
      "calendar_today", "event", "event_available", "event_busy",
      "date_range", "calendar_month", "today", "upcoming", "history",
      "update", "query_builder", "pending", "pending_actions",
    ],
  },
  {
    title: "Location & maps",
    icons: [
      "location_on", "place", "pin_drop", "add_location", "my_location",
      "gps_fixed", "gps_off", "map", "satellite", "layers", "terrain",
      "explore", "navigation", "directions", "near_me", "location_city",
      "home_work", "apartment", "house", "cottage", "domain", "business",
    ],
  },
  {
    title: "Travel & transport",
    icons: [
      "flight", "flight_takeoff", "flight_land", "local_airport",
      "connecting_airports", "directions_car", "directions_bus",
      "directions_subway", "directions_train", "directions_bike",
      "directions_walk", "directions_run", "local_shipping", "local_taxi",
      "departure_board", "commute", "emoji_transportation", "ev_station",
      "local_gas_station", "traffic",
    ],
  },
  {
    title: "Devices & hardware",
    icons: [
      "computer", "laptop", "phone_android", "phone_iphone", "tablet",
      "tablet_mac", "watch", "desktop_windows", "devices", "smartphone",
      "speaker", "headset", "keyboard", "mouse", "print", "scanner",
      "router", "wifi", "bluetooth", "usb", "cable", "battery_full",
      "memory", "storage", "sd_card", "sim_card", "developer_board",
      "sensors",
    ],
  },
  {
    title: "UI & display",
    icons: [
      "brightness_high", "brightness_low", "brightness_4",
      "brightness_auto", "dark_mode", "light_mode", "contrast",
      "invert_colors", "opacity", "tonality", "blur_on", "flare",
      "wb_sunny", "screen_rotation", "screen_lock_rotation",
      "stay_current_portrait", "stay_current_landscape", "crop_square",
      "crop_free", "straighten", "transform", "aspect_ratio",
    ],
  },
  {
    title: "Social & sharing",
    icons: [
      "share", "ios_share", "screen_share", "cast", "cast_connected",
      "rss_feed", "public", "language", "web", "alternate_email",
      "import_contacts", "group_add", "person_add_alt", "thumbs_up_down",
      "thumb_up", "thumb_down", "sentiment_satisfied", "emoji_emotions",
    ],
  },
  {
    title: "Data & analytics",
    icons: [
      "analytics", "insights", "assessment", "bar_chart", "pie_chart",
      "show_chart", "trending_up", "trending_down", "trending_flat",
      "equalizer", "data_usage", "donut_large", "query_stats",
      "leaderboard", "table_chart", "table_rows", "view_timeline",
      "timeline", "scatter_plot",
    ],
  },
  {
    title: "Development",
    icons: [
      "code", "terminal", "integration_instructions", "data_object",
      "javascript", "css", "html", "bug_report", "build_circle",
      "webhook", "api", "dataset", "database", "cloud_queue", "dns",
      "http", "cloud_circle", "token", "schema", "science", "psychology",
    ],
  },
  {
    title: "Health & wellness",
    icons: [
      "local_hospital", "medical_services", "health_and_safety", "healing",
      "medication", "vaccines", "biotech", "coronavirus", "masks",
      "sanitizer", "monitor_heart", "fitness_center", "sports", "pool",
      "self_improvement", "spa",
    ],
  },
  {
    title: "Entertainment",
    icons: [
      "sports_esports", "videogame_asset", "casino", "nightlife",
      "theater_comedy", "local_movies", "music_note", "library_music",
      "album", "audiotrack", "piano", "guitar", "mic_external_on",
    ],
  },
  {
    title: "Food & dining",
    icons: [
      "restaurant", "local_dining", "fastfood", "local_pizza",
      "lunch_dining", "dinner_dining", "breakfast_dining", "local_cafe",
      "local_bar", "liquor", "cake", "icecream", "emoji_food_beverage",
    ],
  },
  {
    title: "Weather & nature",
    icons: [
      "wb_cloudy", "ac_unit", "grain", "thunderstorm", "water_drop",
      "air", "wind_power", "eco", "energy_savings_leaf", "park", "forest",
      "nature", "nature_people",
    ],
  },
  {
    title: "Sports",
    icons: [
      "sports_basketball", "sports_soccer", "sports_tennis", "golf_course",
      "skateboarding", "snowboarding", "surfing", "kayaking", "hiking",
    ],
  },
  {
    title: "Miscellaneous",
    icons: [
      "extension", "lightbulb", "emoji_objects", "tips_and_updates",
      "school", "military_tech", "workspace_premium", "verified_user",
      "gavel", "balance", "policy", "copyright", "fingerprint",
      "qr_code", "qr_code_scanner", "barcode_reader", "nfc", "pets",
      "cruelty_free", "volunteer_activism", "heart_broken", "diversity_3",
    ],
  },
];

const totalIcons = iconCategories.reduce((sum, cat) => sum + cat.icons.length, 0);

/* ============================================
   PAGE
   ============================================ */

export default function IconsPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Icons</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=113-5431"
              storybookPath="/?path=/docs/foundations-icons--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Material Symbols 3, rounded variant only
            </p>
            <p className={styles.introBody}>
              One weight across the entire set, on a four-step size scale, so icons stay visually consistent next to text and inside components. Optical size tracks each step automatically, keeping stroke weight even from 20px to 48px. {totalIcons} icons are included.
            </p>
          </div>

          {/* Size scale */}
          <section className={`${styles.iconSection} animate-in animate-delay-2`}>
            <SectionTitle title="Sizes" trailing={ICON_SIZES.length} />

            <p className={styles.sizeNote}>
              Components set <code>--icon-size</code> to one of these steps,
              never a raw <code>font-size</code>. The scale starts at 20px
              because that is the floor of the font&rsquo;s optical-size axis
              (20–48); below it, stroke weight stops adapting and small icons
              read thin.
            </p>

            <div className={styles.sizeRow}>
              {ICON_SIZES.map((size) => (
                <div key={size.token} className={styles.sizeCard}>
                  <div className={styles.sizePreview}>
                    <span
                      className="material-symbols-rounded"
                      style={{ ["--icon-size" as string]: `var(${size.token})` }}
                      aria-hidden="true"
                    >
                      settings
                    </span>
                  </div>
                  <span className={styles.sizeLabel}>{size.label}</span>
                  <span className={styles.sizeValue}>{size.px}</span>
                  <code className={styles.sizeToken}>{size.token}</code>
                  <span className={styles.sizeUse}>{size.use}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Icon Categories */}
          {iconCategories.map((category, idx) => (
            <section
              key={category.title}
              className={`${styles.iconSection}${idx < 2 ? " animate-in animate-delay-2" : ""}`}
            >
              <SectionTitle title={category.title} trailing={category.icons.length} />

              <div className={styles.iconGrid}>
                {category.icons.map((iconName) => (
                  <EntityCard key={iconName} label={iconName} icon={iconName} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

    </>
  );
}
