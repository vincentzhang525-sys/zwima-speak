/**
 * Sprint 12 — Content layer public API
 * Single entry for all language-specific strings and milestone templates.
 */
import type { Language } from "../types";
import { getContentPack } from "./registry";

export type {
  BilingualContent,
  ContentPack,
  LanguageId,
  LocalizedText,
  MilestoneBeatDef,
  MilestoneDef,
  PlannedContentPack,
  PlannedLanguage,
  PromptStrings,
  UiStrings,
} from "./types";

export {
  ACTIVE_LANGUAGES,
  assertContentPack,
  getContentPack,
  getMilestoneFromPack,
  getPlannedPack,
  isActiveLanguage,
  isPlannedLanguage,
  PLANNED_LANGUAGES,
} from "./registry";

export {
  materializeAllMilestones,
  materializeMilestone,
  pickLocalized,
  resolveBilingual,
} from "./resolver";

export { WORLD_MILESTONE_DEFS } from "./milestone-defs/world";
export { PLANNED_LANGUAGE_META } from "./planned-languages";

/** Engine helper — fetch a string from the active pack */
export function packString(
  language: Language,
  section: "ui",
  key: keyof import("./types").UiStrings
): string;
export function packString(
  language: Language,
  section: "engine",
  key: keyof import("./types").EngineStrings
): string;
export function packString(
  language: Language,
  section: "prompts",
  key: keyof import("./types").PromptStrings
): string;
export function packString(
  language: Language,
  section: "ui" | "engine" | "prompts",
  key: string
): string {
  const pack = getContentPack(language);
  const table = pack[section] as unknown as Record<string, string>;
  return table[key] ?? key;
}
