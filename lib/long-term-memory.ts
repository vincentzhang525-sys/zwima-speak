/**
 * Sprint 10 — Long-term learner memory
 * Anna remembers life facts across sessions and never asks twice.
 */
import type {
  AnnaMemory,
  BilingualLine,
  ConfidenceBand,
  ConversationMoment,
  Language,
  LearnerLifeFact,
  LearnerProfile,
} from "./types";
import { bil } from "./milestones/bilingual";

export type FactExtraction = {
  topic: string;
  value: string;
  phrase?: string;
  profileField?: keyof Pick<
    LearnerProfile,
    "name" | "country" | "city" | "job" | "family" | "goals" | "hobbies"
  >;
  appendGoal?: boolean;
  appendHobby?: boolean;
};

type MomentFactRule = {
  topic: string;
  extract: (
    language: Language,
    keyPhrase: string,
    phrase: string,
    meta?: Record<string, string>
  ) => FactExtraction | null;
};

const MOMENT_FACT_RULES: Record<string, Record<string, MomentFactRule>> = {
  arrive: {
    introduce: {
      topic: "relocation",
      extract: (language, _key, phrase) => ({
        topic: "relocation",
        value: language === "german" ? "gerade eingezogen" : "just moved in",
        phrase,
      }),
    },
    hello: {
      topic: "greeting_neighbor",
      extract: (_language, _key, phrase) => ({
        topic: "greeting_neighbor",
        value: "greeted neighbor on first day",
        phrase,
      }),
    },
    supermarket: {
      topic: "ask_directions",
      extract: (language, _key, phrase) => ({
        topic: "ask_directions",
        value:
          language === "german"
            ? "asked for supermarket directions"
            : "asked for shop directions",
        phrase,
      }),
    },
  },
  coffee: {
    order: {
      topic: "coffee_order",
      extract: (_language, _key, phrase, meta) => ({
        topic: "coffee_order",
        value: meta?.productLabel ?? "regular coffee order",
        phrase,
        appendHobby: false,
      }),
    },
    customize: {
      topic: "drink_preference",
      extract: (language, _key, phrase) => ({
        topic: "drink_preference",
        value: language === "german" ? "drink customization" : "drink preference",
        phrase,
      }),
    },
    job_small_talk: {
      topic: "job",
      extract: (language, _key, phrase) => ({
        topic: "job",
        value: language === "german" ? "Fabrik" : "factory",
        phrase,
        profileField: "job",
      }),
    },
  },
  supermarket: {
    find: {
      topic: "shopping_habit",
      extract: (language, _key, phrase, meta) => ({
        topic: "shopping_habit",
        value: meta?.findItemId ?? (language === "german" ? "Einkauf" : "groceries"),
        phrase,
      }),
    },
  },
};

/** Default country/city anchors when learner starts the German track */
const TRACK_DEFAULTS: Record<
  Language,
  Pick<LearnerProfile, "country" | "city" | "goals">
> = {
  german: {
    country: "Germany",
    city: "Germany",
    goals: ["live independently in Germany"],
  },
  english: {
    country: "abroad",
    city: "new city",
    goals: ["settle into daily life abroad"],
  },
};

export function mergeLearnerProfiles(
  canonical: LearnerProfile,
  synced: LearnerProfile
): LearnerProfile {
  return {
    name: canonical.name ?? synced.name,
    country: canonical.country ?? synced.country,
    city: canonical.city ?? synced.city,
    job: canonical.job ?? synced.job,
    family: canonical.family ?? synced.family,
    goals: [...new Set([...canonical.goals, ...synced.goals])],
    hobbies: [...new Set([...canonical.hobbies, ...synced.hobbies])],
    coveredTopics: [
      ...new Set([...canonical.coveredTopics, ...synced.coveredTopics]),
    ],
    lifeFacts: dedupeLifeFacts([...canonical.lifeFacts, ...synced.lifeFacts]),
  };
}

