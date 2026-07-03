import type { AnnaMemory, BilingualLine, Language, LivingWorldState, SupportLevel } from "./types";
import { bil } from "./milestones/bilingual";
import { resolveCoachLine, resolveLine } from "./transition";
import { getContinuityWelcome, getTaskCompletionSummary } from "./living-world";
import { hasCoveredTopic, getLifeRecallLine } from "./long-term-memory";
import { pickMemoryRecallLine } from "./memory/recall";

type WelcomeContext = {
  language: Language;
  memory: AnnaMemory;
  milestoneId: string;
  isResuming: boolean;
  nativeSupport: number;
  supportLevel?: SupportLevel;
  livingWorld?: LivingWorldState;
};
export function getAnnaWelcome(ctx: WelcomeContext): string {
  const { language, memory, milestoneId, isResuming, nativeSupport, supportLevel, livingWorld } = ctx;
  const line = buildWelcomeLine(language, memory, milestoneId, isResuming, livingWorld);
  if (supportLevel !== undefined) return resolveCoachLine(line, supportLevel);
  return resolveLine(line, nativeSupport);
}
function buildWelcomeLine(
  language: Language,
  memory: AnnaMemory,
  milestoneId: string,
  isResuming: boolean,
  livingWorld?: LivingWorldState
): BilingualLine {
  if (isResuming) {
    return resumeWelcome(language, milestoneId);
  }

  if (livingWorld) {
    const continuity = getContinuityWelcome(language, milestoneId, livingWorld, memory);
    const recall = getLifeRecallLine(language, memory.learnerProfile, memory);
    const memoryLine = pickMemoryRecallLine(language, memory, memory.learnerProfile, {
      milestoneId,
      momentId: "welcome",
      patternKey: "",
    });
    if (recall && hasCoveredTopic(memory.learnerProfile, "job") && milestoneId === "coffee") {
      return bil(
        `${recall.native}\n\n${continuity.native}`,
        `${recall.target}\n\n${continuity.target}`
      );
    }
    if (memoryLine) {
      return bil(
        `${memoryLine.native}\n\n${continuity.native}`,
        `${memoryLine.target}\n\n${continuity.target}`
      );
    }
    return bil(continuity.native, continuity.target);
  }

  if (language === "german") {
    if (milestoneId === "airport") {
      return bil(
        "到了。护照还在口袋里——边检会问几句，自然地回答就好。",
        "Du bist da. Pass noch warm — Grenze fragt kurz, antworte einfach."
      );
    }
    if (milestoneId === "arrive") {
      if (memory.daysTogether <= 1) {
        return bil(
          "早上好。今天是你搬来德国的第一天——我陪你下楼透透气，跟真实的人打个招呼。",
          "Guten Morgen. Dein erster Tag hier — ich geh mit dir runter, echte Menschen, echtes Hallo."
        );
      }
      return bil(
        `第 ${memory.daysTogether} 天了。我们再去楼下走走——昨天的感觉还在吧？`,
        `Tag ${memory.daysTogether}. Nochmal runter — das Gefühl von gestern ist noch da.`
      );
    }
    if (milestoneId === "coffee") {
      const metNeighbor = memory.completedExperiences.includes("arrive");
      return bil(
        metNeighbor
          ? "早。昨天你跟邻居聊过了——她说街角有家咖啡店。去尝尝？我跟你一起。"
          : "早。街角有家咖啡店，德国人每天早上都会去。我们一起去看看。",
        metNeighbor
          ? "Morgen. Du warst gestern mit der Nachbarin — Café an der Ecke. Probieren wir's?"
          : "Morgen. Café an der Ecke — da gehen die Leute jeden Morgen hin. Komm mit."
      );
    }
    if (milestoneId === "supermarket") {
      const hadCoffee = memory.completedExperiences.includes("coffee");
      return bil(
        hadCoffee
          ? "咖啡喝完了，家里该补货了。邻居说的那家超市——我们推着车进去，像真的住在这里一样。"
          : "今天去超市。在德国，自己买菜是日子的一部分——我陪你走一圈。",
        hadCoffee
          ? "Kaffee ist durch — Zeit einzukaufen. Rewe, wie die Nachbarin sagte. Wie Einheimische."
          : "Heute Supermarkt. Einkaufen gehört zum Leben hier — ich bin dabei."
      );
    }
  }

  // English track
  if (milestoneId === "airport") {
    return bil(
      "到了。入境这一关——自然地回答就好。",
      "You landed. Immigration — answer naturally."
    );
  }
  if (milestoneId === "arrive") {
    return bil(
      "Morning. First day in your new place — let's step outside together, like you really live here.",
      "Morning. First day — let's step outside, like you really live here."
    );
  }
  if (milestoneId === "coffee") {
    const metNeighbor = memory.completedExperiences.includes("arrive");
    return bil(
      metNeighbor
        ? "早。昨天你跟邻居聊过了——她说转角有家咖啡店。一起去？"
        : "早。转角有家咖啡店——当地人每天早上都去。我们一起去。",
      metNeighbor
        ? "Morning. You met the neighbour yesterday — café on the corner. Fancy it?"
        : "Morning. Corner café — everyone goes. Let's head over."
    );
  }
  if (milestoneId === "supermarket") {
    const hadCoffee = memory.completedExperiences.includes("coffee");
    return bil(
      hadCoffee
        ? "咖啡喝完了，该去超市了。推着车进去——就像你真的住在这里。"
        : "今天去超市。自己买菜是日子的一部分——我陪你。",
      hadCoffee
        ? "Coffee's done — time to shop. Trolley in, like you live here."
        : "Supermarket day. Part of real life — I'm with you."
    );
  }

  return bil("我们继续。", "Weiter geht's.");
}

