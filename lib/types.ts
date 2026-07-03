  /** Sprint 12 — extensible; active tracks: german | english */
export type Language = "german" | "english";

export type ConfidenceBand =
  | "very_nervous"
  | "nervous"
  | "normal"
  | "confident"
  | "very_confident";

export type SupportLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type LearningPace = "slow" | "normal" | "fast";

/** Native-language (中文) + target-language (DE/EN) — Anna blends based on understanding */
export interface BilingualLine {
  native: string;
  target: string;
}

/** Tracks demonstrated understanding — drives language transition, not levels */
export interface TransitionProfile {
  demonstratedMoments: number;
  patternStrength: Record<string, number>;
}

/** One beat in a continuous life moment — hear, speak, Anna coaches after */
export interface ConversationMoment {
  id: string;
  sceneBridge: BilingualLine;
  phrase: string;
  keyPhrase: string;
  npcLine?: string;
  speakPrompt: BilingualLine;
  continueScene?: BilingualLine;
  /** Sprint 6 — generated session metadata (engine only) */
  variantMeta?: ConversationVariantMeta;
}

/** Metadata from a live generated conversation — never shown as UI labels */
export interface ConversationVariantMeta {
  personalityId: string;
  npcPace: "slow" | "normal" | "fast";
  productId?: string;
  findItemId?: string;
  customizationId?: string;
  priceDisplay?: string;
  greetingStyle?: string;
  endingStyle?: string;
  /** Sprint 7 — meaning Anna conveys, not word-for-word translation */
  npcIntent?: string;
  brainBeatRole?: string;
  mayMisunderstand?: boolean;
  followUpType?: string;
  /** Sprint 11 — stable map location */
  locationId?: string;
}

/** One immersive milestone on the life journey — a full conversation with Anna */
export interface LifeMilestone {
  id: string;
  icon: string;
  title: string;
  journeyLabel: string;
  setting: string;
  settingDetail: BilingualLine;
  coachName: string;
  coachAvatar: string;
  opening: BilingualLine;
  closing: BilingualLine;
  moments: ConversationMoment[];
}

export interface MilestoneRoadmapItem {
  id: string;
  icon: string;
  title: string;
}

export interface CoachResponse {
  message: BilingualLine;
  /** Always in target language — patterns absorbed through repetition in real situations */
  patternExamples: string[];
}

/** @deprecated use CoachResponse */
export interface PronunciationFeedback extends CoachResponse {
  score?: number;
  tip?: string;
}

/** Sprint 10 — one life fact Anna learned from a real moment */
export interface LearnerLifeFact {
  topic: string;
  value: string;
  phrase?: string;
  learnedOnDay: number;
  sourceMilestone: string;
  sourceMoment: string;
}

/** Sprint 10 — biographical memory that survives between sessions */
export interface LearnerProfile {
  name?: string;
  country?: string;
  city?: string;
  goals: string[];
  job?: string;
  family?: string;
  hobbies: string[];
  /** Topic keys already discussed — never ask the same thing twice */
  coveredTopics: string[];
  lifeFacts: LearnerLifeFact[];
}

export interface ConfidenceSnapshot {
  day: number;
  score: number;
  band: ConfidenceBand;
}

export const EMPTY_LEARNER_PROFILE: LearnerProfile = {
  goals: [],
  hobbies: [],
  coveredTopics: [],
  lifeFacts: [],
};

/** Sprint 11 — phrase the learner often forgets or misuses */
export interface PhraseMistakeMemory {
  phrase: string;
  count: number;
  firstDay: number;
  lastDay: number;
  resolved: boolean;
}

/** Sprint 11 — summarized past conversation (never verbatim replay) */
export interface ConversationMemory {
  day: number;
  milestoneId: string;
  summary: string;
  highlight?: string;
}

/** Sprint 11 — emotional arc across sessions */
export interface EmotionalMemory {
  day: number;
  tone: "nervous" | "breakthrough" | "frustrated" | "proud" | "calm" | "hesitant";
  note: string;
}

/** Sprint 11 — inferred learner personality (not Anna's) */
export interface LearnerPersonalityMemory {
  trait: "hesitant" | "bold" | "perfectionist" | "steady" | "quiet";
  strength: number;
  updatedDay: number;
}

/** Sprint 11 — life event Anna can reference naturally */
export interface LifeEventMemory {
  day: number;
  topic: string;
  summary: string;
  milestoneId: string;
}

