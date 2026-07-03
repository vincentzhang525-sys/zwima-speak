"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { ConversationScreen } from "@/components/screens/ConversationScreen";
import { FeedbackScreen } from "@/components/screens/FeedbackScreen";
import { ProgressScreen } from "@/components/screens/ProgressScreen";
import { ScenarioScreen } from "@/components/screens/ScenarioScreen";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PWARegister } from "@/components/PWARegister";
import { getMockFeedback } from "@/lib/mockAi";
import type { TabId, FlowScreen } from "@/lib/navigation";
import { LANGUAGE_LABELS, SCENARIOS } from "@/lib/scenarios";
import type { FeedbackResult, Language, ScenarioId } from "@/lib/types";

type TransitionDirection = "forward" | "back" | "fade";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("welcome");
  const [flowScreen, setFlowScreen] = useState<FlowScreen | null>(null);
  const [transitionDir, setTransitionDir] = useState<TransitionDirection>("fade");

  const [language, setLanguage] = useState<Language | null>(null);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [userText, setUserText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);

  const isInFlow = flowScreen !== null;
  const showBottomNav = !isInFlow;

  const navigateTab = (tab: TabId) => {
    setTransitionDir("fade");
    setFlowScreen(null);
    setActiveTab(tab);
  };

  const handleGetStarted = () => {
    if (!language) return;
    setTransitionDir("forward");
    setActiveTab("scenarios");
  };

  const handleSelectScenario = (id: ScenarioId) => {
    setScenario(id);
    setTransitionDir("forward");
    setFlowScreen("conversation");
    setUserText("");
    setFeedback(null);
  };

  const handleSubmitConversation = (text: string) => {
    if (!language || !scenario) return;
    setUserText(text);
    setFeedback(getMockFeedback(language, scenario, text));
    setTransitionDir("forward");
    setFlowScreen("feedback");
  };

  const handleBackFromConversation = () => {
    setTransitionDir("back");
    setFlowScreen(null);
    setActiveTab("scenarios");
  };

  const handleBackFromFeedback = () => {
    setTransitionDir("back");
    setFlowScreen("conversation");
  };

  const handlePracticeAgain = () => {
    setTransitionDir("forward");
    setUserText("");
    setFeedback(null);
    setFlowScreen("conversation");
  };

  const handleViewProgress = () => {
    setTransitionDir("forward");
    setFlowScreen(null);
    setActiveTab("progress");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "welcome":
        return (
          <WelcomeScreen
            selectedLanguage={language}
            onSelectLanguage={setLanguage}
            onGetStarted={handleGetStarted}
          />
        );
      case "scenarios":
        if (!language) {
          return (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <p className="text-sm text-slate-500">
                Please select a language on the Home screen first.
              </p>
              <button
                type="button"
                onClick={() => navigateTab("welcome")}
                className="mt-4 text-sm font-semibold text-primary-700"
              >
                Go to Home
              </button>
            </div>
          );
        }
        return (
          <ScenarioScreen
            language={language}
            selectedScenario={scenario}
            onSelectScenario={handleSelectScenario}
          />
        );
      case "progress":
        return <ProgressScreen />;
    }
  };

  const renderFlowContent = () => {
    if (!language || !scenario || !flowScreen) return null;

    const scenarioInfo = SCENARIOS.find((s) => s.id === scenario)!;
    const langInfo = LANGUAGE_LABELS[language];

    if (flowScreen === "conversation") {
      return (
        <ConversationScreen
          language={language}
          scenarioId={scenario}
          onBack={handleBackFromConversation}
          onSubmit={handleSubmitConversation}
        />
      );
    }

    if (flowScreen === "feedback" && feedback) {
      return (
        <FeedbackScreen
          userText={userText}
          feedback={feedback}
          languageLabel={langInfo.label}
          scenarioTitle={scenarioInfo.title}
          onBack={handleBackFromFeedback}
          onContinue={handlePracticeAgain}
          onViewProgress={handleViewProgress}
        />
      );
    }

    return null;
  };

  return (
    <>
      <PWARegister />
      <PhoneShell showStatusBar={!isInFlow}>
        <div className="flex flex-1 flex-col overflow-hidden">
          {isInFlow ? (
            <ScreenWrapper direction={transitionDir} className="flex flex-1 flex-col">
              {renderFlowContent()}
            </ScreenWrapper>
          ) : (
            <>
              <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
                <ScreenWrapper direction={transitionDir} key={activeTab}>
                  {renderTabContent()}
                </ScreenWrapper>
              </main>
              <BottomNav
                activeTab={activeTab}
                onTabChange={navigateTab}
                hidden={!showBottomNav}
              />
            </>
          )}
        </div>
      </PhoneShell>
    </>
  );
}
