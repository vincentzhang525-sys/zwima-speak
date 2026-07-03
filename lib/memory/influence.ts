/**
 * Sprint 11 — How long-term memory shapes coaching behavior
 */
import type { AnnaMemory, Language, SupportLevel, TransitionProfile } from "../types";
import { computeSupportLevel } from "../adaptive-coach-engine";

export interface MemoryInfluence {
  supportAdjust: number;
  nativeRatioAdjust: number;
  difficulty: "gentle" | "normal" | "stretch";
  encouragementTone: "warm" | "quiet" | "celebratory";
  preferredTopics: string[];
  extraNativeSupport: boolean;
  reduceExamples: boolean;
}

export function applyMemoryInfluence(
  memory: AnnaMemory,
  transition: TransitionProfile
): MemoryInfluence {
  const ltm = memory.longTerm;
  const trait = ltm.learnerPersonality[0]?.trait;

  let supportAdjust = 0;
  let nativeRatioAdjust = 0;
  let difficulty: MemoryInfluence["difficulty"] = "normal";
  let encouragementTone: MemoryInfluence["encouragementTone"] = "warm";
  let extraNativeSupport = false;
  let reduceExamples = false;

  if (trait === "hesitant" || trait === "quiet") {
    supportAdjust -= 1;
    nativeRatioAdjust += 0.12;
    extraNativeSupport = true;
    difficulty = "gentle";
    encouragementTone = "warm";
  }

  if (trait === "bold") {
    supportAdjust += 1;
    nativeRatioAdjust -= 0.1;
    difficulty = "stretch";
    encouragementTone = "quiet";
    reduceExamples = true;
  }

  if (trait === "perfectionist") {
    supportAdjust -= 1;
    difficulty = "gentle";
    encouragementTone = "warm";
  }

  const activeMistakes = ltm.phraseMistakes.filter((m) => !m.resolved && m.count >= 2);
  if (activeMistakes.length > 0) {
    supportAdjust -= 1;
    nativeRatioAdjust += 0.06;
  }

  if (ltm.successfulHighlights.length >= 3) {
    supportAdjust += 1;
    nativeRatioAdjust -= 0.08;
    encouragementTone = "celebratory";
  }

  if (memory.lastConfidenceBand === "very_confident") {
    supportAdjust += 1;
    nativeRatioAdjust -= 0.1;
    reduceExamples = true;
  }

  if (memory.lastConfidenceBand === "very_nervous") {
    supportAdjust -= 1;
    nativeRatioAdjust += 0.15;
    extraNativeSupport = true;
  }

  const recentEmotion = ltm.emotionalHistory[ltm.emotionalHistory.length - 1];
  if (recentEmotion?.tone === "frustrated") {
    difficulty = "gentle";
    encouragementTone = "warm";
    extraNativeSupport = true;
  }
  if (recentEmotion?.tone === "breakthrough") {
    encouragementTone = "celebratory";
    difficulty = "stretch";
  }

  return {
    supportAdjust: clamp(supportAdjust, -2, 2),
    nativeRatioAdjust: clamp(nativeRatioAdjust, -0.2, 0.25),
    difficulty,
    encouragementTone,
    preferredTopics: ltm.favoriteTopics,
    extraNativeSupport,
    reduceExamples,
  };
}

export function getMemoryAdjustedSupportLevel(
  memory: AnnaMemory,
  transition: TransitionProfile
): SupportLevel {
  const base = computeSupportLevel(memory, transition);
  const influence = applyMemoryInfluence(memory, transition);
  const adjusted = base + influence.supportAdjust;
  return clamp(adjusted, 0, 5) as SupportLevel;
}

export function getMemoryNativeRatioAdjust(
  memory: AnnaMemory,
  transition: TransitionProfile
): number {
  return applyMemoryInfluence(memory, transition).nativeRatioAdjust;
}

export function getMemoryTopicSuggestions(
  memory: AnnaMemory,
  language: Language,
  milestoneId: string
): string[] {
  const topics = memory.longTerm.favoriteTopics;
  if (topics.length === 0) return [];

  const related = topics.filter((t) => t !== milestoneId);
  if (related.length === 0) return topics.slice(0, 2);

  return related.slice(0, 3);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