function resumeWelcome(
  language: Language,
  milestoneId: string
): BilingualLine {
  if (language === "german") {
    const labels: Record<string, string> = {
      arrive: "楼下",
      coffee: "咖啡店",
      supermarket: "超市",
    };
    const place = labels[milestoneId] ?? "这儿";
    return bil(
      `我们接着刚才——还在${place}呢。不着急。`,
      `Wir machen weiter — noch bei ${place}. Kein Stress.`
    );
  }
  const labels: Record<string, string> = {
    arrive: "outside",
    coffee: "the café",
    supermarket: "the shop",
  };
  const place = labels[milestoneId] ?? "here";
  return bil(`我们接着刚才——还在${place}。`, `Picking up — still at ${place}.`);
}

export function getAnnaTryFirst(
  language: Language,
  memory: AnnaMemory,
  milestoneId: string,
  momentId: string,
  nativeSupport: number,
  supportLevel?: SupportLevel,
  targetPhrase?: string
): string {
  const struggled = memory.struggledPatterns.includes(`${milestoneId}:${momentId}`);
  const line = buildTryFirst(language, milestoneId, momentId, struggled, memory);
  if (supportLevel !== undefined) return resolveCoachLine(line, supportLevel, targetPhrase);
  return resolveLine(line, nativeSupport);
}
function buildTryFirst(
  language: Language,
  milestoneId: string,
  momentId: string,
  struggled: boolean,
  memory: AnnaMemory
): BilingualLine {
  const profile = memory.learnerProfile;

  if (momentId === "job_small_talk" && profile.job && hasCoveredTopic(profile, "job")) {
    return bil(
      "她问工作——你上次说过，自然地再说一次。",
      language === "german"
        ? "Job-Frage — du hast's schon mal gesagt."
        : "Work question — you said this before."
    );
  }

  if (
    milestoneId === "arrive" &&
    momentId === "introduce" &&
    hasCoveredTopic(profile, "relocation")
  ) {
    return bil(
      "她问你是不是新来的——你说过，自然地再说一次。",
      language === "german"
        ? "Neu hier — hast du schon mal gesagt."
        : "New here — you said this before."
    );
  }

  if (struggled) {
    return language === "german"
      ? bil("不着急，再试一次——我在这儿。", "Kein Stress, nochmal — ich bin da.")
      : bil("不着急，再试一次——我在这儿。", "No rush, try again — I'm here.");
  }

  const confident = memory.confidenceScore >= 65;
  const soft = confident
    ? bil("你先试试——我在。", "Versuch du's — ich warte.")
    : bil("你先试试。不用完美，我在旁边。", "Probier's. Muss nicht perfekt sein — ich bin da.");

  if (language === "german") {
    const prompts: Record<string, Record<string, BilingualLine>> = {
      arrive: {
        hello: bil("她看过来了——你先开口。", "Sie schaut rüber — du zuerst."),
        introduce: bil("她在等——你先说说。", "Sie wartet — du zuerst."),
        supermarket: bil("你想问超市——先开口试试。", "Supermarkt — du fragst zuerst."),
        thanks: bil("临走前——你先跟她说。", "Zum Gehen — du zuerst."),
      },
      coffee: {
        greet: bil("她看着你呢——你先打招呼。", "Sie schaut — du grüßt zuerst."),
        order: bil("轮到你了——先点。", "Du bist dran — du zuerst."),
        customize: bil("要加奶——你先回答。", "Milch — du antwortest zuerst."),
        pay: bil("递卡的时候——你先说一句。", "Karte — du sagst zuerst was."),
        thanks: bil("走之前——你先道谢。", "Vor dem Gehen — du zuerst."),
      },
      supermarket: {
        greet: bil("店员看过来了——你先打招呼。", "Sie schaut — du grüßt zuerst."),
        find: bil("想问牛奶在哪——你先问。", "Milch — du fragst zuerst."),
        bag: bil("要袋子——你先回答。", "Tüte — du zuerst."),
        pay: bil("付钱——你先开口。", "Zahlen — du zuerst."),
        thanks: bil("走之前——你先道谢。", "Danke — du zuerst."),
      },
    };
    return prompts[milestoneId]?.[momentId] ?? soft;
  }

  const prompts: Record<string, Record<string, BilingualLine>> = {
    arrive: {
      hello: bil("她看着你呢——你先开口。", "She's looking — you first."),
      introduce: bil("她在等——你先说。", "She's waiting — you first."),
      supermarket: bil("想问超市——你先问。", "Supermarket — you ask first."),
      thanks: bil("临走——你先说谢谢。", "Before you go — you first."),
    },
    coffee: {
      greet: bil("她看着你呢——你先打招呼。", "She's looking — greet first."),
      order: bil("轮到你了——先点。", "Your turn — order first."),
      customize: bil("加奶——你先回答。", "Milk — you answer first."),
      pay: bil("刷卡——你先说。", "Card — you first."),
      thanks: bil("走之前——你先道谢。", "Thanks — you first."),
    },
    supermarket: {
      greet: bil("店员看过来了——你先打招呼。", "Staff's looking — you first."),
      find: bil("问牛奶——你先开口。", "Milk — you ask first."),
      bag: bil("要袋子——你先回答。", "Bag — you first."),
      pay: bil("付钱——你先说。", "Pay — you first."),
      thanks: bil("走之前——你先道谢。", "Thanks — you first."),
    },
  };
  return prompts[milestoneId]?.[momentId] ?? soft;
}

