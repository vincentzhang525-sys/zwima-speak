/**
 * Prompt Builder — layer 3 of the AI pipeline
 * Assembles LLM-ready prompts from memory + Anna personality + conversation context.
 */
import type { ConversationMoment, Language } from "../types";
import { overlayAnnaPersonality } from "../personality";
import type { AIMemorySnapshot } from "./memory-engine";
import { MemoryEngine } from "./memory-engine";
import type {
  GenerateCoachReplyInput,
  GenerateSceneInput,
  NPCReplyKind,
  UpdateMemoryInput,
} from "./provider";
import {
  buildCoachReplyPrompt,
  buildEvaluateLearnerPrompt,
  buildNPCReplyPrompt,
  buildScenePrompt,
  type PromptPackage,
} from "./prompt";

export type { PromptPackage };

function attachMemory(prompt: PromptPackage, snapshot: AIMemorySnapshot): PromptPackage {
  const memoryBlock = MemoryEngine.toPromptContext(snapshot);
  return {
    ...prompt,
    user: `${prompt.user}\n\n[Memory]\n${memoryBlock}`,
    metadata: { ...prompt.metadata, hasMemory: "true" },
  };
}

function asAnna(
  prompt: PromptPackage,
  language: Language,
  role: "coach" | "scene" | "evaluate"
): PromptPackage {
  const overlay = overlayAnnaPersonality(prompt.system, language, role);
  return {
    ...prompt,
    system: overlay.system,
    metadata: { ...prompt.metadata, ...overlay.metadata },
  };
}

export const PromptBuilder = {
  scene(input: GenerateSceneInput): PromptPackage {
    const base = buildScenePrompt(input);
    return attachMemory(asAnna(base, input.language, "scene"), input.memory);
  },

  coachReply(input: GenerateCoachReplyInput): PromptPackage {
    const base = buildCoachReplyPrompt(input);
    return attachMemory(asAnna(base, input.language, "coach"), input.memory);
  },

  npcReply(
    language: Language,
    moment: ConversationMoment,
    kind: NPCReplyKind,
    memory: AIMemorySnapshot
  ): PromptPackage {
    // NPCs are not Anna — no personality overlay
    return attachMemory(buildNPCReplyPrompt(language, moment, kind), memory);
  },

  evaluateLearner(
    language: Language,
    momentId: string,
    latencyMs: number,
    memory: AIMemorySnapshot
  ): PromptPackage {
    const base = buildEvaluateLearnerPrompt(language, momentId, latencyMs);
    return attachMemory(asAnna(base, language, "evaluate"), memory);
  },

  memoryUpdate(input: UpdateMemoryInput, snapshot: AIMemorySnapshot): PromptPackage {
    const system =
      input.language === "german"
        ? "Extrahiere Lernerfakten aus dem Moment. Keine Punktzahl. Keine Anna-Stimme — nur strukturierte Fakten."
        : "Extract learner facts from the moment. No scoring. No Anna voice — structured facts only.";

    const user = [
      `milestone=${input.milestoneId ?? "?"}`,
      `moment=${input.moment.momentId}`,
      `phrase=${input.phrase ?? input.moment.keyPhrase}`,
      `neededDemo=${input.moment.neededDemonstration}`,
      `latencyMs=${input.moment.responseLatencyMs}`,
    ].join("\n");

    return attachMemory(
      { system, user, metadata: { op: "memory_update", persona: "system" } },
      snapshot
    );
  },
};
