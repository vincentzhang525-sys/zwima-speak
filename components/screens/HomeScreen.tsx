"use client";

import { Button } from "@/components/ui/Button";
import { getCurrentMilestone } from "@/lib/coach-session";
import { PRODUCT_PROMISE } from "@/lib/framework";
import { getJourneyLabel } from "@/lib/journey";
import { getTransitionTagline, resolveLine, getNativeSupportRatio, getPatternKey, getTargetThinkingPercent } from "@/lib/transition";
import { getAnnaMemoryFromProgress, getTransitionProfile } from "@/lib/progress";
import {
  getEnterMilestoneLabel,
  LANGUAGE_OPTIONS,
} from "@/lib/mission";
import type { JourneyProgress, Language } from "@/lib/types";

interface HomeScreenProps {
  language: Language;
  progress: JourneyProgress;
  onEnterScene: () => void;
  onLanguageChange: (language: Language) => void;
}

export function HomeScreen({
  language,
  progress,
  onEnterScene,
  onLanguageChange,
}: HomeScreenProps) {
  const milestone = getCurrentMilestone(language, progress.currentMilestoneId);
  const lang = LANGUAGE_OPTIONS[language];
  const hasStarted = progress.momentsCompleted > 0 && !progress.milestoneDone;
  const transition = getTransitionProfile(progress, language);
  const memory = getAnnaMemoryFromProgress(progress, language);
  const thinkingPct = getTargetThinkingPercent(memory, transition);
  const currentMoment = milestone.moments[progress.momentsCompleted] ?? milestone.moments[0];
  const nativeSupport = getNativeSupportRatio(
    memory,
    transition,
    getPatternKey(progress.currentMilestoneId, currentMoment.id),
    currentMoment.id,
    currentMoment.phrase
  );
  const tagline =
    language === "german" ? PRODUCT_PROMISE.de : PRODUCT_PROMISE.en;
  const journeyTagline = getTransitionTagline(language, memory, transition);
  const sceneDetail = resolveLine(milestone.settingDetail, nativeSupport);
  const isFreshStart =
    progress.momentsCompleted === 0 &&
    !progress.milestoneDone &&
    progress.completedMilestoneIds.length === 0;

  return (
    <div className="flex flex-1 flex-col px-5 pb-4">
      <header className="animate-fade-in-up pt-6">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
          ZWIMA Speak
        </h1>
        {language === "german" && isFreshStart ? (
          <div className="mt-3 space-y-1.5">
            <p className="text-[17px] leading-relaxed text-slate-800">欢迎来到德国。</p>
            <p className="text-[15px] leading-relaxed text-slate-600">
              从今天开始，我会一直陪着你。
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600">不用着急学德语。</p>
            <p className="text-[15px] font-medium text-slate-700">先开始生活。</p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-[15px] text-slate-500">{tagline}</p>
            <p className="mt-1 text-sm font-medium text-[#007AFF]">{journeyTagline}</p>
          </>
        )}
      </header>

      <div className="animate-fade-in-up delay-1 mt-6 overflow-hidden rounded-[28px] border border-surface-border bg-white shadow-elevated">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#007AFF] to-primary-800 px-5 py-4 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            {milestone.coachAvatar}
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100">
              {milestone.coachName} · {getJourneyLabel(language)}
            </p>
            <p className="text-lg font-bold">
              {milestone.icon} {milestone.title}
            </p>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">
            {sceneDetail}
          </p>
          <p className="mt-3 text-sm text-slate-400">{milestone.setting}</p>
        </div>
      </div>

      <div className="animate-fade-in-up delay-2 mt-6">
        <Button fullWidth onClick={onEnterScene}>
          {getEnterMilestoneLabel(language, hasStarted)}
        </Button>
      </div>

      <div className="animate-fade-in-up delay-3 mt-6 grid grid-cols-2 gap-3">
        <StatCard
          label={language === "german" ? "一起的日子" : "Days together"}
          value={progress.streakDays > 0 ? `${progress.streakDays} 天` : "今天"}
        />
        <StatCard
          label={language === "german" ? "生活的感觉" : "Living in"}
          value={thinkingPct > 0 ? `${thinkingPct}%` : "—"}
        />
      </div>

      <div className="animate-fade-in-up delay-4 mt-6 rounded-2xl border border-surface-border bg-surface-muted/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {language === "german" ? "生活语言" : "Life language"}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {lang.flag} {lang.label}
            </p>
          </div>
          <div className="flex rounded-xl bg-white p-0.5 shadow-card">
            {(Object.keys(LANGUAGE_OPTIONS) as Language[]).map((key) => {
              const opt = LANGUAGE_OPTIONS[key];
              const active = language === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onLanguageChange(key)}
                  className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-all touch-manipulation ${
                    active
                      ? "bg-[#007AFF] text-white shadow-sm"
                      : "text-slate-500 active:bg-surface-muted"
                  }`}
                >
                  {opt.flag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white px-4 py-4 shadow-card">
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
