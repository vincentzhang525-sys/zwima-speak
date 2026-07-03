/**
 * Sprint 12 — Content pack registry
 * Add French / Spanish / Italian / Japanese by registering new packs — no engine changes.
 */
import type { Language } from "../types";
import type { ContentPack, LanguageId, PlannedContentPack, PlannedLanguage } from "./types";
import { ACTIVE_LANGUAGES, PLANNED_LANGUAGES } from "./types";
import { CONTENT_PACKS } from "./packs";

const PLANNED_PACKS: Record<PlannedLanguage, PlannedContentPack> = {
  french: { id: "french", status: "planned" },
  spanish: { id: "spanish", status: "planned" },
  italian: { id: "italian", status: "planned" },
  japanese: { id: "japanese", status: "planned" },
};

export function getContentPack(language: Language): ContentPack {
  return CONTENT_PACKS[language];
}

export function getMilestoneFromPack(
  language: Language,
  milestoneId: string
): import("../types").LifeMilestone | null {
  return getContentPack(language).milestones[milestoneId] ?? null;
}

export function isActiveLanguage(id: string): id is Language {
  return (ACTIVE_LANGUAGES as readonly string[]).includes(id);
}

export function isPlannedLanguage(id: string): id is PlannedLanguage {
  return (PLANNED_LANGUAGES as readonly string[]).includes(id);
}

export function getPlannedPack(language: PlannedLanguage): PlannedContentPack {
  return PLANNED_PACKS[language];
}

export function assertContentPack(language: LanguageId): ContentPack {
  if (isActiveLanguage(language)) return getContentPack(language);
  if (isPlannedLanguage(language)) {
    throw new Error(
      `Language "${language}" is planned but has no content pack yet. Add lib/content/locales/${language}/ only.`
    );
  }
  throw new Error(`Unknown language: ${language}`);
}

export { ACTIVE_LANGUAGES, PLANNED_LANGUAGES };