export function getAnnaAfterDemo(
  language: Language,
  nativeSupport: number,
  supportLevel?: SupportLevel
): string {
  const line =
    language === "german"
      ? bil("她是这么说的。你已经很接近了。", "So sagt sie's. Du warst schon nah dran.")
      : bil("她是这么说的。你已经很接近了。", "That's what she said. You were close.");
  if (supportLevel !== undefined) return resolveCoachLine(line, supportLevel);
  return resolveLine(line, nativeSupport);
}
export function getAnnaLifeSummary(
  language: Language,
  memory: AnnaMemory,
  milestoneId: string,
  nativeSupport: number,
  supportLevel?: SupportLevel,
  livingWorld?: LivingWorldState
): string {
  const line = buildLifeSummary(language, memory, milestoneId, livingWorld);
  if (supportLevel !== undefined) return resolveCoachLine(line, supportLevel);
  return resolveLine(line, nativeSupport);
}
function buildLifeSummary(
  language: Language,
  memory: AnnaMemory,
  milestoneId: string,
  livingWorld?: LivingWorldState
): BilingualLine {
  if (livingWorld) {
    const task = getTaskCompletionSummary(language, milestoneId, livingWorld);
    const base = bil(task.native, task.target);
    if (memory.struggledPatterns.length > 0) {
      return bil(
        `${base.native} 有些地方你犹豫过——没关系，明天还在。`,
        `${base.target} Wo du gezögert hast — schon okay, morgen geht's weiter.`
      );
    }
    return base;
  }

  if (language === "german") {
    const summaries: Record<string, BilingualLine> = {
      arrive: bil(
        "今天你能在德国跟邻居打招呼、说自己新来的、问路、道谢了。这不是练习——是真的日子。明天我陪你去买咖啡。",
        "Heute kannst du Nachbarn grüßen, sagen dass du neu bist, fragen, danken. Kein Üben — echtes Leben. Morgen Kaffee."
      ),
      coffee: bil(
        "今天你能在德国自己点一杯咖啡了——打招呼、点单、加奶、付钱、道谢。明天去超市，你会用到刚才那些句式。",
        "Heute hast du allein Kaffee bestellt — grüßen, bestellen, Milch, zahlen, danke. Morgen Supermarkt — dieselben Muster."
      ),
      supermarket: bil(
        "今天你自己在德国超市买完东西了。打招呼、找货架、要袋子、结账、道谢——你又过了一天真实的生活。回家做饭吧，我明天还在。",
        "Heute hast du allein eingekauft. Gruß, finden, Tüte, zahlen, danke — wieder ein echter Tag. Kochen, ich bin morgen noch da."
      ),
    };
    const base = summaries[milestoneId] ?? bil("今天又往前了一步。", "Wieder ein Schritt weiter.");
    if (memory.struggledPatterns.length > 0) {
      return bil(
        `${base.native} 有些地方你犹豫过——没关系，我记住了，下次我少说话。`,
        `${base.target} Wo du gezögert hast — ich merk mir das, nächstes Mal bin ich leiser.`
      );
    }
    return base;
  }

  const summaries: Record<string, BilingualLine> = {
    arrive: bil(
      "今天你能跟邻居打招呼、说自己新来的、问路、道谢了——是真的日子，不是练习。明天去买咖啡？",
      "Today you greeted a neighbour, said you're new, asked directions, thanked someone. Real life. Coffee tomorrow?"
    ),
    coffee: bil(
      "今天你自己点了一杯咖啡——打招呼、点单、加奶、付钱、道谢。明天去超市会用到同样的说法。",
      "Today you ordered coffee alone — greet, order, milk, pay, thanks. Same patterns at the supermarket tomorrow."
    ),
    supermarket: bil(
      "今天你自己买完菜了。又过了一天真实的生活——回家做饭吧，我明天还在。",
      "You shopped alone today. Another real day — cook something, I'll be here tomorrow."
    ),
  };
  return summaries[milestoneId] ?? bil("今天又往前了一步。", "Another step forward.");
}

