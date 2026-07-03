/**
 * Sprint 11 — Connected Germany map
 * Every location belongs to one world. Milestones bind to stable location IDs.
 */
import type { Language, GermanyLocationId } from "./types";

export type { GermanyLocationId };

export interface MapLocation {
  id: GermanyLocationId;
  icon: string;
  label: Record<Language, string>;
  milestoneIds: string[];
  characterId?: string;
  /** Adjacent locations the learner can travel to */
  connections: GermanyLocationId[];
}

export const GERMANY_MAP: Record<GermanyLocationId, MapLocation> = {
  airport: {
    id: "airport",
    icon: "✈️",
    label: { german: "Flughafen", english: "Airport" },
    milestoneIds: ["airport"],
    characterId: "border_officer",
    connections: ["apartment", "train", "bus"],
  },
  apartment: {
    id: "apartment",
    icon: "🏠",
    label: { german: "Wohnung", english: "Apartment" },
    milestoneIds: ["arrive", "apartment"],
    characterId: "neighbor",
    connections: ["coffee", "supermarket", "bus", "buergeramt"],
  },
  coffee: {
    id: "coffee",
    icon: "☕",
    label: { german: "Café", english: "Coffee shop" },
    milestoneIds: ["coffee"],
    characterId: "barista",
    connections: ["apartment", "supermarket", "bus"],
  },
  supermarket: {
    id: "supermarket",
    icon: "🛒",
    label: { german: "Supermarkt", english: "Supermarket" },
    milestoneIds: ["supermarket"],
    characterId: "cashier",
    connections: ["apartment", "coffee", "bus"],
  },
  bus: {
    id: "bus",
    icon: "🚌",
    label: { german: "Bushaltestelle", english: "Bus stop" },
    milestoneIds: ["bus"],
    characterId: "bus_driver",
    connections: ["apartment", "train", "work", "bank", "doctor"],
  },
  train: {
    id: "train",
    icon: "🚇",
    label: { german: "Bahnhof", english: "Train station" },
    milestoneIds: ["train"],
    characterId: "ticket_clerk",
    connections: ["airport", "bus", "work", "bank"],
  },
  bank: {
    id: "bank",
    icon: "🏦",
    label: { german: "Bank", english: "Bank" },
    milestoneIds: ["bank"],
    characterId: "bank_clerk",
    connections: ["bus", "train", "buergeramt", "work"],
  },
  doctor: {
    id: "doctor",
    icon: "🏥",
    label: { german: "Arztpraxis", english: "Doctor's office" },
    milestoneIds: ["doctor"],
    characterId: "doctor",
    connections: ["bus", "apartment"],
  },
  buergeramt: {
    id: "buergeramt",
    icon: "📮",
    label: { german: "Bürgeramt", english: "City hall" },
    milestoneIds: ["buergeramt"],
    characterId: "clerk",
    connections: ["apartment", "bank"],
  },
  work: {
    id: "work",
    icon: "🏢",
    label: { german: "Arbeit", english: "Workplace" },
    milestoneIds: ["work"],
    characterId: "interviewer",
    connections: ["bus", "train", "bank"],
  },
};

// Fix doctor connections (no pharmacy on map)
GERMANY_MAP.doctor.connections = ["bus", "apartment"];

export const ALL_LOCATION_IDS = Object.keys(GERMANY_MAP) as GermanyLocationId[];

export const MILESTONE_TO_LOCATION: Record<string, GermanyLocationId> = {
  airport: "airport",
  arrive: "apartment",
  apartment: "apartment",
  coffee: "coffee",
  supermarket: "supermarket",
  bus: "bus",
  train: "train",
  bank: "bank",
  doctor: "doctor",
  buergeramt: "buergeramt",
  work: "work",
};

/** Narrative order through the connected world */
export const WORLD_JOURNEY_ORDER: string[] = [
  "airport",
  "arrive",
  "coffee",
  "supermarket",
  "bus",
  "train",
  "bank",
  "doctor",
  "buergeramt",
  "work",
  "apartment",
];

export function getLocationForMilestone(milestoneId: string): GermanyLocationId {
  return MILESTONE_TO_LOCATION[milestoneId] ?? "apartment";
}

export function getLocation(id: GermanyLocationId): MapLocation {
  return GERMANY_MAP[id];
}

export function getLocationLabel(id: GermanyLocationId, language: Language): string {
  return GERMANY_MAP[id].label[language];
}

export function resolveVenueId(milestoneId: string, setting?: string): string {
  const locationId = getLocationForMilestone(milestoneId);
  return `loc:${locationId}`;
}

export function getTravelBridge(
  language: Language,
  from: GermanyLocationId,
  to: GermanyLocationId
): { native: string; target: string } | null {
  if (from === to) return null;

  const fromLabel = getLocationLabel(from, language);
  const toLabel = getLocationLabel(to, language);

  if (language === "german") {
    return {
      native: `从${fromLabel === "Flughafen" ? "机场" : fromLabel}去${toLabel}——这就是你在德国的日常路线。`,
      target: `Von ${fromLabel} nach ${toLabel} — so läuft dein Tag hier.`,
    };
  }
  return {
    native: `从${fromLabel}去${toLabel}——你在国外的一天就是这样连起来的。`,
    target: `From ${fromLabel} to ${toLabel} — that's how your day connects.`,
  };
}

export function getNpcRecallAtLocation(
  language: Language,
  locationId: GermanyLocationId,
  interactionCount: number,
  remembers: string[]
): string | null {
  if (interactionCount < 2) return null;

  const loc = getLocationLabel(locationId, language);

  if (language === "german") {
    if (remembers.includes("regular_order")) {
      return `Schön, Sie wiederzusehen — wie beim letzten Mal?`;
    }
    if (remembers.includes("new_in_building")) {
      return `Ah, Sie wieder — alles gut in der Wohnung?`;
    }
    return `Willkommen zurück am ${loc}.`;
  }

  if (remembers.includes("regular_order")) {
    return `Good to see you again — same as last time?`;
  }
  if (remembers.includes("new_in_building")) {
    return `Oh, you again — settling in okay?`;
  }
  return `Welcome back at the ${loc}.`;
}

export function isDayOneMilestone(milestoneId: string): boolean {
  return ["airport", "arrive", "coffee", "supermarket"].includes(milestoneId);
}

export function isEndOfWorldDay(milestoneId: string, livingDay: number): boolean {
  if (livingDay <= 1) return milestoneId === "supermarket";
  return milestoneId === "work" || milestoneId === "apartment";
}
