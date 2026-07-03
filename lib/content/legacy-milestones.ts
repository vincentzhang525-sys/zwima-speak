/**
 * Sprint 12 — Legacy milestone content (to migrate into MilestoneDef)
 * Engine reads via content pack; source files remain until fully converted.
 */
import type { Language, LifeMilestone } from "../types";
import { ARRIVE_MILESTONES } from "../milestones/arrive";
import { COFFEE_MILESTONES } from "../milestones/coffee";
import { SUPERMARKET_MILESTONES } from "../milestones/supermarket";

export function getLegacyMilestones(language: Language): Record<string, LifeMilestone> {
  return {
    arrive: ARRIVE_MILESTONES[language],
    coffee: COFFEE_MILESTONES[language],
    supermarket: SUPERMARKET_MILESTONES[language],
  };
}
