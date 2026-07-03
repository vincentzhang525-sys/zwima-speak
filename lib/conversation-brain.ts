/**
 * Sprint 7 — Conversation Brain
 * Goal-driven scenes. NPCs flex. Anna waits and nudges.
 */
import type {
  AnnaMemory,
  ConversationMoment,
  Language,
  LifeMilestone,
  LivingWorldState,
} from "./types";
import { bil } from "./milestones/bilingual";
import type { DynamicMilestoneId } from "./conversation-objectives";
import { materializeMilestone } from "./conversation-engine";
import { pickOne, seededUnit } from "./conversation-rng";
import {
  getCharacterWorldRecall,
  getContinuityWelcome,
  getLifeObjective,
} from "./living-world";
import {
  buildNpcRecallGreeting,
  getNpcMemory,
  isReturnVisit,
} from "./npc-memory";
import {
  applyMemoryToMoment,
  hasCoveredTopic,
  injectJobSmallTalkBeat,
} from "./long-term-memory";
import { resolveVenueId } from "./world-state";
import { getWorldAtmosphere, getWeatherSceneNote } from "./world-clock";
import { getLocationForMilestone } from "./germany-map";

export function brainMaterializeMilestone(
  template: LifeMilestone,
  language: Language,
  seed: string,
  memory: AnnaMemory,
  world: LivingWorldState
): LifeMilestone {
  const base = materializeMilestone(template, language, seed);
  const milestoneId = template.id as DynamicMilestoneId;
  const life = getLifeObjective(milestoneId);
  const locationId = getLocationForMilestone(milestoneId);
  const venueId = resolveVenueId(milestoneId, base.setting);
  const npcMem = getNpcMemory(memory, venueId);
  const returning = isReturnVisit(memory, venueId);

  let moments = base.moments.map((moment, index) => {
    let enriched = enrichBeat(moment, index, {
      language,
      seed,
      milestoneId,
      memory,
      world,
      venueId,
      returning,
      npcMem,
      productId: base.moments.find((m) => m.id === "order")?.variantMeta?.productId,
      productLabel: getProductLabel(language, base),
      personalityId: moment.variantMeta?.personalityId ?? "warm",
    });
    if (index === 0 && weatherNote) {
      enriched = {
        ...enriched,
        sceneBridge: bil(
          `${weatherNote}\n\n${enriched.sceneBridge.native}`,
          `${weatherNote}\n\n${enriched.sceneBridge.target}`
        ),
      };
    }
    return enriched;
  });

  if (milestoneId === "coffee") {
    moments = injectJobSmallTalkBeat(
      moments,
      language,
      memory.learnerProfile,
      npcMem?.visitCount ?? 0,
      seed
    );
  }

  moments = moments.map((moment) =>
    applyMemoryToMoment(
      moment,
      memory.learnerProfile,
      memory,
      language,
      milestoneId
    )
  );

  // Re-apply job recall on customize when job already known
  if (milestoneId === "coffee" && hasCoveredTopic(memory.learnerProfile, "job")) {
    const jobIdx = moments.findIndex((m) => m.id === "customize" || m.id === "job_small_talk");
    if (jobIdx >= 0 && seededUnit(seed, "job-recall") > 0.35) {
      const jobMoment = moments[jobIdx];
      moments[jobIdx] = {
        ...jobMoment,
        npcLine:
          language === "german"
            ? "Was machen Sie beruflich?"
            : "What do you do for work?",
        phrase:
          language === "german"
            ? `Ich arbeite in einer ${memory.learnerProfile.job === "Fabrik" ? "Fabrik" : "Firma"}.`
            : `I work in a ${memory.learnerProfile.job ?? "factory"}.`,
        keyPhrase:
          language === "german" ? "arbeite" : "work",
        variantMeta: {
          ...jobMoment.variantMeta!,
          npcIntent: "ask_job",
        },
      };
    }
  }

  const continuity = getContinuityWelcome(language, milestoneId, world, memory);
  const atmosphere = getWorldAtmosphere(world, language);
  const goalLine = bil(
    `${atmosphere.native}\n\n${continuity.native}`,
    `${atmosphere.target}\n\n${continuity.target}`
  );
  const weatherNote = getWeatherSceneNote(world, language);

  const baristaThread = world.characterThreads.barista;
  if (milestoneId === "coffee" && baristaThread && moments[0]) {
    const recall = getCharacterWorldRecall(
      language,
      "barista",
      baristaThread,
      world.livingDay
    );
    if (recall && moments[0].id === "greet") {
      moments[0] = {
        ...moments[0],
        npcLine: recall,
        variantMeta: {
          ...moments[0].variantMeta!,
          npcIntent: "recall_order",
        },
      };
    }
  }

  return {
    ...base,
    opening: goalLine,
    closing: bil(
      language === "german"
        ? `${life.taskShort.german} erledigt — ${world.isDayComplete ? "nach Hause" : "weiter geht's"}.`
        : `${life.taskShort.english} done — ${world.isDayComplete ? "head home" : "still today"}.`,
      language === "german"
        ? `${life.annaTaskComplete.german}${world.isDayComplete ? " Tag fast vorbei." : ""}`
        : `${life.annaTaskComplete.english}${world.isDayComplete ? " Day almost done." : ""}`
    ),
    moments,
  };
}

