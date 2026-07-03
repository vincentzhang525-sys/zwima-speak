import { getContentPack } from "../content";
import type { AnnaMemory, Language, LifeMilestone, LivingWorldState } from "../types";
import { isDynamicMilestone } from "../conversation-objectives";
import { materializeSceneViaAI } from "../ai/conversation";
import { applyLifeMemoryToMilestone } from "../long-term-memory";
import { applyWorldContextToMilestone } from "../world-context";
import { EMPTY_ANNA_MEMORY } from "../anna-memory";
import { EMPTY_LIVING_WORLD } from "../world-state";
import { EMPTY_TRANSITION } from "../transition-core";

export function getMilestone(
  language: Language,
  milestoneId: string,
  conversationSeed?: string | null,
  annaMemory?: AnnaMemory | null,
  livingWorld?: LivingWorldState | null
): LifeMilestone | null {
  const pack = getContentPack(language);
  const template = pack.milestones[milestoneId] ?? null;
  if (!template) return null;

  const memory = annaMemory ?? EMPTY_ANNA_MEMORY;
  const world = livingWorld ?? EMPTY_LIVING_WORLD;

  const finalize = (m: LifeMilestone) =>
    applyWorldContextToMilestone(
      applyLifeMemoryToMilestone(m, memory, language),
      world,
      language
    );

  if (conversationSeed && isDynamicMilestone(milestoneId)) {
    const materialized = materializeSceneViaAI(
      language,
      milestoneId,
      template,
      conversationSeed,
      memory,
      world,
      EMPTY_TRANSITION,
      memory.learnerProfile
    );
    return finalize(materialized);
  }

  return finalize(template);
}

export function getPlayableMilestoneIds(): string[] {
  return [
    "airport",
    "arrive",
    "coffee",
    "supermarket",
    "bus",
    "train",
    "bank",
    "doctor",
    "buergeramt",
    "work",
    "apartment",
  ];
}

export function isMilestonePlayable(milestoneId: string): boolean {
  return getPlayableMilestoneIds().includes(milestoneId);
}

export function getFirstPlayableMilestoneId(): string {
  return "airport";
}

export function getNextPlayableMilestoneId(
  language: Language,
  afterId: string
): string | null {
  const roadmap = getContentPack(language).roadmap;
  const startIndex = roadmap.findIndex((m) => m.id === afterId) + 1;
  for (let i = startIndex; i < roadmap.length; i++) {
    if (isMilestonePlayable(roadmap[i].id)) return roadmap[i].id;
  }
  return null;
}
