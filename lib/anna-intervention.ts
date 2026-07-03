/**
 * Sprint 7 — Anna Intervention Policy
 * Anna waits. She only nudges — never translates word-for-word.
 */
import type { AnnaMemory, ConversationMoment, Language, SupportLevel } from "./types";
import { packString } from "./content";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine } from "./adaptive-coach-engine";
import { isStructureMastered } from "./adaptive-coach-engine";
import { getStructureFamily } from "./adaptive-coach-engine";
import { shouldSkipHeavyCoaching } from "./long-term-memory";

export type StruggleLevel = "none" | "mild" | "clear";

export interface InterventionDecision {
  annaShouldSpeak: boolean;
  npcShouldClarify: boolean;
  npcMisunderstood: boolean;
  waitBeforeAnnaMs: number;
  struggle: StruggleLevel;
  skipExplanation: boolean;
}

const HESITATION_MS = 2400;
const ANNA_WAIT_MS = 1200;

export function assessLearnerStruggle(
  memory: AnnaMemory,
  patternKey: string,
  responseLatencyMs: number,
  wouldNeedDemo: boolean
): StruggleLevel {
  if (!wouldNeedDemo) return "none";

  const priorStruggle = memory.struggledPatterns.includes(patternKey);
  const mistakes = memory.mistakeCounts[patternKey] ?? 0;
  const nervous =
    memory.lastConfidenceBand === "very_nervous" ||
    memory.lastConfidenceBand === "nervous";
  const hesitant = responseLatencyMs >= HESITATION_MS;

  if (priorStruggle || mistakes >= 2 || (hesitant && nervous)) return "clear";
  if (hesitant || mistakes >= 1 || nervous) return "mild";
  return "none";
}

export function decideAnnaIntervention(
  memory: AnnaMemory,
  moment: ConversationMoment,
  patternKey: string,
  momentId: string,
  keyPhrase: string,
  responseLatencyMs: number,
  wouldNeedDemo: boolean,
  milestoneId?: string
): InterventionDecision {
  const profile = memory.learnerProfile;
  const msId = milestoneId ?? patternKey.split(":")[0] ?? "";

  if (msId && shouldSkipHeavyCoaching(profile, memory, msId, momentId)) {
    return {
      annaShouldSpeak: false,
      npcShouldClarify: wouldNeedDemo && Boolean(moment.npcLine),
      npcMisunderstood: false,
      waitBeforeAnnaMs: 0,
      struggle: "none",
      skipExplanation: true,
    };
  }

  const struggle = assessLearnerStruggle(
    memory,
    patternKey,
    responseLatencyMs,
    wouldNeedDemo
  );
  const structureFamily = getStructureFamily(momentId, keyPhrase);
  const mastered = isStructureMastered(memory, structureFamily);
  const intent = moment.variantMeta?.npcIntent ?? "general";
  const alreadyExplained = memory.explainedNpcIntents.includes(intent) || mastered;

  if (!wouldNeedDemo) {
    return {
      annaShouldSpeak: false,
      npcShouldClarify: false,
      npcMisunderstood: false,
      waitBeforeAnnaMs: 0,
      struggle: "none",
      skipExplanation: alreadyExplained,
    };
  }

  if (struggle === "none") {
    return {
      annaShouldSpeak: false,
      npcShouldClarify: true,
      npcMisunderstood: Boolean(moment.variantMeta?.mayMisunderstand),
      waitBeforeAnnaMs: 0,
      struggle,
      skipExplanation: alreadyExplained,
    };
  }

  return {
    annaShouldSpeak: true,
    npcShouldClarify: struggle === "clear",
    npcMisunderstood: struggle === "mild" && Boolean(moment.variantMeta?.mayMisunderstand),
    waitBeforeAnnaMs: struggle === "clear" ? ANNA_WAIT_MS : ANNA_WAIT_MS / 2,
    struggle,
    skipExplanation: alreadyExplained,
  };
}

