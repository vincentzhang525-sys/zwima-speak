/**
 * Sprint 11 — Natural memory recall lines for Anna
 * Summarized, never verbatim replay of past conversations.
 */
import type {
  AnnaMemory,
  BilingualLine,
  Language,
  LearnerProfile,
  LongTermMemory,
} from "../types";
import { bil } from "../milestones/bilingual";

export interface RecallContext {
  milestoneId: string;
  momentId: string;
  patternKey: string;
}

/** Pick at most one natural recall line for this turn */
export function pickMemoryRecallLine(
  language: Language,
  memory: AnnaMemory,
  profile: LearnerProfile,
  ctx: RecallContext
): BilingualLine | null {
  const ltm = memory.longTerm;
  const candidates: BilingualLine[] = [];

  const hesitationGone = recallHesitationGone(language, memory);
  if (hesitationGone) candidates.push(hesitationGone);

  const phraseMistake = recallPhraseMistake(language, ltm, memory);
  if (phraseMistake) candidates.push(phraseMistake);

  const success = recallSuccessfulPattern(language, ltm, ctx);
  if (success) candidates.push(success);

  const confidence = recallConfidenceGrowth(language, memory);
  if (confidence) candidates.push(confidence);

  const life = recallLifeEvent(language, ltm, profile, memory, ctx);
  if (life) candidates.push(life);

  const session = recallPreviousSession(language, ltm, ctx);
  if (session) candidates.push(session);

  if (candidates.length === 0) return null;

  const day = memory.daysTogether;
  const idx = (day + ctx.milestoneId.length + ctx.momentId.length) % candidates.length;
  return candidates[idx] ?? candidates[0];
}

function recallHesitationGone(language: Language, memory: AnnaMemory): BilingualLine | null {
  const trend = memory.confidenceTrend;
  if (trend.length < 3) return null;

  const early = trend.slice(0, 2);
  const recent = trend.slice(-2);
  const earlyAvg = early.reduce((a, s) => a + s.score, 0) / early.length;
  const recentAvg = recent.reduce((a, s) => a + s.score, 0) / recent.length;

  if (recentAvg - earlyAvg < 12) return null;
  if (memory.averageSpeakingSpeedMs <= 0) return null;

  const wasSlow = memory.recentLatenciesMs.length >= 4;
  if (!wasSlow) return null;

  return language === "german"
    ? bil(
        "我注意到你现在不那么犹豫了。",
        "Mir ist aufgefallen — du zögerst nicht mehr so."
      )
    : bil(
        "我注意到你现在不那么犹豫了。",
        "I noticed you don't hesitate anymore."
      );
}

function recallPhraseMistake(
  language: Language,
  ltm: LongTermMemory,
  memory: AnnaMemory
): BilingualLine | null {
  const forgotten = ltm.phraseMistakes.find(
    (m) => !m.resolved && m.count >= 2 && memory.daysTogether - m.firstDay >= 3
  );
  if (forgotten) {
    const phrase = forgotten.phrase;
    return language === "german"
      ? bil(
          `上周你总忘记「${phrase}」——今天留意一下。`,
          `Letzte Woche hast du oft „${phrase}" vergessen — heute drauf achten.`
        )
      : bil(
          `上周你总忘记「${phrase}」。`,
          `Last week you always forgot '${phrase}'.`
        );
  }

  const improved = ltm.phraseMistakes.find((m) => m.resolved && m.count >= 2);
  if (improved && memory.daysTogether - improved.lastDay <= 2) {
    return language === "german"
      ? bil(
          `「${improved.phrase}」现在自然多了。`,
          `„${improved.phrase}" sitzt jetzt — hör ich.`
        )
      : bil(
          `「${improved.phrase}」现在顺了。`,
          `'${improved.phrase}' flows for you now.`
        );
  }

  return null;
}

