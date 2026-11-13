"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { BREAKPOINT_MOBILE_PX, mediaBelow } from "rift-ds/tokens/breakpoints";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { Input } from "rift-ds/components/Input/Input";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { Rating } from "rift-ds/components/Rating/Rating";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Stat } from "rift-ds/components/Stat/Stat";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import styles from "./ThemeShowcase.module.css";

/* ---------------------------------------------------------------------------
   Shared pieces
   ------------------------------------------------------------------------ */

const PHOTO = {
  ridge: "/images/attachments/photo-1.jpg",
  green: "/images/attachments/photo-2.jpg",
  eclipse: "/images/attachments/photo-3.jpg",
  beam: "/images/attachments/photo-4.jpg",
  city: "/images/attachments/photo-5.jpg",
  fault: "/images/attachments/photo-6.jpg",
  gate: "/images/attachments/photo-7.jpg",
  tall: "/images/attachments/photo-tall.jpg",
  wide: "/images/attachments/photo-wide.jpg",
} as const;

/** A cover: a photograph, or generated art drawn from the theme's accents
    (one of six arrangements), so part of every grid moves with the theme. */
type Cover = { photo: string } | { art: 1 | 2 | 3 | 4 | 5 | 6 };

function CoverArt({ cover, alt, className }: { cover: Cover; alt: string; className?: string }) {
  if ("photo" in cover) {
    return (
      <span className={`${styles.cover} ${className ?? ""}`}>
        <Image src={cover.photo} alt={alt} fill sizes={`${mediaBelow(BREAKPOINT_MOBILE_PX)} 50vw, 240px`} />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={alt}
      className={`${styles.cover} ${styles[`art${cover.art}`]} ${className ?? ""}`}
    />
  );
}

function Panel({
  title,
  aside,
  children,
  flush,
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <article className={`${styles.panel} ${flush ? styles.panelFlush : ""}`}>
      {(title || aside) && (
        <header className={styles.panelHead}>
          {title && <h2 className={styles.panelTitle}>{title}</h2>}
          {aside && <div className={styles.panelAside}>{aside}</div>}
        </header>
      )}
      {children}
    </article>
  );
}

function Row({ lead, title, meta, end }: { lead?: ReactNode; title: ReactNode; meta?: ReactNode; end?: ReactNode }) {
  return (
    <div className={styles.row}>
      {lead}
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {meta && <span className={styles.rowMeta}>{meta}</span>}
      </div>
      {end && <div className={styles.rowEnd}>{end}</div>}
    </div>
  );
}

function SettingRow({ label, helper, on }: { label: string; helper: string; on?: boolean }) {
  return (
    <div className={styles.setting}>
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{label}</span>
        <span className={styles.rowMeta}>{helper}</span>
      </div>
      <ToggleSwitch ariaLabel={label} showLabel={false} defaultChecked={on} size="compact" />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Listening: a music app
   ------------------------------------------------------------------------ */

const ALBUMS: { title: string; artist: string; cover: Cover }[] = [
  { title: "Low Tide Signals", artist: "Mara Quill", cover: { photo: PHOTO.eclipse } },
  { title: "Northface", artist: "The Glass Orchard", cover: { photo: PHOTO.ridge } },
  { title: "Neon Psalms", artist: "Kito Vance", cover: { art: 1 } },
  { title: "Monolith", artist: "Sable Coast", cover: { photo: PHOTO.gate } },
  { title: "Fault Lines", artist: "Ilse Marrow", cover: { photo: PHOTO.fault } },
];

const MIXES: { title: string; line: string; cover: Cover }[] = [
  { title: "Late Night Drive", line: "Slow synths for empty roads", cover: { art: 2 } },
  { title: "Deep Focus", line: "Nothing with words in it", cover: { photo: PHOTO.beam } },
  { title: "Weekend Fuzz", line: "Loud guitars, warm amps", cover: { art: 3 } },
  { title: "City Rain", line: "Moody and a little grey", cover: { photo: PHOTO.city } },
  { title: "Sunday Brass", line: "Big bands for slow mornings", cover: { art: 4 } },
];

const QUEUE: { title: string; artist: string; time: string; cover: Cover }[] = [
  { title: "Paper Satellites", artist: "Mara Quill", time: "3:39", cover: { photo: PHOTO.eclipse } },
  { title: "Kept the Light On", artist: "Sable Coast", time: "5:25", cover: { art: 5 } },
  { title: "Undertow", artist: "Ilse Marrow", time: "3:50", cover: { photo: PHOTO.fault } },
  { title: "High Country", artist: "The Glass Orchard", time: "3:58", cover: { photo: PHOTO.green } },
  { title: "Static Bloom", artist: "Kito Vance", time: "2:54", cover: { art: 6 } },
];

function MusicLibrary() {
  return (
    <Panel flush>
      <div className={styles.appBar}>
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <Input ariaLabel="Search" type="search" iconLeft="search" size="compact" className={styles.appSearch} />
        <Avatar name="Rory Hale" size="sm" />
      </div>
      <div className={styles.appBody}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Your favourites</h3>
          <Button label="Show all" variant="tertiary" size="compact" />
        </div>
        <div className={styles.coverRow}>
          {ALBUMS.map((album) => (
            <div key={album.title} className={styles.coverItem}>
              <CoverArt cover={album.cover} alt={`${album.title} cover`} />
              <span className={styles.rowTitle}>{album.title}</span>
              <span className={styles.rowMeta}>{album.artist}</span>
            </div>
          ))}
        </div>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Made for you</h3>
          <Button label="Show all" variant="tertiary" size="compact" />
        </div>
        <div className={styles.coverRow}>
          {MIXES.map((mix) => (
            <div key={mix.title} className={styles.coverItem}>
              <CoverArt cover={mix.cover} alt={`${mix.title} cover`} />
              <span className={styles.rowTitle}>{mix.title}</span>
              <span className={styles.rowMeta}>{mix.line}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.player}>
        <Button label="Play" iconLeft="play_arrow" size="compact" />
        <CoverArt cover={{ photo: PHOTO.gate }} alt="Monolith cover" className={styles.thumb} />
        <div className={styles.playerTrack}>
          <span className={styles.rowTitle}>Kept the Light On</span>
          <ProgressBar value={38} size="compact" ariaLabel="Track progress" />
        </div>
        <span className={styles.rowMeta}>1:58 / 5:25</span>
      </div>
    </Panel>
  );
}

const listening = {
  wide: <MusicLibrary />,
  panels: [
    <Panel
      key="queue"
      title="Queue"
      aside={<Button label="Clear" variant="tertiary" size="compact" />}
    >
      <div className={styles.list}>
        {QUEUE.map((track) => (
          <Row
            key={track.title}
            lead={<CoverArt cover={track.cover} alt="" className={styles.thumb} />}
            title={track.title}
            meta={track.artist}
            end={<span className={styles.rowMeta}>{track.time}</span>}
          />
        ))}
      </div>
    </Panel>,
    <Panel key="spotlight" flush>
      <CoverArt cover={{ photo: PHOTO.ridge }} alt="Northface cover" className={styles.spotlightCover} />
      <div className={styles.spotlight}>
        <Rating value={4} readOnly size="compact" label="Rating" />
        <h3 className={styles.sectionTitle}>The Glass Orchard: Northface</h3>
        <p className={styles.body}>
          A cold, wide record made in a cabin above the tree line, all field
          recordings and patient piano.
        </p>
        <div className={styles.inline}>
          <Button label="Listen now" size="compact" />
          <Button label="Save" variant="secondary" iconLeft="favorite" size="compact" />
        </div>
      </div>
    </Panel>,
    <Panel key="sound" title="Sound" aside={<span className={styles.rowMeta}>Studio monitors</span>}>
      <Slider ariaLabel="Volume" defaultValue={72} />
      <div className={styles.chips}>
        <Chip label="Normalise" icon="equalizer" selected />
        <Chip label="Spatial" icon="surround_sound" />
        <Chip label="Crossfade" icon="sync_alt" selected />
      </div>
    </Panel>,
    <Panel key="settings" title="Settings">
      <SettingRow label="Automatic downloads" helper="Save music you add to your library" />
      <SettingRow label="Lossless audio" helper="Every detail, at a larger file size" on />
      <SettingRow label="Normalise volume" helper="Hold every track to one level" on />
    </Panel>,
    <Panel
      key="profile"
      title="Your profile"
      aside={<Button label="Save" size="compact" />}
    >
      <div className={styles.form}>
        <Input label="Name" value="Rory Hale" size="compact" />
        <Input label="Username" value="@roryhale" size="compact" />
        <Checkbox label="Show what I'm listening to" defaultChecked size="compact" />
        <Checkbox label="Let anyone follow my playlists" size="compact" />
      </div>
    </Panel>,
  ],
};

/* ---------------------------------------------------------------------------
   Workspace: a team and finance app
   ------------------------------------------------------------------------ */

const TEAM = [
  { name: "Amara Okafor", email: "amara@northwind.example" },
  { name: "Theo Lindqvist", email: "theo@northwind.example" },
  { name: "Priya Raman", email: "priya@northwind.example" },
  { name: "Jonah Ferris", email: "jonah@northwind.example" },
];

const ACTIVITY = [
  { name: "Amara Okafor", action: "Approved invoice 3461", time: "11:34" },
  { name: "Priya Raman", action: "Ordered 15 desk chairs", time: "09:43" },
  { name: "Theo Lindqvist", action: "Replied to comment 7514", time: "09:41" },
  { name: "Jonah Ferris", action: "Created 4 invoices", time: "Yesterday" },
];

function FinancePanel() {
  return (
    <Panel title="Financial performance" aside={<Badge label="This month" variant="info" />}>
      <p className={styles.body}>Key figures against the month before.</p>
      <div className={styles.stats}>
        <div className={styles.statCell}>
          <Stat label="Recurring revenue" value="$350K" delta="3.2%" trend="up" />
          <Sparkline data={[12, 14, 13, 17, 19, 18, 22]} variant="area" label="Recurring revenue trend" />
        </div>
        <div className={styles.statCell}>
          <Stat label="Operating cost" value="$211K" delta="12.8%" trend="down" />
          <Sparkline data={[20, 18, 19, 16, 15, 14, 13]} tone="error" label="Operating cost trend" />
        </div>
        <div className={styles.statCell}>
          <Stat label="Gross margin" value="44.6%" delta="1.2%" trend="down" />
          <Sparkline data={[9, 10, 9, 8, 9, 8, 7]} tone="neutral" label="Gross margin trend" />
        </div>
        <div className={styles.statCell}>
          <Stat label="Lifetime value" value="$1,849" delta="3%" trend="up" />
          <Sparkline data={[5, 6, 6, 7, 8, 8, 9]} tone="positive" label="Lifetime value trend" />
        </div>
      </div>
    </Panel>
  );
}

const workspace = {
  wide: <FinancePanel />,
  panels: [
    <Panel key="team" title="Your team">
      <Input
        ariaLabel="Email address"
        type="email"
        size="compact"
        action={<Button label="Invite" size="compact" />}
      />
      <div className={styles.list}>
        {TEAM.map((person) => (
          <Row
            key={person.name}
            lead={<Avatar name={person.name} size="sm" />}
            title={person.name}
            meta={person.email}
          />
        ))}
      </div>
    </Panel>,
    <Panel key="card" title="Company card">
      <div className={`${styles.card} ${styles.art2}`}>
        <span className={styles.cardName}>Northwind Studio</span>
        <span className={styles.cardNumber}>4929 3849 5027 1846</span>
      </div>
      <div className={styles.inline}>
        <Button label="Freeze" variant="secondary" tone="destructive" size="compact" />
        <Button label="Done" size="compact" />
      </div>
    </Panel>,
    <Panel key="notify" title="Notifications">
      <SettingRow label="Comments" helper="When someone replies to you" on />
      <SettingRow label="Favourites" helper="Activity on what you starred" on />
      <SettingRow label="New documents" helper="When the team adds a file" />
    </Panel>,
    <Panel key="activity" title="Recent activity">
      <div className={styles.list}>
        {ACTIVITY.map((item) => (
          <Row
            key={item.action}
            lead={<Avatar name={item.name} size="sm" />}
            title={item.name}
            meta={item.action}
            end={<span className={styles.rowMeta}>{item.time}</span>}
          />
        ))}
      </div>
    </Panel>,
    <Panel key="signup" title="Sign up">
      <div className={styles.form}>
        <Input label="Email address" type="email" size="compact" />
        <Input label="Password" type="password" size="compact" />
        <div className={styles.inline}>
          <Button label="Create an account" variant="secondary" size="compact" />
          <Button label="Sign in" size="compact" />
        </div>
      </div>
    </Panel>,
    <Panel key="pricing" title="Pricing">
      <div className={styles.plans}>
        {[
          { name: "Basic", price: "$0", seats: "3 seats" },
          { name: "Growth", price: "$49", seats: "10 seats" },
          { name: "Pro", price: "$99", seats: "Unlimited" },
        ].map((plan) => (
          <div key={plan.name} className={styles.plan}>
            <span className={styles.rowTitle}>{plan.name}</span>
            <span className={styles.price}>{plan.price}</span>
            <span className={styles.rowMeta}>{plan.seats}</span>
          </div>
        ))}
      </div>
      <Button label="Start a trial" size="compact" />
    </Panel>,
  ],
};

/* ---------------------------------------------------------------------------
   Travel: a trip planner
   ------------------------------------------------------------------------ */

const STAYS: { name: string; place: string; price: string; rating: number; cover: Cover; tag?: string }[] = [
  { name: "Ridge Hut", place: "High Tatras", price: "$180", rating: 5, cover: { photo: PHOTO.green }, tag: "Rare find" },
  { name: "Ice Field Camp", place: "Westfjords", price: "$240", rating: 4, cover: { photo: PHOTO.wide } },
  { name: "Cinder Lodge", place: "Lanzarote", price: "$150", rating: 4, cover: { photo: PHOTO.fault } },
  { name: "Lakeside Cabin", place: "Lofoten", price: "$210", rating: 5, cover: { photo: PHOTO.eclipse }, tag: "New" },
];

function StaysPanel() {
  return (
    <Panel title="Stays for your trip" aside={<Button label="Map" variant="secondary" iconLeft="map" size="compact" />}>
      <div className={styles.chips}>
        <Chip label="Mountains" selected />
        <Chip label="Coast" />
        <Chip label="Off grid" />
        <Chip label="Pets welcome" />
      </div>
      <div className={styles.stays}>
        {STAYS.map((stay) => (
          <div key={stay.name} className={styles.stay}>
            <CoverArt cover={stay.cover} alt={`${stay.name}, ${stay.place}`} className={styles.stayPhoto} />
            <div className={styles.stayHead}>
              <span className={styles.rowTitle}>{stay.name}</span>
              {stay.tag && <Badge label={stay.tag} variant="positive" />}
            </div>
            <span className={styles.rowMeta}>{stay.place}</span>
            <div className={styles.stayHead}>
              <Rating value={stay.rating} readOnly size="compact" label={`${stay.name} rating`} />
              <span className={styles.rowTitle}>{stay.price}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const travel = {
  wide: <StaysPanel />,
  panels: [
    <Panel key="search" title="Where next?">
      <SegmentedControl
        aria-label="Trip type"
        fullWidth
        size="compact"
        defaultValue="stay"
        segments={[
          { value: "stay", label: "Stay" },
          { value: "flight", label: "Flight" },
          { value: "car", label: "Car" },
        ]}
      />
      <div className={styles.form}>
        <Input label="Destination" value="Lofoten, Norway" iconLeft="location_on" size="compact" />
        <Input label="Dates" value="Mar 4 to Mar 11" iconLeft="calendar_today" size="compact" />
        <Button label="Search stays" iconLeft="search" />
      </div>
    </Panel>,
    <Panel key="photo" flush>
      <CoverArt cover={{ photo: PHOTO.tall }} alt="A green ridge under cloud" className={styles.tall} />
      <div className={styles.spotlight}>
        <span className={styles.eyebrowSmall}>Guide of the week</span>
        <h3 className={styles.sectionTitle}>Walking the green spine</h3>
        <p className={styles.body}>Four days along the ridge, hut to hut, with nothing above you but weather.</p>
      </div>
    </Panel>,
    <Panel key="plan" title="Itinerary" aside={<Badge label="3 days" variant="neutral" />}>
      <div className={styles.list}>
        <Row lead={<span className={styles.day}>Mon</span>} title="Fly to Bodø" meta="Gate opens at 07:10" />
        <Row lead={<span className={styles.day}>Tue</span>} title="Ferry to Moskenes" meta="Three hours, sea view" />
        <Row lead={<span className={styles.day}>Wed</span>} title="Reinebringen hike" meta="Start before the crowds" />
      </div>
    </Panel>,
    <Panel key="packing" title="Packing list">
      <ProgressBar value={60} showLabel ariaLabel="Packed" />
      <div className={styles.form}>
        <Checkbox label="Shell jacket" defaultChecked size="compact" />
        <Checkbox label="Head torch" defaultChecked size="compact" />
        <Checkbox label="Wool layers" defaultChecked size="compact" />
        <Checkbox label="Ferry tickets" size="compact" />
      </div>
    </Panel>,
    <Panel key="weather" title="Weather on arrival">
      <div className={styles.statsTight}>
        <Stat label="High" value="4°" />
        <Stat label="Wind, km/h" value="18" />
        <Stat label="Daylight" value="10 h" />
      </div>
    </Panel>,
    <Panel key="review" title="Latest review">
      <Row lead={<Avatar name="Lena Brandt" size="sm" />} title="Lena Brandt" meta="Stayed at Ridge Hut" />
      <Rating value={5} readOnly size="compact" label="Lena Brandt's rating" />
      <p className={styles.body}>Woke up inside a cloud. The stove works, the view does the rest.</p>
    </Panel>,
  ],
};

/* ---------------------------------------------------------------------------
   Studio: a photo editor
   ------------------------------------------------------------------------ */

function EditorPanel() {
  return (
    <Panel flush>
      <div className={styles.editor}>
        <CoverArt cover={{ photo: PHOTO.wide }} alt="A figure with a red light in a dark valley" className={styles.canvas} />
        <div className={styles.editorSide}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Adjust</h3>
            <Button label="Reset" variant="tertiary" size="compact" />
          </div>
          <Slider label="Exposure" defaultValue={58} size="compact" showValue />
          <Slider label="Contrast" defaultValue={72} size="compact" showValue />
          <Slider label="Warmth" defaultValue={34} size="compact" showValue />
          <Slider label="Grain" defaultValue={20} size="compact" showValue />
          <SegmentedControl
            aria-label="Crop"
            fullWidth
            size="compact"
            defaultValue="3:2"
            segments={[
              { value: "1:1", label: "1:1" },
              { value: "3:2", label: "3:2" },
              { value: "16:9", label: "16:9" },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}

const STUDIO_SHOTS: Cover[] = [
  { photo: PHOTO.eclipse },
  { photo: PHOTO.beam },
  { art: 1 },
  { photo: PHOTO.city },
  { photo: PHOTO.gate },
  { art: 4 },
];

const studio = {
  wide: <EditorPanel />,
  panels: [
    <Panel key="collection" title="Night series" aside={<Badge label="12 photos" variant="neutral" />}>
      <div className={styles.grid}>
        {STUDIO_SHOTS.map((shot, index) => (
          <CoverArt key={index} cover={shot} alt={`Night series, photo ${index + 1}`} />
        ))}
      </div>
    </Panel>,
    <Panel key="layers" title="Layers">
      <SettingRow label="Light leak" helper="Screen, 40%" on />
      <SettingRow label="Colour grade" helper="Teal and magenta" on />
      <SettingRow label="Vignette" helper="Soft, 25%" />
    </Panel>,
    <Panel key="export" title="Export">
      <SegmentedControl
        aria-label="Format"
        fullWidth
        size="compact"
        defaultValue="jpg"
        segments={[
          { value: "jpg", label: "JPEG" },
          { value: "png", label: "PNG" },
          { value: "tif", label: "TIFF" },
        ]}
      />
      <Slider label="Quality" defaultValue={90} size="compact" showValue />
      <Checkbox label="Keep location data" size="compact" />
      <Button label="Export 12 photos" iconLeft="download" />
    </Panel>,
    <Panel key="storage" title="Storage">
      <Stat label="Used of 200 GB" value="148 GB" />
      <ProgressBar value={74} ariaLabel="Storage used" />
      <Button label="Upgrade" variant="secondary" size="compact" />
    </Panel>,
    <Panel key="comments" title="Comments">
      <Row lead={<Avatar name="Noor Haddad" size="sm" />} title="Noor Haddad" meta="Pull the red down a touch?" />
      <Row lead={<Avatar name="Felix Arden" size="sm" />} title="Felix Arden" meta="Third frame is the cover." />
      <Input ariaLabel="Add a comment" size="compact" action={<Button label="Send" size="compact" />} />
    </Panel>,
  ],
};

/* ---------------------------------------------------------------------------
   The list
   ------------------------------------------------------------------------ */

export interface ShowcaseExample {
  id: string;
  /** The tab's name. */
  label: string;
  /** The theme id the example opens in (a THEME_PRESETS key or the base theme). */
  theme: string;
  wide: ReactNode;
  panels: ReactNode[];
}

export const EXAMPLES: ShowcaseExample[] = [
  { id: "listening", label: "Music", theme: "coral", ...listening },
  { id: "workspace", label: "Workspace", theme: "contrast", ...workspace },
  { id: "travel", label: "Travel", theme: "forest", ...travel },
  { id: "studio", label: "Studio", theme: "violet", ...studio },
];
