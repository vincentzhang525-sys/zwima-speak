/**
 * Sprint 6 — Live Conversation Engine
 * Materializes coffee & supermarket visits from a seed. Same objective, never the same script.
 */
import type {
  BilingualLine,
  ConversationMoment,
  ConversationVariantMeta,
  Language,
  LifeMilestone,
} from "./types";
import { bil } from "./milestones/bilingual";
import { getObjectivesForMilestone, type DynamicMilestoneId } from "./conversation-objectives";
import { pickOne, pickRange, seededUnit } from "./conversation-rng";

export { createConversationSeed } from "./conversation-rng";

type Personality = {
  id: string;
  pace: "slow" | "normal" | "fast";
};

const COFFEE_PERSONALITIES: Record<Language, Personality[]> = {
  german: [
    { id: "warm", pace: "normal" },
    { id: "rushed", pace: "fast" },
    { id: "formal", pace: "slow" },
    { id: "chatty", pace: "normal" },
    { id: "tired", pace: "slow" },
    { id: "energetic", pace: "fast" },
    { id: "quiet", pace: "slow" },
    { id: "friendly", pace: "normal" },
  ],
  english: [
    { id: "warm", pace: "normal" },
    { id: "rushed", pace: "fast" },
    { id: "formal", pace: "slow" },
    { id: "chatty", pace: "normal" },
    { id: "tired", pace: "slow" },
    { id: "energetic", pace: "fast" },
    { id: "quiet", pace: "slow" },
    { id: "friendly", pace: "normal" },
  ],
};

const SUPER_PERSONALITIES: Record<Language, Personality[]> = {
  german: [
    { id: "helpful", pace: "normal" },
    { id: "busy", pace: "fast" },
    { id: "quiet", pace: "slow" },
    { id: "cheerful", pace: "normal" },
  ],
  english: [
    { id: "helpful", pace: "normal" },
    { id: "busy", pace: "fast" },
    { id: "quiet", pace: "slow" },
    { id: "cheerful", pace: "normal" },
  ],
};

export function materializeMilestone(
  template: LifeMilestone,
  language: Language,
  seed: string
): LifeMilestone {
  if (template.id === "coffee") {
    return materializeCoffee(template, language, seed);
  }
  if (template.id === "supermarket") {
    return materializeSupermarket(template, language, seed);
  }
  return template;
}

function materializeCoffee(
  template: LifeMilestone,
  language: Language,
  seed: string
): LifeMilestone {
  const personality = pickOne(seed, "personality", COFFEE_PERSONALITIES[language]);
  const drink = pickOne(seed, "drink", COFFEE_DRINKS[language]);
  const customization = pickOne(seed, "custom", COFFEE_CUSTOM[language]);
  const priceCents = Math.round(pickRange(seed, "price", 280, 450) / 10) * 10;
  const priceDisplay = formatPrice(language, priceCents);
  const greeting = pickOne(seed, "greet", COFFEE_GREETINGS[language][personality.id]);
  const ending = pickOne(seed, "ending", COFFEE_ENDINGS[language]);
  const settingFlavor = pickOne(seed, "setting", COFFEE_SETTING_FLAVOR[language]);
  const shopName = pickOne(seed, "shop", COFFEE_SHOP_NAMES[language]);
  const baristaAge = pickOne(seed, "barista-age", BARISTA_AGE_LABEL[language]);
  const baristaName = pickOne(seed, "barista-name", BARISTA_NAMES[language]);

  const sharedMeta: Omit<ConversationVariantMeta, "personalityId" | "npcPace"> = {
    productId: drink.id,
    customizationId: customization.id,
    priceDisplay,
    greetingStyle: greeting.style,
    endingStyle: ending.id,
  };

  const moments: ConversationMoment[] = [
    buildCoffeeGreet(language, personality, greeting, seed),
    buildCoffeeOrder(language, personality, drink, seed),
    buildCoffeeCustomize(language, personality, drink, customization, priceDisplay, seed),
    buildCoffeePay(language, personality, priceDisplay, seed),
    buildCoffeeThanks(language, personality, ending, seed),
  ].map((m) => ({
    ...m,
    variantMeta: {
      personalityId: personality.id,
      npcPace: personality.pace,
      ...sharedMeta,
    },
  }));

  const settingDetail = language === "german"
    ? bil(
        `${settingFlavor.native} ${shopName}——${baristaAge}的${baristaName}在吧台后面，${personalityLabelDe(personality.id)}。`,
        `${settingFlavor.target} ${shopName} — ${baristaName} hinter der Theke, ${personalityLabelDe(personality.id)}.`
      )
    : bil(
        `${settingFlavor.native} ${shopName}——${baristaAge} ${baristaName} behind the counter, ${personalityLabelDe(personality.id)}.`,
        `${settingFlavor.target} ${shopName} — ${baristaName}, ${personalityLabelDe(personality.id)}.`
      );

  const closing = language === "german"
    ? bil(
        `${drink.nativeLabel}在手里。走，去${pickOne(seed, "next-shop", ["Rewe", "Edeka", "Lidl"])}买点东西。`,
        `${drink.targetLabel} in der Hand. Los zum Supermarkt — ein paar Sachen für zuhause.`
      )
    : bil(
        `${drink.nativeLabel}在手里。走，去超市买点东西。`,
        `${drink.targetLabel} in your hand. Off to the shop — a few things for home.`
      );

  return {
    ...template,
    setting: language === "german" ? `${shopName} · 街角` : `${shopName} · corner`,
    settingDetail,
    closing,
    moments,
  };
}

function buildCoffeeGreet(
  language: Language,
  personality: Personality,
  greeting: GreetingVariant,
  seed: string
): ConversationMoment {
  const bridge = pickOne(seed, "greet-bridge", COFFEE_GREET_BRIDGES[language][personality.id]);
  return {
    id: "greet",
    sceneBridge: bridge,
    npcLine: greeting.npc,
    phrase: greeting.reply,
    keyPhrase: greeting.keyPhrase,
    speakPrompt: bil(
      language === "german" ? "回她——一样的就好。" : "Say it back — match her energy.",
      language === "german" ? "Sag's zurück — genauso." : "Say it back — same energy."
    ),
    continueScene: pickOne(seed, "greet-follow", COFFEE_ORDER_PROMPTS[language][personality.id]),
  };
}

