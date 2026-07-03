/**
 * Sprint 11 — World State
 * Germany as a connected map — locations, time, weather, NPC memory.
 */
import type { GermanyLocationId, Language, LivingWorldState } from "./types";
import { getLocationForMilestone, resolveVenueId } from "./germany-map";
import {
  getLifeObjective,
  isEndOfPlayableDay,
  type DayPhase,
} from "./living-world";
import { initWorldClock, advanceWorldClock } from "./world-clock";

export const EMPTY_LIVING_WORLD: LivingWorldState = {
  livingDay: 1,
  currentPhase: "morning",
  completedPhasesToday: [],
  completedTaskIds: [],
  isDayComplete: false,
  characterThreads: {},
  currentLocationId: "airport",
  visitedLocationIds: [],
  previousLocationId: null,
  ...initWorldClock(1),
};

export function getWorldState(
  worldByLanguage: Record<Language, LivingWorldState>,
  language: Language
): LivingWorldState {
  return worldByLanguage[language] ?? { ...EMPTY_LIVING_WORLD };
}

export function travelToMilestone(
  world: LivingWorldState,
  milestoneId: string
): LivingWorldState {
  const nextLocation = getLocationForMilestone(milestoneId);
  const visited = world.visitedLocationIds.includes(nextLocation)
    ? world.visitedLocationIds
    : [...world.visitedLocationIds, nextLocation];

  return {
    ...world,
    previousLocationId: world.currentLocationId,
    currentLocationId: nextLocation,
    visitedLocationIds: visited,
  };
}

export function recordWorldTaskComplete(
  world: LivingWorldState,
  milestoneId: string,
  _language: Language
): LivingWorldState {
  const objective = getLifeObjective(milestoneId);
  const completedPhases = world.completedPhasesToday.includes(objective.dayPhase)
    ? world.completedPhasesToday
    : [...world.completedPhasesToday, objective.dayPhase];

  const completedTasks = world.completedTaskIds.includes(milestoneId)
    ? world.completedTaskIds
    : [...world.completedTaskIds, milestoneId];

  let next = travelToMilestone(world, milestoneId);
  next = advanceWorldClock(next, milestoneId);

  let characterThreads = { ...next.characterThreads };
  if (objective.characterId) {
    const prev = characterThreads[objective.characterId];
    const locationId = getLocationForMilestone(milestoneId);
    characterThreads = {
      ...characterThreads,
      [objective.characterId]: {
        characterId: objective.characterId,
        role: objective.characterRole?.german ?? objective.characterId,
        firstMetMilestone: prev?.firstMetMilestone ?? milestoneId,
        lastMetMilestone: milestoneId,
        lastMetDay: next.livingDay,
        interactionCount: (prev?.interactionCount ?? 0) + 1,
        remembers: [
          ...new Set([
            ...(prev?.remembers ?? []),
            ...(objective.remembers ?? []),
            `visited_${locationId}`,
          ]),
        ],
      },
    };
  }

  const isDayComplete = isEndOfPlayableDay(milestoneId, next.livingDay);
  const nextPhase: DayPhase = isDayComplete
    ? "home"
    : (objective.nextPhase ?? next.currentPhase);

  if (isDayComplete) {
    next = { ...next, currentLocationId: "apartment" };
  }

  return {
    ...next,
    currentPhase: nextPhase,
    completedPhasesToday: completedPhases,
    completedTaskIds: completedTasks,
    isDayComplete,
    characterThreads,
  };
}

export function prepareWorldForNewSession(
  world: LivingWorldState,
  milestoneId: string
): LivingWorldState {
  let next = world;

  if (world.isDayComplete) {
    next = rollWorldToNextDay(world);
  }

  const objective = getLifeObjective(milestoneId);
  next = travelToMilestone(next, milestoneId);

  return {
    ...next,
    currentPhase: objective.dayPhase,
  };
}

export function rollWorldToNextDay(world: LivingWorldState): LivingWorldState {
  const livingDay = world.livingDay + 1;
  return {
    ...world,
    livingDay,
    currentPhase: "morning",
    completedPhasesToday: [],
    completedTaskIds: [],
    isDayComplete: false,
    currentLocationId: "apartment",
    previousLocationId: null,
    ...initWorldClock(livingDay),
  };
}

export function syncCharacterFromNpcVisit(
  world: LivingWorldState,
  characterId: string,
  milestoneId: string,
  remembers: string[]
): LivingWorldState {
  const prev = world.characterThreads[characterId];
  const locationId = getLocationForMilestone(milestoneId);
  return {
    ...world,
    characterThreads: {
      ...world.characterThreads,
      [characterId]: {
        characterId,
        role: prev?.role ?? characterId,
        firstMetMilestone: prev?.firstMetMilestone ?? milestoneId,
        lastMetMilestone: milestoneId,
        lastMetDay: world.livingDay,
        interactionCount: (prev?.interactionCount ?? 0) + 1,
        remembers: [
          ...new Set([...(prev?.remembers ?? []), ...remembers, `visited_${locationId}`]),
        ],
      },
    },
  };
}

export { resolveVenueId };

export function getCharacterAtLocation(
  world: LivingWorldState,
  locationId: GermanyLocationId
): string | null {
  for (const thread of Object.values(world.characterThreads)) {
    if (thread.remembers.includes(`visited_${locationId}`)) {
      return thread.characterId;
    }
  }
  return null;
}
