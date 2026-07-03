import type { Language, LifeMilestone } from "../types";
import { bil } from "./bilingual";

const GERMAN_COFFEE: LifeMilestone = {
  id: "coffee",
  icon: "☕",
  title: "一起去喝咖啡",
  journeyLabel: "在德国的日子",
  setting: "柏林街角咖啡店",
  settingDetail: bil(
    "街角排着队，咖啡香从玻璃门里飘出来。收银员抬起头——你在德国的第一杯咖啡，就从这里开始。",
    "Schlange an der Ecke, Kaffeeduft aus der Tür. Die Kassiererin schaut auf — dein erster Kaffee in Deutschland."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "进来了。就跟在本地人身后排队一样——听她说什么，轮到你再说。",
    "Du bist drin. Wie in der Schlange hinter Einheimischen — erst zuhören, dann du."
  ),
  closing: bil(
    "好了，咖啡在手里。走，去邻居说的那家超市——买点东西回家。",
    "Kaffee in der Hand. Los zum Supermarkt — ein paar Sachen für zuhause."
  ),
  moments: [
    {
      id: "greet",
      sceneBridge: bil(
        "铃声一响，收银员抬头笑着看你。",
        "Die Glocke klingelt. Die Kassiererin schaut auf und lächelt."
      ),
      npcLine: "Guten Morgen!",
      phrase: "Guten Morgen!",
      keyPhrase: "Guten Morgen",
      speakPrompt: bil(
        "回她一句——一样的就好。",
        "Sag's zurück — genauso."
      ),
      continueScene: bil(
        "她笑着问：「Was darf's sein?」",
        "Sie fragt: „Was darf's sein?“"
      ),
    },
    {
      id: "order",
      sceneBridge: bil(
        "轮到你了。她要听你想点什么。",
        "Du bist dran. Sie wartet auf deine Bestellung."
      ),
      phrase: "Einen Kaffee, bitte.",
      keyPhrase: "Einen Kaffee, bitte",
      speakPrompt: bil(
        "点一杯咖啡——自然说出来。",
        "Bestell einen Kaffee — kurz und klar."
      ),
      continueScene: bil(
        "她转身问：「Mit Milch?」",
        "Sie fragt: „Mit Milch?“"
      ),
    },
    {
      id: "customize",
      sceneBridge: bil(
        "她手里拿着奶壶，等你回答。",
        "Milchkännchen in der Hand — sie wartet."
      ),
      npcLine: "Mit Milch?",
      phrase: "Ja, mit Milch, bitte.",
      keyPhrase: "mit Milch, bitte",
      speakPrompt: bil(
        "要加奶——跟她说。",
        "Mit Milch — sag ja."
      ),
      continueScene: bil(
        "咖啡好了。她看了看屏幕：「Das macht 3,50 Euro.」",
        "Fertig. Sie sagt: „Das macht 3,50 Euro.“"
      ),
    },
    {
      id: "pay",
      sceneBridge: bil(
        "三块五。你掏出银行卡。",
        "Drei-fünfzig. Karte raus."
      ),
      phrase: "Mit Karte, bitte.",
      keyPhrase: "Mit Karte, bitte",
      speakPrompt: bil(
        "递卡的时候，跟一句。",
        "Beim Übergeben — einfach mit sagen."
      ),
      continueScene: bil(
        "滴一声。她把咖啡推过来，笑着看你。",
        "Piep. Sie schiebt den Kaffee rüber und lächelt."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "咖啡在手。临走前跟她说声谢。",
        "Kaffee in der Hand. Zum Gehen noch Danke sagen."
      ),
      phrase: "Danke schön! Schönen Tag noch!",
      keyPhrase: "Danke schön",
      speakPrompt: bil(
        "温暖地道个别——然后推门出去。",
        "Herzlich verabschieden — dann raus."
      ),
    },
  ],
};

const ENGLISH_COFFEE: LifeMilestone = {
  id: "coffee",
  icon: "☕",
  title: "First Coffee Shop",
  journeyLabel: "English Life Journey",
  setting: "Corner café in London",
  settingDetail: bil(
    "柜台排着队，浓缩咖啡的香味扑过来。咖啡师抬起头——第一杯咖啡，就是现在。",
    "Queue at the counter, smell of espresso. The barista looks up — first coffee, right now."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "进来了。跟在本地人后面排队——先听，再开口。",
    "You're in. Like following someone in line — listen first, then you."
  ),
  closing: bil(
    "咖啡在手里。走，去那家超市——买点东西回家。",
    "Coffee's in your hand. Off to the supermarket — a few things for home."
  ),
  moments: [
    {
      id: "greet",
      sceneBridge: bil(
        "门铃响了。咖啡师抬头笑着看你。",
        "The bell rings. The barista looks up and smiles."
      ),
      npcLine: "Good morning!",
      phrase: "Good morning!",
      keyPhrase: "Good morning",
      speakPrompt: bil(
        "回她一句——带着同样的劲儿。",
        "Say it back — same energy."
      ),
      continueScene: bil(
        "她问：「What can I get you?」",
        "She asks: \"What can I get you?\""
      ),
    },
    {
      id: "order",
      sceneBridge: bil(
        "轮到你了。她在等你的点单。",
        "Your turn. She's waiting for your order."
      ),
      phrase: "A coffee, please.",
      keyPhrase: "A coffee, please",
      speakPrompt: bil(
        "点一杯咖啡——简单说出来。",
        "Order your coffee — keep it simple."
      ),
      continueScene: bil(
        "她拿起杯子问：「Milk?」",
        "She reaches for a cup: \"Milk?\""
      ),
    },
    {
      id: "customize",
      sceneBridge: bil(
        "奶壶在手里——她等你回答。",
        "Milk jug in hand — she's waiting."
      ),
      npcLine: "Milk?",
      phrase: "Yes, with milk, please.",
      keyPhrase: "with milk, please",
      speakPrompt: bil(
        "要加奶——跟她说。",
        "With milk — go ahead."
      ),
      continueScene: bil(
        "杯子递过来：「That's £3.50, please.」",
        "Cup slides over: \"That's £3.50, please.\""
      ),
    },
    {
      id: "pay",
      sceneBridge: bil(
        "三块五。卡掏出来了。",
        "Three fifty. Card out."
      ),
      phrase: "Card, please.",
      keyPhrase: "Card, please",
      speakPrompt: bil(
        "刷卡的时候，自然跟一句。",
        "As you tap — say it naturally."
      ),
      continueScene: bil(
        "滴一声。她把咖啡推过来，笑着看你。",
        "Beep. She pushes the coffee across and smiles."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "咖啡在手。走之前，说声谢谢。",
        "Coffee in hand. One last thing before you leave."
      ),
      phrase: "Thank you! Have a lovely day!",
      keyPhrase: "Thank you",
      speakPrompt: bil(
        "好好道个别——然后推门出去。",
        "Thank her — then head out."
      ),
    },
  ],
};

export const COFFEE_MILESTONES: Record<Language, LifeMilestone> = {
  german: GERMAN_COFFEE,
  english: ENGLISH_COFFEE,
};
