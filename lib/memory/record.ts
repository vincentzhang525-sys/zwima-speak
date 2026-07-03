/**
 * Sprint 11 — Record long-term memory from each moment and milestone
 */
import type {
  AnnaMemory,
  EmotionalMemory,
  Language,
  LearnerProfile,
  LearnerPersonalityMemory,
  LifeEventMemory,
  LongTermMemory,
  PhraseMistakeMemory,
} from "../types";
import { EMPTY_LONG_TERM_MEMORY } from "../types";

const WATCH_PHRASES = [
  "bitte",
  "please",
  "danke",
  "thank",
  "entschuldigung",
  "excuse me",
  "vielen dank",
  "thanks",
];

const TOPIC_LABELS: Record<string, string> = {
  coffee: "coffee",
  supermarket: "groceries",
  arrive: "neighbors",
  airport: "travel",
  train: "transit",
  bus: "transit",
  bank: "banking",
  doctor: "health",
  buergeramt: "bureaucracy",
  work: "work",
  apartment: "home",
};

export function mergeLongTermMemory(raw: Partial<LongTermMemory> | undefined): LongTermMemory {
  if (!raw) return { ...EMPTY_LONG_TERM_MEMORY };
  return {
    phraseMistakes: Array.isArray(raw.phraseMistakes) ? raw.phraseMistakes : [],
    conversationSummaries: Array.isArray(raw.conversationSummaries)
      ? raw.conversationSummaries
      : [],
    favoriteTopics: Array.isArray(raw.favoriteTopics) ? raw.favoriteTopics : [],
    learnerPersonality: Array.isArray(raw.learnerPersonality) ? raw.learnerPersonality : [],
    emotionalHistory: Array.isArray(raw.emotionalHistory) ? raw.emotionalHistory : [],
    successfulHighlights: Array.isArray(raw.successfulHighlights) ? raw.successfulHighlights : [],
    lifeEvents: Array.isArray(raw.lifeEvents) ? raw.lifeEvents : [],
  };
}

export interface MomentMemoryInput {
  language: Language;
  milestoneId: string;
  momentId: string;
  patternKey: string;
  keyPhrase: string;
  phrase: string;
  neededDemonstration: boolean;
  responseLatencyMs: number;
  learnerProfile: LearnerProfile;
}

export function recordMomentMemory(
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  let ltm = mergeLongTermMemory(memory.longTerm);

  ltm = recordPhraseMistakes(ltm, memory, input);
  ltm = recordEmotionalBeat(ltm, memory, input);
  ltm = inferLearnerPersonality(ltm, memory, input);
  ltm = updateFavoriteTopics(ltm, memory, input);
  ltm = recordSuccessHighlight(ltm, memory, input);
  ltm = syncLifeEvents(ltm, memory, input);

  return trimLongTerm(ltm);
}

export function recordMilestoneMemory(
  memory: AnnaMemory,
  milestoneId: string,
  language: Language
): LongTermMemory {
  let ltm = mergeLongTermMemory(memory.longTerm);

  const summary = summarizeMilestone(milestoneId, memory, language);
  if (summary) {
    const entry = {
      day: memory.daysTogether,
      milestoneId,
      summary: summary.internal,
      highlight: summary.highlight,
    };
    const existing = ltm.conversationSummaries.findIndex(
      (c) => c.milestoneId === milestoneId && c.day === memory.daysTogether
    );
    if (existing >= 0) {
      ltm.conversationSummaries[existing] = entry;
    } else {
      ltm.conversationSummaries = [...ltm.conversationSummaries, entry].slice(-20);
    }
  }

  ltm = updateFavoriteTopics(ltm, memory, {
    language,
    milestoneId,
    momentId: "",
    patternKey: "",
    keyPhrase: "",
    phrase: "",
    neededDemonstration: false,
    responseLatencyMs: 0,
    learnerProfile: memory.learnerProfile,
  });

  return trimLongTerm(ltm);
}

function recordPhraseMistakes(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  const haystack = `${input.keyPhrase} ${input.phrase}`.toLowerCase();
  const mistakes = [...ltm.phraseMistakes];

  for (const watch of WATCH_PHRASES) {
    if (!haystack.includes(watch)) continue;

    const idx = mistakes.findIndex((m) => m.phrase === watch);
    if (input.neededDemonstration) {
      if (idx >= 0) {
        mistakes[idx] = {
          ...mistakes[idx],
          count: mistakes[idx].count + 1,
          lastDay: memory.daysTogether,
          resolved: false,
        };
      } else {
        mistakes.push({
          phrase: watch,
          count: 1,
          firstDay: memory.daysTogether,
          lastDay: memory.daysTogether,
          resolved: false,
        });
      }
    } else if (idx >= 0 && mistakes[idx].count >= 1) {
      mistakes[idx] = { ...mistakes[idx], resolved: true, lastDay: memory.daysTogether };
    }
  }

  return { ...ltm, phraseMistakes: mistakes };
}

function recordEmotionalBeat(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  let tone: EmotionalMemory["tone"] = "calm";
  let note = "steady moment";

  if (input.neededDemonstration) {
    tone = memory.repeatedMistakes >= 2 ? "frustrated" : "hesitant";
    note = "needed a nudge";
  } else if (input.responseLatencyMs < 1400) {
    tone = "proud";
    note = "answered quickly";
  } else if (memory.lastConfidenceBand === "confident") {
    tone = "breakthrough";
    note = "growing confidence";
  } else if (memory.lastConfidenceBand === "nervous") {
    tone = "nervous";
    note = "still cautious";
  }

  const history = [...ltm.emotionalHistory];
  const last = history[history.length - 1];
  if (!last || last.tone !== tone || last.day !== memory.daysTogether) {
    history.push({ day: memory.daysTogether, tone, note });
  }

  return { ...ltm, emotionalHistory: history.slice(-24) };
}

