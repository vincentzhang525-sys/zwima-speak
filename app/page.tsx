"use client";

import { useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { CoachSessionScreen } from "@/components/screens/CoachSessionScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { ProgressScreen } from "@/components/screens/ProgressScreen";
import { SessionCompleteScreen } from "@/components/screens/SessionCompleteScreen";
import { PWARegister } from "@/components/PWARegister";
import { getCurrentMilestone } from "@/lib/coach-session";
import { getNextPlayableMilestoneId } from "@/lib/milestones";
import type { FlowScreen, TabId } from "@/lib/navigation";
import {
  advanceMoment,
  advanceToNextMilestone,
  beginAnnaSession,
  getAnnaMemoryFromProgress,
  getLivingWorldFromProgress,
  getTransitionProfile,
  INITIAL_PROGRESS,
  markMilestoneComplete,
  resetMilestoneProgress,
  syncMilestoneForLanguage,
} from "@/lib/progress";
import { loadProgress, saveProgress } from "@/lib/persistence";
import type { JourneyProgress, Language } from "@/lib/types";

type TransitionDirection = "forward" | "back" | "fade";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [flowScreen, setFlowScreen] = useState<FlowScreen | null>(null);
  const [transitionDir, setTransitionDir] = useState<TransitionDirection>("fade");

  const [language, setLanguage] = useState<Language>("german");
  const [momentIndex, setMomentIndex] = useState(0);
  const [progress, setProgress] = useState<JourneyProgress>(INITIAL_PROGRESS);
  const hydrated = useRef(false);

  useEffect(() => {
    setProgress(loadProgress());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveProgress(progress);
  }, [progress]);
  const [completedMilestoneId, setCompletedMilestoneId] = useState<string | null>(
    null
  );
  const [sessionResuming, setSessionResuming] = useState(false);

  const isInFlow = flowScreen !== null;
  const annaMemory = getAnnaMemoryFromProgress(progress, language);
  const livingWorld = getLivingWorldFromProgress(progress, language);
  const milestone = getCurrentMilestone(
    language,
    progress.currentMilestoneId,
    progress.conversationSeed,
    annaMemory,
    livingWorld
  );
  const totalMoments = milestone.moments.length;
  const isLastMoment = momentIndex >= totalMoments - 1;

  const navigateTab = (tab: TabId) => {
    setTransitionDir("fade");
    setFlowScreen(null);
    setActiveTab(tab);
  };

  const handleEnterScene = () => {
    const resuming = progress.momentsCompleted > 0 && !progress.milestoneDone;
    setSessionResuming(resuming);

    if (progress.milestoneDone) {
      setMomentIndex(0);
      setProgress((p) => resetMilestoneProgress(p));
    } else {
      setMomentIndex(progress.momentsCompleted);
    }

    if (!resuming) {
      setProgress((p) => beginAnnaSession(p, language, progress.currentMilestoneId));
    }

    setTransitionDir("forward");
    setFlowScreen("session");
  };

  const handleLanguageChange = (lang: Language) => {
    const first = getCurrentMilestone(lang, INITIAL_PROGRESS.currentMilestoneId);
    setLanguage(lang);
    setMomentIndex(0);
    setProgress((p) =>
      syncMilestoneForLanguage(
        p,
        lang,
        INITIAL_PROGRESS.currentMilestoneId,
        first.title,
        first.moments.length
      )
    );
  };

  const handleMomentComplete = (meta: {
    neededDemonstration: boolean;
    responseLatencyMs: number;
    keyPhrase: string;
    annaIntervened?: boolean;
    npcIntent?: string | null;
  }) => {
    const momentId = milestone.moments[momentIndex].id;
    setProgress((p) =>
      advanceMoment(p, language, progress.currentMilestoneId, momentId, meta)
    );

    if (isLastMoment) {
      setCompletedMilestoneId(progress.currentMilestoneId);
      setProgress((p) =>
        markMilestoneComplete(p, language, `finished:${progress.currentMilestoneId}`)
      );
      setTransitionDir("forward");
      setFlowScreen("session-complete");
    } else {
      setMomentIndex((i) => i + 1);
    }
  };

  const handleExitSession = () => {
    setTransitionDir("back");
    setFlowScreen(null);
    setActiveTab("home");
  };

  const handleSessionDone = () => {
    const finishedId = completedMilestoneId ?? progress.currentMilestoneId;
    const nextId = getNextPlayableMilestoneId(language, finishedId);

    if (nextId) {
      const nextMilestone = getCurrentMilestone(language, nextId);
      setProgress((p) =>
        advanceToNextMilestone(
          p,
          nextId,
          nextMilestone.title,
          nextMilestone.moments.length
        )
      );
    }

    setCompletedMilestoneId(null);
    setMomentIndex(0);
    setTransitionDir("back");
    setFlowScreen(null);
    setActiveTab("home");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            language={language}
            progress={progress}
            onEnterScene={handleEnterScene}
            onLanguageChange={handleLanguageChange}
          />
        );
      case "progress":
        return <ProgressScreen language={language} progress={progress} />;
      case "profile":
        return (
          <ProfileScreen
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        );
    }
  };

  const renderFlowContent = () => {
    if (!flowScreen) return null;

    switch (flowScreen) {
      case "session":
        return (
          <CoachSessionScreen
            language={language}
            milestoneId={progress.currentMilestoneId}
            beatIndex={momentIndex}
            transitionProfile={getTransitionProfile(progress, language)}
            annaMemory={annaMemory}
            livingWorld={livingWorld}
            conversationSeed={progress.conversationSeed}
            isResuming={sessionResuming && momentIndex === progress.momentsCompleted}
            isLastBeat={isLastMoment}
            onBeatComplete={handleMomentComplete}
            onExit={handleExitSession}
          />
        );
      case "session-complete":
        return (
          <SessionCompleteScreen
            language={language}
            milestoneId={completedMilestoneId ?? progress.currentMilestoneId}
            transitionProfile={getTransitionProfile(progress, language)}
            annaMemory={annaMemory}
            livingWorld={livingWorld}
            conversationSeed={progress.conversationSeed}
            onDone={handleSessionDone}
          />
        );
    }
  };

  return (
    <>
      <PWARegister />
      <PhoneShell showStatusBar={!isInFlow}>
        <div className="flex flex-1 flex-col overflow-hidden">
          {isInFlow ? (
            <ScreenWrapper
              direction={transitionDir}
              className="flex flex-1 flex-col"
            >
              {renderFlowContent()}
            </ScreenWrapper>
          ) : (
            <>
              <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
                <ScreenWrapper direction={transitionDir} key={activeTab}>
                  {renderTabContent()}
                </ScreenWrapper>
              </main>
              <BottomNav activeTab={activeTab} onTabChange={navigateTab} />
            </>
          )}
        </div>
      </PhoneShell>
    </>
  );
}
