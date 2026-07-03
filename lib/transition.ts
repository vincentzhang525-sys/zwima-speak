/**
 * Language transition — delegates to Adaptive Coach Engine (Sprint 5).
 */
import {
  buildLearnerObservation,
  buildResponseObservation,
  computeSupportLevel,
  getEmotionalReaction,
  getNaturalStructureReuse,
  getNativeSupportRatio,
  getStructureFamily,
  getTargetThinkingPercent,
  getThinkingShiftPercent,
  isStructureMastered,
  resolveCoachLine,
  resolveLine,
  shouldDemonstrateAfterTry,
  shouldDiscoverPatterns,
  supportLevelToNativeRatio,
} from "./adaptive-coach-engine";
import type { AnnaMemory, Language, TransitionProfile } from "./types";

export { getPatternKey, EMPTY_TRANSITION, recordDemonstratedUnderstanding } from "./transition-core";

export {
  buildLearnerObservation,
  buildResponseObservation,
  computeSupportLevel,
  getEmotionalReaction,
  getNaturalStructureReuse,
  getNativeSupportRatio,
  getStructureFamily,
  getTargetThinkingPercent,
  getThinkingShiftPercent,
  isStructureMastered,
  resolveCoachLine,
  resolveLine,
  shouldDemonstrateAfterTry,
  shouldDiscoverPatterns,
  supportLevelToNativeRatio,
};

export function getTransitionTagline(
  language: Language,
  memory: AnnaMemory,
  transition: TransitionProfile
): string {
  const pct = getTargetThinkingPercent(memory, transition);
  if (language === "german") {
    if (pct < 12) return "Anna 陪你说，帮你慢慢进入德语";
    if (pct < 45) return "你开始用德国人的方式想事情了";
    return "越来越像在德国生活的人";
  }
  if (pct < 12) return "Anna bridges you in — English follows naturally";
  if (pct < 45) return "You're starting to think like a local";
  return "Living abroad, not studying abroad";
}

/** Legacy signature — prefers memory-aware overload when available */
export function getTargetThinkingPercentLegacy(profile: TransitionProfile): number {
  const strengths = Object.values(profile.patternStrength);
  const patternAvg = strengths.length
    ? strengths.reduce((a, b) => a + b, 0) / strengths.length
    : 0;
  const globalShift = Math.min(1, profile.demonstratedMoments * 0.05);
  return Math.round(Math.min(100, (patternAvg * 0.65 + globalShift * 0.35) * 100));
}
