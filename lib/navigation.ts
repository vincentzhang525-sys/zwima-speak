export type TabId = "welcome" | "scenarios" | "progress";

export type FlowScreen = "conversation" | "feedback";

export type AppScreen = TabId | FlowScreen;

export interface TabItem {
  id: TabId;
  label: string;
}

export const TABS: TabItem[] = [
  { id: "welcome", label: "Home" },
  { id: "scenarios", label: "Practice" },
  { id: "progress", label: "Progress" },
];

export const TAB_LABELS: Record<TabId, string> = {
  welcome: "Home",
  scenarios: "Practice",
  progress: "Progress",
};
