/**
 * Sprint 9 — AI Brain public API
 */
export {
  configureAIProvider,
  getConversationBrain,
  coachReplyViaAI,
  evaluateLearner,
  evaluateLearnerViaAI,
  generateCoachReply,
  generateNPCReply,
  generateScene,
  getAIProvider,
  materializeSceneViaAI,
  npcReplyViaAI,
  setAIProvider,
  updateMemory,
} from "./conversation";

export { ConversationBrain } from "./brain";
export { MemoryEngine } from "./memory-engine";
export { PromptBuilder } from "./prompt-builder";
export { PIPELINE_LAYERS, pipelined, type PipelinedRequest } from "./pipeline";

export type {
  AIProvider,
  AIProviderConfig,
  AIProviderId,
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

export { buildAIMemorySnapshot, type AIMemorySnapshot } from "./memory";

export {
  buildCoachReplyPrompt,
  buildEvaluateLearnerPrompt,
  buildNPCReplyPrompt,
  buildScenePrompt,
} from "./prompt";

export {
  deriveStruggleLevel,
  evaluateLearnerLocally,
  scoreConfidence,
  scoreResponseLatency,
} from "./scoring";

export { registeredProviderIds } from "./providers/registry";

export {
  applyLifeFacts,
  extractFactsFromMoment,
  getLifeRecallLine,
  hasCoveredTopic,
  shouldSkipHeavyCoaching,
} from "../long-term-memory";

export { loadProgress, saveProgress, clearPersistedProgress } from "../persistence";

export {
  ANNA,
  ANNA_ID,
  assertAnnaVoice,
  buildAnnaSystemPrompt,
  overlayAnnaPersonality,
  type AnnaPersonality,
  type AnnaVoiceRole,
} from "../personality";

export {
  applyMemoryInfluence,
  buildCoachRecall,
  memoryContextForPrompt,
  pickMemoryRecallLine,
  prependRecallToCoachMessage,
  type LongTermMemory,
  type MemoryInfluence,
} from "../memory";
