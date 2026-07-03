"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FlowHeader } from "@/components/layout/Headers";
import { IconCheck } from "@/components/ui/Icons";
import type { FeedbackResult } from "@/lib/types";

interface FeedbackScreenProps {
  userText: string;
  feedback: FeedbackResult;
  languageLabel: string;
  scenarioTitle: string;
  onBack: () => void;
  onContinue: () => void;
  onViewProgress: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#2563eb" : score >= 65 ? "#d97706" : "#dc2626";

  return (
    <div className="relative mx-auto h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{score}</span>
        <span className="text-[10px] font-medium text-slate-400">Score</span>
      </div>
    </div>
  );
}

export function FeedbackScreen({
  userText,
  feedback,
  languageLabel,
  scenarioTitle,
  onBack,
  onContinue,
  onViewProgress,
}: FeedbackScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title="AI Feedback"
        subtitle={scenarioTitle}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Score hero */}
        <div className="animate-scale-in mb-6 text-center">
          <ScoreRing score={feedback.confidenceScore} />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {feedback.confidenceScore >= 80
              ? "Great job! Keep it up."
              : feedback.confidenceScore >= 65
                ? "Good effort — room to improve."
                : "Keep practicing — you're learning!"}
          </p>
        </div>

        {/* Your reply */}
        <div className="animate-fade-in-up delay-1 mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Your reply
          </p>
          <Card padding="md" className="!rounded-2xl !bg-surface-muted">
            <p className="text-sm text-slate-700">{userText}</p>
          </Card>
        </div>

        {/* Feedback cards */}
        <div className="space-y-3">
          <FeedbackCard
            label="Corrected"
            value={feedback.correctedSentence}
            className="delay-2"
          />
          <FeedbackCard
            label="More natural"
            value={feedback.naturalExpression}
            highlight
            className="delay-3"
          />
          <FeedbackCard
            label="中文解释"
            value={feedback.chineseExplanation}
            className="delay-4"
          />
          <FeedbackCard
            label={`${languageLabel} comparison`}
            value={feedback.comparison}
            className="delay-5"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-surface-border px-4 py-4 safe-bottom">
        <Button fullWidth onClick={onContinue}>
          <IconCheck className="h-4 w-4" />
          Practice again
        </Button>
        <Button fullWidth variant="secondary" onClick={onViewProgress}>
          View daily progress
        </Button>
      </div>
    </div>
  );
}

function FeedbackCard({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          highlight
            ? "bg-gradient-to-r from-primary-800 to-primary-700 text-white shadow-float"
            : "border border-surface-border bg-white text-slate-700"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
