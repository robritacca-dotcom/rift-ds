"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Input } from "rift-ds/components/Input/Input";
import { Textarea } from "rift-ds/components/Textarea/Textarea";
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
import {
  FileInput,
  type FileInputFile,
} from "rift-ds/components/FileInput/FileInput";

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
  const [files, setFiles] = useState<FileInputFile[]>([
    { id: "brand-guide", name: "brand-guide.pdf", size: 2_400_000, progress: 100 },
    { id: "logo-set", name: "logo-set.zip", size: 8_100_000, progress: 46 },
  ]);

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

      <Textarea
        label="Notes"
        placeholder="A couple of lines about the project…"
        rows={3}
        maxLength={280}
      />

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
          <FileInput
            label="Attachments"
            files={files}
            onFilesSelected={(added) =>
              setFiles((prev) => [
                ...prev,
                ...added.map((f) => ({ id: `${f.name}-${f.size}`, name: f.name, size: f.size, progress: 100 })),
              ])
            }
            onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          />
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
        <Checkbox label="Checked state" checked={checked} onChange={setChecked} />
        <RadioButton
          label="Weekly digest"
          name="playground-cadence"
          value="weekly"
          checked={cadence === "weekly"}
          onChange={() => setCadence("weekly")}
        />
        <RadioButton
          label="Monthly"
          name="playground-cadence"
          value="monthly"
          checked={cadence === "monthly"}
          onChange={() => setCadence("monthly")}
        />
        <ToggleSwitch label="Toggle" checked={toggle} onChange={setToggle} />
      </div>

      <div className={styles.sliderRow}>
        <Slider
          value={sliderValue}
          min={0}
          max={100}
          onValueChange={setSliderValue}
          ariaLabel="Demo slider"
        />
        <span className={styles.sliderValue}>{sliderValue}</span>
      </div>

      <SelectionCard
        mode="radio"
        name="playground-plan"
        options={PLAN_OPTIONS}
        value={plan}
        onChange={(v) => setPlan(v as string)}
      />
    </section>
  );
}
