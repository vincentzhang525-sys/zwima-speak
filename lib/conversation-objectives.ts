/**
 * Frozen learning objectives — beat order and skills never change.
 * Sprint 6 randomizes surface wording around these objectives.
 */
import type { Language } from "./types";

export type DynamicMilestoneId = "coffee" | "supermarket";

export const DYNAMIC_MILESTONE_IDS: DynamicMilestoneId[] = ["coffee", "supermarket"];

export function isDynamicMilestone(milestoneId: string): milestoneId is DynamicMilestoneId {
  return DYNAMIC_MILESTONE_IDS.includes(milestoneId as DynamicMilestoneId);
}

export interface BeatObjective {
  id: string;
  /** What the learner must be able to do after this beat */
  skill: Record<Language, string>;
  structureFamily: string;
}

export const COFFEE_OBJECTIVES: BeatObjective[] = [
  {
    id: "greet",
    skill: {
      german: "Greet staff naturally when entering",
      english: "Greet staff naturally when entering",
    },
    structureFamily: "greet",
  },
  {
    id: "order",
    skill: {
      german: "Order a drink with bitte",
      english: "Order a drink with please",
    },
    structureFamily: "order-bitte",
  },
  {
    id: "customize",
    skill: {
      german: "Answer a customization question with Ja/Nein + bitte",
      english: "Answer a customization question with yes/no + please",
    },
    structureFamily: "customize-ja",
  },
  {
    id: "pay",
    skill: {
      german: "Pay by card at the counter",
      english: "Pay by card at the counter",
    },
    structureFamily: "pay-card",
  },
  {
    id: "thanks",
    skill: {
      german: "Leave with a warm thank-you",
      english: "Leave with a warm thank-you",
    },
    structureFamily: "thanks-warm",
  },
];

export const SUPERMARKET_OBJECTIVES: BeatObjective[] = [
  {
    id: "greet",
    skill: {
      german: "Greet staff at the entrance",
      english: "Greet staff at the entrance",
    },
    structureFamily: "greet",
  },
  {
    id: "find",
    skill: {
      german: "Ask politely where to find an item",
      english: "Ask politely where to find an item",
    },
    structureFamily: "polite-question",
  },
  {
    id: "bag",
    skill: {
      german: "Accept or request a bag with bitte",
      english: "Accept or request a bag with please",
    },
    structureFamily: "order-bitte",
  },
  {
    id: "pay",
    skill: {
      german: "Pay by card at checkout",
      english: "Pay by card at checkout",
    },
    structureFamily: "pay-card",
  },
  {
    id: "thanks",
    skill: {
      german: "Thank staff before leaving",
      english: "Thank staff before leaving",
    },
    structureFamily: "thanks-warm",
  },
];

export function getObjectivesForMilestone(milestoneId: DynamicMilestoneId): BeatObjective[] {
  return milestoneId === "coffee" ? COFFEE_OBJECTIVES : SUPERMARKET_OBJECTIVES;
}
