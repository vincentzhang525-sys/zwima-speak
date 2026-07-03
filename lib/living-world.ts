/**
 * Sprint 8 — Living World
 * The learner lives in Germany. Every scene is a real-life task on one continuous day.
 */
import type { Language } from "./types";

export type DayPhase =
  | "morning"
  | "coffee"
  | "groceries"
  | "transit"
  | "home";

export interface LifeObjective {
  milestoneId: string;
  dayPhase: DayPhase;
  /** What the learner is actually doing — not learning */
  task: Record<Language, string>;
  taskShort: Record<Language, string>;
  /** Anna's success line — task completed, not "you learned" */
  annaTaskComplete: Record<Language, string>;
  annaTaskCompleteNative: Record<Language, string>;
  nextPhase: DayPhase | null;
  characterId?: string;
  characterRole?: Record<Language, string>;
  remembers?: string[];
}

/** One continuous day in Germany */
export const DAY_FLOW: DayPhase[] = [
  "morning",
  "coffee",
  "groceries",
  "transit",
  "home",
];

export const MILESTONE_TO_PHASE: Record<string, DayPhase> = {
  airport: "morning",
  arrive: "morning",
  coffee: "coffee",
  supermarket: "groceries",
  bus: "transit",
  train: "transit",
  bank: "transit",
  doctor: "transit",
  work: "transit",
  apartment: "home",
  buergeramt: "morning",
  driving: "transit",
  family: "home",
};

export const PHASE_TO_MILESTONE: Partial<Record<DayPhase, string>> = {
  morning: "arrive",
  coffee: "coffee",
  groceries: "supermarket",
  transit: "train",
};