function buildCoffeeOrder(
  language: Language,
  personality: Personality,
  drink: DrinkVariant,
  seed: string
): ConversationMoment {
  const bridge = pickOne(seed, "order-bridge", COFFEE_ORDER_BRIDGES[language][personality.id]);
  return {
    id: "order",
    sceneBridge: bridge,
    phrase: drink.orderPhrase,
    keyPhrase: drink.keyPhrase,
    speakPrompt: bil(
      language === "german" ? `点${drink.nativeLabel}——自然说出来。` : `Order your ${drink.targetLabel} — keep it simple.`,
      language === "german" ? `Bestell ${drink.targetLabel} — kurz und klar.` : `Order your ${drink.targetLabel} — keep it simple.`
    ),
    continueScene: customizationLeadIn(language, personality, drink, seed),
  };
}

function buildCoffeeCustomize(
  language: Language,
  personality: Personality,
  drink: DrinkVariant,
  customization: CustomVariant,
  priceDisplay: string,
  seed: string
): ConversationMoment {
  const bridge = pickOne(seed, "custom-bridge", COFFEE_CUSTOM_BRIDGES[language][personality.id]);
  return {
    id: "customize",
    sceneBridge: bridge,
    npcLine: customization.question,
    phrase: customization.reply,
    keyPhrase: customization.keyPhrase,
    speakPrompt: bil(
      customization.hintNative,
      customization.hintTarget
    ),
    continueScene: priceLeadIn(language, personality, drink, priceDisplay, seed),
  };
}

function buildCoffeePay(
  language: Language,
  personality: Personality,
  priceDisplay: string,
  seed: string
): ConversationMoment {
  const bridge = payBridge(language, priceDisplay, personality.id, seed);
  const pay = COFFEE_PAY[language];
  return {
    id: "pay",
    sceneBridge: bridge,
    phrase: pay.phrase,
    keyPhrase: pay.keyPhrase,
    speakPrompt: bil(pay.hintNative, pay.hintTarget),
    continueScene: pickOne(seed, "pay-after", COFFEE_PAY_AFTER[language][personality.id]),
  };
}

function buildCoffeeThanks(
  language: Language,
  personality: Personality,
  ending: EndingVariant,
  seed: string
): ConversationMoment {
  const bridge = pickOne(seed, "thanks-bridge", COFFEE_THANKS_BRIDGES[language][personality.id]);
  return {
    id: "thanks",
    sceneBridge: bridge,
    phrase: ending.phrase,
    keyPhrase: ending.keyPhrase,
    speakPrompt: bil(ending.hintNative, ending.hintTarget),
  };
}

function materializeSupermarket(
  template: LifeMilestone,
  language: Language,
  seed: string
): LifeMilestone {
  const personality = pickOne(seed, "personality", SUPER_PERSONALITIES[language]);
  const item = pickOne(seed, "item", SUPER_ITEMS[language]);
  const priceCents = Math.round(pickRange(seed, "price", 580, 1420) / 10) * 10;
  const priceDisplay = formatPrice(language, priceCents);
  const greeting = pickOne(seed, "greet", SUPER_GREETINGS[language][personality.id]);
  const ending = pickOne(seed, "ending", SUPER_ENDINGS[language]);
  const storeName = pickOne(seed, "store", SUPER_STORE_NAMES[language]);
  const aisleHint = pickOne(seed, "aisle", item.aisleHints[language]);

  const moments: ConversationMoment[] = [
    buildSuperGreet(language, personality, greeting, item, seed),
    buildSuperFind(language, personality, item, aisleHint, seed),
    buildSuperBag(language, personality, seed),
    buildSuperPay(language, personality, priceDisplay, seed),
    buildSuperThanks(language, personality, ending, seed),
  ].map((m) => ({
    ...m,
    variantMeta: {
      personalityId: personality.id,
      npcPace: personality.pace,
      findItemId: item.id,
      priceDisplay,
      greetingStyle: greeting.style,
      endingStyle: ending.id,
    },
  }));

  const settingFlavor = pickOne(seed, "setting", SUPER_SETTING_FLAVOR[language]);

  return {
    ...template,
    setting: storeName,
    settingDetail: bil(
      `${settingFlavor.native} ${storeName}——${item.nativeLabel}在购物单上。`,
      `${settingFlavor.target} ${storeName} — ${item.targetLabel} steht auf der Liste.`
    ),
    closing: language === "german"
      ? bil(
          `好了，${item.nativeLabel}在袋子里。回家做饭吧——今天又完整过了一段日子。`,
          `Fertig. ${item.targetLabel} im Beutel — wieder ein Stück echtes Leben. Nach Hause kochen.`
        )
      : bil(
          `好了，${item.nativeLabel}买好了。回家做饭吧。`,
          `Done. ${item.targetLabel} in the bag — home and cook.`
        ),
    moments,
  };
}

function buildSuperGreet(
  language: Language,
  personality: Personality,
  greeting: GreetingVariant,
  item: ItemVariant,
  seed: string
): ConversationMoment {
  return {
    id: "greet",
    sceneBridge: pickOne(seed, "greet-bridge", SUPER_GREET_BRIDGES[language][personality.id]),
    npcLine: greeting.npc,
    phrase: greeting.reply,
    keyPhrase: greeting.keyPhrase,
    speakPrompt: bil(
      language === "german" ? "回她一句——自然就好。" : "Say it back — easy.",
      language === "german" ? "Sag's zurück — ganz normal." : "Say it back — easy."
    ),
    continueScene: language === "german"
      ? bil(`你推着车往里走——得找${item.nativeLabel}。`, `Du schiebst weiter — du brauchst ${item.targetLabel}.`)
      : bil(`你推着车往里走——得找${item.nativeLabel}。`, `You head in — need ${item.targetLabel}.`),
  };
}

