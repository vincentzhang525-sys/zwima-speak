/**
 * Sprint 9 — AI memory snapshot
 * Unified view of learner + world state for any provider.
 */
import type { AnnaMemory, Language, LivingWorldState, TransitionProfile } from "../types";
import { buildLearnerObservation } from "../adaptive-coach-engine";
import type { UpdateMemoryInput, UpdateMemoryOutput } from "./provider";
import { recordExplainedIntent } from "../anna-intervention";
import { recordMomentWithAnna } from "../anna-memory";
import {
  applyLifeFacts,
  extractFactsFromMoment,
  mergeLearnerProfiles,
  syncProfileToAnnaMemory,
} from "../long-term-memory";
import { recordMomentMemory } from "../memory/record";
import { EMPTY_LEARNER_PROFILE } from "../types";

export interface AIMemorySnapshot {
  language: Language;
  anna: AnnaMemory;
  world: LivingWorldState;
  transition: TransitionProfile;
  learnerProfile: import("../types").LearnerProfile;
}

export function buildAIMemorySnapshot(
  language: Language,
  anna: AnnaMemory,
  world: LivingWorldState,
  transition: TransitionProfile,
  learnerProfile?: import("../types").LearnerProfile
): AIMemorySnapshot {
  const profile = mergeLearnerProfiles(
    learnerProfile ?? EMPTY_LEARNER_PROFILE,
    anna.learnerProfile
  );
  return {
    language,
    anna: syncProfileToAnnaMemory(anna, profile),
    world,
    transition,
    learnerProfile: profile,
  };
}

export function applyMemoryUpdate(input: UpdateMemoryInput): UpdateMemoryOutput {
  let memory = recordMomentWithAnna(input.memory, input.moment);

  if (input.annaIntervened && input.npcIntent) {
    memory = recordExplainedIntent(memory, input.npcIntent);
  }

  let learnerProfile = mergeLearnerProfiles(
    input.learnerProfile ?? memory.learnerProfile,
    memory.learnerProfile
  );

  if (input.milestoneId && input.language) {
    const facts = extractFactsFromMoment(
      input.language,
      input.milestoneId,
      input.moment.momentId,
      input.moment.keyPhrase,
      input.phrase ?? input.moment.keyPhrase,
      memory.daysTogether,
      input.moment.patternKey.includes("coffee")
        ? { productLabel: input.moment.keyPhrase }
        : undefined
    );
    learnerProfile = applyLifeFacts(learnerProfile, facts);
  }

  memory = syncProfileToAnnaMemory(memory, learnerProfile);

  if (input.milestoneId && input.language) {
    const longTerm = recordMomentMemory(memory, {
      language: input.language,
      milestoneId: input.milestoneId,
      momentId: input.moment.momentId,
      patternKey: input.moment.patternKey,
      keyPhrase: input.moment.keyPhrase,
      phrase: input.phrase ?? input.moment.keyPhrase,
      neededDemonstration: input.moment.neededDemonstration,
      responseLatencyMs: input.moment.responseLatencyMs,
      learnerProfile,
    });
    memory = { ...memory, longTerm };
  }

  return { memory, learnerProfile };
}

export function snapshotForBeat(
  snapshot: AIMemorySnapshot,
  milestoneId: string,
  momentId: string,
  keyPhrase: string
) {
  const patternKey = `${milestoneId}:${momentId}`;
  return buildLearnerObservation(
    snapshot.anna,
    snapshot.transition,
    patternKey,
    momentId,
    keyPhrase
  );
}