export const LIFE_OBJECTIVES: Record<string, LifeObjective> = {
  airport: {
    milestoneId: "airport",
    dayPhase: "morning",
    task: {
      german: "Durch die Einreise kommen",
      english: "Get through immigration",
    },
    taskShort: { german: "Flughafen", english: "Airport" },
    annaTaskComplete: {
      german: "Du bist in Deutschland angekommen.",
      english: "You landed.",
    },
    annaTaskCompleteNative: {
      german: "入境办完了——欢迎来到德国。",
      english: "Immigration done — welcome.",
    },
    nextPhase: "morning",
    characterId: "border_officer",
    characterRole: { german: "Grenzbeamter", english: "border officer" },
    remembers: ["landed_germany"],
  },
  arrive: {
    milestoneId: "arrive",
    dayPhase: "morning",
    task: {
      german: "Mit den Nachbarn klarkommen und dich orientieren",
      english: "Meet the neighbours and get your bearings",
    },
    taskShort: { german: "Morgen draußen", english: "Morning outside" },
    annaTaskComplete: {
      german: "Du hast den Morgen draußen geschafft.",
      english: "You got through the morning outside.",
    },
    annaTaskCompleteNative: {
      german: "早上的事办完了——你跟邻居打过招呼，也知道超市在哪了。",
      english: "Morning done — you met the neighbour and know where to shop.",
    },
    nextPhase: "coffee",
    characterId: "neighbor",
    characterRole: { german: "Nachbarin", english: "neighbour" },
    remembers: ["new_in_building", "asked_directions"],
  },
  coffee: {
    milestoneId: "coffee",
    dayPhase: "coffee",
    task: {
      german: "Kaffee kaufen",
      english: "Buy coffee",
    },
    taskShort: { german: "Kaffee kaufen", english: "Buy coffee" },
    annaTaskComplete: {
      german: "Du hast deinen Kaffee.",
      english: "You got your coffee.",
    },
    annaTaskCompleteNative: {
      german: "咖啡买到了——今天这件小事办完了。",
      english: "Coffee's yours — that errand's done.",
    },
    nextPhase: "groceries",
    characterId: "barista",
    characterRole: { german: "Barista", english: "barista" },
    remembers: ["regular_order"],
  },
  supermarket: {
    milestoneId: "supermarket",
    dayPhase: "groceries",
    task: {
      german: "Lebensmittel einkaufen",
      english: "Buy groceries",
    },
    taskShort: { german: "Einkaufen", english: "Buy groceries" },
    annaTaskComplete: {
      german: "Du hast eingekauft und bezahlt.",
      english: "You shopped and paid.",
    },
    annaTaskCompleteNative: {
      german: "菜买好了，钱也付了——今天采购搞定。",
      english: "Groceries bought, paid for — shopping done.",
    },
    nextPhase: "home",
    characterId: "cashier",
    characterRole: { german: "Kassiererin", english: "cashier" },
    remembers: ["checkout_done"],
  },
  train: {
    milestoneId: "train",
    dayPhase: "transit",
    task: {
      german: "Mit dem Zug fahren",
      english: "Take the train",
    },
    taskShort: { german: "Zug fahren", english: "Take the train" },
    annaTaskComplete: {
      german: "Du bist angekommen.",
      english: "You made it there.",
    },
    annaTaskCompleteNative: {
      german: "到站了——今天这段路走完了。",
      english: "You arrived — that trip's done.",
    },
    nextPhase: "home",
    characterId: "ticket_clerk",
    characterRole: { german: "Schaltermitarbeiter", english: "ticket clerk" },
    remembers: ["route_asked"],
  },
  bus: {
    milestoneId: "bus",
    dayPhase: "transit",
    task: {
      german: "Mit dem Bus fahren",
      english: "Take the bus",
    },
    taskShort: { german: "Bus fahren", english: "Take the bus" },
    annaTaskComplete: {
      german: "Du bist mit dem Bus angekommen.",
      english: "You arrived by bus.",
    },
    annaTaskCompleteNative: {
      german: "公交坐完了——今天这段路走完了。",
      english: "Bus ride done — that leg's complete.",
    },
    nextPhase: "transit",
    characterId: "bus_driver",
    characterRole: { german: "Busfahrer", english: "bus driver" },
    remembers: ["bus_route"],
  },
  bank: {
    milestoneId: "bank",
    dayPhase: "transit",
    task: {
      german: "Bankgeschäfte erledigen",
      english: "Handle your banking",
    },
    taskShort: { german: "Bank", english: "Bank" },
    annaTaskComplete: {
      german: "Bank erledigt.",
      english: "Banking done.",
    },
    annaTaskCompleteNative: {
      german: "银行的事办完了。",
      english: "Bank errand done.",
    },
    nextPhase: "home",
    characterId: "bank_clerk",
    characterRole: { german: "Bankberater", english: "bank clerk" },
  },
  doctor: {
    milestoneId: "doctor",
    dayPhase: "transit",
    task: {
      german: "Symptome erklären",
      english: "Explain your symptoms",
    },
    taskShort: { german: "Arzt", english: "Doctor" },
    annaTaskComplete: {
      german: "Du hast deine Symptome erklärt.",
      english: "You explained your symptoms.",
    },
    annaTaskCompleteNative: {
      german: "症状说清楚了——医生听懂了。",
      english: "Symptoms explained — the doctor understood.",
    },
    nextPhase: "home",
    characterId: "doctor",
    characterRole: { german: "Arzt", english: "doctor" },
  },
  work: {
    milestoneId: "work",
    dayPhase: "transit",
    task: {
      german: "Das Vorstellungsgespräch überstehen",
      english: "Get through the job interview",
    },
    taskShort: { german: "Job", english: "Job interview" },
    annaTaskComplete: {
      german: "Du hast das Gespräch geschafft.",
      english: "You got through the interview.",
    },
    annaTaskCompleteNative: {
      german: "面试撑下来了——不管结果怎样，你今天做到了。",
      english: "Interview done — whatever happens, you showed up today.",
    },
    nextPhase: "home",
    characterId: "interviewer",
    characterRole: { german: "Personaler", english: "interviewer" },
  },
  apartment: {
    milestoneId: "apartment",
    dayPhase: "home",
    task: {
      german: "Eine Wohnung finden",
      english: "Find an apartment",
    },
    taskShort: { german: "Wohnung", english: "Apartment" },
    annaTaskComplete: {
      german: "Besichtigung geschafft.",
      english: "Viewing done.",
    },
    annaTaskCompleteNative: {
      german: "看房结束了。",
      english: "Apartment viewing done.",
    },
    nextPhase: "home",
    characterId: "landlord",
    characterRole: { german: "Vermieter", english: "landlord" },
  },
  buergeramt: {
    milestoneId: "buergeramt",
    dayPhase: "morning",
    task: {
      german: "Anmeldung erledigen",
      english: "Complete your registration",
    },
    taskShort: { german: "Bürgeramt", english: "City hall" },
    annaTaskComplete: {
      german: "Termin geschafft.",
      english: "Appointment done.",
    },
    annaTaskCompleteNative: {
      german: "市政厅的事办完了。",
      english: "City hall appointment done.",
    },
    nextPhase: "coffee",
    characterId: "clerk",
    characterRole: { german: "Sachbearbeiter", english: "clerk" },
  },
  driving: {
    milestoneId: "driving",
    dayPhase: "transit",
    task: {
      german: "Auto ummelden",
      english: "Handle the car paperwork",
    },
    taskShort: { german: "Auto", english: "Driving" },
    annaTaskComplete: {
      german: "Erledigt.",
      english: "Done.",
    },
    annaTaskCompleteNative: {
      german: "车的事办完了。",
      english: "Car paperwork done.",
    },
    nextPhase: "home",
  },
  family: {
    milestoneId: "family",
    dayPhase: "home",
    task: {
      german: "Schule und Kita klären",
      english: "Sort out school and childcare",
    },
    taskShort: { german: "Schule", english: "School" },
    annaTaskComplete: {
      german: "Gespräch geschafft.",
      english: "Meeting done.",
    },
    annaTaskCompleteNative: {
      german: "学校的事谈完了。",
      english: "School meeting done.",
    },
    nextPhase: "home",
    characterId: "teacher",
    characterRole: { german: "Lehrerin", english: "teacher" },
  },
};

