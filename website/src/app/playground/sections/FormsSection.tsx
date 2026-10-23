"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Input } from "rift-ds/components/Input/Input";
import { Dropdown } from "rift-ds/components/Dropdown/Dropdown";
import { Combobox } from "rift-ds/components/Combobox/Combobox";
import { DateInput } from "rift-ds/components/DateInput/DateInput";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { RadioButton } from "rift-ds/components/RadioButton/RadioButton";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { Slider } from "rift-ds/components/Slider/Slider";
import { SelectionCard } from "rift-ds/components/SelectionCard/SelectionCard";
import { NumberInput } from "rift-ds/components/NumberInput/NumberInput";
import { TimePicker } from "rift-ds/components/TimePicker/TimePicker";
import { TagInput } from "rift-ds/components/TagInput/TagInput";
import { PinInput } from "rift-ds/components/PinInput/PinInput";
import { Field } from "rift-ds/components/Field/Field";
import { Rating } from "rift-ds/components/Rating/Rating";
import { DatePicker } from "rift-ds/components/DatePicker/DatePicker";
import { Button } from "rift-ds/components/Button/Button";
import { AttachmentGroup } from "rift-ds/components/Attachment/AttachmentGroup";
import { AttachmentDropZone } from "rift-ds/components/Attachment/AttachmentDropZone";
import {
  getFileKind,
  type AttachmentItem,
} from "rift-ds/components/Attachment/fileTypes";
import { DOCUMENT_FIRST_PAGE, PHOTOS, PHOTO_SQUARE } from "@/lib/attachment-demo";

const ROLE_OPTIONS = [
  { label: "Designer", value: "designer" },
  { label: "Engineer", value: "engineer" },
  { label: "Product manager", value: "pm" },
];

const CITY_OPTIONS = [
  { label: "Toronto", value: "toronto", description: "Eastern time" },
  { label: "Vancouver", value: "vancouver", description: "Pacific time" },
  { label: "Montréal", value: "montreal", description: "Eastern time" },
  { label: "Calgary", value: "calgary", description: "Mountain time" },
];

/* The files on a sent message: pictures with their previews, a document
   with its first page, a format mark, and the two states a tile can be
   caught in. Dropping a file anywhere over the group adds it. */
const ATTACHMENTS: AttachmentItem[] = [
  { id: "whiteboard", name: "whiteboard.png", kind: "image", size: 830_000, status: "ready", previewSrc: PHOTO_SQUARE },
  { id: "roadmap", name: "Q4 roadmap.xlsx", kind: "spreadsheet", size: 88_000, status: "ready" },
  { id: "site-visit", name: "site-visit.jpg", kind: "image", size: 1_400_000, status: "ready", previewSrc: PHOTOS[0] },
  { id: "schedule", name: "demo_schedule.pdf", kind: "pdf", size: 1_200_000, status: "ready", previewSrc: DOCUMENT_FIRST_PAGE },
  { id: "logo-set", name: "logo-set.zip", kind: "archive", size: 8_100_000, status: "uploading", progress: 46 },
  { id: "brief", name: "brief.docx", kind: "document", size: 240_000, status: "error", error: "Too large" },
];

const PLAN_OPTIONS = [
  { value: "starter", label: "Starter", description: "For a single project" },
  { value: "team", label: "Team", description: "Shared workspaces and roles" },
];

