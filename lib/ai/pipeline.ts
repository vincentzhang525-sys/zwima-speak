/**
 * AI Pipeline — enforced layer order
 *
 * User
 *   ↓
 * Conversation Brain  (lib/ai/brain.ts)
 *   ↓
 * Memory Engine       (lib/ai/memory-engine.ts)
 *   ↓
 * Prompt Builder      (lib/ai/prompt-builder.ts)
 *   ↓
 * AI Provider         (lib/ai/providers/*)
 *   ↓
 * GPT / Claude / Gemini / Local rules
 */
import type { PromptPackage } from "./prompt-builder";

/** Every provider call carries a built prompt */
export interface PipelinedRequest<TInput> {
  input: TInput;
  prompt: PromptPackage;
}

export function pipelined<TInput>(
  input: TInput,
  prompt: PromptPackage
): PipelinedRequest<TInput> {
  return { input, prompt };
}

export const PIPELINE_LAYERS = [
  "conversation_brain",
  "memory_engine",
  "prompt_builder",
  "ai_provider",
  "model",
] as const;

export type PipelineLayer = (typeof PIPELINE_LAYERS)[number];
