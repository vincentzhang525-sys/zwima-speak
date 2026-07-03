/**
 * Static scripted coach responses (arrive milestone) — used by local AI provider.
 */
import type { LearnerObservation } from "./adaptive-coach-engine";
import {
  buildResponseObservation,
  getEmotionalReaction,
  getNaturalStructureReuse,
  resolveCoachLine,
  shouldDiscoverPatterns,
} from "./adaptive-coach-engine";
import { bil } from "./milestones/bilingual";
import type { CoachResponse, Language } from "./types";
import { buildCoachRecall, prependRecallToCoachMessage } from "./memory";
import { applyMemoryInfluence } from "./memory/influence";

const COACH_DATA: Record<Language, Record<string, CoachResponse[]>> = {
  german: {
    arrive: [
      {
        message: bil(
          "好——她笑了。在德国，这就是跟邻居打招呼的全部。",
          "Genau — sie lächelt. So grüßt man Nachbarn in Deutschland."
        ),
        patternExamples: [
          "明天倒垃圾，碰到人：「Hallo! Schönen Tag!」",
          "快递员敲门：「Hallo! Einen Moment, bitte.」",
          "电梯里对视：「Hallo!」",
        ],
      },
      {
        message: bil(
          "自然。她一听就知道你刚搬来。",
          "Klingt natürlich. Sie weiß sofort, dass du neu bist."
        ),
        patternExamples: [
          "物业前台：「Ja, ich bin gerade eingezogen.」",
          "公司第一天：「Ich bin der Neue. Ich bin gerade eingezogen.」",
          "见房东：「Ich bin gerade eingezogen, alles ist noch in Kartons.」",
        ],
      },
      {
        message: bil(
          "问得好。她已经在想怎么指路了。",
          "Gute Frage. Sie überlegt schon, wohin sie zeigt."
        ),
        patternExamples: [
          "找药店：「Entschuldigung, wo ist die nächste Apotheke?」",
          "找公交站：「Entschuldigung, wo ist die nächste Haltestelle?」",
          "找面包房：「Entschuldigung, wo ist die nächste Bäckerei?」",
        ],
      },
      {
        message: bil(
          "温暖。她会觉得你这个新邻居很有礼貌。",
          "Herzlich. So merkt man einen netten neuen Nachbarn."
        ),
        patternExamples: [
          "别人帮你开门：「Vielen Dank! Schönen Tag noch!」",
          "同事告诉你流程：「Vielen Dank! Schönen Tag noch!」",
          "陌生人指路之后：「Vielen Dank! Schönen Tag noch!」",
        ],
      },
    ],
  },
  english: {
    arrive: [
      {
        message: bil(
          "好——她笑得更开了。在国外，邻居打招呼就是这样。",
          "Nice — she smiled wider. That's the whole neighbour hello."
        ),
        patternExamples: [
          "倒垃圾碰到人：\"Hi there! Lovely day!\"",
          "快递员敲门：\"Hi there! One sec, please.\"",
          "电梯里：\"Hi there!\"",
        ],
      },
      {
        message: bil(
          "清楚。她一听就知道你刚搬来。",
          "Clear. She knows you just moved in."
        ),
        patternExamples: [
          "物业前台：\"Yes, I just moved in yesterday.\"",
          "上班第一天：\"I'm new — I just moved in last week.\"",
          "见房东：\"Yes, I just moved in — still unpacking.\"",
        ],
      },
      {
        message: bil(
          "问得好。她已经在想怎么指路了。",
          "Good ask. She's already thinking which way to point."
        ),
        patternExamples: [
          "找药店：\"Excuse me, where's the nearest pharmacy?\"",
          "找公交站：\"Excuse me, where's the nearest bus stop?\"",
          "找面包房：\"Excuse me, where's the nearest bakery?\"",
        ],
      },
      {
        message: bil(
          "温暖。她会觉得你很有礼貌。",
          "Warm close. She'll remember you as polite."
        ),
        patternExamples: [
          "别人开门：\"Thanks so much! Have a lovely day!\"",
          "同事帮忙：\"Thanks so much! Have a lovely day!\"",
          "路人指路：\"Thanks so much! Have a lovely day!\"",
        ],
      },
    ],
  },
};

export function getStaticCoachResponse(
  language: Language,
  milestoneId: string,
  momentIndex: number,
  learner: LearnerObservation,
  options: {
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
  }
): { message: string; patternExamples: string[] } {
  const raw =
    COACH_DATA[language][milestoneId]?.[momentIndex] ??
    COACH_DATA[language].arrive[0];

  const responseCtx = buildResponseObservation(learner, options);
  const emotion = getEmotionalReaction(language, responseCtx);
  const emotionLine = resolveCoachLine(emotion, responseCtx.supportLevel);

  const showPatterns =
    shouldDiscoverPatterns(
      learner.memory,
      learner.transition.patternStrength[learner.patternKey] ?? 0,
      learner.patternKey,
      learner.structureFamily
    ) && !applyMemoryInfluence(learner.memory, learner.transition).reduceExamples;

  if (responseCtx.structureMastered) {
    const reuse = getNaturalStructureReuse(language, learner.structureFamily);
    let message =
      reuse.length > 0 ? `${emotionLine}\n\n${reuse.join("\n")}` : emotionLine;
    const recall = buildCoachRecall(
      language,
      learner.memory,
      learner.memory.learnerProfile,
      milestoneId,
      `moment-${momentIndex}`,
      learner.patternKey
    );
    message = prependRecallToCoachMessage(message, recall, responseCtx.supportLevel);
    return { message, patternExamples: [] };
  }

  const contentLine = resolveCoachLine(raw.message, responseCtx.supportLevel);
  let message = `${emotionLine}\n\n${contentLine}`;

  if (options.neededDemonstration && responseCtx.confidenceBand === "very_nervous") {
    const extra = resolveCoachLine(
      language === "german"
        ? bil("没关系，我听到了。", "Schon okay — ich hab's gehört.")
        : bil("没关系，我听到了。", "It's okay — I heard you."),
      responseCtx.supportLevel
    );
    message = `${message}\n\n${extra}`;
  }

  const recall = buildCoachRecall(
    language,
    learner.memory,
    learner.memory.learnerProfile,
    milestoneId,
    `moment-${momentIndex}`,
    learner.patternKey
  );
  message = prependRecallToCoachMessage(message, recall, responseCtx.supportLevel);

  return {
    message,
    patternExamples: showPatterns ? raw.patternExamples : [],
  };
}
