"use client";

/* One block's live preview: its chromeless route in a frame, at a desktop,
   tablet or phone width the reader picks. The frame renders the page at
   the device's real width and scales it down to the column, so a desktop
   preview shows the desktop layout rather than whatever fits the column.
   The scale follows the stage's width through a ResizeObserver: one state
   update per resize, never per pointer move. */

import { useEffect, useRef, useState } from "react";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import s from "./page.module.css";

const DEVICES = [
  { value: "desktop", label: "Desktop", icon: "desktop_windows", width: 1440 },
  { value: "tablet", label: "Tablet", icon: "tablet", width: 820 },
  { value: "phone", label: "Phone", icon: "smartphone", width: 390 },
] as const;

type Device = (typeof DEVICES)[number]["value"];

/** The height of the visible frame, in the column's pixels. */
const FRAME_HEIGHT = 640;

export function BlockPreview({ src, title }: { src: string; title: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [stageWidth, setStageWidth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const width = DEVICES.find((d) => d.value === device)!.width;
  const scale = stageWidth ? Math.min(1, stageWidth / width) : 1;

  return (
    <div className={s.preview}>
      <SegmentedControl
        size="compact"
        aria-label={`${title} preview width`}
        segments={DEVICES.map(({ value, label, icon }) => ({ value, label, icon }))}
        value={device}
        onValueChange={(value) => setDevice(value as Device)}
      />
      <div ref={stageRef} className={s.stage}>
        <div className={s.frame} style={{ width: width * scale, height: FRAME_HEIGHT }}>
          <iframe
            src={src}
            title={`${title} block, ${device} width`}
            loading="lazy"
            className={s.frameDoc}
            style={{
              width,
              height: FRAME_HEIGHT / scale,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
