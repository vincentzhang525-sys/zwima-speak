"use client";

import { PageHeader } from "@/components/layout/Headers";
import { LANGUAGE_OPTIONS } from "@/lib/mission";
import type { Language } from "@/lib/types";

interface ProfileScreenProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function ProfileScreen({ language, onLanguageChange }: ProfileScreenProps) {
  return (
    <div className="flex-1 px-5 pb-6">
      <PageHeader title="Profile" subtitle="ZWIMA Speak" />

      <div className="animate-fade-in-up mt-6 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-3xl font-black text-white shadow-float">
          Z
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">You</h2>
        <p className="mt-1 text-sm text-slate-500">
          {language === "german"
            ? "慢慢在德国生活，Anna 一直在旁边。"
            : "Living abroad, with Anna beside you."}
        </p>
      </div>

      <div className="animate-fade-in-up delay-1 mt-8 space-y-3">
        <div className="rounded-2xl border border-surface-border bg-white px-5 py-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Life language
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.keys(LANGUAGE_OPTIONS) as Language[]).map((key) => {
              const opt = LANGUAGE_OPTIONS[key];
              const active = language === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onLanguageChange(key)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all touch-manipulation ${
                    active
                      ? "border-primary-600 bg-primary-50 text-primary-800"
                      : "border-surface-border text-slate-600 active:bg-surface-muted"
                  }`}
                >
                  <span>{opt.flag}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <InfoCard
          title="Anna"
          text={
            language === "german"
              ? "Anna 记得你说过的、犹豫过的、慢慢有把握的事。她让你先开口，自然地回应，中文会慢慢淡下去——不是按等级，是按你真实的生活。"
              : "Anna remembers what you said, where you hesitated, and what feels natural now. She lets you try first — Chinese fades as you live it, not by level."
          }
        />
        <InfoCard title="Version" text="ZWIMA Speak MVP · Mock data" />
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white px-5 py-4 shadow-card">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