function recallSuccessfulPattern(
  language: Language,
  ltm: LongTermMemory,
  ctx: RecallContext
): BilingualLine | null {
  if (ctx.milestoneId === "coffee" && ltm.successfulHighlights.some((h) => h.includes("coffee"))) {
    return language === "german"
      ? bil(
          "你上次点咖啡已经很自信了。",
          "Du hast schon mal ganz selbstbewusst Kaffee bestellt."
        )
      : bil(
          "你上次点咖啡已经很自信了。",
          "You already ordered coffee confidently."
        );
  }

  const match = ltm.successfulHighlights.find((h) =>
    ctx.milestoneId ? h.includes(ctx.milestoneId) || h.includes("neighbor") : false
  );
  if (match) {
    return language === "german"
      ? bil("这个场景你越来越熟了。", "Die Situation kennst du schon — locker.")
      : bil("这个场景你越来越熟了。", "You're getting comfortable with this one.");
  }

  return null;
}

function recallConfidenceGrowth(language: Language, memory: AnnaMemory): BilingualLine | null {
  if (memory.daysTogether < 4) return null;
  if (memory.lastConfidenceBand !== "confident" && memory.lastConfidenceBand !== "very_confident") {
    return null;
  }

  const start = memory.confidenceTrend[0];
  if (!start || start.band === memory.lastConfidenceBand) return null;

  return language === "german"
    ? bil(
        "跟刚来时比，你放松多了。",
        "Im Vergleich zum Anfang bist du viel entspannter."
      )
    : bil(
        "跟刚来时比，你放松多了。",
        "You're much more relaxed than when you started."
      );
}

function recallLifeEvent(
  language: Language,
  ltm: LongTermMemory,
  profile: LearnerProfile,
  memory: AnnaMemory,
  ctx: RecallContext
): BilingualLine | null {
  if (profile.job && ctx.milestoneId === "coffee") {
    return language === "german"
      ? bil(
          "你还记得工作那件事——今天要是聊到，你已经有答案。",
          "Du erinnerst dich an den Job — falls's heute kommt, hast du's."
        )
      : bil(
          "工作那事你说过——今天聊到也不慌。",
          "You already talked about work — you're covered if it comes up."
        );
  }

  const event = ltm.lifeEvents.find((e) => e.topic === "relocation");
  if (event && memory.daysTogether > 2) {
    return language === "german"
      ? bil("刚搬来那阵子——现在像住了一阵了。", "Am Anfang warst du neu — jetzt wohnst du schon.")
      : bil("刚搬来那阵子——现在自然多了。", "When you first moved in — now it feels more natural.");
  }

  return null;
}

function recallPreviousSession(
  language: Language,
  ltm: LongTermMemory,
  ctx: RecallContext
): BilingualLine | null {
  const prev = ltm.conversationSummaries
    .filter((c) => c.milestoneId !== ctx.milestoneId)
    .slice(-1)[0];
  if (!prev) return null;

  if (prev.highlight?.includes("coffee")) {
    return language === "german"
      ? bil("上次咖啡那趟挺顺的。", "Beim Kaffee letztes Mal — das lief gut.")
      : bil("上次咖啡那趟挺顺的。", "Last coffee run went well.");
  }

  return null;
}

/** Export a short natural-language summary for prompts (not shown verbatim to user) */
export function summarizeForAnna(memory: AnnaMemory, profile: LearnerProfile): string {
  const ltm = memory.longTerm;
  const parts: string[] = [];

  if (ltm.successfulHighlights.length) {
    parts.push(`Recent wins: ${ltm.successfulHighlights.slice(-2).join(", ")}`);
  }
  if (ltm.phraseMistakes.some((m) => !m.resolved)) {
    parts.push(
      `Watch: ${ltm.phraseMistakes
        .filter((m) => !m.resolved)
        .map((m) => m.phrase)
        .join(", ")}`
    );
  }
  if (profile.job) parts.push(`Works: ${profile.job}`);
  if (ltm.favoriteTopics.length) {
    parts.push(`Enjoys: ${ltm.favoriteTopics.slice(0, 3).join(", ")}`);
  }

  return parts.join(". ");
}
