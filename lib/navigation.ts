export type TabId = "home" | "progress" | "profile";

export type FlowScreen = "session" | "session-complete";

export interface TabItem {
  id: TabId;
  label: string;
}

export const TABS: TabItem[] = [
  { id: "home", label: "Home" },
  { id: "progress", label: "Progress" },
  { id: "profile", label: "Profile" },
];

export const TAB_LABELS: Record<TabId, string> = {
  home: "Home",
  progress: "Progress",
  profile: "Profile",
};
