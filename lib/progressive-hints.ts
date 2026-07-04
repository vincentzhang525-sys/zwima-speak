/**
 * Sprint 14 — Progressive hint system
 * Learner never stuck; discovers the answer step by step.
 */
import type { ConversationMoment, Language } from "./types";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine } from "./adaptive-coach-engine";
import type { SupportLevel } from "./types";

export type HintLevel = 1 | 2 | 3 | 4;

const GOAL_HINTS: Record<string, { de: string; en: string }> = {
  passport: { de: "把护照递给他。", en: "Hand over your passport." },
  purpose: { de: "告诉他你为什么来德国。", en: "Tell him why you're here." },
  welcome: { de: "你可以跟他道谢。", en: "You can thank him." },
  hello: { de: "回她一个招呼。", en: "Greet her back." },
  introduce: { de: "告诉她你刚搬来。", en: "Say you just moved in." },
  supermarket: { de: "问他超市在哪。", en: "Ask where the shop is." },
  thanks: { de: "你可以道谢。", en: "You can thank them." },
  greet: { de: "先打个招呼。", en: "Say hello first." },
  order: { de: "点一杯喝的。", en: "Order a drink." },
  customize: { de: "说说你要怎么加。", en: "Say how you want it." },
  pay: { de: "告诉他怎么付。", en: "Say how you'll pay." },
  find: { de: "问东西在哪。", en: "Ask where to find it." },
  bag: { de: "说要个袋子。", en: "Ask for a bag." },
};

function firstWord(phrase: string): string {
  const w = phrase.trim().split(/\s+/)[0] ?? phrase;
  return w.replace(/[.!?,]/g, "");
}

export function getProgressiveHint(
  level: HintLevel,
  language: Language,
  moment: ConversationMoment,
  supportLevel: SupportLevel
): string {
  const phrase = moment.phrase;
  const goal = GOAL_HINTS[moment.id];

  if (level === 1) {
    const line = goal
      ? bil(goal.de, goal.en)
      : bil("想想这一刻你要做什么。", "Think what you need to do here.");
    return resolveCoachLine(line, supportLevel);
  }

  if (level === 2) {
    const fw = firstWord(phrase);
    const line =
      language === "german"
        ? bil(`句子从「${fw}」开始。`, `The sentence starts with "${fw}…"`)
        : bil(`从「${fw}」开始。`, `Start with "${fw}…"`);
    return resolveCoachLine(line, supportLevel);
  }

  if (level === 3) {
    const line =
      language === "german"
        ? bil(`可以说：\n「${phrase}」`, `"${phrase}"`)
        : bil(`可以说：\n「${phrase}」`, `"${phrase}"`);
    return resolveCoachLine(line, supportLevel);
  }

  const line =
    language === "german"
      ? bil(`我们一起：\n「${phrase}」`, `Together:\n"${phrase}"`)
      : bil(`我们一起：\n「${phrase}」`, `Together:\n"${phrase}"`);
  return resolveCoachLine(line, supportLevel);
}

export function maxHintLevel(struggledBefore: boolean): HintLevel {
  return struggledBefore ? 4 : 3;
}
