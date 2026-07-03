import type { JourneyProgress, Language } from "./types";
import {
  EMPTY_ANNA_MEMORY,
  getAnnaMemory,
  recordExperienceComplete,
  recordSessionStart,
} from "./anna-memory";
import { updateMemory } from "./ai/conversation";
import { seedTrackDefaults, syncProfileToAnnaMemory } from "./long-term-memory";
import { EMPTY_LEARNER_PROFILE } from "./types";
import { createConversationSeed } from "./conversation-engine";
import { getFirstPlayableMilestoneId, getMilestone } from "./milestones";
import { isDynamicMilestone } from "./conversation-objectives";
import { extractNpcVisitFromMilestone } from "./conversation-brain";
import { recordNpcVisit } from "./npc-memory";
import {
  EMPTY_LIVING_WORLD,
  getWorldState,
  prepareWorldForNewSession,
  recordWorldTaskComplete,
  syncCharacterFromNpcVisit,
} from "./world-state";
import {
  EMPTY_TRANSITION,
  getPatternKey,
  recordDemonstratedUnderstanding,
} from "./transition";

function milestoneMeta(milestoneId: string) {
  const m = getMilestone("german", milestoneId);
  return {
    title: m?.title ?? "Arrive in Germany",
    totalMoments: m?.moments.length ?? 3,
  };
}

const initial = milestoneMeta(getFirstPlayableMilestoneId());

export const INITIAL_PROGRESS: JourneyProgress = {
  currentMilestoneId: getFirstPlayableMilestoneId(),
  milestoneTitle: initial.title,
  momentsCompleted: 0,
  totalMoments: initial.totalMoments,
  studyMinutes: 0,
  streakDays: 0,
  milestoneDone: false,
  completedMilestoneIds: [],
  transitionByLanguage: {
    german: { ...EMPTY_TRANSITION },
    english: { ...EMPTY_TRANSITION },
  },
  annaMemoryByLanguage: {
    german: { ...EMPTY_ANNA_MEMORY },
    english: { ...EMPTY_ANNA_MEMORY },
  },
  conversationSeed: null,
  worldByLanguage: {
    german: { ...EMPTY_LIVING_WORLD },
    english: { ...EMPTY_LIVING_WORLD },
  },
  learnerProfile: seedTrackDefaults({ ...EMPTY_LEARNER_PROFILE }, "german"),
};

export function getTransitionProfile(
  progress: JourneyProgress,
  language: Language
) {
  return progress.transitionByLanguage[language] ?? EMPTY_TRANSITION;
}

export function getAnnaMemoryFromProgress(
  progress: JourneyProgress,
  language: Language
) {
  return getAnnaMemory(progress.annaMemoryByLanguage, language);
}

export function getLivingWorldFromProgress(
  progress: JourneyProgress,
  language: Language
) {
  return getWorldState(progress.worldByLanguage, language);
}

export function beginAnnaSession(
  progress: JourneyProgress,
  language: Language,
  milestoneId: string
): JourneyProgress {
  const memory = getAnnaMemoryFromProgress(progress, language);
  const world = getLivingWorldFromProgress(progress, language);
  const keepSeed =
    progress.conversationSeed !== null &&
    progress.currentMilestoneId === milestoneId &&
    progress.momentsCompleted > 0;

  return {
    ...progress,
    conversationSeed: keepSeed ? progress.conversationSeed : createConversationSeed(),
    worldByLanguage: {
      ...progress.worldByLanguage,
      [language]: prepareWorldForNewSession(world, milestoneId),
    },
    annaMemoryByLanguage: {
      ...progress.annaMemoryByLanguage,
      [language]: syncProfileToAnnaMemory(
        recordSessionStart(memory, milestoneId),
        progress.learnerProfile
      ),
    },
  };
}

export function markMilestoneComplete(
  prev: JourneyProgress,
  language: Language,
  emotionalNote: string
): JourneyProgress {
  const alreadyDone = prev.completedMilestoneIds.includes(prev.currentMilestoneId);
  let memory = getAnnaMemoryFromProgress(prev, language);
  const world = getLivingWorldFromProgress(prev, language);
  let npcVisit: ReturnType<typeof extractNpcVisitFromMilestone> = null;

  if (prev.conversationSeed && isDynamicMilestone(prev.currentMilestoneId)) {
    const milestone = getMilestone(
      language,
      prev.currentMilestoneId,
      prev.conversationSeed,
      memory,
      world
    );
    if (milestone) {
      npcVisit = extractNpcVisitFromMilestone(milestone, language);
      if (npcVisit) {
        memory = recordNpcVisit(memory, {
          ...npcVisit,
          dayNumber: memory.daysTogether,
        });
      }
    }
  }

  let nextWorld = recordWorldTaskComplete(
    world,
    prev.currentMilestoneId,
    language
  );

  if (npcVisit && prev.currentMilestoneId === "coffee") {
    nextWorld = syncCharacterFromNpcVisit(nextWorld, "barista", "coffee", [
      "regular_order",
      npcVisit.productId,
    ]);
  }

  return {
    ...prev,
    momentsCompleted: prev.totalMoments,
    studyMinutes: Math.max(prev.studyMinutes, 8),
    streakDays: Math.max(prev.streakDays, 1),
    milestoneDone: true,
    completedMilestoneIds: alreadyDone
      ? prev.completedMilestoneIds
      : [...prev.completedMilestoneIds, prev.currentMilestoneId],
    worldByLanguage: {
      ...prev.worldByLanguage,
      [language]: nextWorld,
    },
    annaMemoryByLanguage: {
      ...prev.annaMemoryByLanguage,
      [language]: syncProfileToAnnaMemory(
        recordExperienceComplete(memory, prev.currentMilestoneId, emotionalNote, language),
        prev.learnerProfile
      ),
    },
  };
}

