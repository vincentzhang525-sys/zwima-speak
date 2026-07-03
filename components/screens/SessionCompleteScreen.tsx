"use client";

import { Button } from "@/components/ui/Button";
import { getAnnaLifeSummary } from "@/lib/anna-companion";
import { getCurrentMilestone } from "@/lib/coach-session";
import type { AnnaMemory, Language, LivingWorldState, TransitionProfile } from "@/lib/types";
import { buildLearnerObservation } from "@/lib/transition";

interface SessionCompleteScreenProps {
  language: Language;
  milestoneId: string;
  transitionProfile: TransitionProfile;
  annaMemory: AnnaMemory;
  livingWorld: LivingWorldState;
  conversationSeed: string | null;
  onDone: () => void;
}

export function SessionCompleteScreen({
  language,
  milestoneId,
  transitionProfile,
  annaMemory,
  livingWorld,
  conversationSeed,
  onDone,
}: SessionCompleteScreenProps) {
  const milestone = getCurrentMilestone(
    language,
    milestoneId,
    conversationSeed,
    annaMemory,
    livingWorld
  );
  const lastMoment = milestone.moments[milestone.moments.length - 1];
  const observation = buildLearnerObservation(
    annaMemory,
    transitionProfile,
    `${milestoneId}:${lastMoment.id}`,
    lastMoment.id,
    lastMoment.phrase
  );
  const summary = getAnnaLifeSummary(
    language,
    annaMemory,
    milestoneId,
    observation.nativeSupportRatio,
    observation.supportLevel,
    livingWorld
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#f8f9fb] px-8">
      <div className="animate-scale-in text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-primary-900 text-2xl font-bold text-white shadow-float">
          {milestone.coachAvatar}
        </div>
        <p className="text-sm font-medium text-[#007AFF]">Anna</p>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight text-slate-900">
          See you tomorrow.
        </h1>
        <p className="mx-auto mt-4 max-w-xs whitespace-pre-line text-[16px] leading-relaxed text-slate-600">
          {summary}
        </p>
      </div>
      <div className="animate-fade-in-up delay-2 mt-10 w-full max-w-sm">
        <Button fullWidth onClick={onDone}>
          Back home
        </Button>
      </div>
    </div>
  );
}
