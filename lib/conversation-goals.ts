/**
 * Sprint 7–8 — Conversation Goals delegate to living-world life objectives.
 */
import type { DynamicMilestoneId } from "./conversation-objectives";
import type { Language } from "./types";
import { getLifeObjective } from "./living-world";

export interface ConversationGoal {
  milestoneId: DynamicMilestoneId;
  goal: Record<Language, string>;
  successMarkers: string[];
}

export function getConversationGoal(milestoneId: DynamicMilestoneId): ConversationGoal {
  const life = getLifeObjective(milestoneId);
  return {
    milestoneId,
    goal: life.task,
    successMarkers: life.remembers ?? [],
  };
}