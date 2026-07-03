/**
 * Sprint 6 — Dynamic coach feedback tied to generated conversation context.
 */
import type { BilingualLine, ConversationMoment, Language } from "./types";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine, type LearnerObservation } from "./adaptive-coach-engine";
import {
  getEmotionalReaction,
  buildResponseObservation,
  shouldDiscoverPatterns,
} from "./adaptive-coach-engine";
import { isDynamicMilestone } from "./conversation-objectives";
import { getLifeObjective } from "./living-world";
import { buildCoachRecall, prependRecallToCoachMessage } from "./memory";
import { applyMemoryInfluence } from "./memory/influence";

export function getLiveCoachResponse(
  language: Language,
  milestoneId: string,
  moment: ConversationMoment,
  momentIndex: number,
  learner: LearnerObservation,
  options: {
    responseLatencyMs: number;
    neededDemonstration: boolean;
    targetPhrase: string;
  }
): { message: string; patternExamples: string[] } {
  const responseCtx = buildResponseObservation(learner, options);
  const emotion = getEmotionalReaction(language, responseCtx);
  const emotionLine = resolveCoachLine(emotion, responseCtx.supportLevel);

  if (responseCtx.structureMastered || learner.memory.explainedNpcIntents.includes(moment.variantMeta?.npcIntent ?? "")) {
    const recall = buildCoachRecall(
      language,
      learner.memory,
      learner.memory.learnerProfile,
      milestoneId,
      moment.id,
      learner.patternKey
    );
    return {
      message: prependRecallToCoachMessage(emotionLine, recall, responseCtx.supportLevel),
      patternExamples: [],
    };
  }

  if (!isDynamicMilestone(milestoneId)) {
    const recall = buildCoachRecall(
      language,
      learner.memory,
      learner.memory.learnerProfile,
      milestoneId,
      moment.id,
      learner.patternKey
    );
    return {
      message: prependRecallToCoachMessage(emotionLine, recall, responseCtx.supportLevel),
      patternExamples: [],
    };
  }

  const life = getLifeObjective(milestoneId);
  const contextual = buildContextualFeedback(
    language,
    milestoneId,
    moment,
    responseCtx.neededDemonstration,
    life.taskShort[language]
  );
  const contentLine = resolveCoachLine(contextual, responseCtx.supportLevel);

  let message = `${emotionLine}\n\n${contentLine}`;

  if (options.neededDemonstration && responseCtx.confidenceBand === "very_nervous") {
    const extra = resolveCoachLine(
      language === "german"
        ? bil("还在这个对话里——再来。", "Noch im Gespräch — nochmal.")
        : bil("还在这个对话里——再来。", "Still in the conversation — again."),
      responseCtx.supportLevel
    );
    message = `${message}\n\n${extra}`;
  }

  const patternExamples =
    shouldDiscoverPatterns(
      learner.memory,
      learner.transition.patternStrength[learner.patternKey] ?? 0,
      learner.patternKey,
      learner.structureFamily
    ) && !applyMemoryInfluence(learner.memory, learner.transition).reduceExamples
      ? buildPatternExamples(language, milestoneId, moment, momentIndex, responseCtx.structureMastered)
      : [];

  const recall = buildCoachRecall(
    language,
    learner.memory,
    learner.memory.learnerProfile,
    milestoneId,
    moment.id,
    learner.patternKey
  );
  message = prependRecallToCoachMessage(message, recall, responseCtx.supportLevel);

  return { message, patternExamples };
}

function buildContextualFeedback(
  language: Language,
  milestoneId: string,
  moment: ConversationMoment,
  neededDemo: boolean,
  taskShort: string
): BilingualLine {
  const meta = moment.variantMeta;
  const personality = meta?.personalityId ?? "warm";

  if (milestoneId === "coffee") {
    return coffeeFeedback(language, moment.id, personality, meta, neededDemo, taskShort);
  }
  return supermarketFeedback(language, moment.id, personality, meta, neededDemo, taskShort);
}

