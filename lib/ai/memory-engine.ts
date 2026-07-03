/**
 * Memory Engine — layer 2 of the AI pipeline
 * Builds unified snapshots and applies long-term memory updates.
 */
import type { AnnaMemory, Language, LivingWorldState, TransitionProfile } from "../types";
import type { LearnerProfile } from "../types";
import { memoryContextForPrompt } from "../memory";
import type { UpdateMemoryInput, UpdateMemoryOutput } from "./provider";
import {
  applyMemoryUpdate,
  buildAIMemorySnapshot,
  snapshotForBeat,
  type AIMemorySnapshot,
} from "./memory";

export type { AIMemorySnapshot };

export interface MemoryEngineContext {
  language: Language;
  anna: AnnaMemory;
  world: LivingWorldState;
  transition: TransitionProfile;
  learnerProfile?: LearnerProfile;
}

export const MemoryEngine = {
  buildSnapshot(ctx: MemoryEngineContext): AIMemorySnapshot {
    return buildAIMemorySnapshot(
      ctx.language,
      ctx.anna,
      ctx.world,
      ctx.transition,
      ctx.learnerProfile
    );
  },

  snapshotForBeat(
    snapshot: AIMemorySnapshot,
    milestoneId: string,
    momentId: string,
    keyPhrase: string
  ) {
    return snapshotForBeat(snapshot, milestoneId, momentId, keyPhrase);
  },

  applyUpdate(input: UpdateMemoryInput): UpdateMemoryOutput {
    return applyMemoryUpdate(input);
  },

  /** Serialize memory for prompt injection */
  toPromptContext(snapshot: AIMemorySnapshot): string {
    const { anna, world, learnerProfile } = snapshot;
    const base = [
      `day=${anna.daysTogether}`,
      `location=${world.currentLocationId ?? "?"}`,
      `weather=${world.weather}`,
      `time=${world.timeOfDay}`,
      `weekend=${world.isWeekend}`,
      `holiday=${world.isPublicHoliday}`,
      `mastered=${anna.structureMastered.join(",") || "none"}`,
      learnerProfile.coveredTopics.length
        ? `covered=${learnerProfile.coveredTopics.join(",")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const longTerm = memoryContextForPrompt(anna, learnerProfile, snapshot.language);
    return `${base}\n${longTerm}`;
  },
};
