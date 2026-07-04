/**
 * Adaptive Coach Engine — Sprint 5
 * Anna observes the learner continuously and adapts support automatically.
 */
import type {
  AnnaMemory,
  BilingualLine,
  ConfidenceBand,
  Language,
  LearningPace,
  SupportLevel,
  TransitionProfile,
} from "./types";
import { bil } from "./milestones/bilingual";
import {
  applyMemoryInfluence,
  getMemoryAdjustedSupportLevel,
} from "./memory/influence";

export const STRUCTURE_MASTERY_THRESHOLD = 3;

export type LearnerObservation = {
  memory: AnnaMemory;
  transition: TransitionProfile;
  patternKey: string;
  structureFamily: string;
  supportLevel: SupportLevel;
  nativeSupportRatio: number;
  thinkingShiftPercent: number;
  confidenceBand: ConfidenceBand;
  structureMastered: boolean;
  translationDependence: number;
};

export type ResponseObservation = LearnerObservation & {
  responseLatencyMs: number;
  neededDemonstration: boolean;
  targetPhrase: string;
  fasterThanAverage: boolean;
  improvedFromLastTry: boolean;
  repeatedMistake: boolean;
  previousNeededDemo: boolean;
};

const SUPPORT_NATIVE_RATIO: Record<SupportLevel, number> = {
  0: 0.95,
  1: 0.8,
  2: 0.6,
  3: 0.4,
  4: 0.2,
  5: 0.05,
};

export function getStructureFamily(momentId: string, keyPhrase: string): string {
  const k = keyPhrase.toLowerCase();
  if (
    k.includes("entschuldigung") ||
    k.includes("excuse me") ||
    k.includes("where can i find") ||
    k.includes("wo finde") ||
    k.includes("wo ist")
  )
    return "polite-question";
  if (
    k.includes("einen kaffee") ||
    k.includes("a coffee") ||
    k.includes("tüte") ||
    k.includes("bag")
  )
    return "order-bitte";
  if (k.includes("mit milch") || k.includes("with milk") || k.includes("mit zucker"))
    return "customize-ja";
  if (k.includes("mit karte") || k.includes("card"))
    return "pay-card";
  if (k.includes("danke") || k.includes("thank") || k.includes("vielen dank"))
    return "thanks-warm";
  if (
    k.includes("hallo") ||
    k.includes("guten") ||
    k.includes("hi there") ||
    k.includes("good morning")
  )
    return "greet";
  if (k.includes("neu hier") || k.includes("moved in") || k.includes("eingezogen"))
    return "new-here";
  return `moment:${momentId}`;
}

export function isStructureMastered(
  memory: AnnaMemory,
  structureFamily: string
): boolean {
  return (
    memory.structureMastered.includes(structureFamily) ||
    (memory.structureSuccesses[structureFamily] ?? 0) >= STRUCTURE_MASTERY_THRESHOLD
  );
}

export function getThinkingShiftPercent(
  memory: AnnaMemory,
  transition: TransitionProfile
): number {
  const confidenceNorm = memory.confidenceScore / 100;
  const strengths = Object.values(transition.patternStrength);
  const masteryAvg = strengths.length
    ? strengths.reduce((a, b) => a + b, 0) / strengths.length
    : 0;
  const masteredBoost = Math.min(0.15, memory.structureMastered.length * 0.03);

  const latencies = memory.recentLatenciesMs;
  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 2800;
  const latencyScore = clamp(1 - (avgLatency - 900) / 3200, 0, 1);
  const independence = 1 - memory.translationDependence;

  const raw =
    confidenceNorm * 0.28 +
    masteryAvg * 0.32 +
    latencyScore * 0.2 +
    independence * 0.2 +
    masteredBoost;

  return Math.round(clamp(raw, 0, 1) * 100);
}

export function estimateConfidenceBand(
  memory: AnnaMemory,
  responseLatencyMs: number,
  neededDemonstration: boolean
): ConfidenceBand {
  let score = memory.confidenceScore;
  if (neededDemonstration) score -= 12;
  if (responseLatencyMs < 1300) score += 8;
  if (responseLatencyMs > 3200) score -= 10;
  if (memory.repeatedMistakes > 2) score -= 8;

  if (score < 22) return "very_nervous";
  if (score < 38) return "nervous";
  if (score < 58) return "normal";
  if (score < 78) return "confident";
  return "very_confident";
}