export default function FormsSection() {
  const [role, setRole] = useState("designer");
  const [city, setCity] = useState<string | string[]>("toronto");
  const [date, setDate] = useState("2026-07-27");
  const [checked, setChecked] = useState(true);
  const [cadence, setCadence] = useState("weekly");
  const [toggle, setToggle] = useState(true);
  const [sliderValue, setSliderValue] = useState(60);
  const [plan, setPlan] = useState("team");
  const [seats, setSeats] = useState<number | "">(8);
  const [time, setTime] = useState("09:30");
  const [tags, setTags] = useState(["tokens", "themes"]);
  const [pin, setPin] = useState("4821");
  const [rating, setRating] = useState(4);
  const [pickedDate, setPickedDate] = useState("2026-10-14");
  const [attachments, setAttachments] = useState<AttachmentItem[]>(ATTACHMENTS);

  /* A dropped or picked file joins the group as a ready tile; a picture
     gets an object URL so its preview shows. Read in the browser only,
     never uploaded. */
  const addFiles = (added: File[]) =>
    setAttachments((prev) => [
      ...prev,
      ...added.map((file, i) => {
        const kind = getFileKind(file);
        return {
          id: `${file.name}-${file.size}-${prev.length + i}`,
          name: file.name,
          kind,
          size: file.size,
          mimeType: file.type,
          status: "ready" as const,
          previewSrc: kind === "image" ? URL.createObjectURL(file) : undefined,
        };
      }),
    ]);

  /* The keyboard path beside the drop: a picker the button opens. */
  const pickFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => addFiles(Array.from(input.files ?? []));
    input.click();
  };

  return (
    <section className={styles.demoSection} aria-label="Forms and inputs">
      <SectionTitle title="Forms & inputs" />
      <p className={styles.sectionNote}>
        Focused borders, selected states, and checked fills all follow the action
        colour: focus any field to see it. The radius lever reshapes every input at
        once.
      </p>

      <div className={styles.demoColumns}>
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          helperText="Focus me: the active border follows the brand colour."
        />
        <Dropdown label="Role" value={role} options={ROLE_OPTIONS} onValueChange={setRole} />
        <Combobox
          label="City"
          options={CITY_OPTIONS}
          value={city}
          onValueChange={setCity}
          clearable
        />
        <DateInput label="Start date" value={date} onValueChange={setDate} />
      </div>

      <div className={styles.demoColumns}>
        <NumberInput
          label="Seats"
          value={seats}
          min={1}
          max={50}
          onValueChange={(v) => setSeats(v ?? "")}
          helperText="Steppers stop at 1 and 50."
        />
        <TimePicker label="Daily stand-up" value={time} onValueChange={setTime} />
        <TagInput label="Topics" values={tags} onValuesChange={setTags} maxTags={5} />
        <PinInput
          label="Verification code"
          length={4}
          value={pin}
          onValueChange={setPin}
        />
      </div>

      <div className={styles.demoColumns}>
        <Field label="Pick a launch date" group className={styles.fieldStack}>
          <DatePicker value={pickedDate} onDateSelect={setPickedDate} />
        </Field>
        <div className={styles.demoSection}>
          <Field
            label="Attachments"
            helperText="Drop a file anywhere over the tiles, or press one to open it."
            group
            className={styles.fieldStack}
          >
            <AttachmentDropZone
              onFilesSelected={addFiles}
              hint="Any file; pictures show their preview"
              className={styles.attachmentStage}
            >
              <AttachmentGroup items={attachments} align="start" max={6} label="Attached files" />
            </AttachmentDropZone>
            <div className={styles.demoRow}>
              <Button label="Add files" variant="secondary" size="compact" iconLeft="attach_file" onClick={pickFiles} />
              <Button label="Reset" variant="tertiary" size="compact" onClick={() => setAttachments(ATTACHMENTS)} />
            </div>
          </Field>
          <Field
            label="How did the theme turn out?"
            helperText="Stars keep their gold; focus one to see the brand ring."
            group
            className={styles.fieldStack}
          >
            <Rating value={rating} onValueChange={setRating} label="Theme rating" />
          </Field>
        </div>
      </div>

      <div className={styles.demoRow}>
        <Checkbox label="Checked state" checked={checked} onCheckedChange={setChecked} />
        <RadioButton
          label="Weekly digest"

          value="weekly"
          checked={cadence === "weekly"}
          onValueChange={() => setCadence("weekly")}
        />
        <RadioButton
          label="Monthly"

          value="monthly"
          checked={cadence === "monthly"}
          onValueChange={() => setCadence("monthly")}
        />
        <ToggleSwitch label="Toggle" checked={toggle} onCheckedChange={setToggle} />
      </div>

      <div className={styles.sliderRow}>
        <Slider
          value={sliderValue}
          min={0}
          max={100}
          onValueChange={setSliderValue}
          aria-label="Demo slider"
        />
        <span className={styles.sliderValue}>{sliderValue}</span>
      </div>

      <SelectionCard
        mode="radio"
        name="playground-plan"
        options={PLAN_OPTIONS}
        value={plan}
        onValueChange={(v) => setPlan(v as string)}
      />
    </section>
  );
}