function buildSuperFind(
  language: Language,
  personality: Personality,
  item: ItemVariant,
  aisleHint: string,
  seed: string
): ConversationMoment {
  return {
    id: "find",
    sceneBridge: pickOne(seed, "find-bridge", SUPER_FIND_BRIDGES[language][personality.id]),
    phrase: item.findPhrase,
    keyPhrase: item.keyPhrase,
    speakPrompt: bil(item.hintNative, item.hintTarget),
    continueScene: language === "german"
      ? bil(`她指了指：「${aisleHint}」`, `Sie zeigt: „${aisleHint}“`)
      : bil(`她指了指：「${aisleHint}」`, `She points: "${aisleHint}"`),
  };
}

function buildSuperBag(
  language: Language,
  personality: Personality,
  seed: string
): ConversationMoment {
  const bagQ = pickOne(seed, "bag-q", SUPER_BAG_QUESTIONS[language][personality.id]);
  const bag = SUPER_BAG_REPLY[language];
  return {
    id: "bag",
    sceneBridge: pickOne(seed, "bag-bridge", SUPER_BAG_BRIDGES[language][personality.id]),
    npcLine: bagQ,
    phrase: bag.phrase,
    keyPhrase: bag.keyPhrase,
    speakPrompt: bil(bag.hintNative, bag.hintTarget),
    continueScene: bil(
      language === "german" ? "她把东西装进袋子。" : "She packs the bag.",
      language === "german" ? "Alles in die Tüte." : "Everything goes in the bag."
    ),
  };
}

function buildSuperPay(
  language: Language,
  personality: Personality,
  priceDisplay: string,
  seed: string
): ConversationMoment {
  const pay = SUPER_PAY[language];
  return {
    id: "pay",
    sceneBridge: payBridge(language, priceDisplay, personality.id, seed, "super"),
    phrase: pay.phrase,
    keyPhrase: pay.keyPhrase,
    speakPrompt: bil(pay.hintNative, pay.hintTarget),
    continueScene: pickOne(seed, "pay-after", SUPER_PAY_AFTER[language][personality.id]),
  };
}

function buildSuperThanks(
  language: Language,
  personality: Personality,
  ending: EndingVariant,
  seed: string
): ConversationMoment {
  return {
    id: "thanks",
    sceneBridge: pickOne(seed, "thanks-bridge", SUPER_THANKS_BRIDGES[language][personality.id]),
    phrase: ending.phrase,
    keyPhrase: ending.keyPhrase,
    speakPrompt: bil(ending.hintNative, ending.hintTarget),
  };
}

// --- helpers & variant pools ---

type GreetingVariant = {
  style: string;
  npc: string;
  reply: string;
  keyPhrase: string;
};

type DrinkVariant = {
  id: string;
  nativeLabel: string;
  targetLabel: string;
  orderPhrase: string;
  keyPhrase: string;
};

type CustomVariant = {
  id: string;
  question: string;
  reply: string;
  keyPhrase: string;
  hintNative: string;
  hintTarget: string;
};

type EndingVariant = {
  id: string;
  phrase: string;
  keyPhrase: string;
  hintNative: string;
  hintTarget: string;
};

type ItemVariant = {
  id: string;
  nativeLabel: string;
  targetLabel: string;
  findPhrase: string;
  keyPhrase: string;
  hintNative: string;
  hintTarget: string;
  aisleHints: Record<Language, string[]>;
};

function formatPrice(language: Language, cents: number): string {
  const major = Math.floor(cents / 100);
  const minor = cents % 100;
  if (language === "german") {
    return `${major},${minor.toString().padStart(2, "0")} Euro`;
  }
  return `£${major}.${minor.toString().padStart(2, "0")}`;
}

function personalityLabelDe(id: string): string {
  const labels: Record<string, string> = {
    warm: "今天店员很热情",
    rushed: "早上有点忙",
    formal: "说话很正式",
    chatty: "店员爱聊两句",
    helpful: "店员很乐意帮忙",
    busy: "收银台有点赶",
    quiet: "店里比较安静",
    cheerful: "气氛挺轻松",
    tired: "看起来有点累但很耐心",
    energetic: "手脚很快",
    friendly: "笑得很暖",
  };
  return labels[id] ?? "";
}

const BARISTA_NAMES: Record<Language, string[]> = {
  german: ["Lena", "Marco", "Aylin", "Stefan", "Julia", "Omar"],
  english: ["Maya", "Chris", "Priya", "Tom", "Sara", "Alex"],
};

const BARISTA_AGE_LABEL: Record<Language, string[]> = {
  german: ["年轻", "中年", "年长"],
  english: ["young", "middle-aged", "older"],
};

function customizationLeadIn(
  language: Language,
  personality: Personality,
  drink: DrinkVariant,
  seed: string
): BilingualLine {
  const lines = COFFEE_CUSTOM_LEAD[language][personality.id];
  const line = pickOne(seed, "custom-lead", lines);
  return typeof line === "function" ? line(drink) : line;
}

function priceLeadIn(
  language: Language,
  personality: Personality,
  drink: DrinkVariant,
  price: string,
  seed: string
): BilingualLine {
  if (language === "german") {
    const variants: BilingualLine[] = [
      bil(`${drink.nativeLabel}好了。她看了看屏幕：「Das macht ${price}。」`, `Fertig. „Das macht ${price}.“`),
      bil(`杯子递过来：「${price}, bitte.」`, `„${price}, bitte.“`),
      bil(`她把${drink.nativeLabel}推过来：「Zusammen ${price}.」`, `„Zusammen ${price}.“`),
    ];
    return pickOne(seed, "price-lead", variants);
  }
  const variants: BilingualLine[] = [
    bil(`杯子递过来：「That's ${price}, please.」`, `“That's ${price}, please.”`),
    bil(`她看了看屏幕：「${price}, please.」`, `“${price}, please.”`),
  ];
  return pickOne(seed, "price-lead", variants);
}

