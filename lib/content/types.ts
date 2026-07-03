/**
 * Sprint 12 — Content pack types
 * Engine logic is language-agnostic. Only content packs differ.
 */
import type {
  Language,
  LifeMilestone,
  MilestoneRoadmapItem,
} from "../types";

/** Future tracks — content-only addition, no engine changes */
export type PlannedLanguage = "french" | "spanish" | "italian" | "japanese";

export type LanguageId = Language | PlannedLanguage;

export const ACTIVE_LANGUAGES: readonly Language[] = ["german", "english"] as const;

export const PLANNED_LANGUAGES: readonly PlannedLanguage[] = [
  "french",
  "spanish",
  "italian",
  "japanese",
] as const;

/** Per-language string — extend with fr/es/it/ja keys when packs ship */
export type LocalizedText = Record<Language, string>;

/** Chinese scaffolding + per-track target language */
export interface BilingualContent {
  native: string;
  target: LocalizedText;
}

export interface MilestoneBeatDef {
  id: string;
  npcLine?: LocalizedText;
  phrase: LocalizedText;
  keyPhrase: LocalizedText;
  bridge: BilingualContent;
  speak: BilingualContent;
  continue?: BilingualContent;
}

export interface MilestoneDef {
  id: string;
  icon: string;
  title: LocalizedText;
  setting: LocalizedText;
  detail: BilingualContent;
  opening: BilingualContent;
  closing: BilingualContent;
  beats: MilestoneBeatDef[];
}

export interface UiStrings {
  journeyLabel: string;
  productPromise: string;
  enterMilestoneStart: string;
  enterMilestoneContinue: string;
  journeyTagline: string;
  thinkingShiftLabel: string;
}

export interface PromptStrings {
  sceneSystem: string;
  coachSystem: string;
  npcSystem: string;
  evaluateSystem: string;
}

export interface EngineStrings {
  npcClarifyMisunderstood: string;
  npcClarifyRepeat: string;
  annaKnowsAlready: string;
  annaTryAgain: string;
}

/** One language pack — all user-facing content for a track */
export interface ContentPack {
  readonly id: Language;
  readonly journeyLabel: string;
  readonly roadmap: readonly MilestoneRoadmapItem[];
  readonly milestones: Readonly<Record<string, LifeMilestone>>;
  readonly ui: UiStrings;
  readonly prompts: PromptStrings;
  readonly engine: EngineStrings;
}

export interface PlannedContentPack {
  readonly id: PlannedLanguage;
  readonly status: "planned";
}