export interface MomentCompleteMeta {
  neededDemonstration: boolean;
  responseLatencyMs: number;
  keyPhrase: string;
  phrase?: string;
  annaIntervened?: boolean;
  npcIntent?: string | null;
}

export function advanceMoment(
  prev: JourneyProgress,
  language: Language,
  milestoneId: string,
  momentId: string,
  meta: MomentCompleteMeta
): JourneyProgress {
  const next = Math.min(prev.momentsCompleted + 1, prev.totalMoments);
  const patternKey = getPatternKey(milestoneId, momentId);
  const memory = getAnnaMemoryFromProgress(prev, language);
  const transition = getTransitionProfile(prev, language);
  const momentDef = getMilestone(language, milestoneId, prev.conversationSeed, memory)?.moments.find(
    (m) => m.id === momentId
  );
  const spokenPhrase = meta.phrase ?? momentDef?.phrase ?? meta.keyPhrase;

  const nextTransition = meta.neededDemonstration
    ? transition
    : recordDemonstratedUnderstanding(transition, patternKey);

  const { memory: nextMemory, learnerProfile: nextProfile } = updateMemory({
    memory,
    moment: {
      patternKey,
      momentId,
      keyPhrase: meta.keyPhrase,
      neededDemonstration: meta.neededDemonstration,
      responseLatencyMs: meta.responseLatencyMs,
    },
    annaIntervened: meta.annaIntervened,
    npcIntent: meta.npcIntent,
    milestoneId,
    phrase: spokenPhrase,
    learnerProfile: prev.learnerProfile,
    language,
    world: getWorldState(prev.worldByLanguage, language),
    transition,
  });

  const syncedMemory = syncProfileToAnnaMemory(nextMemory, nextProfile);

  return {
    ...prev,
    momentsCompleted: next,
    studyMinutes: Math.min(prev.studyMinutes + 1, 8),
    streakDays: prev.streakDays > 0 ? prev.streakDays : 1,
    learnerProfile: nextProfile,
    transitionByLanguage: {
      ...prev.transitionByLanguage,
      [language]: nextTransition,
    },
    annaMemoryByLanguage: {
      ...prev.annaMemoryByLanguage,
      [language]: syncedMemory,
    },
  };
}

export function advanceToNextMilestone(
  prev: JourneyProgress,
  nextMilestoneId: string,
  nextTitle: string,
  totalMoments: number
): JourneyProgress {
  return {
    ...prev,
    currentMilestoneId: nextMilestoneId,
    milestoneTitle: nextTitle,
    momentsCompleted: 0,
    totalMoments,
    studyMinutes: 0,
    milestoneDone: false,
    conversationSeed: null,
  };
}

export function resetMilestoneProgress(prev: JourneyProgress): JourneyProgress {
  return {
    ...prev,
    momentsCompleted: 0,
    studyMinutes: 0,
    milestoneDone: false,
    conversationSeed: null,
  };
}

export function syncMilestoneForLanguage(
  prev: JourneyProgress,
  language: Language,
  milestoneId: string,
  title: string,
  totalMoments: number
): JourneyProgress {
  const preservedProfile = prev.learnerProfile;
  const priorMemory = getAnnaMemoryFromProgress(prev, language);
  const priorWorld = getLivingWorldFromProgress(prev, language);

  return {
    ...prev,
    currentMilestoneId: milestoneId,
    milestoneTitle: title,
    momentsCompleted: 0,
    totalMoments,
    studyMinutes: 0,
    milestoneDone: false,
    completedMilestoneIds: [],
    transitionByLanguage: {
      ...prev.transitionByLanguage,
      [language]: { ...EMPTY_TRANSITION },
    },
    annaMemoryByLanguage: {
      ...prev.annaMemoryByLanguage,
      [language]: syncProfileToAnnaMemory(
        {
          ...EMPTY_ANNA_MEMORY,
          confidenceTrend: priorMemory.confidenceTrend,
          averageSpeakingSpeedMs: priorMemory.averageSpeakingSpeedMs,
          daysTogether: priorMemory.daysTogether,
        },
        preservedProfile
      ),
    },
    conversationSeed: null,
    worldByLanguage: {
      ...prev.worldByLanguage,
      [language]: {
        ...priorWorld,
        completedPhasesToday: [],
        completedTaskIds: [],
        isDayComplete: false,
      },
    },
    learnerProfile: preservedProfile,
  };
}

export function getProgressPercent(progress: JourneyProgress): number {
  if (progress.milestoneDone) return 100;
  return Math.round((progress.momentsCompleted / progress.totalMoments) * 100);
}

/** @deprecated alias */
export const completeScene = markMilestoneComplete;
export const completeLesson = markMilestoneComplete;
export const advanceSentence = advanceMoment;
