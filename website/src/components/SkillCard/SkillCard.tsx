import { Badge } from "rift-ds/components/Badge/Badge";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import type { SkillContent } from "@/data/skills-content.generated";
import styles from "./SkillCard.module.css";

/**
 * One skill on /skills: its icon and name, what it does, the whole skill
 * file behind a collapsed CodeBlock, and the phrases that invoke it. A
 * recurring skill also shows its cadence. Every card has this one shape;
 * the card's `id` is the skill's slug, which other pages link to.
 */
export interface SkillCardProps {
  /** The skill to draw, from the generated skills content. */
  skill: SkillContent;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div id={skill.slug} className={styles.skillCard}>
      <div className={styles.skillCardHeader}>
        <div className={styles.skillMeta}>
          <span className={`material-symbols-rounded ${styles.skillIcon}`}>{skill.icon}</span>
          <code className={styles.skillName}>{skill.name}</code>
        </div>
        {skill.cadence && <Badge variant="neutral" label={skill.cadence} />}
      </div>

      <p className={styles.skillDescription}>{skill.description}</p>

      <CodeBlock
        code={skill.content}
        filename={`${skill.slug}.md`}
        language="md"
        collapsible
        defaultCollapsed
        maxHeight={300}
      />

      <div className={styles.skillInvoke}>
        <span className={styles.skillInvokeLabel}>Invoke:</span>
        {skill.invoke.map((phrase) => (
          <Badge key={phrase} variant="info" label={phrase} />
        ))}
      </div>
    </div>
  );
}
