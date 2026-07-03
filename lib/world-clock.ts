/**
 * Sprint 11 — World clock: time, weather, weekends, public holidays
 */
import type { Language, LivingWorldState } from "./types";
import type { TimeOfDay, WeatherCondition } from "./types";
import { bil } from "./milestones/bilingual";

export interface HolidayInfo {
  month: number;
  day: number;
  name: Record<Language, string>;
}

/** Fixed-date German public holidays (calendar-neutral for simulation) */
export const GERMAN_PUBLIC_HOLIDAYS: HolidayInfo[] = [
  { month: 1, day: 1, name: { german: "Neujahr", english: "New Year's Day" } },
  { month: 5, day: 1, name: { german: "Tag der Arbeit", english: "Labour Day" } },
  {
    month: 10,
    day: 3,
    name: { german: "Tag der Deutschen Einheit", english: "German Unity Day" },
  },
  { month: 12, day: 25, name: { german: "Weihnachten", english: "Christmas" } },
  { month: 12, day: 26, name: { german: "Zweiter Weihnachtstag", english: "Boxing Day" } },
];

const WEATHER_CYCLE: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "sunny",
  "cloudy",
  "snowy",
  "rainy",
  "sunny",
];

export function deriveWeekend(livingDay: number): boolean {
  const dayOfWeek = livingDay % 7;
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function deriveHoliday(
  livingDay: number
): { isHoliday: boolean; name: Record<Language, string> | null } {
  const month = ((livingDay - 1) % 12) + 1;
  const day = ((livingDay * 3) % 28) + 1;
  const match = GERMAN_PUBLIC_HOLIDAYS.find((h) => h.month === month && h.day === day);
  if (match) return { isHoliday: true, name: match.name };
  return { isHoliday: false, name: null };
}

export function deriveWeather(livingDay: number, milestoneIndex: number): WeatherCondition {
  return WEATHER_CYCLE[(livingDay + milestoneIndex) % WEATHER_CYCLE.length];
}

export function deriveTimeOfDay(
  completedTaskCount: number,
  isWeekend: boolean
): TimeOfDay {
  const slot = completedTaskCount % 3;
  if (isWeekend && slot === 0) return "morning";
  if (slot === 0) return "morning";
  if (slot === 1) return "afternoon";
  return "evening";
}

export function advanceWorldClock(
  world: LivingWorldState,
  milestoneId: string
): LivingWorldState {
  const taskCount = world.completedTaskIds.length + 1;
  const isWeekend = deriveWeekend(world.livingDay);
  const holiday = deriveHoliday(world.livingDay);

  return {
    ...world,
    timeOfDay: deriveTimeOfDay(taskCount, isWeekend),
    weather: deriveWeather(world.livingDay, taskCount),
    isWeekend,
    isPublicHoliday: holiday.isHoliday,
    holidayName: holiday.name?.german ?? null,
  };
}

export function initWorldClock(livingDay: number): Pick<
  LivingWorldState,
  "timeOfDay" | "weather" | "isWeekend" | "isPublicHoliday" | "holidayName"
> {
  const isWeekend = deriveWeekend(livingDay);
  const holiday = deriveHoliday(livingDay);
  return {
    timeOfDay: "morning",
    weather: deriveWeather(livingDay, 0),
    isWeekend,
    isPublicHoliday: holiday.isHoliday,
    holidayName: holiday.name?.german ?? null,
  };
}

export function getTimeLabel(time: TimeOfDay, language: Language): string {
  const labels: Record<TimeOfDay, Record<Language, string>> = {
    morning: { german: "Morgen", english: "Morning" },
    afternoon: { german: "Nachmittag", english: "Afternoon" },
    evening: { german: "Abend", english: "Evening" },
  };
  return labels[time][language];
}

export function getWeatherLabel(weather: WeatherCondition, language: Language): string {
  const labels: Record<WeatherCondition, Record<Language, string>> = {
    sunny: { german: "sonnig", english: "sunny" },
    cloudy: { german: "bewölkt", english: "cloudy" },
    rainy: { german: "regnerisch", english: "rainy" },
    snowy: { german: "schneit", english: "snowy" },
  };
  return labels[weather][language];
}

export function getWorldAtmosphere(
  world: LivingWorldState,
  language: Language
): { native: string; target: string } {
  const time = getTimeLabel(world.timeOfDay, language);
  const weather = getWeatherLabel(world.weather, language);
  const dayType = world.isPublicHoliday
    ? language === "german"
      ? `Feiertag${world.holidayName ? ` (${world.holidayName})` : ""}`
      : `public holiday${world.holidayName ? ` (${world.holidayName})` : ""}`
    : world.isWeekend
      ? language === "german"
        ? "Wochenende"
        : "weekend"
      : language === "german"
        ? "Wochentag"
        : "weekday";

  if (language === "german") {
    return bil(
      `${time}，${weather}，${dayType}——德国的一天。`,
      `${time}, ${weather}, ${dayType} — ein Tag in Deutschland.`
    );
  }
  return bil(
    `${time}，${weather}，${dayType}。`,
    `${time}, ${weather}, ${dayType}.`
  );
}

export function getWeatherSceneNote(
  world: LivingWorldState,
  language: Language
): string | null {
  if (world.weather === "rainy") {
    return language === "german"
      ? "Es regnet — die Leute beeilen sich."
      : "It's raining — people are hurrying.";
  }
  if (world.weather === "snowy") {
    return language === "german"
      ? "Es schneit leicht — vorsichtig auf den Straßen."
      : "Light snow — careful on the streets.";
  }
  if (world.isPublicHoliday && world.holidayName) {
    return language === "german"
      ? `Heute ist ${world.holidayName} — manche Geschäfte haben zu.`
      : `Today is ${world.holidayName} — some places are closed.`;
  }
  if (world.isWeekend) {
    return language === "german"
      ? "Wochenende — mehr Familien unterwegs."
      : "Weekend — more families out and about.";
  }
  return null;
}