export function computeSupportLevel(
  memory: AnnaMemory,
  transition: TransitionProfile
): SupportLevel {
  const thinking = getThinkingShiftPercent(memory, transition);
  let level: SupportLevel;

  if (thinking < 10) level = 0;
  else if (thinking < 24) level = 1;
  else if (thinking < 42) level = 2;
  else if (thinking < 60) level = 3;
  else if (thinking < 78) level = 4;
  else level = 5;

  if (
    memory.lastConfidenceBand === "very_nervous" ||
    memory.lastConfidenceBand === "nervous"
  ) {
    level = Math.max(0, level - 1) as SupportLevel;
  }

  if (memory.repeatedMistakes >= 3) {
    level = Math.max(0, level - 1) as SupportLevel;
  }

  if (memory.lastConfidenceBand === "very_confident" && level < 5) {
    level = (level + 1) as SupportLevel;
  }

  if (memory.learningPace === "slow") {
    level = Math.max(0, level - 1) as SupportLevel;
  } else if (memory.learningPace === "fast" && level < 5) {
    level = (level + 1) as SupportLevel;
  }

  return level;
}

export function buildLearnerObservation(
  memory: AnnaMemory,
  transition: TransitionProfile,
  patternKey: string,
  momentId: string,
  keyPhrase: string
): LearnerObservation {
  const structureFamily = getStructureFamily(momentId, keyPhrase);
  const supportLevel = getMemoryAdjustedSupportLevel(memory, transition);
  const influence = applyMemoryInfluence(memory, transition);
  const patternConfident = memory.confidentPatterns.includes(patternKey);
  const boostedLevel = patternConfident
    ? (Math.min(5, supportLevel + 1) as SupportLevel)
    : supportLevel;
  const baseRatio = SUPPORT_NATIVE_RATIO[boostedLevel];
  const nativeSupportRatio = clamp(
    baseRatio + influence.nativeRatioAdjust - (patternConfident ? 0.08 : 0),
    0.05,
    0.98
  );

  return {
    memory,
    transition,
    patternKey,
    structureFamily,
    supportLevel: boostedLevel,
    nativeSupportRatio,
    thinkingShiftPercent: getThinkingShiftPercent(memory, transition),
    confidenceBand: memory.lastConfidenceBand,
    structureMastered: isStructureMastered(memory, structureFamily),
    translationDependence: memory.translationDependence,
  };
}

export function supportLevelToNativeRatio(level: SupportLevel): number {
  return SUPPORT_NATIVE_RATIO[level];
}

export function resolveCoachLine(
  line: BilingualLine,
  level: SupportLevel,
  targetPhrase?: string
): string {
  const { native, target } = line;
  const phrase = targetPhrase?.trim();

  switch (level) {
    case 0:
      if (phrase) {
        return `不用紧张。\n${native}\n跟我说：\n${phrase}`;
      }
      return `${native}\n\n${target}`;
    case 1:
      if (phrase) {
        return `${native}\n${phrase}`;
      }
      return `${native}\n\n${target}`;
    case 2:
      return `${target}\n\n${native}`;
    case 3:
      return `${target}\n（${native.split("。")[0]}。）`;
    case 4:
    case 5:
      return target;
    default:
      return target;
  }
}

export function resolveLine(line: BilingualLine, nativeSupport: number): string {
  const level = nativeRatioToLevel(nativeSupport);
  return resolveCoachLine(line, level);
}

function nativeRatioToLevel(ratio: number): SupportLevel {
  if (ratio >= 0.9) return 0;
  if (ratio >= 0.72) return 1;
  if (ratio >= 0.52) return 2;
  if (ratio >= 0.32) return 3;
  if (ratio >= 0.14) return 4;
  return 5;
}

export function getNativeSupportRatio(
  memory: AnnaMemory,
  transition: TransitionProfile,
  patternKey: string,
  momentId: string,
  keyPhrase: string
): number {
  return buildLearnerObservation(memory, transition, patternKey, momentId, keyPhrase)
    .nativeSupportRatio;
}

export function getTargetThinkingPercent(
  memory: AnnaMemory,
  transition: TransitionProfile
): number {
  return getThinkingShiftPercent(memory, transition);
}

export function shouldDemonstrateAfterTry(
  memory: AnnaMemory,
  patternStrength: number,
  patternKey: string,
  structureFamily: string,
  hasNpcLine: boolean
): boolean {
  if (!hasNpcLine) return false;
  if (isStructureMastered(memory, structureFamily)) return false;
  if (memory.confidentPatterns.includes(patternKey)) return false;
  if (patternStrength >= 0.55) return false;
  const attempts = memory.patternAttempts[patternKey] ?? 0;
  if (attempts === 0) return true;
  if (memory.struggledPatterns.includes(patternKey)) return true;
  if ((memory.mistakeCounts[patternKey] ?? 0) >= 2) return true;
  return patternStrength < 0.4;
}

export function shouldDiscoverPatterns(
  memory: AnnaMemory,
  patternStrength: number,
  patternKey: string,
  structureFamily: string
): boolean {
  if (isStructureMastered(memory, structureFamily)) return false;
  const attempts = memory.patternAttempts[patternKey] ?? 0;
  if (attempts >= 2 && patternStrength >= 0.35) return true;
  if (memory.confidentPatterns.includes(patternKey)) return true;
  return false;
}

