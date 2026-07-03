/**
 * Sprint 9 — AI Brain facade
 * Single entry point for the app. Never import providers directly outside /lib/ai.
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
import { ConversationBrain } from "./brain";
import { MemoryEngine } from "./memory-engine";
import { PromptBuilder } from "./prompt-builder";
import { pipelined } from "./pipeline";
import type {
  AIProvider,
  AIProviderConfig,
  CoachReplyKind,
  EvaluateLearnerInput,
  EvaluateLearnerOutput,
  GenerateCoachReplyInput,
  GenerateCoachReplyOutput,
  GenerateNPCReplyInput,
  GenerateNPCReplyOutput,
  GenerateSceneInput,
  GenerateSceneOutput,
  NPCReplyKind,
  UpdateMemoryInput,
  UpdateMemoryOutput,
} from "./provider";
import { createProvider } from "./providers/registry";

let activeProvider: AIProvider = createProvider({ providerId: "local" });
let brain = new ConversationBrain(activeProvider);

function syncBrain(): void {
  brain = new ConversationBrain(activeProvider);
}

export function getAIProvider(): AIProvider {
  return activeProvider;
}

/** Swap provider at runtime (tests or future settings) */
export function configureAIProvider(config: AIProviderConfig): AIProvider {
  activeProvider = createProvider(config);
  syncBrain();
  return activeProvider;
}

export function setAIProvider(provider: AIProvider): void {
  activeProvider = provider;
  syncBrain();
}

export function getConversationBrain(): ConversationBrain {
  return brain;
}

export function generateScene(input: GenerateSceneInput): GenerateSceneOutput {
  const prompt = PromptBuilder.scene(input);
  return activeProvider.generateScene(pipelined(input, prompt));
}

export function generateCoachReply(
  input: GenerateCoachReplyInput
): GenerateCoachReplyOutput {
  const prompt = PromptBuilder.coachReply(input);
  return activeProvider.generateCoachReply(pipelined(input, prompt));
}

export function generateNPCReply(
  input: GenerateNPCReplyInput
): GenerateNPCReplyOutput {
  const prompt = PromptBuilder.npcReply(
    input.language,
    input.moment,
    input.kind,
    input.memory
  );
  return activeProvider.generateNPCReply(pipelined(input, prompt));
}

export function evaluateLearner(
  input: EvaluateLearnerInput
): EvaluateLearnerOutput {
  const prompt = PromptBuilder.evaluateLearner(
    input.language,
    input.momentId,
    input.responseLatencyMs,
    input.memory
  );
  return activeProvider.evaluateLearner(pipelined(input, prompt));
}

export function updateMemory(input: UpdateMemoryInput): UpdateMemoryOutput {
  const snapshot = MemoryEngine.buildSnapshot({
    language: input.language ?? "german",
    anna: input.memory,
    world: input.world ?? EMPTY_WORLD_FOR_MEMORY,
    transition: input.transition ?? { demonstratedMoments: 0, patternStrength: {} },
    learnerProfile: input.learnerProfile,
  });
  const prompt = PromptBuilder.memoryUpdate(input, snapshot);
  return activeProvider.updateMemory(pipelined(input, prompt));
}

const EMPTY_WORLD_FOR_MEMORY: LivingWorldState = {
  livingDay: 1,
  currentPhase: "morning",
  completedPhasesToday: [],
  completedTaskIds: [],
  isDayComplete: false,
  characterThreads: {},
  currentLocationId: null,
  visitedLocationIds: [],
  timeOfDay: "morning",
  weather: "sunny",
  isWeekend: false,
  isPublicHoliday: false,
  holidayName: null,
  previousLocationId: null,
};

// --- Convenience helpers used by coach-session / milestones ---

export function materializeSceneViaAI(
  language: Language,
  milestoneId: string,
  template: LifeMilestone,
  conversationSeed: string,
  anna: AnnaMemory,
  world: LivingWorldState,
  transition: TransitionProfile,
  learnerProfile?: import("../types").LearnerProfile
): LifeMilestone {
  return brain
    .generateScene(
      language,
      milestoneId,
      template,
      conversationSeed,
      anna,
      world,
      transition,
      learnerProfile ?? anna.learnerProfile
    )
    .milestone;
}

export function coachReplyViaAI(
  language: Language,
  milestoneId: string,
  moment: ConversationMoment,
  momentIndex: number,
  learner: LearnerObservation,
  options: {
    kind?: CoachReplyKind;
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
    skipExplanation?: boolean;
  },
  anna: AnnaMemory,
  world: LivingWorldState,
  transition: TransitionProfile
): GenerateCoachReplyOutput {
  return brain.generateCoachReply({
    language,
    milestoneId,
    moment,
    momentIndex,
    learner,
    kind: options.kind ?? "feedback",
    responseLatencyMs: options.responseLatencyMs,
    neededDemonstration: options.neededDemonstration,
    targetPhrase: options.targetPhrase,
    supportLevel: learner.supportLevel,
    skipExplanation: options.skipExplanation,
    anna,
    world,
    transition,
  });
}

export function npcReplyViaAI(
  language: Language,
  moment: ConversationMoment,
  kind: NPCReplyKind,
  anna: AnnaMemory,
  world: LivingWorldState,
  transition: TransitionProfile
): string {
  return brain.generateNPCReply(language, moment, kind, anna, world, transition);
}

export function evaluateLearnerViaAI(
  language: Language,
  milestoneId: string,
  moment: ConversationMoment,
  patternKey: string,
  momentId: string,
  keyPhrase: string,
  responseLatencyMs: number,
  patternStrength: number,
  structureFamily: string,
  hasNpcLine: boolean,
  anna: AnnaMemory,
  world: LivingWorldState,
  transition: TransitionProfile
): EvaluateLearnerOutput {
  const memory = MemoryEngine.buildSnapshot({
    language,
    anna,
    world,
    transition,
    learnerProfile: anna.learnerProfile,
  });
  return brain.evaluateLearner({
    language,
    milestoneId,
    moment,
    patternKey,
    momentId,
    keyPhrase,
    responseLatencyMs,
    patternStrength,
    structureFamily,
    hasNpcLine,
    memory,
  });
}

export type { AIMemorySnapshot } from "./memory";
export type { AIProvider, AIProviderConfig, AIProviderId } from "./provider";
