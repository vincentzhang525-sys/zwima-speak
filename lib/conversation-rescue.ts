/**
 * Sprint 6–7 — Anna keeps the learner inside the conversation.
 * Sprint 7 delegates meaning nudges to anna-intervention.
 */
import type { BilingualLine, ConversationMoment, Language, SupportLevel } from "./types";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine } from "./adaptive-coach-engine";
import { getAnnaMeaningNudge } from "./anna-intervention";

export function getMinimumRescueLine(
  language: Language,
  moment: ConversationMoment,
  supportLevel: SupportLevel
): string {
  if (moment.variantMeta?.npcIntent) {
    return getAnnaMeaningNudge(language, moment, supportLevel, false);
  }
  const line = buildRescueLine(language, moment);
  return resolveCoachLine(line, supportLevel, moment.phrase);
}

export function getAfterDemoRescue(
  language: Language,
  moment: ConversationMoment,
  supportLevel: SupportLevel
): string {
  if (moment.variantMeta?.npcIntent) {
    return getAnnaMeaningNudge(language, moment, supportLevel, false);
  }
  const line = buildAfterDemoLine(language, moment);
  return resolveCoachLine(line, supportLevel);
}

function buildRescueLine(language: Language, moment: ConversationMoment): BilingualLine {
  const phrase = moment.phrase;

  if (language === "german") {
    return bil(`就这一句：\n${phrase}`, `Nur das:\n${phrase}`);
  }
  return bil(`就这一句：\n${phrase}`, `Just this:\n${phrase}`);
}

function buildAfterDemoLine(language: Language, moment: ConversationMoment): BilingualLine {
  const npc = moment.npcLine;
  if (language === "german") {
    if (npc) {
      return bil(
        "她是这么说的。你已经很接近了。",
        `So sagt sie's: „${npc}". Du warst nah dran.`
      );
    }
    return bil(
      "她是这么说的。你已经很接近了。",
      "So sagt sie's. Du warst schon nah dran."
    );
  }
  if (npc) {
    return bil(
      "她是这么说的。你已经很接近了。",
      `That's what she said: "${npc}". You were close.`
    );
  }
  return bil(
    "她是这么说的。你已经很接近了。",
    "That's what she said. You were close."
  );
}

export function getLostInConversationNudge(
  language: Language,
  moment: ConversationMoment,
  supportLevel: SupportLevel
): string {
  return getAnnaMeaningNudge(language, moment, supportLevel, false);
}
