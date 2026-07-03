/**
 * Sprint 9 — Learner evaluation scoring (provider-agnostic)
 */
import type { AnnaMemory } from "../types";
import type { StruggleLevel } from "../anna-intervention";
import { shouldDemonstrateAfterTry } from "../anna-memory";
import type { EvaluateLearnerInput, EvaluateLearnerOutput } from "./provider";
import {
  assessLearnerStruggle,
  decideAnnaIntervention,
} from "../anna-intervention";
import { buildLearnerObservation } from "../adaptive-coach-engine";

const HESITATION_MS = 2400;

export function scoreResponseLatency(latencyMs: number): number {
  if (latencyMs < 1300) return 0.85;
  if (latencyMs < HESITATION_MS) return 0.6;
  if (latencyMs < 4000) return 0.35;
  return 0.15;
}

export function scoreConfidence(memory: AnnaMemory): number {
  return memory.confidenceScore / 100;
}

export function deriveStruggleLevel(
  memory: AnnaMemory,
  patternKey: string,
  responseLatencyMs: number,
  wouldNeedDemo: boolean
): StruggleLevel {
  return assessLearnerStruggle(memory, patternKey, responseLatencyMs, wouldNeedDemo);
}

export function evaluateLearnerLocally(input: EvaluateLearnerInput): EvaluateLearnerOutput {
  const { memory, moment, patternKey, momentId, keyPhrase } = input;
  const learner = buildLearnerObservation(
    memory.anna,
    memory.transition,
    patternKey,
    momentId,
    keyPhrase
  );

  const needsDemonstration = shouldDemonstrateAfterTry(
    memory.anna,
    input.patternStrength,
    patternKey,
    input.structureFamily,
    input.hasNpcLine
  );

  const intervention = decideAnnaIntervention(
    memory.anna,
    moment,
    patternKey,
    momentId,
    keyPhrase,
    input.responseLatencyMs,
    needsDemonstration,
    input.milestoneId
  );

  const struggle = deriveStruggleLevel(
    memory.anna,
    patternKey,
    input.responseLatencyMs,
    needsDemonstration
  );

  return {
    needsDemonstration,
    intervention,
    struggle,
    supportLevel: learner.supportLevel,
  };
}
