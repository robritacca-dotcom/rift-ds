"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Textarea } from "@robr0/design-system/components/Textarea/Textarea";
import { Dropdown } from "@robr0/design-system/components/Dropdown/Dropdown";
import { Combobox } from "@robr0/design-system/components/Combobox/Combobox";
import { DateInput } from "@robr0/design-system/components/DateInput/DateInput";
import { Checkbox } from "@robr0/design-system/components/Checkbox/Checkbox";
import { RadioButton } from "@robr0/design-system/components/RadioButton/RadioButton";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { Slider } from "@robr0/design-system/components/Slider/Slider";
import { SelectionCard } from "@robr0/design-system/components/SelectionCard/SelectionCard";

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
