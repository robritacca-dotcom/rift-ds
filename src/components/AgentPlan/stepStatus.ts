/**
 * The one status vocabulary for a unit of agent work — a plan step, a tool
 * call, a source visit. Every agent component whose rows move through a run
 * speaks it, so a consumer maps their own run state once and every surface
 * agrees. `scripts/validate-prop-vocabulary.mjs` holds the `ai` category to it;
 * design.md's AgentPlan spec owns the meanings.
 *
 *   pending   — not started, or waiting on something (an approval, a queue)
 *   active    — running now; the row shows a spinner
 *   completed — finished as intended
 *   failed    — finished without the intended result
 *
 * Each component writes its own words for a status (a tool call that is
 * pending "Needs approval"; a plan step that is pending is "Not started"),
 * but never its own set of statuses.
 */
export type AgentStepStatus = 'pending' | 'active' | 'completed' | 'failed';