export function getLifeObjective(milestoneId: string): LifeObjective {
  return (
    LIFE_OBJECTIVES[milestoneId] ?? {
      milestoneId,
      dayPhase: MILESTONE_TO_PHASE[milestoneId] ?? "morning",
      task: { german: "Den Tag leben", english: "Live the day" },
      taskShort: { german: "Weiter", english: "Continue" },
      annaTaskComplete: { german: "Geschafft.", english: "Done." },
      annaTaskCompleteNative: { german: "办完了。", english: "Done." },
      nextPhase: null,
    }
  );
}

export function isEndOfPlayableDay(milestoneId: string, livingDay = 1): boolean {
  if (livingDay <= 1) return milestoneId === "supermarket";
  return milestoneId === "work";
}

export function getPhaseLabel(phase: DayPhase, language: Language): string {
  const labels: Record<DayPhase, Record<Language, string>> = {
    morning: { german: "Morgen", english: "Morning" },
    coffee: { german: "Kaffee", english: "Coffee" },
    groceries: { german: "Einkaufen", english: "Groceries" },
    transit: { german: "Unterwegs", english: "On the way" },
    home: { german: "Zuhause", english: "Home" },
  };
  return labels[phase][language];
}

export function getDayBridgeLine(
  language: Language,
  completedPhases: DayPhase[],
  milestoneId: string,
  livingDay: number
): { native: string; target: string } | null {
  const objective = getLifeObjective(milestoneId);
  const prev = completedPhases[completedPhases.length - 1];

  if (language === "german") {
    if (milestoneId === "airport") {
      return {
        native: "欢迎来到德国——从机场开始。",
        target: "Willkommen in Deutschland — Start am Flughafen.",
      };
    }
    if (milestoneId === "arrive" && prev === "morning") {
      return {
        native: "入境办完了——现在去你的公寓楼下。",
        target: "Einreise geschafft — jetzt zur Wohnung.",
      };
    }
    if (milestoneId === "coffee" && prev === "morning") {
      return {
        native: "楼下的事办完了——现在去街角买咖啡。还是同一天。",
        target: "Morgen draußen erledigt — jetzt Kaffee an der Ecke. Derselbe Tag.",
      };
    }
    if (milestoneId === "supermarket" && prev === "coffee") {
      return {
        native: "咖啡在手——接下来去超市买菜。",
        target: "Kaffee da — als Nächstes einkaufen.",
      };
    }
    if (milestoneId === "bus" && prev === "groceries") {
      return {
        native: "菜买好了——去坐公交。",
        target: "Einkauf fertig — jetzt mit dem Bus.",
      };
    }
    if (milestoneId === "train" && prev === "transit") {
      return {
        native: "菜买好了——现在要坐车去目的地。",
        target: "Einkauf fertig — jetzt zum Bus.",
      };
    }
    if (livingDay > 1 && milestoneId === "arrive") {
      return {
        native: `第 ${livingDay} 天。新的一天，从楼下开始。`,
        target: `Tag ${livingDay}. Neuer Tag — wieder runter.`,
      };
    }
    return null;
  }

  if (milestoneId === "airport") {
    return {
      native: "欢迎来到德国——从机场开始。",
      target: "Welcome — starting at the airport.",
    };
  }
  if (milestoneId === "arrive" && prev === "morning") {
    return {
      native: "入境办完了——去你的公寓。",
      target: "Immigration done — head to your flat.",
    };
  }
  if (milestoneId === "coffee" && prev === "morning") {
    return {
      native: "楼下的事办完了——去买杯咖啡。还是同一天。",
      target: "Morning outside done — coffee next. Same day.",
    };
  }
  if (milestoneId === "supermarket" && prev === "coffee") {
    return {
      native: "咖啡喝完了——去超市买菜。",
      target: "Coffee done — groceries next.",
    };
  }
  if (milestoneId === "bus" && prev === "groceries") {
    return {
      native: "买好了——去坐公交。",
      target: "Shopping done — bus next.",
    };
  }
  if (milestoneId === "train" && prev === "transit") {
    return {
      native: "买好了——坐车去目的地。",
      target: "Shopping done — bus next.",
    };
  }
  if (livingDay > 1 && milestoneId === "arrive") {
    return {
      native: `第 ${livingDay} 天。新的一天。`,
      target: `Day ${livingDay}. New day.`,
    };
  }
  return null;
}

