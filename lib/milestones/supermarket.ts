import type { Language, LifeMilestone } from "../types";
import { bil } from "./bilingual";

const GERMAN_SUPERMARKET: LifeMilestone = {
  id: "supermarket",
  icon: "🛒",
  title: "First Supermarket",
  journeyLabel: "Germany Life Journey",
  setting: "Rewe 超市",
  settingDetail: bil(
    "邻居指的方向没错——街角这家 Rewe 人不少。你推着空购物车，第一次在德国自己买菜。",
    "Genau wie die Nachbarin sagte — Rewe an der Ecke, voll. Du schiebst einen leeren Wagen, erster Einkauf allein."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "走进来了。今天不买课、不背词——就是普通人下班后来买菜。我陪你走一圈。",
    "Du bist drin. Kein Unterricht — einfach einkaufen wie alle. Ich geh mit dir."
  ),
  closing: bil(
    "好了，菜在手里，钱也付清了。问路、找东西、要袋子、结账、道谢——你今天在德国又完整过了一段日子。回家吧，晚饭有着落了。",
    "Fertig. Milch im Beutel, bezahlt, gedankt — wieder ein Stück echtes Leben hier. Nach Hause, Abendessen gesichert."
  ),
  moments: [
    {
      id: "greet",
      sceneBridge: bil(
        "入口有个店员在整理货架，抬头看见你。",
        "An der Eingangsecke räumt jemand ein — schaut auf."
      ),
      npcLine: "Guten Tag!",
      phrase: "Guten Tag!",
      keyPhrase: "Guten Tag",
      speakPrompt: bil(
        "回她一句——跟早上咖啡店一样。",
        "Sag's zurück — wie im Café heute Morgen."
      ),
      continueScene: bil(
        "她点点头。你推着车往里走，需要找牛奶。",
        "Sie nickt. Du schiebst weiter — du brauchst Milch."
      ),
    },
    {
      id: "find",
      sceneBridge: bil(
        "货架太多，找不到牛奶。那边有个穿制服的员工——开口问。",
        "Zu viele Gänge. Du siehst eine Mitarbeiterin — frag sie."
      ),
      phrase: "Entschuldigung, wo finde ich die Milch?",
      keyPhrase: "wo finde ich die Milch",
      speakPrompt: bil(
        "跟邻居问路一样的句式——这次问牛奶在哪。",
        "Gleiche Struktur wie vorhin auf der Straße — nur diesmal Milch."
      ),
      continueScene: bil(
        "她指了指后面：「Gang drei, links.」你找到了。",
        "Sie zeigt: „Gang drei, links.“ Du hast sie."
      ),
    },
    {
      id: "bag",
      sceneBridge: bil(
        "收银台。店员扫完东西，问了一句。",
        "An der Kasse. Alles durchgescannt — sie fragt:"
      ),
      npcLine: "Brauchen Sie eine Tüte?",
      phrase: "Ja, eine Tüte, bitte.",
      keyPhrase: "eine Tüte, bitte",
      speakPrompt: bil(
        "要个袋子——Ja 加你要的，再加 bitte。",
        "Ja, was du brauchst, bitte — wie beim Kaffee mit Milch."
      ),
      continueScene: bil(
        "她把东西装进袋子。屏幕显示：「Das macht 8,20 Euro.」",
        "Alles in die Tüte. „Das macht 8,20 Euro.“"
      ),
    },
    {
      id: "pay",
      sceneBridge: bil(
        "八块二。卡已经在手里了。",
        "Acht-zwanzig. Karte bereit."
      ),
      phrase: "Mit Karte, bitte.",
      keyPhrase: "Mit Karte, bitte",
      speakPrompt: bil(
        "跟早上咖啡店一样——递卡时说一句。",
        "Wie heute Morgen — beim Übergeben."
      ),
      continueScene: bil(
        "滴一声。她把袋子递给你。",
        "Piep. Die Tüte kommt rüber."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "袋子在手。推车前，跟她说声谢。",
        "Tüte in der Hand. Kurz Danke sagen, bevor du gehst."
      ),
      phrase: "Danke schön! Schönen Tag noch!",
      keyPhrase: "Danke schön",
      speakPrompt: bil(
        "跟邻居告别、跟咖啡师告别——同一句。",
        "Wie bei der Nachbarin und im Café — dasselbe."
      ),
    },
  ],
};

