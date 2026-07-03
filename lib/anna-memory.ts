import type { AnnaMemory, ConfidenceBand, Language } from "./types";
import { EMPTY_LEARNER_PROFILE, EMPTY_LONG_TERM_MEMORY } from "./types";
import {
  estimateConfidenceBand,
  getStructureFamily,
  inferLearningPace,
  STRUCTURE_MASTERY_THRESHOLD,
} from "./adaptive-coach-engine";
import {
  recordConfidenceSnapshot,
  updateSpeakingSpeed,
} from "./long-term-memory";
import { recordMilestoneMemory } from "./memory/record";

export const EMPTY_ANNA_MEMORY: AnnaMemory = {
  daysTogether: 1,
  lastMilestoneId: null,
  lastMomentId: null,
  completedExperiences: [],
  struggledPatterns: [],
  confidentPatterns: [],
  patternAttempts: {},
  confidenceScore: 50,
  lastConfidenceBand: "normal",
  emotionalNotes: [],
  structureSuccesses: {},
  structureMastered: [],
  mistakeCounts: {},
  repeatedMistakes: 0,
  recentLatenciesMs: [],
  translationDependence: 0.88,
  learningPace: "normal",
  lastNeededDemoByPattern: {},
  npcMemories: {},
  explainedNpcIntents: [],
  learnerProfile: { ...EMPTY_LEARNER_PROFILE },
  confidenceTrend: [],
  averageSpeakingSpeedMs: 0,
  longTerm: { ...EMPTY_LONG_TERM_MEMORY },
};

export { STRUCTURE_MASTERY_THRESHOLD };

export function getAnnaMemory(
  memoryByLanguage: Record<Language, AnnaMemory>,
  language: Language
): AnnaMemory {
  return memoryByLanguage[language] ?? { ...EMPTY_ANNA_MEMORY };
}

export function recordSessionStart(
  memory: AnnaMemory,
  milestoneId: string
): AnnaMemory {
  const isNewDay =
    memory.lastMilestoneId !== null && memory.lastMilestoneId !== milestoneId;
  return {
    ...memory,
    daysTogether: isNewDay ? memory.daysTogether + 1 : memory.daysTogether,
    lastMilestoneId: milestoneId,
  };
}

export interface MomentRecordInput {
  patternKey: string;
  momentId: string;
  keyPhrase: string;
  neededDemonstration: boolean;
  responseLatencyMs: number;
}

export function recordMomentWithAnna(
  memory: AnnaMemory,
  input: MomentRecordInput
): AnnaMemory {
  const { patternKey, momentId, keyPhrase, neededDemonstration, responseLatencyMs } =
    input;
  const structureFamily = getStructureFamily(momentId, keyPhrase);
  const attempts = (memory.patternAttempts[patternKey] ?? 0) + 1;
  const mistakes = neededDemonstration
    ? (memory.mistakeCounts[patternKey] ?? 0) + 1
    : memory.mistakeCounts[patternKey] ?? 0;

  const struggled = neededDemonstration
    ? [...new Set([...memory.struggledPatterns, patternKey])]
    : memory.struggledPatterns;

  const confident =
    !neededDemonstration && attempts >= 2
      ? [...new Set([...memory.confidentPatterns, patternKey])]
      : memory.confidentPatterns;

  const structureSuccesses = { ...memory.structureSuccesses };
  if (!neededDemonstration) {
    const prev = structureSuccesses[structureFamily] ?? 0;
    structureSuccesses[structureFamily] = prev + 1;
  }

  const structureMastered = [...memory.structureMastered];
  if (
    (structureSuccesses[structureFamily] ?? 0) >= STRUCTURE_MASTERY_THRESHOLD &&
    !structureMastered.includes(structureFamily)
  ) {
    structureMastered.push(structureFamily);
  }

  const confidenceDelta = neededDemonstration ? -4 : 5;
  const confidenceScore = Math.min(
    100,
    Math.max(8, memory.confidenceScore + confidenceDelta)
  );

  const band = estimateConfidenceBand(memory, responseLatencyMs, neededDemonstration);

  const latencies = [...memory.recentLatenciesMs, responseLatencyMs].slice(-8);
  const successes = Object.values(memory.patternAttempts).filter((n) => n > 0).length;
  const totalAttempts = Object.values(memory.patternAttempts).reduce((a, b) => a + b, 0);
  const successRate = totalAttempts > 0 ? successes / totalAttempts : 0.5;

  const dependenceDrop = neededDemonstration ? 0.01 : 0.04;
  const translationDependence = Math.max(
    0.05,
    memory.translationDependence - dependenceDrop
  );

  let next: AnnaMemory = {
    ...memory,
    patternAttempts: { ...memory.patternAttempts, [patternKey]: attempts },
    mistakeCounts: { ...memory.mistakeCounts, [patternKey]: mistakes },
    struggledPatterns: struggled,
    confidentPatterns: confident,
    structureSuccesses,
    structureMastered,
    confidenceScore,
    lastConfidenceBand: band,
    repeatedMistakes: neededDemonstration
      ? memory.repeatedMistakes + 1
      : Math.max(0, memory.repeatedMistakes - 1),
    recentLatenciesMs: latencies,
    translationDependence,
    learningPace: inferLearningPace(latencies, successRate),
    lastMomentId: momentId,
    lastNeededDemoByPattern: {
      ...memory.lastNeededDemoByPattern,
      [patternKey]: neededDemonstration,
    },
  };

  next = recordConfidenceSnapshot(next, band);
  next = updateSpeakingSpeed(next, responseLatencyMs);
  return next;
}

export function recordExperienceComplete(
  memory: AnnaMemory,
  milestoneId: string,
  note: string,
  language: Language = "german"
): AnnaMemory {
  const completed = memory.completedExperiences.includes(milestoneId)
    ? memory.completedExperiences
    : [...memory.completedExperiences, milestoneId];

  const longTerm = recordMilestoneMemory(memory, milestoneId, language);

  return {
    ...memory,
    completedExperiences: completed,
    emotionalNotes: [...memory.emotionalNotes.slice(-4), note],
    confidenceScore: Math.min(100, memory.confidenceScore + 6),
    translationDependence: Math.max(0.05, memory.translationDependence - 0.06),
    longTerm,
  };
}

export {
  shouldDemonstrateAfterTry,
  shouldDiscoverPatterns,
  isStructureMastered,
} from "./adaptive-coach-engine";

export function hasPriorExperience(
  memory: AnnaMemory,
  milestoneId: string
): boolean {
  return memory.completedExperiences.includes(milestoneId);
}

/** @deprecated use estimateConfidenceBand from engine */
export function getConfidenceBand(memory: AnnaMemory): ConfidenceBand {
  return memory.lastConfidenceBand;
}
