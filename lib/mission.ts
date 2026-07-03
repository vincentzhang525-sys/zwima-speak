import type { JourneyProgress, Language, MilestonePreview } from "./types";
import { packString } from "./content";
import { getCurrentMilestone } from "./coach-session";
import { isMilestonePlayable } from "./milestones";
export const LANGUAGE_OPTIONS = {
  german: { flag: "🇩🇪", label: "German" },
  english: { flag: "🇬🇧", label: "English" },
} as const;

export function getCurrentMilestonePreview(
  language: Language,
  milestoneId: string
): MilestonePreview {
  const milestone = getCurrentMilestone(language, milestoneId);
  return {
    title: milestone.title,
    estimatedMinutes: Math.max(5, milestone.moments.length * 2),
  };
}

export function getEnterMilestoneLabel(
  language: Language,
  hasStarted: boolean
): string {
  return hasStarted
    ? packString(language, "ui", "enterMilestoneContinue")
    : packString(language, "ui", "enterMilestoneStart");
}

export function getJourneyTagline(language: Language): string {
  return packString(language, "ui", "journeyTagline");
}
export function canEnterMilestone(milestoneId: string): boolean {
  return isMilestonePlayable(milestoneId);
}

/** @deprecated use getCurrentMilestonePreview */
export function getTodayScene(
  language: Language,
  milestoneId?: string
): MilestonePreview {
  return getCurrentMilestonePreview(language, milestoneId ?? "arrive");
}

/** @deprecated use getEnterMilestoneLabel */
export function getEnterSceneLabel(language: Language): string {
  return getEnterMilestoneLabel(language, false);
}

export function isMilestoneLocked(
  milestoneId: string,
  progress: JourneyProgress
): boolean {
  if (milestoneId === progress.currentMilestoneId) return false;
  if (progress.completedMilestoneIds.includes(milestoneId)) return false;
  return true;
}