/** Sprint 11 — long-term memory that survives between app launches */
export interface LongTermMemory {
  phraseMistakes: PhraseMistakeMemory[];
  conversationSummaries: ConversationMemory[];
  favoriteTopics: string[];
  learnerPersonality: LearnerPersonalityMemory[];
  emotionalHistory: EmotionalMemory[];
  successfulHighlights: string[];
  lifeEvents: LifeEventMemory[];
}

export const EMPTY_LONG_TERM_MEMORY: LongTermMemory = {
  phraseMistakes: [],
  conversationSummaries: [],
  favoriteTopics: [],
  learnerPersonality: [],
  emotionalHistory: [],
  successfulHighlights: [],
  lifeEvents: [],
};

/** Anna remembers the learner across days and scenes */
export interface AnnaMemory {
  daysTogether: number;
  lastMilestoneId: string | null;
  lastMomentId: string | null;
  completedExperiences: string[];
  struggledPatterns: string[];
  confidentPatterns: string[];
  patternAttempts: Record<string, number>;
  /** Internal only — never shown to learner */
  confidenceScore: number;
  lastConfidenceBand: ConfidenceBand;
  emotionalNotes: string[];
  /** Grammatical structure families successfully used */
  structureSuccesses: Record<string, number>;
  structureMastered: string[];
  mistakeCounts: Record<string, number>;
  repeatedMistakes: number;
  recentLatenciesMs: number[];
  /** 0–1 — how much learner still relies on Chinese scaffolding */
  translationDependence: number;
  learningPace: LearningPace;
  /** patternKey → needed demo on last attempt */
  lastNeededDemoByPattern: Record<string, boolean>;
  /** Sprint 7 — NPCs remember prior visits (venueId → memory) */
  npcMemories: Record<string, NpcVisitMemory>;
  /** Intent keys Anna already nudged — never explain twice */
  explainedNpcIntents: string[];
  /** Sprint 10 — synced copy of journey learner profile */
  learnerProfile: LearnerProfile;
  /** Sprint 10 — confidence over time */
  confidenceTrend: ConfidenceSnapshot[];
  /** Sprint 10 — rolling average response time (ms) */
  averageSpeakingSpeedMs: number;
  /** Sprint 11 — persistent long-term memory */
  longTerm: LongTermMemory;
}

export interface NpcVisitMemory {
  venueId: string;
  visitCount: number;
  lastProductId?: string;
  lastProductLabel?: string;
  lastOrderPhrase?: string;
  lastVisitDay: number;
}

/** Sprint 11 — time and weather */
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy";
export type GermanyLocationId =
  | "airport"
  | "apartment"
  | "coffee"
  | "supermarket"
  | "train"
  | "bus"
  | "bank"
  | "doctor"
  | "buergeramt"
  | "work";

/** Sprint 8 — one continuous day living in Germany */
export interface CharacterThread {
  characterId: string;
  role: string;
  firstMetMilestone: string;
  lastMetMilestone: string;
  lastMetDay: number;
  interactionCount: number;
  remembers: string[];
}

export interface LivingWorldState {
  livingDay: number;
  currentPhase: "morning" | "coffee" | "groceries" | "transit" | "home";
  completedPhasesToday: LivingWorldState["currentPhase"][];
  completedTaskIds: string[];
  isDayComplete: boolean;
  characterThreads: Record<string, CharacterThread>;
  /** Sprint 11 — position on the Germany map */
  currentLocationId: GermanyLocationId | null;
  visitedLocationIds: GermanyLocationId[];
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  holidayName: string | null;
  previousLocationId: GermanyLocationId | null;
}

export interface JourneyProgress {
  currentMilestoneId: string;
  milestoneTitle: string;
  momentsCompleted: number;
  totalMoments: number;
  studyMinutes: number;
  streakDays: number;
  milestoneDone: boolean;
  completedMilestoneIds: string[];
  transitionByLanguage: Record<Language, TransitionProfile>;
  annaMemoryByLanguage: Record<Language, AnnaMemory>;
  /** Sprint 6 — seed for the active live conversation (coffee / supermarket) */
  conversationSeed: string | null;
  /** Sprint 8 — living world simulation per language track */
  worldByLanguage: Record<Language, LivingWorldState>;
  /** Sprint 10 — canonical biographical memory (shared across language tracks) */
  learnerProfile: LearnerProfile;
}

export interface MilestonePreview {
  title: string;
  estimatedMinutes: number;
}

/** @deprecated use JourneyProgress */
export type DailyProgress = JourneyProgress;

/** @deprecated use LifeMilestone */
export type LifeDayScenario = LifeMilestone;
