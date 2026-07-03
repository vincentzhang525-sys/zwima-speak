"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/Headers";
import { getWeeklyMaxMinutes, MOCK_PROGRESS } from "@/lib/progress";

export function ProgressScreen() {
  const data = MOCK_PROGRESS;
  const maxMinutes = getWeeklyMaxMinutes(data.weeklyChart);
  const goalPercent = Math.round(
    (data.weeklyProgress / data.weeklyGoal) * 100
  );

  return (
    <div className="flex-1 px-5 pb-6">
      <PageHeader
        title="Daily Progress"
        subtitle="Track your speaking journey"
      />

      {/* Streak hero card */}
      <Card
        padding="lg"
        className="animate-fade-in-up mt-4 !rounded-3xl !border-0 bg-gradient-to-br from-primary-800 to-primary-950 !text-white shadow-float"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-primary-200">Current streak</p>
            <p className="mt-1 text-4xl font-bold">{data.streak} days</p>
            <p className="mt-1 text-xs text-primary-200">Keep it going!</p>
          </div>
          <div className="text-5xl">🔥</div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="animate-fade-in-up delay-1 mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Total minutes", value: data.totalMinutes, unit: "min" },
          { label: "This week", value: data.sessionsThisWeek, unit: "sessions" },
          { label: "Words practiced", value: data.wordsPracticed, unit: "" },
          { label: "Avg. score", value: data.averageScore, unit: "%" },
        ].map((stat) => (
          <Card key={stat.label} padding="md" className="!rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-800">
              {stat.value}
              {stat.unit && (
                <span className="ml-0.5 text-sm font-medium text-slate-400">
                  {stat.unit}
                </span>
              )}
            </p>
          </Card>
        ))}
      </div>

      {/* Weekly goal */}
      <Card padding="md" className="animate-fade-in-up delay-2 mt-4 !rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Weekly goal</p>
            <p className="text-xs text-slate-500">
              {data.weeklyProgress} of {data.weeklyGoal} sessions completed
            </p>
          </div>
          <span className="text-lg font-bold text-primary-700">{goalPercent}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-700"
            style={{ width: `${Math.min(goalPercent, 100)}%` }}
          />
        </div>
      </Card>

      {/* Weekly chart */}
      <div className="animate-fade-in-up delay-3 mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          This week
        </h2>
        <Card padding="md" className="!rounded-2xl">
          <div className="flex items-end justify-between gap-2 h-32">
            {data.weeklyChart.map((day) => {
              const height = (day.minutes / maxMinutes) * 100;
              const isToday = day.day === "Fri";

              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-primary-800 to-primary-500"
                          : "bg-primary-100"
                      }`}
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      isToday ? "text-primary-700" : "text-slate-400"
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent sessions */}
      <div className="animate-fade-in-up delay-4 mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Recent sessions
        </h2>
        <div className="space-y-2">
          {data.recentSessions.map((session) => (
            <Card
              key={session.id}
              padding="sm"
              className="flex items-center gap-3 !rounded-2xl"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">
                {session.score}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {session.scenario}
                </p>
                <p className="text-xs text-slate-500">
                  {session.language} · {session.date}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
