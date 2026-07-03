/**
 * Conversation Brain — layer 1 of the AI pipeline
 * Orchestrates user turns through Memory → Prompt → Provider.
 * The rest of the app calls this layer (via lib/ai/conversation.ts).
 */
import type { LearnerObservation } from "../adaptive-coach-engine";
import type {
  AnnaMemory,
  ConversationMoment,
  Language,
  LifeMilestone,
  LivingWorldState,
  TransitionProfile,
} from "../types";
import type { LearnerProfile } from "../types";
import { MemoryEngine, type MemoryEngineContext } from "./memory-engine";
import { PromptBuilder } from "./prompt-builder";
import { pipelined } from "./pipeline";
import type {
  AIProvider,
  CoachReplyKind,
  EvaluateLearnerInput,
  EvaluateLearnerOutput,
  GenerateCoachReplyInput,
  GenerateCoachReplyOutput,
  GenerateNPCReplyInput,
  GenerateSceneInput,
  GenerateSceneOutput,
  NPCReplyKind,
  UpdateMemoryInput,
  UpdateMemoryOutput,
} from "./provider";

export class ConversationBrain {
  constructor(private readonly provider: AIProvider) {}

  private snapshot(ctx: MemoryEngineContext) {
    return MemoryEngine.buildSnapshot(ctx);
  }

  generateScene(
    language: Language,
    milestoneId: string,
    template: LifeMilestone,
    conversationSeed: string,
    anna: AnnaMemory,
    world: LivingWorldState,
    transition: TransitionProfile,
    learnerProfile?: LearnerProfile
  ): GenerateSceneOutput {
    const memory = this.snapshot({
      language,
      anna,
      world,
      transition,
      learnerProfile,
    });

    const input: GenerateSceneInput = {
      language,
      milestoneId,
      template,
      conversationSeed,
      memory,
    };

    const prompt = PromptBuilder.scene(input);
    return this.provider.generateScene(pipelined(input, prompt));
  }

  generateCoachReply(params: {
    language: Language;
    milestoneId: string;
    moment: ConversationMoment;
    momentIndex: number;
    learner: LearnerObservation;
    kind: CoachReplyKind;
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
    supportLevel: import("../types").SupportLevel;
    skipExplanation?: boolean;
    anna: AnnaMemory;
    world: LivingWorldState;
    transition: TransitionProfile;
  }): GenerateCoachReplyOutput {
    const memory = this.snapshot({
      language: params.language,
      anna: params.anna,
      world: params.world,
      transition: params.transition,
    });

    const input: GenerateCoachReplyInput = {
      language: params.language,
      milestoneId: params.milestoneId,
      moment: params.moment,
      momentIndex: params.momentIndex,
      learner: params.learner,
      kind: params.kind,
      responseLatencyMs: params.responseLatencyMs,
      neededDemonstration: params.neededDemonstration,
      targetPhrase: params.targetPhrase,
      supportLevel: params.supportLevel,
      skipExplanation: params.skipExplanation,
      memory,
    };

    const prompt = PromptBuilder.coachReply(input);
    return this.provider.generateCoachReply(pipelined(input, prompt));
  }

  generateNPCReply(
    language: Language,
    moment: ConversationMoment,
    kind: NPCReplyKind,
    anna: AnnaMemory,
    world: LivingWorldState,
    transition: TransitionProfile
  ): string {
    const memory = this.snapshot({ language, anna, world, transition });
    const input: GenerateNPCReplyInput = { language, moment, kind, memory };
    const prompt = PromptBuilder.npcReply(language, moment, kind, memory);
    return this.provider.generateNPCReply(pipelined(input, prompt)).line;
  }

  evaluateLearner(input: EvaluateLearnerInput): EvaluateLearnerOutput {
    const prompt = PromptBuilder.evaluateLearner(
      input.language,
      input.momentId,
      input.responseLatencyMs,
      input.memory
    );
    return this.provider.evaluateLearner(pipelined(input, prompt));
  }

  updateMemory(input: UpdateMemoryInput): UpdateMemoryOutput {
    const snapshot = MemoryEngine.buildSnapshot({
      language: input.language ?? "german",
      anna: input.memory,
      world: input.world ?? EMPTY_WORLD_PLACEHOLDER,
      transition: input.transition ?? { demonstratedMoments: 0, patternStrength: {} },
      learnerProfile: input.learnerProfile,
    });

    const prompt = PromptBuilder.memoryUpdate(input, snapshot);
    return this.provider.updateMemory(pipelined(input, prompt));
  }
}

/** Minimal world placeholder when updateMemory runs without full world context */
const EMPTY_WORLD_PLACEHOLDER = {
  livingDay: 1,
  currentPhase: "morning" as const,
  completedPhasesToday: [],
  completedTaskIds: [],
  isDayComplete: false,
  characterThreads: {},
  currentLocationId: null,
  visitedLocationIds: [],
  timeOfDay: "morning" as const,
  weather: "sunny" as const,
  isWeekend: false,
  isPublicHoliday: false,
  holidayName: null,
  previousLocationId: null,
};
