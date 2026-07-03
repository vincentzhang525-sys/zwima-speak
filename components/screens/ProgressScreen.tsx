"use client";

import { PageHeader } from "@/components/layout/Headers";
import { getJourneyLabel, getJourneyRoadmap } from "@/lib/journey";
import { isMilestonePlayable } from "@/lib/milestones";
import { getAnnaMemoryFromProgress, getTransitionProfile } from "@/lib/progress";
import { getTargetThinkingPercent } from "@/lib/transition";
import type { JourneyProgress, Language } from "@/lib/types";

interface ProgressScreenProps {
  language: Language;
  progress: JourneyProgress;
}

export function ProgressScreen({ language, progress }: ProgressScreenProps) {
  const roadmap = getJourneyRoadmap(language);
  const journeyLabel = getJourneyLabel(language);
  const transition = getTransitionProfile(progress, language);
  const memory = getAnnaMemoryFromProgress(progress, language);
  const thinkingPct = getTargetThinkingPercent(memory, transition);

  return (
    <div className="flex-1 px-5 pb-6">
      <PageHeader
        title={language === "german" ? "你的日子" : "Your days"}
        subtitle={
          language === "german"
            ? "从今天开始，我会一直陪着你"
            : "From today on, I'm right beside you"
        }
      />

      <div className="animate-fade-in-up mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#007AFF] to-primary-900 p-6 text-white shadow-float">
        <p className="text-sm font-medium text-blue-200">{journeyLabel}</p>
        <h2 className="mt-1 text-2xl font-bold">
          {thinkingPct > 0
            ? language === "german"
              ? `在德国生活 · ${thinkingPct}%`
              : `Living abroad · ${thinkingPct}%`
            : language === "german"
              ? "Anna 就在旁边"
              : "Anna's right here"}
        </h2>
        <p className="mt-3 text-sm text-blue-100">
          {progress.milestoneDone
            ? language === "german"
              ? `刚走完：${progress.milestoneTitle}`
              : `Just finished: ${progress.milestoneTitle}`
            : language === "german"
              ? `现在：${progress.milestoneTitle}`
              : `Now: ${progress.milestoneTitle}`}
        </p>
        {!progress.milestoneDone && progress.momentsCompleted > 0 && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${(progress.momentsCompleted / progress.totalMoments) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="animate-fade-in-up delay-1 mt-6 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {language === "german" ? "接下来的日子" : "What's ahead"}
        </p>
        {roadmap.map((item) => {
          const isComplete = progress.completedMilestoneIds.includes(item.id);
          const isCurrent = item.id === progress.currentMilestoneId;
          const playable = isMilestonePlayable(item.id);
          const status = isComplete
            ? "complete"
            : isCurrent
              ? "current"
              : playable
                ? "upcoming"
                : "locked";

          return (
            <RoadmapRow
              key={item.id}
              icon={item.icon}
              title={item.title}
              status={status}
            />
          );
        })}
      </div>

      <div className="animate-fade-in-up delay-2 mt-6 space-y-3">
        <StatRow
          label="Right now"
          value={progress.studyMinutes > 0 ? `${progress.studyMinutes} min` : "—"}
        />
        <StatRow
          label="Streak"
          value={
            progress.streakDays > 0
              ? `${progress.streakDays} day${progress.streakDays > 1 ? "s" : ""}`
              : "—"
          }
        />
      </div>

      {!progress.milestoneDone && progress.momentsCompleted === 0 && (
        <div className="animate-fade-in-up delay-3 mt-6 rounded-2xl border border-dashed border-surface-border px-5 py-8 text-center">
          <p className="text-[15px] text-slate-500">
            Anna is waiting on the Home screen.
          </p>
        </div>
      )}
    </div>
  );
}

function RoadmapRow({
  icon,
  title,
  status,
}: {
  icon: string;
  title: string;
  status: "complete" | "current" | "upcoming" | "locked";
}) {
  const styles = {
    complete: "border-emerald-200 bg-emerald-50",
    current: "border-[#007AFF] bg-blue-50",
    upcoming: "border-surface-border bg-white opacity-70",
    locked: "border-surface-border bg-surface-muted/40 opacity-50",
  };

  const badges = {
    complete: "✓",
    current: "→",
    upcoming: "·",
    locked: "🔒",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-card ${styles[status]}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-[15px] font-medium text-slate-800">{title}</span>
      <span className="text-sm text-slate-500">{badges[status]}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-white px-5 py-4 shadow-card">
      <span className="text-[15px] text-slate-500">{label}</span>
      <span className="text-[17px] font-semibold text-slate-900">{value}</span>
    </div>
  );
}