function coffeeFeedback(
  language: Language,
  beatId: string,
  personality: string,
  meta: ConversationMoment["variantMeta"],
  neededDemo: boolean,
  taskShort: string
): BilingualLine {
  const drink = meta?.productId ?? "kaffee";
  const price = meta?.priceDisplay ?? "";

  if (language === "german") {
    const lines: Record<string, BilingualLine> = {
      greet: personalityFeedbackDe(personality, "Sie hat dich begrüßt — du auch. Normaler Morgen.", "Ganz normal gegrüßt."),
      order: bil(
        `好——${drinkLabelDe(drink)}到手了。`,
        neededDemo
          ? `Fast — ${taskShort}. Nochmal.`
          : `${taskShort} — erledigt.`
      ),
      customize: bil(
        "她听懂了你的回答。",
        neededDemo
          ? "Sie hat's fast verstanden — noch einmal ganz ruhig."
          : "Verstanden. Genau so antwortet man hier."
      ),
      pay: bil(
        `${price}——卡递出去，很自然。`,
        neededDemo
          ? `${price} — „Mit Karte, bitte." Nochmal.`
          : `${price} — „Mit Karte, bitte." Wie jeder andere auch.`
      ),
      thanks: bil(
        "温暖。在德国，这就是跟店员道别的方式。",
        "Herzlich. So verabschiedet man sich hier."
      ),
    };
    return lines[beatId] ?? bil("好——继续。", "Gut — weiter.");
  }

  const lines: Record<string, BilingualLine> = {
    greet: bil("自然。她把你当普通客人了。", "Natural. She treated you like a regular."),
    order: bil(
      `好——${drink} ordered.`,
      neededDemo ? "Almost — try the order again, easy." : "Clear order. That's how it's done here."
    ),
    customize: bil("她听懂了。", neededDemo ? "Nearly — once more, relaxed." : "She got it. That's the move."),
    pay: bil(
      `${price}——很自然。`,
      neededDemo ? `${price} — "Card, please." Once more.` : `${price} — "Card, please." Like everyone else.`
    ),
    thanks: bil("温暖。这就是日常道别。", "Warm. That's a normal goodbye here."),
  };
  return lines[beatId] ?? bil("好。", "Good.");
}

function supermarketFeedback(
  language: Language,
  beatId: string,
  personality: string,
  meta: ConversationMoment["variantMeta"],
  neededDemo: boolean,
  taskShort: string
): BilingualLine {
  const item = meta?.findItemId ?? "milch";
  const price = meta?.priceDisplay ?? "";

  if (language === "german") {
    const lines: Record<string, BilingualLine> = {
      greet: personalityFeedbackDe(personality, "Ganz normal reingekommen.", "Wie jeder andere auch."),
      find: bil(
        `问到了${itemLabelDe(item)}在哪——她指给你了。`,
        neededDemo
          ? `Fast — ${taskShort}. Nochmal.`
          : `${taskShort} — erledigt.`
      ),
      bag: bil(
        "要袋子——她听懂了。",
        neededDemo ? '„Ja, eine Tüte, bitte." — noch einmal.' : '„Ja, eine Tüte, bitte." — passt.'
      ),
      pay: bil(
        `${price}——结账完成。`,
        neededDemo ? `${price} — „Mit Karte, bitte." Nochmal.` : `${price} — bezahlt. Wie im Café heute.`
      ),
      thanks: bil(
        "温暖。在德国超市，这就是道别。",
        "Herzlich. So sagt man Danke an der Kasse."
      ),
    };
    return lines[beatId] ?? bil("好——继续。", "Gut — weiter.");
  }

  const lines: Record<string, BilingualLine> = {
    greet: bil("自然。就像常来一样。", "Natural. Like you shop here often."),
    find: bil(
      `问到${item}在哪了。`,
      neededDemo ? "Almost — try the question again." : "Good ask. That's how you find things."
    ),
    bag: bil("袋子的事搞定了。", neededDemo ? '"Yes, a bag, please." — once more.' : '"Yes, a bag, please." — done.'),
    pay: bil(`${price}——付清了。`, neededDemo ? `${price} — "Card, please." Again.` : `${price} — paid. Same as the café.`),
    thanks: bil("温暖。日常道别。", "Warm. Normal checkout goodbye."),
  };
  return lines[beatId] ?? bil("好。", "Good.");
}

function personalityFeedbackDe(personality: string, warm: string, rushed: string): BilingualLine {
  if (personality === "rushed" || personality === "busy") {
    return bil("快节奏——你也跟上了。", rushed);
  }
  return bil("自然。这就是德国日常。", warm);
}

