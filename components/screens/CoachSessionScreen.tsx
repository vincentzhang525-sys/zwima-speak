"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getCoachResponse, getCurrentMilestone } from "@/lib/coach-session";
import {
  getAnnaTryFirst,
  getAnnaWelcome,
  getPatternDiscoveryIntro,
} from "@/lib/anna-companion";
import {
  decideAnnaIntervention,
  getAnnaMeaningNudge,
  getNpcClarificationLine,
  intentKeyForRecording,
} from "@/lib/anna-intervention";
import { npcPaceDelay, simulatedSpeakDurationMs } from "@/lib/conversation-engine";
import { shouldDemonstrateAfterTry, shouldDiscoverPatterns } from "@/lib/anna-memory";
import type { AnnaMemory, Language, LivingWorldState, TransitionProfile } from "@/lib/types";
import {
  buildLearnerObservation,
  getPatternKey,
  resolveCoachLine,
} from "@/lib/transition";

type BeatPhase = "scene" | "speak" | "feedback";

interface ChatEntry {
  id: string;
  kind: "coach" | "npc" | "user" | "feedback";
  text?: string;
  patternExamples?: string[];
}

interface CoachSessionScreenProps {
  language: Language;
  milestoneId: string;
  beatIndex: number;
  transitionProfile: TransitionProfile;
  annaMemory: AnnaMemory;
  livingWorld: LivingWorldState;
  conversationSeed: string | null;
  isResuming: boolean;
  onBeatComplete: (meta: {
    neededDemonstration: boolean;
    responseLatencyMs: number;
    keyPhrase: string;
    annaIntervened?: boolean;
    npcIntent?: string | null;
  }) => void;
  onExit: () => void;
  isLastBeat: boolean;
}