type EnrichCtx = {
  language: Language;
  seed: string;
  milestoneId: DynamicMilestoneId;
  memory: AnnaMemory;
  world: LivingWorldState;
  venueId: string;
  returning: boolean;
  npcMem: ReturnType<typeof getNpcMemory>;
  productId?: string;
  productLabel?: string;
  personalityId: string;
};

function enrichBeat(
  moment: ConversationMoment,
  index: number,
  ctx: EnrichCtx
): ConversationMoment {
  let m: ConversationMoment = {
    ...moment,
    variantMeta: {
      personalityId: moment.variantMeta?.personalityId ?? ctx.personalityId,
      npcPace: moment.variantMeta?.npcPace ?? "normal",
      ...moment.variantMeta,
    },
  };
  const meta = m.variantMeta!;

  meta.npcIntent = intentForBeat(ctx.milestoneId, m.id, meta);
  meta.brainBeatRole = m.id;
  meta.mayMisunderstand =
    seededUnit(ctx.seed, `misunderstand-${index}`) > 0.62 && m.id !== "greet";

  if (ctx.milestoneId === "coffee") {
    m = enrichCoffeeBeat(m, ctx);
  } else {
    m = enrichSupermarketBeat(m, ctx);
  }

  if (ctx.returning && m.id === "greet" && ctx.npcMem) {
    const recall = buildNpcRecallGreeting(ctx.language, ctx.npcMem);
    if (recall) {
      m.npcLine = recall;
      m.variantMeta = {
        ...m.variantMeta!,
        npcIntent: "recall_order",
        greetingStyle: "returning",
      };
      m.sceneBridge =
        ctx.language === "german"
          ? bil(
              `她认出你了——「今天还是${ctx.npcMem.lastProductLabel}？」`,
              `Sie erkennt dich — „Heute wieder ${ctx.npcMem.lastProductLabel}?"`
            )
          : bil(
              `她认出你了——「今天还是${ctx.npcMem.lastProductLabel}？」`,
              `She recognizes you — "Same ${ctx.npcMem.lastProductLabel} again today?"`
            );
      if (ctx.language === "german") {
        m.phrase = recall.includes("wieder")
          ? `Ja, wieder ${ctx.npcMem.lastProductLabel}, bitte.`
          : m.phrase;
      } else {
        m.phrase = recall.includes("Same")
          ? `Yes, same ${ctx.npcMem.lastProductLabel}, please.`
          : m.phrase;
      }
    }
  }

  return m;
}

function enrichCoffeeBeat(moment: ConversationMoment, ctx: EnrichCtx): ConversationMoment {
  const m = { ...moment, variantMeta: { ...moment.variantMeta! } };

  if (m.id === "order" && seededUnit(ctx.seed, "recommend") > 0.45) {
    const rec = pickOne(ctx.seed, "rec-product", COFFEE_RECOMMENDATIONS[ctx.language]);
    m.continueScene = bil(
      ctx.language === "german"
        ? `她推荐：「${rec.native}」`
        : `她推荐：「${rec.native}」`,
      rec.target
    );
    m.variantMeta!.followUpType = "recommendation";
  }

  if (m.id === "customize" && seededUnit(ctx.seed, "upsell") > 0.38) {
    const upsell = pickOne(ctx.seed, "upsell", COFFEE_UPSELL[ctx.language]);
    m.npcLine = upsell.npc;
    m.phrase = upsell.reply;
    m.keyPhrase = upsell.keyPhrase;
    m.variantMeta!.npcIntent = "anything_else";
    m.variantMeta!.followUpType = "anything_else";
    m.sceneBridge = bil(upsell.bridgeNative, upsell.bridgeTarget);
  }

  if (m.id === "pay") {
    m.variantMeta!.npcIntent = "pay_card";
  }

  return m;
}

function enrichSupermarketBeat(moment: ConversationMoment, ctx: EnrichCtx): ConversationMoment {
  const m = { ...moment, variantMeta: { ...moment.variantMeta! } };

  if (m.id === "find" && seededUnit(ctx.seed, "staff-busy") > 0.5) {
    m.sceneBridge = bil(
      ctx.language === "german" ? "她在忙着补货——你要大声一点问。" : "她忙着补货——大声一点问。",
      ctx.language === "german"
        ? "Sie räumt ein — frag etwas lauter."
        : "She's stocking — speak up a bit."
    );
  }

  if (m.id === "bag" && seededUnit(ctx.seed, "extra-item") > 0.55) {
    const extra = pickOne(ctx.seed, "extra-scan", SUPER_EXTRAS[ctx.language]);
    m.continueScene = bil(
      `她扫完又拿起一样：「${extra.native}」`,
      extra.target
    );
    m.variantMeta!.followUpType = "impulse_item";
  }

  return m;
}

