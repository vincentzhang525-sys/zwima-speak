/**
 * Sprint 12 — Content resolver (shared engine)
 * Turns language-neutral defs into LifeMilestone for one track.
 */
import type { BilingualLine, Language, LifeMilestone } from "../types";
import { getLocationForMilestone } from "../germany-map";
import type {
  BilingualContent,
  MilestoneBeatDef,
  MilestoneDef,
} from "./types";

export function resolveBilingual(
  content: BilingualContent,
  language: Language
): BilingualLine {
  return { native: content.native, target: content.target[language] };
}

export function pickLocalized(
  text: Record<Language, string>,
  language: Language
): string {
  return text[language];
}

export function materializeMilestone(
  def: MilestoneDef,
  language: Language,
  journeyLabel: string
): LifeMilestone {
  const locationId = getLocationForMilestone(def.id);

  return {
    id: def.id,
    icon: def.icon,
    title: pickLocalized(def.title, language),
    journeyLabel,
    setting: pickLocalized(def.setting, language),
    settingDetail: resolveBilingual(def.detail, language),
    coachName: "Anna",
    coachAvatar: "A",
    opening: resolveBilingual(def.opening, language),
    closing: resolveBilingual(def.closing, language),
    moments: def.beats.map((beat) => materializeBeat(beat, language, locationId)),
  };
}

function materializeBeat(
  beat: MilestoneBeatDef,
  language: Language,
  locationId: string
): LifeMilestone["moments"][number] {
  return {
    id: beat.id,
    sceneBridge: resolveBilingual(beat.bridge, language),
    npcLine: beat.npcLine ? pickLocalized(beat.npcLine, language) : undefined,
    phrase: pickLocalized(beat.phrase, language),
    keyPhrase: pickLocalized(beat.keyPhrase, language),
    speakPrompt: resolveBilingual(beat.speak, language),
    continueScene: beat.continue
      ? resolveBilingual(beat.continue, language)
      : undefined,
    variantMeta: {
      personalityId: "warm",
      npcPace: "normal",
      locationId,
    },
  };
}

export function materializeAllMilestones(
  defs: MilestoneDef[],
  language: Language,
  journeyLabel: string
): Record<string, LifeMilestone> {
  const out: Record<string, LifeMilestone> = {};
  for (const def of defs) {
    out[def.id] = materializeMilestone(def, language, journeyLabel);
  }
  return out;
}