function drinkLabelDe(id: string): string {
  const labels: Record<string, string> = {
    kaffee: "咖啡", cappuccino: "卡布奇诺", latte: "拿铁", espresso: "浓缩咖啡", tee: "茶",
  };
  return labels[id] ?? "喝的";
}

function drinkPhraseDe(id: string): string {
  const labels: Record<string, string> = {
    kaffee: "Einen Kaffee, bitte",
    cappuccino: "Einen Cappuccino, bitte",
    latte: "Einen Latte Macchiato, bitte",
    espresso: "Einen Espresso, bitte",
    tee: "Einen Tee, bitte",
  };
  return labels[id] ?? "Einen Kaffee, bitte";
}

function itemLabelDe(id: string): string {
  const labels: Record<string, string> = {
    milch: "牛奶", brot: "面包", eier: "鸡蛋", butter: "黄油",
  };
  return labels[id] ?? "东西";
}

function buildPatternExamples(
  language: Language,
  milestoneId: string,
  moment: ConversationMoment,
  momentIndex: number,
  structureMastered: boolean
): string[] {
  if (structureMastered) return [];

  if (milestoneId === "coffee") {
    return coffeePatterns(language, moment.id, moment.variantMeta?.productId);
  }
  return supermarketPatterns(language, moment.id, moment.variantMeta?.findItemId);
}

function coffeePatterns(language: Language, beatId: string, productId?: string): string[] {
  if (language === "german") {
    const pools: Record<string, string[]> = {
      greet: ['Bäckerei: „Guten Morgen!"', 'Post: „Guten Tag!"'],
      order: [
        "点茶：「Einen Tee, bitte.」",
        "点面包：「Ein Brötchen, bitte.」",
        productId === "cappuccino" ? "换咖啡：「Einen Kaffee, bitte.」" : "点果汁：「Einen Orangensaft, bitte.」",
      ],
      customize: ["要糖：「Ja, mit Zucker, bitte.」", "燕麦奶：「Ja, mit Hafermilch, bitte.」", "不要：「Nein, ohne Milch, bitte.」"],
      pay: ["「Mit Karte, bitte.」", "「Kontaktlos, bitte.」", "「Hier, bitte.」"],
      thanks: ["「Danke schön! Schönen Tag noch!」", "「Vielen Dank! Bis bald!」"],
    };
    return pools[beatId]?.slice(0, 3) ?? [];
  }
  const pools: Record<string, string[]> = {
    greet: ['Bakery: "Good morning!"', 'Post office: "Hi there!"'],
    order: ['Tea: "A tea, please."', 'Pastry: "A croissant, please."'],
    customize: ['Sugar: "Yes, with sugar, please."', 'Oat: "Yes, with oat milk, please."'],
    pay: ['"Card, please."', '"Contactless, please."'],
    thanks: ['"Thank you! Have a lovely day!"', '"Cheers! See you!"'],
  };
  return pools[beatId]?.slice(0, 3) ?? [];
}

function supermarketPatterns(language: Language, beatId: string, itemId?: string): string[] {
  if (language === "german") {
    const pools: Record<string, string[]> = {
      find: [
        "找面包：「Entschuldigung, wo finde ich das Brot?」",
        "找鸡蛋：「Entschuldigung, wo finde ich die Eier?」",
        itemId === "milch" ? "找黄油：「Entschuldigung, wo finde ich die Butter?」" : "找牛奶：「Entschuldigung, wo finde ich die Milch?」",
      ],
      bag: ["「Ja, zwei Tüten, bitte.」", "「Nein, danke.」", "「Ja, eine Tüte, bitte.」"],
      pay: ["「Mit Karte, bitte.」", "「Kontaktlos, bitte.」"],
      thanks: ["「Danke schön! Schönen Abend noch!」", "「Vielen Dank!」"],
    };
    return pools[beatId]?.slice(0, 3) ?? [];
  }
  const pools: Record<string, string[]> = {
    find: [
      'Bread: "Excuse me, where can I find the bread?"',
      'Eggs: "Excuse me, where can I find the eggs?"',
    ],
    bag: ['"Yes, a bag, please."', '"No bag, thanks."'],
    pay: ['"Card, please."'],
    thanks: ['"Thank you! Have a lovely day!"'],
  };
  return pools[beatId]?.slice(0, 3) ?? [];
}