function intentForBeat(
  milestoneId: DynamicMilestoneId,
  beatId: string,
  meta: ConversationMoment["variantMeta"]
): string {
  if (meta?.followUpType === "anything_else") return "anything_else";
  if (meta?.followUpType === "recommendation") return "recommend_product";

  const coffee: Record<string, string> = {
    greet: "greet_back",
    order: "take_order",
    customize: "customize_drink",
    pay: "pay_card",
    thanks: "say_thanks",
  };
  const supermarket: Record<string, string> = {
    greet: "greet_back",
    find: "find_item",
    bag: "offer_bag",
    pay: "pay_card",
    thanks: "say_thanks",
  };

  if (beatId === "customize" && meta?.priceDisplay) return "state_price";
  return (milestoneId === "coffee" ? coffee : supermarket)[beatId] ?? "general";
}

function getProductLabel(language: Language, milestone: LifeMilestone): string {
  const order = milestone.moments.find((m) => m.id === "order");
  const id = order?.variantMeta?.productId ?? "kaffee";
  if (language === "german") {
    const labels: Record<string, string> = {
      kaffee: "Kaffee",
      cappuccino: "Cappuccino",
      latte: "Latte Macchiato",
      espresso: "Espresso",
      tee: "Tee",
      coffee: "coffee",
    };
    return labels[id] ?? "Kaffee";
  }
  return id;
}


const COFFEE_RECOMMENDATIONS: Record<Language, { native: string; target: string }[]> = {
  german: [
    { native: "Unser Croissant ist heute frisch.", target: "Unser Croissant ist heute frisch — sehr beliebt." },
    { native: "Probieren Sie mal den Hafermilch-Latte?", target: "Probieren Sie mal den Hafermilch-Latte?" },
    { native: "Der Apfelkuchen ist noch warm.", target: "Der Apfelkuchen ist noch warm." },
  ],
  english: [
    { native: "Our croissant is fresh today.", target: "Our croissant is fresh today — popular." },
    { native: "Fancy trying the oat latte?", target: "Fancy trying the oat latte?" },
    { native: "The apple cake is still warm.", target: "The apple cake is still warm." },
  ],
};

const COFFEE_UPSELL: Record<
  Language,
  {
    npc: string;
    reply: string;
    keyPhrase: string;
    bridgeNative: string;
    bridgeTarget: string;
  }[]
> = {
  german: [
    {
      npc: "Gerne. Noch etwas?",
      reply: "Nein, danke. Das ist alles.",
      keyPhrase: "Das ist alles",
      bridgeNative: "她问你要不要别的。",
      bridgeTarget: "Sie fragt, ob du noch was willst.",
    },
    {
      npc: "Noch ein Stück Kuchen dazu?",
      reply: "Nein, danke. Nur der Kaffee.",
      keyPhrase: "Nur der Kaffee",
      bridgeNative: "她问要不要加块蛋糕。",
      bridgeTarget: "Sie fragt nach Kuchen dazu.",
    },
    {
      npc: "To go oder hier trinken?",
      reply: "Hier trinken, bitte.",
      keyPhrase: "Hier trinken",
      bridgeNative: "她问在这儿喝还是带走。",
      bridgeTarget: "Sie fragt: hier oder to go?",
    },
  ],
  english: [
    {
      npc: "Anything else?",
      reply: "No thanks, that's all.",
      keyPhrase: "that's all",
      bridgeNative: "她问你还需不需要别的。",
      bridgeTarget: "She asks if you want anything else.",
    },
    {
      npc: "Cake with that?",
      reply: "No thanks, just the coffee.",
      keyPhrase: "just the coffee",
      bridgeNative: "她问要不要加蛋糕。",
      bridgeTarget: "She asks about cake.",
    },
    {
      npc: "Eat in or take away?",
      reply: "Eat in, please.",
      keyPhrase: "Eat in",
      bridgeNative: "她问在这儿喝还是带走。",
      bridgeTarget: "Eat in or take away?",
    },
  ],
};

const SUPER_EXTRAS: Record<Language, { native: string; target: string }[]> = {
  german: [
    { native: "Noch Bonbons an der Kasse?", target: "Noch Bonbons an der Kasse?" },
    { native: "Die Zeitung von heute?", target: "Die Zeitung von heute?" },
  ],
  english: [
    { native: "Chocolates by the till?", target: "Chocolates by the till?" },
    { native: "Today's paper?", target: "Today's paper?" },
  ],
};

/** Extract visit data for NPC memory after a successful scene */
export function extractNpcVisitFromMilestone(
  milestone: LifeMilestone,
  _language: Language
): {
  venueId: string;
  productId: string;
  productLabel: string;
  orderPhrase: string;
} | null {
  if (milestone.id !== "coffee" && milestone.id !== "supermarket") return null;

  const order = milestone.moments.find((m) => m.id === "order");
  const find = milestone.moments.find((m) => m.id === "find");
  const beat = order ?? find;
  if (!beat) return null;

  return {
    venueId: milestone.setting,
    productId: beat.variantMeta?.productId ?? beat.variantMeta?.findItemId ?? beat.id,
    productLabel: beat.keyPhrase,
    orderPhrase: beat.phrase,
  };
}
