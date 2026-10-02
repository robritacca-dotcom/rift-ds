"use client";

/**
 * The miniature live previews shown on the /components index sections,
 * one per public component, keyed by registry slug.
 *
 * scripts/validate-website-surfaces.mjs holds this map to the registry in both
 * directions: every registered slug needs a preview entry here, and every key
 * here must be a registered slug.
 */
import { BottomNav } from "rift-ds/components/BottomNav/BottomNav";
import { TopAppBar } from "rift-ds/components/TopAppBar/TopAppBar";
import Image from "next/image";
import { AgentStatus } from "rift-ds/components/AgentStatus/AgentStatus";
import { AnimatedNumber } from "rift-ds/components/AnimatedNumber/AnimatedNumber";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { Toolbar, ToolbarSeparator } from "rift-ds/components/Toolbar/Toolbar";
import { Waveform } from "rift-ds/components/Waveform/Waveform";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { ChatHeader } from "rift-ds/components/ChatHeader/ChatHeader";
import { ChatMarker } from "rift-ds/components/ChatMarker/ChatMarker";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { ChatThread } from "rift-ds/components/ChatThread/ChatThread";
import { Alert } from "rift-ds/components/Alert/Alert";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { FilterBar } from "rift-ds/components/FilterBar/FilterBar";
import { Gauge } from "rift-ds/components/Gauge/Gauge";
import { StreamingText } from "rift-ds/components/StreamingText/StreamingText";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Banner } from "rift-ds/components/Banner/Banner";
import { Button } from "rift-ds/components/Button/Button";
import { ImageCompare } from "rift-ds/components/ImageCompare/ImageCompare";
import { Meter } from "rift-ds/components/Meter/Meter";
import { Rating } from "rift-ds/components/Rating/Rating";
import { SplitButton } from "rift-ds/components/SplitButton/SplitButton";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { Panel } from "rift-ds/components/Panel/Panel";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Quote } from "rift-ds/components/Quote/Quote";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Swatch } from "rift-ds/components/Swatch/Swatch";
import { Timeline } from "rift-ds/components/Timeline/Timeline";
import { ContributionGraph, type ContributionDay } from "rift-ds/components/ContributionGraph/ContributionGraph";
import { Divider } from "rift-ds/components/Divider/Divider";
import { DocumentChip } from "rift-ds/components/DocumentChip/DocumentChip";
import { NumberInput } from "rift-ds/components/NumberInput/NumberInput";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { InterruptCard } from "rift-ds/components/InterruptCard/InterruptCard";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { InspectorColorPicker } from "rift-ds/components/Inspector/InspectorColorPicker";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { Globe } from "rift-ds/components/Globe/Globe";
import { MapCallout } from "rift-ds/components/MapCallout/MapCallout";
import { MapLegend } from "rift-ds/components/MapLegend/MapLegend";
import { WorldMap } from "rift-ds/components/WorldMap/WorldMap";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Prose } from "rift-ds/components/Prose/Prose";
import { RadioButton } from "rift-ds/components/RadioButton/RadioButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ShaderField } from "rift-ds/components/ShaderField/ShaderField";
import { Skeleton } from "rift-ds/components/Skeleton/Skeleton";
import { Slider } from "rift-ds/components/Slider/Slider";
import { SourceChip } from "rift-ds/components/SourceChip/SourceChip";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { ToggleGroup } from "rift-ds/components/ToggleGroup/ToggleGroup";
import { MessageActions } from "rift-ds/components/MessageActions/MessageActions";
import { MessageCard } from "rift-ds/components/MessageCard/MessageCard";
import type { ReactNode } from "react";
import styles from "./ComponentPreviews.module.css";
import { BRAND_SHORT } from "@/config/brand.generated";

// Small fixed dataset for the contribution graph preview card
// 10 weeks: the grid columns are minmax(12px, 1fr), so ten of them plus
// gaps fill the 150px preview width exactly — no overflow scrollbar
const contributionPreviewDays: ContributionDay[] = Array.from({ length: 10 * 7 }, (_, i) => {
  const d = new Date(2026, 0, 4 + i);
  // 13-value cycle: coprime with the 7-day week, so levels vary
  // across rows instead of banding (14 % 7 = 0 striped every row)
  const level = ([0, 1, 3, 0, 2, 4, 1, 0, 2, 3, 1, 4, 2][i % 13]) as ContributionDay["level"];
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    count: level * 3,
    level,
  };
});