function dedupeLifeFacts(facts: LearnerLifeFact[]): LearnerLifeFact[] {
  const seen = new Set<string>();
  const out: LearnerLifeFact[] = [];
  for (const fact of facts) {
    const key = `${fact.topic}:${fact.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(fact);
  }
  return out;
}

export function hasCoveredTopic(profile: LearnerProfile, topic: string): boolean {
  return profile.coveredTopics.includes(topic);
}

export function getLifeFact(
  profile: LearnerProfile,
  topic: string
): LearnerLifeFact | undefined {
  return profile.lifeFacts.find((f) => f.topic === topic);
}

export function extractFactsFromMoment(
  language: Language,
  milestoneId: string,
  momentId: string,
  keyPhrase: string,
  phrase: string,
  learnedOnDay: number,
  meta?: Record<string, string>
): LearnerLifeFact[] {
  const rule = MOMENT_FACT_RULES[milestoneId]?.[momentId];
  const facts: LearnerLifeFact[] = [];

  if (rule) {
    const extracted = rule.extract(language, keyPhrase, phrase, meta);
    if (extracted) {
      facts.push({
        topic: extracted.topic,
        value: extracted.value,
        phrase: extracted.phrase ?? phrase,
        learnedOnDay,
        sourceMilestone: milestoneId,
        sourceMoment: momentId,
      });
    }
  }

  if (milestoneId === "arrive" && momentId === "introduce" && !hasCoveredTopic(
    { coveredTopics: facts.map((f) => f.topic), goals: [], hobbies: [], lifeFacts: [] },
    "country"
  )) {
    const defaults = TRACK_DEFAULTS[language];
    facts.push({
      topic: "country",
      value: defaults.country ?? "Germany",
      learnedOnDay,
      sourceMilestone: milestoneId,
      sourceMoment: momentId,
    });
    facts.push({
      topic: "city",
      value: defaults.city ?? "Germany",
      learnedOnDay,
      sourceMilestone: milestoneId,
      sourceMoment: momentId,
    });
  }

  return facts;
}

export function applyLifeFacts(
  profile: LearnerProfile,
  facts: LearnerLifeFact[]
): LearnerProfile {
  if (facts.length === 0) return profile;

  let next: LearnerProfile = {
    ...profile,
    goals: [...profile.goals],
    hobbies: [...profile.hobbies],
    coveredTopics: [...profile.coveredTopics],
    lifeFacts: [...profile.lifeFacts],
  };

  for (const fact of facts) {
    if (!next.coveredTopics.includes(fact.topic)) {
      next.coveredTopics.push(fact.topic);
    }

    const existing = next.lifeFacts.findIndex(
      (f) => f.topic === fact.topic && f.value === fact.value
    );
    if (existing >= 0) {
      next.lifeFacts[existing] = fact;
    } else {
      next.lifeFacts.push(fact);
    }

    const rule = MOMENT_FACT_RULES[fact.sourceMilestone]?.[fact.sourceMoment];
    const extracted = rule?.extract("german", "", fact.phrase ?? "");

    if (extracted?.profileField) {
      const field = extracted.profileField;
      if (field === "goals" || field === "hobbies") continue;
      next = { ...next, [field]: fact.value };
    }

    if (fact.topic === "job") {
      next.job = fact.value;
    }
    if (fact.topic === "country") {
      next.country = fact.value;
    }
    if (fact.topic === "city") {
      next.city = fact.value;
    }
    if (fact.topic === "coffee_order" && fact.value) {
      if (!next.hobbies.includes("coffee")) {
        next.hobbies = [...next.hobbies, "coffee"];
      }
    }
  }

  next.lifeFacts = dedupeLifeFacts(next.lifeFacts);
  return next;
}

export function seedTrackDefaults(
  profile: LearnerProfile,
  language: Language
): LearnerProfile {
  const defaults = TRACK_DEFAULTS[language];
  return {
    ...profile,
    country: profile.country ?? defaults.country,
    city: profile.city ?? defaults.city,
    goals:
      profile.goals.length > 0
        ? profile.goals
        : [...(defaults.goals ?? [])],
  };
}

export function syncProfileToAnnaMemory(
  memory: AnnaMemory,
  profile: LearnerProfile
): AnnaMemory {
  return { ...memory, learnerProfile: profile };
}

export function recordConfidenceSnapshot(
  memory: AnnaMemory,
  band: ConfidenceBand
): AnnaMemory {
  const snapshot = {
    day: memory.daysTogether,
    score: memory.confidenceScore,
    band,
  };
  const trend = [...memory.confidenceTrend];
  const last = trend[trend.length - 1];
  if (!last || last.day !== snapshot.day || last.score !== snapshot.score) {
    trend.push(snapshot);
  }
  return {
    ...memory,
    confidenceTrend: trend.slice(-30),
  };
}

export function updateSpeakingSpeed(
  memory: AnnaMemory,
  latencyMs: number
): AnnaMemory {
  const prev = memory.averageSpeakingSpeedMs;
  const avg =
    prev <= 0 ? latencyMs : Math.round(prev * 0.75 + latencyMs * 0.25);
  return { ...memory, averageSpeakingSpeedMs: avg };
}

export function speakingPaceLabel(memory: AnnaMemory): "slow" | "normal" | "fast" {
  const avg = memory.averageSpeakingSpeedMs;
  if (avg <= 0) return memory.learningPace;
  if (avg < 1500) return "fast";
  if (avg > 2800) return "slow";
  return "normal";
}

/** Adjust moment prompts when Anna already knows this topic */
export function applyMemoryToMoment(
  moment: ConversationMoment,
  profile: LearnerProfile,
  memory: AnnaMemory,
  language: Language,
  milestoneId: string
): ConversationMoment {
  const m = { ...moment, speakPrompt: { ...moment.speakPrompt } };

  if (milestoneId === "arrive" && m.id === "introduce" && hasCoveredTopic(profile, "relocation")) {
    m.speakPrompt = bil(
      "她问你是不是新来的——你上次说过，自然地再说一次就好。",
      language === "german"
        ? "Sie fragt wieder — du hast's schon mal gesagt, ganz natürlich."
        : "She's asking again — you said this before, keep it natural."
    );
  }

  if (m.id === "job_small_talk" || m.variantMeta?.npcIntent === "ask_job") {
    if (profile.job && hasCoveredTopic(profile, "job")) {
      m.speakPrompt = bil(
        `她问你是做什么的——你上次说过在${profile.job === "Fabrik" ? "工厂" : profile.job}，自然地再说一次。`,
        language === "german"
          ? "Sie fragt nach deinem Job — du hast's schon mal gesagt, ganz locker."
          : "She's asking what you do — you told her before, say it naturally."
      );
      m.sceneBridge = bil(
        "咖啡好了。她一边拉花一边随口问：「Was machen Sie beruflich?」",
        language === "german"
          ? "Der Kaffee ist fast fertig. Nebenbei: „Was machen Sie beruflich?“"
          : "Coffee's almost ready. She asks casually: \"What do you do for work?\""
      );
    }
  }

  const patternKey = `${milestoneId}:${m.id}`;
  if (
    memory.confidentPatterns.includes(patternKey) ||
    memory.structureMastered.length > 0
  ) {
    if (hasCoveredTopic(profile, topicForMoment(milestoneId, m.id))) {
      m.speakPrompt = recallPrompt(language, profile, milestoneId, m.id) ?? m.speakPrompt;
    }
  }

  return m;
}

function topicForMoment(milestoneId: string, momentId: string): string {
  return MOMENT_FACT_RULES[milestoneId]?.[momentId]?.topic ?? momentId;
}

function recallPrompt(
  language: Language,
  profile: LearnerProfile,
  milestoneId: string,
  momentId: string
): BilingualLine | null {
  const topic = topicForMoment(milestoneId, momentId);
  const fact = getLifeFact(profile, topic);
  if (!fact) return null;

  if (topic === "job" && profile.job) {
    return bil(
      "她问工作——你上次说过，自然地再说一次。",
      language === "german"
        ? "Job-Frage — du hast's schon mal gesagt."
        : "Work question — you said this before."
    );
  }

  return bil(
    "这个你之前说过——自然地再来一次。",
    language === "german"
      ? "Das hast du schon mal gesagt — ganz natürlich."
      : "You said this before — keep it natural."
  );
}

/** Inject job small-talk beat on return coffee visit when job not yet known */
export function injectJobSmallTalkBeat(
  moments: ConversationMoment[],
  language: Language,
  profile: LearnerProfile,
  visitCount: number,
  seed: string
): ConversationMoment[] {
  if (hasCoveredTopic(profile, "job") || visitCount < 1) return moments;

  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (hash % 3 !== 0) return moments;

  const customizeIdx = moments.findIndex((m) => m.id === "customize");
  if (customizeIdx < 0) return moments;

  const jobBeat: ConversationMoment = {
    id: "job_small_talk",
    sceneBridge: bil(
      "她一边做咖啡，随口聊起来：「Was machen Sie beruflich?」",
      language === "german"
        ? "Sie rührt um und fragt nebenbei: „Was machen Sie beruflich?“"
        : "She stirs and asks casually: \"What do you do for work?\""
    ),
    npcLine:
      language === "german"
        ? "Was machen Sie beruflich?"
        : "What do you do for work?",
    phrase:
      language === "german"
        ? "Ich arbeite in einer Fabrik."
        : "I work in a factory.",
    keyPhrase: language === "german" ? "arbeite in einer Fabrik" : "work in a factory",
    speakPrompt: bil(
      "她问你是做什么的——说说你在工厂工作。",
      language === "german"
        ? "Sie will wissen, was du machst — sag, dass du in einer Fabrik arbeitest."
        : "She wants to know what you do — say you work in a factory."
    ),
    variantMeta: {
      personalityId: "warm",
      npcPace: "normal",
      npcIntent: "ask_job",
      brainBeatRole: "job_small_talk",
    },
  };

  const next = [...moments];
  next.splice(customizeIdx, 0, jobBeat);
  return next;
}

/** Anna companion copy that references remembered life */
export function getLifeRecallLine(
  language: Language,
  profile: LearnerProfile,
  memory: AnnaMemory
): BilingualLine | null {
  if (profile.job && hasCoveredTopic(profile, "job")) {
    const jobLabel =
      profile.job === "Fabrik" || profile.job === "factory"
        ? language === "german"
          ? "Fabrik"
          : "factory"
        : profile.job;
    return bil(
      `你还记得吧——你说过在${jobLabel === "Fabrik" ? "工厂" : jobLabel}工作。今天要是有人问，你已经有答案了。`,
      language === "german"
        ? `Du hast schon mal gesagt, du arbeitest in der ${jobLabel} — wenn's heute wieder kommt, hast du's.`
        : `You already said you work at the ${jobLabel} — if it comes up again, you've got it.`
    );
  }

  if (hasCoveredTopic(profile, "relocation") && memory.daysTogether > 1) {
    return bil(
      "你昨天说过刚搬来——今天的人可能已经把你当邻居了。",
      language === "german"
        ? "Gestern warst du neu — heute kennt man dich schon ein bisschen."
        : "Yesterday you were the new one — today they know you a bit."
    );
  }

  return null;
}

export function shouldSkipHeavyCoaching(
  profile: LearnerProfile,
  memory: AnnaMemory,
  milestoneId: string,
  momentId: string
): boolean {
  const topic = topicForMoment(milestoneId, momentId);
  if (!hasCoveredTopic(profile, topic)) return false;

  const patternKey = `${milestoneId}:${momentId}`;
  return (
    memory.confidentPatterns.includes(patternKey) ||
    (memory.mistakeCounts[patternKey] ?? 0) <= 1
  );
}

export function applyLifeMemoryToMilestone(
  milestone: import("./types").LifeMilestone,
  memory: AnnaMemory,
  language: Language
): import("./types").LifeMilestone {
  const profile = memory.learnerProfile;
  const moments = milestone.moments.map((moment) =>
    applyMemoryToMoment(moment, profile, memory, language, milestone.id)
  );

  let opening = milestone.opening;
  const recall = getLifeRecallLine(language, profile, memory);
  if (recall && memory.daysTogether > 1) {
    opening = bil(
      `${recall.native}\n\n${milestone.opening.native}`,
      `${recall.target}\n\n${milestone.opening.target}`
    );
  }

  return { ...milestone, opening, moments };
}
