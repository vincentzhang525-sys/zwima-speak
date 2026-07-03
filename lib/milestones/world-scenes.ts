/**
 * @deprecated Sprint 12 — use lib/content/milestone-defs/world.ts
 * Kept for import compatibility during migration.
 */
export { WORLD_MILESTONE_DEFS } from "../content/milestone-defs/world";

import type { Language, LifeMilestone } from "../types";
import { getContentPack } from "../content";

/** @deprecated use getContentPack(language).milestones */
export function getWorldSceneMilestones(language: Language): Record<string, LifeMilestone> {
  const pack = getContentPack(language);
  const ids = [
    "airport",
    "apartment",
    "bus",
    "train",
    "bank",
    "doctor",
    "buergeramt",
    "work",
  ] as const;
  const out: Record<string, LifeMilestone> = {};
  for (const id of ids) {
    if (pack.milestones[id]) out[id] = pack.milestones[id];
  }
  return out;
}

/** @deprecated */
export const WORLD_SCENE_MILESTONES = {
  get german() {
    return getWorldSceneMilestones("german");
  },
  get english() {
    return getWorldSceneMilestones("english");
  },
};
