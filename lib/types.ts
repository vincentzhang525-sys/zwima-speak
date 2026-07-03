export type Language = "german" | "english";

export type ScenarioId =
  | "supermarket"
  | "restaurant"
  | "doctor"
  | "pharmacy"
  | "landlord"
  | "bank"
  | "business-meeting"
  | "phone-call";

export interface Scenario {
  id: ScenarioId;
  title: string;
  icon: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
}

export interface FeedbackResult {
  correctedSentence: string;
  naturalExpression: string;
  chineseExplanation: string;
  comparison: string;
  confidenceScore: number;
}

export interface MockScenarioData {
  openingLine: string;
  feedback: FeedbackResult;
}

export type MockDataMap = Record<
  Language,
  Record<ScenarioId, MockScenarioData>
>;
