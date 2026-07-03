import type { TransitionProfile } from "./types";

/** Stable key for a sentence pattern */
export function getPatternKey(milestoneId: string, momentId: string): string {
  return `${milestoneId}:${momentId}`;
}

export const EMPTY_TRANSITION: TransitionProfile = {
  demonstratedMoments: 0,
  patternStrength: {},
};

export function recordDemonstratedUnderstanding(
  profile: TransitionProfile,
  patternKey: string
): TransitionProfile {
  const prev = profile.patternStrength[patternKey] ?? 0;
  return {
    demonstratedMoments: profile.demonstratedMoments + 1,
    patternStrength: {
      ...profile.patternStrength,
      [patternKey]: Math.min(1, prev + 0.38),
    },
  };
}