export function getPatternDiscoveryIntro(
  language: Language,
  nativeSupport: number,
  supportLevel?: SupportLevel
): string {
  const line =
    language === "german"
      ? bil(
          "你开始发现了——同样的说法，别的地方也能用：",
          "Du merkst es — dasselbe Muster, anderswo auch:"
        )
      : bil(
          "你开始发现了——同样的说法，别的地方也能用：",
          "You're noticing — same pattern, other places:"
        );
  if (supportLevel !== undefined) return resolveCoachLine(line, supportLevel);
  return resolveLine(line, nativeSupport);
}
export function getAnnaConfidenceNote(
  language: Language,
  memory: AnnaMemory
): BilingualLine | null {
  if (memory.confidenceScore >= 75) {
    return language === "german"
      ? bil("你今天很放松——我听到了。", "Du warst heute locker — hab ich gehört.")
      : bil("你今天很放松——我听到了。", "You sounded relaxed today — I noticed.");
  }
  if (memory.confidenceScore < 35) {
    return language === "german"
      ? bil("今天有点紧——正常的。我们慢慢来。", "Heute etwas angespannt — normal. Wir nehmen uns Zeit.")
      : bil("今天有点紧——正常的。我们慢慢来。", "A bit tense today — normal. We take our time.");
  }
  return null;
}