function payBridge(
  language: Language,
  price: string,
  personalityId: string,
  seed: string,
  scene: "coffee" | "super" = "coffee"
): BilingualLine {
  const salt = `pay-bridge-${scene}`;
  if (language === "german") {
    const variants: Record<string, BilingualLine[]> = {
      warm: [bil(`${price}。她笑着等你的卡。`, `${price}. Sie wartet auf deine Karte.`)],
      rushed: [bil(`${price}——卡准备好。`, `${price} — Karte hin.`)],
      formal: [bil(`「Das macht ${price}.」`, `„Das macht ${price}.“`)],
      chatty: [bil(`${price}。今天第一次用德国卡？`, `${price}. Erste deutsche Karte?`)],
      helpful: [bil(`屏幕显示 ${price}。`, `Display: ${price}.`)],
      busy: [bil(`${price}。后面还有人排着。`, `${price}. Schlange dahinter.`)],
      quiet: [bil(`${price}。`, `${price}.`)],
      cheerful: [bil(`${price}——滴一下就好。`, `${price} — kurz draufhalten.`)],
    };
    return pickOne(seed, salt, variants[personalityId] ?? variants.warm);
  }
  return bil(`${price}。卡掏出来了。`, `${price}. Card out.`);
}

const COFFEE_SHOP_NAMES: Record<Language, string[]> = {
  german: [
    "Café Sonnenschein",
    "Bäckerei Krüger",
    "Espresso Bar Mitte",
    "Café am Park",
    "Rösterei Nord",
    "Kaffee Zeit",
  ],
  english: [
    "Corner Grind",
    "The Daily Cup",
    "Park Street Café",
    "Bean & Co",
    "North Roasters",
    "Morning Brew",
  ],
};

const COFFEE_SETTING_FLAVOR: Record<Language, { native: string; target: string }[]> = {
  german: [
    { native: "街角排着队，咖啡香飘出来。", target: "Schlange an der Ecke, Kaffeeduft in der Luft." },
    { native: "玻璃门后机器嗡嗡响，", target: "Hinter der Glastür summt die Maschine —" },
    { native: "外面有点凉，里面暖烘烘的。", target: "Draußen kühl, drinnen warm —" },
  ],
  english: [
    { native: "柜台排着队，浓缩咖啡的香味扑过来。", target: "Queue at the counter, smell of espresso." },
    { native: "窗外在下雨，店里很暖和。", target: "Rain outside, warm inside —" },
  ],
};

const COFFEE_DRINKS: Record<Language, DrinkVariant[]> = {
  german: [
    { id: "kaffee", nativeLabel: "咖啡", targetLabel: "Kaffee", orderPhrase: "Einen Kaffee, bitte.", keyPhrase: "Kaffee, bitte" },
    { id: "cappuccino", nativeLabel: "卡布奇诺", targetLabel: "Cappuccino", orderPhrase: "Einen Cappuccino, bitte.", keyPhrase: "Cappuccino, bitte" },
    { id: "latte", nativeLabel: "拿铁", targetLabel: "Latte Macchiato", orderPhrase: "Einen Latte Macchiato, bitte.", keyPhrase: "Latte Macchiato, bitte" },
    { id: "espresso", nativeLabel: "浓缩咖啡", targetLabel: "Espresso", orderPhrase: "Einen Espresso, bitte.", keyPhrase: "Espresso, bitte" },
    { id: "tee", nativeLabel: "茶", targetLabel: "Tee", orderPhrase: "Einen Tee, bitte.", keyPhrase: "Tee, bitte" },
  ],
  english: [
    { id: "coffee", nativeLabel: "咖啡", targetLabel: "coffee", orderPhrase: "A coffee, please.", keyPhrase: "coffee, please" },
    { id: "cappuccino", nativeLabel: "卡布奇诺", targetLabel: "cappuccino", orderPhrase: "A cappuccino, please.", keyPhrase: "cappuccino, please" },
    { id: "latte", nativeLabel: "拿铁", targetLabel: "latte", orderPhrase: "A latte, please.", keyPhrase: "latte, please" },
    { id: "tea", nativeLabel: "茶", targetLabel: "tea", orderPhrase: "A tea, please.", keyPhrase: "tea, please" },
  ],
};

const COFFEE_CUSTOM: Record<Language, CustomVariant[]> = {
  german: [
    { id: "milk", question: "Mit Milch?", reply: "Ja, mit Milch, bitte.", keyPhrase: "mit Milch, bitte", hintNative: "要加奶——跟她说。", hintTarget: "Mit Milch — sag ja." },
    { id: "oat", question: "Mit Hafermilch?", reply: "Ja, mit Hafermilch, bitte.", keyPhrase: "Hafermilch, bitte", hintNative: "要燕麦奶——Ja 加 bitte。", hintTarget: "Hafermilch — ja, bitte." },
    { id: "sugar", question: "Mit Zucker?", reply: "Ja, mit Zucker, bitte.", keyPhrase: "mit Zucker, bitte", hintNative: "要加糖——跟她说。", hintTarget: "Zucker — ja, bitte." },
    { id: "none", question: "Ohne Milch?", reply: "Nein, ohne Milch, bitte.", keyPhrase: "ohne Milch, bitte", hintNative: "不要奶——Nein 加 bitte。", hintTarget: "Ohne Milch — nein, bitte." },
  ],
  english: [
    { id: "milk", question: "Milk?", reply: "Yes, with milk, please.", keyPhrase: "with milk, please", hintNative: "要加奶——跟她说。", hintTarget: "With milk — go ahead." },
    { id: "oat", question: "Oat milk?", reply: "Yes, with oat milk, please.", keyPhrase: "oat milk, please", hintNative: "要燕麦奶——跟她说。", hintTarget: "Oat milk — yes, please." },
    { id: "sugar", question: "Sugar?", reply: "Yes, with sugar, please.", keyPhrase: "with sugar, please", hintNative: "要加糖——跟她说。", hintTarget: "Sugar — yes, please." },
    { id: "none", question: "Black, no milk?", reply: "No milk, please.", keyPhrase: "No milk, please", hintNative: "不要奶——跟她说。", hintTarget: "No milk — say it." },
  ],
};

