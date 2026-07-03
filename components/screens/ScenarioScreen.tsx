"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/Headers";
import { LANGUAGE_LABELS, SCENARIOS } from "@/lib/scenarios";
import type { Language, ScenarioId } from "@/lib/types";

interface ScenarioScreenProps {
  language: Language;
  selectedScenario: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  daily: "Daily Life",
  business: "Business",
};

const SCENARIO_CATEGORIES: Record<ScenarioId, string> = {
  supermarket: "daily",
  restaurant: "daily",
  doctor: "daily",
  pharmacy: "daily",
  landlord: "daily",
  bank: "daily",
  "business-meeting": "business",
  "phone-call": "business",
};

export function ScenarioScreen({
  language,
  selectedScenario,
  onSelectScenario,
}: ScenarioScreenProps) {
  const langInfo = LANGUAGE_LABELS[language];
  const categories = ["daily", "business"] as const;

  return (
    <div className="flex-1 px-5 pb-6">
      <PageHeader
        title="Scenarios"
        subtitle={`Practicing ${langInfo.flag} ${langInfo.label}`}
        action={
          <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
            {langInfo.flag}
          </span>
        }
      />

      <div className="mt-4 space-y-6">
        {categories.map((category, catIndex) => {
          const items = SCENARIOS.filter(
            (s) => SCENARIO_CATEGORIES[s.id] === category
          );
          const delayClass = catIndex === 0 ? "delay-1" : "delay-2";

          return (
            <section
              key={category}
              className={`animate-fade-in-up ${delayClass}`}
            >
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="space-y-3">
                {items.map((scenario) => (
                  <Card
                    key={scenario.id}
                    selected={selectedScenario === scenario.id}
                    onClick={() => onSelectScenario(scenario.id)}
                    padding="md"
                    className="flex items-center gap-4 !rounded-2xl"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-2xl">
                      {scenario.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {scenario.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">
                        {scenario.description}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
