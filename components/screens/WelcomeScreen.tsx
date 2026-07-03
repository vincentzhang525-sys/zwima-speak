"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconSparkle } from "@/components/ui/Icons";
import { LANGUAGE_LABELS } from "@/lib/scenarios";
import type { Language } from "@/lib/types";

interface WelcomeScreenProps {
  selectedLanguage: Language | null;
  onSelectLanguage: (lang: Language) => void;
  onGetStarted: () => void;
}

export function WelcomeScreen({
  selectedLanguage,
  onSelectLanguage,
  onGetStarted,
}: WelcomeScreenProps) {
  const languages: Language[] = ["german", "english"];

  return (
    <div className="flex flex-1 flex-col px-5 pb-6">
      {/* Hero */}
      <div className="animate-fade-in-up pt-6">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary-100/60 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 shadow-float">
              <span className="text-3xl font-black text-white">Z</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            <IconSparkle className="h-3.5 w-3.5 text-primary-500" />
            AI Language Coach
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            ZWIMA Speak
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            Master German &amp; English through realistic daily conversations —
            built for Chinese learners.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="animate-fade-in-up delay-1 mt-8 grid grid-cols-3 gap-3">
        {[
          { value: "8+", label: "Scenarios" },
          { value: "2", label: "Languages" },
          { value: "AI", label: "Feedback" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-surface-muted px-3 py-3 text-center"
          >
            <p className="text-lg font-bold text-primary-800">{stat.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Language selection */}
      <div className="animate-fade-in-up delay-2 mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Choose your language
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => {
            const info = LANGUAGE_LABELS[lang];
            const isSelected = selectedLanguage === lang;

            return (
              <Card
                key={lang}
                selected={isSelected}
                onClick={() => onSelectLanguage(lang)}
                padding="lg"
                className="!rounded-3xl"
              >
                <span className="text-3xl">{info.flag}</span>
                <p className="mt-2 text-base font-bold text-slate-900">
                  {info.label}
                </p>
                <p className="text-xs text-slate-500">{info.native}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-in-up delay-3 mt-auto pt-8">
        <Button
          fullWidth
          disabled={!selectedLanguage}
          onClick={onGetStarted}
        >
          Get Started
        </Button>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Free to practice · No account required
        </p>
      </div>
    </div>
  );
}