const COFFEE_GREETINGS: Record<Language, Record<string, GreetingVariant[]>> = {
  german: {
    warm: [
      { style: "morgen", npc: "Guten Morgen!", reply: "Guten Morgen!", keyPhrase: "Guten Morgen" },
      { style: "hallo", npc: "Hallo! Schönen Morgen!", reply: "Hallo! Schönen Morgen!", keyPhrase: "Hallo" },
    ],
    rushed: [
      { style: "morgen-short", npc: "Morgen!", reply: "Guten Morgen!", keyPhrase: "Guten Morgen" },
      { style: "hallo-short", npc: "Hallo!", reply: "Hallo!", keyPhrase: "Hallo" },
    ],
    formal: [
      { style: "tag", npc: "Guten Tag!", reply: "Guten Tag!", keyPhrase: "Guten Tag" },
      { style: "morgen-formal", npc: "Guten Morgen!", reply: "Guten Morgen!", keyPhrase: "Guten Morgen" },
    ],
    chatty: [
      { style: "moin", npc: "Moin! Erster Kaffee heute?", reply: "Moin! Guten Morgen!", keyPhrase: "Moin" },
      { style: "hallo-chat", npc: "Hallo! Schön, dass Sie da sind!", reply: "Hallo! Danke!", keyPhrase: "Hallo" },
    ],
  },
  english: {
    warm: [
      { style: "morning", npc: "Good morning!", reply: "Good morning!", keyPhrase: "Good morning" },
      { style: "hi", npc: "Hi there! Lovely morning!", reply: "Hi there! Good morning!", keyPhrase: "Hi there" },
    ],
    rushed: [
      { style: "morning-short", npc: "Morning!", reply: "Good morning!", keyPhrase: "Good morning" },
      { style: "hey", npc: "Hey!", reply: "Hi!", keyPhrase: "Hi" },
    ],
    formal: [
      { style: "good-morning", npc: "Good morning.", reply: "Good morning.", keyPhrase: "Good morning" },
    ],
    chatty: [
      { style: "busy", npc: "Busy morning, eh? Good morning!", reply: "Good morning! Bit busy!", keyPhrase: "Good morning" },
    ],
  },
};

const COFFEE_ENDINGS: Record<Language, EndingVariant[]> = {
  german: [
    { id: "warm", phrase: "Danke schön! Schönen Tag noch!", keyPhrase: "Danke schön", hintNative: "温暖地道个别。", hintTarget: "Herzlich verabschieden." },
    { id: "short", phrase: "Danke! Schönen Tag!", keyPhrase: "Danke", hintNative: "说声谢谢——然后走。", hintTarget: "Danke sagen — dann raus." },
    { id: "see-you", phrase: "Vielen Dank! Bis bald!", keyPhrase: "Vielen Dank", hintNative: "好好道个别。", hintTarget: "Ordentlich verabschieden." },
  ],
  english: [
    { id: "warm", phrase: "Thank you! Have a lovely day!", keyPhrase: "Thank you", hintNative: "好好道个别。", hintTarget: "Thank her — then head out." },
    { id: "short", phrase: "Thanks! You too!", keyPhrase: "Thanks", hintNative: "说声谢谢。", hintTarget: "Say thanks." },
    { id: "cheers", phrase: "Cheers! Have a good one!", keyPhrase: "Cheers", hintNative: "轻松地道个别。", hintTarget: "Easy goodbye." },
  ],
};

type BridgeMap = Record<string, BilingualLine[]>;

const COFFEE_GREET_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("铃声一响，她抬头笑着看你。", "Die Glocke klingelt. Sie schaut auf und lächelt.")],
    rushed: [bil("你刚进门，她已经在叫下一个了——但还是看了你一眼。", "Du kommst rein — sie schaut kurz auf, Schlange wartet.")],
    formal: [bil("店里很安静。她礼貌地点头。", "Ruhig hier. Sie nickt höflich.")],
    chatty: [bil("她一边擦杯子一边跟你挥手。", "Sie winkt, während sie Becher abtrocknet.")],
  },
  english: {
    warm: [bil("门铃响了。她抬头笑着看你。", "The bell rings. She looks up and smiles.")],
    rushed: [bil("队排得很长——她加快了语速。", "Long queue — she's moving fast.")],
    formal: [bil("她穿着整洁的围裙，礼貌地点头。", "Clean apron — a polite nod.")],
    chatty: [bil("她在跟上一个客人说笑，看见你也笑了。", "Laughing with the last customer — she sees you too.")],
  },
};

const COFFEE_ORDER_PROMPTS: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("她笑着问：「Was darf's sein?」", "„Was darf's sein?“")],
    rushed: [bil("「Was darf's sein?」——说得很快。", "„Was darf's sein?“ — schnell.")],
    formal: [bil("「Was hätten Sie gern?」", "„Was hätten Sie gern?“")],
    chatty: [bil("「Erster Kaffee heute? Was darf's sein?」", "„Erster Kaffee heute? Was darf's sein?“")],
  },
  english: {
    warm: [bil("她问：「What can I get you?」", "“What can I get you?”")],
    rushed: [bil("「What'll it be?」", "“What'll it be?”")],
    formal: [bil("「What would you like?」", "“What would you like?”")],
    chatty: [bil("「First coffee of the day? What can I get you?」", "“First coffee of the day? What can I get you?”")],
  },
};

const COFFEE_ORDER_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("轮到你了。她把杯子拿在手里。", "Du bist dran. Becher in der Hand.")],
    rushed: [bil("下一个就是你——她等着。", "Du bist nächste — sie wartet.")],
    formal: [bil("她看着你，等你的点单。", "Sie schaut auf dich und wartet.")],
    chatty: [bil("「Und für Sie?」她探过身问。", "„Und für Sie?“ — sie lehnt sich vor.")],
  },
  english: {
    warm: [bil("轮到你了。她在等你的点单。", "Your turn. She's waiting for your order.")],
    rushed: [bil("快轮到你了——她看向队列。", "Almost your turn — she glances at the queue.")],
    formal: [bil("她微微倾身：「Whenever you're ready.」", "“Whenever you're ready.”")],
    chatty: [bil("「Right — what are we having?」", "“Right — what are we having?”")],
  },
};