export function getTaskOpeningLine(
  language: Language,
  milestoneId: string,
  livingDay: number
): { native: string; target: string } {
  const obj = getLifeObjective(milestoneId);
  if (language === "german") {
    if (livingDay <= 1 && milestoneId === "airport") {
      return {
        native: `第 ${livingDay} 天。你刚落地德国。`,
        target: `Tag ${livingDay}. Gerade gelandet.`,
      };
    }
    if (livingDay <= 1 && milestoneId === "arrive") {
      return {
        native: `今天是你在德国的第一天。早上，下楼走走。`,
        target: `Erster Tag. Morgen — runter gehen.`,
      };
    }
    return {
      native: `今天：${obj.taskShort.german}。`,
      target: `Heute: ${obj.task.german}.`,
    };
  }
  if (livingDay <= 1 && milestoneId === "arrive") {
    return {
      native: `搬来第一天。早上，下楼走走。`,
      target: `First day. Morning — step outside.`,
    };
  }
  return {
    native: `今天：${obj.taskShort.english}。`,
    target: `Today: ${obj.task.english}.`,
  };
}

export function getTaskCompletionSummary(
  language: Language,
  milestoneId: string,
  world: { livingDay: number; isDayComplete: boolean }
): { native: string; target: string } {
  const obj = getLifeObjective(milestoneId);
  let native = obj.annaTaskCompleteNative[language];
  let target = obj.annaTaskComplete[language];

  if (world.isDayComplete && milestoneId === "supermarket") {
    if (language === "german") {
      native = `${native}\n\n今天结束了。回家做饭吧——明天又是新的一天。`;
      target = `${target}\n\nTag vorbei. Nach Hause kochen — morgen geht's weiter.`;
    } else {
      native = `${native}\n\n今天结束了。回家吧——明天继续。`;
      target = `${target}\n\nDay's done. Head home — tomorrow continues.`;
    }
  } else if (milestoneId === "arrive") {
    if (language === "german") {
      native = `${native}\n\n同一天还没结束——街角买杯咖啡？`;
      target = `${target}\n\nDer Tag geht weiter — Kaffee an der Ecke?`;
    } else {
      native = `${native}\n\n同一天还没结束——去买杯咖啡？`;
      target = `${target}\n\nSame day — coffee next?`;
    }
  } else if (milestoneId === "coffee") {
    if (language === "german") {
      native = `${native}\n\n接下来去超市——还是今天。`;
      target = `${target}\n\nAls Nächstes Supermarkt — noch heute.`;
    } else {
      native = `${native}\n\n接下来去超市。`;
      target = `${target}\n\nSupermarket next — still today.`;
    }
  }

  return { native, target };
}