export function getNaturalStructureReuse(
  language: Language,
  structureFamily: string
): string[] {
  const de: Record<string, string[]> = {
    "polite-question": [
      "Entschuldigung, wo ist die Apotheke?",
      "Entschuldigung, wo finde ich den Reis?",
      "Entschuldigung, wie komme ich zum Bahnhof?",
    ],
    "order-bitte": [
      "Einen Tee, bitte.",
      "Ein Brötchen, bitte.",
      "Ja, eine Tüte, bitte.",
    ],
    "pay-card": ["Mit Karte, bitte.", "Mit Karte, bitte.", "Hier, bitte."],
    "thanks-warm": [
      "Danke schön! Schönen Tag noch!",
      "Danke schön!",
      "Vielen Dank!",
    ],
    greet: ["Guten Tag!", "Guten Morgen!", "Hallo!"],
    "customize-ja": ["Ja, mit Zucker, bitte.", "Ja, mit Hafermilch, bitte."],
    "new-here": ["Ja, ich bin gerade eingezogen.", "Ich bin neu hier."],
  };
  const en: Record<string, string[]> = {
    "polite-question": [
      "Excuse me, where's the pharmacy?",
      "Excuse me, where can I find rice?",
      "Excuse me, how do I get to the station?",
    ],
    "order-bitte": ["A tea, please.", "A croissant, please.", "Yes, a bag, please."],
    "pay-card": ["Card, please.", "Card, please.", "Here you go."],
    "thanks-warm": [
      "Thank you! Have a lovely day!",
      "Thanks so much!",
      "Thank you!",
    ],
    greet: ["Good morning!", "Hi there!", "Good afternoon!"],
    "customize-ja": ["Yes, with sugar, please.", "Yes, with oat milk, please."],
    "new-here": ["Yes, I just moved in yesterday.", "I'm new here."],
  };
  return (language === "german" ? de : en)[structureFamily] ?? [];
}

export function getEmotionalReaction(
  language: Language,
  ctx: ResponseObservation
): BilingualLine {
  if (ctx.structureMastered && !ctx.neededDemonstration) {
    return language === "german"
      ? bil("我觉得你已经会了——不用我再解释。", "Das sitzt schon — brauch ich nicht mehr erklären.")
      : bil("我觉得你已经会了。", "I think you already know this.");
  }

  if (ctx.fasterThanAverage && !ctx.neededDemonstration) {
    return language === "german"
      ? bil("这次你回答得快了一些——我听到了。", "Du warst schneller diesmal — hab ich gemerkt.")
      : bil("这次你快了一些。", "I saw you answered faster.");
  }

  if (ctx.improvedFromLastTry && ctx.previousNeededDemo) {
    return language === "german"
      ? bil("比刚才自然多了。", "Klang viel natürlicher als vorhin.")
      : bil("比刚才自然多了。", "That sounded much more natural.");
  }

  if (ctx.supportLevel >= 3 && ctx.confidenceBand === "confident") {
    return language === "german"
      ? bil("德语在慢慢长出来——很自然。", "Deutsch wächst — ganz natürlich.")
      : bil("英语在慢慢长出来——很自然。", "English grows — naturally.");
  }

  if (ctx.repeatedMistake) {
    return language === "german"
      ? bil("说错完全没关系。德国人听得懂。我就在旁边。我们一起。", "Schon okay. Ich bin da. Zusammen.")
      : bil("说错完全没关系。我就在旁边。我们一起。", "It's fine. I'm here. Together.");
  }

  if (!ctx.neededDemonstration && ctx.confidenceBand === "confident") {
    return language === "german"
      ? bil("这次听起来很放松。", "Du klangst entspannt.")
      : bil("这次很放松。", "You sounded relaxed this time.");
  }

  return language === "german"
    ? bil("好——继续。", "Gut — weiter.")
    : bil("好。", "Good.");
}

export function buildResponseObservation(
  learner: LearnerObservation,
  input: {
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
  }
): ResponseObservation {
  const latencies = learner.memory.recentLatenciesMs;
  const avg =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 2800;
  const previousNeededDemo =
    learner.memory.lastNeededDemoByPattern[learner.patternKey] ?? false;

  return {
    ...learner,
    responseLatencyMs: input.responseLatencyMs,
    neededDemonstration: input.neededDemonstration,
    targetPhrase: input.targetPhrase,
    fasterThanAverage: input.responseLatencyMs < avg * 0.85,
    improvedFromLastTry: previousNeededDemo && !input.neededDemonstration,
    repeatedMistake: (learner.memory.mistakeCounts[learner.patternKey] ?? 0) >= 2,
    previousNeededDemo,
    confidenceBand: estimateConfidenceBand(
      learner.memory,
      input.responseLatencyMs,
      input.neededDemonstration
    ),
  };
}

export function inferLearningPace(
  latencies: number[],
  successRate: number
): LearningPace {
  if (latencies.length < 2) return "normal";
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  if (avg < 1600 && successRate > 0.7) return "fast";
  if (avg > 2800 || successRate < 0.4) return "slow";
  return "normal";
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