const COFFEE_CUSTOM_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("她拿着奶壶，等你回答。", "Milchkännchen in der Hand — sie wartet.")],
    rushed: [bil("「Milch?」——问得很快。", "Schnell gefragt.")],
    formal: [bil("她轻声问了一句。", "Sie fragt leise.")],
    chatty: [bil("「Wie mögen Sie's?」她笑着问。", "„Wie mögen Sie's?“ — mit Lächeln.")],
  },
  english: {
    warm: [bil("奶壶在手里——她等你回答。", "Milk jug in hand — she's waiting.")],
    rushed: [bil("她举起奶壶——眉毛扬起。", "Milk jug up — eyebrow raised.")],
    formal: [bil("「Would you like milk with that?」", "“Would you like milk with that?”")],
    chatty: [bil("「How do you take it?」", "“How do you take it?”")],
  },
};

const COFFEE_CUSTOM_LEAD: Record<Language, Record<string, ((d: DrinkVariant) => BilingualLine)[]>> = {
  german: {
    warm: [(d) => bil(`她转身问要不要加奶。`, `„Mit Milch?“ — für deinen ${d.targetLabel}.`)],
    rushed: [() => bil(`「Milch?」`, `„Milch?“`)],
    formal: [() => bil(`她确认了一下：「Mit Milch?」`, `„Mit Milch?“`)],
    chatty: [(d) => bil(`「Für den ${d.targetLabel} — mit Milch?」`, `„Für den ${d.targetLabel} — mit Milch?“`)],
  },
  english: {
    warm: [() => bil("她拿起杯子问：「Milk?」", "She reaches for a cup: \"Milk?\"")],
    rushed: [() => bil("「Milk?」", "\"Milk?\"")],
    formal: [() => bil("「Milk with that?」", "\"Milk with that?\"")],
    chatty: [() => bil("「Milk — yes or no?」", "\"Milk — yes or no?\"")],
  },
};

const COFFEE_PAY: Record<Language, { phrase: string; keyPhrase: string; hintNative: string; hintTarget: string }> = {
  german: {
    phrase: "Mit Karte, bitte.",
    keyPhrase: "Mit Karte, bitte",
    hintNative: "递卡的时候，跟一句。",
    hintTarget: "Beim Übergeben — einfach mit sagen.",
  },
  english: {
    phrase: "Card, please.",
    keyPhrase: "Card, please",
    hintNative: "刷卡的时候，自然跟一句。",
    hintTarget: "As you tap — say it naturally.",
  },
};

const COFFEE_PAY_AFTER: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("滴一声。她把杯子推过来，笑着看你。", "Piep. Sie schiebt den Becher rüber.")],
    rushed: [bil("滴——杯子已经在台上了。", "Piep — Becher steht schon da.")],
    formal: [bil("交易完成。她微微点头。", "Zahlung durch. Kurzes Nicken.")],
    chatty: [bil("「Schmeckt bestimmt gut!」她把杯子递过来。", "„Schmeckt bestimmt gut!“ — Becher rüber.")],
  },
  english: {
    warm: [bil("滴一声。她把咖啡推过来。", "Beep. Coffee slides across.")],
    rushed: [bil("滴——下一位已经在等了。", "Beep — next customer's waiting.")],
    formal: [bil("Payment accepted. She nods.", "Payment accepted. She nods.")],
    chatty: [bil("「Enjoy!」她把杯子推过来。", "“Enjoy!” — cup across.")],
  },
};

const COFFEE_THANKS_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    warm: [bil("咖啡在手。临走前跟她说声谢。", "Becher in der Hand. Zum Gehen noch Danke.")],
    rushed: [bil("快出门了——还有一个人在你后面。", "Fast raus — noch einer in der Schlange.")],
    formal: [bil("一切妥当。道个别吧。", "Alles erledigt. Verabschieden.")],
    chatty: [bil("她冲你挥了挥手——你也该道谢了。", "Sie winkt — du auch Danke sagen.")],
  },
  english: {
    warm: [bil("咖啡在手。走之前，说声谢谢。", "Coffee in hand. Thanks before you go.")],
    rushed: [bil("后面还有人——临走道个别。", "Someone behind you — quick thanks.")],
    formal: [bil("一切完成。好好道个别。", "All done. Thank her properly.")],
    chatty: [bil("她还在跟下一位聊天——你也该走了。", "She's on to the next — your turn to go.")],
  },
};

const SUPER_STORE_NAMES: Record<Language, string[]> = {
  german: ["Rewe", "Edeka", "Lidl", "Netto"],
  english: ["Tesco", "Sainsbury's", "Co-op", "Aldi"],
};

const SUPER_SETTING_FLAVOR: Record<Language, { native: string; target: string }[]> = {
  german: [
    { native: "人不少，推车咔咔响。", target: "Viel los, Wagen klappern." },
    { native: "自动门一开，冷气扑面而来。", target: "Automatiktür — kühle Luft." },
  ],
  english: [
    { native: "就是邻居说的那家。", target: "The shop she pointed to." },
    { native: "下班高峰，人有点多。", target: "After-work rush — busy aisles." },
  ],
};

