/**
 * Sprint 10 — Persist journey progress between sessions
 */
import { EMPTY_ANNA_MEMORY } from "./anna-memory";
import { EMPTY_LEARNER_PROFILE, type JourneyProgress, type LearnerProfile } from "./types";
import { EMPTY_LIVING_WORLD } from "./world-state";
import { initWorldClock } from "./world-clock";
import { EMPTY_TRANSITION } from "./transition";
import { INITIAL_PROGRESS } from "./progress";
import { mergeLearnerProfiles, seedTrackDefaults } from "./long-term-memory";
import { mergeLongTermMemory } from "./memory/record";

const STORAGE_KEY = "zwima-speak-progress-v2";

function normalizeWorld(raw: unknown): typeof EMPTY_LIVING_WORLD {
  const base = { ...EMPTY_LIVING_WORLD, ...initWorldClock(1) };
  if (!raw || typeof raw !== "object") return base;
  const w = raw as Partial<typeof EMPTY_LIVING_WORLD>;
  return {
    ...base,
    ...w,
    visitedLocationIds: w.visitedLocationIds ?? [],
    characterThreads: w.characterThreads ?? {},
    completedPhasesToday: w.completedPhasesToday ?? [],
    completedTaskIds: w.completedTaskIds ?? [],
    currentLocationId: w.currentLocationId ?? base.currentLocationId,
    timeOfDay: w.timeOfDay ?? base.timeOfDay,
    weather: w.weather ?? base.weather,
    isWeekend: w.isWeekend ?? base.isWeekend,
    isPublicHoliday: w.isPublicHoliday ?? false,
    holidayName: w.holidayName ?? null,
    previousLocationId: w.previousLocationId ?? null,
  };
}
function normalizeLearnerProfile(raw: unknown): LearnerProfile {
  if (!raw || typeof raw !== "object") return { ...EMPTY_LEARNER_PROFILE };
  const p = raw as Partial<LearnerProfile>;
  return {
    name: typeof p.name === "string" ? p.name : undefined,
    country: typeof p.country === "string" ? p.country : undefined,
    city: typeof p.city === "string" ? p.city : undefined,
    job: typeof p.job === "string" ? p.job : undefined,
    family: typeof p.family === "string" ? p.family : undefined,
    goals: Array.isArray(p.goals) ? p.goals.filter((g) => typeof g === "string") : [],
    hobbies: Array.isArray(p.hobbies) ? p.hobbies.filter((h) => typeof h === "string") : [],
    coveredTopics: Array.isArray(p.coveredTopics)
      ? p.coveredTopics.filter((t) => typeof t === "string")
      : [],
    lifeFacts: Array.isArray(p.lifeFacts)
      ? p.lifeFacts.filter((f) => f && typeof f === "object")
      : [],
  };
}

function normalizeAnnaMemory(raw: unknown, profile: LearnerProfile): typeof EMPTY_ANNA_MEMORY {
  const base = { ...EMPTY_ANNA_MEMORY, learnerProfile: profile };
  if (!raw || typeof raw !== "object") return base;
  const m = raw as Partial<typeof EMPTY_ANNA_MEMORY>;
  return {
    ...base,
    ...m,
    learnerProfile: mergeLearnerProfiles(
      profile,
      normalizeLearnerProfile(m.learnerProfile)
    ),
    confidenceTrend: Array.isArray(m.confidenceTrend) ? m.confidenceTrend : [],
    averageSpeakingSpeedMs:
      typeof m.averageSpeakingSpeedMs === "number" ? m.averageSpeakingSpeedMs : 0,
    npcMemories: m.npcMemories ?? {},
    patternAttempts: m.patternAttempts ?? {},
    mistakeCounts: m.mistakeCounts ?? {},
    structureSuccesses: m.structureSuccesses ?? {},
    lastNeededDemoByPattern: m.lastNeededDemoByPattern ?? {},
    explainedNpcIntents: m.explainedNpcIntents ?? [],
    struggledPatterns: m.struggledPatterns ?? [],
    confidentPatterns: m.confidentPatterns ?? [],
    completedExperiences: m.completedExperiences ?? [],
    emotionalNotes: m.emotionalNotes ?? [],
    structureMastered: m.structureMastered ?? [],
    recentLatenciesMs: m.recentLatenciesMs ?? [],
    longTerm: mergeLongTermMemory(m.longTerm),
  };
}

export function hydrateProgress(raw: unknown): JourneyProgress {
  if (!raw || typeof raw !== "object") return { ...INITIAL_PROGRESS };

  const data = raw as Partial<JourneyProgress>;
  const learnerProfile = seedTrackDefaults(
    normalizeLearnerProfile(data.learnerProfile),
    "german"
  );

  const germanMemory = normalizeAnnaMemory(
    data.annaMemoryByLanguage?.german,
    learnerProfile
  );
  const englishMemory = normalizeAnnaMemory(
    data.annaMemoryByLanguage?.english,
    learnerProfile
  );

  return {
    ...INITIAL_PROGRESS,
    ...data,
    learnerProfile: mergeLearnerProfiles(learnerProfile, germanMemory.learnerProfile),
    transitionByLanguage: {
      german: { ...EMPTY_TRANSITION, ...data.transitionByLanguage?.german },
      english: { ...EMPTY_TRANSITION, ...data.transitionByLanguage?.english },
    },
    annaMemoryByLanguage: {
      german: {
        ...germanMemory,
        learnerProfile: mergeLearnerProfiles(
          learnerProfile,
          germanMemory.learnerProfile
        ),
      },
      english: {
        ...englishMemory,
        learnerProfile: mergeLearnerProfiles(
          learnerProfile,
          englishMemory.learnerProfile
        ),
      },
    },
    worldByLanguage: {
      german: normalizeWorld(data.worldByLanguage?.german),
      english: normalizeWorld(data.worldByLanguage?.english),
    },
    completedMilestoneIds: data.completedMilestoneIds ?? [],
  };
}

export function loadProgress(): JourneyProgress {
  if (typeof window === "undefined") return { ...INITIAL_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PROGRESS };
    return hydrateProgress(JSON.parse(raw));
  } catch {
    return { ...INITIAL_PROGRESS };
  }
}

export function saveProgress(progress: JourneyProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota or private mode — session continues in memory
  }
}

export function clearPersistedProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
