/**
 * Sprint 11 — Memory Engine public API
 */
import { resolveCoachLine } from "../adaptive-coach-engine";
import type {
  AnnaMemory,
  BilingualLine,
  Language,
  LearnerProfile,
  SupportLevel,
} from "../types";
import { applyMemoryInfluence } from "./influence";
import { pickMemoryRecallLine } from "./recall";

export type { LongTermMemory } from "../types";
export { EMPTY_LONG_TERM_MEMORY } from "../types";

export { recordMomentMemory, recordMilestoneMemory, mergeLongTermMemory } from "./record";
export { pickMemoryRecallLine, summarizeForAnna } from "./recall";
export {
  applyMemoryInfluence,
  getMemoryAdjustedSupportLevel,
  getMemoryNativeRatioAdjust,
  getMemoryTopicSuggestions,
  type MemoryInfluence,
} from "./influence";

export function getLongTermMemory(memory: AnnaMemory) {
  return memory.longTerm;
}

/** Rich memory block for AI prompts */
export function memoryContextForPrompt(
  memory: AnnaMemory,
  profile: LearnerProfile,
  _language: Language
): string {
  const ltm = memory.longTerm;
  const lines: string[] = [];

  lines.push(`confidence=${memory.confidenceScore}`);
  lines.push(`band=${memory.lastConfidenceBand}`);

  if (ltm.successfulHighlights.length > 0) {
    lines.push(`wins=${ltm.successfulHighlights.slice(-3).join("; ")}`);
  }

  const activeMistakes = ltm.phraseMistakes
    .filter((m) => !m.resolved && m.count >= 2)
    .map((m) => m.phrase);
  if (activeMistakes.length > 0) {
    lines.push(`watch_phrases=${activeMistakes.join(",")}`);
  }

  const resolved = ltm.phraseMistakes.filter((m) => m.resolved && m.count >= 2);
  if (resolved.length > 0) {
    lines.push(`improved_phrases=${resolved.map((m) => m.phrase).join(",")}`);
  }

  if (ltm.favoriteTopics.length > 0) {
    lines.push(`favorite_topics=${ltm.favoriteTopics.slice(0, 5).join(",")}`);
  }

  const trait = ltm.learnerPersonality[0];
  if (trait) {
    lines.push(`learner_trait=${trait.trait}(${trait.strength.toFixed(1)})`);
  }

  const recentEmotion = ltm.emotionalHistory[ltm.emotionalHistory.length - 1];
  if (recentEmotion) {
    lines.push(`recent_emotion=${recentEmotion.tone}`);
  }

  const recentConvo = ltm.conversationSummaries[ltm.conversationSummaries.length - 1];
  if (recentConvo) {
    lines.push(`last_session=${recentConvo.summary}`);
  }

  if (profile.job) {
    lines.push(`job=${profile.job}`);
  }

  const influence = applyMemoryInfluence(memory, { demonstratedMoments: 0, patternStrength: {} });
  lines.push(`difficulty=${influence.difficulty}`);
  lines.push(`encouragement=${influence.encouragementTone}`);

  return lines.join("\n");
}

export function prependRecallToCoachMessage(
  message: string,
  recall: BilingualLine | null,
  supportLevel: SupportLevel
): string {
  if (!recall) return message;
  const line = resolveCoachLine(recall, supportLevel);
  return `${line}\n\n${message}`;
}

export function buildCoachRecall(
  language: Language,
  memory: AnnaMemory,
  profile: LearnerProfile,
  milestoneId: string,
  momentId: string,
  patternKey: string
): BilingualLine | null {
  return pickMemoryRecallLine(language, memory, profile, {
    milestoneId,
    momentId,
    patternKey,
  });
}