const SUPER_ITEMS: Record<Language, ItemVariant[]> = {
  german: [
    {
      id: "milch",
      nativeLabel: "牛奶",
      targetLabel: "Milch",
      findPhrase: "Entschuldigung, wo finde ich die Milch?",
      keyPhrase: "wo finde ich die Milch",
      hintNative: "开口问——牛奶在哪。",
      hintTarget: "Frag — wo die Milch ist.",
      aisleHints: { german: ["Gang drei, links.", "Hinten links, Kühlregal.", "Gang zwei, rechts."], english: [] },
    },
    {
      id: "brot",
      nativeLabel: "面包",
      targetLabel: "Brot",
      findPhrase: "Entschuldigung, wo finde ich das Brot?",
      keyPhrase: "wo finde ich das Brot",
      hintNative: "问面包在哪。",
      hintTarget: "Frag nach dem Brot.",
      aisleHints: { german: ["Gang eins, vorne.", "An der Backwarenabteilung.", "Links neben dem Eingang."], english: [] },
    },
    {
      id: "eier",
      nativeLabel: "鸡蛋",
      targetLabel: "Eier",
      findPhrase: "Entschuldigung, wo finde ich die Eier?",
      keyPhrase: "wo finde ich die Eier",
      hintNative: "问鸡蛋在哪。",
      hintTarget: "Frag nach den Eiern.",
      aisleHints: { german: ["Gang vier, Mitte.", "Bei den Kühlprodukten.", "Gang drei, rechts."], english: [] },
    },
    {
      id: "butter",
      nativeLabel: "黄油",
      targetLabel: "Butter",
      findPhrase: "Entschuldigung, wo finde ich die Butter?",
      keyPhrase: "wo finde ich die Butter",
      hintNative: "问黄油在哪。",
      hintTarget: "Frag nach der Butter.",
      aisleHints: { german: ["Im Kühlregal, Gang zwei.", "Neben dem Käse.", "Gang zwei, links."], english: [] },
    },
  ],
  english: [
    {
      id: "milk",
      nativeLabel: "牛奶",
      targetLabel: "milk",
      findPhrase: "Excuse me, where can I find the milk?",
      keyPhrase: "where can I find the milk",
      hintNative: "问牛奶在哪。",
      hintTarget: "Ask where the milk is.",
      aisleHints: { german: [], english: ["Aisle three, left side.", "Back left, chilled section.", "Aisle two, far end."] },
    },
    {
      id: "bread",
      nativeLabel: "面包",
      targetLabel: "bread",
      findPhrase: "Excuse me, where can I find the bread?",
      keyPhrase: "where can I find the bread",
      hintNative: "问面包在哪。",
      hintTarget: "Ask where the bread is.",
      aisleHints: { german: [], english: ["Aisle one, near the front.", "Bakery section, left.", "Just past the entrance."] },
    },
    {
      id: "eggs",
      nativeLabel: "鸡蛋",
      targetLabel: "eggs",
      findPhrase: "Excuse me, where can I find the eggs?",
      keyPhrase: "where can I find the eggs",
      hintNative: "问鸡蛋在哪。",
      hintTarget: "Ask where the eggs are.",
      aisleHints: { german: [], english: ["Aisle four, middle.", "Chilled aisle, right side.", "Aisle three."] },
    },
  ],
};

const SUPER_GREETINGS: Record<Language, Record<string, GreetingVariant[]>> = {
  german: {
    helpful: [{ style: "tag", npc: "Guten Tag!", reply: "Guten Tag!", keyPhrase: "Guten Tag" }],
    busy: [{ style: "hallo", npc: "Hallo!", reply: "Hallo!", keyPhrase: "Hallo" }],
    quiet: [{ style: "tag-soft", npc: "Guten Tag.", reply: "Guten Tag!", keyPhrase: "Guten Tag" }],
    cheerful: [{ style: "moin", npc: "Moin! Schön, dass Sie da sind!", reply: "Moin! Guten Tag!", keyPhrase: "Moin" }],
  },
  english: {
    helpful: [{ style: "hi", npc: "Hi there!", reply: "Hi there!", keyPhrase: "Hi there" }],
    busy: [{ style: "hey", npc: "Hey!", reply: "Hi!", keyPhrase: "Hi" }],
    quiet: [{ style: "hello", npc: "Hello.", reply: "Hello!", keyPhrase: "Hello" }],
    cheerful: [{ style: "afternoon", npc: "Good afternoon!", reply: "Good afternoon!", keyPhrase: "Good afternoon" }],
  },
};

const SUPER_GREET_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    helpful: [bil("入口有个店员在整理货架，抬头看见你。", "An der Ecke räumt jemand ein — schaut auf.")],
    busy: [bil("店员推着箱子经过——但还是跟你点了点头。", "Mitarbeiterin mit Kiste — kurzes Nicken.")],
    quiet: [bil("店里比较安静。有人抬头看了一眼。", "Ruhig. Jemand schaut kurz auf.")],
    cheerful: [bil("背景音乐轻轻响着，店员冲你笑了笑。", "Leise Musik — ein Lächeln.")],
  },
  english: {
    helpful: [bil("门口有人在理货架，抬头看见你。", "Someone stacking shelves — looks up.")],
    busy: [bil("店员推着货箱经过——还是点了点头。", "Staff with a crate — quick nod.")],
    quiet: [bil("店里很安静。", "Quiet in here.")],
    cheerful: [bil("店员哼着歌，看见你笑了。", "Humming — smiles when she sees you.")],
  },
};

const SUPER_FIND_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    helpful: [bil("货架太多。那边有个穿制服的员工——问她。", "Zu viele Gänge. Mitarbeiterin dort — frag.")],
    busy: [bil("你转了两圈没找到。只好开口问。", "Zwei Runden — nicht gefunden. Zeit zu fragen.")],
    quiet: [bil("你站在路口犹豫。她注意到了。", "Du zögerst. Sie merkt es.")],
    cheerful: [bil("「Kann ich helfen?」她主动问。", "„Kann ich helfen?“ — sie kommt rüber.")],
  },
  english: {
    helpful: [bil("货架太多。看见一个穿制服的员工——问她。", "Too many aisles. Staff member — ask.")],
    busy: [bil("转了两圈没找到——得问了。", "Two laps — time to ask.")],
    quiet: [bil("你犹豫了一下。她看了过来。", "You hesitate. She looks over.")],
    cheerful: [bil("「Need a hand?」她走过来。", "“Need a hand?” — she walks over.")],
  },
};

const SUPER_BAG_QUESTIONS: Record<Language, Record<string, string[]>> = {
  german: {
    helpful: ["Brauchen Sie eine Tüte?", "Soll ich eine Tüte geben?"],
    busy: ["Tüte?", "Eine Tüte?"],
    quiet: ["Möchten Sie eine Tüte?"],
    cheerful: ["Ich pack's ein — Tüte dazu?", "Eine Tüte? Ist kostenlos!"],
  },
  english: {
    helpful: ["Need a bag?", "Would you like a bag?"],
    busy: ["Bag?", "Need a bag?"],
    quiet: ["Would you like a bag?"],
    cheerful: ["I'll pop it in a bag — that okay?", "Bag for you?"],
  },
};

