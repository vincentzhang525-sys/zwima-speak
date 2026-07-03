/**
 * Sprint 9 — AI Provider contract
 * The rest of the app never knows which model is used.
 */
import type { LearnerObservation } from "../adaptive-coach-engine";
import type { InterventionDecision, StruggleLevel } from "../anna-intervention";
import type { MomentRecordInput } from "../anna-memory";
import type {
  AnnaMemory,
  ConversationMoment,
  Language,
  LearnerProfile,
  LifeMilestone,
  LivingWorldState,
  SupportLevel,
  TransitionProfile,
} from "../types";
import type { AIMemorySnapshot } from "./memory";
import type { PipelinedRequest } from "./pipeline";

/** Supported provider backends — only AIProvider talks to these */
export type AIProviderId =
  | "local"
  | "openai"
  | "claude"
  | "gemini"
  | "deepseek"
  | "qwen";

export type CoachReplyKind = "feedback" | "nudge" | "rescue";

export type NPCReplyKind = "demo" | "clarification" | "misunderstanding";

export interface AIProviderConfig {
  providerId: AIProviderId;
  /** Reserved for future remote providers */
  model?: string;
  apiKey?: string;
}

export interface GenerateSceneInput {
  language: Language;
  milestoneId: string;
  template: LifeMilestone;
  conversationSeed: string;
  memory: AIMemorySnapshot;
}

export interface GenerateSceneOutput {
  milestone: LifeMilestone;
}

export interface GenerateCoachReplyInput {
  language: Language;
  milestoneId: string;
  moment: ConversationMoment;
  momentIndex: number;
  learner: LearnerObservation;
  kind: CoachReplyKind;
  responseLatencyMs: number;
  neededDemonstration: boolean;
  targetPhrase: string;
  supportLevel: SupportLevel;
  skipExplanation?: boolean;
  memory: AIMemorySnapshot;
}

export interface GenerateCoachReplyOutput {
  message: string;
  patternExamples: string[];
}

export interface GenerateNPCReplyInput {
  language: Language;
  moment: ConversationMoment;
  kind: NPCReplyKind;
  memory: AIMemorySnapshot;
}

export interface GenerateNPCReplyOutput {
  line: string;
}

export interface EvaluateLearnerInput {
  language: Language;
  milestoneId: string;
  moment: ConversationMoment;
  patternKey: string;
  momentId: string;
  keyPhrase: string;
  responseLatencyMs: number;
  patternStrength: number;
  structureFamily: string;
  hasNpcLine: boolean;
  memory: AIMemorySnapshot;
}

export interface EvaluateLearnerOutput {
  needsDemonstration: boolean;
  intervention: InterventionDecision;
  struggle: StruggleLevel;
  supportLevel: SupportLevel;
}

export interface UpdateMemoryInput {
  memory: AnnaMemory;
  moment: MomentRecordInput;
  annaIntervened?: boolean;
  npcIntent?: string | null;
  milestoneId?: string;
  phrase?: string;
  learnerProfile?: LearnerProfile;
  language?: Language;
  world?: LivingWorldState;
  transition?: TransitionProfile;
}

export interface UpdateMemoryOutput {
  memory: AnnaMemory;
  learnerProfile: LearnerProfile;
}

export interface AIProvider {
  readonly id: AIProviderId;
  generateScene(req: PipelinedRequest<GenerateSceneInput>): GenerateSceneOutput;
  generateCoachReply(
    req: PipelinedRequest<GenerateCoachReplyInput>
  ): GenerateCoachReplyOutput;
  generateNPCReply(req: PipelinedRequest<GenerateNPCReplyInput>): GenerateNPCReplyOutput;
  evaluateLearner(req: PipelinedRequest<EvaluateLearnerInput>): EvaluateLearnerOutput;
  updateMemory(req: PipelinedRequest<UpdateMemoryInput>): UpdateMemoryOutput;
}

export type AIProviderFactory = (config: AIProviderConfig) => AIProvider;
