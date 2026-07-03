export interface DailyStat {
  day: string;
  minutes: number;
  sessions: number;
}

export interface ProgressData {
  streak: number;
  totalMinutes: number;
  sessionsThisWeek: number;
  wordsPracticed: number;
  averageScore: number;
  weeklyGoal: number;
  weeklyProgress: number;
  recentSessions: {
    id: string;
    scenario: string;
    language: string;
    score: number;
    date: string;
  }[];
  weeklyChart: DailyStat[];
}

export const MOCK_PROGRESS: ProgressData = {
  streak: 7,
  totalMinutes: 142,
  sessionsThisWeek: 12,
  wordsPracticed: 486,
  averageScore: 81,
  weeklyGoal: 5,
  weeklyProgress: 4,
  recentSessions: [
    {
      id: "1",
      scenario: "Restaurant",
      language: "German",
      score: 85,
      date: "Today, 9:24 AM",
    },
    {
      id: "2",
      scenario: "Business Meeting",
      language: "English",
      score: 78,
      date: "Yesterday, 7:15 PM",
    },
    {
      id: "3",
      scenario: "Supermarket",
      language: "German",
      score: 82,
      date: "Mon, 8:30 AM",
    },
    {
      id: "4",
      scenario: "Phone Call",
      language: "English",
      score: 88,
      date: "Sun, 6:00 PM",
    },
  ],
  weeklyChart: [
    { day: "Mon", minutes: 18, sessions: 2 },
    { day: "Tue", minutes: 25, sessions: 3 },
    { day: "Wed", minutes: 12, sessions: 1 },
    { day: "Thu", minutes: 30, sessions: 2 },
    { day: "Fri", minutes: 22, sessions: 2 },
    { day: "Sat", minutes: 15, sessions: 1 },
    { day: "Sun", minutes: 20, sessions: 1 },
  ],
};

export function getWeeklyMaxMinutes(chart: DailyStat[]): number {
  return Math.max(...chart.map((d) => d.minutes), 1);
}