/*
  The icons inside these preview cards are DELIBERATELY off the
  icon-size scale. They are miniature drawings of components — a
  12px chevron here is part of a scaled-down mock of an Accordion
  row, not an icon in a UI. Sizing them from --icon-size-* would
  make the mocks the wrong scale relative to the fake text beside
  them. Leave the inline pixel values alone; they are not a token
  violation. Real icons elsewhere on the site use the scale.
*/
const previews: Record<string, () => ReactNode> = {
  "accordion": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "4px", width: "120px" }}>
        <div className={styles.accordionPreviewRow}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>Section 1</span>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)", transform: "rotate(180deg)" }}>expand_more</span>
        </div>
        <div className={styles.accordionPreviewRow}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>Section 2</span>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>expand_more</span>
        </div>
      </div>
    </>
  ),
  "agent-plan": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "6px", width: "150px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-status-positive-icon)" }}>check_circle</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Read project files</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-status-info-icon)" }}>progress_activity</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" }}>Update dark tokens</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-status-neutral-icon)" }}>circle</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)" }}>Run the build</span>
        </div>
      </div>
    </>
  ),
  "agent-rail": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "150px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "999px", background: "var(--color-bg-container-tertiary)" }} />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" }}>Skylark</span>
        <div style={{ display: "flex", gap: "2px", padding: "2px", borderRadius: "999px", background: "var(--color-bg-container-secondary)" }}>
          {["Activity", "Asks", "Runs", "You"].map((label, i) => (
            <span
              key={label}
              style={{ fontSize: "8px", padding: "2px 5px", borderRadius: "999px", color: i === 0 ? "var(--color-text-primary)" : "var(--color-text-tertiary)", background: i === 0 ? "var(--color-bg-container-tertiary)" : "transparent" }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
          {["Watch the Q3 invoices", "Draft the renewal note"].map((row) => (
            <div key={row} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 4px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "999px", background: "var(--color-status-positive-icon)", flex: "none" }} />
              <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  ),
  "agent-status": () => (
    <>
      <AgentStatus state="working" label="Working" pattern="orbit" size="compact" />
    </>
  ),
  "ai-button": () => (
    <>
      <AiButton size="compact" />
    </>
  ),
  "alert": () => (
    <>
      <Alert variant="info" title="Heads up" size="compact" />
    </>
  ),
  "alert-dialog": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "6px", width: "120px" }}>
        <div style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" }}>Confirm?</span>
          <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
            <div style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "9px", color: "var(--color-text-secondary)", background: "var(--color-bg-container-secondary)" }}>Cancel</div>
            <div style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "9px", color: "#fff", background: "var(--color-action-primary-bg)" }}>OK</div>
          </div>
        </div>
      </div>
    </>
  ),
  "animated-number": () => (
    <>
      <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)" }}>
        <AnimatedNumber value={48210} />
      </span>
    </>
  ),
  "app-layout": () => (
    <>
      <div style={{ display: "flex", width: "140px", height: "72px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-bg-container-border)" }}>
        <div style={{ width: "34px", background: "var(--color-bg-container-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", paddingTop: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-primary)" }}>dashboard</span>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-secondary)" }}>analytics</span>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-secondary)" }}>settings</span>
        </div>
        <div style={{ flex: 1, background: "var(--color-bg-page-primary)", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ width: "50%", height: "8px", borderRadius: "3px", background: "var(--color-bg-container-secondary)" }} />
          <div style={{ width: "80%", height: "5px", borderRadius: "3px", background: "var(--color-bg-container-primary)" }} />
          <div style={{ width: "70%", height: "5px", borderRadius: "3px", background: "var(--color-bg-container-primary)" }} />
        </div>
      </div>
    </>
  ),
  "app-sidebar": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "4px", width: "100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 6px", borderRadius: "4px", background: "var(--color-action-passive-bg-hover)" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>dashboard</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-primary)" }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>analytics</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>Analytics</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>settings</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)" }}>Settings</span>
        </div>
      </div>
    </>
  ),
  "avatar": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "8px" }}>
        <Avatar size="sm" name="Jane Doe" />
        <Avatar size="md" name="Alex Smith" />
        <Avatar size="sm" />
      </div>
    </>
  ),
  "avatar-group": () => (
    <>
      <AvatarGroup size="sm" max={3} aria-label="Project members">
        <Avatar name="Jane Doe" />
        <Avatar name="Alex Smith" />
        <Avatar name="Sam Reyes" />
        <Avatar name="Kim Park" />
        <Avatar name="Lee Chen" />
      </AvatarGroup>
    </>
  ),
  "badge": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "8px" }}>
        <Badge variant="info" label="Info" />
        <Badge variant="positive" label="Success" />
        <Badge variant="error" label="Error" />
      </div>
    </>
  ),
  "banner": () => (
    <>
      <div style={{ width: "210px" }}>
        <Banner variant="info" title="v2 is live.">Read the notes.</Banner>
      </div>
    </>
  ),
  "bottom-nav": () => (
    <>
      {/* The real iOS bar at 60%, over a sketch of the page it floats on. */}
      <div style={{ position: "relative", width: "220px", height: "84px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", padding: "8px", boxSizing: "border-box" }}>
        <div style={{ height: "44px", borderRadius: "8px", background: "var(--color-bg-container-secondary)" }} />
        {/* inert + aria-hidden: a picture of the bar, not a second nav landmark
            with live buttons inside the index card. */}
        <div inert aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, width: "366px", transform: "scale(0.6)", transformOrigin: "bottom left" }}>
          <BottomNav
            platform="ios"
            activeKey="home"
            aria-label="Preview"
            items={[
              { key: "home", label: "Home", icon: "home" },
              { key: "search", label: "Explore", icon: "explore" },
              { key: "inbox", label: "Inbox", icon: "chat_bubble", badge: 2 },
              { key: "you", label: "You", icon: "account_circle" },
            ]}
          />
        </div>
      </div>
    </>
  ),
  "breadcrumb": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "4px", fontSize: "12px" }}>
        <span style={{ color: "var(--color-text-secondary)" }}>Home</span>
        <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>chevron_right</span>
        <span style={{ color: "var(--color-text-secondary)" }}>Section</span>
        <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>chevron_right</span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Page</span>
      </div>
    </>
  ),
  "button": () => (
    <>
      <Button label="Button" variant="secondary" state="default" />
    </>
  ),
  "button-group": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "10px" }}>
        <Button label="Active" variant="tertiary" state="active" />
        <Button label="Inactive" variant="tertiary" state="default" />
      </div>
    </>
  ),
  "card": () => (
    <>
      <div className={styles.cardPreview} />
    </>
  ),
  "card-stack": () => (
    <>
      <div aria-hidden="true" style={{ position: "relative", width: "110px", height: "84px" }}>
        <div style={{ position: "absolute", inset: "0 8px", top: "16px", height: "72px", borderRadius: "12px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-tertiary)" }} />
        <div style={{ position: "absolute", inset: "0 4px", top: "8px", height: "72px", borderRadius: "12px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-secondary)" }} />
        <div style={{ position: "absolute", inset: 0, height: "72px", borderRadius: "12px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", padding: "0 12px" }}>
          <span style={{ width: "60%", height: "8px", borderRadius: "4px", background: "var(--color-text-tertiary)", opacity: 0.5 }} />
          <span style={{ width: "40%", height: "6px", borderRadius: "3px", background: "var(--color-bg-container-tertiary)" }} />
        </div>
      </div>
    </>
  ),
  "carousel": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "8px", alignItems: "center" }}>
        <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "var(--color-icon-secondary)" }}>chevron_left</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-action-primary-bg)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-bg-container-border)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-bg-container-border)" }} />
        </div>
        <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "var(--color-icon-secondary)" }}>chevron_right</span>
      </div>
    </>
  ),
  "anchor-nav": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", width: "150px", borderLeft: "1px solid var(--color-divider)" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-primary)", padding: "3px 0 3px 12px", borderLeft: "2px solid var(--color-text-primary)", marginLeft: "-1px" }}>Preview</span>
        <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", padding: "3px 0 3px 12px" }}>Installation</span>
        <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", padding: "3px 0 3px 12px" }}>Filtering</span>
      </div>
    </>
  ),
  "area-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 48 L20 34 L40 40 L60 22 L80 28 L100 12 L120 18 L120 64 L0 64 Z" fill="var(--color-action-primary-bg)" opacity={0.3} />
        <path d="M0 48 L20 34 L40 40 L60 22 L80 28 L100 12 L120 18" stroke="var(--color-action-primary-bg)" strokeWidth="2" fill="none" />
        <line x1="0" y1="63.5" x2="120" y2="63.5" stroke="var(--color-bg-container-border)" strokeWidth="1" />
      </svg>
    </>
  ),
  "bar-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {[
          { x: 4, h: 28 },
          { x: 18, h: 44 },
          { x: 32, h: 36 },
          { x: 46, h: 52 },
          { x: 60, h: 24 },
          { x: 74, h: 40 },
          { x: 88, h: 48 },
          { x: 102, h: 32 },
        ].map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={64 - bar.h}
            width={10}
            height={bar.h}
            rx={2}
            fill="var(--color-action-primary-bg)"
            opacity={0.85}
          />
        ))}
        <line x1="0" y1="63.5" x2="120" y2="63.5" stroke="var(--color-bg-container-border)" strokeWidth="1" />
      </svg>
    </>
  ),
  "legend-tile": () => (
    <>
      <div style={{ display: "flex", gap: "8px" }}>
        <LegendTile label="Organic" value="74,500" swatch="var(--color-chart-series-1)" />
        <LegendTile label="Paid" value="38,500" swatch="var(--color-chart-series-2)" />
      </div>
    </>
  ),
  "lightbox": () => (
    <>
      {/* Static miniature of the viewer: media over a deep scrim with chevrons. */}
      <div style={{ position: "relative", width: "140px", height: "84px", borderRadius: "8px", background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "84px", height: "52px", borderRadius: "4px", background: "linear-gradient(135deg, var(--color-action-primary-bg), var(--color-core-accent-cobalt))" }} />
        <span className="material-symbols-rounded" style={{ position: "absolute", left: "8px", fontSize: "14px", color: "#fff" }}>chevron_left</span>
        <span className="material-symbols-rounded" style={{ position: "absolute", right: "8px", fontSize: "14px", color: "#fff" }}>chevron_right</span>
        <span className="material-symbols-rounded" style={{ position: "absolute", top: "6px", right: "8px", fontSize: "12px", color: "#fff" }}>close</span>
      </div>
    </>
  ),
  "line-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="0,44 24,28 48,36 72,16 96,24 120,8" stroke="var(--color-action-primary-bg)" strokeWidth="2" fill="none" />
        <polyline points="0,54 24,48 48,52 72,38 96,44 120,30" stroke="var(--color-action-primary-bg)" strokeWidth="2" opacity={0.4} fill="none" />
        <line x1="0" y1="63.5" x2="120" y2="63.5" stroke="var(--color-bg-container-border)" strokeWidth="1" />
      </svg>
    </>
  ),
  "pie-chart": () => (
    <>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" stroke="var(--color-action-primary-bg)" strokeWidth="14" opacity={0.3} fill="none" />
        {/* 60% slice: dash length over a c=150.8 circumference, rotated to start at 12 o'clock */}
        <circle cx="32" cy="32" r="24" stroke="var(--color-action-primary-bg)" strokeWidth="14" fill="none" strokeDasharray="90.5 150.8" transform="rotate(-90 32 32)" />
      </svg>
    </>
  ),
  "radar-chart": () => (
    <>
      <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="36,4 66,26 55,60 17,60 6,26" stroke="var(--color-bg-container-border)" strokeWidth="1" fill="none" />
        <polygon points="36,18 51,29 46,46 26,46 21,29" stroke="var(--color-bg-container-border)" strokeWidth="1" fill="none" />
        <polygon points="36,10 58,28 48,54 22,50 14,24" stroke="var(--color-action-primary-bg)" strokeWidth="2" fill="var(--color-action-primary-bg)" fillOpacity={0.25} />
      </svg>
    </>
  ),
  "radial-chart": () => (
    <>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring at 75%, inner ring at 45%, both from 12 o'clock */}
        <circle cx="32" cy="32" r="26" stroke="var(--color-bg-container-border)" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r="26" stroke="var(--color-action-primary-bg)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="122.5 163.4" transform="rotate(-90 32 32)" />
        <circle cx="32" cy="32" r="16" stroke="var(--color-bg-container-border)" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r="16" stroke="var(--color-action-primary-bg)" strokeWidth="6" opacity={0.5} fill="none" strokeLinecap="round" strokeDasharray="45.2 100.5" transform="rotate(-90 32 32)" />
      </svg>
    </>
  ),
  "scatter-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[
          { cx: 14, cy: 44 }, { cx: 24, cy: 36 }, { cx: 30, cy: 48 }, { cx: 38, cy: 40 }, { cx: 22, cy: 52 },
        ].map((p, i) => (
          <circle key={`a${i}`} cx={p.cx} cy={p.cy} r={4} fill="var(--color-action-primary-bg)" opacity={0.85} />
        ))}
        {[
          { cx: 78, cy: 20 }, { cx: 90, cy: 14 }, { cx: 96, cy: 26 }, { cx: 104, cy: 18 }, { cx: 86, cy: 30 },
        ].map((p, i) => (
          <circle key={`b${i}`} cx={p.cx} cy={p.cy} r={4} fill="var(--color-action-primary-bg)" opacity={0.4} />
        ))}
        <line x1="0" y1="63.5" x2="120" y2="63.5" stroke="var(--color-bg-container-border)" strokeWidth="1" />
      </svg>
    </>
  ),
  "stacked-bar-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[
          { x: 8, a: 22, b: 14 },
          { x: 32, a: 30, b: 20 },
          { x: 56, a: 18, b: 12 },
          { x: 80, a: 26, b: 18 },
          { x: 104, a: 22, b: 10 },
        ].map((bar, i) => (
          <g key={i}>
            <rect x={bar.x} y={64 - bar.a} width={10} height={bar.a} fill="var(--color-action-primary-bg)" opacity={0.85} />
            <rect x={bar.x} y={64 - bar.a - bar.b} width={10} height={bar.b} rx={2} fill="var(--color-action-primary-bg)" opacity={0.35} />
          </g>
        ))}
        <line x1="0" y1="63.5" x2="120" y2="63.5" stroke="var(--color-bg-container-border)" strokeWidth="1" />
      </svg>
    </>
  ),
  "tree-view": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "2px", width: "150px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)", transform: "rotate(90deg)" }}>chevron_right</span>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>folder</span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>src</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px 2px 18px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)", transform: "rotate(90deg)" }}>chevron_right</span>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>folder</span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>components</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px 2px 36px", background: "var(--color-action-passive-bg-active)", borderRadius: "4px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>draft</span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>Button.tsx</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 4px 2px 36px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>draft</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Badge.tsx</span>
        </div>
      </div>
    </>
  ),
  "treemap": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="56" height="64" rx="3" fill="var(--color-action-primary-bg)" opacity={0.85} />
        <rect x="60" y="0" width="60" height="30" rx="3" fill="var(--color-action-primary-bg)" opacity={0.5} />
        <rect x="60" y="34" width="34" height="30" rx="3" fill="var(--color-action-primary-bg)" opacity={0.3} />
        <rect x="98" y="34" width="22" height="30" rx="3" fill="var(--color-action-primary-bg)" opacity={0.15} />
      </svg>
    </>
  ),
  "chat-header": () => (
    <>
      <div style={{ width: "100%", border: "1px solid var(--color-bg-container-border)", borderRadius: "16px" }}>
        <ChatHeader
          title="Assistant"
          actions={
            <>
              <CircularButton icon="edit_square" variant="tertiary" ariaLabel="New chat" />
              <CircularButton icon="close" variant="tertiary" ariaLabel="Close chat" />
            </>
          }
        />
      </div>
    </>
  ),
  "chat-marker": () => (
    <>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        <ChatMarker>Today</ChatMarker>
        <ChatMarker icon="history">Conversation resumed</ChatMarker>
      </div>
    </>
  ),
  "chat-message": () => (
    <>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        <ChatMessage role="user" size="compact">
          Ready to review?
        </ChatMessage>
        <ChatMessage role="assistant" size="compact">
          Yes, the queue is clear.
        </ChatMessage>
      </div>
    </>
  ),
  "chat-thread": () => (
    <>
      <div style={{ width: "100%", height: "150px", display: "flex", flexDirection: "column", border: "1px solid var(--color-bg-container-border)", borderRadius: "16px", overflow: "hidden" }}>
        <ChatThread anchor={false} style={{ flex: 1, "--ds-chat-thread-padding-inline": "var(--padding-300)" } as React.CSSProperties}>
          <ChatMessage role="user" size="compact">
            Where do the fades come from?
          </ChatMessage>
          <ChatMessage role="assistant" size="compact">
            A CSS mask at either end. Content scrolls out through it, and the scrollbar only appears while scrolling.
          </ChatMessage>
        </ChatThread>
      </div>
    </>
  ),
  "checkbox": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "16px" }}>
        <Checkbox checked={true} ariaLabel="Checked" onChange={() => {}} />
        <Checkbox checked={false} ariaLabel="Unchecked" onChange={() => {}} />
      </div>
    </>
  ),
  "chip": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "8px" }}>
        <Chip size="compact" label="Filter" icon="check" selected onClick={() => {}} />
        <Chip size="compact" label="Label" />
        <Chip size="compact" label="Tag" onRemove={() => {}} />
      </div>
    </>
  ),
  "circular-button": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "12px" }}>
        <CircularButton icon="search" ariaLabel="Search" variant="secondary" />
        <CircularButton icon="settings" ariaLabel="Settings" variant="tertiary" />
      </div>
    </>
  ),
  "code-block": () => (
    <>
      <div className={styles.scaledComponentPreview} style={{ width: "224px" }}>
        <CodeBlock code={`--radius-pill: 999px;`} filename="tokens.css" showCopy={false} />
      </div>
    </>
  ),
  "code-diff": () => (
    <>
      <div aria-hidden="true" style={{ width: "170px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary)", overflow: "hidden", fontFamily: "var(--font-family-code)", fontSize: "11px", lineHeight: "20px", color: "var(--color-text-primary)", whiteSpace: "pre", padding: "6px 0" }}>
        <div style={{ padding: "0 10px" }}>{"  const t = s.trim();"}</div>
        <div style={{ padding: "0 10px", background: "var(--color-status-error-bg)" }}>{"- return t.toUpper();"}</div>
        <div style={{ padding: "0 10px", background: "var(--color-status-positive-bg)" }}>{"+ return upper(t);"}</div>
      </div>
    </>
  ),
  "color-picker": () => (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 10px 4px 4px", borderRadius: "12px", border: "1px solid var(--color-input-border-selected)" }}>
        <Swatch value="#118AB2" label="Teal 07" shape="square" tabIndex={-1} />
        <span style={{ fontSize: "12px", color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>#118AB2</span>
      </div>
    </>
  ),
  "combo-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        {[
          { x: 4, h: 24 },
          { x: 20, h: 32 },
          { x: 36, h: 28 },
          { x: 52, h: 40 },
          { x: 68, h: 36 },
          { x: 84, h: 48 },
          { x: 100, h: 56 },
        ].map(({ x, h }) => (
          <rect key={x} x={x} y={64 - h} width="10" height={h} rx="2" fill="var(--color-action-primary-bg)" opacity="0.7" />
        ))}
        <polyline
          points="9,40 25,34 41,38 57,26 73,28 89,18 105,10"
          fill="none"
          stroke="var(--color-chart-series-2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  ),
  "combobox": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "4px", width: "150px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--color-input-border-selected)", background: "var(--color-input-bg-primary)" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", width: "12px", height: "12px", color: "var(--color-icon-primary)" }}>search</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-primary)" }}>Can</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", padding: "4px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)" }}>
          <span style={{ fontSize: "10px", padding: "3px 6px", borderRadius: "4px", background: "var(--color-action-passive-bg-hover)", color: "var(--color-text-primary)" }}>Canada</span>
          <span style={{ fontSize: "10px", padding: "3px 6px", color: "var(--color-text-tertiary)" }}>Cancún</span>
        </div>
      </div>
    </>
  ),
  "command-palette": () => (
    <>
      <div style={{ width: "160px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", borderBottom: "1px solid var(--color-divider)" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>search</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>Type a command…</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", padding: "3px 6px", borderRadius: "4px", background: "var(--color-action-passive-bg-hover)" }}>
            <span style={{ fontSize: "10px", color: "var(--color-text-primary)" }}>New file</span>
            <span style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary)", color: "var(--color-text-tertiary)" }}>⌘N</span>
          </div>
          <span style={{ fontSize: "10px", padding: "3px 6px", color: "var(--color-text-tertiary)" }}>Toggle theme</span>
        </div>
      </div>
    </>
  ),
  "composer": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "160px", padding: "8px 10px", borderRadius: "12px", border: "1px solid var(--color-input-border-primary)", background: "var(--color-input-bg-primary)" }}>
        <span style={{ fontSize: "10px", color: "var(--color-input-text-placeholder)" }}>Message the agent</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)" }}>add</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "var(--color-action-primary-bg)" }}>
            <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-action-primary-text)" }}>arrow_upward</span>
          </span>
        </div>
      </div>
    </>
  ),
  "contact-card": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
        {[
          { icon: "mail", label: "Email" },
          { icon: "person", label: "LinkedIn" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary-semi)" }}>
            <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>{item.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{item.label}</span>
            <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>open_in_new</span>
          </div>
        ))}
      </div>
    </>
  ),
  "context-menu": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "150px", padding: "4px", borderRadius: "10px", border: "1px solid var(--color-input-border-primary)", background: "var(--color-bg-page-primary)", boxShadow: "var(--shadow-floating)" }}>
        {[
          { icon: "open_in_new", label: "Open", hover: false },
          { icon: "edit", label: "Rename", hover: true },
          { icon: "delete", label: "Delete", hover: false, destructive: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", borderRadius: "6px", background: item.hover ? "var(--color-action-passive-bg-hover)" : "transparent" }}>
            <span className="material-symbols-rounded" style={{ fontSize: "13px", color: item.destructive ? "var(--color-core-accent-coral)" : "var(--color-icon-secondary)" }}>{item.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: 500, color: item.destructive ? "var(--color-core-accent-coral)" : "var(--color-text-primary)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  ),
  "contribution-graph": () => (
    <>
      {/* The graph is fluid (width: 100%) — constrain it so the
          cells stay small inside the preview card */}
      <div style={{ width: "150px" }}>
        <ContributionGraph
          bare
          days={contributionPreviewDays}
          showMonthLabels={false}
          showLegend={false}
        />
      </div>
    </>
  ),
  "data-table": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "4px", width: "160px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "4px", borderBottom: "1px solid var(--color-divider)" }}>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>Customer</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)" }}>Status</span>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-secondary)" }}>arrow_upward</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", flex: 1 }}>Aspen Lubin</span>
          <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "var(--color-status-positive-bg)", color: "var(--color-status-positive-text)" }}>Shipped</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", flex: 1 }}>Omar Vetrovs</span>
          <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "var(--color-status-warning-bg)", color: "var(--color-status-warning-text)" }}>Waiting</span>
        </div>
      </div>
    </>
  ),
  "date-input": () => (
    <>
      <div className={styles.inputPreview}>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          dd/mm/yyyy
        </span>
      </div>
    </>
  ),
  "date-picker": () => (
    <>
      <span className="material-symbols-rounded" style={{ fontSize: "36px", color: "var(--color-icon-primary)" }}>
        calendar_month
      </span>
    </>
  ),
  "dialog": () => (
    <>
      <div style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", display: "flex", flexDirection: "column", gap: "6px", width: "130px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" }}>Edit profile</span>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-primary)" }}>close</span>
        </div>
        <div style={{ height: "5px", borderRadius: "3px", background: "var(--color-bg-container-primary)" }} />
        <div style={{ height: "5px", borderRadius: "3px", background: "var(--color-bg-container-primary)", width: "70%" }} />
        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <div style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "9px", color: "#fff", background: "var(--color-action-primary-bg)" }}>Save</div>
        </div>
      </div>
    </>
  ),
  "divider": () => (
    <>
      <div style={{ width: "120px" }}>
        <Divider spacing="sm" />
        <Divider label="or" spacing="sm" />
      </div>
    </>
  ),
  "document-chip": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--gap-100)" }}>
        <DocumentChip name="brief.pdf" fileType="pdf" meta="1.2 MB" />
        <DocumentChip name="budget.xlsx" fileType="sheet" size="compact" />
      </div>
    </>
  ),
  "drawer": () => (
    <>
      <div style={{ position: "relative", display: "flex", justifyContent: "flex-end", width: "150px", height: "70px", borderRadius: "8px", background: "var(--color-bg-container-primary)", overflow: "hidden" }}>
        <div style={{ width: "60%", height: "100%", padding: "8px", borderLeft: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)" }}>Filters</span>
          <div style={{ height: "5px", borderRadius: "3px", background: "var(--color-bg-container-secondary)" }} />
          <div style={{ height: "5px", width: "70%", borderRadius: "3px", background: "var(--color-bg-container-secondary)" }} />
        </div>
      </div>
    </>
  ),
  "dropdown": () => (
    <>
      <div className={styles.dropdownPreview}>
        <span className={styles.dropdownPreviewText}>Select</span>
        <span className="material-symbols-rounded" style={{ fontSize: "20px", color: "var(--color-icon-primary)" }}>
          expand_more
        </span>
      </div>
    </>
  ),
  "dropdown-menu": () => (
    <>
      <div className={styles.dropdownMenuPreview}>
        <div className={styles.dropdownMenuPreviewItem}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>person</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)" }}>Profile</span>
        </div>
        <div className={styles.dropdownMenuPreviewItem} style={{ background: "var(--color-action-passive-bg-hover)" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>settings</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)" }}>Settings</span>
        </div>
        <div className={styles.dropdownMenuPreviewSep} />
        <div className={styles.dropdownMenuPreviewItem}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>logout</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)" }}>Log out</span>
        </div>
      </div>
    </>
  ),
  "empty-state": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", width: "150px", padding: "12px 8px", borderRadius: "8px", border: "1px dashed var(--color-bg-container-border)" }}>
        <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "var(--color-icon-primary)", background: "var(--color-bg-container-primary)", borderRadius: "999px", padding: "5px" }}>inbox</span>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)" }}>No messages</span>
        <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>Nothing to show yet</span>
      </div>
    </>
  ),
  "entity-card": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "8px" }}>
        {["home", "star"].map((name) => (
          <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary)" }}>
            <span className="material-symbols-rounded" style={{ fontSize: "20px", color: "var(--color-text-primary)" }}>{name}</span>
            <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>{name}</span>
          </div>
        ))}
      </div>
    </>
  ),
  "event-calendar": () => (
    <>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3px", width: "140px" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "3px", borderRadius: "4px", background: "var(--color-bg-container-secondary)", minHeight: "22px" }}>
            <span style={{ fontSize: "8px", color: "var(--color-text-tertiary)" }}>{i + 9}</span>
            {(i === 1 || i === 6) && (
              <span style={{ display: "flex", alignItems: "center", gap: "2px", padding: "1px 3px", borderRadius: "3px", background: "var(--color-bg-container-primary)" }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: i === 1 ? "var(--color-core-accent-cobalt)" : "var(--color-core-accent-coral)" }} />
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  ),
  "field": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "150px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" }}>
          Email address <span style={{ color: "var(--color-core-accent-coral)" }}>*</span>
        </span>
        <div style={{ height: "26px", borderRadius: "10px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-container-primary)" }} />
        <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>We only use this to contact you.</span>
      </div>
    </>
  ),
  "figure": () => (
    <>
      <div style={{ width: "140px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-bg-container-border)" }}>
        <div style={{ height: "60px", background: "var(--color-bg-container-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "24px", color: "var(--color-icon-secondary)" }}>image</span>
        </div>
        <div style={{ padding: "6px 10px", fontSize: "10px", color: "var(--color-text-tertiary)", borderTop: "1px solid var(--color-bg-container-border)" }}>
          Caption text
        </div>
      </div>
    </>
  ),
  "file-input": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "150px", padding: "14px 8px", borderRadius: "8px", border: "1px dashed var(--color-input-border-primary)", background: "var(--color-input-bg-primary)" }}>
        <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "var(--color-icon-primary)" }}>upload_file</span>
        <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--color-text-primary)" }}>Drop a file</span>
        <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>or click to browse</span>
      </div>
    </>
  ),
  "input": () => (
    <>
      <div className={styles.inputPreview}>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          Enter text...
        </span>
      </div>
    </>
  ),
  /* The Inspector family: real controls at compact, held inert so the card
     link stays the only interactive element in its tile. */
  "inspector-color-picker": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorColorPicker size="compact" label="Tint" defaultValue="#8AE86E" />
      </div>
    </>
  ),
  "inspector-dropdown": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorDropdown size="compact" label="Layout" value="grid" options={[{ value: "grid", label: "Grid" }]} />
      </div>
    </>
  ),
  "inspector-input": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorInput size="compact" label="Name" defaultValue="Acme" />
      </div>
    </>
  ),
  "inspector-section": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorSection title="Shape" defaultOpen>
          <InspectorSlider size="compact" label="Radius" defaultValue={60} format={(v) => `${v}%`} />
          <InspectorToggleSwitch size="compact" label="Pill" defaultChecked />
        </InspectorSection>
      </div>
    </>
  ),
  "inspector-segmented-control": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorSegmentedControl
          size="compact"
          label="Size"
          defaultValue="s"
          options={[
            { value: "s", label: "S" },
            { value: "m", label: "M" },
            { value: "l", label: "L" },
          ]}
        />
      </div>
    </>
  ),
  "inspector-slider": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorSlider size="compact" label="Density" defaultValue={60} format={(v) => `${v}%`} />
      </div>
    </>
  ),
  "inspector-toggle-switch": () => (
    <>
      <div inert aria-hidden="true" style={{ width: "170px" }}>
        <InspectorToggleSwitch size="compact" label="Snap to grid" defaultChecked />
      </div>
    </>
  ),
  "instructions": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "6px" }}>
        <div className={styles.instructionStep}>
          <span className={styles.instructionBadge}>1</span>
          <span className={styles.instructionLabel}>First</span>
        </div>
        <div className={styles.instructionStep}>
          <span className={styles.instructionBadge}>2</span>
          <span className={styles.instructionLabel}>Second</span>
        </div>
      </div>
    </>
  ),
  "interrupt-card": () => (
    <>
      <div className={styles.scaledComponentPreview} style={{ width: "220px" }}>
        <InterruptCard
          title="Allow file edit?"
          options={[
            { value: "allow", label: "Allow", variant: "primary" },
            { value: "deny", label: "Deny" },
          ]}
        />
      </div>
    </>
  ),
  "kbd": () => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>K</Kbd>
      </div>
    </>
  ),
  "filter-bar": () => (
    <>
      <div style={{ pointerEvents: "none" }} aria-hidden="true">
        <FilterBar
          size="compact"
          filters={[
            { id: "status", label: "Status", options: [{ value: "open", label: "Open" }] },
            { id: "owner", label: "Owner", options: [{ value: "jane", label: "Jane" }] },
          ]}
          defaultValues={{ status: ["open"] }}
        />
      </div>
    </>
  ),
  "funnel-chart": () => (
    <>
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,0 120,0 97,15 23,15" fill="var(--color-chart-series-1)" />
        <polygon points="23,16.5 97,16.5 83,31.5 37,31.5" fill="var(--color-chart-series-2)" />
        <polygon points="37,33 83,33 74,48 46,48" fill="var(--color-chart-series-3)" />
        <rect x="46" y="49.5" width="28" height="14.5" fill="var(--color-chart-series-4)" />
      </svg>
    </>
  ),
  "gantt-chart": () => (
    <>
      <div aria-hidden="true" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px", width: "140px", padding: "6px 0" }}>
        <span style={{ position: "absolute", top: 0, bottom: 0, left: "62%", width: "2px", background: "var(--color-bg-page-inverse)", opacity: 0.7 }} />
        <span style={{ height: "8px", borderRadius: "999px", background: "var(--color-core-accent-cobalt)", width: "42%" }} />
        <span style={{ height: "8px", borderRadius: "999px", background: "var(--color-core-accent-mint)", width: "48%", marginLeft: "28%" }} />
        <span style={{ height: "8px", borderRadius: "999px", background: "var(--color-core-accent-violet)", width: "34%", marginLeft: "52%" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", background: "var(--color-core-accent-coral)", marginLeft: "78%" }} />
      </div>
    </>
  ),
  "gauge": () => (
    <>
      <Gauge
        bare
        value={72}
        size={84}
        strokeWidth={8}
        label="CPU"
        thresholds={[
          { value: 70, tone: "warning" },
          { value: 90, tone: "error" },
        ]}
      />
    </>
  ),
  "globe": () => (
    <>
      <div style={{ width: "130px" }}>
        <Globe
          points={[
            { id: "a", lat: -33.45, lng: -70.66, kind: "point" },
            { id: "b", lat: 43.65, lng: -79.38, kind: "anchor" },
            { id: "c", lat: 51.5, lng: -0.12, kind: "point" },
            { id: "d", lat: 1.35, lng: 103.82, kind: "point" },
          ]}
          arcs={[
            { from: "a", to: "b" },
            { from: "b", to: "c" },
            { from: "c", to: "d", altitude: 0.35 },
          ]}
          interactive={false}
          showLabels={false}
          label="Miniature globe"
        />
      </div>
    </>
  ),
  "hover-card": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "4px", width: "120px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "11px", color: "var(--color-action-primary-text-tertiary)", textDecoration: "underline" }}>@janedoe</span>
        <div style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)", boxShadow: "var(--shadow-floating)", display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--color-bg-container-tertiary)" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)" }}>Jane Doe</span>
          </div>
          <div style={{ width: "85%", height: "5px", borderRadius: "3px", background: "var(--color-bg-container-secondary)" }} />
          <div style={{ width: "60%", height: "5px", borderRadius: "3px", background: "var(--color-bg-container-secondary)" }} />
        </div>
      </div>
    </>
  ),
  "image-compare": () => (
    <>
      <div style={{ width: "140px" }}>
        <ImageCompare
          beforeSrc={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#d8d8d8"/><circle cx="620" cy="120" r="60" fill="#c2c2c2"/><path d="M0 340 Q200 240 400 330 T800 310 V500 H0 Z" fill="#a8a8a8"/></svg>')}`}
          afterSrc={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#8ecae6"/><circle cx="620" cy="120" r="60" fill="#ffb703"/><path d="M0 340 Q200 240 400 330 T800 310 V500 H0 Z" fill="#2a9d8f"/></svg>')}`}
          beforeAlt="Greyscale landscape"
          afterAlt="Colour landscape"
          showLabels={false}
        />
      </div>
    </>
  ),
  "map-callout": () => (
    <>
      <MapCallout title="Santiago, CL" lines={["Cobalt", "17.73 / 64 arcs"]} />
    </>
  ),
  "map-legend": () => (
    <>
      <MapLegend
        items={[
          { glyph: "point", label: "Listening point" },
          { glyph: "anchor", label: "Fixed witness" },
          { glyph: "arc", label: "Signal route" },
        ]}
      />
    </>
  ),
  "link-list": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { logo: "/logos/storybook.svg", label: "Storybook" },
          { logo: "/logos/Git.svg", label: "GitHub" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG source: next/image would need images.dangerouslyAllowSVG in next.config.ts to serve it at all. */}
            <img src={item.logo} alt="" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>{item.label}</span>
            <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: "auto" }}>open_in_new</span>
          </div>
        ))}
      </div>
    </>
  ),
  "message-actions": () => (
    <>
      <MessageActions
        showTooltips={false}
        items={[
          { id: "copy", icon: "content_copy", label: "Copy" },
          { id: "retry", icon: "refresh", label: "Retry" },
          { id: "thumb-up", icon: "thumb_up", label: "Good response" },
        ]}
      />
    </>
  ),
  "message-card": () => (
    <>
      <div className={styles.scaledComponentPreview} style={{ width: "220px" }}>
        <MessageCard
          title="Harbour timetable"
          meta="harbourline.example"
        />
      </div>
    </>
  ),
  "meter": () => (
    <>
      <div style={{ width: "130px" }}>
        <Meter label="Storage" value={64} showValue />
      </div>
    </>
  ),
  "model-picker": () => (
    <>
      <div aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "4px", height: "40px", padding: "0 12px", borderRadius: "999px", background: "var(--color-action-passive-bg-hover)" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)" }}>Sonnet 5</span>
        <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-secondary)" }}>expand_more</span>
      </div>
    </>
  ),
  "nav": () => (
    <>
      <div className={styles.previewRow} style={{ gap: "20px" }}>
        <Image src="/logos/mark.svg" alt={BRAND_SHORT} width={24} height={24} />
        <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.16px" }}>
          {BRAND_SHORT}
        </span>
      </div>
    </>
  ),
  "nav-list": () => (
    <>
      <div aria-hidden="true" style={{ width: "180px", display: "flex", flexDirection: "column", gap: "var(--gap-050)" }}>
        <Button
          variant="tertiary"
          label="Overview"
          state="active"
          tabIndex={-1}
          style={{ width: "100%", justifyContent: "flex-start" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-050)" }}>
          <Button
            variant="tertiary"
            label="Guides"
            tabIndex={-1}
            style={{ flex: "1 1 auto", justifyContent: "flex-start" }}
          />
          <CircularButton icon="expand_more" variant="tertiary" ariaLabel="Expand" tabIndex={-1} />
        </div>
      </div>
    </>
  ),
  "notification-center": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>Backup ready</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>2m</span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-status-info-border)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.7 }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)", flex: 1 }}>Review requested</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>1h</span>
        </div>
      </div>
    </>
  ),
  "number-input": () => (
    <>
      <div style={{ width: "150px" }}>
        <NumberInput defaultValue={2} min={0} max={10} aria-label="Quantity" />
      </div>
    </>
  ),
  "pagination": () => (
    <>
      <Pagination page={2} pageCount={3} onPageChange={() => {}} size="compact" />
    </>
  ),
  "panel": () => (
    <>
      <Panel padding="compact" style={{ width: "160px" }}>
        <span style={{ fontWeight: 600 }}>Revenue</span>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>
          The plain surface a dashboard builds on.
        </span>
      </Panel>
    </>
  ),
  "pin-input": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", gap: "6px" }}>
        {["4", "2", "", ""].map((ch, i) => (
          <span
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "34px", borderRadius: "8px",
              border: `1px solid ${i === 2 ? "var(--color-input-border-selected)" : "var(--color-input-border-primary)"}`,
              background: "var(--color-input-bg-primary)",
              fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)",
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    </>
  ),
  "popover": () => (
    <>
      <div className={styles.popoverPreview}>
        <span style={{ fontSize: "12px", color: "var(--color-text-primary)" }}>
          Popover
        </span>
        <div className={styles.popoverArrow} />
      </div>
    </>
  ),
  "progress-bar": () => (
    <>
      <div style={{ width: "120px" }}>
        <ProgressBar value={65} size="compact" />
      </div>
    </>
  ),
  "prompt-suggestions": () => (
    <>
      <PromptSuggestions
        layout="wrap"
        style={{ justifyContent: "center" }}
        suggestions={[
          { id: "ideas", label: "Brainstorm ideas", icon: "lightbulb" },
          { id: "trip", label: "Plan a trip" },
        ]}
      />
    </>
  ),
  "prose": () => (
    <>
      <div style={{ width: "100%", maxWidth: "220px", textAlign: "left" }}>
        <Prose size="sm">
          <h4>Release notes</h4>
          <p>
            Rendered markdown picks up the token scale, down to inline{" "}
            <code>code</code>.
          </p>
        </Prose>
      </div>
    </>
  ),
  "quote": () => (
    <>
      <div style={{ width: "170px" }}>
        <Quote>
          <span style={{ fontSize: "12px", lineHeight: "16px", display: "block" }}>
            Systems are coordination problems.
          </span>
        </Quote>
      </div>
    </>
  ),
  "radio-button": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "16px" }}>
        <RadioButton label="Option A" checked={true} onChange={() => {}} />
        <RadioButton label="Option B" checked={false} onChange={() => {}} />
      </div>
    </>
  ),
  "rating": () => (
    <>
      <Rating value={4} readOnly label="Preview rating" />
    </>
  ),
  "reasoning": () => (
    <>
      <div style={{ width: "160px" }}>
        <Reasoning duration={12}>
          Converted both regions to USD at the invoice-date rate before
          summing.
        </Reasoning>
      </div>
    </>
  ),
  "rich-dropdown": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "2px", width: "150px", padding: "4px", borderRadius: "10px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", borderRadius: "6px" }}>
          <span style={{ width: "14px", height: "14px", borderRadius: "999px", background: "#D97757", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "Georgia, serif", color: "var(--color-text-primary)" }}>Editorial</span>
          <span className="material-symbols-rounded" style={{ fontSize: "13px", color: "var(--color-action-primary-bg)", marginLeft: "auto" }}>check</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", borderRadius: "6px", background: "var(--color-action-passive-bg-hover)" }}>
          <span style={{ width: "14px", height: "14px", borderRadius: "999px", background: "#05A67C", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: "'Courier New', monospace", color: "var(--color-text-primary)" }}>Terminal</span>
        </div>
      </div>
    </>
  ),
  "section-title": () => (
    <>
      <div className={styles.sectionTitlePreview}>
        <span className={styles.sectionTitlePreviewText}>Section</span>
        <div className={styles.sectionTitlePreviewDivider} />
      </div>
    </>
  ),
  "segmented-control": () => (
    <>
      <SegmentedControl
        segments={[
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ]}
        activeSegment="a"
        size="compact"
      />
    </>
  ),
  "selection-card": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "6px", width: "150px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-action-primary-border)" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" }}>Option A</span>
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid var(--color-action-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-action-primary-bg)" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-primary)" }}>Option B</span>
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid var(--color-bg-container-border)", flexShrink: 0 }} />
        </div>
      </div>
    </>
  ),
  "shader-field": () => (
    <>
      <div style={{ position: "relative", width: "180px", height: "84px", overflow: "hidden", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)" }}>
        <ShaderField params={{ intensity: 0.85, scale: 1.6, streak: 0.3 }} />
      </div>
    </>
  ),
  "sidebar-panel": () => (
    <>
      <div className={styles.previewColumn} style={{ gap: "3px", width: "130px" }}>
        <span style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--color-text-secondary)", padding: "0 6px 4px" }}>REPORTS</span>
        <div style={{ padding: "4px 6px", borderRadius: "999px", background: "var(--color-action-passive-bg-hover)", fontSize: "10px", fontWeight: 600, color: "var(--color-text-primary)" }}>Standard reports</div>
        <div style={{ padding: "4px 6px", fontSize: "10px", color: "var(--color-text-primary)" }}>Custom reports</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", fontSize: "10px", color: "var(--color-text-primary)" }}>
          Planning
          <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-secondary)", transform: "rotate(180deg)" }}>expand_more</span>
        </div>
        <div style={{ marginLeft: "10px", paddingLeft: "8px", borderLeft: "1px solid var(--color-bg-container-border)", display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "10px", color: "var(--color-text-primary)", padding: "2px 0" }}>Budgets</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-primary)", padding: "2px 0" }}>Forecasts</span>
        </div>
      </div>
    </>
  ),
  "skeleton": () => (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Skeleton variant="circular" width="32px" height="32px" />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="60px" />
        </div>
      </div>
    </>
  ),
  "slider": () => (
    <>
      <div style={{ width: "120px" }}>
        <Slider value={60} />
      </div>
    </>
  ),
  "source-chip": () => (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
        <SourceChip index={1} title="Design tokens quarterly" />
        <SourceChip index={2} title="Theming layered systems" />
      </div>
    </>
  ),
  "source-trail": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-status-positive-icon)" }}>check_circle</span>
          <SourceChip title="Design tokens quarterly" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-status-info-icon)" }}>progress_activity</span>
          <SourceChip title="Contrast group notes" />
        </div>
      </div>
    </>
  ),
  "sparkline": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
        <Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 14, 13, 16]} tone="positive" variant="area" />
        <Sparkline data={[16, 14, 15, 12, 13, 10, 11, 8, 7, 8, 5]} tone="negative" />
      </div>
    </>
  ),
  "spinner": () => (
    <>
      <Spinner size="lg" />
    </>
  ),
  "stat": () => (
    <>
      <Stat value="~900%" label="Successful generations" trend="up" delta="+clash view" />
    </>
  ),
  "split-button": () => (
    <>
      <SplitButton
        label="Save"
        size="compact"
        items={[{ label: "Save as draft" }, { label: "Save as template" }]}
      />
    </>
  ),
  "split-pane": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", width: "150px", height: "70px", borderRadius: "8px", border: "1px solid var(--color-bg-container-border)", overflow: "hidden" }}>
        <div style={{ width: "40%", background: "var(--color-bg-container-secondary)" }} />
        <div style={{ width: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-container-primary)" }}>
          <div style={{ width: "3px", height: "22px", borderRadius: "2px", background: "var(--color-icon-secondary)" }} />
        </div>
        <div style={{ flex: 1, background: "var(--color-bg-container-primary)" }} />
      </div>
    </>
  ),
  "status-dot": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
        <StatusDot variant="positive" label="Operational" />
        <StatusDot variant="error" pulse label="Recording" />
        <StatusDot variant="neutral" label="Offline" />
      </div>
    </>
  ),
  "stepper": () => (
    <>
      <div aria-hidden="true" className={styles.previewRow} style={{ gap: "0", alignItems: "center" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1.5px solid var(--color-action-primary-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-rounded" style={{ fontSize: "12px", width: "12px", height: "12px", color: "var(--color-action-primary-text-tertiary)" }}>check</span>
        </div>
        <div style={{ width: "26px", height: "2px", background: "var(--color-action-primary-border-secondary)" }} />
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--color-action-primary-bg)", color: "var(--color-action-primary-text)", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
        <div style={{ width: "26px", height: "2px", background: "var(--color-divider)" }} />
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1.5px solid var(--color-bg-container-border)", color: "var(--color-text-tertiary)", fontSize: "11px", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
      </div>
    </>
  ),
  "streaming-text": () => (
    <>
      <div style={{ maxWidth: "170px", fontSize: "13px", lineHeight: 1.5, color: "var(--color-text-primary)", textAlign: "left" }}>
        <StreamingText text="Tokens landing one chunk at a" streaming />
      </div>
    </>
  ),
  "swatch": () => (
    <>
      <div style={{ display: "flex", gap: "8px" }}>
        <Swatch value="#EF476F" label="Red 07" tabIndex={-1} />
        <Swatch value="#FFD166" label="Yellow 07" tabIndex={-1} />
        <Swatch value="#118AB2" label="Teal 07" selected tabIndex={-1} />
        <Swatch value="#9E47EF" label="Purple 07" tabIndex={-1} />
      </div>
    </>
  ),
  "table": () => (
    <>
      <div className={styles.tablePreview}>
        <div className={`${styles.tablePreviewRow} ${styles.tablePreviewRowHeader}`} />
        <div className={styles.tablePreviewRow} />
        <div className={styles.tablePreviewRow} />
        <div className={styles.tablePreviewRow} />
      </div>
    </>
  ),
  "tabs": () => (
    <>
      <Tabs
        tabs={[
          { label: "One", value: "one" },
          { label: "Two", value: "two" },
        ]}
        activeTab="one"
        size="compact"
        onTabChange={() => {}}
      />
    </>
  ),
  "tag-input": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", width: "150px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--color-input-border-primary)", background: "var(--color-input-bg-primary)" }}>
        {["design", "tokens"].map((tag) => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "2px", padding: "1px 6px", borderRadius: "999px", background: "var(--color-bg-container-secondary)", fontSize: "10px", color: "var(--color-text-primary)" }}>
            {tag}
            <span className="material-symbols-rounded" style={{ fontSize: "10px", width: "10px", height: "10px", color: "var(--color-icon-primary)" }}>close</span>
          </span>
        ))}
        <span style={{ fontSize: "10px", color: "var(--color-input-text-placeholder)" }}>Add...</span>
      </div>
    </>
  ),
  "textarea": () => (
    <>
      <div className={styles.textareaPreview}>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          Enter text...
        </span>
      </div>
    </>
  ),
  "thread-panel": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: "4px", width: "160px" }}>
        <span style={{ fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "0 8px" }}>atlas-app</span>
        {[
          { title: "Rework the onboarding flow", active: false },
          { title: "Speed up the search index", active: true },
          { title: "Untangle billing webhooks", active: false },
        ].map((thread) => (
          <div key={thread.title} style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderRadius: "10px", background: thread.active ? "var(--color-bg-container-tertiary)" : "transparent" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{thread.title}</span>
          </div>
        ))}
      </div>
    </>
  ),
  "thread-tabs": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "4px", width: "170px" }}>
        {[
          { label: "Speed up search", active: true },
          { label: "Plan launch", active: false },
        ].map((tab) => (
          <div key={tab.label} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "999px", background: tab.active ? "var(--color-bg-container-tertiary)" : "transparent", minWidth: 0 }}>
            <span style={{ fontSize: "11px", color: tab.active ? "var(--color-text-primary)" : "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tab.label}</span>
            {tab.active && (
              <span className="material-symbols-rounded" style={{ fontSize: "12px", color: "var(--color-icon-primary)" }}>close</span>
            )}
          </div>
        ))}
        <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-icon-primary)", padding: "0 2px" }}>add</span>
      </div>
    </>
  ),
  "time-picker": () => (
    <>
      <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "12px", border: "1px solid var(--color-input-border-primary)", background: "var(--color-input-bg-primary)", width: "150px" }}>
        <span className="material-symbols-rounded" style={{ fontSize: "18px", color: "var(--color-icon-primary)" }}>schedule</span>
        <span style={{ flex: 1, fontSize: "14px", color: "var(--color-input-text-primary)", fontVariantNumeric: "tabular-nums" }}>2:30 PM</span>
        <span className="material-symbols-rounded" style={{ fontSize: "20px", color: "var(--color-icon-primary)" }}>expand_more</span>
      </div>
    </>
  ),
  "timeline": () => (
    <>
      <div style={{ width: "150px" }}>
        <Timeline
          numbered
          items={[{ title: "Discover" }, { title: "Design" }, { title: "Ship" }]}
        />
      </div>
    </>
  ),
  "toast": () => (
    <>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "6px", background: "var(--color-status-positive-bg)", border: "1px solid var(--color-status-positive-border)" }}>
        <span className="material-symbols-rounded" style={{ fontSize: "16px", color: "var(--color-status-positive-border)" }}>check_circle</span>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-status-positive-text)" }}>Saved</span>
      </div>
    </>
  ),
  "toggle-group": () => (
    <>
      <ToggleGroup
        items={[
          { value: "bold", label: "format_bold", icon: true },
          { value: "italic", label: "format_italic", icon: true },
          { value: "underline", label: "format_underlined", icon: true },
        ]}
        value={["bold"]}
        multiple
        size="compact"
      />
    </>
  ),
  "toggle-switch": () => (
    <>
      <div className={styles.togglePreview}>
        <div className={styles.toggleSocket}>
          <div className={styles.toggleThumb}>
            <span className="material-symbols-rounded" style={{ fontSize: "14px", color: "var(--color-action-primary-bg)" }}>
              check
            </span>
          </div>
        </div>
      </div>
    </>
  ),
  "tool-call": () => (
    <>
      <div style={{ width: "200px" }}>
        <ToolCall name="grep" duration="0.4s" />
      </div>
    </>
  ),
  "toolbar": () => (
    <>
      <Toolbar label="Zoom controls preview">
        <CircularButton icon="remove" variant="tertiary" size="compact" ariaLabel="Zoom out" tooltip={false} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-primary)" }}>100%</span>
        <CircularButton icon="add" variant="tertiary" size="compact" ariaLabel="Zoom in" tooltip={false} />
        <ToolbarSeparator />
        <CircularButton icon="fit_screen" variant="tertiary" size="compact" ariaLabel="Fit to screen" tooltip={false} />
      </Toolbar>
    </>
  ),
  "tooltip": () => (
    <>
      <div className={styles.popoverPreview}>
        <span style={{ fontSize: "12px", color: "var(--color-bg-page-primary)", background: "var(--color-bg-page-inverse)", padding: "2px 8px", borderRadius: "4px" }}>
          Tooltip
        </span>
        <div style={{ width: "8px", height: "8px", background: "var(--color-bg-page-inverse)", transform: "rotate(45deg)", marginTop: "-5px" }} />
      </div>
    </>
  ),
  "top-app-bar": () => (
    <>
      {/* The real Android bar at 60%, above a sketch of the page it heads. */}
      <div style={{ width: "220px", height: "84px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--color-bg-container-border)", background: "var(--color-bg-page-primary)" }}>
        <div inert aria-hidden="true" style={{ width: "366px", transform: "scale(0.6)", transformOrigin: "top left" }}>
          <TopAppBar
            platform="android"
            size="medium"
            title="Inbox"
            navigation="back"
            headingLevel={3}
            sticky={false}
            scrolled={false}
            actions={[{ key: "search", icon: "search", label: "Search" }]}
          />
        </div>
      </div>
    </>
  ),
  "usage-card": () => (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "170px" }}>
        <Meter label="Context" value={63} size="compact" showValue />
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Meter label="Weekly" value={86} variant="warning" size="compact" showValue />
          <span style={{ alignSelf: "flex-end", fontSize: "10px", color: "var(--color-text-secondary)" }}>Resets Tue 3:00 pm</span>
        </div>
      </div>
    </>
  ),
  "waveform": () => (
    <>
      <Waveform state="speaking" bars={9} />
    </>
  ),
  "world-map": () => (
    <>
      <div style={{ width: "170px", height: "110px" }}>
        <WorldMap
          points={[
            { id: "a", lat: 43.65, lng: -79.38, kind: "anchor" },
            { id: "b", lat: 51.5, lng: -0.12, color: "var(--color-chart-series-1)" },
            { id: "c", lat: -33.45, lng: -70.66, color: "var(--color-chart-series-2)" },
            { id: "d", lat: 35.68, lng: 139.69, color: "var(--color-chart-series-3)" },
          ]}
          interactive={false}
          graticuleStep={0}
          label="Miniature world map"
        />
      </div>
    </>
  ),
};

export function ComponentPreview({ slug }: { slug: string }) {
  const render = previews[slug];
  return render ? <>{render()}</> : null;
}