export function getContinuityWelcome(
  language: Language,
  milestoneId: string,
  world: { livingDay: number; completedPhasesToday: DayPhase[]; characterThreads: Record<string, { interactionCount: number; remembers: string[] }> },
  memory: { completedExperiences: string[]; daysTogether: number }
): { native: string; target: string } {
  const bridge = getDayBridgeLine(
    language,
    world.completedPhasesToday,
    milestoneId,
    world.livingDay
  );
  const task = getTaskOpeningLine(language, milestoneId, world.livingDay);

  const neighbor = world.characterThreads.neighbor;
  const barista = world.characterThreads.barista;

  if (milestoneId === "coffee" && neighbor && neighbor.interactionCount > 0) {
    if (language === "german") {
      return {
        native: bridge
          ? `${bridge.native}\n邻居说的那家店——一起去喝杯咖啡。`
          : `邻居说的那家店——一起去喝杯咖啡。`,
        target: bridge
          ? `${bridge.target}\nCafé, wie die Nachbarin sagte.`
          : "Café, wie die Nachbarin sagte.",
      };
    }
  }

  if (milestoneId === "supermarket" && barista && barista.interactionCount > 0) {
    if (language === "german") {
      return {
        native: `${bridge?.native ?? "咖啡喝完了。"}\n一起去超市补货。`,
        target: `${bridge?.target ?? "Kaffee ist durch."}\nSupermarkt.`,
      };
    }
  }

  if (bridge) {
    return {
      native: `${bridge.native}\n${task.native}`,
      target: `${bridge.target}\n${task.target}`,
    };
  }

  return task;
}

export function getCharacterWorldRecall(
  language: Language,
  characterId: string,
  thread: { interactionCount: number; remembers: string[]; lastMetDay: number },
  currentDay: number
): string | null {
  if (thread.interactionCount < 1) return null;
  const sameDay = thread.lastMetDay === currentDay;

  if (characterId === "barista" && thread.remembers.includes("regular_order")) {
    return language === "german"
      ? "Guten Morgen. Heute wieder dasselbe?"
      : "Good morning. Same again today?";
  }
  if (characterId === "neighbor" && !sameDay && currentDay > thread.lastMetDay) {
    return language === "german"
      ? "Guten Morgen! Gut geschlafen?"
      : "Good morning! Sleep well?";
  }
  if (characterId === "cashier" && thread.interactionCount >= 2) {
    return language === "german"
      ? "Ah, Sie wieder!"
      : "Oh, you again!";
  }
  return null;
}
