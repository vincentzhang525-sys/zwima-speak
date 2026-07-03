import type { AnnaMemory, ConversationMoment, Language, LifeMilestone, LivingWorldState } from "./types";
import {
  buildLearnerObservation,
  type LearnerObservation,
} from "./adaptive-coach-engine";
import { EMPTY_ANNA_MEMORY } from "./anna-memory";
import { EMPTY_TRANSITION } from "./transition-core";
import { coachReplyViaAI } from "./ai/conversation";
import { EMPTY_LIVING_WORLD } from "./world-state";
import {
  getFirstPlayableMilestoneId,
  getMilestone,
} from "./milestones";
import { bil } from "./milestones/bilingual";

export function getLifeMilestone(
  language: Language,
  milestoneId: string,
  conversationSeed?: string | null,
  annaMemory?: AnnaMemory | null,
  livingWorld?: LivingWorldState | null
): LifeMilestone {
  const milestone = getMilestone(
    language,
    milestoneId,
    conversationSeed,
    annaMemory,
    livingWorld
  );
  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }
  return milestone;
}

export function getCurrentMilestone(
  language: Language,
  milestoneId: string,
  conversationSeed?: string | null,
  annaMemory?: AnnaMemory | null,
  livingWorld?: LivingWorldState | null
): LifeMilestone {
  return getLifeMilestone(
    language,
    milestoneId,
    conversationSeed,
    annaMemory,
    livingWorld
  );
}

/** @deprecated use getCurrentMilestone */
export function getLifeDayScenario(language: Language): LifeMilestone {
  return getLifeMilestone(language, getFirstPlayableMilestoneId());
}

/** @deprecated alias */
export function getCoachScenario(language: Language): LifeMilestone {
  return getLifeDayScenario(language);
}

export function getCoachResponse(
  language: Language,
  milestoneId: string,
  momentIndex: number,
  learner: LearnerObservation,
  moment: ConversationMoment,
  options: {
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
  },
  livingWorld?: LivingWorldState | null
): { message: string; patternExamples: string[] } {
  return coachReplyViaAI(
    language,
    milestoneId,
    moment,
    momentIndex,
    learner,
    {
      responseLatencyMs: options.responseLatencyMs,
      neededDemonstration: options.neededDemonstration,
      targetPhrase: options.targetPhrase,
    },
    learner.memory,
    livingWorld ?? EMPTY_LIVING_WORLD,
    learner.transition
  );
}

/** @deprecated use getCoachResponse */
export function getMockSpeakFeedback(
  language: Language,
  milestoneId: string,
  momentIndex: number
) {
  const learner = buildLearnerObservation(
    EMPTY_ANNA_MEMORY,
    EMPTY_TRANSITION,
    `${milestoneId}:hello`,
    "hello",
    "Hallo"
  );
  return getCoachResponse(language, milestoneId, momentIndex, learner, {
    id: "hello",
    sceneBridge: bil("", ""),
    phrase: "Hallo",
    keyPhrase: "Hallo",
    speakPrompt: bil("", ""),
  }, {
    responseLatencyMs: 2000,
    neededDemonstration: false,
    targetPhrase: "Hallo",
  });
}
