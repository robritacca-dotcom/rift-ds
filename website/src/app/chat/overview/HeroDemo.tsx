"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { ChatWidget, useChatWidget } from "rift-ds/chat";
import {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_RENDERERS,
  DEMO_STARTERS,
  DEMO_THREADS,
  createDemoTransport,
  demoAgentTabs,
} from "rift-ds/chat/demo";
import s from "../section.module.css";

/* The overview's live preview: the chat on the scripted conversation the
   package ships, in a wide card that seats every rail, or as a phone. */
const STAGES = {
  desktop: { label: "Desktop", width: 1100, height: 760, phone: false },
  phone: { label: "Phone", width: 390, height: 760, phone: true },
} as const;
type Stage = keyof typeof STAGES;

/** Opens the preview's provider on mount: the chat renders nothing useful closed. */
function OpenOnMount() {
  const { setOpen } = useChatWidget();
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);
  return null;
}

function Stage({ stage }: { stage: Stage }) {
  const { send } = useChatWidget();
  const preset = STAGES[stage];
  return (
    <div className={s.stage} style={{ width: "100%", maxWidth: preset.width, height: preset.height }} data-stage={stage}>
      <OpenOnMount />
      <ChatWidget
        title="Acme Assistant"
        tagline="How can we help you today?"
        starters={DEMO_STARTERS}
        startersKey={stage}
        fullscreenEnabled={false}
        closeEnabled={false}
        compact={preset.phone}
        phone={preset.phone}
        threads={!preset.phone}
        threadsProps={{
          defaultExpanded: false,
          logoText: "Acme Assistant",
          profile: { name: "Jordan Reyes", meta: "Pro" },
        }}
        tabs={!preset.phone}
        agent={{ tabs: demoAgentTabs("Acme Assistant") }}
        fileAttachments
        mentions={DEMO_MENTIONS}
        placeholder="Ask anything, @ for entities or / for commands"
        composerActions={<ModelPicker models={DEMO_MODELS} placement="top" />}
        disclaimer={
          <>
            A written preview. Nothing you type or attach leaves your browser.{" "}
            <button type="button" className={s.disclaimerAction} onClick={() => send("How is the trial going?")}>
              Ask about the trial
            </button>
          </>
        }
      />
    </div>
  );
}

export function HeroDemo() {
  const [stage, setStage] = useState<Stage>("desktop");
  const transport = useMemo(() => createDemoTransport(), []);
  return (
    <>
      <div className={s.stageBar}>
        <SegmentedControl
          segments={Object.entries(STAGES).map(([value, preset]) => ({ value, label: preset.label }))}
          activeSegment={stage}
          onSegmentChange={(value) => setStage(value as Stage)}
          size="compact"
          ariaLabel="Preview size"
        />
        <p className={s.stageNote}>A written preview. Pick a question to watch a reply come in.</p>
      </div>
      <SiteChatProvider key={stage} transport={transport} renderers={DEMO_RENDERERS} threads={DEMO_THREADS}>
        <Stage stage={stage} />
      </SiteChatProvider>
    </>
  );
}