function inferLearnerPersonality(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  const avgLatency = memory.averageSpeakingSpeedMs || input.responseLatencyMs;
  const mistakeRate =
    Object.values(memory.mistakeCounts).reduce((a, b) => a + b, 0) /
    Math.max(1, Object.keys(memory.patternAttempts).length);

  let trait: LearnerPersonalityMemory["trait"] = "steady";
  let strength = 0.5;

  if (avgLatency > 2800 || memory.lastConfidenceBand === "nervous") {
    trait = "hesitant";
    strength = 0.7;
  } else if (avgLatency < 1600 && mistakeRate < 0.4) {
    trait = "bold";
    strength = 0.65;
  } else if (mistakeRate > 0.6 || memory.repeatedMistakes >= 3) {
    trait = "perfectionist";
    strength = 0.6;
  } else if (memory.learningPace === "slow") {
    trait = "quiet";
    strength = 0.55;
  }

  const personality: LearnerPersonalityMemory[] = [
    { trait, strength, updatedDay: memory.daysTogether },
  ];

  return { ...ltm, learnerPersonality: personality };
}

function updateFavoriteTopics(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  const scores: Record<string, number> = {};

  for (const id of memory.completedExperiences) {
    const label = TOPIC_LABELS[id] ?? id;
    scores[label] = (scores[label] ?? 0) + 3;
  }

  for (const topic of input.learnerProfile.coveredTopics) {
    scores[topic] = (scores[topic] ?? 0) + 2;
  }

  for (const hobby of input.learnerProfile.hobbies) {
    scores[hobby] = (scores[hobby] ?? 0) + 2;
  }

  if (input.milestoneId) {
    const label = TOPIC_LABELS[input.milestoneId] ?? input.milestoneId;
    scores[label] = (scores[label] ?? 0) + 1;
  }

  const favoriteTopics = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);

  return { ...ltm, favoriteTopics };
}

function recordSuccessHighlight(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  if (input.neededDemonstration) return ltm;

  const highlights = [...ltm.successfulHighlights];
  const highlight = momentHighlight(input.milestoneId, input.momentId, input.language);

  if (
    highlight &&
    memory.confidentPatterns.includes(input.patternKey) &&
    !highlights.includes(highlight)
  ) {
    highlights.push(highlight);
  }

  if (
    !input.neededDemonstration &&
    input.responseLatencyMs < 1800 &&
    highlight &&
    !highlights.includes(highlight)
  ) {
    highlights.push(highlight);
  }

  return { ...ltm, successfulHighlights: highlights.slice(-12) };
}

function syncLifeEvents(
  ltm: LongTermMemory,
  memory: AnnaMemory,
  input: MomentMemoryInput
): LongTermMemory {
  const events = [...ltm.lifeEvents];

  for (const fact of input.learnerProfile.lifeFacts) {
    const summary = `${fact.topic}: ${fact.value}`;
    const exists = events.some(
      (e) => e.topic === fact.topic && e.summary === summary
    );
    if (!exists) {
      events.push({
        day: fact.learnedOnDay,
        topic: fact.topic,
        summary,
        milestoneId: fact.sourceMilestone,
      });
    }
  }

  return { ...ltm, lifeEvents: events.slice(-30) };
}

function momentHighlight(
  milestoneId: string,
  momentId: string,
  language: Language
): string | null {
  if (milestoneId === "coffee" && momentId === "order") {
    return language === "german" ? "ordered coffee confidently" : "ordered coffee confidently";
  }
  if (milestoneId === "coffee" && momentId === "customize") {
    return "customized a drink naturally";
  }
  if (milestoneId === "arrive" && momentId === "hello") {
    return language === "german" ? "greeted neighbor naturally" : "greeted neighbor naturally";
  }
  if (milestoneId === "supermarket" && momentId === "find") {
    return "asked for directions in a shop";
  }
  if (milestoneId === "airport") {
    return "handled airport conversation";
  }
  return null;
}

function summarizeMilestone(
  milestoneId: string,
  memory: AnnaMemory,
  language: Language
): { internal: string; highlight?: string } | null {
  const label = TOPIC_LABELS[milestoneId] ?? milestoneId;
  const confident = memory.confidentPatterns.filter((p) => p.startsWith(`${milestoneId}:`)).length;
  const struggled = memory.struggledPatterns.filter((p) => p.startsWith(`${milestoneId}:`)).length;

  if (language === "german") {
    if (struggled > confident) {
      return { internal: `${label} session — needed support, stayed in the conversation` };
    }
    return {
      internal: `${label} session — moved through naturally`,
      highlight: confident > 0 ? `comfortable with ${label}` : undefined,
    };
  }

  if (struggled > confident) {
    return { internal: `${label} session — needed support, stayed present` };
  }
  return {
    internal: `${label} session — flowed naturally`,
    highlight: confident > 0 ? `comfortable with ${label}` : undefined,
  };
}

function trimLongTerm(ltm: LongTermMemory): LongTermMemory {
  return {
    ...ltm,
    phraseMistakes: ltm.phraseMistakes.slice(-20),
    conversationSummaries: ltm.conversationSummaries.slice(-20),
    emotionalHistory: ltm.emotionalHistory.slice(-24),
    successfulHighlights: ltm.successfulHighlights.slice(-12),
    lifeEvents: ltm.lifeEvents.slice(-30),
  };
}
