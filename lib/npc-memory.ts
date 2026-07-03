/**
 * Sprint 7 — NPC Memory
 * Baristas and staff remember the learner across visits.
 */
import type { AnnaMemory, Language, NpcVisitMemory } from "./types";

export function getNpcMemory(
  memory: AnnaMemory,
  venueId: string
): NpcVisitMemory | null {
  return memory.npcMemories[venueId] ?? null;
}

export function isReturnVisit(memory: AnnaMemory, venueId: string): boolean {
  const npc = getNpcMemory(memory, venueId);
  return npc !== null && npc.visitCount >= 1;
}

export interface RecordVisitInput {
  venueId: string;
  productId: string;
  productLabel: string;
  orderPhrase: string;
  dayNumber: number;
}

export function recordNpcVisit(
  memory: AnnaMemory,
  input: RecordVisitInput
): AnnaMemory {
  const prev = memory.npcMemories[input.venueId];
  const visitCount = (prev?.visitCount ?? 0) + 1;

  return {
    ...memory,
    npcMemories: {
      ...memory.npcMemories,
      [input.venueId]: {
        venueId: input.venueId,
        visitCount,
        lastProductId: input.productId,
        lastProductLabel: input.productLabel,
        lastOrderPhrase: input.orderPhrase,
        lastVisitDay: input.dayNumber,
      },
    },
  };
}

export function buildNpcRecallGreeting(
  language: Language,
  npc: NpcVisitMemory
): string | null {
  if (npc.visitCount < 1 || !npc.lastProductLabel) return null;

  if (language === "german") {
    return `Guten Morgen. Heute wieder ${npc.lastProductLabel}?`;
  }
  return `Good morning. Same ${npc.lastProductLabel} again today?`;
}

export function buildNpcRecallNative(
  language: Language,
  npc: NpcVisitMemory
): string | null {
  if (npc.visitCount < 1 || !npc.lastProductLabel) return null;
  if (language === "german") {
    return `她认出你了——「今天还是${npc.lastProductLabel}？」`;
  }
  return `She recognizes you — "Same ${npc.lastProductLabel} again today?"`;
}