const SUPER_BAG_REPLY: Record<Language, { phrase: string; keyPhrase: string; hintNative: string; hintTarget: string }> = {
  german: {
    phrase: "Ja, eine Tüte, bitte.",
    keyPhrase: "eine Tüte, bitte",
    hintNative: "要个袋子——Ja 加 bitte。",
    hintTarget: "Ja, eine Tüte, bitte.",
  },
  english: {
    phrase: "Yes, a bag, please.",
    keyPhrase: "a bag, please",
    hintNative: "要个袋子——Yes 加 please。",
    hintTarget: "Yes, a bag, please.",
  },
};

const SUPER_BAG_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    helpful: [bil("收银台。东西扫完了，她问了一句。", "An der Kasse. Alles durch — sie fragt:")],
    busy: [bil("扫描很快——她举起一个袋子。", "Schnelles Scannen — Tüte hoch.")],
    quiet: [bil("屏幕显示总额。她轻声问。", "Summe auf dem Display. Leise gefragt.")],
    cheerful: [bil("「Alles drin?」她笑着举起袋子。", "„Alles drin?“ — Tüte in der Hand.")],
  },
  english: {
    helpful: [bil("收银台。东西扫完了，她问了一句。", "Checkout. Everything scanned — she asks:")],
    busy: [bil("她扫描得很快——举起一个袋子。", "Fast scanning — bag up.")],
    quiet: [bil("总额出来了。她轻声问。", "Total's up. Quiet question.")],
    cheerful: [bil("「All good?」她举起袋子。", "“All good?” — bag ready.")],
  },
};

const SUPER_PAY: Record<Language, { phrase: string; keyPhrase: string; hintNative: string; hintTarget: string }> = {
  german: {
    phrase: "Mit Karte, bitte.",
    keyPhrase: "Mit Karte, bitte",
    hintNative: "递卡的时候，跟一句。",
    hintTarget: "Beim Übergeben — wie im Café.",
  },
  english: {
    phrase: "Card, please.",
    keyPhrase: "Card, please",
    hintNative: "刷卡的时候，自然跟一句。",
    hintTarget: "Like the café — as you tap.",
  },
};

const SUPER_PAY_AFTER: Record<Language, BridgeMap> = {
  german: {
    helpful: [bil("滴一声。她把袋子递给你。", "Piep. Tüte rüber.")],
    busy: [bil("滴——下一位已经在放了。", "Piep — Nächste legt schon hin.")],
    quiet: [bil("交易完成。袋子轻轻推过来。", "Fertig. Tüte rübergeschoben.")],
    cheerful: [bil("「Schönen Abend noch!」她把袋子递过来。", "„Schönen Abend noch!“ — Tüte rüber.")],
  },
  english: {
    helpful: [bil("滴一声。她把袋子递过来。", "Beep. Bag across.")],
    busy: [bil("滴——下一位已经在等了。", "Beep — next in line.")],
    quiet: [bil("滴一声。袋子推过来。", "Beep. Bag slides over.")],
    cheerful: [bil("「Have a good evening!」", "“Have a good evening!”")],
  },
};

const SUPER_THANKS_BRIDGES: Record<Language, BridgeMap> = {
  german: {
    helpful: [bil("袋子在手。走之前，跟她说声谢。", "Tüte in der Hand. Danke sagen.")],
    busy: [bil("后面有人——临走道个别。", "Jemand dahinter — kurz Danke.")],
    quiet: [bil("一切妥当。轻声道谢就好。", "Alles gut. Leises Danke.")],
    cheerful: [bil("她冲你挥了挥手——你也该道谢了。", "Sie winkt — du auch Danke.")],
  },
  english: {
    helpful: [bil("袋子在手。走之前，说声谢谢。", "Bag in hand. Thanks before you go.")],
    busy: [bil("后面还有人——快点道谢。", "Queue behind — quick thanks.")],
    quiet: [bil("轻声道个别就好。", "A quiet goodbye.")],
    cheerful: [bil("她还在哼歌——你也该走了。", "Still humming — time to go.")],
  },
};

const SUPER_ENDINGS: Record<Language, EndingVariant[]> = {
  german: [
    { id: "warm", phrase: "Danke schön! Schönen Tag noch!", keyPhrase: "Danke schön", hintNative: "温暖地道个别。", hintTarget: "Herzlich verabschieden." },
    { id: "short", phrase: "Danke! Schönen Abend!", keyPhrase: "Danke", hintNative: "说声谢谢。", hintTarget: "Danke sagen." },
    { id: "see-you", phrase: "Vielen Dank! Bis zum nächsten Mal!", keyPhrase: "Vielen Dank", hintNative: "好好道个别。", hintTarget: "Ordentlich verabschieden." },
  ],
  english: [
    { id: "warm", phrase: "Thank you! Have a lovely day!", keyPhrase: "Thank you", hintNative: "好好道个别。", hintTarget: "Thank her properly." },
    { id: "short", phrase: "Thanks! You too!", keyPhrase: "Thanks", hintNative: "说声谢谢。", hintTarget: "Say thanks." },
    { id: "cheers", phrase: "Cheers! See you!", keyPhrase: "Cheers", hintNative: "轻松道别。", hintTarget: "Easy goodbye." },
  ],
};

/** Expose objectives for coach layer */
export function getBeatObjective(milestoneId: DynamicMilestoneId, beatId: string) {
  return getObjectivesForMilestone(milestoneId).find((o) => o.id === beatId);
}

/** NPC pacing hint for future TTS — milliseconds between beats */
export function npcPaceDelay(pace: ConversationVariantMeta["npcPace"]): number {
  if (pace === "fast") return 280;
  if (pace === "slow") return 900;
  return 550;
}

/** Slight variance in mock recording duration */
export function simulatedSpeakDurationMs(
  seed: string,
  beatIndex: number,
  pace: ConversationVariantMeta["npcPace"]
): number {
  const base = pace === "fast" ? 1100 : pace === "slow" ? 2200 : 1600;
  const jitter = seededUnit(seed, `speak-dur-${beatIndex}`) * 600;
  return Math.round(base + jitter);
}
