/**
 * Sprint 14 — Real-life achievements (not lessons)
 */
import type { Language } from "./types";

export interface LifeAchievement {
  id: string;
  icon: string;
  label: Record<Language, string>;
}

export const LIFE_ACHIEVEMENTS: LifeAchievement[] = [
  {
    id: "airport",
    icon: "✈️",
    label: { german: "顺利入境", english: "Landed in Germany" },
  },
  {
    id: "arrive",
    icon: "🏠",
    label: { german: "跟邻居打了招呼", english: "Met the neighbour" },
  },
  {
    id: "coffee",
    icon: "☕",
    label: { german: "买到第一杯咖啡", english: "Bought first coffee" },
  },
  {
    id: "supermarket",
    icon: "🛒",
    label: { german: "自己买完东西", english: "Finished supermarket checkout" },
  },
  {
    id: "bus",
    icon: "🚌",
    label: { german: "第一次坐公交", english: "Rode first bus" },
  },
  {
    id: "train",
    icon: "🚇",
    label: { german: "第一次坐地铁", english: "Took first train" },
  },
  {
    id: "bank",
    icon: "🏦",
    label: { german: "开了第一个账户", english: "Opened first bank account" },
  },
  {
    id: "doctor",
    icon: "🏥",
    label: { german: "自己看了医生", english: "Visited the doctor" },
  },
  {
    id: "buergeramt",
    icon: "📮",
    label: { german: "去了市政厅", english: "Made it to city hall" },
  },
  {
    id: "work",
    icon: "🏢",
    label: { german: "第一天上班", english: "First day at work" },
  },
];

export function getAchievementLabel(id: string, language: Language): string | null {
  const a = LIFE_ACHIEVEMENTS.find((x) => x.id === id);
  return a ? a.label[language] : null;
}

export function getCompletedAchievements(
  completedIds: string[],
  language: Language
): { icon: string; label: string }[] {
  return completedIds
    .map((id) => {
      const a = LIFE_ACHIEVEMENTS.find((x) => x.id === id);
      if (!a) return null;
      return { icon: a.icon, label: a.label[language] };
    })
    .filter((x): x is { icon: string; label: string } => x !== null);
}
