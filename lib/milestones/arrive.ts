import type { Language, LifeMilestone } from "../types";
import { bil } from "./bilingual";

const GERMAN_ARRIVE: LifeMilestone = {
  id: "arrive",
  icon: "🏠",
  title: "早上 · 楼下",
  journeyLabel: "在德国的日子",
  setting: "你的新公寓楼下",
  settingDetail: bil(
    "行李箱还在玄关。你第一次走出大门，九月的风有点凉——邻居正从超市回来。",
    "Die Tür. Frische Luft. Die Nachbarin kommt."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "我就在你旁边。不用紧张——就像你真的刚搬来，第一次下楼。",
    "Ich bin da. Kein Stress — erster Gang raus."
  ),
  closing: bil(
    "这一段结束了。你打过招呼、说过自己新来的、问到了超市、也道了谢——这就是在德国生活的开头。走，去她说的街角，买杯咖啡。",
    "Hallo, neu hier, Supermarkt, Danke — so fängt's an. Los, Kaffee um die Ecke."
  ),
  moments: [
    {
      id: "hello",
      sceneBridge: bil(
        "她拎着袋子走近，抬头看见你，笑着先开口了。",
        "Sie kommt mit Tüten auf dich zu, sieht dich und lächelt zuerst."
      ),
      npcLine: "Hallo!",
      phrase: "Hallo! Schönen Tag!",
      keyPhrase: "Hallo",
      speakPrompt: bil(
        "说错没关系。她也跟你打招呼呢——自然地回她。",
        "Falsch ist okay. Sie grüßt — antworte zurück."
      ),
      continueScene: bil(
        "她停下脚步，把袋子换到另一只手，好像想多聊两句。",
        "Sie bleibt stehen und will offenbar kurz plaudern."
      ),
    },
    {
      id: "introduce",
      sceneBridge: bil(
        "她看了看你的门，笑着问：「Sind Sie neu hier?」",
        "Sie schaut auf deine Tür und fragt: „Sind Sie neu hier?“"
      ),
      phrase: "Ja, ich bin gerade eingezogen.",
      keyPhrase: "ich bin gerade eingezogen",
      speakPrompt: bil(
        "她在等你回答——说你刚搬进来就好。",
        "Sie wartet — sag, dass du gerade eingezogen bist."
      ),
      continueScene: bil(
        "她点点头：「Willkommen!」你想起来家里还没菜，正好问一句。",
        "Sie nickt: „Willkommen!“ Dir fällt ein — du brauchst noch Lebensmittel."
      ),
    },
    {
      id: "supermarket",
      sceneBridge: bil(
        "你想找最近的超市。她看起来乐意帮忙。",
        "Du suchst den nächsten Supermarkt. Sie wirkt hilfsbereit."
      ),
      phrase: "Entschuldigung, wo ist der nächste Supermarkt?",
      keyPhrase: "wo ist der nächste Supermarkt",
      speakPrompt: bil(
        "开口问她——最近的超市在哪。",
        "Frag sie — wo der nächste Supermarkt ist."
      ),
      continueScene: bil(
        "她抬手指了指：「Geradeaus, dann links.」你听懂了。",
        "Sie zeigt: „Geradeaus, dann links.“ Du hast es verstanden."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "路线清楚了。临走前，跟她说声谢谢。",
        "Du weißt, wo es langgeht. Sag zum Abschied Danke."
      ),
      phrase: "Vielen Dank! Schönen Tag noch!",
      keyPhrase: "Vielen Dank",
      speakPrompt: bil(
        "她帮了大忙——温暖地道个别。",
        "Sie hat dir geholfen — verabschied dich herzlich."
      ),
    },
  ],
};

const ENGLISH_ARRIVE: LifeMilestone = {
  id: "arrive",
  icon: "🏠",
  title: "Arrive Abroad",
  journeyLabel: "English Life Journey",
  setting: "Outside your new flat",
  settingDetail: bil(
    "行李箱还在门口。你第一次走出门——邻居正从超市回来。",
    "Suitcase still by the door. First step outside — your neighbour's walking back from the shops."
  ),
  coachName: "Anna",
  coachAvatar: "A",
  opening: bil(
    "我就在你旁边。就像你真的刚搬来——听见什么、跟着说什么。我会慢慢少说中文。",
    "I'm right beside you. Like you really just moved in — hear it, say it. I'll shift into English as you pick it up."
  ),
  closing: bil(
    "第一段生活场景结束了——打招呼、说新来的、问路、道谢。去她说的那家咖啡店吧。",
    "That was your first real moment — hello, new here, directions, thanks. Let's grab that coffee she pointed you to."
  ),
  moments: [
    {
      id: "hello",
      sceneBridge: bil(
        "她拎着袋子走过来，看见你，笑着先开口。",
        "She walks over with her bags, sees you, and smiles first."
      ),
      npcLine: "Hi there!",
      phrase: "Hi there! Lovely day!",
      keyPhrase: "Hi there",
      speakPrompt: bil(
        "她在跟你打招呼——自然地回她。",
        "She's greeting you — say it back, easy."
      ),
      continueScene: bil(
        "她停下脚步，好像想聊两句。",
        "She stops — looks like she wants to chat."
      ),
    },
    {
      id: "introduce",
      sceneBridge: bil(
        "她看了看你的门：「刚搬来的？」",
        "She glances at your door: \"Just moved in?\""
      ),
      phrase: "Yes, I just moved in yesterday.",
      keyPhrase: "I just moved in",
      speakPrompt: bil(
        "她在等你回答——说你昨天刚搬来。",
        "She's waiting — say you moved in yesterday."
      ),
      continueScene: bil(
        "她点点头：「Welcome!」你想起来还没买菜。",
        "She nods: \"Welcome!\" You still need groceries."
      ),
    },
    {
      id: "supermarket",
      sceneBridge: bil(
        "你想找最近的超市。她看起来愿意帮忙。",
        "You need the nearest shop. She looks happy to help."
      ),
      phrase: "Excuse me, where's the nearest supermarket?",
      keyPhrase: "where's the nearest supermarket",
      speakPrompt: bil(
        "开口问——最近的超市在哪。",
        "Ask her — where's the closest supermarket."
      ),
      continueScene: bil(
        "她指了指前面：「直走，左转。」你听懂了。",
        "She points: \"Straight ahead, then left.\" Got it."
      ),
    },
    {
      id: "thanks",
      sceneBridge: bil(
        "路线清楚了。临走前，跟她说声谢谢。",
        "You've got directions. Say thanks before you go."
      ),
      phrase: "Thanks so much! Have a lovely day!",
      keyPhrase: "Thanks so much",
      speakPrompt: bil(
        "她帮了大忙——好好道个别。",
        "She was really helpful — thank her properly."
      ),
    },
  ],
};

export const ARRIVE_MILESTONES: Record<Language, LifeMilestone> = {
  german: GERMAN_ARRIVE,
  english: ENGLISH_ARRIVE,
};