export function CoachSessionScreen({
  language,
  milestoneId,
  beatIndex,
  transitionProfile,
  annaMemory,
  livingWorld,
  conversationSeed,
  isResuming,
  onBeatComplete,
  onExit,
  isLastBeat,
}: CoachSessionScreenProps) {
  const scenario = getCurrentMilestone(
    language,
    milestoneId,
    conversationSeed,
    annaMemory,
    livingWorld
  );
  const moment = scenario.moments[beatIndex];
  const isFirstBeat = beatIndex === 0;
  const hasNpcLine = Boolean(moment.npcLine);
  const patternKey = getPatternKey(milestoneId, moment.id);
  const patternStrength = transitionProfile.patternStrength[patternKey] ?? 0;

  const observation = buildLearnerObservation(
    annaMemory,
    transitionProfile,
    patternKey,
    moment.id,
    moment.phrase
  );
  const { supportLevel, nativeSupportRatio: nativeSupport, structureFamily } =
    observation;

  const coachLine = (line: Parameters<typeof resolveCoachLine>[0], phrase?: string) =>
    resolveCoachLine(line, supportLevel, phrase ?? moment.phrase);

  const [phase, setPhase] = useState<BeatPhase>("scene");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastNeededDemo, setLastNeededDemo] = useState(false);
  const [lastAnnaIntervened, setLastAnnaIntervened] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState(2000);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addCoach = (text: string) =>
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: "coach", text }]);

  const addNpc = (text: string) =>
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: "npc", text }]);

  useEffect(() => {
    setPhase("scene");
    setMessages([]);
    setLastNeededDemo(false);
    setLastAnnaIntervened(false);

    const welcome = isFirstBeat
      ? getAnnaWelcome({
          language,
          memory: annaMemory,
          milestoneId,
          isResuming,
          nativeSupport,
          supportLevel,
          livingWorld,
        })
      : null;

    const cinematicOpen =
      isFirstBeat &&
      !isResuming &&
      annaMemory.daysTogether <= 1 &&
      milestoneId === "airport";
    const sceneDelay = cinematicOpen ? 4200 : isFirstBeat ? 1800 : 400;
    const bridgeGap = cinematicOpen ? 1600 : 700;

    const t1 = setTimeout(() => {
      if (welcome) addCoach(welcome);
    }, 300);

    const t2 = setTimeout(() => {
      addCoach(coachLine(moment.sceneBridge));
      setTimeout(() => {
        addCoach(
          getAnnaTryFirst(
            language,
            annaMemory,
            milestoneId,
            moment.id,
            nativeSupport,
            supportLevel,
            moment.phrase
          )
        );
        setPhase("speak");
      }, bridgeGap);
    }, sceneDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatIndex]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  const handleSpeak = async () => {
    const needsDemo = shouldDemonstrateAfterTry(
      annaMemory,
      patternStrength,
      patternKey,
      structureFamily,
      hasNpcLine
    );
    setLastNeededDemo(needsDemo);

    const speakStart = Date.now();
    setIsRecording(true);
    const npcPace = moment.variantMeta?.npcPace ?? "normal";
    const speakMs = conversationSeed
      ? simulatedSpeakDurationMs(conversationSeed, beatIndex, npcPace)
      : 1500;
    await new Promise((r) => setTimeout(r, speakMs));
    const responseLatencyMs = Date.now() - speakStart;
    setLastLatencyMs(responseLatencyMs);
    setIsRecording(false);

    const interventionNow = decideAnnaIntervention(
      annaMemory,
      moment,
      patternKey,
      moment.id,
      moment.keyPhrase,
      responseLatencyMs,
      needsDemo
    );

    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), kind: "user", text: moment.phrase },
    ]);

    if (needsDemo && (moment.npcLine || interventionNow.npcShouldClarify)) {
      await new Promise((r) => setTimeout(r, npcPaceDelay(npcPace)));
      if (interventionNow.npcMisunderstood || interventionNow.npcShouldClarify) {
        addNpc(
          getNpcClarificationLine(
            language,
            moment,
            interventionNow.npcMisunderstood
          )
        );
      } else if (moment.npcLine) {
        addNpc(moment.npcLine);
      }

      if (interventionNow.annaShouldSpeak) {
        await new Promise((r) => setTimeout(r, interventionNow.waitBeforeAnnaMs));
        addCoach(
          getAnnaMeaningNudge(
            language,
            moment,
            supportLevel,
            interventionNow.skipExplanation
          )
        );
        setLastAnnaIntervened(true);
      }
    }

    await new Promise((r) => setTimeout(r, npcPaceDelay(npcPace)));

    const showPatterns = shouldDiscoverPatterns(
      annaMemory,
      patternStrength,
      patternKey,
      structureFamily
    );

    const response = getCoachResponse(language, milestoneId, beatIndex, observation, moment, {
      responseLatencyMs,
      neededDemonstration: needsDemo,
      targetPhrase: moment.phrase,
    });

    const feedbackText = showPatterns
      ? `${response.message}\n\n${getPatternDiscoveryIntro(language, nativeSupport, supportLevel)}`
      : response.message;

    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        kind: "feedback",
        text: feedbackText,
        patternExamples: response.patternExamples,
      },
    ]);
    setPhase("feedback");
  };

  const handleContinue = () => {
    if (moment.continueScene && !isLastBeat) {
      addCoach(coachLine(moment.continueScene));
    }
    onBeatComplete({
      neededDemonstration: lastNeededDemo,
      responseLatencyMs: lastLatencyMs,
      keyPhrase: moment.phrase,
      annaIntervened: lastAnnaIntervened,
      npcIntent: intentKeyForRecording(moment),
    });
  };

  const atmosphere = coachLine(scenario.settingDetail);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fb]">
      <header className="flex items-center gap-3 border-b border-surface-border bg-white px-4 py-3 safe-top">
        <button
          type="button"
          onClick={onExit}
          aria-label="Leave"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-slate-600 touch-manipulation"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-primary-900 text-sm font-bold text-white">
          {scenario.coachAvatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{scenario.coachName}</p>
          <p className="truncate text-xs text-slate-500">{scenario.setting}</p>
        </div>
        <span className="text-lg">{scenario.icon}</span>
      </header>

      <div className="border-b border-surface-border bg-gradient-to-r from-amber-50/80 to-white px-4 py-2.5">
        <p className="text-center text-xs text-amber-800/70 whitespace-pre-line">{atmosphere}</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
      </div>

      <div className="border-t border-surface-border bg-white px-4 py-4 safe-bottom">
        {phase === "speak" && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleSpeak}
              disabled={isRecording}
              className={`flex h-16 w-16 items-center justify-center rounded-full touch-manipulation ${
                isRecording ? "animate-pulse bg-red-500" : "bg-[#007AFF] active:scale-95"
              }`}
            >
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              </svg>
            </button>
            <p className="text-xs text-slate-500">{isRecording ? "…" : "Your turn"}</p>
          </div>
        )}

        {phase === "feedback" && (
          <Button fullWidth onClick={handleContinue}>
            {isLastBeat ? "Done for now" : "Keep going"}
          </Button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatEntry }) {
  if (msg.kind === "coach") {
    return (
      <div className="flex items-end gap-2 animate-fade-in-up">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-[10px] font-bold text-white">
          A
        </div>
        <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-card ring-1 ring-surface-border">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-800">
            {msg.text}
          </p>
        </div>
      </div>
    );
  }

  if (msg.kind === "npc") {
    return (
      <div className="flex items-end gap-2 animate-fade-in-up">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500">
          …
        </div>
        <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 ring-1 ring-slate-200/80">
          <p className="text-[15px] leading-relaxed text-slate-800">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.kind === "user") {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#007AFF] px-4 py-3 text-white">
          <p className="text-[15px] leading-relaxed">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.kind === "feedback") {
    return (
      <div className="animate-fade-in-up space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-[10px] font-bold text-white">
            A
          </div>
          <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-card ring-1 ring-surface-border">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-800">
              {msg.text}
            </p>
          </div>
        </div>
        {msg.patternExamples?.map((example) => (
          <div key={example} className="flex items-end gap-2 pl-9">
            <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-blue-50/80 px-4 py-2.5 ring-1 ring-blue-100/80">
              <p className="text-[14px] leading-relaxed text-slate-700">{example}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
