/**
 * Sprint 14 — Speaking loop
 * Anna speaks → replay → invite → record → one pronunciation tip → encourage → continue
 */
import type { AnnaMemory, ConversationMoment, Language } from "./types";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine } from "./adaptive-coach-engine";
import type { SupportLevel } from "./types";
import { pickMemoryRecallLine } from "./memory/recall";

export interface SpeakingLoopFeedback {
  message: string;
  autoContinueMs: number;
}

/** What Anna says naturally before the learner tries */
export function getAnnaSpeaksLine(
  language: Language,
  moment: ConversationMoment,
  milestoneId: string
): string {
  const target = moment.phrase;
  if (moment.npcLine) {
    return language === "german"
      ? `先听。\n\n他们说：\n「${moment.npcLine}」\n\n你来说：\n「${target}」`
      : `Listen first.\n\nThey say:\n"${moment.npcLine}"\n\nYou say:\n"${target}"`;
  }
  return language === "german"
    ? `先听我说。\n\n「${target}」`
    : `Listen to me first.\n\n"${target}"`;
}

export function getInviteImitation(
  language: Language,
  supportLevel: SupportLevel
): string {
  const line =
    language === "german"
      ? bil("跟我试试。", "Probier's mit mir.")
      : bil("跟我试试。", "Try it with me.");
  return resolveCoachLine(line, supportLevel);
}

export function getListenAgainLabel(language: Language): string {
  return language === "german" ? "▶ 再听一次" : "▶ Listen again";
}

export function getRecordLabel(language: Language, isRecording: boolean): string {
  if (isRecording) return language === "german" ? "我在听…" : "I'm listening…";
  return language === "german" ? "说吧" : "Your turn";
}

/** One pronunciation focus only — never a list */
export function pickPronunciationTip(
  language: Language,
  moment: ConversationMoment,
  beatIndex: number,
  neededDemonstration: boolean
): string | null {
  if (!neededDemonstration) {
    return language === "german"
      ? "节奏已经很自然了。"
      : "Your rhythm already sounds natural.";
  }

  const phrase = moment.phrase;
  const tips: { match: RegExp; de: string; en: string }[] = [
    {
      match: /danke/i,
      de: "今天只把 Danke 里的「Da」咬清楚一点。",
      en: "Today just soften the 'Da' in Danke.",
    },
    {
      match: /bitte/i,
      de: "今天只把 bitte 结尾的 e 轻轻带出来。",
      en: "Today just let the e in bitte breathe at the end.",
    },
    {
      match: /entschuldigung/i,
      de: "今天只把 Ent 开头读得轻一点。",
      en: "Today keep the Ent in Entschuldigung light.",
    },
    {
      match: /willkommen/i,
      de: "今天只把 Wel- 读得松一点。",
      en: "Today soften the Wel- in Willkommen.",
    },
    {
      match: /kaffee|coffee/i,
      de: "今天只把 Kaf- 读得短促一点。",
      en: "Today keep Kaf- short and crisp.",
    },
    {
      match: /ch\b|tsch/i,
      de: "今天只把 ch 读得轻一点——像清嗓子。",
      en: "Today soften the ch — like clearing your throat gently.",
    },
    {
      match: /r\b|rr/i,
      de: "今天只把 R 读得软一点——德国人听得懂。",
      en: "Today soften the R — Germans will understand.",
    },
    {
      match: /ü|eu|ä|ö/i,
      de: "今天只把一个元音读圆一点——不用完美。",
      en: "Today round one vowel a little — doesn't need to be perfect.",
    },
  ];

  const matched = tips.filter((t) => t.match.test(phrase));
  const pool = matched.length > 0 ? matched : tips;
  const idx = (beatIndex + phrase.length) % pool.length;
  const pick = pool[idx];
  return language === "german" ? pick.de : pick.en;
}

export function getSpeakingEncouragement(
  language: Language,
  memory: AnnaMemory,
  neededDemonstration: boolean
): string {
  if (!neededDemonstration) {
    return language === "german"
      ? "你已经自然多了。我们继续。"
      : "You already sound more natural. Let's keep going.";
  }
  if (memory.lastConfidenceBand === "nervous" || memory.lastConfidenceBand === "very_nervous") {
    return language === "german"
      ? "说错没关系。德国人听得懂。我就在旁边。"
      : "Making mistakes is normal. They'll understand. I'm beside you.";
  }
  return language === "german"
    ? "没关系。我们一起。继续。"
    : "It's fine. Let's try together. Keep going.";
}

export function buildSpeakingLoopFeedback(
  language: Language,
  moment: ConversationMoment,
  memory: AnnaMemory,
  milestoneId: string,
  beatIndex: number,
  neededDemonstration: boolean,
  supportLevel: SupportLevel
): SpeakingLoopFeedback {
  const tip = pickPronunciationTip(language, moment, beatIndex, neededDemonstration);
  const encourage = getSpeakingEncouragement(language, memory, neededDemonstration);

  const recall = pickMemoryRecallLine(language, memory, memory.learnerProfile, {
    milestoneId,
    momentId: moment.id,
    patternKey: `${milestoneId}:${moment.id}`,
  });
  const recallLine = recall
    ? resolveCoachLine(recall, supportLevel).split("\n")[0]
    : null;

  const opener = neededDemonstration
    ? language === "german"
      ? "不错。"
      : "Nice."
    : language === "german"
      ? "很好。"
      : "Great.";

  const parts = [opener, tip, encourage, recallLine].filter(Boolean);
  return {
    message: parts.join("\n"),
    autoContinueMs: neededDemonstration ? 3200 : 2400,
  };
}
