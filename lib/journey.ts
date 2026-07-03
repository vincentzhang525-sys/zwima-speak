/**
 * Sprint 12 — Journey roadmap (content-only; engine unchanged)
 */
import type { Language, MilestoneRoadmapItem } from "./types";
import { getContentPack } from "./content";

export function getJourneyRoadmap(language: Language): MilestoneRoadmapItem[] {
  return [...getContentPack(language).roadmap];
}

export function getJourneyLabel(language: Language): string {
  return getContentPack(language).journeyLabel;
}

export function getRoadmapItem(
  language: Language,
  milestoneId: string
): MilestoneRoadmapItem | undefined {
  return getJourneyRoadmap(language).find((m) => m.id === milestoneId);
}

export function getNextMilestoneId(
  language: Language,
  currentId: string
): string | null {
  const roadmap = getJourneyRoadmap(language);
  const index = roadmap.findIndex((m) => m.id === currentId);
  if (index < 0 || index >= roadmap.length - 1) return null;
  return roadmap[index + 1].id;
}

/** @deprecated use getContentPack(language).journeyLabel */
export const JOURNEY_LABELS: Record<Language, string> = {
  german: "Germany Life Journey",
  english: "English Life Journey",
};
