/**
 * Sprint 12 — Planned language packs (content-only when ready)
 *
 * To add French:
 * 1. Create lib/content/locales/french/pack.ts with ContentPack
 * 2. Add MilestoneDef target strings for french in milestone defs OR separate french defs
 * 3. Register in lib/content/packs.ts
 * 4. Extend Language type in lib/types.ts
 * No engine, AI, or UI component changes required.
 */
import type { PlannedLanguage } from "./types";

export const PLANNED_LANGUAGE_META: Record<
  PlannedLanguage,
  { label: string; flag: string }
> = {
  french: { label: "French", flag: "🇫🇷" },
  spanish: { label: "Spanish", flag: "🇪🇸" },
  italian: { label: "Italian", flag: "🇮🇹" },
  japanese: { label: "Japanese", flag: "🇯🇵" },
};