/** Meaning nudge — NOT word-for-word translation */
export function getAnnaMeaningNudge(
  language: Language,
  moment: ConversationMoment,
  supportLevel: SupportLevel,
  skipExplanation: boolean
): string {
  const intent = moment.variantMeta?.npcIntent ?? "general";

  if (skipExplanation) {
    const short = bil(
      "你懂的——再来。",
      packString(language, "engine", "annaKnowsAlready")
    );
    return resolveCoachLine(short, supportLevel, firstWords(moment.phrase));
  }

  const line = buildIntentNudge(language, intent, moment);
  return resolveCoachLine(line, supportLevel, supportLevel <= 1 ? moment.phrase : undefined);
}

export function getNpcClarificationLine(
  language: Language,
  moment: ConversationMoment,
  misunderstood: boolean
): string {
  if (misunderstood) {
    return packString(language, "engine", "npcClarifyMisunderstood");
  }
  return moment.npcLine ?? packString(language, "engine", "npcClarifyRepeat");
}

export function intentKeyForRecording(moment: ConversationMoment): string | null {
  return moment.variantMeta?.npcIntent ?? null;
}

export function recordExplainedIntent(
  memory: AnnaMemory,
  intent: string | null
): AnnaMemory {
  if (!intent || memory.explainedNpcIntents.includes(intent)) return memory;
  return {
    ...memory,
    explainedNpcIntents: [...memory.explainedNpcIntents, intent],
  };
}

function buildIntentNudge(
  language: Language,
  intent: string,
  _moment: ConversationMoment
): ReturnType<typeof bil> {
  const nudges: Record<string, Record<Language, ReturnType<typeof bil>>> = {
    greet_back: {
      german: bil("她在跟你打招呼。", "Sie grüßt dich."),
      english: bil("她在跟你打招呼。", "She's greeting you."),
    },
    take_order: {
      german: bil("她在等你说想点什么。", "Sie wartet auf deine Bestellung."),
      english: bil("她在等你说想点什么。", "She's waiting for your order."),
    },
    customize_drink: {
      german: bil("她在问你要不要加东西。", "Sie fragt nach Extras."),
      english: bil("她在问你要不要加东西。", "She's asking about extras."),
    },
    recommend_product: {
      german: bil("她在推荐另一样东西。", "Sie empfiehlt was anderes."),
      english: bil("她在推荐另一样东西。", "She's suggesting something else."),
    },
    anything_else: {
      german: bil("她问你还需不需要别的。", "Sie fragt, ob du noch was brauchst."),
      english: bil("她问你还需不需要别的。", "He asked whether you want anything else."),
    },
    state_price: {
      german: bil("她在说多少钱。", "Sie sagt den Preis."),
      english: bil("她在说多少钱。", "She's telling you the price."),
    },
    pay_card: {
      german: bil("她在等你怎么付。", "Sie wartet, wie du zahlst."),
      english: bil("她在等你怎么付。", "She's waiting for payment."),
    },
    say_thanks: {
      german: bil("临走前道个别就好。", "Zum Gehen kurz verabschieden."),
      english: bil("临走前道个别就好。", "Say goodbye before you go."),
    },
    find_item: {
      german: bil("她在等你开口问东西在哪。", "Sie wartet, dass du fragst, wo was ist."),
      english: bil("她在等你开口问东西在哪。", "She's waiting for you to ask where something is."),
    },
    offer_bag: {
      german: bil("她在问要不要袋子。", "Sie fragt nach einer Tüte."),
      english: bil("她在问要不要袋子。", "She's asking if you need a bag."),
    },
    recall_order: {
      german: bil("她记得你上次点的。", "Sie erinnert sich an deine letzte Bestellung."),
      english: bil("她记得你上次点的。", "She remembers what you ordered last time."),
    },
    general: {
      german: bil("她在等你说。", "Sie wartet auf dich."),
      english: bil("她在等你说。", "She's waiting for you."),
    },
  };

  const pool = nudges[intent] ?? nudges.general;
  return pool[language];
}

function firstWords(phrase: string): string {
  return phrase.split(/\s+/).slice(0, 2).join(" ");
}
