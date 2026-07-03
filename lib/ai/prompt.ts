/**
 * Sprint 9+10 — Prompt assembly
 * Anna identity comes from lib/personality — task hints from content packs.
 */
import type { ConversationMoment, Language } from "../types";
import { getLifeObjective } from "../living-world";
import { getContentPack } from "../content";
import type { GenerateCoachReplyInput, GenerateSceneInput, NPCReplyKind } from "./provider";

export interface PromptPackage {
  system: string;
  user: string;
  metadata: Record<string, string>;
}

export function buildScenePrompt(input: GenerateSceneInput): PromptPackage {
  const life = getLifeObjective(input.milestoneId);
  const pack = getContentPack(input.language);
  const system = pack.prompts.sceneSystem;

  const user =
    input.language === "german"
      ? `Szene: ${input.milestoneId}\nAufgabe: ${life.task.german}\nTag: ${input.memory.world.livingDay}\nOrt: ${input.memory.world.currentLocationId ?? "?"}\nWetter: ${input.memory.world.weather}\nZeit: ${input.memory.world.timeOfDay}\nSeed: ${input.conversationSeed}`
      : `Scene: ${input.milestoneId}\nTask: ${life.task.english}\nDay: ${input.memory.world.livingDay}\nLocation: ${input.memory.world.currentLocationId ?? "?"}\nWeather: ${input.memory.world.weather}\nTime: ${input.memory.world.timeOfDay}\nSeed: ${input.conversationSeed}`;

  return {
    system,
    user,
    metadata: {
      milestoneId: input.milestoneId,
      phase: input.memory.world.currentPhase,
    },
  };
}

export function buildCoachReplyPrompt(input: GenerateCoachReplyInput): PromptPackage {
  const intent = input.moment.variantMeta?.npcIntent ?? "general";
  const system = getContentPack(input.language).prompts.coachSystem;

  const user = `kind=${input.kind}\nintent=${intent}\nneededDemo=${input.neededDemonstration}\nsupportLevel=${input.supportLevel}`;

  return { system, user, metadata: { kind: input.kind, intent } };
}

export function buildNPCReplyPrompt(
  language: Language,
  moment: ConversationMoment,
  kind: NPCReplyKind
): PromptPackage {
  const system = getContentPack(language).prompts.npcSystem;

  const user = `kind=${kind}\nnpcIntent=${moment.variantMeta?.npcIntent ?? "general"}\nbaseLine=${moment.npcLine ?? ""}`;

  return { system, user, metadata: { kind } };
}

export function buildEvaluateLearnerPrompt(
  language: Language,
  momentId: string,
  latencyMs: number
): PromptPackage {
  const system = getContentPack(language).prompts.evaluateSystem;

  return {
    system,
    user: `moment=${momentId}\nlatencyMs=${latencyMs}`,
    metadata: { momentId },
  };
}