const ENGLISH_SUPERMARKET: LifeMilestone = {
  id: "supermarket",
  icon: "🛒",
  title: "First Supermarket",
  journeyLabel: "English Life Journey",
  setting: "Local supermarket",
  settingDetail: bil(
    "就是邻居说的那家超市。你推着空购物车——第一次自己来买菜。",
    "The shop she pointed to. Empty trolley — first proper shop on your own."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "进来了。就是普通人来买菜——我陪你走一圈。",
    "You're in. Just shopping like everyone else. I'll walk with you."
  ),
  closing: bil(
    "好了，东西买齐了。问路、找货架、要袋子、付钱、道谢——今天又完整过了一段日子。回家做饭吧。",
    "Done. Directions, finding stuff, bag, pay, thanks — another real slice of life. Home, and cook."
  ),
  moments: [
    {
      id: "greet",
      sceneBridge: bil(
        "门口有个店员在理货架，抬头看见你。",
        "Someone's stacking shelves by the door — looks up."
      ),
      npcLine: "Hi there!",
      phrase: "Hi there!",
      keyPhrase: "Hi there",
      speakPrompt: bil(
        "回她——跟楼下碰到邻居一样。",
        "Say it back — like downstairs this morning."
      ),
      continueScene: bil(
        "她点点头。你推着车往里走，得找牛奶。",
        "She nods. You head in — need milk."
      ),
    },
    {
      id: "find",
      sceneBridge: bil(
        "货架太多。看见一个穿制服的员工——问她。",
        "Too many aisles. Staff member over there — ask."
      ),
      phrase: "Excuse me, where can I find the milk?",
      keyPhrase: "where can I find the milk",
      speakPrompt: bil(
        "跟早上问路一样的开头——这次问牛奶在哪。",
        "Same start as this morning — milk this time."
      ),
      continueScene: bil(
        "她指了指：「Aisle three, left side.」",
        "She points: \"Aisle three, left side.\""
      ),
    },
    {
      id: "bag",
      sceneBridge: bil(
        "收银台。东西扫完了，她问了一句。",
        "Checkout. Everything scanned — she asks:"
      ),
      npcLine: "Need a bag?",
      phrase: "Yes, a bag, please.",
      keyPhrase: "a bag, please",
      speakPrompt: bil(
        "要个袋子——Yes 加你要的，再加 please。",
        "Yes, what you need, please — like milk in the café."
      ),
      continueScene: bil(
        "东西装好了。她说：「That's £6.80, please.」",
        "Bag packed. \"That's £6.80, please.\""
      ),
    },
    {
      id: "pay",
      sceneBridge: bil(
        "六块八。卡准备好了。",
        "Six eighty. Card ready."
      ),
      phrase: "Card, please.",
      keyPhrase: "Card, please",
      speakPrompt: bil(
        "跟早上咖啡店一样——刷卡时说一句。",
        "Like the café this morning — as you tap."
      ),
      continueScene: bil(
        "滴一声。她把袋子递过来。",
        "Beep. Bag across."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "袋子在手。走之前，说声谢谢。",
        "Bag in hand. Thanks before you go."
      ),
      phrase: "Thank you! Have a lovely day!",
      keyPhrase: "Thank you",
      speakPrompt: bil(
        "跟邻居、跟咖啡师——同一句。",
        "Neighbour, barista — same line."
      ),
    },
  ],
};

export const SUPERMARKET_MILESTONES: Record<Language, LifeMilestone> = {
  german: GERMAN_SUPERMARKET,
  english: ENGLISH_SUPERMARKET,
};
